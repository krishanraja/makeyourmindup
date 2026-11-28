import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import raw from '../content/edition-snapshot.json'
import { keys, loadEdition, parseSnapshot, type Desk, type Item } from '../lib/hub'
import { answer, assign, recut } from '../lib/edition'

const snapshot = parseSnapshot(raw)
describe('snapshot boundary', () => {
  test('reads the v1 envelope and all 24 quotes, including a real zero and an unavailable price', () => {
    const patched = structuredClone(raw)
    patched.ticker.stocks.SPOT.day_pct = 0
    const s = parseSnapshot({
      ...patched,
      ticker: {
        ...patched.ticker,
        as_of: null,
        stocks: { ...patched.ticker.stocks, DIS: { ...patched.ticker.stocks.DIS, price: null, currency: null } },
      },
    })
    assert.equal(Object.keys(s.ticker.stocks).length, 24)
    assert.equal(s.ticker.stocks.SPOT.day_pct, 0)
    assert.equal(s.ticker.stocks.DIS.price, null)
  })
  test('a partial, duplicate, unsafe or empty edition never becomes a successful page', () => {
    for (const payload of [
      null,
      { ...raw, ok: false },
      { ...raw, version: 2 },
      { ...raw, items: [] },
      { ...raw, items: [raw.items[0], raw.items[0]] },
      { ...raw, subsectors: raw.subsectors.slice(1) },
      { ...raw, items: [{ ...raw.items[0], url: 'data:text/plain,story' }] },
      { ...raw, items: [{ ...raw.items[0], date: '2026-19-33' }] },
    ])
      assert.throws(() => parseSnapshot(payload))
  })
  test('a live edition wins, failed or malformed HTTP falls back, both invalid preserves the ISR error', async () => {
    assert.equal((await loadEdition(async () => raw)).isFixture, false)
    assert.equal(
      (
        await loadEdition(async () => {
          throw Error('503')
        })
      ).snapshot.edition_date,
      raw.edition_date,
    )
    assert.equal((await loadEdition(async () => ({ ok: false }))).isFixture, true)
    await assert.rejects(loadEdition(async () => null, {}))
  })
})
describe('the seven editorial cuts', () => {
  const leads = ['motson', 'tidal', 'disney', 'finals', 'motson', 'figaro', 'allen']
  const order = [
    'tidal disney magabala',
    'motson spotify-remix soundcloud',
    'utopai netflix motson',
    'motson allen spotify-remix',
    'finals tidal ap',
    'magabala brave ap',
    'anthropic-settle magabala disney',
  ]
  const desks: Desk[] = ['all', ...keys]
  desks.forEach((desk, i) =>
    test(desk, () => {
      const cut = recut(snapshot, desk, true),
        reserved = [cut.lead.art?.url, cut.lead.portrait?.url]
      assert.equal(cut.lead.item.id, leads[i])
      assert.equal(cut.things.map((s) => s.item.id).join(' '), order[i])
      assert.ok(cut.things.every((s) => s.why.length > 10))
      const treatments = assign(cut.things, reserved)
      assert.equal(new Set(treatments).size, 3)
      const images = [
        ...reserved,
        ...cut.things.map((s, i) =>
          treatments[i] === 'photo' ? s.art?.url : treatments[i] === 'portrait' ? s.portrait?.url : undefined,
        ),
      ].filter(Boolean)
      assert.equal(images.length, new Set(images).size)
    }),
  )
  test('the same story receives a different why for the all and sport leads', () => {
    assert.notEqual(recut(snapshot, 'sport', true).lead.why, recut(snapshot, 'all', true).lead.why)
  })
  test('new live IDs use coverage, date and sector rather than fixture decisions', () => {
    const items = snapshot.items.map((n, i) => ({
      ...n,
      id: 'fresh-' + i,
      why: 'New angle ' + i,
      coverage: i + 1,
    }))
    const cut = recut({ ...snapshot, items }, 'music')
    assert.equal(cut.lead.item.subsector, 'music')
    assert.equal(cut.lead.why, 'New angle 3')
    assert.deepEqual(
      cut.things.map((s) => s.item.id),
      ['fresh-2', 'fresh-1', 'fresh-0'],
    )
  })
  test('text-only days still rotate and two different stories cannot reuse the same image', () => {
    const news = snapshot.items
      .slice(0, 4)
      .map((n, i) => ({
        ...n,
        id: 'new' + i,
        headline: 'New music',
        dek: 'A source reports a change.',
        image: null,
      }))
    const cut = recut({ ...snapshot, items: news }, 'music')
    assert.equal(new Set(assign(cut.things)).size, 3)
    const shared = { kind: 'generated' as const, url: '/hub/gallery.jpg' }
    const stories = cut.things.map((s) => ({ ...s, art: shared }))
    assert.ok(!assign(stories, [shared.url]).includes('photo'))
  })
})
describe('attribution', () => {
  const name = 'John Motson'
  const image = {
    kind: 'person' as const,
    url: 'https://upload.wikimedia.org/a.jpg',
    name,
    credit: 'Photo: the photographer, CC BY 3.0',
    file_page: 'https://commons.wikimedia.org/wiki/File:John_Motson.jpg',
  }
  const item = snapshot.items.find((n) => n.id === 'motson')!
  function portrait(n: Item) {
    return recut({ ...snapshot, items: [n] }, 'all').lead.portrait
  }
  test('requires a credited subject in this story and suppresses adverse company pairings', () => {
    assert.equal(portrait({ ...item, image })?.credit, image.credit)
    assert.equal(portrait({ ...item, image: { ...image, name: undefined } })?.name, name)
    assert.equal(portrait({ ...item, image: { ...image, name: 'Another Person' } }), null)
    assert.equal(portrait({ ...item, image: { ...image, credit: undefined } }), null)
    assert.equal(portrait({ ...item, image, dek: 'His company is accused of taking recordings.' }), null)
  })
  test('answers cite only the supplied room and abstain when the text has no answer', () => {
    const music = snapshot.items.filter((n) => n.subsector === 'music')
    const lines = answer(music, 'music', 'What happened with SoundCloud?')
    assert.equal(lines[0].text, music.find((n) => n.id === 'soundcloud')?.dek)
    assert.ok(lines.every((l) => music.includes(l.item)))
    assert.deepEqual(answer(music, 'music', 'Who bought a vineyard?'), [])
    assert.deepEqual(answer(music, 'music', 'John Motson'), [])
    assert.ok(
      answer(music, 'music', "Who gets paid from Spotify's AI remixes?", true).every(
        (l) => l.item.id === 'spotify-remix',
      ),
    )
  })
})

test('reads the trend lanes leniently: a bad lane or story is left out, never the edition', () => {
  const story = { id: 't1', date: '2026-11-26', source: 'BBC', url: 'https://www.bbc.co.uk/news/1', headline: 'AI spending rose', dek: 'A firm said so.', why: 'Demand grew.' }
  const s = parseSnapshot({
    ...raw,
    trends: [
      { key: 'money', label: 'Money', line: 'Where the money goes.', moving: 'Spending on AI is rising.', why: 'Demand grew.', items: [story, { ...story, id: 't2', url: 'http://insecure.example' }] },
      { key: 'behaviour', label: 'Behaviour', line: 'How people use AI.', moving: 'A line with no stories.', why: 'None.', items: [] },
      { key: 'money', label: 'Money again', items: [story] },
      'not a lane',
    ],
  })
  assert.equal(s.trends.length, 2)
  assert.deepEqual(s.trends[0].items.map((i) => i.id), ['t1'])
  assert.equal(s.trends[0].moving, 'Spending on AI is rising.')
  assert.equal(s.trends[1].moving, null, 'a line is shown only beside its own stories')
  assert.deepEqual(parseSnapshot(raw).trends, [], 'an edition without trends still reads')
})
