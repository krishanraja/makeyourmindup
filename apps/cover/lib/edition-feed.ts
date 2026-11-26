import { absolute, publication } from './discovery'
import { editionPath, fullDate, storyPath } from './desks'
import type { Snapshot } from './hub'

const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;')
const declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'

export function newsXml(editions: Snapshot[], now = Date.now()) {
  // The hub supplies the original publication day. Its generated_at can change with a price refresh.
  const recent = editions.filter(s => Date.parse(s.edition_date) >= now - 48 * 3600_000 && Date.parse(s.edition_date) <= now)
  const entries = recent.flatMap(s => s.items.map(n => `<url>
<loc>${escape(absolute(storyPath(s.edition_date, n.id)))}</loc>
<news:news><news:publication><news:name>${publication}</news:name><news:language>en</news:language></news:publication>
<news:publication_date>${s.edition_date}</news:publication_date><news:title>${escape(n.headline)}</news:title></news:news>
</url>`))
  return declaration + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">' +
    entries.slice(0, 1000).join('\n') + '</urlset>'
}

export function editionRss(editions: Snapshot[]) {
  const items = editions.map(s => {
    const link = absolute(editionPath(s.edition_date))
    const stories = s.items.map(n => `<p><a href="${escape(absolute(storyPath(s.edition_date, n.id)))}">${escape(n.headline)}</a><br/>${escape(n.dek)} <a href="${escape(n.url)}">${escape(n.source)}</a></p>`).join('')
    return `<item><title>The Edition, ${fullDate(s.edition_date)}</title><link>${link}</link>
<guid isPermaLink="true">${link}</guid><pubDate>${new Date(s.edition_date).toUTCString()}</pubDate>
<description>${escape(stories)}</description></item>`
  })
  return declaration + `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>The Edition | ${publication}</title><link>${absolute('/editions')}</link><language>en-GB</language>
<description>Daily AI news across the creative industries.</description>
<atom:link href="${absolute('/edition/feed.xml')}" rel="self" type="application/rss+xml"/>
${items.join('\n')}</channel></rss>`
}
