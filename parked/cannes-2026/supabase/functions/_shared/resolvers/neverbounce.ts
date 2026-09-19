import { env, fetchJson } from './http.ts';

// NeverBounce single-email verification. Gates lookups (skip credits on bad
// emails) and protects the downstream Resend send from bouncing.
// Returns: true (deliverable/catch-all), false (undeliverable), null (unknown/no key).
export async function verifyEmail(email: string): Promise<boolean | null> {
  const key = env('NEVERBOUNCE_API_KEY');
  if (!key || !email) return null;
  const data = await fetchJson<{ status?: string; result?: string }>(
    `https://api.neverbounce.com/v4/single/check?key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}`,
    { timeoutMs: 4000, label: 'neverbounce' },
  );
  if (!data || data.status !== 'success') return null;
  // valid + catchall are usable; disposable/invalid/unknown are not deliverable.
  if (data.result === 'valid' || data.result === 'catchall') return true;
  if (data.result === 'invalid' || data.result === 'disposable') return false;
  return null;
}
