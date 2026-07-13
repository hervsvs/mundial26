// ============================================================
// COMODINES (WILDCARDS) — se te sortea UNO al principio del torneo
// y lo podés usar UNA sola vez, activándolo antes de un partido.
//
// Campos de efecto (se aplican solo en el partido donde lo usás):
//   ratingDelta    : suma/resta a la fuerza de TU equipo
//   oppRatingDelta : suma/resta a la fuerza del RIVAL (negativo = lo debilita)
//   yourGoals      : goles extra para vos al final
//   special        : 'steal' → te robás la figura del rival de ese partido
//                    para TU plantel (reemplaza a tu peor jugador) por el
//                    resto del torneo.
//   weight         : probabilidad relativa de que te toque en el sorteo
// ============================================================

export interface Wildcard {
  id: string
  emoji: string
  title: string
  titleEn: string
  text: string
  textEn: string
  ratingDelta?: number
  oppRatingDelta?: number
  yourGoals?: number
  special?: 'steal'
  weight: number
}

export const WILDCARDS: Wildcard[] = [
  {
    id: 'infantino', emoji: '📞', title: 'Llamada a Infantino', titleEn: 'Call Infantino',
    text: 'Tenés el celular personal de Infantino. Un llamado antes del partido y el árbitro de golpe ve un penal "clarísimo" para vos.',
    textEn: 'You have Infantino\'s personal number. One call before the match and the referee suddenly spots a "stonewall" penalty for you.',
    yourGoals: 1, weight: 10,
  },
  {
    id: 'bidon', emoji: '🧴', title: 'El bidón de Branco', titleEn: 'Branco\'s water bottle',
    text: 'Receta noventosa: el utilero le alcanza al rival un bidón "especial" en el hydration break. Se les afloja el tranco.',
    textEn: 'A 90s classic: your kit man hands the rivals a "special" bottle at the hydration break. Their legs suddenly get heavy.',
    oppRatingDelta: -6, weight: 10,
  },
  {
    id: 'charla', emoji: '🎙️', title: 'Charla motivacional', titleEn: 'Motivational talk',
    text: 'Conseguiste que una leyenda mundial entre al vestuario antes del partido. Nadie entendió el idioma, pero salieron llorando y a las patadas.',
    textEn: 'You got a world football legend into the dressing room before the match. Nobody understood the language, but they came out crying and ready for war.',
    ratingDelta: 5, weight: 10,
  },
  {
    id: 'robo-extra', emoji: '🥷', title: 'Robo extra', titleEn: 'Extra heist',
    text: 'El error administrativo de la FIFA sigue vigente: antes de este partido te llevás a la FIGURA del rival para tu plantel por el resto del torneo.',
    textEn: 'FIFA\'s clerical error is still open: before this match you steal the opponent\'s STAR for your squad for the rest of the tournament.',
    special: 'steal', weight: 8,
  },
  {
    id: 'doping-rival', emoji: '💉', title: 'Denuncia anónima', titleEn: 'Anonymous tip',
    text: 'Un "hincha preocupado" avisa a la AMA sobre el crack rival. Control sorpresa a las 7 AM: positivo. Baja sensible enfrente.',
    textEn: 'A "concerned fan" tips off WADA about the rival star. Surprise test at 7 AM: positive. Big absence on the other side.',
    oppRatingDelta: -7, weight: 9,
  },
  {
    id: 'escort', emoji: '💃', title: 'Visita nocturna', titleEn: 'Night visit',
    text: 'Alguien coló "visitas" en la concentración rival la noche anterior. Amanecen sospechosamente sonrientes y sospechosamente lentos.',
    textEn: 'Someone smuggled "visitors" into the rival camp the night before. They wake up suspiciously happy and suspiciously slow.',
    oppRatingDelta: -5, weight: 9,
  },
  {
    id: 'romper-estrella', emoji: '🦵', title: 'Cazar a la estrella', titleEn: 'Hunt the star',
    text: 'Orden táctica: a los 5 minutos tu volante "va a buscar" al crack rival. Objetivo cumplido... y ducha anticipada. Jugás con 10 pero ellos sin su figura.',
    textEn: 'Tactical order: in minute 5 your midfielder "goes looking for" the rival star. Mission accomplished... and an early shower. You play with 10 but they lose their star.',
    oppRatingDelta: -7, ratingDelta: -4, weight: 8,
  },
]

import { weightedPick } from '../lib/rand'

export const wildcardById = (id: string): Wildcard =>
  WILDCARDS.find(w => w.id === id) ?? WILDCARDS[0]

export function rollWildcard(rnd: () => number = Math.random): Wildcard {
  return weightedPick(WILDCARDS, w => w.weight, rnd)
}
