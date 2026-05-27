import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://makeyourmindup.ai'),
  title: 'makeyourmindup.ai',
  description: 'What if you were already the version of yourself you keep delaying?',
  applicationName: 'makeyourmindup.ai',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'makeyourmindup.ai',
    description: 'What if you were already the version of yourself you keep delaying?',
    url: 'https://makeyourmindup.ai',
    siteName: 'makeyourmindup.ai',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'makeyourmindup.ai' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'makeyourmindup.ai',
    description: 'What if you were already the version of yourself you keep delaying?',
    images: ['/og'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#0a0908',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
