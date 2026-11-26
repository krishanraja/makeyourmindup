import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { CONFIG, SITE } from '@/lib/content'
import { OG_IMAGES, TWITTER_IMAGES } from '@/lib/social'
import './globals.css'

const fraunces = localFont({ src: [
  { path: './fonts/Fraunces-Upright-Variable.ttf', style: 'normal', weight: '100 900' },
  { path: './fonts/Fraunces-Italic-Variable.ttf', style: 'italic', weight: '100 900' },
], variable: '--font-fraunces', display: 'swap' })
const mono = localFont({ src: [
  { path: './fonts/DMMono-Regular.ttf', weight: '400' },
  { path: './fonts/DMMono-Medium.ttf', weight: '500' },
], variable: '--font-mono', display: 'swap' })
const sans = localFont({ src: './fonts/SchibstedGrotesk.ttf', weight: '400 900', variable: '--font-sans', display: 'swap' })
const anton = localFont({ src: './fonts/Anton-Regular.ttf', weight: '400', variable: '--font-anton', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(CONFIG.siteUrl),
  title: SITE.meta.title,
  description: SITE.meta.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'makeyourmindup',
    title: SITE.meta.title,
    description: SITE.meta.description,
    images: OG_IMAGES,
  },
  twitter: {
    card: 'summary_large_image',
    images: TWITTER_IMAGES,
    title: SITE.meta.title,
    description: SITE.meta.description,
  },
}

// Who publishes this, for search and answer engines. Every value comes from
// content/config.json or the page itself, so nothing here can say more than the
// site already does. The publication is an Organization and nothing here is a
// Person: no node, founder or author names who makes it (the ruling of
// 28 October 2026 in project-documentation/01_MEDIA_KIT.md, Voice). This file
// is on the kill list run, which is why it does not quote that ruling here.
const sameAs = [CONFIG.substackUrl, ...Object.values(CONFIG.platforms).filter((u): u is string => Boolean(u))]
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'NewsMediaOrganization',
      '@id': `${CONFIG.siteUrl}/#publication`,
      name: 'Make Your Mind Up',
      alternateName: 'makeyourmindup',
      url: CONFIG.siteUrl,
      logo: `${CONFIG.siteUrl}/icon.png`,
      description: SITE.meta.description,
      sameAs,
    },
    {
      '@type': 'WebSite',
      '@id': `${CONFIG.siteUrl}/#website`,
      name: 'makeyourmindup',
      url: CONFIG.siteUrl,
      inLanguage: 'en-GB',
      publisher: { '@id': `${CONFIG.siteUrl}/#publication` },
    },
  ],
}

export const viewport: Viewport = {
  themeColor: '#0C1512',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning className={`${anton.variable} ${sans.variable} ${fraunces.variable} ${mono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }} />
        <link rel="alternate" type="application/rss+xml" title="The Edition" href="/edition/feed.xml" />
        <link rel="alternate" type="application/rss+xml" title="makeyourmindup" href={CONFIG.feedUrl} />
      </head>
      <body>{children}</body>
    </html>
  )
}
