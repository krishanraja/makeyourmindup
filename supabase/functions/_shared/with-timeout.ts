export class TimeoutError extends Error {
  constructor(public readonly ms: number, public readonly label: string) {
    super(`${label} timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  opts: { ms?: number; label?: string } = {},
): Promise<T> {
  const ms = opts.ms ?? 15_000;
  const label = opts.label ?? 'request';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new TimeoutError(ms, label)), ms);
  try {
    return await fn(ctrl.signal);
  } finally {
    clearTimeout(timer);
  }
}
