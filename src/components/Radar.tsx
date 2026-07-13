// Radar hexagonal de habilidades, estilo PES
import type { PlayerStats } from '../data/players'

const KEYS: (keyof PlayerStats)[] = ['rit', 'tir', 'pas', 'reg', 'def', 'fis']
const DEFAULT_LABELS = ['RIT', 'TIR', 'PAS', 'REG', 'DEF', 'FIS']

export function Radar({ stats, size = 140, labels = DEFAULT_LABELS }: {
  stats: PlayerStats
  size?: number
  labels?: readonly string[]
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 18

  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
    const dist = (value / 99) * r
    return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist] as const
  }

  const ring = (frac: number) =>
    KEYS.map((_, i) => point(i, 99 * frac).join(',')).join(' ')

  const shape = KEYS.map((k, i) => point(i, stats[k]).join(',')).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radar">
      {[0.33, 0.66, 1].map(f => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}
      {KEYS.map((_, i) => {
        const [x, y] = point(i, 99)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      })}
      <polygon points={shape} fill="rgba(74,222,128,0.35)" stroke="#4ade80" strokeWidth="2" />
      {KEYS.map((k, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
        const x = cx + Math.cos(angle) * (r + 10)
        const y = cy + Math.sin(angle) * (r + 10)
        return (
          <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#94a3b8" fontWeight="700">
            {labels[i]}
          </text>
        )
      })}
    </svg>
  )
}
