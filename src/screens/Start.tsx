import { useState } from 'react'
import { CONFIG } from '../data/config'
import { GROUPS, teamsInGroup, weakestInGroup } from '../data/teams'
import { Flag } from '../components/Flag'
import { STAGE_LABEL, T, teamName } from '../i18n'
import { useGame } from '../state/store'

export function Start() {
  const { state, dispatch } = useGame()
  const [name, setName] = useState(state.countryName)
  const [showReplaced, setShowReplaced] = useState(false)
  const { stats, lang } = state
  const t = T[lang]

  const play = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({ type: 'setCountry', name: trimmed })
    dispatch({ type: 'startRun' })
  }

  return (
    <div className="screen start-screen">
      <h1 className="game-title">⚽ {CONFIG.gameName}</h1>
      <p className="tagline">{lang === 'en' ? CONFIG.taglineEn : CONFIG.tagline}</p>

      <div className="card story-card">
        <p>{t.storyIntro}</p>
      </div>

      <label className="country-label">
        {t.countryLabel}
        <input
          className="country-input"
          value={name}
          maxLength={24}
          placeholder={t.countryPlaceholder}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && play()}
        />
      </label>

      <button className="btn btn-primary btn-big" disabled={!name.trim()} onClick={play}>
        {t.playBtn}
      </button>

      {stats.runs > 0 && (
        <div className="card stats-card">
          <strong>{t.yourHistory}</strong> {t.attempts(stats.runs)} · {t.titles(stats.wins)} ·{' '}
          {t.bestResult} {stats.bestStage ? STAGE_LABEL[lang][stats.bestStage] : '—'}
        </div>
      )}

      <button className="btn btn-ghost" onClick={() => setShowReplaced(v => !v)}>
        {showReplaced ? t.hide : t.whoReplace}
      </button>

      {showReplaced && (
        <div className="card replaced-list">
          {GROUPS.map(g => {
            const weak = weakestInGroup(g)
            const rest = teamsInGroup(g).filter(x => x.id !== weak.id)
            return (
              <div key={g} className="replaced-row">
                <strong>{t.group} {g}:</strong> {t.youReplace} <Flag team={weak} size="sm" /> {teamName(weak, lang)}
                <small> ({t.youPlayAgainst}{' '}
                  {rest.map((x, i) => (
                    <span key={x.id}>{i > 0 && ', '}<Flag team={x} size="sm" /> {teamName(x, lang)}</span>
                  ))})
                </small>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
