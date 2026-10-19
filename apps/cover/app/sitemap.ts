import type { MetadataRoute } from 'next'
import { CONFIG } from '@/lib/content'

// The cover changes with every new piece on the Substack, so it carries the
// build date. The terms and privacy pages carry the date their text last changed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: CONFIG.siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${CONFIG.siteUrl}/terms`, lastModified: '2026-10-19', changeFrequency: 'yearly', priority: 0.2 },
    { url: `${CONFIG.siteUrl}/privacy`, lastModified: '2026-10-19', changeFrequency: 'yearly', priority: 0.2 },
  ]
}
