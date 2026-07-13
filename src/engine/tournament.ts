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

// Orden de siembra estándar para una llave de 32 (1v32, 16v17, etc.)
// Garantiza que los cruces se respeten hasta la final.
function seedOrder(n: number): number[] {
  let order = [1]
  while (order.length < n) {
    const next: number[] = []
    const size = order.length * 2
    for (const s of order) {
      next.push(s, size + 1 - s)
    }
    order = next
  }
  return order
}

// Construye la llave de 32avos. Los equipos se siembran por rendimiento
// en la fase de grupos (1° de grupo arriba, terceros abajo).
export function buildBracket(groupResults: GroupResult[], yourRating: number): string[] {
  const { qualified } = qualifiers(groupResults)
  const perf = new Map<string, Standing>()
  for (const g of groupResults) for (const s of g.standings) perf.set(s.teamId, s)

  // Ranking de siembra: posición en el grupo primero, luego puntos/dif de gol
  const posInGroup = (id: string) => {
    for (const g of groupResults) {
      const idx = g.standings.findIndex(s => s.teamId === id)
      if (idx >= 0) return idx
    }
    return 3
  }
  const ranked = [...qualified].sort((a, b) => {
    const pa = posInGroup(a); const pb = posInGroup(b)
    if (pa !== pb) return pa - pb
    const sa = perf.get(a)!; const sb = perf.get(b)!
    return sb.pts - sa.pts || sb.gd - sa.gd || sb.gf - sa.gf || ratingOf(b, yourRating) - ratingOf(a, yourRating)
  })

  return seedOrder(32).map(seed => ranked[seed - 1])
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
