import { CONFIG, SITE } from '@/lib/content'
import { latestPosts } from '@/lib/rss'

// A plain-text map of the publication for answer engines and agents, in the
// llms.txt convention. The latest pieces come from the same Substack feed as
// the cover and refresh on the same 15 minutes, so it never lists a piece the
// cover would not.
export const revalidate = 900

export async function GET() {
  const posts = await latestPosts(20)
  const platforms = Object.entries(CONFIG.platforms).filter(([, url]) => url)
  const lines = [
    '# makeyourmindup',
    '',
    `> ${SITE.meta.description}`,
    '',
    `Written by Krish Raja (${CONFIG.links.krish}). Every piece is published on the Substack at ${CONFIG.substackUrl}; this site is its front door.`,
    '',
    '## Read and cite',
    '',
    `- Archive: ${CONFIG.substackUrl}/archive`,
    `- RSS feed: ${CONFIG.feedUrl}`,
    `- Sitemap of every piece: ${CONFIG.substackUrl}/sitemap.xml`,
    '- Cite a piece by its own URL, with Krish Raja as author and makeyourmindup as publication.',
    '',
    '## Latest pieces',
    '',
    ...(posts.length
      ? posts.map(p => `- [${p.title}](${p.link})${p.blurb ? `: ${p.blurb}` : ''}`)
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
