'use client';

import { createContext, useContext, useEffect } from 'react';
import type { Variant, VariantBundle } from '@/lib/variants';
import { variants } from '@/lib/variants';
import { setAnalyticsContext, track } from '@/lib/analytics';

type VariantContextValue = {
  variant: Variant;
  bundle: VariantBundle;
};

const VariantContext = createContext<VariantContextValue | null>(null);

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

export function VariantProvider({ variant, children }: Props) {
  const bundle = variants[variant];

  // Set synchronously during render so every downstream event carries
  // entry_variant, including the first screen_view the Experience fires on
  // mount (child effects run before this parent's effects).
  setAnalyticsContext({ entry_variant: variant });

  useEffect(() => {
    track(bundle.analytics.entryEvent);
  }, [bundle.analytics.entryEvent]);

  return <VariantContext.Provider value={{ variant, bundle }}>{children}</VariantContext.Provider>;
}

export function useVariant(): VariantContextValue {
  const ctx = useContext(VariantContext);
  if (!ctx) throw new Error('useVariant must be used within a VariantProvider');
  return ctx;
}
