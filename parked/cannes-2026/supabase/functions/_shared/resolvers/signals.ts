import { env, fetchJson } from './http.ts';

// Web/news providers return raw text snippets ("signal material") that Stage E
// (Claude synthesis) compresses into the final public_signals. They never write
// public_signals directly.

export async function exaSnippets(query: string): Promise<string[]> {
  const key = env('EXA_API_KEY');
  if (!key) return [];
  const data = await fetchJson<{ results?: Array<{ title?: string; text?: string }> }>(
    'https://api.exa.ai/search',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({
        query,
        numResults: 5,
        type: 'auto',
        contents: { text: { maxCharacters: 400 } },
      }),
      timeoutMs: 5000,
      label: 'exa',
    },
  );
  return (data?.results ?? [])
    .map((r) => [r.title, r.text].filter(Boolean).join(' — '))
    .filter(Boolean)
    .slice(0, 5);
}

export async function perplexitySnippets(query: string): Promise<string[]> {
  const key = env('PERPLEXITY_API_KEY');
  if (!key) return [];
  const data = await fetchJson<{ choices?: Array<{ message?: { content?: string } }> }>(
    'https://api.perplexity.ai/chat/completions',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Return 3-5 short, factual, recent bullet points. No marketing language.',
          },
          { role: 'user', content: query },
        ],
        max_tokens: 400,
      }),
      timeoutMs: 6000,
      label: 'perplexity',
    },
  );
  const content = data?.choices?.[0]?.message?.content ?? '';
  return content
    .split('\n')
    .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
    .filter((l) => l.length > 8)
    .slice(0, 5);
}

export async function braveSnippets(query: string): Promise<string[]> {
  const key = env('BRAVE_API_KEY');
  if (!key) return [];
  const data = await fetchJson<{ web?: { results?: Array<{ title?: string; description?: string }> } }>(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
    {
      headers: { accept: 'application/json', 'X-Subscription-Token': key },
      timeoutMs: 5000,
      label: 'brave',
    },
  );
  return (data?.web?.results ?? [])
    .map((r) => [r.title, r.description].filter(Boolean).join(' — '))
    .filter(Boolean)
    .slice(0, 5);
}

export async function newsHeadlines(company: string): Promise<string[]> {
  const key = env('NEWSAPI_KEY');
  if (!key || !company) return [];
  const data = await fetchJson<{ articles?: Array<{ title?: string; source?: { name?: string } }> }>(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(`"${company}"`)}&sortBy=publishedAt&pageSize=5&language=en`,
    { headers: { 'X-Api-Key': key }, timeoutMs: 5000, label: 'newsapi' },
  );
  return (data?.articles ?? [])
    .map((a) => a.title?.trim())
    .filter((t): t is string => !!t)
    .slice(0, 5);
}

/**
 * Find a LinkedIn /in/ URL via web search when structured providers couldn't.
 * Used for the work-email -> LinkedIn edge case. Returns the first /in/ URL.
 */
export async function searchLinkedInUrl(name: string, company: string): Promise<string | null> {
  const query = `"${name}" "${company}" site:linkedin.com/in`;
  const key = env('EXA_API_KEY');
  if (key) {
    const data = await fetchJson<{ results?: Array<{ url?: string }> }>('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ query, numResults: 3 }),
      timeoutMs: 5000,
      label: 'exa-li',
    });
    const hit = (data?.results ?? []).map((r) => r.url).find((u) => u && /linkedin\.com\/in\//i.test(u));
    if (hit) return hit;
  }
  const brave = env('BRAVE_API_KEY');
  if (brave) {
    const data = await fetchJson<{ web?: { results?: Array<{ url?: string }> } }>(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      { headers: { accept: 'application/json', 'X-Subscription-Token': brave }, timeoutMs: 5000, label: 'brave-li' },
    );
    const hit = (data?.web?.results ?? []).map((r) => r.url).find((u) => u && /linkedin\.com\/in\//i.test(u));
    if (hit) return hit;
  }
  return null;
}
