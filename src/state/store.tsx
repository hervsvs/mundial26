// ============================================================
// ESTADO GLOBAL DEL JUEGO + persistencia en localStorage
// (sin login: el nombre de tu país, idioma y estadísticas quedan
// guardados en el navegador)
// ============================================================

import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { CONFIG } from '../data/config'
import { GROUPS, TEAMS, teamById } from '../data/teams'
import { PLAYERS, playersOf, type Player } from '../data/players'
import { generateRecruits, type Recruit } from '../data/recruits'
import type { MatchEvent } from '../data/events'
import { DEFAULT_FORMATION } from '../data/formations'
import { rollWildcard, wildcardById } from '../data/wildcards'
import { simulateMatch, type MatchScore } from '../engine/sim'
import { buildLineup } from '../engine/lineup'
import {
  YOUR_ID, buildBracket, computeStandings, groupFixtures, groupTeamIds,
  qualifiers, simulateKoRound, simulateOtherGroup,
  KO_ROUNDS, type GroupResult, type PlayedMatch,
} from '../engine/tournament'
import { weightedPick } from '../lib/rand'
import { trackRunEnd } from '../lib/analytics'
import type { Lang } from '../i18n'

export type Phase = 'start' | 'draw' | 'heist' | 'recruit' | 'lineup' | 'group' | 'groupEnd' | 'knockout' | 'end'

// Orden de prestigio: perder la semi y el 3er puesto = 4º; ganar el 3er
// puesto = 3º; perder la final = subcampeón; ganar la final = campeón.
export const STAGES = ['Grupos', '16avos', 'Octavos', 'Cuartos', 'Semifinal', '3er Puesto', 'Final', 'Campeón'] as const
export type Stage = (typeof STAGES)[number]

export interface HistoryEntry {
  label: string
  oppId: string
  yourGoals: number
  oppGoals: number
  pens?: string
  eventId: string // '' si no hubo evento
  outcome: 'G' | 'E' | 'P'
}

export interface QualifiedInfo {
  qualified: boolean
  position: number // 1..4 en tu grupo
  asThird: boolean
}

export interface RunState {
  phase: Phase
  group: string
  replacedTeamId: string
  // comodín del torneo (uno por corrida, un solo uso)
  wildcardId: string
  wildcardUsed: boolean
  wildcardArmed: boolean // activado para el próximo partido
  // nombre del jugador robado / anulado por el comodín (para mostrarlo)
  wildcardNote: string | null
  // robo de jugadores
  heistRollsLeft: number
  heistTeamId: string | null
  picks: Player[]
  // reclutas
  recruits: Recruit[]
  squad: Player[]
  // formación elegida (ej: '4-4-2')
  formation: string
  // fase de grupos
  matchday: number // 0,1,2 → próximo por jugar; 3 = terminó
  groupMatches: PlayedMatch[]
  qualifiedInfo: QualifiedInfo | null
  // eliminatorias
  bracket: string[] | null
  koRound: number
  allGroupResults: GroupResult[] | null
  // si perdés la semi, jugás por el tercer puesto contra este equipo
  thirdPlaceOppId: string | null
  // quién salió campeón del mundo (YOUR_ID si fuiste vos); se simula
  // el resto de la llave cuando quedás eliminado, coherente con lo jugado
  worldChampionId: string | null
  // resultado final
  history: HistoryEntry[]
  finalStage: Stage | null
  champion: boolean
}

export interface SavedStats {
  runs: number
  wins: number
  matchesPlayed: number
  bestStage: Stage | null
}

export interface GameState {
  countryName: string
  lang: Lang
  stats: SavedStats
  run: RunState | null
}

const STORAGE_KEY = 'mundial26'

const emptyStats: SavedStats = { runs: 0, wins: 0, matchesPlayed: 0, bestStage: null }

// Renombre de fases (los 32 clasificados juegan DIECISEISAVOS):
// partidas guardadas con los nombres viejos se migran acá
const migrateStage = (s: string | null): Stage | null => {
  if (s === '32avos') return '16avos'
  if (s === '16avos') return 'Octavos'
  return s as Stage | null
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as GameState
      s.lang = s.lang === 'en' ? 'en' : 'es'
      s.stats.bestStage = migrateStage(s.stats.bestStage)
      if (s.run) {
        if (!s.run.formation) s.run.formation = DEFAULT_FORMATION
        if (!s.run.wildcardId) {
          s.run.wildcardId = rollWildcard().id
          s.run.wildcardUsed = false
          s.run.wildcardArmed = false
        }
        if (s.run.wildcardNote === undefined) s.run.wildcardNote = null
        s.run.finalStage = migrateStage(s.run.finalStage)
        if (s.run.qualifiedInfo === undefined) s.run.qualifiedInfo = null
        if (s.run.thirdPlaceOppId === undefined) s.run.thirdPlaceOppId = null
        if (s.run.worldChampionId === undefined) s.run.worldChampionId = null
      }
      return s
    }
  } catch { /* localStorage roto o JSON viejo: arrancamos de cero */ }
  return { countryName: '', lang: 'es', stats: emptyStats, run: null }
}

