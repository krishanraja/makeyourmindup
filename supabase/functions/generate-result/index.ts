import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { json, preflight } from '../_shared/cors.ts';
import { callAnthropic } from '../_shared/anthropic.ts';
import { checkVoice } from '../_shared/voice-guard.ts';
import { TimeoutError } from '../_shared/with-timeout.ts';
import { FALLBACK_PROSE } from '../_shared/fallbacks.ts';

const SYSTEM_PROMPT = `You are writing as Krish Raja, founder of Mindmaker, AI product builder, Forbes 30 Under 30. You are speaking to a leader who just spent 60 seconds telling you five things about themselves and their company. Your job is to write them a 90-word future memory.

Voice rules (non-negotiable):
- Direct, dry, treats the reader as a peer
- Operator-led, not consultant-led: you have built the thing you're describing
- British-Australian register, sentence case
- Present tense, even when describing the future. The future has already happened.
- Second person throughout
- No em dashes anywhere
- No buzzwords: transformation, journey, unlock, empower, supercharge, harness, leverage as verb, game-changer, synergy, holistic, ecosystem, best-in-class, paradigm, mindset, scale (as verb)
- No exclamation marks
- No emoji
- No hedging language: might, could, possibly, perhaps, may, potentially
- No throat-clearing: "Imagine that", "Picture this", "It's possible that"
- No fortune-cookie wisdom: "The future belongs to those who...", "In a world where..."
- Specific over generic. Anchor every sentence to something they told you.
- Slightly uncomfortable is better than reassuring. You are not selling them hope, you are showing them a real near-future they could reach.

Style anchors (read these to calibrate):
- "I keep meeting leaders who have adopted 14 AI tools and made zero AI decisions. Tools are easy. Thinking is hard. And the gap between the two is where careers and companies go to die."
- "Speed is not strategy. Autonomy is not intelligence. When everything moves faster, the margin for error shrinks. Every bad decision compounds quicker."
- "14 tools. 0 decisions. Most leaders have adopted everything and decided nothing."

You will receive: the user's 5 answers and their assigned archetype title.

You will produce two paragraphs:

Paragraph 1 (60-90 words): A future memory. Imagine it is 12 months from now and the leader has acted on the decision they wrote in Q5. Describe their week as it now runs. Anchor specifically to Q1 (how much of their week needs them), Q2 (what the extra version of them spends time on), and Q5 (the decision they made). Make it feel like you are describing something that has already happened, not predicting something that might.

Paragraph 2 (40-60 words): Their company in three years on the same trajectory. Anchor to Q3 (how much AI handles) and Q4 (the kind of company they wanted to run). Same present-tense future grammar. End on a sentence that lands, not trails.

Output format: JSON only. {"title_adjustment": "<one word swap suggestion for their archetype title, or empty string>", "twelve_months": "<paragraph 1>", "three_years": "<paragraph 2>"}`;

type Body = {
  id: string;
  answers: {
    q1: number;
    q2: 'think' | 'do' | 'talk' | 'watch';
    q3: number;
    q4: 'same' | 'leaner' | 'hybrid' | 'autonomous';
    q5: string;
  };
  archetype: { title: string; variant: 'A' | 'B'; key: string };
};

type LLMOut = {
  title_adjustment?: string;
  twelve_months: string;
  three_years: string;
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
  if (!body?.id || !body?.answers || !body?.archetype) {
    return json({ error: 'missing fields' }, 400);
  }

  const supabase = serviceClient();
  const userMessage = buildUserMessage(body);

  let prose: LLMOut | null = null;
  let usedFallback = false;

  try {
    prose = await attempt(SYSTEM_PROMPT, userMessage);
    if (!prose) {
      const retryPrompt = `${userMessage}\n\nYour previous response was invalid or violated voice rules. Rewrite without em dashes, without exclamation marks, without any of the banned buzzwords, and as strict JSON only.`;
      prose = await attempt(SYSTEM_PROMPT, retryPrompt);
    }
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.error('anthropic timeout', err);
    } else {
      console.error('anthropic error', err);
    }
  }

  if (!prose) {
    const fb = FALLBACK_PROSE[body.answers.q4] ?? FALLBACK_PROSE.same;
    prose = { twelve_months: fb.twelveMonths, three_years: fb.threeYears };
    usedFallback = true;
  }

  const archetypeTitle = body.archetype.title;

  const { error } = await supabase
    .from('cannes_responses')
    .update({
      q1_week_needs_me: body.answers.q1,
      q2_extra_self: body.answers.q2,
      q3_company_ai: body.answers.q3,
      q4_company_future: body.answers.q4,
      q5_decision: body.answers.q5,
      archetype_title: archetypeTitle,
      archetype_variant: body.archetype.variant,
      result_prose_12mo: prose.twelve_months,
      result_prose_3yr: prose.three_years,
    })
    .eq('id', body.id);

  if (error) {
    console.error('row update error', error);
  }

  return json({
    archetype_title: archetypeTitle,
    twelve_months: prose.twelve_months,
    three_years: prose.three_years,
    fallback: usedFallback,
  });
});

async function attempt(system: string, userMessage: string): Promise<LLMOut | null> {
  const raw = await callAnthropic({
    system,
    messages: [{ role: 'user', content: userMessage }],
    temperature: 0.8,
    maxTokens: 800,
  });
  const parsed = extractJson(raw);
  if (!parsed) return null;
  if (!parsed.twelve_months || !parsed.three_years) return null;
  const a = checkVoice(parsed.twelve_months);
  const b = checkVoice(parsed.three_years);
  if (!a.valid || !b.valid) return null;
  return parsed;
}

function extractJson(text: string): LLMOut | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as LLMOut;
  } catch {
    return null;
  }
}

function buildUserMessage(body: Body): string {
  const a = body.answers;
  return [
    `Archetype title: "${body.archetype.title}"`,
    '',
    `Q1 (week that actually needs them, 0-100): ${a.q1}`,
    `Q2 (what an extra version of them would spend time on): ${a.q2}`,
    `Q3 (how much AI could handle today, 0-100): ${a.q3}`,
    `Q4 (the company they want to be running in 3yr): ${a.q4}`,
    `Q5 (the decision they keep not making): "${a.q5}"`,
    '',
    'Return JSON only with keys title_adjustment, twelve_months, three_years.',
  ].join('\n');
}

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, key, { auth: { persistSession: false } });
}
