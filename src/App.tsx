import { useState } from 'react'
import { CONFIG } from './data/config'
import { DonateBar } from './components/DonateBar'
import { T } from './i18n'
import { useGame } from './state/store'
import { Start } from './screens/Start'
import { Draw } from './screens/Draw'
import { Heist } from './screens/Heist'
import { Recruit } from './screens/Recruit'
import { Lineup } from './screens/Lineup'
import { Tournament } from './screens/Tournament'
import { Match } from './screens/Match'
import { GroupEnd } from './screens/GroupEnd'
import { End } from './screens/End'

export default function App() {
  const { state, dispatch } = useGame()
  const [playing, setPlaying] = useState(false)
  const run = state.run
  const lang = state.lang

  let screen
  if (!run) screen = <Start />
  else if (run.phase === 'draw') screen = <Draw />
  else if (run.phase === 'heist') screen = <Heist />
  else if (run.phase === 'recruit') screen = <Recruit />
  else if (run.phase === 'lineup') screen = <Lineup />
  else if (run.phase === 'groupEnd') screen = <GroupEnd />
  else if (run.phase === 'end') screen = <End />
  else if (playing) screen = <Match onDone={() => setPlaying(false)} />
  else screen = <Tournament onPlay={() => setPlaying(true)} />

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-logo">⚽ {CONFIG.gameName}</span>
        <span className="header-right">
          {run && state.countryName && <span className="app-country">⭐ {state.countryName}</span>}
          <button
            className="lang-toggle"
            onClick={() => dispatch({ type: 'setLang', lang: lang === 'es' ? 'en' : 'es' })}
            title={lang === 'es' ? 'Play in English' : 'Jugar en español'}
          >
            {lang === 'es' ? '🇬🇧 EN' : '🇦🇷 ES'}
          </button>
        </span>
      </header>
      <main>{screen}</main>
      <footer>
        <DonateBar lang={lang} />
        <p className="footer-note">{T[lang].footerNote}</p>
      </footer>
    </div>
  )
}
