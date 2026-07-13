// ============================================================
// LOS 48 EQUIPOS DEL MUNDIAL 2026 — grupos reales del sorteo
// (post-repechaje, fuente: FIFA/ESPN, marzo 2026)
//
// rating: fuerza general del equipo (estilo ranking FIFA, 60-95).
//   El equipo MÁS DÉBIL de cada grupo es al que reemplazás vos.
// heistWeight: probabilidad relativa de salir en las tiradas del ROBO.
//   Todos arrancan en 1. Ej: heistWeight: 3 → esa selección sale el
//   triple de seguido; heistWeight: 0 → no sale nunca.
// iso: código de bandera (flag-icons). Escocia = gb-sct, Inglaterra = gb-eng.
// ============================================================

export interface Team {
  id: string
  name: string
  nameEn: string
  iso: string
  group: string
  rating: number
  heistWeight: number
}

export const TEAMS: Team[] = [
  // ---- Grupo A ----
  { id: 'MEX', name: 'México', nameEn: 'Mexico', iso: 'mx', group: 'A', rating: 80, heistWeight: 1 },
  { id: 'RSA', name: 'Sudáfrica', nameEn: 'South Africa', iso: 'za', group: 'A', rating: 74, heistWeight: 1 },
  { id: 'KOR', name: 'Corea del Sur', nameEn: 'South Korea', iso: 'kr', group: 'A', rating: 79, heistWeight: 1 },
  { id: 'CZE', name: 'Chequia', nameEn: 'Czechia', iso: 'cz', group: 'A', rating: 78, heistWeight: 1 },
  // ---- Grupo B ----
  { id: 'SUI', name: 'Suiza', nameEn: 'Switzerland', iso: 'ch', group: 'B', rating: 83, heistWeight: 1 },
  { id: 'CAN', name: 'Canadá', nameEn: 'Canada', iso: 'ca', group: 'B', rating: 79, heistWeight: 1 },
  { id: 'BIH', name: 'Bosnia', nameEn: 'Bosnia', iso: 'ba', group: 'B', rating: 76, heistWeight: 1 },
  { id: 'QAT', name: 'Qatar', nameEn: 'Qatar', iso: 'qa', group: 'B', rating: 73, heistWeight: 1 },
  // ---- Grupo C ----
  { id: 'BRA', name: 'Brasil', nameEn: 'Brazil', iso: 'br', group: 'C', rating: 91, heistWeight: 3 },
  { id: 'MAR', name: 'Marruecos', nameEn: 'Morocco', iso: 'ma', group: 'C', rating: 86, heistWeight: 1 },
  { id: 'SCO', name: 'Escocia', nameEn: 'Scotland', iso: 'gb-sct', group: 'C', rating: 78, heistWeight: 1 },
  { id: 'HAI', name: 'Haití', nameEn: 'Haiti', iso: 'ht', group: 'C', rating: 69, heistWeight: 1 },
  // ---- Grupo D ----
  { id: 'USA', name: 'Estados Unidos', nameEn: 'United States', iso: 'us', group: 'D', rating: 82, heistWeight: 1 },
  { id: 'AUS', name: 'Australia', nameEn: 'Australia', iso: 'au', group: 'D', rating: 78, heistWeight: 1 },
  { id: 'PAR', name: 'Paraguay', nameEn: 'Paraguay', iso: 'py', group: 'D', rating: 79, heistWeight: 1 },
  { id: 'TUR', name: 'Turquía', nameEn: 'Türkiye', iso: 'tr', group: 'D', rating: 81, heistWeight: 1 },
  // ---- Grupo E ----
  { id: 'GER', name: 'Alemania', nameEn: 'Germany', iso: 'de', group: 'E', rating: 88, heistWeight: 3 },
  { id: 'CIV', name: 'Costa de Marfil', nameEn: 'Ivory Coast', iso: 'ci', group: 'E', rating: 78, heistWeight: 1 },
  { id: 'ECU', name: 'Ecuador', nameEn: 'Ecuador', iso: 'ec', group: 'E', rating: 82, heistWeight: 1 },
  { id: 'CUW', name: 'Curazao', nameEn: 'Curaçao', iso: 'cw', group: 'E', rating: 70, heistWeight: 1 },
  // ---- Grupo F ----
  { id: 'NED', name: 'Países Bajos', nameEn: 'Netherlands', iso: 'nl', group: 'F', rating: 89, heistWeight: 3 },
  { id: 'JPN', name: 'Japón', nameEn: 'Japan', iso: 'jp', group: 'F', rating: 83, heistWeight: 1 },
  { id: 'SWE', name: 'Suecia', nameEn: 'Sweden', iso: 'se', group: 'F', rating: 78, heistWeight: 1 },
  { id: 'TUN', name: 'Túnez', nameEn: 'Tunisia', iso: 'tn', group: 'F', rating: 76, heistWeight: 1 },
  // ---- Grupo G ----
  { id: 'BEL', name: 'Bélgica', nameEn: 'Belgium', iso: 'be', group: 'G', rating: 87, heistWeight: 4 },
  { id: 'EGY', name: 'Egipto', nameEn: 'Egypt', iso: 'eg', group: 'G', rating: 79, heistWeight: 1 },
  { id: 'IRN', name: 'Irán', nameEn: 'Iran', iso: 'ir', group: 'G', rating: 78, heistWeight: 1 },
  { id: 'NZL', name: 'Nueva Zelanda', nameEn: 'New Zealand', iso: 'nz', group: 'G', rating: 71, heistWeight: 1 },
  // ---- Grupo H ----
  { id: 'ESP', name: 'España', nameEn: 'Spain', iso: 'es', group: 'H', rating: 94, heistWeight: 3 },
  { id: 'CPV', name: 'Cabo Verde', nameEn: 'Cape Verde', iso: 'cv', group: 'H', rating: 72, heistWeight: 3 },
  { id: 'URU', name: 'Uruguay', nameEn: 'Uruguay', iso: 'uy', group: 'H', rating: 85, heistWeight: 1 },
  { id: 'KSA', name: 'Arabia Saudita', nameEn: 'Saudi Arabia', iso: 'sa', group: 'H', rating: 74, heistWeight: 1 },
  // ---- Grupo I ----
  { id: 'FRA', name: 'Francia', nameEn: 'France', iso: 'fr', group: 'I', rating: 93, heistWeight: 2 },
  { id: 'NOR', name: 'Noruega', nameEn: 'Norway', iso: 'no', group: 'I', rating: 84, heistWeight: 1 },
  { id: 'SEN', name: 'Senegal', nameEn: 'Senegal', iso: 'sn', group: 'I', rating: 82, heistWeight: 1 },
  { id: 'IRQ', name: 'Irak', nameEn: 'Iraq', iso: 'iq', group: 'I', rating: 70, heistWeight: 1 },
  // ---- Grupo J ----
  { id: 'ARG', name: 'Argentina', nameEn: 'Argentina', iso: 'ar', group: 'J', rating: 94, heistWeight: 3 },
  { id: 'AUT', name: 'Austria', nameEn: 'Austria', iso: 'at', group: 'J', rating: 82, heistWeight: 1 },
  { id: 'ALG', name: 'Argelia', nameEn: 'Algeria', iso: 'dz', group: 'J', rating: 79, heistWeight: 1 },
  { id: 'JOR', name: 'Jordania', nameEn: 'Jordan', iso: 'jo', group: 'J', rating: 71, heistWeight: 1 },
  // ---- Grupo K ----
  { id: 'COL', name: 'Colombia', nameEn: 'Colombia', iso: 'co', group: 'K', rating: 85, heistWeight: 1 },
  { id: 'POR', name: 'Portugal', nameEn: 'Portugal', iso: 'pt', group: 'K', rating: 91, heistWeight: 3 },
  { id: 'COD', name: 'RD Congo', nameEn: 'DR Congo', iso: 'cd', group: 'K', rating: 74, heistWeight: 1 },
  { id: 'UZB', name: 'Uzbekistán', nameEn: 'Uzbekistan', iso: 'uz', group: 'K', rating: 73, heistWeight: 1 },
  // ---- Grupo L ----
  { id: 'ENG', name: 'Inglaterra', nameEn: 'England', iso: 'gb-eng', group: 'L', rating: 92, heistWeight: 1 },
  { id: 'CRO', name: 'Croacia', nameEn: 'Croatia', iso: 'hr', group: 'L', rating: 85, heistWeight: 3 },
  { id: 'GHA', name: 'Ghana', nameEn: 'Ghana', iso: 'gh', group: 'L', rating: 77, heistWeight: 1 },
  { id: 'PAN', name: 'Panamá', nameEn: 'Panama', iso: 'pa', group: 'L', rating: 74, heistWeight: 1 },
]

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export const teamById = (id: string): Team => TEAMS.find(t => t.id === id)!

export const teamsInGroup = (group: string): Team[] =>
  TEAMS.filter(t => t.group === group)

// El equipo más débil de cada grupo (al que reemplaza el jugador)
export const weakestInGroup = (group: string): Team =>
  teamsInGroup(group).reduce((a, b) => (b.rating < a.rating ? b : a))
