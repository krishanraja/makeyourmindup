import { events } from './analytics';

export function reportError(stage: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  if (typeof console !== 'undefined') {
    console.error(`[${stage}]`, err);
  }
  events.error(stage, message);
}
