import { recut } from '@/lib/edition'
import { archiveDates, datedEdition, today } from '@/lib/published'
import { fullDate } from '@/lib/desks'
import { shareCard, storyCard } from '@/lib/share-card'

export const dynamic = 'force-static'
export const revalidate = 3600
export async function generateStaticParams() {
  return (await archiveDates() || []).slice(0, 1).map(date => ({ date }))
}
export async function GET(_: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const s = await datedEdition(date)
  if (!s) return new Response(null, { status: 404 })
  return shareCard(storyCard(recut(s, 'all').lead, 'The Edition, ' + fullDate(date)), date === today() ? 900 : 3600)
}
