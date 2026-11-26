import notes from '../content/edition-notes.json'
import type { Desk, HubImage, Item, Snapshot } from './hub'

export type Treatment = 'number' | 'quote' | 'portrait' | 'evidence' | 'photo' | 'type'
type Material = { number?: { fig: string; sup: string; unit: string; sub?: string; subLabel?: string }; quote?: { q: string; att: string }; evidence?: string }
type Thing = { id: string; sub: string; why: string }
type Cut = { lead: { id: string; why: string }; things: Thing[]; behind: Record<'paid' | 'real', [string, string[]]> }
export type Story = { item: Item; why: string; sub: string; art: HubImage | null; portrait: HubImage | null; material: Material }

function story(item: Item, fixture: boolean, why = item.why, sub = ''): Story {
  const art = item.image?.kind !== 'person' ? item.image : null
  const portrait = fixture ? (notes.portraits as unknown as Record<string, HubImage>)[item.id] : item.image
  const content = item.headline + ' ' + item.dek
  // A live portrait needs an explicit subject in the story. Withhold ambiguous and adverse pairings.
  const adverse = /accus|alleg|scrap(?:e|ing)|lawsuit|\bsu(?:e[ds]?|ing)\b|fraud|investigat|infring|complaint|misconduct/i.test(content)
  const subject = portrait?.name || (portrait?.file_page && content.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)+\b/g)?.find(n => portrait.file_page?.includes(n.replace(/ /g, '_'))))
  const own = portrait?.kind === 'person' && portrait.credit && portrait.file_page && !adverse &&
    (fixture || (subject && content.toLowerCase().includes(subject.toLowerCase())))
  const quote = content.match(/(?:^|\s)['"“‘](.{2,100}?)[’”"'](?:[., ]|$)/)?.[1]
  const number = item.headline.match(/(?:[$£€])?\b\d[\d,.]*(?:%| million| billion)?\b/)
  const material = (fixture && (notes.material as Record<string, Material>)[item.id]) || {
    number: number ? { fig: number[0], sup: '', unit: item.headline } : undefined,
    quote: quote ? { q: quote, att: item.dek } : undefined,
    evidence: item.dek.split(/(?<=[.!?])\s/)[0] }
  return { item, why, sub, art, portrait: own ? { ...portrait, name: subject || portrait.name } : null, material }
}

export function recut(snapshot: Snapshot, desk: Desk, fixture = false) {
  const room = snapshot.subsectors.find(s => s.key === desk)
  const cut = fixture ? (notes.cuts as unknown as Record<Desk, Cut>)[desk] : undefined
  const items = snapshot.items, scoped = room ? items.filter(n => n.subsector === desk) : items
  const ranked = (list: Item[]) => [...list].sort((a,b) => b.coverage - a.coverage || b.date.localeCompare(a.date))
  const ordered = ranked(scoped).concat(room ? ranked(items.filter(n => n.subsector !== desk)) : [])
  const first = items.find(n => n.id === cut?.lead.id) || ordered[0]
  const lead = story(first, fixture, cut?.lead.why)
  const things = cut ? cut.things.flatMap(t => {
    const n = items.find(n => n.id === t.id)
    return n ? [story(n, fixture, t.why, t.sub)] : []
  }) : ordered.filter(n => n.id !== first.id).slice(0,3).map(n => story(n, false))
  const label = room?.label || 'All of it'
  const whyIn = room ? 'in ' + label.toLowerCase().replace('&', 'and').replace('tv','TV') : 'across the creative industries'
  return { lead, things, scoped, label, whyIn, room, behind: cut?.behind }
}

// Search at most three slots. Reject reused URLs as well as reused treatments.
// A labelled excerpt from our own summary can fill a quote slot on a text-only day.
export function assign(stories: Story[], reserved: (string | undefined)[] = []): Treatment[] {
  const choices = stories.map(s => {
    const list: Treatment[] = []
    if (s.material.number) list.push('number')
    if (s.material.quote) list.push('quote')
    if (s.portrait && !reserved.includes(s.portrait.url)) list.push('portrait')
    const document = /court|sue|rule|licens|deal|settlement|scraped/i.test(s.item.headline + ' ' + s.item.dek)
    if (document && s.material.evidence) list.push('evidence')
    if (s.art && !reserved.includes(s.art.url)) list.push('photo')
    if (!list.includes('evidence') && s.material.evidence) list.push('evidence')
    list.push('type')
    if (!list.includes('evidence')) list.push('evidence')
    if (!list.includes('quote')) list.push('quote')
    return list
  })
  let best: Treatment[] = [], cost = Infinity
  function visit(picks: Treatment[], used: (string | undefined)[], rank: number) {
    if (picks.length === stories.length) {
      for (const t of ['portrait','photo'] as const) if (!picks.includes(t) && choices.some(c => c.includes(t))) rank += 2.5
      if (rank < cost) { best = picks; cost = rank }
      return
    }
    const i = picks.length, s = stories[i]
    choices[i].forEach((t,j) => {
      const url = t === 'portrait' ? s.portrait?.url : t === 'photo' ? s.art?.url : undefined
      if (picks.includes(t) || (url && used.includes(url))) return
      visit([...picks,t], url ? [...used,url] : used, rank+j+(t === 'quote' && !s.material.quote ? 8 : 0))
    })
  }
  visit([],reserved,0)
  return best
}

type Answer = { text: string; item: Item }
type Suggested = { q: string; lines: string[][] }
export function suggestions(items: Item[], desk: Desk, fixture: boolean): string[] {
  const canned = fixture && (notes.ask as Record<string, Suggested[]>)[desk]
  return canned ? canned.map(a => a.q) : items.slice(0,2).map(n => 'What happened with ' + (n.companies[0] || n.source) + '?')
}
export function answer(items: Item[], desk: Desk, question: string, fixture = false): Answer[] {
  const canned = fixture && (notes.ask as Record<string, Suggested[]>)[desk]?.find(a => a.q === question)
  if (canned) return canned.lines.flatMap(([text,id]) => {
    const item = items.find(n => n.id === id)
    return item ? [{ text, item }] : []
  })
  const stop = new Set('what who why how where when tell about with have does did today latest happened that their this from paid edition getting stories'.split(' '))
  const tokens = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g)?.filter(w => w.length > 1 && !stop.has(w)) || []
  const words = new Set(tokens(question))
  return items.map(item => {
    const hay = new Set(tokens([item.headline,item.dek,item.why,...item.companies,...item.tickers].join(' ')))
    const hits = [...words].filter(w => hay.has(w)).length
    return { item, hits }
  }).filter(x => x.hits > 0 && x.hits >= Math.ceil(words.size / 2)).sort((a,b) => b.hits-a.hits)
    .slice(0,3).map(({item}) => ({ item, text: item.dek }))
}