// ---- Acciones ----------------------------------------------

type Action =
  | { type: 'setCountry'; name: string }
  | { type: 'setLang'; lang: Lang }
  | { type: 'startRun' }
  | { type: 'confirmDraw' } // del sorteo animado al robo
  | { type: 'pickPlayer'; playerId: string }
  | { type: 'acceptRecruits' }
  | { type: 'setFormation'; formation: string }
  | { type: 'useWildcard' } // activa el comodín para el próximo partido
  | { type: 'recordMatch'; event: MatchEvent | null; score: MatchScore }
  | { type: 'continueFromGroup' } // de la pantalla de tabla final a eliminatorias/fin
  | { type: 'closeRun' }

const stageIndex = (s: Stage | null) => (s ? STAGES.indexOf(s) : -1)

// Tirada del robo: ponderada por heistWeight de cada selección (teams.ts)
function randomTeamId(): string {
  return weightedPick(TEAMS, t => t.heistWeight ?? 1).id
}

// Fuerza efectiva: depende del plantel Y de la formación elegida
export const yourEffectiveRating = (run: RunState): number =>
  buildLineup(run.squad, run.formation).rating

// El rival del próximo partido (para el comodín y la UI)
export function currentOpponent(run: RunState): string | null {
  if (run.phase === 'group') {
    const day = groupFixtures(groupTeamIds(run.group, run.group))[run.matchday]
    const m = day?.find(([h, a]) => h === YOUR_ID || a === YOUR_ID)
    if (!m) return null
    return m[0] === YOUR_ID ? m[1] : m[0]
  }
  if (run.phase === 'knockout' && run.bracket) {
    if (run.thirdPlaceOppId) return run.thirdPlaceOppId
    const idx = run.bracket.indexOf(YOUR_ID)
    return run.bracket[idx % 2 === 0 ? idx + 1 : idx - 1]
  }
  return null
}

