// Sorteo ponderado genérico: a mayor weight, más probabilidad de salir.
// Se usa en TODOS los listados al azar del juego (grupo, robo, eventos, historias).
export function weightedPick<T>(items: T[], weightOf: (item: T) => number, rnd: () => number = Math.random): T {
  const total = items.reduce((s, it) => s + Math.max(0, weightOf(it)), 0)
  let r = rnd() * total
  for (const it of items) {
    r -= Math.max(0, weightOf(it))
    if (r <= 0) return it
  }
  return items[items.length - 1]
}
