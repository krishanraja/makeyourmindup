'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { TypedLine } from '@/components/TypedLine';
import { BrandMonogram } from '@/components/BrandMonogram';
import { useVariant } from '../VariantProvider';

type Props = {
  onContinue: () => void;
  onExit: () => void;
};

export function Threshold({ onContinue, onExit }: Props) {
  const reduced = useReducedMotion();
  const { bundle } = useVariant();
  const { eyebrow, headline, body, cta } = bundle.hero;

  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-[8vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: reduced ? 0 : 0.4, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="pb-[8vh]"
      >
        <BrandMonogram size={28} />
      </motion.div>
      <div className="flex-1">
        <p className="pb-5 font-mono text-xs uppercase tracking-[0.24em] text-cream/55">
          {eyebrow}
        </p>
        <TypedLine
          text={headline}
          className="font-serif text-[clamp(2.25rem,9vw,3.25rem)] leading-[1.05] tracking-tightest text-cream"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-[26ch] font-serif text-lg leading-[1.45] text-cream/75"
        >
          {body}
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5 pb-[env(safe-area-inset-bottom)]"
      >
        <button
          type="button"
          onClick={onContinue}
          className="text-left font-serif text-lg text-cream/90 underline-offset-[6px] transition-colors hover:text-cream hover:underline"
        >
          {cta}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="text-left font-serif text-lg text-cream/60 underline-offset-[6px] transition-colors hover:text-cream/90 hover:underline"
        >
          Not today
        </button>
      </motion.div>
    </div>
  );
}
