// ============================================================
// RECLUTAMIENTO POR LINKEDIN — estilo Cabo Verde 2026
//
// Después de robar 5 jugadores, la federación de tu país completa
// los 6 que faltan buscando en LinkedIn gente "nacionalizable".
// Cada historia tiene: es (español), en (inglés) y weight (peso de
// sorteo: más alto = sale más seguido). {pais} se reemplaza por tu país.
// ============================================================

import { CONFIG } from './config'
import { deriveStats, type Player, type Pos } from './players'
import { weightedPick } from '../lib/rand'

export interface RecruitStory {
  es: string
  en: string
  weight: number
}

// Historias para reclutas normales (mediocres). Agregá las tuyas.
export const RECRUIT_STORIES: RecruitStory[] = [
  {
    es: 'Encontrado en LinkedIn: "Ex jugador semi-profesional. Actualmente contador. Abierto a nuevas oportunidades". Su abuela nació en {pais}. Nacionalizado en 48 horas.',
    en: 'Found on LinkedIn: "Former semi-pro player. Currently an accountant. Open to new opportunities". His grandmother was born in {pais}. Naturalized in 48 hours.',
    weight: 10,
  },
  {
    es: 'Puso "delantero" en su perfil de LinkedIn pero hace 6 años juega al fútbol 5 los martes. Un scout desesperado le mandó un InMail. Aceptó antes de leerlo.',
    en: 'His LinkedIn says "striker" but he\'s been playing Tuesday five-a-side for 6 years. A desperate scout sent him an InMail. He accepted before reading it.',
    weight: 10,
  },
  {
    es: 'Jugaba en la cuarta división de Chipre. Su representante subió un video con música épica y filtros. La federación de {pais} cayó redonda.',
    en: 'He played in the Cypriot fourth division. His agent posted a highlight reel with epic music and filters. The {pais} federation fell for it completely.',
    weight: 10,
  },
  {
    es: 'Arquero de futsal reconvertido. En la entrevista dijo "la pelota es la misma". Nadie pudo rebatirlo. Contratado.',
    en: 'Converted futsal goalkeeper. In the interview he said "the ball is the same". Nobody could argue with that. Hired.',
    weight: 10,
  },
  {
    es: 'Trabajaba en logística de Amazon. Su jefe le dio 4 semanas de licencia "por mundial". LinkedIn lo felicitó por su nuevo puesto: "Futbolista Profesional".',
    en: 'He worked in Amazon logistics. His boss gave him 4 weeks of "World Cup leave". LinkedIn congratulated him on his new position: "Professional Footballer".',
    weight: 10,
  },
  {
    es: 'Un primo lejano del kinesiólogo de la selección. Detalle: nunca jugó un mundial. Detalle 2: nunca jugó al fútbol 11.',
    en: 'A distant cousin of the team physio. Detail: he never played a World Cup. Detail 2: he never played 11-a-side football.',
    weight: 10,
  },
  {
    es: 'Su perfil decía "apasionado del fútbol, orientado a resultados, trabajo en equipo". Era literalmente lo que buscaba el algoritmo. Match.',
    en: 'His profile said "passionate about football, results-driven, team player". It was literally what the algorithm was searching for. Match.',
    weight: 10,
  },
  {
    es: 'Youtuber de "reacciones a goles". La federación entendió mal el CV y creyó que los goles eran de él. Cuando se dieron cuenta ya estaba la conferencia de prensa armada.',
    en: 'A "goal reaction" YouTuber. The federation misread the CV and thought the goals were his. By the time they realized, the press conference was already set up.',
    weight: 10,
  },
  {
    es: 'Fue sparring de la selección sub-17 en 2019. Figura en los papeles como "colaborador deportivo". Alcanzó para la FIFA.',
    en: 'He was a sparring player for the U-17 team in 2019. The paperwork lists him as "sports collaborator". Good enough for FIFA.',
    weight: 10,
  },
  {
    es: 'Profesor de educación física. Sus alumnos de 5º grado juntaron firmas para que lo convoquen. La historia se viralizó y la federación no pudo decir que no.',
    en: 'A PE teacher. His 5th graders collected signatures to get him called up. The story went viral and the federation couldn\'t say no.',
    weight: 10,
  },
  {
    es: 'Encontrado buscando "futbolista {pais} disponible" en LinkedIn con el filtro de ubicación mal puesto. Vive a 11.000 km. Llegó con escalas.',
    en: 'Found by searching "available {pais} footballer" on LinkedIn with the location filter set wrong. He lives 11,000 km away. Arrived with three layovers.',
    weight: 10,
  },
  {
    es: 'Dejó el fútbol a los 19 por una lesión. Volvió a los 31 porque le llegó una notificación: "Una federación vio tu perfil".',
    en: 'He quit football at 19 due to injury. Came back at 31 because of a notification: "A federation viewed your profile".',
    weight: 10,
  },
]

