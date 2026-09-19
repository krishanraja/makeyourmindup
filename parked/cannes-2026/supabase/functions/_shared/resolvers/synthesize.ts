import { callAnthropic } from '../anthropic.ts';
import type { ResolvedPerson } from './types.ts';

// Stage E: Claude summarizes the structured facts we already fetched into the
// exact {company_blurb, public_signals} contract. Claude is a summarizer here,
// not a searcher — it cannot invent a LinkedIn URL or fabricate identity.

const SYNTH_SYSTEM = `You compress verified facts about one person and their company into compact JSON.

Return STRICT JSON only:
{
  "company_blurb": string | null,
  "public_signals": string[] | null
}

Rules:
- "company_blurb" is ONE sentence describing what the company does. Concrete, no marketing language.
- "public_signals" is 3-5 short observations relevant to an operator: company stage, role tenure, notable past employer, recent public post or news topic, sector context, tech stack if telling. Each item must be <= 14 words.
- Use ONLY the supplied facts. Do NOT guess or add anything not present. If a fact is thin, return fewer signals.
- No buzzwords. No marketing. Operator register. Sentence case.
- Output JSON only. No prose, no markdown fences.`;

type SynthOut = { company_blurb: string | null; public_signals: string[] | null };

export async function synthesizeSignals(
  person: ResolvedPerson,
  snippets: string[],
): Promise<SynthOut | null> {
  const facts: string[] = [];
  if (person.name) facts.push(`name: ${person.name}`);
  if (person.role) facts.push(`role: ${person.role}`);
  if (person.company) facts.push(`company: ${person.company}`);
  if (person.companyBlurb) facts.push(`company description: ${person.companyBlurb}`);
  if (person.industry) facts.push(`industry: ${person.industry}`);
  if (person.headcount) facts.push(`headcount: ${person.headcount}`);
  if (person.fundingStage) facts.push(`funding stage: ${person.fundingStage}`);
  if (person.companyRank) facts.push(`web popularity rank: ${person.companyRank}`);
  if (person.techStack?.length) facts.push(`tech stack: ${person.techStack.join(', ')}`);
  if (person.location) facts.push(`location: ${person.location}`);
  if (person.experience.length) {
    facts.push(`experience: ${person.experience.map((e) => `${e.title} at ${e.company}`).join('; ')}`);
  }
  if (person.newsHeadlines.length) facts.push(`recent news: ${person.newsHeadlines.join(' | ')}`);
  if (snippets.length) facts.push(`web snippets: ${snippets.join(' | ')}`);

  // Nothing worth synthesizing.
  if (facts.length < 2) return null;

  let raw: string;
  try {
    raw = await callAnthropic({
      system: SYNTH_SYSTEM,
      messages: [{ role: 'user', content: facts.join('\n') }],
      temperature: 0.2,
      maxTokens: 600,
      timeoutMs: 8000,
    });
  } catch (err) {
    console.error('synthesize error', err instanceof Error ? err.message : err);
    return null;
  }

  return parseSynth(raw);
}

function parseSynth(raw: string): SynthOut | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1)) as Partial<SynthOut>;
    const blurb = typeof parsed.company_blurb === 'string' ? parsed.company_blurb.trim() : null;
    const signals = Array.isArray(parsed.public_signals)
      ? parsed.public_signals.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : null;
    return {
      company_blurb: blurb || null,
      public_signals: signals && signals.length ? signals : null,
    };
  } catch {
    return null;
  }
}
