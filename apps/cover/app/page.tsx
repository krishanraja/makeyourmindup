import Edition from '@/components/edition/Edition'
import { loadEdition, fixturePieces } from '@/lib/hub'
import { latestPosts, postKey } from '@/lib/rss'

import { pageMeta, publication } from '@/lib/discovery'
import { SITE } from '@/lib/content'
import { latestLead } from '@/lib/published'

export const revalidate = 900

export async function generateMetadata() {
  const lead = await latestLead()
  const version = '?v=' + (lead ? encodeURIComponent(lead.date + '-' + lead.story.item.id) : 'brand')
  return pageMeta('/', SITE.meta.title, SITE.meta.description, '/opengraph-image' + version,
    lead?.story.item.headline || publication + '. Creativity, AI and money, simplified.', '/twitter-image' + version)
}

// The homepage always shows an edition: the latest published one, or the dated fallback edition when the hub has none
// (it is labelled with its own date). The fallback never links to a dated page, because it has none.
export default async function Page() {
  const [edition, posts] = await Promise.all([loadEdition(), latestPosts(3).catch(() => [])])
  const catalogue = new Map(edition.snapshot.pieces.map((p) => [postKey(p.link), p]))
  const pieces = posts.length
    ? posts.map((p) => {
        const match = catalogue.get(postKey(p.link))
        return {
          ...p,
          series: p.series || match?.series,
          image: edition.isFixture && match?.image ? match.image : p.image || match?.image,
        }
      })
    : edition.snapshot.pieces.length
      ? edition.snapshot.pieces
      : fixturePieces
  return <Edition {...edition} pieces={pieces} />
}
