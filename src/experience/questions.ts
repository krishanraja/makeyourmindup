import type { CompanyFuture, ExtraSelf } from '@/lib/types';

export type SliderQuestion = {
  kind: 'slider';
  key: 'q1' | 'q3';
  prompt: string;
  labels: { from: number; to: number; text: string }[];
};

export type CardOption<T extends string> = { value: T; text: string };

export type CardsQuestion<T extends string> = {
  kind: 'cards';
  key: 'q2' | 'q4';
  prompt: string;
  options: CardOption<T>[];
};

export type TextQuestion = {
  kind: 'text';
  key: 'q5';
  prompt: string;
  placeholderCycle: string[];
  hint: string;
  maxLength: number;
};

export const Q1: SliderQuestion = {
  kind: 'slider',
  key: 'q1',
  prompt: 'Picture your week as it is now. How much of it actually needs you?',
  labels: [
    { from: 0, to: 20, text: 'Almost none of it' },
    { from: 20, to: 50, text: 'About a quarter to half' },
    { from: 50, to: 80, text: 'Most of it' },
    { from: 80, to: 100, text: "All of it, and that's the problem" },
  ],
};

export const Q2: CardsQuestion<ExtraSelf> = {
  kind: 'cards',
  key: 'q2',
  prompt: 'If you had one extra version of yourself, what would they spend their time on?',
  options: [
    { value: 'think', text: 'Thinking. The deep work I never get to.' },
    { value: 'do', text: 'Doing. The execution that piles up.' },
    { value: 'talk', text: 'Talking. The conversations that move the business.' },
    { value: 'watch', text: "Watching. Knowing what's actually happening." },
  ],
};

export const Q3: SliderQuestion = {
  kind: 'slider',
  key: 'q3',
  prompt: 'How much of what your company does could a well-built AI handle today, if you let it?',
  labels: [
    { from: 0, to: 20, text: 'A few corners' },
    { from: 20, to: 50, text: 'A whole function' },
    { from: 50, to: 80, text: 'Most of operations' },
    { from: 80, to: 100, text: 'Almost everything except the choices' },
  ],
};

export const Q4: CardsQuestion<CompanyFuture> = {
  kind: 'cards',
  key: 'q4',
  prompt: 'What kind of company do you actually want to be running in three years?',
  options: [
    { value: 'same', text: 'The same one, just sharper.' },
    { value: 'leaner', text: 'A leaner one. Half the headcount, double the output.' },
    { value: 'hybrid', text: 'A hybrid. Humans and agents working as one team.' },
    { value: 'autonomous', text: 'An autonomous business. I set direction, the system runs.' },
  ],
};

export const Q5: TextQuestion = {
  kind: 'text',
  key: 'q5',
  prompt: "What's the one decision you keep not making?",
  placeholderCycle: [
    'Whether to let my team use AI without supervision',
    'Which AI tools to actually consolidate',
    "How to tell my board what's really happening",
    'Whether to rebuild the team around AI',
    'What to do with the people AI is replacing',
    'Where my real moat is now that anyone can clone the product',
    'What only I should still decide, and what to hand to AI',
  ],
  hint: 'Say it out loud. No one sees this but you.',
  maxLength: 80,
};

export function sliderLabel(q: SliderQuestion, value: number): string {
  for (const { from, to, text } of q.labels) {
    if (value >= from && value <= to) return text;
  }
  return q.labels[q.labels.length - 1].text;
}
