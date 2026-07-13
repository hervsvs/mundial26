import { teamById } from '../data/teams'
import { YOUR_ID, type Standing } from '../engine/tournament'
import { T, teamName, type Lang } from '../i18n'
import { Flag } from './Flag'

export function StandingsTable({ standings, countryName, lang }: {
  standings: Standing[]
  countryName: string
  lang: Lang
}) {
  // Encabezados: PJ G E P Pts DG (en inglés: P W D L Pts GD)
  const head = lang === 'en'
    ? ['P', 'W', 'D', 'L', 'Pts', 'GD']
    : ['PJ', 'G', 'E', 'P', 'Pts', 'DG']

  return (
    <table className="standings">
      <thead>
        <tr>
          <th></th><th className="tl">{T[lang].team}</th>
          {head.map(h => <th key={h}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {standings.map((s, i) => (
          <tr key={s.teamId} className={s.teamId === YOUR_ID ? 'you-row' : ''}>
            <td>{i + 1}</td>
            <td className="tl">
              {s.teamId === YOUR_ID
                ? <>⭐ {countryName}</>
                : <><Flag team={teamById(s.teamId)} size="sm" /> {teamName(teamById(s.teamId), lang)}</>}
            </td>
            <td>{s.played}</td>
            <td>{s.won ?? 0}</td>
            <td>{s.drawn ?? 0}</td>
            <td>{s.lost ?? 0}</td>
            <td><strong>{s.pts}</strong></td>
            <td>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
