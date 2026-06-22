import type { ResolverSeed } from '../identity.ts';
import { env, fetchJson } from './http.ts';
import type { Experience, ProviderResult } from './types.ts';

const MATCH_URL = 'https://api.apollo.io/api/v1/people/match';
const ORG_URL = 'https://api.apollo.io/api/v1/organizations/enrich';

type ApolloOrg = {
  name?: string | null;
  website_url?: string | null;
  primary_domain?: string | null;
  short_description?: string | null;
  industry?: string | null;
  estimated_num_employees?: number | null;
  logo_url?: string | null;
  latest_funding_stage?: string | null;
};

type ApolloPerson = {
  name?: string | null;
  title?: string | null;
  headline?: string | null;
  linkedin_url?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  seniority?: string | null;
  departments?: string[] | null;
  employment_history?: Array<{ title?: string | null; organization_name?: string | null; current?: boolean | null }> | null;
  organization?: ApolloOrg | null;
};

/**
 * Apollo People Match. Strongest on work emails and name+domain. Apollo's B2B
 * graph carries linkedin_url even when the work email isn't publicly linked,
 * which is the key to the work-email -> LinkedIn problem. Also returns the org.
 */
export async function resolveApollo(seed: ResolverSeed): Promise<ProviderResult> {
  const key = env('APOLLO_API_KEY');
  if (!key) return null;

  const payload: Record<string, unknown> = { reveal_personal_emails: false };
  // Don't spend Apollo work-email credits on free/personal emails.
  if (seed.email && !seed.isFreeEmail) payload.email = seed.email;
  if (seed.linkedinUrl) payload.linkedin_url = seed.linkedinUrl;
  if (seed.first) payload.first_name = seed.first;
  if (seed.last) payload.last_name = seed.last;
  if (seed.domain) payload.domain = seed.domain;
  if (seed.company) payload.organization_name = seed.company;

  const hasIdentifier =
    payload.email || payload.linkedin_url || (payload.first_name && (payload.domain || payload.organization_name));
  if (!hasIdentifier) return null;

  const data = await fetchJson<{ person?: ApolloPerson | null }>(MATCH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, accept: 'application/json' },
    body: JSON.stringify(payload),
    timeoutMs: 5000,
    label: 'apollo-match',
  });

  const person = data?.person;
  if (!person) return null;

  const org = person.organization ?? null;
  const experience: Experience[] = (person.employment_history ?? [])
    .filter((e) => e?.title && e?.organization_name)
    .slice(0, 6)
    .map((e) => ({
      title: e.title as string,
      company: e.organization_name as string,
      isCurrent: Boolean(e.current),
    }));

  const location = [person.city, person.state, person.country].filter(Boolean).join(', ') || null;

  return {
    provider: 'apollo',
    person: {
      name: person.name ?? null,
      role: person.title ?? person.headline ?? null,
      company: org?.name ?? null,
      companyDomain: org?.primary_domain ?? cleanDomain(org?.website_url),
      linkedinUrl: person.linkedin_url ?? null,
      location,
      experience,
      companyBlurb: org?.short_description ?? null,
      industry: org?.industry ?? null,
      headcount: org?.estimated_num_employees ? String(org.estimated_num_employees) : null,
      fundingStage: org?.latest_funding_stage ?? null,
      logoUrl: org?.logo_url ?? null,
    },
  };
}

/** Organization enrichment by domain (used when Stage B didn't return an org). */
export async function enrichApolloOrg(domain: string): Promise<ApolloOrg | null> {
  const key = env('APOLLO_API_KEY');
  if (!key) return null;
  const data = await fetchJson<{ organization?: ApolloOrg | null }>(
    `${ORG_URL}?domain=${encodeURIComponent(domain)}`,
    {
      headers: { 'x-api-key': key, accept: 'application/json' },
      timeoutMs: 5000,
      label: 'apollo-org',
    },
  );
  return data?.organization ?? null;
}

function cleanDomain(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '') || null;
}
