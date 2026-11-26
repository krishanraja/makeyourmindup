import { deskKeys, desks, editionPath, fullDate } from '@/lib/desks'

export function EditionLinks({ date }: { date?: string }) {
  return <nav className="edition-links" aria-label="Explore The Edition">
    {date && <a href={editionPath(date)}>Edition for {fullDate(date)}</a>}
    {deskKeys.map(key => <a key={key} href={'/' + desks[key].slug}>{desks[key].label}</a>)}
    <a href="/creative-24">Creative 24</a>
    <a href="/editions">Edition archive</a>
  </nav>
}
