// ============================================================
// ARMADO DE LA ALINEACIÓN según formación elegida
// Asigna tus 11 jugadores a los puestos: primero los que coinciden
// de posición, después rellena con los que sobran (penalizados).
// ============================================================

import { formationById } from '../data/formations'
import type { Player, Pos } from '../data/players'

// Penalización de overall por jugar fuera de posición
const OUT_OF_POS_PENALTY = 4
const FIELD_IN_GOAL_PENALTY = 12
const GK_IN_FIELD_PENALTY = 10

export interface LineupSlot {
  line: Pos // línea donde juega (PT/DF/MC/DL)
  player: Player
  effOvr: number // overall efectivo en ese puesto
  outOfPosition: boolean
}

export interface Lineup {
  slots: LineupSlot[]
  rating: number
}

function effOvr(player: Player, line: Pos): number {
  if (player.pos === line) return player.ovr
  if (line === 'PT') return Math.max(30, player.ovr - FIELD_IN_GOAL_PENALTY)
  if (player.pos === 'PT') return Math.max(30, player.ovr - GK_IN_FIELD_PENALTY)
  return Math.max(30, player.ovr - OUT_OF_POS_PENALTY)
}

export function buildLineup(squad: Player[], formationId: string): Lineup {
  const f = formationById(formationId)
  const need: [Pos, number][] = [['PT', 1], ['DF', f.df], ['MC', f.mc], ['DL', f.dl]]
  const available = [...squad].sort((a, b) => b.ovr - a.ovr)
  const slots: LineupSlot[] = []

  // 1º: llenar cada línea con jugadores de esa posición natural
  for (const [line, count] of need) {
    for (let i = 0; i < count; i++) {
      const idx = available.findIndex(p => p.pos === line)
      if (idx >= 0) {
        const player = available.splice(idx, 1)[0]
        slots.push({ line, player, effOvr: player.ovr, outOfPosition: false })
      } else {
        slots.push({ line, player: null as unknown as Player, effOvr: 0, outOfPosition: true })
      }
    }
  }

  // 2º: los huecos se rellenan con los mejores que quedaron (fuera de posición)
  for (const slot of slots) {
    if (!slot.player) {
      const player = available.shift()!
      slot.player = player
      slot.effOvr = effOvr(player, slot.line)
      slot.outOfPosition = true
    }
  }

  // Fuerza del equipo: misma fórmula que squadRating pero con overalls efectivos
  const ovrs = slots.map(s => s.effOvr).sort((a, b) => b - a)
  const top5 = ovrs.slice(0, 5)
  const rest = ovrs.slice(5)
  const avg = (a: number[]) => a.reduce((s, n) => s + n, 0) / Math.max(1, a.length)
  const rating = Math.round((avg(top5) * 0.58 + avg(rest) * 0.42) * 10) / 10

  return { slots, rating }
}
