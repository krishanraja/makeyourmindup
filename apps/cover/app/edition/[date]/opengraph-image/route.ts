import { recut } from '@/lib/edition'
import { archiveDates, datedEdition, today } from '@/lib/published'
import { fullDate } from '@/lib/desks'
import { shareCard } from '@/lib/share-card'

export const dynamic = 'force-static'
export const revalidate = 3600
export async function generateStaticParams() {
  return (await archiveDates() || []).slice(0, 1).map(date => ({ date }))
}
export async function GET(_: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const s = await datedEdition(date)
  if (!s) return new Response(null, { status: 404 })
  return shareCard(fullDate(date), recut(s, 'all').lead.item.headline, date === today() ? 900 : 3600)
}
