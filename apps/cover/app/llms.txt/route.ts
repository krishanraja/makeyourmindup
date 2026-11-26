import { CONFIG, SITE } from '@/lib/content'
import { deskKeys, desks } from '@/lib/desks'
import { absolute } from '@/lib/discovery'
import { latestEdition } from '@/lib/published'
import { editionText } from '@/lib/edition-text'
import { latestPosts } from '@/lib/rss'

// A plain-text map of the publication for answer engines and agents, in the
// llms.txt convention. The latest pieces come from the same Substack feed as
// the cover (Substack's archive, with each piece's videos from the content engine) and refresh on the same 15 minutes, so it never lists a piece the
// cover would not. It names no person as writer or author: cite the publication
// (the ruling of 28 October 2026 in project-documentation/01_MEDIA_KIT.md, Voice).
export const dynamic = 'force-static'
export const revalidate = 900

export async function GET() {
  const [snapshot, latest] = await Promise.all([latestEdition(), latestPosts(20).catch(() => [])])
  const posts = latest.length ? latest : snapshot?.pieces || []
  const platforms = Object.entries(CONFIG.platforms).filter(([, url]) => url)
  const lines = [
    '# makeyourmindup',
    '',
    `> ${SITE.meta.description}`,
    '',
    ...editionText(snapshot),
    '',
    '## Desks and data',
    ...deskKeys.map(k => '- [' + desks[k].label + '](' + absolute('/' + desks[k].slug) + ')'),
    '- Creative 24: ' + absolute('/creative-24'),
    '- Edition archive: ' + absolute('/editions'),
    '- Edition RSS: ' + absolute('/edition/feed.xml'),
    '- Full edition and index: ' + absolute('/llms-full.txt'),
    '',
    '## Read and cite',
    '',
    `- Archive: ${CONFIG.substackUrl}/archive`,
    `- RSS feed: ${CONFIG.feedUrl}`,
    `- Sitemap of every piece: ${CONFIG.substackUrl}/sitemap.xml`,
    '- Cite a piece by its own URL, with makeyourmindup as author and publication.',
    '',
    '## Latest pieces',
    '',
    ...(posts.length
      ? posts.map(p => `- [${p.title}](${p.link})${p.blurb ? `: ${p.blurb}` : ''}${p.video ? ` Video: ${p.video.url}` : ''}${p.short ? ` Short: ${p.short.url}` : ''}`)
      : [`- See the archive: ${CONFIG.substackUrl}/archive`]),
    '',
    '## Elsewhere',
    '',
    ...platforms.map(([name, url]) => `- ${name}: ${url}`),
    '',
  ]
  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
