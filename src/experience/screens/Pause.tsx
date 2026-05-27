'use client';

import { motion, useReducedMotion } from 'framer-motion';

const BEATS = [
  { at: 0, text: 'Reading what you just told us.' },
  { at: 3.4, text: 'Finding the words.' },
  { at: 7.2, text: 'Almost there.' },
];

export function Pause() {
  const reduced = useReducedMotion();
  return (
    <div
      className="flex flex-1 flex-col items-start justify-center px-6 pb-12 pt-[18vh]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-5">
        {BEATS.map((b) => (
          <motion.p
            key={b.at}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduced ? 0 : b.at,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={
              b.at === 0
                ? 'font-serif text-[clamp(1.5rem,5.5vw,2.1rem)] leading-[1.18] tracking-tightest text-cream'
                : 'font-serif text-lg italic text-cream/65'
            }
          >
            {b.text}
          </motion.p>
        ))}
      </div>
      <motion.div
        aria-hidden
        className="mt-10 h-px w-16 brand-gradient"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0.4 : 2.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'left center' }}
      />
    </div>
  );
}
