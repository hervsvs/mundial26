// ============================================================
// CONFIGURACIÓN GENERAL DEL JUEGO — editá tranquilo acá
// ============================================================

export const CONFIG = {
  // Nombre del juego (aparece en el header y en la imagen compartible)
  gameName: 'El Colado del Mundial',
  tagline: 'Robá jugadores. Colate en el Mundial 2026. Intentá ganarlo.',
  taglineEn: 'Steal players. Crash the 2026 World Cup. Try to win it.',

  // URL pública del juego (se usa en el share de WhatsApp y la imagen)
  gameUrl: 'https://mundial26-sooty.vercel.app',

  // --- DIFICULTAD -------------------------------------------
  // Bonus de fuerza de TU equipo en fase de grupos: calibrado (Monte Carlo,
  // 500 corridas) para que clasifiques ~60% de las veces, un 20% como mejor
  // tercero, pero ganar el mundial siga siendo muy difícil. Subilo si el
  // grupo te parece imposible, bajalo si querés sufrir más.
  groupStageBonus: 12,
  // Bonus de fuerza que reciben los RIVALES en eliminatorias (dificultad)
  knockoutOpponentBonus: 1,
  // Bonus de TU equipo por ronda eliminatoria:
  // [16avos, Octavos, Cuartos, Semifinal, Final]
  // Calibrado para que llegar a la final sea alcanzable, pero en la FINAL
  // no hay ayuda: ganar el título es a pelo contra un tanque.
  // (El partido por el tercer puesto usa el bonus de Semifinal.)
  koRoundBonus: [7, 6.5, 6, 5.5, 0],
  // Probabilidad (0 a 1) de que pase UN evento en un partido.
  // 1 = siempre pasa exactamente uno (nunca pasan dos).
  eventChance: 1,
  // Probabilidad (0 a 1) de que un recluta de LinkedIn sea una joya (ovr 80+)
  gemChance: 0.15,
  // Rango de overall de los reclutas normales de LinkedIn
  recruitOvrMin: 55,
  recruitOvrMax: 79,

  // --- PESOS DE SORTEO --------------------------------------
  // Peso de cada grupo en el sorteo inicial (más alto = te toca más seguido).
  // Todos en 1 = sorteo uniforme. Ej: A: 3 hace que el grupo A salga el triple.
  groupWeights: { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1, G: 1, H: 1, I: 1, J: 1, K: 1, L: 1 } as Record<string, number>,
  // El peso de cada SELECCIÓN en las tiradas del robo se edita en teams.ts
  // (campo heistWeight). El peso de cada EVENTO en events.ts (campo weight).
  // El de cada historia de LinkedIn en recruits.ts (campo weight).

  // --- DONACIONES -------------------------------------------
  // Dejá el link vacío ('') para ocultar una plataforma
  donations: [
    { name: 'Cafecito', url: 'https://cafecito.app/colado', emoji: '☕' },
  ],

  // --- ANALYTICS (Supabase) ---------------------------------
  // Creá un proyecto gratis en https://supabase.com, ejecutá el SQL del README
  // y pegá acá la URL y la anon key. Si quedan vacíos, no se registra nada.
  supabaseUrl: '',
  supabaseAnonKey: '',
}
