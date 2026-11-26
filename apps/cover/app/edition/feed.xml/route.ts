import { editionRss } from '@/lib/edition-feed'
import { archiveDates, readDates } from '@/lib/published'

export const dynamic = 'force-static'
export const revalidate = 900
export async function GET() {
  const editions = await readDates(await archiveDates() || [])
  return new Response(editionRss(editions), { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } })
}
