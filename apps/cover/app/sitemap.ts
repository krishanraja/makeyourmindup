import type { MetadataRoute } from 'next'
import { absolute } from '@/lib/discovery'
import { deskKeys, desks, editionPath } from '@/lib/desks'
import { archiveDates, latestEdition } from '@/lib/published'

export const revalidate = 900
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [archive, latest] = await Promise.all([archiveDates(), latestEdition()])
  const dates = archive || []
  const modified = latest?.generated_at || dates[0] || '2026-11-26'
  return [
    ...['/', ...deskKeys.map(k => '/' + desks[k].slug), '/creative-24', '/editions'].map(path => ({
      url: absolute(path), lastModified: modified,
    })),
    ...dates.map(date => ({ url: absolute(editionPath(date)), lastModified: latest?.edition_date === date ? latest.generated_at : date })),
    ...['/terms', '/privacy'].map(path => ({ url: absolute(path), lastModified: '2026-10-19' })),
  ]
}
