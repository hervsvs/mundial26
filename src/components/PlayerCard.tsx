import type { Player } from '../data/players'
import { teamById } from '../data/teams'
import { POS_LABEL, RADAR_AXES, T, type Lang } from '../i18n'
import { Flag } from './Flag'
import { Radar } from './Radar'

export function PlayerCard({
  player, lang, onPick, picked, compact,
}: {
  player: Player
  lang: Lang
  onPick?: () => void
  picked?: boolean
  compact?: boolean
}) {
  const team = player.teamId !== 'YOU' ? teamById(player.teamId) : null
  const ovrClass = player.ovr >= 85 ? 'ovr-elite' : player.ovr >= 75 ? 'ovr-good' : 'ovr-meh'

  return (
    <div className={`player-card ${picked ? 'picked' : ''} ${onPick ? 'pickable' : ''}`}
      onClick={picked ? undefined : onPick}>
      <div className="player-card-top">
        <span className={`ovr ${ovrClass}`}>{player.ovr}</span>
        <div className="player-name">
          <strong>{player.name}</strong>
          <small>{POS_LABEL[lang][player.pos]}{team && <> · <Flag team={team} size="sm" /></>}</small>
        </div>
      </div>
      {!compact && <Radar stats={player.stats} labels={RADAR_AXES[lang]} />}
      {picked && <div className="picked-badge">{T[lang].alreadyStolen}</div>}
    </div>
  )
}