function endRun(state: GameState, run: RunState, finalStage: Stage): GameState {
  const champion = finalStage === 'Campeón'
  const newRun: RunState = { ...run, phase: 'end', finalStage, champion }
  const stats: SavedStats = {
    runs: state.stats.runs + 1,
    wins: state.stats.wins + (champion ? 1 : 0),
    matchesPlayed: state.stats.matchesPlayed + run.history.length,
    bestStage: stageIndex(finalStage) > stageIndex(state.stats.bestStage) ? finalStage : state.stats.bestStage,
  }
  trackRunEnd({
    country: state.countryName,
    group: run.group,
    stage: finalStage,
    matches: run.history.length,
    champion,
  })
  return { ...state, stats, run: newRun }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'setCountry':
      return { ...state, countryName: action.name.trim() }

    case 'setLang':
      return { ...state, lang: action.lang }

    case 'startRun': {
      // Sorteo de grupo ponderado (pesos en config.ts → groupWeights)
      const group = weightedPick(GROUPS, g => CONFIG.groupWeights[g] ?? 1)
      const ids = groupTeamIds(group, group)
      // el reemplazado es el equipo del grupo original que ya no aparece
      const replaced = groupTeamIds(group, null).find(id => !ids.includes(id))!
      const run: RunState = {
        phase: 'draw',
        group,
        replacedTeamId: replaced,
        wildcardId: rollWildcard().id,
        wildcardUsed: false,
        wildcardArmed: false,
        wildcardNote: null,
        heistRollsLeft: 5,
        heistTeamId: randomTeamId(),
        picks: [],
        recruits: [],
        squad: [],
        formation: DEFAULT_FORMATION,
        matchday: 0,
        groupMatches: [],
        qualifiedInfo: null,
        bracket: null,
        koRound: 0,
        allGroupResults: null,
        thirdPlaceOppId: null,
        worldChampionId: null,
        history: [],
        finalStage: null,
        champion: false,
      }
      return { ...state, run }
    }

    case 'confirmDraw': {
      const run = state.run
      if (!run || run.phase !== 'draw') return state
      return { ...state, run: { ...run, phase: 'heist' } }
    }

    case 'pickPlayer': {
      const run = state.run
      if (!run || run.phase !== 'heist') return state
      const player = PLAYERS.find(p => p.id === action.playerId)
      if (!player || run.picks.some(p => p.id === player.id)) return state
      const picks = [...run.picks, player]
      const rollsLeft = run.heistRollsLeft - 1
      if (rollsLeft > 0) {
        return { ...state, run: { ...run, picks, heistRollsLeft: rollsLeft, heistTeamId: randomTeamId() } }
      }
      // se terminaron las tiradas → generar reclutas de LinkedIn
      const needGk = !picks.some(p => p.pos === 'PT')
      const recruits = generateRecruits(state.countryName, needGk)
      return {
        ...state,
        run: { ...run, picks, heistRollsLeft: 0, heistTeamId: null, recruits, phase: 'recruit' },
      }
    }

    case 'acceptRecruits': {
      const run = state.run
      if (!run || run.phase !== 'recruit') return state
      const squad = [...run.picks, ...run.recruits]
      return { ...state, run: { ...run, squad, phase: 'lineup' } }
    }

    case 'setFormation': {
      const run = state.run
      if (!run) return state
      const phase = run.phase === 'lineup' ? 'group' : run.phase
      return { ...state, run: { ...run, formation: action.formation, phase } }
    }

    case 'useWildcard': {
      const run = state.run
      if (!run || run.wildcardUsed) return state
      if (run.phase !== 'group' && run.phase !== 'knockout') return state
      const wc = wildcardById(run.wildcardId)
      let squad = run.squad
      let wildcardNote: string | null = null
      const oppId = currentOpponent(run)
      const inSquad = new Set(run.squad.map(p => p.id))

      // Robo extra: te llevás al MEJOR jugador disponible del rival de este
      // partido (que no tengas ya) para tu plantel, y se te informa quién es.
      if (wc.special === 'steal' && oppId) {
        const available = playersOf(oppId).filter(p => !inSquad.has(p.id))
        const star = [...available].sort((a, b) => b.ovr - a.ovr)[0]
        if (star) {
          const worstIdx = run.squad.reduce((wi, p, i, arr) => (p.ovr < arr[wi].ovr ? i : wi), 0)
          squad = run.squad.map((p, i) => (i === worstIdx ? star : p))
          wildcardNote = `${star.name} (${star.ovr})`
        }
      }

      // Cazar a la estrella / denuncia de doping: dejan afuera a la FIGURA
      // rival (el mejor de campo disponible); se te informa y no te puede
      // meter gol en el partido.
      if (wc.disablesOppStar && oppId) {
        const candidates = playersOf(oppId).filter(p => p.pos !== 'PT' && !inSquad.has(p.id))
        const star = [...candidates].sort((a, b) => b.ovr - a.ovr)[0]
        if (star) wildcardNote = `${star.name} (${star.ovr})`
      }

      return { ...state, run: { ...run, squad, wildcardNote, wildcardUsed: true, wildcardArmed: true } }
    }

    case 'recordMatch': {
      const run = state.run
      if (!run) return state
      const rating = yourEffectiveRating(run)
      const eventId = action.event?.id ?? ''
      const afterWildcard = { wildcardArmed: false } // el comodín se consume en este partido

      if (run.phase === 'group') {
        const ids = groupTeamIds(run.group, run.group)
        const fixtures = groupFixtures(ids)
        const day = fixtures[run.matchday]
        const newMatches = [...run.groupMatches]
        const history = [...run.history]

        for (const [home, away] of day) {
          if (home === YOUR_ID || away === YOUR_ID) {
            const youHome = home === YOUR_ID
            const score: MatchScore = youHome
              ? action.score
              : { hg: action.score.ag, ag: action.score.hg }
            newMatches.push({ home, away, score })
            const opp = youHome ? away : home
            const yg = action.score.hg
            const og = action.score.ag
            history.push({
              label: `Fecha ${run.matchday + 1}`,
              oppId: opp,
              yourGoals: yg,
              oppGoals: og,
              eventId,
              outcome: yg > og ? 'G' : yg === og ? 'E' : 'P',
            })
          } else {
            const score = simulateMatch(teamById(home).rating, teamById(away).rating, false)
            newMatches.push({ home, away, score })
          }
        }

        const matchday = run.matchday + 1
        if (matchday < 3) {
          return { ...state, run: { ...run, ...afterWildcard, matchday, groupMatches: newMatches, history } }
        }

        // Terminó la fase de grupos: simular el resto del mundial y calcular tu posición
        const allGroupResults: GroupResult[] = GROUPS.map(g => {
          if (g === run.group) {
            return { group: g, standings: computeStandings(ids, newMatches) }
          }
          const matches = simulateOtherGroup(g)
          return { group: g, standings: computeStandings(groupTeamIds(g, null), matches) }
        })

        const { qualified, thirdsQualified } = qualifiers(allGroupResults)
        const myStandings = allGroupResults.find(g => g.group === run.group)!.standings
        const position = myStandings.findIndex(s => s.teamId === YOUR_ID) + 1
        const qualifiedInfo: QualifiedInfo = {
          qualified: qualified.includes(YOUR_ID),
          position,
          asThird: thirdsQualified.has(YOUR_ID),
        }
        // Primero se muestra la tabla final del grupo; después se sigue (o no)
        return {
          ...state,
          run: {
            ...run, ...afterWildcard, matchday, groupMatches: newMatches, history,
            allGroupResults, qualifiedInfo, phase: 'groupEnd',
          },
        }
      }

      if (run.phase === 'knockout' && run.bracket) {
        const isThird = !!run.thirdPlaceOppId
        const idx = run.bracket.indexOf(YOUR_ID)
        const oppId = isThird
          ? run.thirdPlaceOppId!
          : run.bracket[idx % 2 === 0 ? idx + 1 : idx - 1]
        const s = action.score
        const won = s.penalties ? s.penalties.hp > s.penalties.ap : s.hg > s.ag
        const history: HistoryEntry[] = [...run.history, {
          label: isThird ? '3er Puesto' : KO_ROUNDS[run.koRound],
          oppId,
          yourGoals: s.hg,
          oppGoals: s.ag,
          pens: s.penalties ? `${s.penalties.hp}-${s.penalties.ap}` : undefined,
          eventId,
          outcome: won ? 'G' : 'P',
        }]

        // Partido por el tercer puesto: ganás = 3º del mundo, perdés = 4º
        if (isThird) {
          return endRun(state, { ...run, ...afterWildcard, history }, won ? '3er Puesto' : 'Semifinal')
        }

        if (won && run.koRound === 4) {
          return endRun(state, { ...run, ...afterWildcard, history, worldChampionId: YOUR_ID }, 'Campeón')
        }

        if (!won) {
          // Perdiste la final: subcampeón, y el campeón es tu verdugo
          if (run.koRound === 4) {
            return endRun(state, { ...run, ...afterWildcard, history, worldChampionId: oppId }, 'Final')
          }
          // Se simula el resto del torneo (coherente: tu verdugo sigue en la llave)
          const thisRound = simulateKoRound(run.bracket, rating, oppId)
          let winners = thisRound.winners
          // Perdiste la SEMI: jugás el 3er puesto contra el perdedor de la otra semi
          if (run.koRound === 3) {
            const otherLoser = run.bracket.find(id => id !== YOUR_ID && id !== oppId && !winners.includes(id))!
            const finalRound = simulateKoRound(winners, rating, null)
            return {
              ...state,
              run: {
                ...run, ...afterWildcard, history,
                thirdPlaceOppId: otherLoser,
                worldChampionId: finalRound.winners[0],
              },
            }
          }
          while (winners.length > 1) winners = simulateKoRound(winners, rating, null).winners
          return endRun(
            state,
            { ...run, ...afterWildcard, history, worldChampionId: winners[0] },
            KO_ROUNDS[run.koRound] as Stage,
          )
        }

        // Ganaste y no era la final: avanza la llave
        const { winners } = simulateKoRound(run.bracket, rating, YOUR_ID)
        return {
          ...state,
          run: { ...run, ...afterWildcard, history, bracket: winners, koRound: run.koRound + 1 },
        }
      }
      return state
    }

    case 'continueFromGroup': {
      const run = state.run
      if (!run || run.phase !== 'groupEnd' || !run.qualifiedInfo || !run.allGroupResults) return state
      if (!run.qualifiedInfo.qualified) {
        // el mundial sigue sin vos: simulamos la llave para saber el campeón
        let winners = buildBracket(run.allGroupResults, yourEffectiveRating(run))
        while (winners.length > 1) {
          winners = simulateKoRound(winners, yourEffectiveRating(run), null).winners
        }
        return endRun(state, { ...run, worldChampionId: winners[0] }, 'Grupos')
      }
      const bracket = buildBracket(run.allGroupResults, yourEffectiveRating(run))
      return { ...state, run: { ...run, phase: 'knockout', bracket, koRound: 0 } }
    }

    case 'closeRun':
      return { ...state, run: null }

    default:
      return state
  }
}

// ---- Contexto ----------------------------------------------

const GameContext = createContext<{
  state: GameState
  dispatch: (a: Action) => void
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* sin espacio o modo incógnito: seguimos sin persistir */ }
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider')
  return ctx
}

export { YOUR_ID }
