import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';
import { withTimeout, TimeoutError } from '../_shared/with-timeout.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `You are a research assistant returning compact, structured facts about a single person.

You will be given one of: a LinkedIn profile URL, a screenshot of a LinkedIn profile, or a name plus a company name.

Return STRICT JSON only with these keys (and nothing else):
{
  "name": string | null,
  "role": string | null,
  "company": string | null,
  "company_blurb": string | null,
  "public_signals": string[] | null
}

Rules:
- "company_blurb" is one sentence describing what the company does. Concrete, no marketing language.
- "public_signals" is 3-5 short observations the reader might find operator-relevant: stage of the company, role tenure, notable past employer, recent public post topics, sector tailwinds. Each item ≤ 14 words.
- If you cannot determine a field from the input, set it to null. Do NOT guess.
- No buzzwords. No marketing. Operator register. Sentence case.
- Output JSON only. No prose around it. No markdown fences.`;

const TEXT_NUDGE =
  'Use web_search if needed to identify the person and their company. Cap searches.';

type UrlBody = { id: string; kind: 'url'; url: string };
type ImageBody = { id: string; kind: 'image'; image: string; mediaType?: string };
type TextBody = { id: string; kind: 'text'; name?: string; company?: string };
type Body = UrlBody | ImageBody | TextBody;

type Enrichment = {
  name: string | null;
  role: string | null;
  company: string | null;
  company_blurb: string | null;
  public_signals: string[] | null;
};

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

  let enrichment: Enrichment | null = null;
  try {
    enrichment = await runEnrichment(body);
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.error('enrichment timeout', err.message);
    } else {
      console.error('enrichment error', err);
    }
  }

  if (!enrichment) {
    await supabase
      .from('cannes_responses')
      .update({
        enrichment_status: 'failed',
        enrichment_completed_at: new Date().toISOString(),
      })
      .eq('id', body.id);
    return json({ ok: false, status: 'failed' });
  }

  const { error } = await supabase
    .from('cannes_responses')
    .update({
      enrichment_status: 'ready',
      enrichment_name: enrichment.name,
      enrichment_role: enrichment.role,
      enrichment_company: enrichment.company,
      enrichment_company_blurb: enrichment.company_blurb,
      enrichment_signals: enrichment.public_signals,
      enrichment_completed_at: new Date().toISOString(),
    })
    .eq('id', body.id);

  if (error) console.error('enrichment update error', error);

  return json({ ok: true, status: 'ready', enrichment });
});

async function runEnrichment(body: Body): Promise<Enrichment | null> {
  if (body.kind === 'image') return enrichFromImage(body);
  if (body.kind === 'url') return enrichFromUrl(body);
  if (body.kind === 'text') return enrichFromText(body);
  return null;
}

async function enrichFromImage(body: ImageBody): Promise<Enrichment | null> {
  const { mediaType, data } = parseDataUrl(body.image, body.mediaType);
  const raw = await callAnthropic({
    timeoutMs: 25_000,
    body: {
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
            {
              type: 'text',
              text: 'This is a LinkedIn profile screenshot. Extract the structured profile JSON described in the system prompt.',
            },
          ],
        },
      ],
    },
  });
  return parseEnrichment(raw);
}

async function enrichFromUrl(body: UrlBody): Promise<Enrichment | null> {
  const userText = `LinkedIn profile URL: ${body.url}\n\n${TEXT_NUDGE}`;
  const raw = await callAnthropic({
    timeoutMs: 30_000,
    body: {
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: userText }],
    },
  });
  return parseEnrichment(raw);
}

async function enrichFromText(body: TextBody): Promise<Enrichment | null> {
  const name = (body.name ?? '').trim();
  const company = (body.company ?? '').trim();
  if (!name && !company) return null;
  const userText = `Name: ${name || '(unknown)'}\nCompany: ${company || '(unknown)'}\n\n${TEXT_NUDGE}`;
  const raw = await callAnthropic({
    timeoutMs: 30_000,
    body: {
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      messages: [{ role: 'user', content: userText }],
    },
  });
  return parseEnrichment(raw);
}

async function callAnthropic({
  body,
  timeoutMs,
}: {
  body: Record<string, unknown>;
  timeoutMs: number;
}): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');
  const res = await withTimeout(
    (signal) =>
      fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      }),
    { ms: timeoutMs, label: 'anthropic-enrich' },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`anthropic ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { content: Array<{ type: string; text?: string }> };
  return data.content
    .filter((c) => c.type === 'text' && typeof c.text === 'string')
    .map((c) => c.text as string)
    .join('\n')
    .trim();
}

function parseEnrichment(raw: string): Enrichment | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1)) as Partial<Enrichment>;
    const e: Enrichment = {
      name: nullable(parsed.name),
      role: nullable(parsed.role),
      company: nullable(parsed.company),
      company_blurb: nullable(parsed.company_blurb),
      public_signals: Array.isArray(parsed.public_signals)
        ? parsed.public_signals.filter((s): s is string => typeof s === 'string' && s.length > 0)
        : null,
    };
    // Reject totally empty enrichments.
    if (!e.name && !e.role && !e.company && !(e.public_signals && e.public_signals.length)) {
      return null;
    }
    return e;
  } catch {
    return null;
  }
}

function nullable(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  if (/^(null|none|unknown|n\/a)$/i.test(trimmed)) return null;
  return trimmed;
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
