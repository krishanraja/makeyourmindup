'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sigil } from '@/components/sigil/Sigil';
import { compose } from '@/components/sigil/compose';
import { BrandMonogram } from '@/components/BrandMonogram';
import { track } from '@/lib/analytics';
import { useVariant } from '../VariantProvider';
import type { Answers, ResultPayload } from '@/lib/types';

type Props = {
  responseId: string;
  answers: Answers;
  result: ResultPayload;
  completionMs: number;
  onEmail: (email: string) => void;
};

export function Result({ responseId, answers, result, onEmail }: Props) {
  const { bundle } = useVariant();
  const sigilParams = useMemo(() => compose(answers), [answers]);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    track(bundle.analytics.completeEvent);
  }, [bundle.analytics.completeEvent]);

  const submit = async () => {
    const trimmed = email.trim();
    if (!isEmail(trimmed) || submitting) return;
    setSubmitting(true);
    onEmail(trimmed);
  };

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 pb-12 pt-[10vh]">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-[clamp(1.85rem,6.5vw,2.6rem)] font-semibold leading-[1.1] tracking-tightest"
      >
        <span className="brand-gradient-text">{result.archetypeTitle}</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="flex flex-col gap-6 font-serif text-[1.05rem] leading-[1.5] text-cream/85"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/55">
          {bundle.resultLens.resultIntroLine}
        </p>
        <p>{result.twelveMonths}</p>
        <p>{result.threeYears}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.85, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-3 rounded-3xl py-8"
        style={{
          backgroundColor: '#F5F1EA',
          color: '#0A0908',
          colorScheme: 'light',
          forcedColorAdjust: 'none',
        }}
      >
        <Sigil params={sigilParams} size={240} />
        <p
          className="px-6 text-center font-serif text-base font-semibold"
          style={{ color: '#0A0908' }}
        >
          {result.archetypeTitle}
        </p>
        <p
          className="font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'rgba(10, 9, 8, 0.6)' }}
        >
          {bundle.resultLens.shareCardSubtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.6 }}
        className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]"
      >
        <label className="flex flex-col gap-2">
          <span className="font-serif text-base text-cream/80">Send this to yourself</span>
          <div className="flex items-center border-b border-cream/20 focus-within:border-cream/60">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              className="w-full bg-transparent py-2 font-serif text-[1.05rem] text-cream placeholder:text-cream/55"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!isEmail(email.trim()) || submitting}
              className="font-serif text-lg text-cream/90 underline-offset-[6px] transition-opacity hover:underline disabled:opacity-30"
            >
              {submitting ? 'Sent' : 'Send'}
            </button>
          </div>
        </label>
        <p className="font-serif text-sm italic text-cream/60">
          We&apos;ll also include three things to read this week that fit what you just told us. From Krish, the operator behind this.
        </p>
        <p className="mt-6 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/55">
          <span>makeyourmindup.ai · by</span>
          <BrandMonogram size={12} className="opacity-80" />
          <span>Mindmaker</span>
        </p>
      </motion.div>
    </div>
  );
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
