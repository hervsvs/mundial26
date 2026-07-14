// ============================================================
// FORMATO DEL MUNDIAL 2026
// 12 grupos de 4 → pasan los 2 primeros + los 8 mejores terceros
// → 32avos → 16avos → cuartos → semis → final
// ============================================================

import { TEAMS, teamById, weakestInGroup } from '../data/teams'
import { simulateMatch, type MatchScore } from './sim'

export const YOUR_ID = 'YOU'

export interface PlayedMatch {
  home: string
  away: string
  score: MatchScore
}

export interface Standing {
  teamId: string
  pts: number
  gf: number
  ga: number
  gd: number
  played: number
  won: number
  drawn: number
  lost: number
}

// Fixture real de un grupo de 4: fecha 1 (1v2, 3v4), fecha 2 (1v3, 4v2), fecha 3 (4v1, 2v3)
export function groupFixtures(ids: string[]): [string, string][][] {
  return [
    [[ids[0], ids[1]], [ids[2], ids[3]]],
    [[ids[0], ids[2]], [ids[3], ids[1]]],
    [[ids[3], ids[0]], [ids[1], ids[2]]],
  ]
}

// Rating de cualquier equipo que no sea el tuyo
export function ratingOf(teamId: string, yourRating: number): number {
  return teamId === YOUR_ID ? yourRating : teamById(teamId).rating
}

// Los 4 equipos de un grupo, con tu equipo reemplazando al más débil si corresponde
export function groupTeamIds(group: string, yourGroup: string | null): string[] {
  const ids = TEAMS.filter(t => t.group === group).map(t => t.id)
  if (group !== yourGroup) return ids
  const weakest = weakestInGroup(group).id
  return ids.map(id => (id === weakest ? YOUR_ID : id))
}

export function computeStandings(ids: string[], matches: PlayedMatch[]): Standing[] {
  const table = new Map<string, Standing>(
    ids.map(id => [id, { teamId: id, pts: 0, gf: 0, ga: 0, gd: 0, played: 0, won: 0, drawn: 0, lost: 0 }]),
  )
  for (const m of matches) {
    const h = table.get(m.home)
    const a = table.get(m.away)
    if (!h || !a) continue
    h.played++; a.played++
    h.gf += m.score.hg; h.ga += m.score.ag
    a.gf += m.score.ag; a.ga += m.score.hg
    if (m.score.hg > m.score.ag) { h.pts += 3; h.won++; a.lost++ }
    else if (m.score.hg < m.score.ag) { a.pts += 3; a.won++; h.lost++ }
    else { h.pts++; a.pts++; h.drawn++; a.drawn++ }
  }
  const rows = [...table.values()]
  rows.forEach(r => (r.gd = r.gf - r.ga))
  return rows.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf)
}

// Simula todos los partidos de un grupo ajeno (sin tu equipo)
export function simulateOtherGroup(group: string, rnd: () => number = Math.random): PlayedMatch[] {
  const ids = TEAMS.filter(t => t.group === group).map(t => t.id)
  const matches: PlayedMatch[] = []
  for (const day of groupFixtures(ids)) {
    for (const [home, away] of day) {
      matches.push({ home, away, score: simulateMatch(teamById(home).rating, teamById(away).rating, false, rnd) })
    }
  }
  return matches
}

export interface GroupResult {
  group: string
  standings: Standing[]
}

// Clasificados: 1° y 2° de cada grupo + 8 mejores terceros
export function qualifiers(groupResults: GroupResult[]): { qualified: string[]; thirdsQualified: Set<string> } {
  const winners: string[] = []
  const runners: string[] = []
  const thirds: Standing[] = []
  for (const g of groupResults) {
    winners.push(g.standings[0].teamId)
    runners.push(g.standings[1].teamId)
    thirds.push(g.standings[2])
  }
  const bestThirds = [...thirds]
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    .slice(0, 8)
    .map(s => s.teamId)
  return { qualified: [...winners, ...runners, ...bestThirds], thirdsQualified: new Set(bestThirds) }
}

// ============================================================
// LLAVE OFICIAL FIFA 2026 (Matches 73–104)
// Cada partido de 16avos se alimenta de posiciones de grupo
// específicas, y las llaves se conectan según el mapa real de
// feeders (NO se emparejan llaves adyacentes genéricamente):
//   Octavos:  M89=W74vW77 · M90=W73vW75 · M91=W76vW78 · M92=W79vW80
//             M93=W83vW84 · M94=W81vW82 · M95=W86vW88 · M96=W85vW87
//   Cuartos:  M97=W90vW89 · M98=W93vW94 · M99=W91vW92 · M100=W95vW96
//   Semis:    M101=W97vW98 · M102=W99vW100 · 3er puesto y Final.
// El array de 32 está ordenado como ÁRBOL para que la reducción por
// pares reproduzca exactamente esas rutas.
// ============================================================

type R32Slot =
  | { pos: 1 | 2; group: string } // 1 = ganador del grupo, 2 = segundo
  | { third: string[] } // mejor tercero de alguno de estos grupos

