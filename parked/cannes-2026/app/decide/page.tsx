import type { Metadata } from 'next';
import { decide } from '@/lib/variants';
import { VariantEntry } from '@/experience/VariantEntry';

export const metadata: Metadata = {
  title: 'makeyourmindup.ai',
  description: decide.hero.body,
  openGraph: {
    title: decide.og.title,
    description: decide.hero.body,
    images: [{ url: '/og/decide', width: 1080, height: 1920 }],
    type: 'website',
    siteName: 'makeyourmindup.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: decide.og.title,
    description: decide.hero.body,
    images: ['/og/decide'],
  },
};

export default function DecidePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <VariantEntry variant="decide" searchParams={searchParams} />;
}
