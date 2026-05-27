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
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'makeyourmindup.ai',
    description: 'What if you were already the version of yourself you keep delaying?',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0908',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
