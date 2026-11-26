import { editionText } from '@/lib/edition-text'
import { latestEdition } from '@/lib/published'

export const dynamic = 'force-static'
export const revalidate = 900
export async function GET() {
  const lines = ['# Make Your Mind Up', 'Cite the edition and its linked sources.', '', ...editionText(await latestEdition(), true)]
  return new Response(lines.join('\n') + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
