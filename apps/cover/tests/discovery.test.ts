import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import raw from '../content/edition-snapshot.json'
import { parseSnapshot } from '../lib/hub'
import { archiveDates, datedEdition, latestEdition, recentEditions } from '../lib/published'
import { editionSchema } from '../lib/discovery'
import { newsXml, editionRss } from '../lib/edition-feed'
import { CONFIG } from '../lib/content'

const real = globalThis.fetch
afterEach(() => { globalThis.fetch = real })
function hub(reply: (query: URLSearchParams) => unknown) {
  globalThis.fetch = async input => new Response(JSON.stringify(reply(new URL(String(input)).searchParams)))
}

test('unknown, impossible, future and mismatched edition dates have no dated snapshot', async () => {
  hub(() => raw)
  for (const day of ['unknown', '2026-02-30', '2999-01-01', '2000-12-31']) assert.equal(await datedEdition(day), null)
  globalThis.fetch = async () => new Response(null, { status: 404 })
  assert.equal(await datedEdition('2000-12-31'), null)
  assert.equal(await latestEdition(), null)
})

test('desks load the most recent 14 published days, once each, across gaps', async () => {
  const days = Array.from({ length: 18 }, (_, i) => '2025-01-' + String(i + 1).padStart(2, '0'))
  const seen: string[] = []
  hub(q => {
    if (q.has('archive')) return { ok: true, dates: [...days, days[0], '2999-12-31'] }
    const day = q.get('date')!
    seen.push(day)
    return { ...raw, edition_date: day }
  })
  assert.deepEqual(await archiveDates(), [...days].reverse())
  const issues = await recentEditions()
  assert.deepEqual(issues.map(s => s.edition_date), [...days].reverse().slice(0, 14))
  assert.equal(new Set(seen).size, 14)
  hub(() => raw)
  assert.equal(await archiveDates(), null)
})

test('feeds and structured data cite the original source and stable edition anchor', () => {
  const s = parseSnapshot(raw)
  const story = { ...s.items[0], id: 'a & b', headline: 'Music & <rights>' }
  const dated = { ...s, edition_date: '2025-01-20', items: [story] }
  const item = editionSchema(dated).mainEntity.itemListElement[0].item
  assert.equal(item.isBasedOn, story.url)
  assert.ok(item.url.endsWith('#a%20%26%20b'))
  const recent = newsXml([dated], Date.parse('2025-01-21T12:00:00Z'))
  assert.match(recent, /Music &amp; &lt;rights&gt;/)
  assert.doesNotMatch(newsXml([dated], Date.parse('2025-01-23')), /<news:title>/)
  assert.match(editionRss([dated]), /<guid isPermaLink="true">/)
})

test('public IndexNow proof matches the configured key', () => {
  assert.match(CONFIG.indexNowKey, /^[a-f0-9]{32}$/)
  assert.equal(readFileSync('public/' + CONFIG.indexNowKey + '.txt', 'utf8').trim(), CONFIG.indexNowKey)
})
