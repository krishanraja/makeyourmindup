'use client';

import { useState } from 'react';
import { CyclingPlaceholder } from '@/components/CyclingPlaceholder';
import type { TextQuestion } from '../questions';

type Props = {
  question: TextQuestion;
  onSubmit: (value: string) => void;
};

export function QuestionText({ question, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-12 pt-[12vh]">
      <p className="font-serif text-[clamp(1.5rem,5.5vw,2.1rem)] leading-[1.18] tracking-tightest text-cream">
        {question.prompt}
      </p>
      <div className="flex flex-col gap-6 pb-[env(safe-area-inset-bottom)]">
        <div className="relative border-b border-cream/20 focus-within:border-cream/60">
          {value.length === 0 && (
            <CyclingPlaceholder
              examples={question.placeholderCycle}
              className="pointer-events-none absolute inset-x-0 top-1.5 font-serif italic text-cream/30"
            />
          )}
          <input
            type="text"
            maxLength={question.maxLength}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            className="w-full bg-transparent py-1.5 font-serif text-[1.05rem] text-cream"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
        <p className="font-serif text-sm italic text-cream/40">{question.hint}</p>
        <button
          type="button"
          onClick={submit}
          disabled={value.trim().length === 0}
          className="self-end font-serif text-lg text-cream/90 underline-offset-[6px] transition-opacity hover:underline disabled:opacity-30"
        >
          Done
        </button>
      </div>
    </div>
  );
}
