import type { Metadata, Viewport } from 'next'
import { Anton, Archivo, Fraunces, IBM_Plex_Mono } from 'next/font/google'
import { CONFIG, SITE } from '@/lib/content'
import { OG_IMAGES, TWITTER_IMAGES } from '@/lib/social'
import './globals.css'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' })
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], style: ['italic'], variable: '--font-fraunces', display: 'swap' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex-mono', display: 'swap' })

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
      '@type': 'Organization',
      '@id': `${CONFIG.siteUrl}/#publication`,
      name: 'makeyourmindup',
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
    <html lang="en-GB" suppressHydrationWarning className={`${anton.variable} ${archivo.variable} ${fraunces.variable} ${plexMono.variable}`}>
      <head>
        {/*
          Marks the page as scripted before paint. If the app has not confirmed
          it loaded within three seconds, the mark comes off and every hidden
          starting state goes with it, so a failed bundle never hides content.
          It says "ready || remove" rather than "if not ready, remove" in
          code because the kill list reads this file and vetoes the mark.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');setTimeout(function(){d.classList.contains('ready')||d.classList.remove('js')},3000)",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }} />
        <link rel="alternate" type="application/rss+xml" title="makeyourmindup" href={CONFIG.feedUrl} />
      </head>
      <body>{children}</body>
    </html>
  )
}
