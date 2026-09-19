'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/Slider';
import { sliderLabel, type SliderQuestion } from '../questions';

type Props = {
  question: SliderQuestion;
  initial: number;
  onSubmit: (value: number) => void;
};

export function QuestionSlider({ question, initial, onSubmit }: Props) {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);

  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-[12vh]">
      <p className="font-serif text-[clamp(1.5rem,5.5vw,2.1rem)] leading-[1.18] tracking-tightest text-cream">
        {question.prompt}
      </p>
      <div className="flex-1" />
      <div className="flex flex-col gap-6 pb-[env(safe-area-inset-bottom)]">
        <motion.p
          key={sliderLabel(question, value)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={touched ? 'font-serif text-lg italic text-cream/85' : 'font-serif text-lg italic text-cream/60'}
        >
          {touched ? sliderLabel(question, value) : 'Drag to choose.'}
        </motion.p>
        <Slider
          initial={initial}
          ariaLabel={question.prompt}
          onChange={(v) => {
            setValue(v);
            setTouched(true);
          }}
        />
        <button
          type="button"
          disabled={!touched}
          onClick={() => onSubmit(value)}
          className="self-end font-serif text-lg text-cream/90 underline-offset-[6px] transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
