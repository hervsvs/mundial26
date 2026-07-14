import { useState } from 'react'
import { FORMATIONS } from '../data/formations'
import type { Pos } from '../data/players'
import { buildLineup } from '../engine/lineup'
import { T } from '../i18n'
import { useGame } from '../state/store'

// Elegís la formación con TODO el plantel ya definido: la fuerza del
// equipo cambia según cuántos jugadores caen fuera de posición.
export function Lineup() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const [formation, setFormation] = useState(run.formation)

  const lineup = buildLineup(run.squad, formation)
  const lines: Pos[] = ['DL', 'MC', 'DF', 'PT'] // de arriba (ataque) a abajo (arco)

  return (
    <div className="screen">
      <h2>{t.lineupTitle}</h2>
      <p className="hint">{t.lineupHint}</p>

      <div className="formation-picker">
        {FORMATIONS.map(f => {
          const r = buildLineup(run.squad, f.id).rating
          return (
            <button
              key={f.id}
              className={`btn formation-btn ${f.id === formation ? 'active' : ''}`}
              onClick={() => setFormation(f.id)}
            >
              <strong>{f.id}</strong>
              <small>{t.teamStrength}: {r}</small>
            </button>
          )
        })}
      </div>

      <div className="pitch">
        {lines.map(line => (
          <div key={line} className="pitch-row">
            {lineup.slots.filter(s => s.line === line).map((s, i) => (
              <div key={i} className={`pitch-chip ${s.outOfPosition ? 'oop' : ''}`}
                title={s.outOfPosition ? `${s.player.name} (${t.outOfPos})` : s.player.name}>
                {/* Solo el apellido, con puesto y puntaje debajo: entra una
                    línea de 4 (o 5) en pantalla de celular */}
                <span className="chip-name">{s.player.name.split(' ').pop()}</span>
                <span className="chip-meta">
                  {s.line} · <span className="chip-ovr">{s.effOvr}</span>
                  {s.outOfPosition && ' ⚠️'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card next-match">
        <strong>{formation}</strong> · {t.teamStrength}: {lineup.rating}
      </div>

      <button className="btn btn-primary btn-big"
        onClick={() => dispatch({ type: 'setFormation', formation })}>
        {t.confirmFormation}
      </button>
    </div>
  )
}
