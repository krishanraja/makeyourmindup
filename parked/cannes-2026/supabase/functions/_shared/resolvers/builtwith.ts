import { env, fetchJson } from './http.ts';
import type { ProviderResult } from './types.ts';

const URL = 'https://api.builtwith.com/v21/api.json';

type BuiltWithResponse = {
  Results?: Array<{
    Result?: {
      Paths?: Array<{
        Technologies?: Array<{ Name?: string | null; Tag?: string | null }> | null;
      }> | null;
    } | null;
  }> | null;
};

// Operator-relevant tech categories worth surfacing as a signal.
const RELEVANT_TAGS = new Set(['ecommerce', 'cms', 'analytics', 'marketing', 'payment', 'framework']);

/** Company tech stack from a domain (kept only when operator-relevant). */
export async function resolveBuiltWith(domain: string): Promise<ProviderResult> {
  const key = env('BUILTWITH_API_KEY');
  if (!key || !domain) return null;

  const data = await fetchJson<BuiltWithResponse>(
    `${URL}?KEY=${encodeURIComponent(key)}&LOOKUP=${encodeURIComponent(domain)}`,
    { timeoutMs: 4000, label: 'builtwith' },
  );
  const paths = data?.Results?.[0]?.Result?.Paths ?? [];
  const techs = new Set<string>();
  for (const path of paths) {
    for (const t of path?.Technologies ?? []) {
      if (t?.Name && (!t.Tag || RELEVANT_TAGS.has(t.Tag.toLowerCase()))) techs.add(t.Name);
    }
  }
  if (!techs.size) return null;

  return {
    provider: 'builtwith',
    person: { techStack: [...techs].slice(0, 8) },
  };
}
