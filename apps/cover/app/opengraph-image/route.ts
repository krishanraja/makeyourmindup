import { latestLead } from '@/lib/published'
import { shareCard, storyCard } from '@/lib/share-card'

export const dynamic = 'force-static'
export const revalidate = 900

export async function GET() {
  const lead = await latestLead()
  return shareCard(lead && storyCard(lead.story, 'The Edition'))
}
