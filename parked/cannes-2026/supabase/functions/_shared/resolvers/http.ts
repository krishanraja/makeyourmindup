import { withTimeout } from '../with-timeout.ts';

// Thin JSON fetch wrapper. Returns null on any error/non-2xx so a single
// provider failure never breaks the waterfall. Caller logs context.
export async function fetchJson<T = unknown>(
  url: string,
  init: RequestInit & { timeoutMs?: number; label?: string } = {},
): Promise<T | null> {
  const { timeoutMs = 5000, label = 'provider', ...rest } = init;
  try {
    const res = await withTimeout(
      (signal) => fetch(url, { ...rest, signal }),
      { ms: timeoutMs, label },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`${label} ${res.status}: ${body.slice(0, 200)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`${label} error`, err instanceof Error ? err.message : err);
    return null;
  }
}

export function env(name: string): string | null {
  return Deno.env.get(name) ?? null;
}
