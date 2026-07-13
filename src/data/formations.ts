// ============================================================
// FORMACIONES DISPONIBLES — editá o agregá las que quieras
// df + mc + dl debe sumar 10 (el arquero va siempre).
// Los jugadores que caen fuera de su posición natural rinden menos
// (la penalización se define en engine/lineup.ts).
// ============================================================

export interface Formation {
  id: string
  df: number
  mc: number
  dl: number
}

export const FORMATIONS: Formation[] = [
  { id: '4-4-2', df: 4, mc: 4, dl: 2 },
  { id: '4-3-3', df: 4, mc: 3, dl: 3 },
  { id: '4-5-1', df: 4, mc: 5, dl: 1 },
  { id: '3-5-2', df: 3, mc: 5, dl: 2 },
  { id: '3-4-3', df: 3, mc: 4, dl: 3 },
  { id: '5-3-2', df: 5, mc: 3, dl: 2 },
  { id: '5-4-1', df: 5, mc: 4, dl: 1 },
]

export const DEFAULT_FORMATION = '4-4-2'

export const formationById = (id: string): Formation =>
  FORMATIONS.find(f => f.id === id) ?? FORMATIONS[0]
