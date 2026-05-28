'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sigil } from '@/components/sigil/Sigil';
import { compose } from '@/components/sigil/compose';
import { BrandMonogram } from '@/components/BrandMonogram';
import type { Answers, ResultPayload } from '@/lib/types';

type Props = {
  responseId: string;
  answers: Answers;
  result: ResultPayload;
  onFork: (destination: string) => void;
};

const FORKS: { destination: string; href: string; label: string }[] = [
  {
    destination: 'substack',
    href: 'https://live.themindmaker.ai',
    label: 'Read the Sunday brief',
  },
  {
    destination: 'mindmaker',
    href: 'https://themindmaker.ai',
    label: 'Take this further',
  },
  {
    destination: 'ctrl',
    href: 'https://ctrl.themindmaker.ai',
    label: 'Build your portable AI double',
  },
];

export function Fork({ result, answers, onFork }: Props) {
  const sigilParams = useMemo(() => compose(answers), [answers]);

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 pb-12 pt-[10vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-3 rounded-3xl bg-cream py-8"
      >
        <Sigil params={sigilParams} size={200} />
        <p className="px-6 text-center font-serif text-base font-semibold text-ink">
          {result.archetypeTitle}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
          makeyourmindup.ai
        </p>
      </motion.div>

      <p className="font-serif text-base italic text-cream/60">One more step, if you want it.</p>

      <div className="flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        {FORKS.map((f, i) => (
          <motion.a
            key={f.destination}
            href={f.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onFork(f.destination)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-cream/15 px-5 py-4 font-serif text-[1.05rem] text-cream/90 transition-colors hover:border-cream/30 hover:text-cream"
          >
            {f.label}
          </motion.a>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/55">
        <span>makeyourmindup.ai · by</span>
        <BrandMonogram size={12} className="opacity-80" />
        <span>Mindmaker</span>
      </p>
    </div>
  );
}
