import { StandingsTable } from '../components/StandingsTable'
import { T } from '../i18n'
import { useGame } from '../state/store'

// Tabla final del grupo: en qué posición terminaste y si pasaste o no
export function GroupEnd() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const info = run.qualifiedInfo!
  const standings = run.allGroupResults!.find(g => g.group === run.group)!.standings

  const message = !info.qualified
    ? t.groupEndOut(info.position)
    : info.asThird
      ? t.groupEndAsThird
      : t.groupEndQualified(info.position)

  return (
    <div className="screen">
      <h2>{t.groupEndTitle(run.group)}</h2>
      <StandingsTable standings={standings} countryName={state.countryName} lang={lang} />
      <div className={`card group-end-msg ${info.qualified ? 'ok' : 'out'}`}>
        {message}
      </div>
      <button className="btn btn-primary btn-big" onClick={() => dispatch({ type: 'continueFromGroup' })}>
        {info.qualified ? t.groupEndContinueKo : t.groupEndContinueOut}
      </button>
    </div>
  )
}
