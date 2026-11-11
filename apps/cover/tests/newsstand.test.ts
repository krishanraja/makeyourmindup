// The newsstand's loader (lib/rss.ts): covers from Substack's archive, videos from the content engine, never an empty
// page from a failed feed. Run: npm test (node --test through tsx; no network: every fetch is faked here).
import { afterEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { FeedUnavailable, latestPosts, postKey, readArchive, readCatalogue, readRss, select } from '../lib/rss'

const post = (slug: string, date: string, extra: Record<string, unknown> = {}) => ({
  id: 1, title: `Title ${slug}`, canonical_url: `https://home.makeyourmindup.ai/p/${slug}`, post_date: date,
  subtitle: `Sub ${slug}`, cover_image: `https://substack-post-media.s3.amazonaws.com/${slug}.png`, type: 'podcast', ...extra,
})
const rssItem = (slug: string, enclosureType: string) => `<item><title><![CDATA[Title ${slug}]]></title><link>https://home.makeyourmindup.ai/p/${slug}</link>
<pubDate>Mon, 09 Nov 2026 17:31:17 GMT</pubDate><description><![CDATA[Sub]]></description><enclosure url="https://cdn/${slug}.${enclosureType === 'audio/mpeg' ? 'mp3' : 'jpg'}" length="1" type="${enclosureType}"/></item>`
const catalogue = (entries: unknown[]) => ({ ok: true, version: 1, entries })

const real = globalThis.fetch
afterEach(() => { globalThis.fetch = real })
function fake(routes: Record<string, () => Response | Promise<Response>>) {
  globalThis.fetch = (async (input: string | URL) => {
    const url = String(input)
    const hit = Object.entries(routes).find(([k]) => url.startsWith(k))
    if (!hit) throw new Error(`unrouted ${url}`)
    return hit[1]()
  }) as typeof fetch
}
const json = (v: unknown, status = 200) => () => new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json' } })
const ARCHIVE = 'https://home.makeyourmindup.ai/api/v1/archive', RSS = 'https://home.makeyourmindup.ai/feed', CAT = 'https://content.krishraja.com/api/publish/catalogue'

describe('covers', () => {
  test('every archive post keeps its own cover, video posts included', () => {
    const posts = readArchive({ posts: [post('a', '2026-11-09T17:31:17Z'), post('b', '2026-11-06T17:00:00Z', { type: 'newsletter' })] })
    assert.deepEqual(posts.map(p => p.image), ['https://substack-post-media.s3.amazonaws.com/a.png', 'https://substack-post-media.s3.amazonaws.com/b.png'])
  })
  test('an RSS audio enclosure is never taken for a cover', () => {
    const [audio, pic] = readRss(`<rss><channel>${rssItem('a', 'audio/mpeg')}${rssItem('b', 'image/jpeg')}</channel></rss>`)
    assert.equal(audio.image, undefined)
    assert.equal(pic.image, 'https://cdn/b.jpg')
  })
  test('a post with no cover shows without one, never with an invented image', () => {
    assert.equal(readArchive({ posts: [post('a', '2026-11-09T17:31:17Z', { cover_image: null })] })[0].image, undefined)
  })
})

describe('videos', () => {
  const posts = readArchive({ posts: [post('a', '2026-11-09T17:31:17Z'), post('b', '2026-11-06T17:00:00Z')] })
  test('join by the post address, the full video and the Short kept apart', () => {
    const v = readCatalogue(catalogue([{ article_url: 'https://home.makeyourmindup.ai/p/a/', video: { url: 'https://www.youtube.com/watch?v=AAAAAAAAAAA', id: 'AAAAAAAAAAA' }, short: { url: 'https://www.youtube.com/shorts/BBBBBBBBBBB', id: 'BBBBBBBBBBB' } }]))
    const out = select(posts, v, 3)
    assert.equal(out[0].video?.id, 'AAAAAAAAAAA')
    assert.equal(out[0].short?.id, 'BBBBBBBBBBB')
    assert.equal(out[1].video, undefined)
  })
  test('a video that goes out later appears on the next read, with no mapping by hand', () => {
    assert.equal(select(posts, readCatalogue(catalogue([{ article_url: posts[1].link, video: null, short: null }])), 3)[1].video, undefined)
    assert.equal(select(posts, readCatalogue(catalogue([{ article_url: posts[1].link, video: { url: 'https://www.youtube.com/watch?v=CCCCCCCCCCC', id: 'CCCCCCCCCCC' }, short: null }])), 3)[1].video?.id, 'CCCCCCCCCCC')
  })
  test('addresses match whatever their casing, slash or query', () => {
    assert.equal(postKey('https://Home.makeyourmindup.ai/p/a/?utm=1'), postKey('https://home.makeyourmindup.ai/p/a'))
  })
  test('a catalogue that says it failed is refused, not read as no videos', () => {
    assert.throws(() => readCatalogue({ ok: false, error: 'catalogue_unavailable' }))
  })
})

describe('failures never become an empty newsstand', () => {
  test('archive down: RSS serves the articles', async () => {
    fake({ [ARCHIVE]: json({}, 503), [RSS]: () => new Response(`<rss>${rssItem('a', 'image/jpeg')}</rss>`), [CAT]: json(catalogue([])) })
    const out = await latestPosts(3)
    assert.equal(out.length, 1)
  })
  test('archive and RSS both down: it throws, so the last good page keeps serving', async () => {
    fake({ [ARCHIVE]: json({}, 503), [RSS]: () => new Response('nope', { status: 404 }), [CAT]: json(catalogue([])) })
    await assert.rejects(latestPosts(3), FeedUnavailable)
  })
  test('catalogue down: the articles and their covers still show', async () => {
    fake({ [ARCHIVE]: json({ posts: [post('a', '2026-11-09T17:31:17Z')] }), [CAT]: json({ ok: false }, 503) })
    const out = await latestPosts(3)
    assert.equal(out[0].image, 'https://substack-post-media.s3.amazonaws.com/a.png')
    assert.equal(out[0].video, undefined)
  })
  test('pages through the archive until there are enough articles, past the VIDEO: posts', async () => {
    let calls = 0
    fake({
      [ARCHIVE]: () => { calls++; return calls === 1
        ? json({ posts: [post('v1', '2026-10-20T10:00:00Z', { title: 'VIDEO: one' }), post('a', '2026-10-20T09:00:00Z')], nextCursor: 'c1' })()
        : json({ posts: [post('b', '2026-10-19T09:00:00Z'), post('c', '2026-10-14T09:00:00Z')] })() },
      [CAT]: json(catalogue([])),
    })
    const out = await latestPosts(3)
    assert.deepEqual(out.map(p => p.link.split('/p/')[1]), ['a', 'b', 'c'])
    assert.equal(calls, 2)
  })
})
