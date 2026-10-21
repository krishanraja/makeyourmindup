import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/content'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'makeyourmindup',
    short_name: 'makeyourmindup',
    description: SITE.meta.description,
    start_url: '/',
    display: 'browser',
    background_color: '#0C1512',
    theme_color: '#0C1512',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
