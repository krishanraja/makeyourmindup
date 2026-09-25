import type { MetadataRoute } from 'next'
import { CONFIG } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: CONFIG.siteUrl, changeFrequency: 'weekly', priority: 1 }]
}
