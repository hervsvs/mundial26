import { useState } from 'react'
import { GROUPS, teamById, teamsInGroup } from '../data/teams'
import { wildcardById } from '../data/wildcards'
import { Flag } from '../components/Flag'
import { SlotMachine } from '../components/SlotMachine'
import { T, teamName, wcText, wcTitle } from '../i18n'
import { useGame } from '../state/store'

// Sorteo de grupo con animación tipo tragamonedas:
// pasan los grupos rápido, frena en el tuyo y aparecen los rivales.
export function Draw() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const [spun, setSpun] = useState(false)

  const targetIndex = GROUPS.indexOf(run.group)
  const replaced = teamById(run.replacedTeamId)
  const rivals = teamsInGroup(run.group).filter(x => x.id !== run.replacedTeamId)
  const wc = wildcardById(run.wildcardId)

  const slotItems = GROUPS.map(g => (
    <div key={g} className="slot-group">
      <span className="slot-group-letter">{t.group} {g}</span>
      <span className="slot-group-flags">
        {teamsInGroup(g).map(x => <Flag key={x.id} team={x} size="md" />)}
      </span>
    </div>
  ))

  return (
    <div className="screen draw-screen">
      <h2>{t.drawTitle}</h2>
      {!spun && <p className="hint">{t.drawSpinning}</p>}

      <SlotMachine items={slotItems} targetIndex={targetIndex} onDone={() => setSpun(true)} />

      {spun && (
        <>
          <h1 className="draw-result">{t.drawResult(run.group)}</h1>

          <div className="card replaced-banner">
            {t.drawYouReplace}: <strong><Flag team={replaced} size="sm" /> {teamName(replaced, lang)}</strong>
          </div>

          <div className="draw-rivals">
            <p className="hint">{t.drawYourRivals}:</p>
            <div className="rival-cards">
              {rivals.map(x => (
                <div key={x.id} className="card rival-card">
                  <span className="rival-flag"><Flag team={x} size="xl" /></span>
                  <strong>{teamName(x, lang)}</strong>
                  <small>{x.rating}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="card wildcard-card">
            <div className="wildcard-head">{t.drawWildcard}</div>
            <div className="wildcard-body">
              <span className="wildcard-emoji">{wc.emoji}</span>
              <div>
                <strong>{wcTitle(wc, lang)}</strong>
                <p>{wcText(wc, lang)}</p>
                <small className="hint">{t.drawWildcardHint}</small>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'confirmDraw' })}>
            {t.drawContinue}
          </button>
        </>
      )}
    </div>
  )
}
