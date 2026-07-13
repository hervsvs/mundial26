import { useEffect, useState } from 'react'
import { TEAMS, teamById } from '../data/teams'
import { playersOf } from '../data/players'
import { Flag } from '../components/Flag'
import { PlayerCard } from '../components/PlayerCard'
import { SlotMachine } from '../components/SlotMachine'
import { T, teamName } from '../i18n'
import { useGame } from '../state/store'

export function Heist() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]

  // Intro con reglas (solo antes de la primera tirada)
  const [introDone, setIntroDone] = useState(run.picks.length > 0)
  // Animación de tragamonedas en cada tirada.
  // Ojo: la dependencia es la CANTIDAD de tiradas restantes, no el equipo,
  // porque puede salir dos veces seguidas la misma selección y la pantalla
  // tiene que volver a girar igual.
  const [spinDone, setSpinDone] = useState(false)
  useEffect(() => setSpinDone(false), [run.heistRollsLeft])

  const team = teamById(run.heistTeamId!)
  // Jugadores en orden alfabético (NO por puntaje, para no regalar la elección)
  const players = [...playersOf(team.id)].sort((a, b) => a.name.localeCompare(b.name))
  const pickedIds = new Set(run.picks.map(p => p.id))

  if (!introDone) {
    return (
      <div className="screen heist-intro">
        <h2>{t.heistIntroTitle}</h2>
        <img className="heist-image" src="/Imagen_pasa.png" alt="" />
        <div className="card story-card">
          <p>{t.heistIntroText}</p>
        </div>
        <button className="btn btn-primary btn-big" onClick={() => setIntroDone(true)}>
          {t.heistIntroBtn}
        </button>
      </div>
    )
  }

  const slotItems = TEAMS.map(x => (
    <div key={x.id} className="slot-team">
      <span className="slot-team-flag"><Flag team={x} size="lg" /></span>
      <span>{teamName(x, lang)}</span>
    </div>
  ))
  const targetIndex = TEAMS.findIndex(x => x.id === team.id)

  return (
    <div className="screen">
      <h2>{t.heistTitle(6 - run.heistRollsLeft)}</h2>

      {!spinDone ? (
        <>
          <p className="hint">{t.heistSpinning}</p>
          <SlotMachine
            key={run.heistRollsLeft}
            items={slotItems}
            targetIndex={targetIndex}
            onDone={() => setSpinDone(true)}
          />
        </>
      ) : (
        <>
          {/* La selección sorteada, bien grande */}
          <div className="card team-banner">
            <span className="team-banner-flag"><Flag team={team} size="xl" /></span>
            <div>
              <strong className="team-banner-name">{teamName(team, lang)}</strong>
              <small className="hint"> · {t.heistHint}</small>
            </div>
          </div>

          <div className="cards-grid">
            {players.map(p => (
              <PlayerCard
                key={p.id}
                player={p}
                lang={lang}
                picked={pickedIds.has(p.id)}
                onPick={() => dispatch({ type: 'pickPlayer', playerId: p.id })}
              />
            ))}
          </div>
        </>
      )}

      {run.picks.length > 0 && (
        <div className="card picks-summary">
          <strong>{t.loot(run.picks.length)}</strong>{' '}
          {run.picks.map((p, i) => (
            <span key={p.id} className="loot-item">
              {i > 0 && ' · '}
              <Flag team={teamById(p.teamId)} size="sm" /> {p.name}{' '}
              <strong className="loot-pos">{p.pos}</strong> ({p.ovr})
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
