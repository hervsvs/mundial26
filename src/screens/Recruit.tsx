import { useState } from 'react'
import { PlayerCard } from '../components/PlayerCard'
import { T, recruitStory } from '../i18n'
import { useGame } from '../state/store'

// Reclutamiento por LinkedIn: se presentan los 6 de a uno, con la historia.
// Todo skipeable rápido para la gente que rejuega mil veces.
export function Recruit() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const [idx, setIdx] = useState(0)
  const [skipped, setSkipped] = useState(false)

  const done = skipped || idx >= run.recruits.length

  if (done) {
    return (
      <div className="screen">
        <h2>{t.squadFull}</h2>
        <p className="hint">{t.squadHint}</p>
        <div className="cards-grid compact">
          {[...run.picks, ...run.recruits].map(p => (
            <PlayerCard key={p.id} player={p} lang={lang} compact />
          ))}
        </div>
        <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'acceptRecruits' })}>
          {t.chooseFormation}
        </button>
      </div>
    )
  }

  const r = run.recruits[idx]
  return (
    <div className="screen">
      <h2>{t.recruitTitle(idx + 1)}</h2>
      <div className={`card recruit-card ${r.isGem ? 'gem' : ''}`}>
        <p className="recruit-story">{recruitStory(r, lang)}</p>
        <PlayerCard player={r} lang={lang} />
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setIdx(i => i + 1)}>
          {t.next}
        </button>
        <button className="btn btn-ghost" onClick={() => setSkipped(true)}>
          {t.skipAll}
        </button>
      </div>
    </div>
  )
}