// Historias para la JOYA rara (recluta con overall alto). Que se sienta épico.
export const GEM_STORIES: RecruitStory[] = [
  {
    es: '⚡ INCREÍBLE: un crack con doble ciudadanía andaba libre porque su otra selección "no lo llamó nunca". El scout que lo encontró en LinkedIn ya pidió aumento.',
    en: '⚡ UNBELIEVABLE: a dual-citizenship star was available because his other national team "never called". The scout who found him on LinkedIn already asked for a raise.',
    weight: 10,
  },
  {
    es: '⚡ BOMBAZO: se peleó con el DT de su selección original por un asado y juró no volver. Tu federación le escribió a las 3 AM. Contestó "dale".',
    en: '⚡ BOMBSHELL: he fell out with his original national coach over a barbecue and swore never to return. Your federation texted him at 3 AM. He replied "sure".',
    weight: 10,
  },
  {
    es: '⚡ MILAGRO: figura de liga top que quedó fuera de su lista por "razones tácticas". Vio la publicación de LinkedIn de {pais} y mandó CV él mismo.',
    en: '⚡ MIRACLE: a top-league star left off his squad for "tactical reasons". He saw the {pais} LinkedIn post and sent his own CV.',
    weight: 10,
  },
]

// Nombres para generar reclutas (se combinan al azar)
export const RECRUIT_FIRST = [
  'Waldo', 'Ramiro', 'Gervasio', 'Teófilo', 'Aníbal', 'Cirilo', 'Bautista', 'Rogelio',
  'Kevin', 'Brian', 'Jonatan', 'Maicol', 'Wilson', 'Édinson', 'Ovidio', 'Néstor',
  'Dimitri', 'Yerlan', 'Kofi', 'Tarek', 'Bogdan', 'Sifiso', 'Yuki', 'Loïc', 'Pedro',
]
export const RECRUIT_LAST = [
  'Ferreyra', 'Bogado', 'Sosa', 'Cardozo', 'Mbemba', 'Popescu', 'Van der Berg', 'Okafor',
  'Domínguez', 'Peralta', 'Kowalski', 'Nakamura', 'Traoré', 'Petrov', 'Silveira', 'Acuña',
  'Espínola', 'Duarte', 'Katsaros', 'O\'Sullivan', 'Fontana', 'Zárate', 'Bittencourt', 'Molina',
]

const pick = <T,>(arr: T[], rnd: () => number) => arr[Math.floor(rnd() * arr.length)]

export interface Recruit extends Player {
  storyEs: string
  storyEn: string
  isGem: boolean
}

// Genera los 6 reclutas que completan el equipo.
// `needGk`: si no robaste ningún arquero, uno de los reclutas es PT obligado.
export function generateRecruits(countryName: string, needGk: boolean, rnd: () => number = Math.random): Recruit[] {
  const recruits: Recruit[] = []
  const usedNames = new Set<string>()
  const positions: Pos[] = needGk ? ['PT', 'DF', 'DF', 'MC', 'MC', 'DL'] : ['DF', 'DF', 'MC', 'MC', 'DL', 'DL']

  for (let i = 0; i < 6; i++) {
    let name = ''
    do {
      name = `${pick(RECRUIT_FIRST, rnd)} ${pick(RECRUIT_LAST, rnd)}`
    } while (usedNames.has(name))
    usedNames.add(name)

    const isGem = rnd() < CONFIG.gemChance
    const ovr = isGem
      ? 80 + Math.floor(rnd() * 8)
      : CONFIG.recruitOvrMin + Math.floor(rnd() * (CONFIG.recruitOvrMax - CONFIG.recruitOvrMin + 1))
    const pos = positions[i]
    const story = weightedPick(isGem ? GEM_STORIES : RECRUIT_STORIES, s => s.weight, rnd)

    recruits.push({
      id: `recruit-${i}`,
      name,
      teamId: 'YOU',
      pos,
      ovr,
      stats: deriveStats(name, pos, ovr),
      storyEs: story.es.replaceAll('{pais}', countryName),
      storyEn: story.en.replaceAll('{pais}', countryName),
      isGem,
    })
  }
  return recruits
}
