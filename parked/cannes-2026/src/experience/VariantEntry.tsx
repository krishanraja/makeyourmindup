'use client';

import type { Variant } from '@/lib/variants';
import { VariantProvider } from './VariantProvider';
import { Experience } from './Experience';

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  variant: Variant;
  searchParams: SearchParams;
};

// Shared entry shell for the three variant routes. Mirrors the source/utm
// parsing the old root route did, then runs the same engine under a variant lens.
export function VariantEntry({ variant, searchParams }: Props) {
  const source = pickString(searchParams.source) ?? 'direct';
  const utm = {
    source: pickString(searchParams.utm_source),
    medium: pickString(searchParams.utm_medium),
    campaign: pickString(searchParams.utm_campaign),
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-ink text-cream">
      <VariantProvider variant={variant}>
        <Experience source={source} utm={utm} />
      </VariantProvider>
    </main>
  );
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
