import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';
import { isVariant, type Variant } from '../_shared/variant-lenses.ts';
import { inferAffinity } from '../_shared/reads.ts';

type Body = { id: string; destination: string; variant?: Variant; consent?: boolean };

const ALLOWED = new Set(['substack', 'mindmaker', 'ctrl']);
// Only the products with a "brain" benefit from a warm handoff.
const HANDOFF_DESTINATIONS = new Set(['ctrl', 'mindmaker']);

// The single strongest AI-native lane implied by the leader's answers. This is
// the CATEGORISED anxiety signal that travels forward; the raw q5 text never
// does (privacy decision: never cross raw q5 or transcripts across surfaces).
function anxietyLane(q5: string | null, q2: string | null, q4: string | null): string | null {
  const aff = inferAffinity({ q5, q2, q4 });
  let best: string | null = null;
  let bestW = 0;
  for (const [lane, w] of Object.entries(aff)) {
    if (w > bestW) {
      best = lane;
      bestW = w;
    }
  }
  return best;
}

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
  if (!body?.id || !ALLOWED.has(body.destination)) {
    return json({ error: 'missing or invalid fields' }, 400);
  }

  const supabase = serviceClient();
  const update: Record<string, unknown> = {
    fork_choice: body.destination,
    fork_clicked_at: new Date().toISOString(),
  };
  // Backfill the entry door on the row in case the initial insert missed it.
  if (isVariant(body.variant)) update.entry_variant = body.variant;

  const { error } = await supabase
    .from('cannes_responses')
    .update(update)
    .eq('id', body.id);

  if (error) {
    console.error('fork update error', error);
    return json({ error: 'update failed' }, 500);
  }

  // Consent-gated warm handoff: carry the CATEGORISED funnel signal forward so
  // the destination (CTRL / Mindmaker) starts warm instead of cold. Only a lane,
  // the entry door, the modality (q2/q4), the company domain, and the archetype
  // travel - never the raw q5 or any transcript. The token is returned so the
  // client can hand it to the destination as `?h=<token>`.
  let handoff: string | null = null;
  if (body.consent === true && HANDOFF_DESTINATIONS.has(body.destination)) {
    try {
      const { data: row } = await supabase
        .from('cannes_responses')
        .select('entry_variant, q2_extra_self, q4_company_future, q5_decision, archetype_title, company_domain')
        .eq('id', body.id)
        .single();
      if (row) {
        const { data: ins } = await supabase
          .from('portfolio_handoff')
          .insert({
            source: 'mymu',
            source_response_id: body.id,
            entry_variant: row.entry_variant ?? body.variant ?? null,
            q2: row.q2_extra_self ?? null,
            q4: row.q4_company_future ?? null,
            anxiety_lane: anxietyLane(row.q5_decision, row.q2_extra_self, row.q4_company_future),
            company_domain: row.company_domain ?? null,
            archetype_title: row.archetype_title ?? null,
            destination: body.destination,
          })
          .select('id')
          .single();
        handoff = ins?.id ?? null;
      }
    } catch (e) {
      console.error('handoff error', e);
    }
  }

  return json({ ok: true, handoff });
});

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}
