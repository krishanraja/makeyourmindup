import type { Metadata, Viewport } from 'next'
import { Anton, Archivo, Fraunces, IBM_Plex_Mono } from 'next/font/google'
import { CONFIG, SITE } from '@/lib/content'
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
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.meta.title,
    description: SITE.meta.description,
  },
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
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.classList.contains('ready'))d.classList.remove('js')},3000)",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
