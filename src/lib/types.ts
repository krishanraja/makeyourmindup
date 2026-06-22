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

// Steps: 0 threshold | 1 linkedin | 2 q1 | 3 q2 | 4 q3 | 5 q4 | 6 q5 | 7 pause | 8 result | 9 fork
export type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ForkDestination = 'substack' | 'mindmaker' | 'ctrl';

export type EnrichmentKind = 'email' | 'url' | 'image' | 'text';

export type EnrichmentPayload =
  | { kind: 'email'; email: string }
  | { kind: 'url'; url: string }
  | { kind: 'image'; image: string; mediaType: string }
  | { kind: 'text'; name: string; company: string };
