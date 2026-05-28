import type { Variant } from './variants';

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// Properties merged into every event. The VariantProvider sets entry_variant
// here so the whole flow (screen views, answers, fork, etc.) carries the door
// the reader came through, without threading it through every call site.
let context: Payload = {};

export function setAnalyticsContext(ctx: Payload): void {
  context = { ...context, ...ctx };
}

export function track(event: string, payload: Payload = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...context, ...payload, ts: Date.now() });
}

export const events = {
  screen: (screen: string) => track('screen_view', { screen }),
  answer: (q: string, value: unknown) => track('question_answered', { q, value }),
  generated: (archetype_title: string, completion_time_ms: number) =>
    track('result_generated', { archetype_title, completion_time_ms }),
  email: () => track('email_captured'),
  fork: (destination: string) => track('fork_click', { destination }),
  error: (stage: string, message: string) => track('error', { stage, message }),
};

export function trackLandingViewed(): void {
  track('landing_viewed');
}

export function trackLandingCardClicked(variant: Variant): void {
  track('landing_card_clicked', { variant });
}
