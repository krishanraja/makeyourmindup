'use client';

import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  text: string;
  className?: string;
  delay?: number;
};

export function TypedLine({ text, className, delay = 0.2 }: Props) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <p className={className}>{text}</p>;
  }
  return (
    <p className={className}>
      <motion.span
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ delay, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'inline-block' }}
      >
        {text}
      </motion.span>
    </p>
  );
}
