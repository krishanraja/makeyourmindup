import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';

type Body = { id: string; destination: string };

const ALLOWED = new Set(['substack', 'mindmaker', 'ctrl']);

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
  const { error } = await supabase
    .from('cannes_responses')
    .update({
      fork_choice: body.destination,
      fork_clicked_at: new Date().toISOString(),
    })
    .eq('id', body.id);

  if (error) {
    console.error('fork update error', error);
    return json({ error: 'update failed' }, 500);
  }
  return json({ ok: true });
});

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}
