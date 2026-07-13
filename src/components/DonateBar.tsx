import { CONFIG } from '../data/config'
import { T, type Lang } from '../i18n'

export function DonateBar({ lang }: { lang: Lang }) {
  const links = CONFIG.donations.filter(d => d.url)
  if (!links.length) return null
  return (
    <div className="donate-bar">
      <span>{T[lang].donate}</span>
      <div className="donate-links">
        {links.map(d => (
          <a key={d.name} href={d.url} target="_blank" rel="noreferrer" className="donate-link">
            {d.emoji} {d.name}
          </a>
        ))}
      </div>
    </div>
  )
}
