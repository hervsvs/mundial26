// ============================================================
// BASE DE JUGADORES — 6 figuras por selección
//
// Formato: [nombre, posición, overall]
//   posición: 'PT' arquero | 'DF' defensor | 'MC' mediocampista | 'DL' delantero
//   overall: 1-99 (calibrado a ratings públicos tipo FIFA/SoFIFA + rendimiento 2026)
//
// Las 6 stats del radar (RIT, TIR, PAS, REG, DEF, FIS) se derivan
// automáticamente del overall + posición con una semilla por nombre,
// así solo tenés que editar UN número por jugador.
// ============================================================

export type Pos = 'PT' | 'DF' | 'MC' | 'DL'

export interface PlayerStats {
  rit: number // ritmo
  tir: number // tiro
  pas: number // pase
  reg: number // regate
  def: number // defensa
  fis: number // físico
}

export interface Player {
  id: string
  name: string
  teamId: string
  pos: Pos
  ovr: number
  stats: PlayerStats
}

type Row = [string, Pos, number]

const SQUADS: Record<string, Row[]> = {
  MEX: [
    ['Luis Malagón', 'PT', 80], ['Edson Álvarez', 'MC', 83], ['Johan Vásquez', 'DF', 80],
    ['Hirving Lozano', 'DL', 81], ['Santiago Giménez', 'DL', 82], ['Raúl Jiménez', 'DL', 80],
  ],
  RSA: [
    ['Ronwen Williams', 'PT', 79], ['Percy Tau', 'DL', 77], ['Themba Zwane', 'MC', 75],
    ['Teboho Mokoena', 'MC', 76], ['Lyle Foster', 'DL', 76], ['Aubrey Modiba', 'DF', 73],
  ],
  KOR: [
    ['Son Heung-min', 'DL', 86], ['Lee Kang-in', 'MC', 83], ['Kim Min-jae', 'DF', 85],
    ['Hwang Hee-chan', 'DL', 80], ['Lee Jae-sung', 'MC', 78], ['Jo Hyeon-woo', 'PT', 79],
  ],
  CZE: [
    ['Patrik Schick', 'DL', 83], ['Tomáš Souček', 'MC', 79], ['Adam Hložek', 'DL', 78],
    ['Vladimír Coufal', 'DF', 76], ['Antonín Kinský', 'PT', 77], ['Lukáš Provod', 'MC', 76],
  ],
  SUI: [
    ['Granit Xhaka', 'MC', 84], ['Manuel Akanji', 'DF', 84], ['Yann Sommer', 'PT', 84],
    ['Breel Embolo', 'DL', 79], ['Dan Ndoye', 'DL', 79], ['Remo Freuler', 'MC', 78],
  ],
  CAN: [
    ['Alphonso Davies', 'DF', 86], ['Jonathan David', 'DL', 84], ['Tajon Buchanan', 'DL', 78],
    ['Stephen Eustáquio', 'MC', 78], ['Moïse Bombito', 'DF', 76], ['Maxime Crépeau', 'PT', 76],
  ],
  BIH: [
    ['Edin Džeko', 'DL', 79], ['Ermedin Demirović', 'DL', 79], ['Sead Kolašinac', 'DF', 77],
    ['Nikola Vasilj', 'PT', 76], ['Amir Hadžiahmetović', 'MC', 74], ['Benjamin Tahirović', 'MC', 74],
  ],
  QAT: [
    ['Akram Afif', 'DL', 79], ['Almoez Ali', 'DL', 77], ['Hassan Al-Haydos', 'MC', 74],
    ['Meshaal Barsham', 'PT', 74], ['Bassam Al-Rawi', 'DF', 72], ['Mostafa Meshaal', 'MC', 71],
  ],
  BRA: [
    ['Vinícius Jr', 'DL', 91], ['Raphinha', 'DL', 88], ['Rodrygo', 'DL', 87],
    ['Alisson', 'PT', 88], ['Marquinhos', 'DF', 86], ['Bruno Guimarães', 'MC', 86],
  ],
  MAR: [
    ['Achraf Hakimi', 'DF', 89], ['Brahim Díaz', 'DL', 84], ['Yassine Bounou', 'PT', 85],
    ['Nayef Aguerd', 'DF', 82], ['Youssef En-Nesyri', 'DL', 81], ['Azzedine Ounahi', 'MC', 80],
  ],
  SCO: [
    ['Scott McTominay', 'MC', 83], ['Andy Robertson', 'DF', 82], ['John McGinn', 'MC', 80],
    ['Billy Gilmour', 'MC', 78], ['Che Adams', 'DL', 76], ['Angus Gunn', 'PT', 75],
  ],
  HAI: [
    ['Danley Jean Jacques', 'MC', 72], ['Frantzdy Pierrot', 'DL', 71], ['Duckens Nazon', 'DL', 70],
    ['Johnny Placide', 'PT', 70], ['Derrick Etienne', 'DL', 69], ['Carlens Arcus', 'DF', 67],
  ],
  USA: [
    ['Christian Pulisic', 'DL', 86], ['Antonee Robinson', 'DF', 82], ['Weston McKennie', 'MC', 81],
    ['Tyler Adams', 'MC', 80], ['Folarin Balogun', 'DL', 79], ['Matt Turner', 'PT', 78],
  ],
  AUS: [
    ['Mathew Ryan', 'PT', 77], ['Jackson Irvine', 'MC', 76], ['Harry Souttar', 'DF', 76],
    ['Riley McGree', 'MC', 75], ['Craig Goodwin', 'DL', 74], ['Mitchell Duke', 'DL', 72],
  ],
  PAR: [
    ['Gustavo Gómez', 'DF', 80], ['Julio Enciso', 'DL', 79], ['Miguel Almirón', 'DL', 78],
    ['Antonio Sanabria', 'DL', 76], ['Andrés Cubas', 'MC', 76], ['Roberto Fernández', 'PT', 74],
  ],
  TUR: [
    ['Arda Güler', 'MC', 86], ['Hakan Çalhanoğlu', 'MC', 85], ['Kenan Yıldız', 'DL', 85],
    ['Ferdi Kadıoğlu', 'DF', 80], ['Merih Demiral', 'DF', 79], ['Uğurcan Çakır', 'PT', 79],
  ],
  GER: [
    ['Jamal Musiala', 'MC', 89], ['Florian Wirtz', 'MC', 89], ['Joshua Kimmich', 'MC', 86],
    ['Marc ter Stegen', 'PT', 86], ['Antonio Rüdiger', 'DF', 85], ['Kai Havertz', 'DL', 84],
  ],
  CIV: [
    ['Franck Kessié', 'MC', 79], ['Simon Adingra', 'DL', 78], ['Odilon Kossounou', 'DF', 78],
    ['Seko Fofana', 'MC', 78], ['Sébastien Haller', 'DL', 77], ['Yahia Fofana', 'PT', 75],
  ],
  ECU: [
    ['Moisés Caicedo', 'MC', 87], ['Piero Hincapié', 'DF', 83], ['Pervis Estupiñán', 'DF', 81],
    ['Kendry Páez', 'MC', 79], ['Enner Valencia', 'DL', 76], ['Hernán Galíndez', 'PT', 74],
  ],
  CUW: [
    ['Juninho Bacuna', 'MC', 73], ['Leandro Bacuna', 'MC', 72], ['Tahith Chong', 'DL', 72],
    ['Eloy Room', 'PT', 72], ['Kenji Gorré', 'DL', 68], ['Rangelo Janga', 'DL', 68],
  ],
  NED: [
    ['Virgil van Dijk', 'DF', 89], ['Frenkie de Jong', 'MC', 87], ['Cody Gakpo', 'DL', 85],
    ['Xavi Simons', 'MC', 84], ['Memphis Depay', 'DL', 82], ['Bart Verbruggen', 'PT', 82],
  ],
  JPN: [
    ['Takefusa Kubo', 'DL', 84], ['Kaoru Mitoma', 'DL', 84], ['Ritsu Doan', 'DL', 81],
    ['Wataru Endo', 'MC', 80], ['Takehiro Tomiyasu', 'DF', 80], ['Zion Suzuki', 'PT', 78],
  ],
  SWE: [
    ['Alexander Isak', 'DL', 89], ['Viktor Gyökeres', 'DL', 88], ['Dejan Kulusevski', 'MC', 83],
    ['Lucas Bergvall', 'MC', 79], ['Victor Lindelöf', 'DF', 76], ['Robin Olsen', 'PT', 75],
  ],
  TUN: [
    ['Ellyes Skhiri', 'MC', 77], ['Hannibal Mejbri', 'MC', 76], ['Aïssa Laïdouni', 'MC', 76],
    ['Montassar Talbi', 'DF', 75], ['Youssef Msakni', 'DL', 74], ['Aymen Dahmen', 'PT', 73],
  ],
  BEL: [
    ['Thibaut Courtois', 'PT', 89], ['Kevin De Bruyne', 'MC', 87], ['Jérémy Doku', 'DL', 85],
    ['Romelu Lukaku', 'DL', 84], ['Amadou Onana', 'MC', 81], ['Arthur Theate', 'DF', 78],
  ],
  EGY: [
    ['Mohamed Salah', 'DL', 89], ['Omar Marmoush', 'DL', 84], ['Mohamed El-Shenawy', 'PT', 77],
    ['Zizo', 'MC', 77], ['Trezeguet', 'DL', 76], ['Marwan Attia', 'MC', 74],
  ],
  IRN: [
    ['Mehdi Taremi', 'DL', 80], ['Sardar Azmoun', 'DL', 77], ['Alireza Beiranvand', 'PT', 76],
    ['Alireza Jahanbakhsh', 'DL', 75], ['Saeid Ezatolahi', 'MC', 74], ['Mohammad Mohebi', 'DL', 73],
  ],
  NZL: [
    ['Chris Wood', 'DL', 79], ['Liberato Cacace', 'DF', 73], ['Marko Stamenic', 'MC', 72],
    ['Matt Garbett', 'MC', 70], ['Sarpreet Singh', 'MC', 70], ['Max Crocombe', 'PT', 68],
  ],
  ESP: [
    ['Lamine Yamal', 'DL', 93], ['Rodri', 'MC', 91], ['Pedri', 'MC', 90],
    ['Nico Williams', 'DL', 87], ['Unai Simón', 'PT', 84], ['Robin Le Normand', 'DF', 84],
  ],
  CPV: [
    ['Logan Costa', 'DF', 76], ['Ryan Mendes', 'DL', 77], ['Jamiro Monteiro', 'MC', 78],
    ['Bebé', 'DL', 76], ['Vozinha', 'PT', 82], ['Kevin Pina', 'MC', 69],
  ],
  URU: [
    ['Federico Valverde', 'MC', 89], ['Darwin Núñez', 'DL', 84], ['Ronald Araújo', 'DF', 84],
    ['Rodrigo Bentancur', 'MC', 82], ['Sergio Rochet', 'PT', 79], ['Facundo Pellistri', 'DL', 78],
  ],
  KSA: [
    ['Salem Al-Dawsari', 'DL', 78], ['Firas Al-Buraikan', 'DL', 74], ['Mohammed Kanno', 'MC', 74],
    ['Mohammed Al-Owais', 'PT', 74], ['Musab Al-Juwayr', 'MC', 73], ['Saud Abdulhamid', 'DF', 72],
  ],
  FRA: [
    ['Kylian Mbappé', 'DL', 94], ['Ousmane Dembélé', 'DL', 90], ['William Saliba', 'DF', 87],
    ['Michael Olise', 'DL', 87], ['Aurélien Tchouaméni', 'MC', 86], ['Mike Maignan', 'PT', 86],
  ],
  NOR: [
    ['Erling Haaland', 'DL', 93], ['Martin Ødegaard', 'MC', 87], ['Antonio Nusa', 'DL', 81],
    ['Alexander Sørloth', 'DL', 81], ['Kristoffer Ajer', 'DF', 76], ['Ørjan Nyland', 'PT', 74],
  ],
  SEN: [
    ['Sadio Mané', 'DL', 82], ['Pape Matar Sarr', 'MC', 81], ['Nicolas Jackson', 'DL', 80],
    ['Édouard Mendy', 'PT', 80], ['Ismaïla Sarr', 'DL', 79], ['Kalidou Koulibaly', 'DF', 79],
  ],
  IRQ: [
    ['Ali Al-Hamadi', 'DL', 72], ['Aymen Hussein', 'DL', 72], ['Zidane Iqbal', 'MC', 71],
    ['Amir Al-Ammari', 'MC', 69], ['Jalal Hassan', 'PT', 68], ['Merchas Doski', 'DF', 68],
  ],
  ARG: [
    ['Lionel Messi', 'DL', 95], ['Julián Álvarez', 'DL', 89], ['Lautaro Martínez', 'DL', 87],
    ['Enzo Fernández', 'MC', 87], ['Emiliano Martínez', 'PT', 87], ['Cuti Romero', 'DF', 86],
  ],
  AUT: [
    ['David Alaba', 'DF', 82], ['Christoph Baumgartner', 'MC', 81], ['Marcel Sabitzer', 'MC', 80],
    ['Konrad Laimer', 'MC', 80], ['Marko Arnautović', 'DL', 76], ['Patrick Pentz', 'PT', 75],
  ],
  ALG: [
    ['Riyad Mahrez', 'DL', 81], ['Rayan Aït-Nouri', 'DF', 81], ['Amine Gouiri', 'DL', 80],
    ['Ismaël Bennacer', 'MC', 79], ['Houssem Aouar', 'MC', 78], ['Alexis Guendouz', 'PT', 72],
  ],
  JOR: [
    ['Musa Al-Taamari', 'DL', 76], ['Yazan Al-Naimat', 'DL', 72], ['Ali Olwan', 'DL', 71],
    ['Noor Al-Rawabdeh', 'MC', 70], ['Yazeed Abulaila', 'PT', 69], ['Abdallah Nasib', 'DF', 68],
  ],
  COL: [
    ['Luis Díaz', 'DL', 88], ['Jhon Durán', 'DL', 82], ['James Rodríguez', 'MC', 81],
    ['Richard Ríos', 'MC', 80], ['Davinson Sánchez', 'DF', 79], ['Camilo Vargas', 'PT', 78],
  ],
  POR: [
    ['Bruno Fernandes', 'MC', 88], ['Vitinha', 'MC', 87], ['Rúben Dias', 'DF', 87],
    ['Rafael Leão', 'DL', 86], ['Cristiano Ronaldo', 'DL', 86], ['Diogo Costa', 'PT', 85],
  ],
  COD: [
    ['Yoane Wissa', 'DL', 78], ['Chancel Mbemba', 'DF', 76], ['Cédric Bakambu', 'DL', 74],
    ['Silas Katompa', 'DL', 74], ['Théo Bongonda', 'DL', 73], ['Lionel Mpasi', 'PT', 71],
  ],
  UZB: [
    ['Abdukodir Khusanov', 'DF', 79], ['Abbosbek Fayzullaev', 'MC', 76], ['Eldor Shomurodov', 'DL', 75],
    ['Otabek Shukurov', 'MC', 71], ['Jaloliddin Masharipov', 'DL', 71], ['Utkir Yusupov', 'PT', 69],
  ],
  ENG: [
    ['Jude Bellingham', 'MC', 91], ['Harry Kane', 'DL', 90], ['Bukayo Saka', 'DL', 89],
    ['Cole Palmer', 'MC', 88], ['Declan Rice', 'MC', 87], ['Jordan Pickford', 'PT', 83],
  ],
  CRO: [
    ['Joško Gvardiol', 'DF', 86], ['Luka Modrić', 'MC', 84], ['Mateo Kovačić', 'MC', 82],
    ['Dominik Livaković', 'PT', 81], ['Andrej Kramarić', 'DL', 79], ['Josip Šutalo', 'DF', 77],
  ],
  GHA: [
    ['Mohammed Kudus', 'MC', 84], ['Antoine Semenyo', 'DL', 82], ['Thomas Partey', 'MC', 79],
    ['Iñaki Williams', 'DL', 79], ['Alexander Djiku', 'DF', 75], ['Lawrence Ati-Zigi', 'PT', 73],
  ],
  PAN: [
    ['Adalberto Carrasquilla', 'MC', 76], ['Michael Amir Murillo', 'DF', 75], ['Ismael Díaz', 'DL', 73],
    ['José Fajardo', 'DL', 71], ['Aníbal Godoy', 'MC', 71], ['Orlando Mosquera', 'PT', 71],
  ],
}

