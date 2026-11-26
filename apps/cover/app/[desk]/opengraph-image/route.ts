import { deskEdition } from '@/lib/desk-edition'
import { shareCard } from '@/lib/share-card'

export const dynamic = 'force-static'
export const revalidate = 900
export async function GET(_: Request, { params }: { params: Promise<{ desk: string }> }) {
  const { desk, stories } = await deskEdition((await params).desk)
  return shareCard(desk.label, stories[0]?.item.headline || 'AI in ' + desk.subject)
}
