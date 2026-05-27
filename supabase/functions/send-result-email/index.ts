import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';
import { callAnthropic } from '../_shared/anthropic.ts';
import { checkVoice } from '../_shared/voice-guard.ts';
import { withTimeout } from '../_shared/with-timeout.ts';

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

type Body = { id: string; email: string };

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

  const supabase = serviceClient();

  const { data: row, error: readErr } = await supabase
    .from('cannes_responses')
    .select(
      'q1_week_needs_me, q2_extra_self, q3_company_ai, q4_company_future, q5_decision, archetype_title, result_prose_12mo, result_prose_3yr',
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

  const userMessage = [
    `Their Q5 (the decision they keep not making): "${row.q5_decision ?? ''}"`,
    '',
    `Their archetype title: "${row.archetype_title ?? ''}"`,
    `Q1 (week needs them, 0-100): ${row.q1_week_needs_me ?? 0}`,
    `Q2 (extra version of them): ${row.q2_extra_self ?? ''}`,
    `Q3 (AI could handle, 0-100): ${row.q3_company_ai ?? 0}`,
    `Q4 (company they want in 3yr): ${row.q4_company_future ?? ''}`,
    '',
    `12-month prose to reuse verbatim:`,
    row.result_prose_12mo ?? '',
    '',
    `3-year prose to reuse verbatim:`,
    row.result_prose_3yr ?? '',
  ].join('\n');

  let emailBody: string | null = null;
  try {
    const raw = await callAnthropic({
      system: EMAIL_SYSTEM_PROMPT,
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

  const subject = buildSubject(row.q5_decision ?? '');

  const resendRes = await sendViaResend({
    to: body.email,
    subject,
    text: emailBody,
    html: bodyAsHtml(emailBody),
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

function bodyAsHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 18px 0;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return `<!doctype html><html><body style="font-family:Georgia,'Source Serif 4',serif;font-size:17px;line-height:1.55;color:#111;max-width:560px;margin:0 auto;padding:24px;">${paragraphs}</body></html>`;
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

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}
