import { CONFIG } from './content'

export type Post = {
  title: string
  link: string
  date: string
  blurb: string
  image?: string
}

function tag(xml: string, name: string) {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(xml)
  if (!m) return ''
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim()
}

function decode(s: string) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/**
 * The newest posts on the Substack, fetched at build and refreshed hourly.
 * Only posts on or after the relaunch date count, so the old voice never
 * reaches the cover. A failed fetch returns nothing and the page shows its
 * designed empty state; on Vercel the last good page keeps serving.
 */
export async function latestPosts(): Promise<Post[]> {
  try {
    const res = await fetch(CONFIG.feedUrl, {
      next: { revalidate: 3600 },
      headers: { 'user-agent': 'makeyourmindup-cover' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    if (!xml.includes('<rss')) return []
    const since = new Date(`${CONFIG.relaunchDate}T00:00:00Z`).getTime()
    const items = xml.split('<item>').slice(1).map(chunk => chunk.split('</item>')[0])
    return items
      .map(item => {
        const enclosure = /<enclosure[^>]*url="([^"]+)"/.exec(item)
        return {
          title: decode(tag(item, 'title')),
          link: decode(tag(item, 'link')),
          date: tag(item, 'pubDate'),
          blurb: decode(tag(item, 'description')),
          image: enclosure ? enclosure[1] : undefined,
        }
      })
      .filter(p => p.title && p.link && new Date(p.date).getTime() >= since)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, CONFIG.latestCount)
  } catch {
    return []
  }
}
