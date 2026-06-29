'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sigil } from '@/components/sigil/Sigil';
import { compose } from '@/components/sigil/compose';
import { MindmakerEndorsement } from '@/components/MindmakerEndorsement';
import type { Answers, ResultPayload } from '@/lib/types';

type Props = {
  responseId: string;
  answers: Answers;
  result: ResultPayload;
  onFork: (destination: string, consent?: boolean) => Promise<string | null> | void;
};

// The products with a "brain" that can start warm from a handoff.
const BRAIN_DESTINATIONS = new Set(['ctrl', 'mindmaker']);

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
  // Opt-in (default off): per-person signal crosses to another product only on
  // explicit consent. Only the categorised shape of the answers travels, never
  // the words you typed.
  const [consent, setConsent] = useState(false);

  const handleFork = (e: React.MouseEvent, destination: string, href: string) => {
    const wantHandoff = consent && BRAIN_DESTINATIONS.has(destination);
    if (!wantHandoff) {
      // Plain navigation: let the native anchor + fire-and-forget tracker run.
      void onFork(destination, false);
      return;
    }
    // Open the tab synchronously (dodges popup blockers), then fill its URL with
    // the handoff token once the tracker returns it.
    e.preventDefault();
    const w = window.open('about:blank', '_blank', 'noopener');
    Promise.resolve(onFork(destination, true)).then((token) => {
      const url = token ? `${href}?h=${token}` : href;
      if (w) w.location.href = url;
      else window.location.href = url;
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 pb-12 pt-[10vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-3 rounded-3xl py-8"
        style={{
          backgroundColor: '#F5F1EA',
          color: '#0A0908',
          colorScheme: 'light',
          forcedColorAdjust: 'none',
        }}
      >
        <Sigil params={sigilParams} size={200} />
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
            onClick={(e) => handleFork(e, f.destination, f.href)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-cream/15 px-5 py-4 font-serif text-[1.05rem] text-cream/90 transition-colors hover:border-cream/30 hover:text-cream"
          >
            {f.label}
          </motion.a>
        ))}

        {/* Consent to carry the categorised signal forward. Opt-in. */}
        <button
          type="button"
          onClick={() => setConsent((c) => !c)}
          aria-pressed={consent}
          className="mt-1 flex items-start gap-3 rounded-2xl border border-cream/10 px-5 py-4 text-left transition-colors hover:border-cream/20"
        >
          <span
            className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border transition-colors ${
              consent ? 'border-cream/70 bg-cream/90' : 'border-cream/30'
            }`}
          />
          <span className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-cream/55">
            Bring what you told me with you, so the door you open starts warm. Only the shape of
            your answers travels, never the words you typed.
          </span>
        </button>
      </div>

      <MindmakerEndorsement className="mt-6" />
    </div>
  );
}
