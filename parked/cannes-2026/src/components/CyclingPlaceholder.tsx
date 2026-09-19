'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Props = {
  examples: string[];
  intervalMs?: number;
  className?: string;
};

export function CyclingPlaceholder({ examples, intervalMs = 3000, className }: Props) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % examples.length), intervalMs);
    return () => clearInterval(t);
  }, [examples.length, intervalMs]);

  if (reduced) {
    return (
      <span className={className} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {examples[i]}
      </span>
    );
  }

  return (
    <span className={className} style={{ overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {examples[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
