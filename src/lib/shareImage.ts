// ============================================================
// IMAGEN COMPARTIBLE — formato Instagram (1080×1350, 4:5)
// Se genera en un canvas del navegador, sin servidor.
// ============================================================

import { CONFIG } from '../data/config'
import { teamById } from '../data/teams'
import { STAGE_LABEL, T, teamName } from '../i18n'
import type { GameState } from '../state/store'

const W = 1080
const H = 1350

export function renderShareImage(state: GameState): HTMLCanvasElement {
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Fondo degradado: dorado si saliste campeón, césped de noche si no
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  if (run.champion) {
    bg.addColorStop(0, '#2a1f04')
    bg.addColorStop(0.5, '#4a3a08')
    bg.addColorStop(1, '#2a1f04')
  } else {
    bg.addColorStop(0, '#0b1e13')
    bg.addColorStop(0.5, '#123524')
    bg.addColorStop(1, '#0b1e13')
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Líneas de cancha decorativas
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 300, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, H / 2)
  ctx.lineTo(W, H / 2)
  ctx.stroke()

  ctx.textAlign = 'center'

  // Título del juego
  ctx.fillStyle = '#facc15'
  ctx.font = 'bold 52px system-ui, sans-serif'
  ctx.fillText(CONFIG.gameName.toUpperCase(), W / 2, 96)

  // Resultado principal: campeón, subcampeón, tercero o eliminado
  const champion = run.champion
  const mainLine = champion ? t.imgChampion
    : run.finalStage === 'Final' ? (lang === 'en' ? '🥈 RUNNERS-UP' : '🥈 SUBCAMPEÓN')
      : run.finalStage === '3er Puesto' ? (lang === 'en' ? '🥉 3RD PLACE' : '🥉 3ER PUESTO')
        : t.imgEliminated
  ctx.fillStyle = champion ? '#facc15' : '#f8fafc'
  ctx.font = 'bold 110px system-ui, sans-serif'
  ctx.fillText(mainLine, W / 2, 250)

  // Nombre del país del jugador
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 72px system-ui, sans-serif'
  ctx.fillText(state.countryName, W / 2, 360)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '40px system-ui, sans-serif'
  ctx.fillText(
    champion ? t.imgWonWc : t.imgReached(STAGE_LABEL[lang][run.finalStage!]),
    W / 2, 425,
  )

  // Recorrido partido a partido
  const rows = run.history
  const startY = 520
  const rowH = Math.min(64, 620 / Math.max(rows.length, 1))
  ctx.font = '36px system-ui, sans-serif'
  rows.forEach((h, i) => {
    const y = startY + i * rowH
    const color = h.outcome === 'G' ? '#4ade80' : h.outcome === 'E' ? '#facc15' : '#f87171'
    const opp = teamById(h.oppId)
    const label = STAGE_LABEL[lang][h.label] ?? h.label.replace('Fecha', lang === 'en' ? 'MD' : 'Fecha')
    ctx.textAlign = 'left'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(label, 90, y)
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(`vs ${teamName(opp, lang)}`, 330, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = color
    const pens = h.pens ? ` (${h.pens} pen)` : ''
    ctx.fillText(`${h.yourGoals}-${h.oppGoals}${pens}`, W - 90, y)
  })

  // Estadísticas de intentos
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.font = '38px system-ui, sans-serif'
  ctx.fillText(t.imgAttempt(state.stats.runs, state.stats.wins), W / 2, H - 170)

  // Call to action
  ctx.fillStyle = '#facc15'
  ctx.font = 'bold 44px system-ui, sans-serif'
  ctx.fillText(t.imgCta, W / 2, H - 105)
  ctx.fillStyle = '#f8fafc'
  ctx.font = '38px system-ui, sans-serif'
  ctx.fillText(CONFIG.gameUrl.replace(/^https?:\/\//, ''), W / 2, H - 50)

  return canvas
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob falló'))), 'image/png')
  })
}

export function downloadImage(canvas: HTMLCanvasElement, filename: string): void {
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  a.click()
}

// Compartir por WhatsApp: si el dispositivo soporta Web Share API con archivos
// (celulares), comparte la IMAGEN + texto con link. Si no, abre wa.me con el texto.
export async function shareWhatsApp(canvas: HTMLCanvasElement, state: GameState): Promise<void> {
  const run = state.run!
  const lang = state.lang
  const t = T[lang]
  const text = run.champion
    ? t.waChampion(state.countryName, state.stats.runs, CONFIG.gameUrl)
    : t.waLoss(state.countryName, STAGE_LABEL[lang][run.finalStage!], state.stats.runs, CONFIG.gameUrl)

  try {
    const blob = await canvasToBlob(canvas)
    const file = new File([blob], 'mundial26.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text })
      return
    }
  } catch { /* usuario canceló o no soportado: caemos a wa.me */ }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}
