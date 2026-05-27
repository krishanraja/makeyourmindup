import { fnv1a } from '@/lib/variant';
import type { Answers } from '@/lib/types';

export type FrameKind = 'none' | 'ring' | 'broken' | 'double';
export type FormKind = 'vesica' | 'lozenge' | 'triangle' | 'annulus';

export type SigilParams = {
  frame: FrameKind;
  form: FormKind;
  rotation: number;
  scale: number;
  dots: { angle: number }[];
};

const Q4_FRAME: Record<string, FrameKind> = {
  same: 'none',
  leaner: 'ring',
  hybrid: 'broken',
  autonomous: 'double',
};

const Q2_FORM: Record<string, FormKind> = {
  think: 'vesica',
  do: 'lozenge',
  talk: 'triangle',
  watch: 'annulus',
};

export function compose(answers: Pick<Answers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>): SigilParams {
  const frame = Q4_FRAME[answers.q4] ?? 'none';
  const form = Q2_FORM[answers.q2] ?? 'vesica';
  const rotation = Math.round(answers.q1 * 1.8);
  const scale = 0.55 + (answers.q3 / 100) * 0.35;
  const h = fnv1a(answers.q5 || 'unsaid');
  const dots = [
    { angle: h % 360 },
    { angle: (h * 7) % 360 },
    { angle: (h * 13) % 360 },
  ];
  return { frame, form, rotation, scale, dots };
}
