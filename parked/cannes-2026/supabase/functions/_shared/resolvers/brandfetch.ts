import { env, fetchJson } from './http.ts';
import type { ProviderResult } from './types.ts';

const URL = 'https://api.brandfetch.io/v2/brands/';

type BrandfetchResponse = {
  name?: string | null;
  description?: string | null;
  longDescription?: string | null;
  logos?: Array<{ formats?: Array<{ src?: string | null }> | null }> | null;
  colors?: Array<{ hex?: string | null }> | null;
};

/** Company brand/description + logo + colors from a domain. */
export async function resolveBrandfetch(domain: string): Promise<ProviderResult> {
  const key = env('BRANDFETCH_API_KEY');
  if (!key || !domain) return null;

  const data = await fetchJson<BrandfetchResponse>(`${URL}${encodeURIComponent(domain)}`, {
    headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
    timeoutMs: 4000,
    label: 'brandfetch',
  });
  if (!data) return null;

  const logoUrl = data.logos?.[0]?.formats?.find((f) => f?.src)?.src ?? null;
  const brandColors = (data.colors ?? []).map((c) => c?.hex).filter((h): h is string => !!h);

  if (!data.name && !data.description && !logoUrl) return null;

  return {
    provider: 'brandfetch',
    person: {
      company: data.name ?? null,
      companyBlurb: data.longDescription ?? data.description ?? null,
      logoUrl,
      brandColors: brandColors.length ? brandColors.slice(0, 4) : null,
    },
  };
}
