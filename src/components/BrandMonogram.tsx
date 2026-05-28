'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

type Props = {
  size?: number;
  className?: string;
  animated?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGGER = 0.12;

export function BrandMonogram({ size = 32, className, animated = false }: Props) {
  const gradId = useId();
  const reduced = useReducedMotion();
  const useMotion = animated && !reduced;

  const shapeProps = (i: number) =>
    useMotion
      ? ({
          initial: { opacity: 0, scale: 0.6 },
          animate: { opacity: 1, scale: 1 },
          transition: { delay: 0.1 + i * STAGGER, duration: 0.75, ease: EASE },
          style: { transformOrigin: '100px 100px' },
        } as const)
      : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mindmaker monogram"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <motion.rect x="48" y="100" width="50" height="50" fill={`url(#${gradId})`} {...shapeProps(0)} />
      <motion.rect x="102" y="100" width="50" height="50" fill={`url(#${gradId})`} {...shapeProps(1)} />
      <motion.polygon points="65,96 81,96 89,72 57,72" fill={`url(#${gradId})`} {...shapeProps(2)} />
      <motion.polygon points="104,96 148,96 138,52 114,52" fill={`url(#${gradId})`} {...shapeProps(3)} />
    </svg>
  );
}
