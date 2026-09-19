import type { Metadata } from 'next';
import { variants } from '@/lib/variants';
import { BrandMonogram } from '@/components/BrandMonogram';
import { LandingCard } from '@/components/LandingCard';
import { LandingView } from '@/components/LandingView';

export const metadata: Metadata = {
  title: 'makeyourmindup.ai',
  description: 'What if you were already the version of you you keep delaying?',
  openGraph: {
    title: 'makeyourmindup.ai',
    description: 'What if you were already the version of you you keep delaying?',
    url: 'https://makeyourmindup.ai',
    siteName: 'makeyourmindup.ai',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'makeyourmindup.ai' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'makeyourmindup.ai',
    description: 'What if you were already the version of you you keep delaying?',
    images: ['/og'],
  },
};

export default function Landing() {
  const cards = [variants.decide, variants.extend, variants.imagine];

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center bg-ink px-6 pb-16 pt-[10vh] text-cream">
      <LandingView />
      <BrandMonogram size={36} />
      <h1 className="mt-12 max-w-[20ch] text-center font-serif text-[clamp(2rem,7vw,3rem)] font-semibold leading-[1.1] tracking-tightest text-cream">
        What if you were already the version of you you keep delaying?
      </h1>
      <p className="mt-5 text-center font-serif text-lg text-cream/65">
        Three ways in. Pick the one closest.
      </p>
      <div className="mt-12 flex w-full max-w-[960px] flex-col gap-5 md:flex-row md:items-stretch md:gap-6">
        {cards.map((bundle) => (
          <LandingCard key={bundle.slug} bundle={bundle} />
        ))}
      </div>
    </main>
  );
}
