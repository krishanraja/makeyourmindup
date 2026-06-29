import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';
import { callAnthropic } from '../_shared/anthropic.ts';
import { checkVoice } from '../_shared/voice-guard.ts';
import { withTimeout } from '../_shared/with-timeout.ts';
import { EMAIL_LENS, isVariant, type Variant } from '../_shared/variant-lenses.ts';
import { fetchSharedPool, pickThreeReads, type PoolCard } from '../_shared/reads.ts';

const EMAIL_SYSTEM_PROMPT = `You are writing as Krish Raja. The reader just spent 60 seconds answering five questions on makeyourmindup.ai. You are writing them a personal email immediately after. It must read like a person wrote it.

Voice rules (non-negotiable):
- Direct, dry, treats the reader as a peer
- British-Australian register, sentence case
- Second person throughout
- No em dashes
- No buzzwords: transformation, journey, unlock, empower, supercharge, harness, leverage as verb, game-changer, synergy, holistic, ecosystem, best-in-class, paradigm, mindset, scale (as verb)
- No exclamation marks
- No emoji
- No hedging: might, could, possibly, perhaps, may
- No throat-clearing: "I wanted to reach out", "Hope this finds you well"
- No sign-off block. Just "Krish" on the last line.

Structure (6 to 9 sentences total, not counting the sign-off):
1. Open by quoting their Q5 answer back to them in one sentence.
2. One sentence on what that decision typically costs leaders who keep not making it.
3. Use the 12-month prose verbatim as the next paragraph.
4. Use the 3-year prose verbatim as the paragraph after.
5. One closing sentence that points forward without selling anything.
6. "Krish" on its own line.

Output plain text only. No subject line. No markdown. No greeting like "Hi" or "Hey". Start with the quoted Q5 line directly.`;

type Body = { id: string; email: string; variant?: Variant };

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
  if (!body?.id || !isEmail(body.email)) {
    return json({ error: 'missing or invalid fields' }, 400);
  }

  const variant = isVariant(body.variant) ? body.variant : null;
  const system = variant
    ? `${EMAIL_SYSTEM_PROMPT}\n\n${EMAIL_LENS[variant].systemAddition}`
    : EMAIL_SYSTEM_PROMPT;

  const supabase = serviceClient();

  const { data: row, error: readErr } = await supabase
    .from('cannes_responses')
    .select(
      'q1_week_needs_me, q2_extra_self, q3_company_ai, q4_company_future, q5_decision, archetype_title, result_prose_12mo, result_prose_3yr, enrichment_status, enrichment_name, enrichment_company',
    )
    .eq('id', body.id)
    .single();

  if (readErr || !row) {
    return json({ error: 'row not found' }, 404);
  }

  await supabase
    .from('cannes_responses')
    .update({ email: body.email, email_captured_at: new Date().toISOString() })
    .eq('id', body.id);

  const enrichmentReady = row.enrichment_status === 'ready';
  const firstName = enrichmentReady ? firstNameOf(row.enrichment_name) : null;
  const company = enrichmentReady ? (row.enrichment_company ?? null) : null;

  const messageLines = [
    `Their Q5 (the decision they keep not making): "${row.q5_decision ?? ''}"`,
    '',
    `Their archetype title: "${row.archetype_title ?? ''}"`,
    `Q1 (week needs them, 0-100): ${row.q1_week_needs_me ?? 0}`,
    `Q2 (extra version of them): ${row.q2_extra_self ?? ''}`,
    `Q3 (AI could handle, 0-100): ${row.q3_company_ai ?? 0}`,
    `Q4 (company they want in 3yr): ${row.q4_company_future ?? ''}`,
  ];
  if (firstName || company) {
    messageLines.push('');
    messageLines.push('Background:');
    if (firstName) messageLines.push(`- first name: ${firstName}`);
    if (company) messageLines.push(`- company: ${company}`);
    messageLines.push(
      'Use the first name at most once, naturally, never as a greeting. Never name-drop the company.',
    );
  }
  messageLines.push(
    '',
    `12-month prose to reuse verbatim:`,
    row.result_prose_12mo ?? '',
    '',
    `3-year prose to reuse verbatim:`,
    row.result_prose_3yr ?? '',
  );
  const userMessage = messageLines.join('\n');

  let emailBody: string | null = null;
  try {
    const raw = await callAnthropic({
      system,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.7,
      maxTokens: 700,
    });
    const check = checkVoice(raw);
    if (check.valid) emailBody = raw.trim();
  } catch (err) {
    console.error('anthropic email error', err);
  }

  if (!emailBody) {
    emailBody = [
      `You said: "${row.q5_decision ?? ''}"`,
      '',
      'Most leaders keep not making this decision because the cost of making it is concrete and the cost of avoiding it is abstract. The maths is wrong, but it feels right.',
      '',
      row.result_prose_12mo ?? '',
      '',
      row.result_prose_3yr ?? '',
      '',
      'If you want, the door is open at themindmaker.ai.',
      '',
      'Krish',
    ].join('\n');
  }

  // Three things to read - delivered (finally) from CTRL's shared corroborated
  // pool, ranked against the decision they just named. Best-effort: if the pool
  // is empty or unreachable, the email sends without the section rather than
  // breaking the promise with a placeholder.
  let readsText = '';
  let readsHtml = '';
  try {
    const pool = await fetchSharedPool(supabase);
    if (pool.length > 0) {
      const reads = pickThreeReads(pool, {
        q5: row.q5_decision,
        q2: row.q2_extra_self,
        q4: row.q4_company_future,
      });
      if (reads.length === 3) {
        readsText = buildReadsText(reads);
        readsHtml = buildReadsHtml(reads);
      }
    }
  } catch (err) {
    console.error('reads error', err);
  }

  const fullText = readsText ? `${emailBody}\n\n${readsText}` : emailBody;
  const subject = variant ? EMAIL_LENS[variant].subject : buildSubject(row.q5_decision ?? '');

  const resendRes = await sendViaResend({
    to: body.email,
    subject,
    text: fullText,
    html: bodyAsHtml(emailBody, readsHtml),
  });

  if (!resendRes.ok) {
    const text = await resendRes.text();
    console.error('resend error', resendRes.status, text);
    return json({ error: 'send failed', detail: text.slice(0, 200) }, 502);
  }

  await supabase
    .from('cannes_responses')
    .update({ email_sent_at: new Date().toISOString() })
    .eq('id', body.id);

  return json({ ok: true });
});

