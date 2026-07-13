 
// ============================================================
// EVENTOS DE PARTIDO — en cada partido pasa UNO solo, al azar
//
// Para agregar uno nuevo, copiá cualquier bloque y cambiá los campos:
//   moment      : 'previa'    → pasa ANTES del partido (viajes, lesiones, hotel)
//                 'partido'   → pasa DURANTE el partido (aparece en el minuto a minuto)
//                 'descuento' → pasa en el tiempo agregado (los goles que sume/anule
//                               van al minuto 90+ para que sea coherente)
//   ratingDelta : suma/resta a la fuerza de TU equipo en ese partido
//   yourGoals   : goles que se suman (+) o se anulan (-) de TU marcador.
//                 Los anulados se ven tachados como ANULADO en el minuto a minuto.
//   oppGoals    : goles que se suman (+) o se anulan (-) del RIVAL.
//                 Ej: oppGoals: -1 = le invalidan un gol al rival.
//   vsTeam      : id de selección (ej: 'NOR') → el evento SOLO puede salir contra
//                 ese rival. Sin este campo, sale contra cualquiera.
//   stage       : 'grupos' | 'eliminatorias' → SOLO en esa instancia.
//                 Sin este campo, puede pasar en cualquier partido.
//   weight      : qué tan seguido sale (más alto = más frecuente)
//   mood        : 'malo' | 'neutro' | 'bueno'  (color de la carta)
//   affects     : 'star' (tu mejor jugador de campo) | 'random' (uno al azar).
//                 Escribí {jugador} en el texto y se reemplaza por el nombre real.
//   title/text  : español · titleEn/textEn: inglés
// ============================================================

export type EventMoment = 'previa' | 'partido' | 'descuento'
export type EventStage = 'grupos' | 'eliminatorias'

export interface MatchEvent {
  id: string
  emoji: string
  title: string
  titleEn: string
  text: string
  textEn: string
  moment: EventMoment
  ratingDelta: number
  yourGoals?: number
  oppGoals?: number
  vsTeam?: string
  stage?: EventStage
  weight: number
  mood: 'malo' | 'neutro' | 'bueno'
  affects?: 'star' | 'random'
}

