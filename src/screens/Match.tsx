import { useEffect, useMemo, useState } from 'react'
import { CONFIG } from '../data/config'
import { rollEvent } from '../data/events'
import { playersOf, type Player } from '../data/players'
import { teamById } from '../data/teams'
import { wildcardById } from '../data/wildcards'
import { goalMinutes, simulateMatch, type MatchScore } from '../engine/sim'
import { YOUR_ID, groupFixtures, groupTeamIds, KO_ROUNDS } from '../engine/tournament'
import { STAGE_LABEL, T, evText, evTitle, teamName, wcTitle } from '../i18n'
import { Flag } from '../components/Flag'
import { useGame, yourEffectiveRating } from '../state/store'

// Un item del minuto a minuto: gol (puede terminar anulado) o el evento
interface GoalItem {
  kind: 'goal'
  minute: number
  yours: boolean
  scorer: string
  annulled: boolean
}
type TickerItem = GoalItem | { kind: 'event'; minute: number }

const pickScorer = (pool: Player[], rnd: () => number): string => {
  const outfield = pool.filter(p => p.pos !== 'PT')
  const weighted = outfield.flatMap(p => Array(Math.max(1, Math.round(p.stats.tir / 20))).fill(p))
  return (weighted[Math.floor(rnd() * weighted.length)] as Player).name
}

function makePens(bias: number, rnd: () => number): { hp: number; ap: number } {
  let hp = 0; let ap = 0
  for (let i = 0; i < 5 || hp === ap; i++) {
    if (rnd() < 0.76 + bias) hp++
    if (rnd() < 0.76 - bias) ap++
    if (i > 20) { hp++; break }
  }
  return { hp, ap }
}

const fmtMin = (m: number) => (m <= 90 ? `${m}'` : `90+${m - 90}'`)

