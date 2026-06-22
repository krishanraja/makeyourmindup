// Pure, dependency-free, network-free identity parsing.
// Used server-side by enrich-profile to normalize whatever the user dropped
// (LinkedIn URL / email / name+domain) into a clean resolver seed. The client
// never gets trusted; this runs again on the backend.

export type LinkedInRef = {
  canonicalUrl: string | null; // https://www.linkedin.com/in/<slug>
  slug: string | null; // vanity slug, lowercased
  valid: boolean;
};

export type EmailRef = {
  email: string | null; // trimmed, lowercased
  domain: string | null; // host after @
  isFreeProvider: boolean; // gmail/outlook/yahoo/... (personal, not a company)
  valid: boolean; // RFC-ish shape only, no network
};

export type NameRef = { first: string | null; last: string | null; full: string | null };

// The normalized input handed to the resolver waterfall.
export type ResolverSeed = {
  raw: Record<string, string | null>;
  email: string | null;
  domain: string | null;
  isFreeEmail: boolean;
  linkedinUrl: string | null;
  linkedinSlug: string | null;
  first: string | null;
  last: string | null;
  fullName: string | null;
  company: string | null; // raw company text when no domain could be derived
};

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.co.uk',
  'ymail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'aol.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'zoho.com',
  'fastmail.com',
  'hey.com',
  'yandex.com',
  'qq.com',
  '163.com',
]);

const NON_PERSON_PATHS = /^\/(company|school|feed|jobs|posts|pulse|groups|showcase)(\/|$)/i;

/**
 * Normalize a (possibly messy) LinkedIn profile URL.
 * Handles: missing scheme, m./country subdomains, UTM/query/hash, /in/ and
 * legacy /pub/ forms, trailing slashes. Rejects company/school/feed pages.
 */
export function normalizeLinkedInUrl(raw: string): LinkedInRef {
  const miss: LinkedInRef = { canonicalUrl: null, slug: null, valid: false };
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return miss;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return miss;
  }

  const host = url.hostname.toLowerCase();
  // linkedin.com, www.linkedin.com, m.linkedin.com, uk.linkedin.com, etc.
  if (!/(^|\.)linkedin\.com$/.test(host)) return miss;

  // Path without query/hash, no trailing slash.
  const path = url.pathname.replace(/\/+$/, '');
  if (NON_PERSON_PATHS.test(path)) return miss;

  // /in/<slug> (preferred) or legacy /pub/<name>/<a>/<b>/<c>.
  const inMatch = path.match(/^\/in\/([^/]+)/i);
  if (inMatch) {
    const slug = decodeURIComponent(inMatch[1]).toLowerCase();
    if (!slug) return miss;
    return {
      canonicalUrl: `https://www.linkedin.com/in/${slug}`,
      slug,
      valid: true,
    };
  }

  const pubMatch = path.match(/^\/pub\/([^/]+)/i);
  if (pubMatch) {
    // Legacy /pub/ URLs don't map cleanly to a /in/ slug; keep the canonical
    // www host + full path so the resolver/scraper can still use it.
    const slug = decodeURIComponent(pubMatch[1]).toLowerCase();
    return {
      canonicalUrl: `https://www.linkedin.com${path}`,
      slug: slug || null,
      valid: true,
    };
  }

  return miss;
}

/** Parse + validate an email and derive its domain. Shape check only. */
export function parseEmail(raw: string): EmailRef {
  const miss: EmailRef = { email: null, domain: null, isFreeProvider: false, valid: false };
  const trimmed = (raw ?? '').trim().toLowerCase();
  if (!trimmed) return miss;
  // Deliberately permissive RFC-ish check; NeverBounce does real validation.
  const m = trimmed.match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
  if (!m) return miss;
  const domain = m[1];
  return {
    email: trimmed,
    domain,
    isFreeProvider: FREE_EMAIL_DOMAINS.has(domain),
    valid: true,
  };
}

/** Split a free-text name into first/last (best effort). */
export function parseName(raw: string): NameRef {
  const full = (raw ?? '').trim().replace(/\s+/g, ' ');
  if (!full) return { first: null, last: null, full: null };
  const parts = full.split(' ');
  if (parts.length === 1) return { first: parts[0], last: null, full };
  return { first: parts[0], last: parts.slice(1).join(' '), full };
}

/** Strip scheme/path/www/@ from a company string and return a bare domain. */
export function normalizeDomain(raw: string): string | null {
  let s = (raw ?? '').trim().toLowerCase();
  if (!s) return null;
  // If they typed an email, take the domain.
  if (s.includes('@')) s = s.split('@').pop() ?? '';
  // Strip scheme + path.
  s = s.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  // Must look like a domain (has a dot, valid chars). Otherwise it's a name.
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) return null;
  return s;
}

/** Build the resolver seed from the parsed enrichment payload. */
export function buildSeed(input: {
  email?: string;
  url?: string;
  name?: string;
  company?: string;
}): ResolverSeed {
  const emailRef = input.email ? parseEmail(input.email) : null;
  const liRef = input.url ? normalizeLinkedInUrl(input.url) : null;
  const nameRef = input.name ? parseName(input.name) : null;
  const companyDomain = input.company ? normalizeDomain(input.company) : null;

  return {
    raw: {
      email: input.email ?? null,
      url: input.url ?? null,
      name: input.name ?? null,
      company: input.company ?? null,
    },
    email: emailRef?.valid ? emailRef.email : null,
    domain: emailRef?.valid ? emailRef.domain : companyDomain,
    isFreeEmail: emailRef?.isFreeProvider ?? false,
    linkedinUrl: liRef?.valid ? liRef.canonicalUrl : null,
    linkedinSlug: liRef?.valid ? liRef.slug : null,
    first: nameRef?.first ?? null,
    last: nameRef?.last ?? null,
    fullName: nameRef?.full ?? null,
    // Keep the raw company text only when it wasn't a usable domain.
    company: companyDomain ? null : (input.company?.trim() || null),
  };
}