export const EVENTS: MatchEvent[] = [
  // ---------- MALOS (los que pediste) ----------
  {
    id: 'cartel', emoji: '🤕', title: 'Festejo caro', titleEn: 'Expensive celebration',
    text: '{jugador} grita el gol del calentamiento saltando el cartel de publicidad. Se quiebra solo. Camilla y a la clínica.',
    textEn: '{jugador} celebrates a warm-up goal by hurdling the ad boards. Snaps something on his own. Stretcher, hospital, done.',
    moment: 'previa', ratingDelta: -6, weight: 10, mood: 'malo', affects: 'random',
  },
  {
    id: 'var-anula', emoji: '📺', title: 'El VAR te lo borra', titleEn: 'VAR erases your goal',
    text: 'Gritaste el gol, te sacaste la camiseta, te comiste la amarilla... y el VAR encontró un offside de media uña del dedo gordo.',
    textEn: 'You screamed the goal, took your shirt off, got booked... and VAR found an offside by half a toenail.',
    moment: 'partido', ratingDelta: 0, yourGoals: -1, weight: 12, mood: 'malo',
  },
  {
    id: 'adicion-15', emoji: '⏱️', title: '15 minutos de adición', titleEn: '15 minutes of stoppage time',
    text: 'El cuarto árbitro levanta el cartel: +15. Nadie sabe por qué. El rival lo aprovecha mejor que vos.',
    textEn: 'The fourth official raises the board: +15. Nobody knows why. The opponent makes better use of it than you.',
    moment: 'descuento', ratingDelta: 0, oppGoals: 1, weight: 8, mood: 'malo',
  },
  {
    id: 'doping-carne', emoji: '🥩', title: 'Asado contaminado', titleEn: 'Contaminated barbecue',
    text: '{jugador} y dos suplentes dan positivo de clembuterol por una carne "de dudosa procedencia" en el asado de la concentración. Baja masiva.',
    textEn: '{jugador} and two subs test positive for clenbuterol after some "questionably sourced" meat at the team barbecue. Mass absence.',
    moment: 'previa', ratingDelta: -8, weight: 7, mood: 'malo', affects: 'random',
  },
  {
    id: 'lesion-estrella', emoji: '⭐', title: 'Se te rompió el crack', titleEn: 'Your star broke down',
    text: '{jugador}, tu figura, sintió "una molestia" en el entrenamiento de ayer. El parte médico dice que no puede jugar hoy.',
    textEn: '{jugador}, your star man, felt "a slight discomfort" in yesterday\'s training. The medical report says that he can\'t play today.',
    moment: 'previa', ratingDelta: -7, weight: 10, mood: 'malo', affects: 'star',
  },
  {
    id: 'tormenta', emoji: '⛈️', title: 'Tormenta eléctrica', titleEn: 'Electrical storm',
    text: 'El chárter estuvo 6 horas dando vueltas sobre Dallas. Llegaron al estadio directo desde el aeropuerto, comiendo maní del avión.',
    textEn: 'The charter circled Dallas for 6 hours. They arrived at the stadium straight from the airport, still eating airplane peanuts.',
    moment: 'previa', ratingDelta: -5, weight: 9, mood: 'malo',
  },
  {
    id: 'petardos', emoji: '🧨', title: 'Serenata de petardos', titleEn: 'Firecracker serenade',
    text: 'La hinchada local descubrió tu hotel anoche. Petardos, bombos y cánticos de 2 a 7 AM. Tu equipo juega con ojeras.',
    textEn: 'The home fans found your hotel last night. Firecrackers, drums and chants from 2 to 7 AM. Your team plays with bags under their eyes.',
    moment: 'previa', ratingDelta: -5, vsTeam: 'MEX', weight: 9, mood: 'malo',
  },
  {
    id: 'migraciones', emoji: '🛂', title: 'Retenidos en migraciones', titleEn: 'Held at immigration',
    text: 'A medio plantel le rebotó la visa "por un error del sistema". Durmieron en el piso del aeropuerto abrazados a los botines.',
    textEn: 'Half the squad had their visas bounced "due to a system error". They slept on the airport floor hugging their boots.',
    moment: 'previa', ratingDelta: -5, weight: 8, mood: 'malo',
  },
  {
    id: 'figura-indultada', emoji: '🎩', title: 'Indulto presidencial', titleEn: 'Presidential pardon',
    text: 'El presidente anfitrión "sugirió" esta mañana que la expulsión de su figura fue injusta. Reaparece en la lista. Obviamente te va a hacer un gol.',
    textEn: 'This morning the host president "suggested" his star\'s red card was unfair. He reappears in the lineup. Obviously he will score against you.',
    moment: 'previa', ratingDelta: 0, oppGoals: 1, weight: 7, mood: 'malo',
  },
  {
    id: 'echan-dt', emoji: '🪑', title: 'Volteada de DT', titleEn: 'Coach sacked mid-tournament',
    text: 'Tu federación echó al DT anoche por "diferencias futbolísticas" en pleno mundial. Hoy dirige el utilero, que la ve desde afuera.',
    textEn: 'Your federation sacked the coach last night over "footballing differences" mid-World Cup. Today the kit man takes charge; he says he "sees the game well".',
    moment: 'previa', ratingDelta: -4, weight: 8, mood: 'malo',
  },

  // ---------- MALOS (pasaron de verdad en 2026) ----------
  {
    id: 'tres-rojas', emoji: '🟥', title: 'Partido caliente', titleEn: 'Heated match',
    text: 'Como en el México–Sudáfrica inaugural: tres rojas y un partido que parece más UFC que fútbol. Terminás con nueve.',
    textEn: 'Like the Mexico–South Africa opener: three red cards and a match that looks more UFC than football. You finish with nine men.',
    moment: 'partido', ratingDelta: -5, weight: 8, mood: 'malo',
  },
  {
    id: 'brujo', emoji: '🧙', title: 'Te maldijeron al goleador', titleEn: 'Your striker got cursed',
    text: 'Un brujo contratado por la federación rival le hizo "trabajo" a {jugador}. No le pega ni al arco inflable.',
    textEn: 'A witch doctor hired by the rival federation put a "job" on {jugador}. He couldn\'t hit an inflatable goal.',
    moment: 'previa', ratingDelta: -4, weight: 8, mood: 'malo', affects: 'star',
  },
  {
    id: 'offside-agonico', emoji: '📏', title: 'Offside milimétrico', titleEn: 'Millimetric offside',
    text: 'Gol agónico en el descuento... anulado por el offside semi-automático: 3 milímetros de hombro',
    textEn: 'A dramatic stoppage-time goal... ruled out by semi-automated offside for 3 millimeters of shoulder',
    moment: 'descuento', ratingDelta: 0, yourGoals: -1, weight: 8, mood: 'malo',
  },
  {
    id: 'caida-encima', emoji: '😖', title: 'Lesión ridícula', titleEn: 'Ridiculous injury',
    text: 'Un defensor rival se desploma arriba de {jugador} y lo lesiona en... una zona muy sensible. Igual que al pobre Ben Old de Nueva Zelanda.',
    textEn: 'A rival defender collapses on top of {jugador}, injuring him in... a very sensitive area. Just like poor Ben Old of New Zealand.',
    moment: 'partido', ratingDelta: -4, weight: 7, mood: 'malo', affects: 'random',
  },
  {
    id: 'roja-boca-tapada', emoji: '🤫', title: 'Roja por bocón', titleEn: 'Red card for trash talk',
    text: '{jugador} insulta al árbitro tapándose la boca. El árbitro, que lee labios con la mano y todo, lo echa igual.',
    textEn: '{jugador} insults the referee while covering his mouth. The ref, who apparently lip-reads through hands, sends him off anyway.',
    moment: 'partido', ratingDelta: -4, weight: 7, mood: 'malo', affects: 'random',
  },
  {
    id: 'calor-mediodia', emoji: '🥵', title: 'Partido a las 12 del mediodía', titleEn: 'High-noon kickoff',
    text: 'Kickoff al mediodía con 41°C para la TV europea. Tus jugadores piden el hydration break a los 4 minutos.',
    textEn: 'Noon kickoff at 106°F for European TV. Your players beg for the hydration break in minute 4.',
    moment: 'previa', ratingDelta: -3, weight: 9, mood: 'malo',
  },
  {
    id: 'waffle-house', emoji: '🧇', title: 'Descubrieron el Waffle House', titleEn: 'They found the Waffle House',
    text: 'Tu plantel descubrió el Waffle House abierto 24 hs frente al hotel. Cena de campeones a las 3 AM. El nutricionista renunció.',
    textEn: 'Your squad discovered the 24-hour Waffle House across from the hotel. Dinner of champions at 3 AM. The nutritionist resigned.',
    moment: 'previa', ratingDelta: -3, weight: 8, mood: 'malo',
  },
  {
    id: 'jingle', emoji: '🎵', title: 'El jingle maldito', titleEn: 'The cursed jingle',
    text: 'El jingle del sponsor del hydration break suena por 40ª vez. Tus jugadores lo tararean en vez de marcar en los córners.',
    textEn: 'The hydration break sponsor jingle plays for the 40th time. Your players hum it instead of marking at corners.',
    moment: 'partido', ratingDelta: -2, weight: 8, mood: 'malo',
  },

  // ---------- SOLO CONTRA UN RIVAL ESPECÍFICO (vsTeam) ----------
  {
    id: 'furia-vikinga', emoji: '🪓', title: 'Furia vikinga', titleEn: 'Viking fury',
    text: 'Se escucha a la tribuna remar, los noruegos se inspiran te embocan por todos lados',
    textEn: 'You can hear the crowd rowing, the Norwegians get inspired and hit you from everywhere',
    moment: 'partido', ratingDelta: 0, oppGoals: 3, vsTeam: 'NOR', weight: 6, mood: 'malo',
  },
  {
    id: 'la-pulga', emoji: '🐐', title: 'Lo hicieron enojar', titleEn: 'You made him angry',
    text: 'Messi en modo GOAT te mete dos goles no podés hacer nada',
    textEn: 'Messi is in GOAT mode, there in nothing you can do',
    moment: 'partido', ratingDelta: 0, oppGoals: 2, vsTeam: 'ARG', weight: 6, mood: 'malo',
  },
  {
    id: 'jogo-bonito', emoji: '🇧🇷', title: 'Joga bonito', titleEn: 'Joga bonito',
    text: 'Brasil se aburrió de ganar normal y activó el modo exhibición: lambretas, sombreritos y tu lateral pidiendo el cambio por mareos.',
    textEn: 'Brazil got bored of winning normally and switched to exhibition mode: rainbow flicks, sombreros, and your fullback asking to be subbed off with dizziness.',
    moment: 'partido', ratingDelta: -5, vsTeam: 'BRA', weight: 6, mood: 'malo',
  },

  // ---------- NEUTROS ----------
  {
    id: 'var-altoparlante', emoji: '📢', title: 'El árbitro explica el VAR', titleEn: 'The ref explains VAR',
    text: 'El árbitro anuncia la decisión del VAR por altoparlante al estadio. Nadie entiende nada. Internet ya hizo 200 subtítulos falsos.',
    textEn: 'The referee announces the VAR decision over the stadium PA. Nobody understands a word. The internet has already made 200 fake subtitles.',
    moment: 'partido', ratingDelta: 0, weight: 8, mood: 'neutro',
  },
  {
    id: 'tv-publicidad', emoji: '📡', title: 'La TV se fue a publicidad', titleEn: 'TV cut to ads',
    text: 'La transmisión oficial se fue a publicidad y se perdió un gol en vivo. Vuelven con la repetición y cara de nada.',
    textEn: 'The official broadcast cut to ads and missed a live goal. They come back with the replay and a straight face.',
    moment: 'partido', ratingDelta: 0, weight: 7, mood: 'neutro',
  },
  {
    id: 'mascota', emoji: '🦝', title: 'Invasión de mascota', titleEn: 'Mascot pitch invasion',
    text: 'La mascota oficial invade la cancha perseguida por seis de seguridad. Cinco minutos de show. El partido sigue como si nada.',
    textEn: 'The official mascot invades the pitch chased by six security guards. Five minutes of show. The match resumes like nothing happened.',
    moment: 'partido', ratingDelta: 0, weight: 7, mood: 'neutro',
  },
  {
    id: 'drone', emoji: '🚁', title: 'Drone bajo', titleEn: 'Low-flying drone',
    text: 'El drone de la transmisión baja tanto que tu arquero lo cabecea. La FIFA abre un expediente.',
    textEn: 'The broadcast drone flies so low your keeper heads it away. FIFA opens disciplinary proceedings.',
    moment: 'partido', ratingDelta: 0, weight: 15, mood: 'neutro',
  },

  // ---------- BUENOS (raros, para que no sea imposible) ----------
  {
    id: 'hockey-motivacion', emoji: '🏒', title: 'Motivación inesperada', titleEn: 'Unexpected motivation',
    text: '{jugador} fue anoche a ver la final de la NHL como Haaland, salió en la pantalla gigante y hoy juega on fire.',
    textEn: '{jugador} went to the NHL finals last night like Haaland, showed up on the jumbotron, and today he\'s on fire.',
    moment: 'previa', ratingDelta: 3, weight: 1, mood: 'bueno', affects: 'star',
  },
  {
    id: 'hinchadas-amigas', emoji: '🤝', title: 'Hinchadas hermanadas', titleEn: 'Brotherhood of fans',
    text: 'Tu hinchada se hizo amiga de la local. Cantan juntos desde la previa y tu equipo juega como local.',
    textEn: 'Your fans befriended the locals. They\'ve been singing together since the pre-game and your team plays like it\'s home turf.',
    moment: 'previa', ratingDelta: 2, weight: 16, mood: 'bueno',
  },
  {
    id: 'karma-basura', emoji: '🧹', title: 'Karma positivo', titleEn: 'Good karma',
    text: 'Tus hinchas se quedaron juntando la basura del estadio en el partido pasado, como los japoneses. El karma existe y hoy juega de tu lado.',
    textEn: 'Your fans stayed behind picking up stadium trash last match, like the Japanese. Karma is real and today it plays for your team.',
    moment: 'previa', ratingDelta: 3, weight: 4, mood: 'bueno',
  },
  {
    id: 'famoso-fan', emoji: '🎤', title: 'Fan famoso', titleEn: 'Celebrity fan',
    text: 'Una leyenda del rock canceló su show "por laringitis" y apareció en tu tribuna. El plantel se agranda.',
    textEn: 'A rock legend cancelled his show "due to laryngitis" and showed up in your stands. The squad grows two sizes.',
    moment: 'previa', ratingDelta: 2, weight: 4, mood: 'bueno',
  },
  {
    id: 'famoso-piedra', emoji: '🎤', title: 'Famoso drapie', titleEn: 'Bad luck celebrity',
    text: 'Un famoso conocido por ser mufa, aparece en el estadio con la camiseta de tu rival.',
    textEn: 'A famous guy known for bringing bad luck shows up at the stadium wearing your rival\’s jersey.',
    moment: 'previa', ratingDelta: 18, weight: 20, mood: 'bueno',
  },
  {
    id: 'gol invalido', emoji: '🎤', title: 'Gol invalido', titleEn: 'Not Valid Goal',
    text: 'Te meten un gol la moral cae al piso, el VAR descubre una falta en el incio de la jugada se revierte el gol',
    textEn: 'You concede a goal and morale drops to the floor, the VAR finds a foul at the start of the play and the goal gets overturned',
    moment: 'partido', ratingDelta: 7,  oppGoals: -1, weight: 10, mood: 'bueno',
  },
  {
    id: 'papelito', emoji: '🎤', title: 'Maldición del Papelito', titleEn: 'Paper Curse',
    text: 'Millones de personas que te bancan, hacen la macumba de poner en el freezer al arquero rival',
    textEn: 'Millions of people who have your back perform the curse of putting the rival goalkeeper in the freezer',
    moment: 'previa', ratingDelta: 1, yourGoals: 3, weight: 12, mood: 'bueno',
  },
  {
    id: 'santa-popular', emoji: '🙏', title: 'Peregrinación presidencial', titleEn: 'Presidential pilgrimage',
    text: 'El presidente de tu federación peregrina de rodillas hasta el templo de una santa popular. La épica baja del cielo directo a los botines de tu equipo.',
    textEn: 'Your federation president crawls on his knees to the shrine of a folk saint. Pure epic descends from heaven straight into your team\'s boots.',
    moment: 'previa', ratingDelta: 0, yourGoals: 3, weight: 6, mood: 'bueno',
  },
  {
    id: 'cable', emoji: '🪢', title: 'El cable amigo', titleEn: 'The friendly cable',
    text: 'El rival saca del fondo, la pelota pega en el cable de la cámara aérea y te queda servida para un contraataque que termina en gol. La FIFA dice que no vio nada.',
    textEn: 'The rivals play it out from the back, the ball hits the spider-cam cable and drops perfectly for a counter that ends in a goal. FIFA says it saw nothing.',
    moment: 'partido', ratingDelta: 0, yourGoals: 1, weight: 8, mood: 'bueno',
  },
]

import { weightedPick } from '../lib/rand'
import { CONFIG } from './config'

// Devuelve UN evento (o ninguno, según CONFIG.eventChance) respetando los pesos.
// Solo considera eventos válidos contra ese rival y en esa instancia.
export function rollEvent(
  oppId: string,
  stage: EventStage,
  rnd: () => number = Math.random,
): MatchEvent | null {
  if (rnd() >= CONFIG.eventChance) return null
  const pool = EVENTS.filter(e =>
    (!e.vsTeam || e.vsTeam === oppId) && (!e.stage || e.stage === stage),
  )
  return weightedPick(pool, e => e.weight, rnd)
}
