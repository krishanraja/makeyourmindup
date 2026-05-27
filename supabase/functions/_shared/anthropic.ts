import { withTimeout } from './with-timeout.ts';

const URL = 'https://api.anthropic.com/v1/messages';

export type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AnthropicCallArgs = {
  system: string;
  messages: AnthropicMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export async function callAnthropic({
  system,
  messages,
  model = 'claude-sonnet-4-5',
  temperature = 0.8,
  maxTokens = 800,
  timeoutMs = 15_000,
}: AnthropicCallArgs): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');

  const res = await withTimeout(
    (signal) =>
      fetch(URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages,
        }),
        signal,
      }),
    { ms: timeoutMs, label: 'anthropic' },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`anthropic ${res.status}: ${text.slice(0, 300)}`);
  }
  const body = (await res.json()) as { content: { type: string; text: string }[] };
  const textPart = body.content.find((c) => c.type === 'text');
  if (!textPart) throw new Error('anthropic returned no text content');
  return textPart.text.trim();
}
