export type ExtraSelf = 'think' | 'do' | 'talk' | 'watch';
export type CompanyFuture = 'same' | 'leaner' | 'hybrid' | 'autonomous';

export type Answers = {
  q1: number;
  q2: ExtraSelf;
  q3: number;
  q4: CompanyFuture;
  q5: string;
};

export type ResultPayload = {
  archetypeTitle: string;
  archetypeKey: string;
  archetypeVariant: 'A' | 'B';
  twelveMonths: string;
  threeYears: string;
};

export type Source = 'qr' | 'direct' | 'shared';

export type UtmFields = {
  source?: string;
  medium?: string;
  campaign?: string;
};

export type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ForkDestination = 'substack' | 'mindmaker' | 'ctrl';
