// Entry-variant copy bundles. One source of truth for the landing-page picker
// cards AND the variant entry hero/result lens. The three variants share the
// existing Q1-Q5 engine, sigil, and archetype: a variant only changes copy and
// the lens appended to the LLM prompt. (Not to be confused with src/lib/variant.ts,
// which is the unrelated A/B archetype picker.)

import { decide } from './decide';
import { extend } from './extend';
import { imagine } from './imagine';

export type Variant = 'decide' | 'extend' | 'imagine';

export interface VariantBundle {
  slug: Variant;
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    cta: string;
  };
  resultLens: {
    systemPromptAddition: string;
    resultIntroLine: string;
    shareText: string;
    shareCardSubtitle: string;
  };
  og: {
    title: string;
    subtitle: string;
  };
  analytics: {
    entryEvent: string;
    completeEvent: string;
  };
}

export { decide, extend, imagine };

export const variants: Record<Variant, VariantBundle> = { decide, extend, imagine };
