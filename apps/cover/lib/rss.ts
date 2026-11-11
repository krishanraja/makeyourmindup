import { CONFIG } from './content'

export type Video = { url: string; id: string }
export type Post = {
  title: string
  link: string
  date: string
  blurb: string
  /** The post's own cover, as Substack holds it. */
  image?: string
  /** The video's length in seconds, as Substack holds it for a video post. */
  seconds?: number
  /** The piece's 16:9 cut on YouTube, from the content engine's catalogue. */
  video?: Video
  /** The piece's 9:16 cut on YouTube Shorts: always kept apart from the full video. */
  short?: Video
}

/** Raised when no source answered: the page keeps its last good version instead of rendering an empty newsstand. */
export class FeedUnavailable extends Error {}

const UA = { 'user-agent': 'makeyourmindup-cover' }
const https = (u: unknown): u is string => typeof u === 'string' && /^https:\/\/[^\s"<>]+$/.test(u)

/** One address for one post, whatever the casing, query or trailing slash it was recorded with. */
export function postKey(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname.toLowerCase().replace(/^www\./, '')}${u.pathname.replace(/\/+$/, '')}`
  } catch {
    return url
  }
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
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** Posts from Substack's archive, which holds every post's own cover (cover_image). The RSS enclosure does not: since
 *  24 October 2026 every piece goes out as a video post, and a video post's enclosure is its sound file. */
export function readArchive(raw: unknown): Post[] {
  const list = Array.isArray(raw) ? raw : (raw as { posts?: unknown })?.posts
  if (!Array.isArray(list)) throw new Error('archive: not a list of posts')
  return list.flatMap((p: Record<string, unknown>) => {
    const link = p.canonical_url, date = p.post_date
    if (!https(link) || typeof p.title !== 'string' || typeof date !== 'string' || Number.isNaN(Date.parse(date))) return []
    const blurb = [p.subtitle, p.description].find(s => typeof s === 'string' && s.trim()) as string | undefined
    const seconds = typeof p.podcast_duration === 'number' && p.podcast_duration > 0 ? Math.round(p.podcast_duration) : undefined
    return [{ title: p.title.trim(), link, date, blurb: (blurb || '').trim(), image: https(p.cover_image) ? p.cover_image : undefined, ...(seconds ? { seconds } : {}) }]
  })
}

/** Posts from the RSS feed: the fallback when the archive does not answer. Only a picture is a cover. */
export function readRss(xml: string): Post[] {
  if (!xml.includes('<rss')) throw new Error('rss: not a feed')
  return xml.split('<item>').slice(1).map(chunk => chunk.split('</item>')[0]).map(item => {
    const enclosure = /<enclosure[^>]*url="([^"]+)"[^>]*type="image\//.exec(item) ?? /<enclosure[^>]*type="image\/[^"]*"[^>]*url="([^"]+)"/.exec(item)
    return { title: decode(tag(item, 'title')), link: decode(tag(item, 'link')), date: tag(item, 'pubDate'), blurb: decode(tag(item, 'description')), image: enclosure ? enclosure[1] : undefined }
  })
}

type Entry = { article_url: string | null; video: Video | null; short: Video | null }
/** The content engine's catalogue: each published piece's article address and its YouTube cuts. */
export function readCatalogue(raw: unknown): Map<string, Entry> {
  const out = new Map<string, Entry>()
  const entries = (raw as { ok?: boolean; entries?: unknown })?.ok === true ? (raw as { entries: unknown }).entries : null
  if (!Array.isArray(entries)) throw new Error('catalogue: not ok')
  for (const e of entries as Entry[]) if (https(e?.article_url)) out.set(postKey(e.article_url), e)
  return out
}

/** Which posts the newsstand shows: articles only, from the relaunch on, newest first, with their videos joined by address. */
export function select(posts: Post[], videos: Map<string, Entry>, limit: number): Post[] {
  const since = new Date(`${CONFIG.relaunchDate}T00:00:00Z`).getTime()
  return posts
    // Articles only. Krish posted each piece's video on Substack too, titled "VIDEO: ..." (2026-10-07: "I updated some
    // of the titles on my Substack posts to distinguish between video and article"); those took the newsstand's slots.
    .filter(p => !/^video\s*:/i.test(p.title))
    .filter(p => p.title && p.link && new Date(p.date).getTime() >= since)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map(p => {
      const e = videos.get(postKey(p.link))
      return { ...p, ...(e?.video && https(e.video.url) ? { video: e.video } : {}), ...(e?.short && https(e.short.url) ? { short: e.short } : {}) }
    })
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: 900 }, headers: { ...UA, accept: 'application/json' }, signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return res.json()
}

/** Two tries, a second apart: a passing hiccup is not an outage. */
async function twice<T>(f: () => Promise<T>): Promise<T> {
  try { return await f() } catch { await new Promise(r => setTimeout(r, 1000)); return f() }
}

async function archivePosts(enough: number): Promise<Post[]> {
  const out: Post[] = []
  let cursor: string | undefined
  for (let page = 0; page < 6; page++) {
    const raw = await twice(() => getJson(`${CONFIG.archiveApi}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`)) as { nextCursor?: string }
    out.push(...readArchive(raw))
    cursor = raw?.nextCursor
    if (!cursor || out.filter(p => !/^video\s*:/i.test(p.title)).length >= enough) break
  }
  return out
}

/**
 * The newest pieces, refreshed every 15 minutes: covers from Substack's archive (RSS if the archive is down), videos
 * from the content engine's catalogue, joined by the post's address. A catalogue that fails leaves the articles
 * without their videos, and says so in the log. If no source answers this throws: Next keeps serving the last good
 * page, and a build stops, rather than either showing an empty newsstand as if nothing had been published.
 */
export async function latestPosts(limit: number = CONFIG.latestCount): Promise<Post[]> {
  let posts: Post[]
  try {
    posts = await archivePosts(limit + 4)
  } catch (archiveError) {
    try {
      const res = await fetch(CONFIG.feedUrl, { next: { revalidate: 900 }, headers: UA, signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error(`rss: ${res.status}`)
      posts = readRss(await res.text())
      console.warn(`newsstand: archive unavailable (${String(archiveError)}); using RSS, whose video posts carry no cover`)
    } catch (rssError) {
      throw new FeedUnavailable(`newsstand: no source answered (archive: ${String(archiveError)}; rss: ${String(rssError)})`)
    }
  }
  let videos = new Map<string, Entry>()
  try {
    videos = readCatalogue(await twice(() => getJson(CONFIG.catalogueUrl)))
  } catch (e) {
    console.warn(`newsstand: engine catalogue unavailable (${String(e)}); articles show without their videos`)
  }
  const out = select(posts, videos, limit)
  if (!out.length) throw new FeedUnavailable('newsstand: the sources answered with no pieces')
  return out
}
