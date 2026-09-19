// Run: deno test supabase/functions/_shared/identity.test.ts
import { buildSeed, normalizeDomain, normalizeLinkedInUrl, parseEmail, parseName } from './identity.ts';

function assertEquals(actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`assertEquals failed:\n  actual:   ${a}\n  expected: ${e}`);
}

Deno.test('normalizeLinkedInUrl strips UTM and canonicalizes', () => {
  const r = normalizeLinkedInUrl(
    'https://www.linkedin.com/in/krish-raja?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  );
  assertEquals(r.valid, true);
  assertEquals(r.canonicalUrl, 'https://www.linkedin.com/in/krish-raja');
  assertEquals(r.slug, 'krish-raja');
});

Deno.test('normalizeLinkedInUrl accepts scheme-less input', () => {
  assertEquals(normalizeLinkedInUrl('linkedin.com/in/krish-raja').canonicalUrl, 'https://www.linkedin.com/in/krish-raja');
});

Deno.test('normalizeLinkedInUrl normalizes m. and country subdomains + trailing slash', () => {
  assertEquals(normalizeLinkedInUrl('https://m.linkedin.com/in/krish-raja/').canonicalUrl, 'https://www.linkedin.com/in/krish-raja');
  assertEquals(normalizeLinkedInUrl('https://uk.linkedin.com/in/Krish-Raja').canonicalUrl, 'https://www.linkedin.com/in/krish-raja');
});

Deno.test('normalizeLinkedInUrl rejects non-person pages and junk', () => {
  assertEquals(normalizeLinkedInUrl('https://www.linkedin.com/company/acme').valid, false);
  assertEquals(normalizeLinkedInUrl('https://www.linkedin.com/feed/').valid, false);
  assertEquals(normalizeLinkedInUrl('not a url').valid, false);
  assertEquals(normalizeLinkedInUrl('https://example.com/in/krish').valid, false);
});

Deno.test('parseEmail derives domain and flags free providers', () => {
  assertEquals(parseEmail('Krish@Acme.com'), { email: 'krish@acme.com', domain: 'acme.com', isFreeProvider: false, valid: true });
  assertEquals(parseEmail('krish@gmail.com').isFreeProvider, true);
  assertEquals(parseEmail('nope').valid, false);
});

Deno.test('normalizeDomain extracts a bare domain', () => {
  assertEquals(normalizeDomain('https://www.Acme.com/about'), 'acme.com');
  assertEquals(normalizeDomain('krish@acme.com'), 'acme.com');
  assertEquals(normalizeDomain('Acme Inc'), null);
});

Deno.test('parseName splits first/last', () => {
  assertEquals(parseName('Krish Raja'), { first: 'Krish', last: 'Raja', full: 'Krish Raja' });
  assertEquals(parseName('Krish'), { first: 'Krish', last: null, full: 'Krish' });
});

Deno.test('buildSeed routes a work email into email + domain', () => {
  const seed = buildSeed({ email: 'krish@acme.com' });
  assertEquals(seed.email, 'krish@acme.com');
  assertEquals(seed.domain, 'acme.com');
  assertEquals(seed.isFreeEmail, false);
});

Deno.test('buildSeed treats a typed company domain as domain, not company text', () => {
  const seed = buildSeed({ name: 'Krish Raja', company: 'acme.com' });
  assertEquals(seed.domain, 'acme.com');
  assertEquals(seed.company, null);
  assertEquals(seed.first, 'Krish');
});
