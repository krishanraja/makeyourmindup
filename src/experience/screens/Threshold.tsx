'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { TypedLine } from '@/components/TypedLine';

type Props = {
  onContinue: () => void;
  onExit: () => void;
};

export function Threshold({ onContinue, onExit }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-[18vh]">
      <div className="flex-1">
        <TypedLine
          text="What if you were already the version of yourself you keep delaying?"
          className="max-w-[18ch] font-serif text-[clamp(2rem,7vw,2.75rem)] leading-[1.1] tracking-tightest text-cream"
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 2.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5 pb-[env(safe-area-inset-bottom)]"
      >
        <button
          type="button"
          onClick={onContinue}
          className="text-left font-serif text-lg text-cream/90 underline-offset-[6px] transition-colors hover:text-cream hover:underline"
        >
          Show me
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
