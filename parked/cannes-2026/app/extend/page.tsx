import type { Metadata } from 'next';
import { extend } from '@/lib/variants';
import { VariantEntry } from '@/experience/VariantEntry';

export const metadata: Metadata = {
  title: 'makeyourmindup.ai',
  description: extend.hero.body,
  openGraph: {
    title: extend.og.title,
    description: extend.hero.body,
    images: [{ url: '/og/extend', width: 1080, height: 1920 }],
    type: 'website',
    siteName: 'makeyourmindup.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: extend.og.title,
    description: extend.hero.body,
    images: ['/og/extend'],
  },
};

export default function ExtendPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <VariantEntry variant="extend" searchParams={searchParams} />;
}
