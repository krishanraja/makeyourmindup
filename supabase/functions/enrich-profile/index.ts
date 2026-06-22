import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';
import { withTimeout, TimeoutError } from '../_shared/with-timeout.ts';
import { buildSeed, type ResolverSeed } from '../_shared/identity.ts';
import { resolve } from '../_shared/resolvers/orchestrate.ts';
import type { ResolvedPerson } from '../_shared/resolvers/types.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

// Vision-only system prompt: extract a seed from a LinkedIn screenshot, which
// then re-enters the resolver waterfall as a name+company seed.
const VISION_SYSTEM = `You read a LinkedIn profile screenshot and return STRICT JSON only:
{ "name": string | null, "role": string | null, "company": string | null, "linkedin_slug": string | null }
Extract only what is visibly present. If a field is not visible, set it to null. No prose, no markdown fences.`;

type EmailBody = { id: string; kind: 'email'; email: string };
type UrlBody = { id: string; kind: 'url'; url: string };
type ImageBody = { id: string; kind: 'image'; image: string; mediaType?: string };
type TextBody = { id: string; kind: 'text'; name?: string; company?: string };
type Body = EmailBody | UrlBody | ImageBody | TextBody;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  if (!body?.id || !body?.kind) return json({ error: 'missing fields' }, 400);

  const supabase = serviceClient();

  await supabase
    .from('cannes_responses')
    .update({
      enrichment_status: 'pending',
      enrichment_kind: body.kind,
      enrichment_started_at: new Date().toISOString(),
    })
    .eq('id', body.id);

  let person: ResolvedPerson | null = null;
  let seed: ResolverSeed | null = null;
  try {
    seed = await seedFromBody(body);
    person = await resolve(seed, {
      // Early write the moment core identity resolves, so generate-result's
      // short poll gets a usable row before we finish layering signals.
      onCore: async (p) => {
        if (!hasContent(p)) return;
        await supabase
          .from('cannes_responses')
          .update(coreUpdate(p, seed))
          .eq('id', body.id);
      },
    });
  } catch (err) {
    if (err instanceof TimeoutError) console.error('enrichment timeout', err.message);
    else console.error('enrichment error', err);
  }

  if (!person || !hasContent(person)) {
    await supabase
      .from('cannes_responses')
      .update({
        enrichment_status: 'failed',
        enrichment_raw_input: seed ? rawInput(seed) : null,
        enrichment_completed_at: new Date().toISOString(),
      })
      .eq('id', body.id);
    return json({ ok: false, status: 'failed' });
  }

  const { error } = await supabase
    .from('cannes_responses')
    .update(fullUpdate(person, seed))
    .eq('id', body.id);
  if (error) console.error('enrichment update error', error);

  return json({ ok: true, status: 'ready', confidence: person.confidence });
});

async function seedFromBody(body: Body): Promise<ResolverSeed> {
  if (body.kind === 'email') return buildSeed({ email: body.email });
  if (body.kind === 'url') return buildSeed({ url: body.url });
  if (body.kind === 'text') return buildSeed({ name: body.name, company: body.company });
  // image: extract a seed via Claude vision, then resolve it like text/url.
  const extracted = await extractFromImage(body);
  return buildSeed({
    name: extracted?.name ?? undefined,
    company: extracted?.company ?? undefined,
    url: extracted?.linkedin_slug
      ? `https://www.linkedin.com/in/${extracted.linkedin_slug}`
      : undefined,
  });
}

type VisionExtract = { name: string | null; role: string | null; company: string | null; linkedin_slug: string | null };

async function extractFromImage(body: ImageBody): Promise<VisionExtract | null> {
  const { mediaType, data } = parseDataUrl(body.image, body.mediaType);
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return null;
  try {
    const res = await withTimeout(
      (signal) =>
        fetch(ANTHROPIC_URL, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 400,
            temperature: 0,
            system: VISION_SYSTEM,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
                  { type: 'text', text: 'Extract the profile seed JSON.' },
                ],
              },
            ],
          }),
          signal,
        }),
      { ms: 20000, label: 'vision' },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { content: Array<{ type: string; text?: string }> };
    const text = json.content.filter((c) => c.type === 'text' && c.text).map((c) => c.text).join('\n');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1)) as VisionExtract;
  } catch (err) {
    console.error('vision extract error', err instanceof Error ? err.message : err);
    return null;
  }
}

function hasContent(p: ResolvedPerson): boolean {
  return Boolean(p.name || p.role || p.company || (p.publicSignals && p.publicSignals.length));
}

function coreUpdate(p: ResolvedPerson, seed: ResolverSeed | null) {
  return {
    enrichment_status: 'ready',
    enrichment_name: p.name,
    enrichment_role: p.role,
    enrichment_company: p.company,
    resolved_linkedin_url: p.linkedinUrl,
    resolution_confidence: p.confidence,
    resolution_provenance: p.provenance,
    providers_hit: p.providersHit,
    company_domain: p.companyDomain,
    email_deliverable: p.emailDeliverable,
    enrichment_raw_input: seed ? rawInput(seed) : null,
  };
}

function fullUpdate(p: ResolvedPerson, seed: ResolverSeed | null) {
  return {
    ...coreUpdate(p, seed),
    enrichment_company_blurb: p.companyBlurb,
    enrichment_signals: p.publicSignals.length ? p.publicSignals : null,
    person_experience: p.experience.length ? p.experience : null,
    company_context: {
      logoUrl: p.logoUrl,
      brandColors: p.brandColors,
      rank: p.companyRank,
      techStack: p.techStack,
      industry: p.industry,
      headcount: p.headcount,
      fundingStage: p.fundingStage,
      newsHeadlines: p.newsHeadlines.length ? p.newsHeadlines : null,
    },
    enrichment_completed_at: new Date().toISOString(),
  };
}

function rawInput(seed: ResolverSeed) {
  return {
    raw: seed.raw,
    email: seed.email,
    domain: seed.domain,
    linkedinUrl: seed.linkedinUrl,
    linkedinSlug: seed.linkedinSlug,
    fullName: seed.fullName,
  };
}

function parseDataUrl(input: string, fallbackType?: string): { mediaType: string; data: string } {
  const m = input.match(/^data:([^;]+);base64,(.+)$/);
  if (m) return { mediaType: m[1], data: m[2] };
  return { mediaType: fallbackType || 'image/jpeg', data: input };
}

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}