export function Match({ onDone }: { onDone: () => void }) {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const knockout = run.phase === 'knockout'
  const isThird = knockout && !!run.thirdPlaceOppId

  // Todo el partido se resuelve UNA vez al montar la pantalla
  const { event, affectedPlayer, score, items, oppId, wildcard } = useMemo(() => {
    const rnd = Math.random
    let oppId: string
    if (isThird) {
      oppId = run.thirdPlaceOppId!
    } else if (knockout) {
      const idx = run.bracket!.indexOf(YOUR_ID)
      oppId = run.bracket![idx % 2 === 0 ? idx + 1 : idx - 1]
    } else {
      const day = groupFixtures(groupTeamIds(run.group, run.group))[run.matchday]
      const m = day.find(([h, a]) => h === YOUR_ID || a === YOUR_ID)!
      oppId = m[0] === YOUR_ID ? m[1] : m[0]
    }
    // Comodín activado para este partido
    const wildcard = run.wildcardArmed ? wildcardById(run.wildcardId) : null

    // Pool de goleadores del rival: excluye a los jugadores que le robaste
    // (juegan para VOS) y a la figura anulada por el comodín (no puede
    // meterte gol). Si queda vacío, cae al plantel completo.
    const oppSquad = playersOf(oppId)
    const squadIds = new Set(run.squad.map(p => p.id))
    let oppPool = oppSquad.filter(p => !squadIds.has(p.id))
    if (wildcard?.disablesOppStar && run.wildcardNote) {
      const starName = run.wildcardNote.replace(/ \(\d+\)$/, '')
      oppPool = oppPool.filter(p => p.name !== starName)
    }
    if (oppPool.filter(p => p.pos !== 'PT').length === 0) oppPool = oppSquad

    // UN solo evento, filtrado por rival (vsTeam) e instancia (stage)
    const event = rollEvent(oppId, knockout ? 'eliminatorias' : 'grupos')

    // Si el evento afecta a un jugador, elegimos UNO de tu plantel y lo nombramos
    let affectedPlayer: Player | null = null
    if (event?.affects) {
      const candidates = run.squad.filter(p => p.pos !== 'PT')
      affectedPlayer = event.affects === 'star'
        ? candidates.reduce((a, b) => (b.ovr > a.ovr ? b : a))
        : candidates[Math.floor(rnd() * candidates.length)]
    }

    const groupBonus = knockout ? 0 : CONFIG.groupStageBonus
    // el 3er puesto usa el bonus de la semifinal (índice 3)
    const koBonus = knockout ? (CONFIG.koRoundBonus[isThird ? 3 : run.koRound] ?? 0) : 0
    const myRating = yourEffectiveRating(run) + groupBonus + koBonus
      + (event?.ratingDelta ?? 0) + (wildcard?.ratingDelta ?? 0)
    const oppRating = teamById(oppId).rating
      + (knockout ? CONFIG.knockoutOpponentBonus : 0) + (wildcard?.oppRatingDelta ?? 0)

    const raw = simulateMatch(myRating, oppRating, knockout)

    // ---- Línea de tiempo coherente ----
    const yourGoals: GoalItem[] = goalMinutes(raw.hg, rnd).map(minute => ({
      kind: 'goal' as const, minute, yours: true, scorer: pickScorer(run.squad, rnd), annulled: false,
    }))
    const oppGoals: GoalItem[] = goalMinutes(raw.ag, rnd).map(minute => ({
      kind: 'goal' as const, minute, yours: false, scorer: pickScorer(oppPool, rnd), annulled: false,
    }))

    // Goles extra del comodín (ej: el penal de Infantino)
    for (let i = 0; i < (wildcard?.yourGoals ?? 0); i++) {
      yourGoals.push({
        kind: 'goal', minute: 5 + Math.floor(rnd() * 84), yours: true,
        scorer: pickScorer(run.squad, rnd), annulled: false,
      })
    }

    // ---- Efectos de goles del evento, para AMBOS lados y en ambos sentidos:
    //  positivo = agrega goles a ese lado · negativo = anula goles existentes
    const isDescuento = event?.moment === 'descuento'

    // Anula n goles del arreglo; devuelve el minuto del último anulado.
    // Si el lado no tiene goles suficientes, el gol se INVENTA igual (pasa
    // y el VAR lo revierte), así el tachado SIEMPRE se ve en el ticker.
    const annul = (arr: GoalItem[], n: number, yours: boolean): number => {
      while (arr.length < n) {
        arr.push({
          kind: 'goal',
          minute: isDescuento ? 91 + Math.floor(rnd() * 7) : 15 + Math.floor(rnd() * 70),
          yours,
          scorer: pickScorer(yours ? run.squad : oppPool, rnd),
          annulled: false,
        })
      }
      const sorted = [...arr].sort((a, b) => a.minute - b.minute)
      let lastMinute = 0
      for (let i = 0; i < n; i++) {
        const g = sorted[sorted.length - 1 - i]
        g.annulled = true
        if (isDescuento) g.minute = 91 + Math.floor(rnd() * 7)
        lastMinute = Math.max(lastMinute, g.minute)
      }
      return lastMinute
    }

    // Agrega n goles a un lado, después del minuto del evento
    const addGoals = (arr: GoalItem[], n: number, yours: boolean, afterMinute: number) => {
      for (let i = 0; i < n; i++) {
        const minute = isDescuento
          ? 91 + Math.floor(rnd() * 12)
          : Math.min(89, afterMinute + 1 + Math.floor(rnd() * Math.max(1, 89 - afterMinute)))
        arr.push({
          kind: 'goal', minute, yours,
          scorer: pickScorer(yours ? run.squad : oppPool, rnd), annulled: false,
        })
      }
    }

    let eventItem: TickerItem | null = null
    if (event) {
      const yg = event.yourGoals ?? 0
      const og = event.oppGoals ?? 0

      if (event.moment === 'previa') {
        // los efectos de previa reparten los goles en cualquier minuto
        if (yg > 0) addGoals(yourGoals, yg, true, 4)
        if (og > 0) addGoals(oppGoals, og, false, 4)
        if (yg < 0) annul(yourGoals, -yg, true)
        if (og < 0) annul(oppGoals, -og, false)
      } else {
        let evMinute = isDescuento ? 90 : 20 + Math.floor(rnd() * 60)
        // primero las anulaciones (el evento se muestra sobre el gol anulado)
        if (yg < 0) {
          const m = annul(yourGoals, -yg, true)
          if (m > 0) evMinute = m
        }
        if (og < 0) {
          const m = annul(oppGoals, -og, false)
          if (m > 0) evMinute = m
        }
        // después los goles agregados (van DESPUÉS del evento)
        if (yg > 0) addGoals(yourGoals, yg, true, evMinute)
        if (og > 0) addGoals(oppGoals, og, false, evMinute)
        eventItem = { kind: 'event', minute: evMinute }
      }
    }

    const items: TickerItem[] = [...yourGoals, ...oppGoals]
    if (eventItem) items.push(eventItem)
    // el evento va después del gol que anula (mismo minuto)
    items.sort((a, b) => a.minute - b.minute || (a.kind === 'event' ? 1 : -1))

    // ---- Resultado final ----
    const hg = yourGoals.filter(g => !g.annulled).length
    const ag = oppGoals.filter(g => !g.annulled).length
    let penalties = raw.penalties
    if (knockout) {
      if (hg === ag && !penalties) penalties = makePens((myRating - oppRating) * 0.004, rnd)
      if (hg !== ag) penalties = undefined
    }
    const score: MatchScore = { hg, ag, penalties }

    return { event, affectedPlayer, score, items, oppId, wildcard }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const roundLabel = isThird
    ? STAGE_LABEL[lang]['3er Puesto']
    : knockout
      ? STAGE_LABEL[lang][KO_ROUNDS[run.koRound]]
      : t.matchday(run.matchday + 1)

  const isPrevia = event?.moment === 'previa'
  type Step = 'previa' | 'live'
  const [step, setStep] = useState<Step>(isPrevia ? 'previa' : 'live')
  const [revealed, setRevealed] = useState(0)

  // Minuto a minuto: los items van apareciendo de a uno
  useEffect(() => {
    if (step !== 'live' || revealed >= items.length) return
    const id = setTimeout(() => setRevealed(r => r + 1), 1100)
    return () => clearTimeout(id)
  }, [step, revealed, items.length])

  const opp = teamById(oppId)
  const shown = items.slice(0, revealed)
  const eventIndex = items.findIndex(i => i.kind === 'event')
  const eventRevealed = eventIndex >= 0 && revealed > eventIndex
  // Marcador en vivo: un gol anulado cuenta hasta que el evento lo tacha
  const countGoal = (i: TickerItem, yours: boolean) =>
    i.kind === 'goal' && i.yours === yours && !(i.annulled && (eventRevealed || isPrevia))
  const liveHg = shown.filter(i => countGoal(i, true)).length
  const liveAg = shown.filter(i => countGoal(i, false)).length
  const allRevealed = revealed >= items.length
  const lastMinute = shown.length ? Math.max(...shown.map(i => i.minute)) : 0

  const finish = () => {
    dispatch({ type: 'recordMatch', event, score })
    onDone()
  }

  const fillText = (s: string) =>
    affectedPlayer ? s.replaceAll('{jugador}', affectedPlayer.name) : s

  const eventCard = event && (
    <div className={`card moment event-${event.mood}`}>
      <div className="moment-news">
        {event.moment === 'previa' ? t.momentPrevia
          : event.moment === 'descuento' ? t.momentDescuento
            : `${t.breakingNews} · ${fmtMin(items[eventIndex]?.minute ?? 0)}`}
      </div>
      <div className="moment-emoji">{event.emoji}</div>
      <h3>{fillText(evTitle(event, lang))}</h3>
      <p>{fillText(evText(event, lang))}</p>
      {affectedPlayer && (
        <small className="affected-line">
          {t.affected}: <strong>{affectedPlayer.name}</strong> ({affectedPlayer.ovr})
        </small>
      )}
    </div>
  )

  return (
    <div className="screen match-screen">
      <h2>{roundLabel} — ⭐ {state.countryName} vs <Flag team={opp} size="md" /> {teamName(opp, lang)}</h2>
      {isThird && <p className="hint">{t.thirdPlaceHint}</p>}

      {wildcard && (
        <div className="card wildcard-armed-banner">
          {wildcard.emoji} {t.wildcardArmed}: <strong>{wcTitle(wildcard, lang)}</strong>
          {run.wildcardNote && (
            <div className="wildcard-note">
              {wildcard.special === 'steal' ? t.wcStole(run.wildcardNote) : t.wcOut(run.wildcardNote)}
            </div>
          )}
        </div>
      )}

      {/* Marcador siempre visible, se actualiza en vivo */}
      <div className="scoreboard">
        <span className="sb-team">⭐ {state.countryName}</span>
        <span className="sb-score">{liveHg} - {liveAg}</span>
        <span className="sb-team"><Flag team={opp} size="sm" /> {teamName(opp, lang)}</span>
        <span className="sb-minute">
          {step === 'live' && allRevealed ? t.fullTime : fmtMin(lastMinute)}
        </span>
      </div>

      {step === 'previa' && (
        <>
          {eventCard}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => setStep('live')}>{t.kickoff}</button>
            <button className="btn btn-ghost" onClick={() => { setStep('live'); setRevealed(items.length) }}>
              {t.skipToResult}
            </button>
          </div>
        </>
      )}

      {step === 'live' && (
        <>
          <div className="card moment live-card">
            {shown.length === 0 && allRevealed
              ? <p>{t.noGoals}</p>
              : (
                <ul className="goal-list">
                  {shown.map((it, i) => it.kind === 'goal' ? (
                    <li key={i} className={`${it.yours ? 'goal-yours' : 'goal-theirs'} ${it.annulled && (eventRevealed || isPrevia) ? 'goal-annulled' : ''}`}>
                      {fmtMin(it.minute)} — ⚽ {it.scorer} {it.yours ? `(${state.countryName})` : `(${teamName(opp, lang)})`}
                      {it.annulled && (eventRevealed || isPrevia) && <strong className="annulled-tag"> {t.annulled}</strong>}
                    </li>
                  ) : (
                    <li key={i} className="ticker-event">{eventCard}</li>
                  ))}
                </ul>
              )}
            {!allRevealed && <div className="live-dots">● ● ●</div>}
            {allRevealed && score.penalties && (
              <div className="pens">{t.pens}: {score.penalties.hp} — {score.penalties.ap}</div>
            )}
          </div>
          {allRevealed
            ? <button className="btn btn-primary btn-big" onClick={finish}>{t.continue}</button>
            : (
              <button className="btn btn-ghost" onClick={() => setRevealed(items.length)}>
                {t.skipToResult}
              </button>
            )}
        </>
      )}
    </div>
  )
}
