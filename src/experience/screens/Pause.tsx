'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function Pause() {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col items-start justify-center px-6 pb-12 pt-[20vh]">
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-[clamp(1.5rem,5.5vw,2.1rem)] leading-[1.18] tracking-tightest text-cream"
      >
        Reading what you just told us.
      </motion.p>
      <motion.div
        aria-hidden
        className="mt-8 h-px w-16 brand-gradient"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0.4 : 2.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'left center' }}
      />
    </div>
  );
}