// Los 16 partidos de 16avos en orden de árbol:
// [M73, M75] → M90 ─┐
// [M74, M77] → M89 ─┴→ M97 ─┐
// [M83, M84] → M93 ─┐       ├→ M101 (semi 1)
// [M81, M82] → M94 ─┴→ M98 ─┘
// [M76, M78] → M91 ─┐
// [M79, M80] → M92 ─┴→ M99 ─┐
// [M86, M88] → M95 ─┐       ├→ M102 (semi 2)
// [M85, M87] → M96 ─┴→ M100 ┘
const R32_TREE: [R32Slot, R32Slot][] = [
  [{ pos: 2, group: 'A' }, { pos: 2, group: 'B' }],                 // M73
  [{ pos: 1, group: 'F' }, { pos: 2, group: 'C' }],                 // M75
  [{ pos: 1, group: 'E' }, { third: ['A', 'B', 'C', 'D', 'F'] }],   // M74
  [{ pos: 1, group: 'I' }, { third: ['C', 'D', 'F', 'G', 'H'] }],   // M77
  [{ pos: 2, group: 'K' }, { pos: 2, group: 'L' }],                 // M83
  [{ pos: 1, group: 'H' }, { pos: 2, group: 'J' }],                 // M84
  [{ pos: 1, group: 'D' }, { third: ['B', 'E', 'F', 'I', 'J'] }],   // M81
  [{ pos: 1, group: 'G' }, { third: ['A', 'E', 'H', 'I', 'J'] }],   // M82
  [{ pos: 1, group: 'C' }, { pos: 2, group: 'F' }],                 // M76
  [{ pos: 2, group: 'E' }, { pos: 2, group: 'I' }],                 // M78
  [{ pos: 1, group: 'A' }, { third: ['C', 'E', 'F', 'H', 'I'] }],   // M79
  [{ pos: 1, group: 'L' }, { third: ['E', 'H', 'I', 'J', 'K'] }],   // M80
  [{ pos: 1, group: 'J' }, { pos: 2, group: 'H' }],                 // M86
  [{ pos: 2, group: 'D' }, { pos: 2, group: 'G' }],                 // M88
  [{ pos: 1, group: 'B' }, { third: ['E', 'F', 'G', 'I', 'J'] }],   // M85
  [{ pos: 1, group: 'K' }, { third: ['D', 'E', 'I', 'J', 'L'] }],   // M87
]

// Asigna los 8 mejores terceros a los 8 huecos de terceros respetando
// qué grupos admite cada hueco (matching con backtracking; si alguna
// combinación rara no tiene solución perfecta, rellena lo que quede).
function assignThirds(thirdGroups: string[]): Map<number, string> {
  const slots = R32_TREE.flatMap((m, mi) =>
    m.map((s, si) => ('third' in s ? { key: mi * 2 + si, allowed: s.third } : null)),
  ).filter((x): x is { key: number; allowed: string[] } => x !== null)

  const result = new Map<number, string>()
  const used = new Set<string>()
  const solve = (i: number): boolean => {
    if (i === slots.length) return true
    for (const g of slots[i].allowed) {
      if (thirdGroups.includes(g) && !used.has(g)) {
        used.add(g)
        result.set(slots[i].key, g)
        if (solve(i + 1)) return true
        used.delete(g)
        result.delete(slots[i].key)
      }
    }
    return false
  }
  if (!solve(0)) {
    // fallback: asignación libre de los que falten
    const remaining = thirdGroups.filter(g => !used.has(g))
    for (const s of slots) {
      if (!result.has(s.key)) result.set(s.key, remaining.shift()!)
    }
  }
  return result
}

// Construye la llave de 16avos con el mapa oficial FIFA.
export function buildBracket(groupResults: GroupResult[], _yourRating: number): string[] {
  const byGroup = new Map(groupResults.map(g => [g.group, g.standings]))
  const { thirdsQualified } = qualifiers(groupResults)

  // grupo de cada tercero clasificado
  const thirdGroups: string[] = []
  const thirdIdByGroup = new Map<string, string>()
  for (const g of groupResults) {
    const third = g.standings[2]
    if (thirdsQualified.has(third.teamId)) {
      thirdGroups.push(g.group)
      thirdIdByGroup.set(g.group, third.teamId)
    }
  }
  const thirdAssignment = assignThirds(thirdGroups)

  const bracket: string[] = []
  R32_TREE.forEach((match, mi) => {
    match.forEach((slot, si) => {
      if ('third' in slot) {
        const group = thirdAssignment.get(mi * 2 + si)!
        bracket.push(thirdIdByGroup.get(group)!)
      } else {
        bracket.push(byGroup.get(slot.group)![slot.pos - 1].teamId)
      }
    })
  })
  return bracket
}

// Nombres correctos: con 32 clasificados la primera ronda son los
// DIECISEISAVOS de final ("16avos"), después octavos, etc.
export const KO_ROUNDS = ['16avos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'] as const
export type KoRoundName = (typeof KO_ROUNDS)[number]

// Simula una ronda eliminatoria completa salvo el partido de tu equipo
// (ese lo juega la UI con su evento). Devuelve ganadores en orden de llave.
export function simulateKoRound(
  bracket: string[],
  yourRating: number,
  yourMatchWinner: string | null, // ganador del partido del jugador (o null si no estás)
  rnd: () => number = Math.random,
): { winners: string[]; results: PlayedMatch[] } {
  const winners: string[] = []
  const results: PlayedMatch[] = []
  for (let i = 0; i < bracket.length; i += 2) {
    const home = bracket[i]
    const away = bracket[i + 1]
    if ((home === YOUR_ID || away === YOUR_ID) && yourMatchWinner) {
      winners.push(yourMatchWinner)
      continue
    }
    const score = simulateMatch(ratingOf(home, yourRating), ratingOf(away, yourRating), true, rnd)
    results.push({ home, away, score })
    const homeWins = score.penalties
      ? score.penalties.hp > score.penalties.ap
      : score.hg > score.ag
    winners.push(homeWins ? home : away)
  }
  return { winners, results }
}
