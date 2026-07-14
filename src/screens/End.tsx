import { useEffect, useRef, useState } from 'react'
import { EVENTS } from '../data/events'
import { teamById } from '../data/teams'
import { STAGE_LABEL, T, evTitle, teamName } from '../i18n'
import { canvasToBlob, renderShareImage, shareWhatsApp } from '../lib/shareImage'
import { Flag } from '../components/Flag'
import { YOUR_ID, useGame } from '../state/store'

export function End() {
  const { state, dispatch } = useGame()
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [shareMsg, setShareMsg] = useState('')

  useEffect(() => {
    const canvas = renderShareImage(state)
    canvasRef.current = canvas
    if (imgRef.current) imgRef.current.src = canvas.toDataURL('image/png')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const eventOf = (id: string) => EVENTS.find(e => e.id === id)

  const playAgain = () => {
    dispatch({ type: 'closeRun' })
    dispatch({ type: 'startRun' })
  }

  const nativeShare = async () => {
    if (!canvasRef.current) return
    try {
      await shareWhatsApp(canvasRef.current, state)
    } catch {
      setShareMsg(t.shareFail)
    }
  }

  const copyImage = async () => {
    if (!canvasRef.current) return
    try {
      const blob = await canvasToBlob(canvasRef.current)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setShareMsg(t.copied)
    } catch {
      setShareMsg(t.copyFail)
    }
  }

  // Titular según cómo terminaste: campeón, subcampeón, 3º, 4º o eliminado
  const headline = run.champion ? t.champion
    : run.finalStage === 'Final' ? t.endSubchampion
      : run.finalStage === '3er Puesto' ? t.endThird
        : t.eliminatedIn(STAGE_LABEL[lang][run.finalStage!])

  const worldChamp = !run.champion && run.worldChampionId && run.worldChampionId !== YOUR_ID
    ? teamById(run.worldChampionId)
    : null

  return (
    <div className={`screen end-screen ${run.champion ? 'end-champion' : ''}`}>
      {run.champion && (
        <div className="champion-hero">
          <div className="champion-trophy">🏆</div>
          <div className="champion-country">{state.countryName}</div>
          <div className="champion-sub">{t.championHero}</div>
          <div className="champion-confetti">🎉 🎊 ⚽ 🎊 🎉</div>
        </div>
      )}
      <h1>{headline}</h1>
      <p className="hint">
        {run.champion ? t.endChampion(state.countryName, state.stats.runs) : t.endLoss(state.stats.runs)}
        {run.finalStage === 'Semifinal' && run.history.some(h => h.label === '3er Puesto') ? ` ${t.endFourth}` : ''}
      </p>

      {worldChamp && (
        <div className="card world-champ-card">
          🏆 {t.worldChampWas(teamName(worldChamp, lang))} <Flag team={worldChamp} size="sm" />
        </div>
      )}

      <div className="card history-card">
        <strong>{t.yourPath}</strong>
        <ul className="history-list">
          {run.history.map((h, i) => {
            const opp = teamById(h.oppId)
            const ev = h.eventId ? eventOf(h.eventId) : undefined
            const label = STAGE_LABEL[lang][h.label] ?? h.label.replace('Fecha', lang === 'en' ? 'MD' : 'Fecha')
            return (
              <li key={i} className={`hist-${h.outcome}`}>
                <span className="hist-label">{label}</span>
                {' '}vs <Flag team={opp} size="sm" /> {teamName(opp, lang)}:{' '}
                <strong>{h.yourGoals}-{h.oppGoals}{h.pens ? ` (${h.pens} pen)` : ''}</strong>
                {ev && <small className="hist-event"> {ev.emoji} {evTitle(ev, lang)}</small>}
              </li>
            )
          })}
        </ul>
      </div>

      <h3>{t.shareTitle}</h3>
      <img ref={imgRef} className="share-preview" alt="share" />

      <div className="btn-row">
        <button className="btn btn-primary" onClick={nativeShare}>{t.whatsapp}</button>
        <button className="btn" onClick={copyImage}>{t.copyImage}</button>
      </div>
      {shareMsg && <p className="hint">{shareMsg}</p>}

      <div className="btn-row">
        <button className="btn btn-primary btn-big" onClick={playAgain}>{t.tryAgain}</button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'closeRun' })}>{t.changeCountry}</button>
      </div>
    </div>
  )
}