function buildSubject(q5: string): string {
  const trimmed = q5.trim().slice(0, 60);
  return `You said: "${trimmed}"`;
}

async function sendViaResend({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<Response> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY missing');
  return withTimeout(
    (signal) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Krish Raja <krish@themindmaker.ai>',
          reply_to: 'krish@themindmaker.ai',
          to: [to],
          subject,
          text,
          html,
        }),
        signal,
      }),
    { ms: 15_000, label: 'resend' },
  );
}

function bodyAsHtml(text: string, extraHtml = ''): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 18px 0;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return `<!doctype html><html><body style="font-family:Georgia,'Source Serif 4',serif;font-size:17px;line-height:1.55;color:#111;max-width:560px;margin:0 auto;padding:24px;">${paragraphs}${extraHtml}</body></html>`;
}

// Plain-text "three things to read" block (voice-safe: no buzzwords, no em
// dash, no exclamation). The card's own grounded line is reused verbatim.
function buildReadsText(reads: PoolCard[]): string {
  const lines = ['Three things worth your time this week, picked against the decision you named:', ''];
  reads.forEach((r, i) => {
    lines.push(`${i + 1}. ${r.headline}`);
    if (r.say) lines.push(`   ${r.say}`);
    lines.push(`   ${r.source ? r.source + ' - ' : ''}${r.url}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}

function buildReadsHtml(reads: PoolCard[]): string {
  const items = reads
    .map((r) => {
      const head = escapeHtml(r.headline ?? '');
      const say = r.say ? `<div style="color:#555;font-size:15px;margin:2px 0 0 0;">${escapeHtml(r.say)}</div>` : '';
      const src = r.source ? `<span style="color:#888;">${escapeHtml(r.source)}</span> ` : '';
      const url = escapeHtml(r.url ?? '#');
      return `<li style="margin:0 0 14px 0;"><a href="${url}" style="color:#06746d;text-decoration:none;font-weight:600;">${head}</a>${say}<div style="color:#888;font-size:13px;margin-top:2px;">${src}</div></li>`;
    })
    .join('');
  return `<hr style="border:none;border-top:1px solid #e5e5e3;margin:28px 0 18px 0;"/><p style="margin:0 0 10px 0;font-size:15px;color:#333;">Three things worth your time this week, picked against the decision you named:</p><ol style="margin:0;padding-left:20px;">${items}</ol>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isEmail(v: string | undefined): boolean {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function firstNameOf(full: string | null): string | null {
  if (!full) return null;
  const first = full.trim().split(/\s+/)[0];
  return first || null;
}

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}
