// ============================================================
// MOTOR DE SIMULACIÓN DE PARTIDOS
// Modelo Poisson: la diferencia de rating define los goles esperados.
// ============================================================

import type { Player } from '../data/players'

export interface MatchScore {
  hg: number // goles local (o "vos")
  ag: number // goles rival
  penalties?: { hp: number; ap: number } // definición por penales (solo eliminatorias)
}

// Muestra de una Poisson por método de Knuth
function poisson(lambda: number, rnd: () => number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rnd()
  } while (p > L)
  return Math.min(k - 1, 7) // tope de 7 goles para que no salgan cosas ridículas
}

const clampLambda = (x: number) => Math.max(0.15, Math.min(4, x))

// Goles esperados según diferencia de rating
export function expectedGoals(ratingFor: number, ratingAgainst: number): number {
  const diff = ratingFor - ratingAgainst
  return clampLambda(1.3 + diff * 0.055)
}

export function simulateMatch(
  ratingA: number,
  ratingB: number,
  knockout: boolean,
  rnd: () => number = Math.random,
): MatchScore {
  let hg = poisson(expectedGoals(ratingA, ratingB), rnd)
  let ag = poisson(expectedGoals(ratingB, ratingA), rnd)

  if (knockout && hg === ag) {
    // Tiempo extra: pocas chances de gol
    const extraA = rnd() < expectedGoals(ratingA, ratingB) * 0.12 ? 1 : 0
    const extraB = rnd() < expectedGoals(ratingB, ratingA) * 0.12 ? 1 : 0
    hg += extraA
    ag += extraB
    if (hg === ag) {
      // Penales: leve sesgo por rating
      const bias = 0.5 + (ratingA - ratingB) * 0.004
      let hp = 0
      let ap = 0
      for (let i = 0; i < 5 || hp === ap; i++) {
        if (rnd() < 0.76 + (bias - 0.5)) hp++
        if (rnd() < 0.76 - (bias - 0.5)) ap++
        if (i > 20) { hp++; break } // por si el random se empaca
      }
      return { hg, ag, penalties: { hp, ap } }
    }
  }
  return { hg, ag }
}

// Fuerza efectiva de TU equipo: pesa más a los 5 mejores (tus robados)
// que al fondo del plantel (los de LinkedIn). Por eso importa robar bien.
export function squadRating(squad: Player[]): number {
  const sorted = [...squad].sort((a, b) => b.ovr - a.ovr)
  const top5 = sorted.slice(0, 5)
  const rest = sorted.slice(5)
  const avg = (arr: Player[]) => arr.reduce((s, p) => s + p.ovr, 0) / Math.max(1, arr.length)
  return Math.round((avg(top5) * 0.58 + avg(rest) * 0.42) * 10) / 10
}

// Minutos aleatorios para pintar los goles en la UI
export function goalMinutes(count: number, rnd: () => number = Math.random): number[] {
  return Array.from({ length: count }, () => 1 + Math.floor(rnd() * 93)).sort((a, b) => a - b)
}
