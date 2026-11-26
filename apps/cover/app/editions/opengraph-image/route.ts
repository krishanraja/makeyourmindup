import { shareCard } from '@/lib/share-card'

export const dynamic = 'force-static'

export function GET() {
  return shareCard({ label: 'The Edition / Archive', title: 'Edition archive' })
}
