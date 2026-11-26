import fixture from '../content/edition-snapshot.json'
import type { Post } from './rss'

export const keys = ['music', 'film_tv', 'gaming', 'sport', 'publishing_media', 'art_design'] as const
export type Sector = (typeof keys)[number]
export type Desk = 'all' | Sector
export type HubImage = {
  kind: 'generated' | 'company' | 'person'
  url: string
  credit?: string
  file_page?: string
  name?: string
  role?: string
}
export type Item = {
  id: string
  subsector: Sector
  date: string
  source: string
  url: string
  headline: string
  dek: string
  why: string
  companies: string[]
  tickers: string[]
  coverage: number
  image: HubImage | null
}
export type Index = { day_pct: number | null; month_pct: number | null; series: number[] }
export type Room = { key: Sector; label: string; line: string; story_count: number; index: Index }
export type Stock = Omit<Index, 'series'> & {
  name: string
  subsector: Sector
  price: number | null
  currency: string | null
  spark: number[]
}
export type Piece = Post & { series?: string }
export type Snapshot = {
  ok: true
  version: 1
  edition_date: string
  generated_at: string
  subsectors: Room[]
  items: Item[]
  ticker: {
    as_of: string | null
    source?: string
    index: Index & { name: string }
    stocks: Record<string, Stock>
  }
  attention: { name: string; wiki_title: string; views_today: number; avg_30d: number; spiking: boolean }[]
  pieces: Piece[]
}

const obj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const string = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0
const num = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const optionalNum = (x: unknown) => x === null || num(x)
const sector = (x: unknown): x is Sector => keys.includes(x as Sector)
const series = (x: unknown) => Array.isArray(x) && x.every(num)
const strings = (x: unknown) => Array.isArray(x) && x.every(string)
const index = (x: unknown) => obj(x) && optionalNum(x.day_pct) && optionalNum(x.month_pct) && series(x.series)
export const https = (x: unknown): x is string => {
  if (!string(x)) return false
  try {
    const url = new URL(x)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}
const media = (x: unknown) => https(x) || (string(x) && /^\/hub\/(?:people\/)?[\w-]+\.jpg$/.test(x))
function validDay(value: unknown) {
  if (!string(value) || !/^\d{4}-\d{2}(?:-\d{2})?$/.test(value)) return false
  const day = value.length === 7 ? value + '-01' : value
  const time = Date.parse(day)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === day
}
function image(x: unknown): HubImage | null {
  if (!obj(x) || !media(x.url) || !['person', 'generated', 'company'].includes(String(x.kind))) return null
  if (x.kind === 'person' && !(string(x.credit) && https(x.file_page))) return null
  return {
    kind: x.kind as HubImage['kind'],
    url: String(x.url),
    credit: string(x.credit) ? x.credit : undefined,
    file_page: https(x.file_page) ? x.file_page : undefined,
    name: string(x.name) ? x.name : undefined,
    role: string(x.role) ? x.role : undefined,
  }
}

function item(x: unknown): Item {
  if (
    !obj(x) ||
    !sector(x.subsector) ||
    ![x.id, x.source, x.headline, x.dek, x.why].every(string) ||
    !validDay(x.date) ||
    !https(x.url) ||
    !strings(x.companies) ||
    !strings(x.tickers) ||
    !Number.isInteger(x.coverage) ||
    Number(x.coverage) < 1
  )
    throw Error('Invalid story')
  return { ...x, image: image(x.image) } as Item
}

function piece(x: unknown): Piece[] {
  if (!obj(x)) return []
  const link = x.link ?? x.article_url ?? x.url,
    title = x.title ?? x.article_title,
    date = x.date ?? x.published_at ?? x.post_date
  if (!https(link) || !string(title) || !string(date) || !Number.isFinite(Date.parse(date))) return []
  return [
    {
      link,
      title,
      date,
      blurb: String(x.blurb ?? ''),
      image: media(x.image) ? String(x.image) : undefined,
      series: string(x.series) ? x.series : undefined,
      seconds: num(x.seconds) ? x.seconds : undefined,
      video:
        obj(x.video) && https(x.video.url) ? { url: x.video.url, id: String(x.video.id ?? '') } : undefined,
    },
  ]
}

export function parseSnapshot(raw: unknown): Snapshot {
  if (
    !obj(raw) ||
    raw.ok !== true ||
    raw.version !== 1 ||
    !string(raw.edition_date) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(raw.edition_date) ||
    !validDay(raw.edition_date) ||
    !string(raw.generated_at) ||
    !Number.isFinite(Date.parse(raw.generated_at)) ||
    !Array.isArray(raw.items) ||
    !raw.items.length ||
    !Array.isArray(raw.subsectors) ||
    !Array.isArray(raw.attention) ||
    !Array.isArray(raw.pieces)
  )
    throw Error('Invalid edition')
  const items = raw.items.map(item)
  if (new Set(items.map((n) => n.id)).size !== items.length) throw Error('Duplicate story')
  const rooms = raw.subsectors
  if (
    rooms.length !== keys.length ||
    !keys.every((k) =>
      rooms.some(
        (r) =>
          obj(r) &&
          r.key === k &&
          string(r.label) &&
          typeof r.line === 'string' &&
          Number.isInteger(r.story_count) &&
          Number(r.story_count) >= 0 &&
          index(r.index),
      ),
    )
  )
    throw Error('Invalid rooms')
  const t = raw.ticker
  if (
    !obj(t) ||
    !(t.as_of === null || string(t.as_of)) ||
    !obj(t.index) ||
    !string(t.index.name) ||
    !index(t.index) ||
    !obj(t.stocks) ||
    !Object.values(t.stocks).every(
      (s) =>
        obj(s) &&
        sector(s.subsector) &&
        string(s.name) &&
        (s.currency === null || string(s.currency)) &&
        optionalNum(s.price) &&
        optionalNum(s.day_pct) &&
        optionalNum(s.month_pct) &&
        series(s.spark),
    )
  )
    throw Error('Invalid ticker')
  const attention = raw.attention.filter(
    (a) =>
      obj(a) &&
      string(a.name) &&
      string(a.wiki_title) &&
      num(a.views_today) &&
      num(a.avg_30d) &&
      typeof a.spiking === 'boolean',
  )
  return {
    ok: true,
    version: 1,
    edition_date: raw.edition_date,
    generated_at: raw.generated_at,
    subsectors: rooms as Room[],
    items,
    ticker: t as Snapshot['ticker'],
    attention,
    pieces: raw.pieces.flatMap(piece),
  }
}

export const fixturePieces = fixture.pieces.flatMap(piece)
export async function loadEdition(read: () => Promise<unknown> = readHub, backup: unknown = fixture) {
  try {
    return { snapshot: parseSnapshot(await read()), isFixture: false }
  } catch {
    return { snapshot: parseSnapshot(backup), isFixture: true }
  } // If both fail, ISR retains the last successful page.
}
async function readHub() {
  const url = process.env.HUB_URL || 'https://content-engine-flame-nu.vercel.app/api/hub/today'
  const res = await fetch(url, { next: { revalidate: 900 }, signal: AbortSignal.timeout(6500) })
  if (!res.ok) throw Error('Hub unavailable')
  return res.json()
}