// ---- Derivación de stats del radar --------------------------
// Perfil por posición: cuánto se desvía cada stat respecto del overall.
const POS_PROFILE: Record<Pos, [number, number, number, number, number, number]> = {
  //          RIT  TIR  PAS  REG  DEF  FIS
  PT: [-18, -25, -10, -20, +2, +4],
  DF: [-2, -12, -4, -8, +7, +6],
  MC: [-2, -4, +6, +3, -4, 0],
  DL: [+6, +7, -3, +5, -20, +1],
}

// Semilla determinística por nombre para que cada jugador tenga un radar propio
function seedFrom(name: string): () => number {
  let h = 2166136261
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5
    return ((h >>> 0) % 1000) / 1000
  }
}

const clamp = (n: number) => Math.max(30, Math.min(99, Math.round(n)))

export function deriveStats(name: string, pos: Pos, ovr: number): PlayerStats {
  const rnd = seedFrom(name)
  const p = POS_PROFILE[pos]
  const jitter = () => (rnd() - 0.5) * 8
  return {
    rit: clamp(ovr + p[0] + jitter()),
    tir: clamp(ovr + p[1] + jitter()),
    pas: clamp(ovr + p[2] + jitter()),
    reg: clamp(ovr + p[3] + jitter()),
    def: clamp(ovr + p[4] + jitter()),
    fis: clamp(ovr + p[5] + jitter()),
  }
}

export const PLAYERS: Player[] = Object.entries(SQUADS).flatMap(([teamId, rows]) =>
  rows.map(([name, pos, ovr], i) => ({
    id: `${teamId}-${i}`,
    name,
    teamId,
    pos,
    ovr,
    stats: deriveStats(name, pos, ovr),
  })),
)

export const playersOf = (teamId: string): Player[] =>
  PLAYERS.filter(p => p.teamId === teamId)
