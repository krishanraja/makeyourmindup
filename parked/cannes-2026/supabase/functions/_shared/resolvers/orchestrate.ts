import type { ResolverSeed } from '../identity.ts';
import { normalizeLinkedInUrl } from '../identity.ts';
import { enrichApolloOrg, resolveApollo } from './apollo.ts';
import { resolvePdl } from './pdl.ts';
import { resolveBrandfetch } from './brandfetch.ts';
import { resolveBuiltWith } from './builtwith.ts';
import { resolveTranco } from './tranco.ts';
import { scrapeLinkedIn } from './apify.ts';
import { verifyEmail } from './neverbounce.ts';
import {
  braveSnippets,
  exaSnippets,
  newsHeadlines,
  perplexitySnippets,
  searchLinkedInUrl,
} from './signals.ts';
import { synthesizeSignals } from './synthesize.ts';
import { mergeInto, mergePeople } from './merge.ts';
import type { ProviderResult, ResolvedPerson } from './types.ts';

type ResolveOpts = {
  // Called once, as soon as core identity resolves, so the caller can flip
  // enrichment_status to 'ready' inside the 6s downstream poll window.
  onCore?: (person: ResolvedPerson) => Promise<void> | void;
};

/**
 * The person-resolver waterfall. Resolves a seed (email / linkedin url /
 * name+domain) to a full person, calling onCore early with core identity, then
 * returning the fully enriched person (company context + synthesized signals).
 */
export async function resolve(seed: ResolverSeed, opts: ResolveOpts = {}): Promise<ResolvedPerson> {
  // Stage A.5 — email deliverability gate (cheap, also protects Resend).
  let emailDeliverable: boolean | null = null;
  if (seed.email) {
    emailDeliverable = await verifyEmail(seed.email);
    // Hard-invalid email: don't spend match credits on a dead identifier.
    if (emailDeliverable === false) seed = { ...seed, email: null };
  }

  // Stage B — structured identity, in parallel.
  const [pdl, apollo] = await Promise.all([
    safe(() => resolvePdl(seed), 'pdl'),
    safe(() => resolveApollo(seed), 'apollo'),
  ]);

  let person = mergePeople([apollo, pdl]); // Apollo first for work-email/org coverage.
  person.emailDeliverable = emailDeliverable;
  person.companyDomain = person.companyDomain ?? seed.domain;

  // Work-email -> LinkedIn edge case: identity but no profile URL.
  if (person.name && !person.linkedinUrl && (person.company || person.companyDomain)) {
    const found = await searchLinkedInUrl(person.name, person.company ?? person.companyDomain ?? '');
    if (found) {
      const norm = normalizeLinkedInUrl(found);
      if (norm.valid && norm.canonicalUrl) {
        person.linkedinUrl = norm.canonicalUrl;
        // provenance 'exa' keeps this out of the URL-anchored "high" check in
        // scoreConfidence; identity confidence still derives from name/role/company.
        person.provenance.linkedinUrl = 'exa';
      }
    }
  }

  // Early write so generate-result's poll gets a usable row right away.
  if (person.name || person.company || person.companyDomain) {
    await opts.onCore?.(person);
  }

  const domain = person.companyDomain ?? seed.domain;

  // Stage C — company context + web signal material, all in parallel.
  const [ctxResults, snippets] = await Promise.all([
    companyContext(domain, person),
    signalMaterial(person, domain),
  ]);

  person = mergeInto(person, ctxResults);
  person.emailDeliverable = emailDeliverable;
  person.newsHeadlines = snippets.news;

  // Stage D — live scrape fallback (last resort, slow, ToS risk).
  const thin = !person.role || person.experience.length === 0 || person.confidence === 'low';
  if (person.linkedinUrl && thin) {
    const scraped = await safe(() => scrapeLinkedIn(person.linkedinUrl as string), 'apify');
    if (scraped) person = mergeInto(person, [scraped]);
  }

  // Stage E — synthesize the final company_blurb + public_signals.
  const synth = await synthesizeSignals(person, [...snippets.web, ...snippets.news]);
  if (synth) {
    if (synth.company_blurb) person.companyBlurb = synth.company_blurb;
    if (synth.public_signals?.length) person.publicSignals = synth.public_signals;
  }

  person.emailDeliverable = emailDeliverable;
  return person;
}

function companyContext(
  domain: string | null,
  person: ResolvedPerson,
): Promise<ProviderResult[]> {
  if (!domain) return Promise.resolve([]);
  const tasks: Array<Promise<ProviderResult>> = [
    safe(() => resolveBrandfetch(domain), 'brandfetch'),
    safe(() => resolveBuiltWith(domain), 'builtwith'),
    safe(() => resolveTranco(domain), 'tranco'),
  ];
  // Only call Apollo org separately if Stage B didn't already give us a blurb.
  if (!person.companyBlurb) {
    tasks.push(
      safe(async () => {
        const org = await enrichApolloOrg(domain);
        if (!org) return null;
        return {
          provider: 'apollo' as const,
          person: {
            company: org.name ?? null,
            companyBlurb: org.short_description ?? null,
            industry: org.industry ?? null,
            headcount: org.estimated_num_employees ? String(org.estimated_num_employees) : null,
            fundingStage: org.latest_funding_stage ?? null,
            logoUrl: org.logo_url ?? null,
          },
        };
      }, 'apollo-org'),
    );
  }
  return Promise.all(tasks);
}

async function signalMaterial(
  person: ResolvedPerson,
  domain: string | null,
): Promise<{ web: string[]; news: string[] }> {
  const subject = [person.name, person.company ?? domain].filter(Boolean).join(' ');
  const company = person.company ?? domain ?? '';
  if (!subject && !company) return { web: [], news: [] };

  const [exa, perplexity, brave, news] = await Promise.all([
    subject ? safeArr(() => exaSnippets(`${subject} recent work, role, background`)) : Promise.resolve([]),
    subject ? safeArr(() => perplexitySnippets(`Recent professional background and notable facts about ${subject}`)) : Promise.resolve([]),
    subject ? safeArr(() => braveSnippets(subject)) : Promise.resolve([]),
    company ? safeArr(() => newsHeadlines(company)) : Promise.resolve([]),
  ]);

  return { web: [...exa, ...perplexity, ...brave].slice(0, 12), news };
}

function safe(fn: () => Promise<ProviderResult>, label: string): Promise<ProviderResult> {
  return fn().catch((err) => {
    console.error(`${label} threw`, err instanceof Error ? err.message : err);
    return null;
  });
}

function safeArr(fn: () => Promise<string[]>): Promise<string[]> {
  return fn().catch(() => []);
}
