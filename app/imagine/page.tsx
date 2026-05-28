import type { Metadata } from 'next';
import { imagine } from '@/lib/variants';
import { VariantEntry } from '@/experience/VariantEntry';

export const metadata: Metadata = {
  title: 'makeyourmindup.ai',
  description: imagine.hero.body,
  openGraph: {
    title: imagine.og.title,
    description: imagine.hero.body,
    images: [{ url: '/og/imagine', width: 1080, height: 1920 }],
    type: 'website',
    siteName: 'makeyourmindup.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: imagine.og.title,
    description: imagine.hero.body,
    images: ['/og/imagine'],
  },
};

export default function ImaginePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <VariantEntry variant="imagine" searchParams={searchParams} />;
}
