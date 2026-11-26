import Edition from '@/components/edition/Edition'
import { SectionPage } from '@/components/edition/SectionPage'
import { latestEdition } from '@/lib/published'
import { latestPosts, postKey } from '@/lib/rss'

export const revalidate = 900

export default async function Page() {
  const [snapshot, posts] = await Promise.all([latestEdition(), latestPosts(3).catch(() => [])])
  if (!snapshot) return <SectionPage title="The Edition">
    <p>The latest edition is currently unavailable.</p>
    {posts.map(p => <p key={p.link}><a href={p.link}>{p.title}</a></p>)}
  </SectionPage>
  const catalogue = new Map(snapshot.pieces.map(p => [postKey(p.link), p]))
  const pieces = posts.length ? posts.map(p => {
    const match = catalogue.get(postKey(p.link))
    return { ...p, series: p.series || match?.series, image: p.image || match?.image }
  }) : snapshot.pieces
  return <Edition snapshot={snapshot} isFixture={false} pieces={pieces} />
}
