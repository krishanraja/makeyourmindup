import { deskEdition } from '@/lib/desk-edition'
import { deskKeys, desks } from '@/lib/desks'
import { story } from '@/lib/edition'
import { shareCard, storyCard } from '@/lib/share-card'

export const dynamic = 'force-static'
export const revalidate = 900
export const generateStaticParams = () => deskKeys.map(key => ({ desk: desks[key].slug }))
export async function GET(_: Request, { params }: { params: Promise<{ desk: string }> }) {
  const { desk, stories } = await deskEdition((await params).desk)
  const title = 'AI in ' + desk.subject
  const label = 'The Edition / ' + desk.label
  return shareCard(stories.length ? storyCard(story(stories[0].item, false), title, label) : { label, title })
}
