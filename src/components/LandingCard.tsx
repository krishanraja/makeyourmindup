'use client';

import Link from 'next/link';
import type { VariantBundle } from '@/lib/variants';
import { trackLandingCardClicked } from '@/lib/analytics';

type Props = {
  bundle: VariantBundle;
};

// Variant accent stripe, shared with the OG cards. Full literals so Tailwind's
// content scanner keeps them.
const ACCENT: Record<VariantBundle['slug'], string> = {
  decide: 'border-l-[#FF8A65]',
  extend: 'border-l-[#7BB3FF]',
  imagine: 'border-l-[#C8A2FF]',
};

export function LandingCard({ bundle }: Props) {
  const { eyebrow, body, cta } = bundle.hero;

  return (
    <Link
      href={`/${bundle.slug}`}
      aria-label={`${eyebrow} ${body}`}
      onClick={() => trackLandingCardClicked(bundle.slug)}
      className={`group flex flex-1 flex-col gap-4 rounded-2xl border border-cream/10 border-l-4 ${ACCENT[bundle.slug]} bg-cream/[0.04] p-6 transition-colors duration-200 hover:bg-cream/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream/60 active:opacity-80`}
    >
      <span className="font-serif text-2xl font-semibold tracking-tightest text-cream">
        {eyebrow}
      </span>
      <p className="font-serif text-[1.05rem] leading-[1.45] text-cream/80">{body}</p>
      <span className="mt-auto flex items-center justify-end gap-1.5 pt-2 font-mono text-xs uppercase tracking-[0.18em] text-cream/65 transition-colors group-hover:text-cream">
        {cta}
        <span aria-hidden>&rarr;</span>
      </span>
    </Link>
  );
}
