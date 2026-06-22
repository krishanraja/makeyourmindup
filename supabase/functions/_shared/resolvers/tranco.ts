import { fetchJson } from './http.ts';
import type { ProviderResult } from './types.ts';

const URL = 'https://tranco-list.eu/api/ranks/domain/';

type TrancoResponse = { ranks?: Array<{ rank?: number | null }> | null };

/**
 * Domain popularity rank. Used to qualify signals ("top-10k web property") and
 * to gate expensive calls for obviously tiny domains. Public endpoint; the key
 * is not required for single-domain lookups.
 */
export async function resolveTranco(domain: string): Promise<ProviderResult> {
  if (!domain) return null;
  const data = await fetchJson<TrancoResponse>(`${URL}${encodeURIComponent(domain)}`, {
    timeoutMs: 3000,
    label: 'tranco',
  });
  const rank = data?.ranks?.find((r) => typeof r?.rank === 'number')?.rank ?? null;
  if (rank == null) return null;
  return { provider: 'tranco', person: { companyRank: rank } };
}
