import { teamById } from '../data/teams'
import { wildcardById } from '../data/wildcards'
import { Flag } from '../components/Flag'
import { StandingsTable } from '../components/StandingsTable'
import { useGame, yourEffectiveRating } from '../state/store'
import { STAGE_LABEL, T, teamName, wcText, wcTitle, type Lang } from '../i18n'
import {
  YOUR_ID, computeStandings, groupFixtures, groupTeamIds, KO_ROUNDS,
} from '../engine/tournament'

const label = (id: string, countryName: string, lang: Lang) =>
  id === YOUR_ID
    ? <>⭐ {countryName}</>
    : <><Flag team={teamById(id)} size="sm" /> {teamName(teamById(id), lang)}</>

// Panel del comodín: se muestra hasta que se usa
function WildcardPanel() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const wc = wildcardById(run.wildcardId)

  if (run.wildcardUsed && !run.wildcardArmed) return null

  return (
    <div className={`card wildcard-card ${run.wildcardArmed ? 'armed' : ''}`}>
      <div className="wildcard-body">
        <span className="wildcard-emoji">{wc.emoji}</span>
        <div>
          <strong>{t.wildcard}: {wcTitle(wc, lang)}</strong>
          <p>{wcText(wc, lang)}</p>
        </div>
      </div>
      {run.wildcardArmed
        ? (
          <div className="wildcard-armed-msg">
            {t.wildcardArmed}
            {run.wildcardNote && (
              <div className="wildcard-note">
                {wc.special === 'steal' ? t.wcStole(run.wildcardNote) : t.wcOut(run.wildcardNote)}
              </div>
            )}
          </div>
        )
        : (
          <button className="btn" onClick={() => dispatch({ type: 'useWildcard' })}>
            {t.wildcardUse}
          </button>
        )}
    </div>
  )
}

// Hub del torneo: tabla del grupo + próximo partido, o la llave eliminatoria
export function Tournament({ onPlay }: { onPlay: () => void }) {
  const { state } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const rating = yourEffectiveRating(run)

  if (run.phase === 'group') {
    const ids = groupTeamIds(run.group, run.group)
    const standings = computeStandings(ids, run.groupMatches)
    const day = groupFixtures(ids)[run.matchday]
    const yourMatch = day.find(([h, a]) => h === YOUR_ID || a === YOUR_ID)!
    const oppId = yourMatch[0] === YOUR_ID ? yourMatch[1] : yourMatch[0]

    return (
      <div className="screen">
        <h2>{t.matchdayOf(run.group, run.matchday + 1)}</h2>
        <StandingsTable standings={standings} countryName={state.countryName} lang={lang} />
        <div className="card next-match">
          <div className="next-match-title">{t.nextMatch}</div>
          <div className="versus">
            <span>⭐ {state.countryName}</span>
            <span className="vs">VS</span>
            <span>{label(oppId, state.countryName, lang)}</span>
          </div>
          <small>
            {t.yourStrength}: <strong className="strength-num">{rating}</strong> ({run.formation})
            {' '}· {t.rival}: <strong className="strength-num">{teamById(oppId).rating}</strong>
          </small>
        </div>
        <WildcardPanel />
        <button className="btn btn-primary btn-big" onClick={onPlay}>{t.playMatch}</button>
        <p className="hint">{t.qualifyHint}</p>
      </div>
    )
  }

  // Eliminatorias (incluye el partido por el tercer puesto)
  const bracket = run.bracket!
  const isThird = !!run.thirdPlaceOppId
  const idx = bracket.indexOf(YOUR_ID)
  const oppId = isThird ? run.thirdPlaceOppId! : bracket[idx % 2 === 0 ? idx + 1 : idx - 1]
  const roundName = isThird ? STAGE_LABEL[lang]['3er Puesto'] : STAGE_LABEL[lang][KO_ROUNDS[run.koRound]]

  return (
    <div className="screen">
      <h2>{isThird ? '🥉' : '🏆'} {roundName}</h2>
      {isThird && <p className="hint">{t.thirdPlaceHint}</p>}
      <div className="card next-match">
        <div className="versus">
          <span>⭐ {state.countryName}</span>
          <span className="vs">VS</span>
          <span>{label(oppId, state.countryName, lang)}</span>
        </div>
        <small>
          {t.yourStrength}: <strong className="strength-num">{rating}</strong> ({run.formation})
          {' '}· {t.rival}: <strong className="strength-num">{teamById(oppId).rating}</strong> · {t.koHint}
        </small>
      </div>
      <WildcardPanel />
      <button className="btn btn-primary btn-big" onClick={onPlay}>{t.playRound(roundName)}</button>
      {!isThird && (
        <div className="card bracket-list">
          <strong>{t.stillAlive}</strong>{' '}
          {bracket.map((id, i) => (
            <span key={id}>{i > 0 && ' · '}{label(id, state.countryName, lang)}</span>
          ))}
        </div>
      )}
    </div>
  )
}
