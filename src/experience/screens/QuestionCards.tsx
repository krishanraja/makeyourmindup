'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import type { CardsQuestion } from '../questions';

type Props<T extends string> = {
  question: CardsQuestion<T>;
  onSubmit: (value: T) => void;
};

export function QuestionCards<T extends string>({ question, onSubmit }: Props<T>) {
  const [chosen, setChosen] = useState<T | null>(null);

  const handle = (v: T) => {
    if (chosen) return;
    setChosen(v);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12);
    }
    setTimeout(() => onSubmit(v), 360);
  };

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-12 pt-[12vh]">
      <p className="font-serif text-[clamp(1.5rem,5.5vw,2.1rem)] leading-[1.18] tracking-tightest text-cream">
        {question.prompt}
      </p>
      <div className="flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
        {question.options.map((o) => (
          <Card
            key={o.value}
            text={o.text}
            selected={chosen === o.value}
            dimmed={chosen !== null && chosen !== o.value}
            onClick={() => handle(o.value)}
          />
        ))}
      </div>
    </div>
  );
}
