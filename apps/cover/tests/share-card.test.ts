import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import sharp from 'sharp'
import snapshot from '../content/edition-snapshot.json'
import { GET as homepage } from '../app/opengraph-image/route'
import { GET as twitter } from '../app/twitter-image/route'
import { shareCard, type Card } from '../lib/share-card'

const fetchOriginal = globalThis.fetch
afterEach(() => { globalThis.fetch = fetchOriginal })
const png = async (response: Promise<Response>) => Buffer.from(await (await response).arrayBuffer())

test('both homepage cards follow the published lead and use the brand when it is unavailable', async () => {
  const day = '2025-01-15'
  const edition = { ...snapshot, edition_date: day }
  globalThis.fetch = async () => Response.json(edition)
  const first = await png(homepage())
  assert.deepEqual(await png(twitter()), first)
  const meta = await sharp(first).metadata()
  assert.deepEqual([meta.format, meta.width, meta.height], ['png', 1200, 630])
  const revised = edition.items.map(item => ({ ...item, headline: 'A different published lead' }))
  globalThis.fetch = async () => Response.json({ ...edition, items: revised })
  assert.notDeepEqual(await png(homepage()), first)
  globalThis.fetch = async () => new Response(null, { status: 404 })
  assert.deepEqual(await png(homepage()), await png(shareCard(null)))
})

test('an oversized headline falls back to the complete dek, then the page title', async () => {
  const card: Card = { label: 'The Edition', title: 'Edition archive' }
  const long = 'Extraordinarily lengthy headline '.repeat(30)
  const dek = 'A shorter explanation.'
  assert.deepEqual(await png(shareCard({ ...card, headline: long, dek })), await png(shareCard({ ...card, headline: dek })))
  assert.deepEqual(await png(shareCard({ ...card, headline: long, dek: long })), await png(shareCard(card)))
})

test('a missing photo gives the complete text card and a supplied credit appears in the photo area', async () => {
  const card: Card = { label: 'The Edition / Sport', title: 'AI in sport' }
  const photo = { kind: 'company' as const, url: '/hub/stadium.jpg' }
  assert.deepEqual(await png(shareCard({ ...card, photo: { ...photo, url: '/hub/missing.jpg' } })), await png(shareCard(card)))
  const plain = await png(shareCard({ ...card, photo }))
  const credited = await png(shareCard({ ...card, photo: { ...photo, credit: 'Photograph by the source' } }))
  const crop = (data: Buffer, top: number, height: number) =>
    sharp(data).extract({ left: 640, top, width: 560, height }).raw().toBuffer()
  assert.deepEqual(await crop(plain, 104, 440), await crop(credited, 104, 440))
  assert.notDeepEqual(await crop(plain, 590, 40), await crop(credited, 590, 40))
})
