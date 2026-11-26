import { SectionPage } from '@/components/edition/SectionPage'
import { StoryList } from '@/components/edition/StoryList'
import { MarketTable } from '@/components/edition/MarketTable'
import { deskEdition } from '@/lib/desk-edition'
import { deskKeys, desks } from '@/lib/desks'
import { pageMeta, publication } from '@/lib/discovery'
import { latestEdition } from '@/lib/published'

export const revalidate = 900
export const dynamicParams = false
export const generateStaticParams = () => deskKeys.map(key => ({ desk: desks[key].slug }))

type Props = { params: Promise<{ desk: string }> }
export async function generateMetadata({ params }: Props) {
  const { desk, stories } = await deskEdition((await params).desk)
  const path = '/' + desk.slug
  return pageMeta(path, 'AI in ' + desk.subject + ': news and market moves | ' + publication,
    'Daily reporting on how AI affects ' + desk.beat + ', with source links and listed company prices.',
    path + '/opengraph-image', stories[0]?.item.headline)
}

export default async function Page({ params }: Props) {
  const [{ desk, key, stories, latest }, current] = await Promise.all([deskEdition((await params).desk), latestEdition()])
  const snapshot = current || latest
  const room = snapshot?.subsectors.find(r => r.key === key)
  return <SectionPage title={'AI in ' + desk.subject} crumb={{ name: desk.label, path: '/' + desk.slug }}>
    {room?.line && <p className="section-dek">{room.line}</p>}
    <div className="desk-columns">
      <section><h2>From the last 14 editions</h2>
        {stories.length ? <StoryList stories={stories} /> : <p>No published stories are available for this desk.</p>}
      </section>
      <aside><h2>{desk.label} index</h2>
        {snapshot && room ? <MarketTable index={room.index} asOf={snapshot.ticker.as_of}
          stocks={Object.entries(snapshot.ticker.stocks).filter(([, s]) => s.subsector === key)} />
          : <p>Market data is currently unavailable.</p>}
        <a className="desk-source" href="/creative-24">The Creative 24 index ↗</a>
      </aside>
    </div>
  </SectionPage>
}
