import { absolute } from './discovery'
import { desks, fullDate, storyPath } from './desks'
import type { Snapshot } from './hub'

export function editionText(s: Snapshot | null, full = false) {
  if (!s) return ['The latest published edition is currently unavailable.']
  const lines = ['## The Edition, ' + fullDate(s.edition_date)]
  if (full) for (const room of s.subsectors) lines.push(room.label + ': ' + room.line)
  for (const n of s.items) {
    lines.push('', '[' + n.headline + '](' + absolute(storyPath(s.edition_date, n.id)) + ')', n.dek)
    if (full) lines.push(desks[n.subsector].label + ' | ' + n.date, 'Why it matters: ' + n.why)
    lines.push('Source: [' + n.source + '](' + n.url + ')')
    if (full && n.image) lines.push([absolute(n.image.url), n.image.credit, n.image.file_page].filter(Boolean).join(' | '))
  }
  if (full) {
    const pct = (n: number | null) => n === null ? 'n/a' : n.toFixed(2) + '%'
    const index = s.ticker.index
    lines.push('', '## Creative 24', 'Market data: ' + (s.ticker.as_of || 'Date unavailable'),
      'Index: ' + (index.series.at(-1) ?? 'n/a') + ' | Day: ' + pct(index.day_pct) + ' | Month: ' + pct(index.month_pct),
      'Company | Symbol | Price | Currency | Day | Month')
    for (const [symbol, stock] of Object.entries(s.ticker.stocks)) {
      lines.push([stock.name, symbol, stock.price ?? 'n/a', stock.currency ?? 'n/a', pct(stock.day_pct), pct(stock.month_pct)].join(' | '))
    }
    lines.push('', '## Desk indices', ...s.subsectors.map(r =>
      [r.label, r.index.series.at(-1) ?? 'n/a', pct(r.index.day_pct), pct(r.index.month_pct)].join(' | ')))
    lines.push('', '## This week\'s pieces', ...s.pieces.map(p => p.title + ' | ' + p.link + (p.blurb ? '\n' + p.blurb : '')))
  }
  return lines
}
