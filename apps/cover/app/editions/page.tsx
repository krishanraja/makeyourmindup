import { SectionPage } from '@/components/edition/SectionPage'
import { editionPath, fullDate } from '@/lib/desks'
import { pageMeta, publication } from '@/lib/discovery'
import { archiveDates } from '@/lib/published'

export const revalidate = 900
export const metadata = pageMeta('/editions', 'Daily edition archive | ' + publication,
  'Browse every published edition of AI news from the creative industries, grouped by month.', '/editions/opengraph-image', 'Edition archive')

export default async function Page() {
  const dates = await archiveDates()
  const months = new Map<string, string[]>()
  for (const date of dates || []) {
    const month = date.slice(0, 7)
    if (!months.has(month)) months.set(month, [])
    months.get(month)!.push(date)
  }
  return <SectionPage title="Edition archive" crumb={{ name: 'Edition archive', path: '/editions' }}>
    {!dates ? <p>The archive is currently unavailable.</p> : !dates.length && <p>No editions have been published.</p>}
    {[...months].map(([month, days]) => <section key={month} className="archive-month">
      <h2>{new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(days[0]))}</h2>
      <ul>{days.map(day => <li key={day}><a href={editionPath(day)}><time dateTime={day}>{fullDate(day)}</time></a></li>)}</ul>
    </section>)}
  </SectionPage>
}
