import { normalizeLinkedInUrl } from '../identity.ts';
import {
  emptyPerson,
  type Experience,
  type ProviderResult,
  type ResolvedPerson,
} from './types.ts';

// Scalar identity fields where "first non-null wins, in provider order".
const SCALAR_FIELDS: Array<keyof ResolvedPerson> = [
  'name',
  'role',
  'company',
  'companyDomain',
  'location',
  'companyBlurb',
  'companyRank',
  'industry',
  'headcount',
  'fundingStage',
  'logoUrl',
  'emailDeliverable',
];

/**
 * Merge provider results into a single person. Results should be passed in
 * priority order (most trusted first); the first non-null value for a scalar
 * field wins, arrays are unioned, and linkedinUrl is always re-normalized.
 */
export function mergePeople(results: ProviderResult[]): ResolvedPerson {
  return mergeInto(emptyPerson(), results);
}

/**
 * Layer additional provider results onto an already-resolved person without
 * losing its existing values or provenance. Only null scalars get filled;
 * arrays are unioned. Used for the late company-context / scrape patches so
 * Stage B's identity + provenance survive.
 */
export function mergeInto(base: ResolvedPerson, results: ProviderResult[]): ResolvedPerson {
  const out: ResolvedPerson = {
    ...base,
    experience: [...base.experience],
    publicSignals: [...base.publicSignals],
    newsHeadlines: [...base.newsHeadlines],
    provenance: { ...base.provenance },
    providersHit: [...base.providersHit],
  };
  const hit = new Set(out.providersHit);

  for (const r of results) {
    if (!r) continue;
    hit.add(r.provider);
    const p = r.person;

    for (const field of SCALAR_FIELDS) {
      if (out[field] == null && p[field] != null) {
        // deno-lint-ignore no-explicit-any
        (out as any)[field] = p[field];
        out.provenance[field] = r.provider;
      }
    }

    // linkedinUrl: prefer the first canonical /in/ URL we can normalize.
    if (out.linkedinUrl == null && p.linkedinUrl) {
      const norm = normalizeLinkedInUrl(p.linkedinUrl);
      if (norm.valid && norm.canonicalUrl) {
        out.linkedinUrl = norm.canonicalUrl;
        out.provenance.linkedinUrl = r.provider;
      }
    }

    if (p.experience?.length) out.experience = unionExperience(out.experience, p.experience);
    if (p.techStack?.length) out.techStack = unionStrings(out.techStack, p.techStack);
    if (p.brandColors?.length) out.brandColors = unionStrings(out.brandColors, p.brandColors);
    if (p.publicSignals?.length) {
      out.publicSignals = unionStrings(out.publicSignals, p.publicSignals) ?? [];
    }
    if (p.newsHeadlines?.length) {
      out.newsHeadlines = unionStrings(out.newsHeadlines, p.newsHeadlines) ?? [];
    }
  }

  out.providersHit = [...hit];
  out.confidence = scoreConfidence(out);
  return out;
}

function unionStrings(a: string[] | null, b: string[]): string[] | null {
  const seen = new Set((a ?? []).map((s) => s.toLowerCase().trim()));
  const merged = [...(a ?? [])];
  for (const s of b) {
    const key = s.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(s);
    }
  }
  return merged.length ? merged : null;
}

function unionExperience(a: Experience[], b: Experience[]): Experience[] {
  const seen = new Set(a.map((e) => `${e.title}|${e.company}`.toLowerCase()));
  const merged = [...a];
  for (const e of b) {
    const key = `${e.title}|${e.company}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(e);
    }
  }
  return merged;
}

/**
 * Confidence reflects how the identity was anchored:
 * - high: a structured provider returned a real LinkedIn URL or matched on email.
 * - medium: name + company/domain matched, or URL inferred via web search.
 * - low: only a thin/partial hit.
 */
function scoreConfidence(p: ResolvedPerson): ResolvedPerson['confidence'] {
  const fromProvider = (f: keyof ResolvedPerson) => p.provenance[f];
  const liFromStructured =
    p.linkedinUrl && ['pdl', 'apollo', 'apify', 'phantombuster'].includes(fromProvider('linkedinUrl') ?? '');
  if (liFromStructured && p.name && p.role) return 'high';
  if (p.name && (p.company || p.companyDomain) && p.role) return 'high';
  if (p.name && (p.company || p.companyDomain)) return 'medium';
  if (p.name) return 'low';
  return 'low';
}
