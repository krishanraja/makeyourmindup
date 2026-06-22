import { env, fetchJson } from './http.ts';
import type { Experience, ProviderResult } from './types.ts';

// Live LinkedIn profile scrape — LAST RESORT only (LinkedIn ToS/legal risk).
// Used when we have a profile URL but structured providers returned a thin
// result. The actor id is configurable; defaults to a public profile scraper.
// Hard-capped at 25s so a hung actor can't keep the function alive.

const DEFAULT_ACTOR = 'dev_fusion~linkedin-profile-scraper';

type ApifyProfile = {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  headline?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  about?: string | null;
  addressWithCountry?: string | null;
  experiences?: Array<{ title?: string | null; subtitle?: string | null }> | null;
};

export async function scrapeLinkedIn(profileUrl: string): Promise<ProviderResult> {
  const key = env('APIFY_API_KEY');
  if (!key || !profileUrl) return null;
  const actor = env('APIFY_LINKEDIN_ACTOR') ?? DEFAULT_ACTOR;

  const items = await fetchJson<ApifyProfile[]>(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actor)}/run-sync-get-dataset-items?token=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profileUrls: [profileUrl] }),
      timeoutMs: 25000,
      label: 'apify',
    },
  );
  const p = items?.[0];
  if (!p) return null;

  const name = p.fullName ?? ([p.firstName, p.lastName].filter(Boolean).join(' ') || null);
  const experience: Experience[] = (p.experiences ?? [])
    .filter((e) => e?.title)
    .slice(0, 6)
    .map((e, i) => ({
      title: e.title as string,
      company: e.subtitle ?? '',
      isCurrent: i === 0,
    }));

  if (!name && !p.jobTitle && !p.headline) return null;

  return {
    provider: 'apify',
    person: {
      name,
      role: p.jobTitle ?? p.headline ?? null,
      company: p.companyName ?? null,
      location: p.addressWithCountry ?? null,
      experience,
    },
  };
}
