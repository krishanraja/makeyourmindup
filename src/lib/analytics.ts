type Payload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, payload: Payload = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload, ts: Date.now() });
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
