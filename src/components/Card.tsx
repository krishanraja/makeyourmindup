'use client';

import { motion } from 'framer-motion';

type Props = {
  text: string;
  selected: boolean;
  dimmed: boolean;
  onClick: () => void;
};

export function Card({ text, selected, dimmed, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      animate={{
        opacity: dimmed ? 0 : 1,
        y: selected ? -8 : 0,
      }}
      transition={{
        opacity: { duration: 0.24, ease: 'easeOut' },
        y: { type: 'spring', stiffness: 380, damping: 30 },
      }}
      className={[
        'relative w-full rounded-2xl border px-5 py-5 text-left font-serif text-[1.05rem] leading-[1.3] backdrop-blur-sm transition-colors',
        selected
          ? 'border-transparent bg-cream/[0.08] text-cream shadow-[0_18px_50px_-20px_rgba(236,72,153,0.55)]'
          : 'border-cream/20 bg-cream/[0.02] text-cream/90 hover:border-cream/40 hover:bg-cream/[0.04]',
      ].join(' ')}
    >
      {selected && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 1,
            background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}
      {text}
    </motion.button>
  );
}
