import type { ResolverSeed } from '../identity.ts';
import { env, fetchJson } from './http.ts';
import type { Experience, ProviderResult } from './types.ts';

const PDL_URL = 'https://api.peopledatalabs.com/v5/person/enrich';

type PdlExperience = {
  title?: { name?: string | null } | null;
  company?: { name?: string | null } | null;
  is_primary?: boolean | null;
};

type PdlResponse = {
  status: number;
  likelihood?: number;
  data?: {
    full_name?: string | null;
    job_title?: string | null;
    job_company_name?: string | null;
    job_company_website?: string | null;
    linkedin_url?: string | null;
    location_name?: string | null;
    experience?: PdlExperience[] | null;
  };
};

/**
 * People Data Labs person enrichment. Strong coverage for personal emails,
 * linkedin_url, and name+company. Uses min_likelihood to avoid junk matches.
 */
export async function resolvePdl(seed: ResolverSeed): Promise<ProviderResult> {
  const key = env('PEOPLE_DATA_LABS_API_KEY');
  if (!key) return null;

  const params = new URLSearchParams();
  if (seed.email) params.set('email', seed.email);
  if (seed.linkedinUrl) params.set('profile', seed.linkedinUrl);
  if (seed.fullName) params.set('name', seed.fullName);
  if (seed.domain) params.set('company', seed.domain);
  params.set('min_likelihood', '6');
  params.set('titlecase', 'true');

  // Need at least one strong identifier.
  if (!seed.email && !seed.linkedinUrl && !(seed.fullName && seed.domain)) return null;

  const data = await fetchJson<PdlResponse>(`${PDL_URL}?${params.toString()}`, {
    headers: { 'X-Api-Key': key, accept: 'application/json' },
    timeoutMs: 5000,
    label: 'pdl',
  });

  if (!data || data.status !== 200 || !data.data) return null;
  const d = data.data;

  const experience: Experience[] = (d.experience ?? [])
    .filter((e) => e?.title?.name && e?.company?.name)
    .slice(0, 6)
    .map((e) => ({
      title: e.title!.name as string,
      company: e.company!.name as string,
      isCurrent: Boolean(e.is_primary),
    }));

  return {
    provider: 'pdl',
    person: {
      name: d.full_name ?? null,
      role: d.job_title ?? null,
      company: d.job_company_name ?? null,
      companyDomain: cleanDomain(d.job_company_website),
      linkedinUrl: d.linkedin_url ?? null,
      location: d.location_name ?? null,
      experience,
    },
  };
}

function cleanDomain(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '') || null;
}
