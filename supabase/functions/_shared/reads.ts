// Three things to read - delivered from CTRL's shared corroborated pool.
//
// Portfolio hive mind (Unit A): Make Your Mind Up's Result email has always
// promised "three things to read this week that fit what you just told us",
// but nothing delivered them. This reads CTRL's shared `live_headlines_cache`
// (the same Supabase project) and ranks those already-corroborated, AI-native
// stories against the leader's q5 (the decision they keep not making) + their
// q2/q4 modality, then returns the three most relevant.
//
// MYMU drinks from CTRL's substrate; it keeps its own voice. The card's own
// grounded "why it matters" line (`say`) is reused verbatim - we do not
// re-write the news, we just choose which three fit this leader.

export interface PoolCard {
  headline?: string;
  say?: string;
  url?: string;
  source?: string;
  category?: string;
  sourceCount?: number;
}

export interface ReadSignal {
  q5?: string | null; // the decision they keep not making (free text)
  q2?: string | null; // think | do | talk | watch
  q4?: string | null; // same | leaner | hybrid | autonomous
}

// q5 keyword -> the AI-native categories it implicates (CTRL's nine lanes).
const KEYWORD_CATEGORY: Array<[RegExp, string[]]> = [
  [/\b(team|people|hire|hiring|headcount|staff|replace|replacing|layoff|reorg|restructure)\b/i, ["org", "orchestration"]],
  [/\b(tool|tools|stack|consolidat|software|platform)\b/i, ["tools"]],
  [/\b(build|buy|vendor|lock[- ]?in|cost|costs|price|pricing|budget|spend|roi|cheaper|expensive)\b/i, ["economics"]],
  [/\b(agent|agents|automat|workflow|autonomous|orchestrat|pipeline)\b/i, ["orchestration"]],
  [/\b(board|investor|positioning|narrative|fundrais|raise)\b/i, ["product", "proof"]],
  [/\b(supervis|govern|regulat|compliance|risk|safe|safety|legal|policy)\b/i, ["governance", "security"]],
  [/\b(breach|leak|attack|secur|jailbreak|injection)\b/i, ["security"]],
  [/\b(product|gtm|go[- ]?to[- ]?market|launch|market|customer|sales|growth)\b/i, ["product"]],
  [/\b(model|models|gpt|claude|gemini|llm|capabilit|benchmark)\b/i, ["model"]],
  [/\b(deploy|production|proof|case stud|outcome)\b/i, ["proof"]],
];

const Q2_AFFINITY: Record<string, string[]> = {
  think: ["product", "economics", "model"],
  do: ["tools", "orchestration"],
  talk: ["product", "proof", "org"],
  watch: ["governance", "security"],
};
const Q4_AFFINITY: Record<string, string[]> = {
  same: ["tools", "proof"],
  leaner: ["org", "economics"],
  hybrid: ["orchestration", "product"],
  autonomous: ["orchestration", "model"],
};

function tokenize(s: string): Set<string> {
  return new Set((s || "").toLowerCase().match(/[a-z0-9]{4,}/g) || []);
}

// Per-category weight derived from the leader's answers.
export function inferAffinity(signal: ReadSignal): Record<string, number> {
  const aff: Record<string, number> = {};
  const add = (cats: string[], w: number) => cats.forEach((c) => (aff[c] = (aff[c] || 0) + w));
  const q5 = signal.q5 || "";
  for (const [re, cats] of KEYWORD_CATEGORY) if (re.test(q5)) add(cats, 3);
  const q2 = (signal.q2 || "").toLowerCase();
  const q4 = (signal.q4 || "").toLowerCase();
  if (Q2_AFFINITY[q2]) add(Q2_AFFINITY[q2], 1.5);
  if (Q4_AFFINITY[q4]) add(Q4_AFFINITY[q4], 1);
  return aff;
}

// Rank the pool against the signal and return the three best, preferring
// distinct categories so the reads do not all collapse into one lane.
export function pickThreeReads(cards: PoolCard[], signal: ReadSignal): PoolCard[] {
  const aff = inferAffinity(signal);
  const q5tokens = tokenize(signal.q5 || "");
  const scored = cards
    .filter((c) => c?.headline && c?.url)
    .map((c, i) => {
      let score = aff[c.category || ""] || 0;
      const cardTokens = tokenize(`${c.headline} ${c.say || ""}`);
      let overlap = 0;
      for (const t of q5tokens) if (cardTokens.has(t)) overlap++;
      score += overlap * 1.2; // direct keyword resonance with their decision
      score += Math.min(c.sourceCount || 0, 4) * 0.15; // corroboration tiebreak
      return { c, score, i };
    })
    // stable: higher score first, original pool order (importance) breaks ties
    .sort((a, b) => b.score - a.score || a.i - b.i);

  const picked: PoolCard[] = [];
  const usedCats = new Set<string>();
  for (const { c } of scored) {
    if (picked.length >= 3) break;
    if (usedCats.has(c.category || "") && scored.length > 6) continue;
    picked.push(c);
    usedCats.add(c.category || "");
  }
  if (picked.length < 3) {
    for (const { c } of scored) {
      if (picked.length >= 3) break;
      if (!picked.includes(c)) picked.push(c);
    }
  }
  return picked.slice(0, 3);
}

// Read the freshest cached pool (avoids UTC-midnight date-boundary misses).
export async function fetchSharedPool(supabase: {
  from: (t: string) => any;
}): Promise<PoolCard[]> {
  try {
    const { data, error } = await supabase
      .from("live_headlines_cache")
      .select("payload")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data || !data[0]?.payload) return [];
    const payload = data[0].payload;
    return Array.isArray(payload) ? (payload as PoolCard[]) : [];
  } catch {
    return [];
  }
}
