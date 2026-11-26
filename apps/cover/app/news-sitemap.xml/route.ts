import { newsXml } from '@/lib/edition-feed'
import { archiveDates, readDates } from '@/lib/published'

export const dynamic = 'force-static'
export const revalidate = 900
export async function GET() {
  const dates = await archiveDates()
  const cutoff = Date.now() - 48 * 3600_000
  const editions = await readDates((dates || []).filter(day => Date.parse(day) >= cutoff))
  return new Response(newsXml(editions), { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
