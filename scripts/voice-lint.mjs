#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOTS = ['app', 'src'];
const EXTS = new Set(['.ts', '.tsx', '.css']);
const BANNED = [
  'transformation',
  'transformative',
  'journey',
  'unlock',
  'empower',
  'supercharge',
  'harness',
  'game-changer',
  'game changer',
  'synergy',
  'holistic',
  'ecosystem',
  'best-in-class',
  'best in class',
  'paradigm',
  'mindset',
];
const LEVERAGE_VERB_RE = /\b(?:to|can|will|would|could|should|must|may|might|let's|lets)\s+leverage\b|\bleverag(?:es|ed|ing)\b/i;
const ALLOWLIST_FILES = new Set([
  'src/lib/voice.ts',
  'supabase/functions/_shared/voice-guard.ts',
  'scripts/voice-lint.mjs',
]);

const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
      continue;
    }
    if (!EXTS.has(extname(p))) continue;
    if (ALLOWLIST_FILES.has(p)) continue;
    const content = readFileSync(p, 'utf8');
    for (const word of BANNED) {
      const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      const m = content.match(re);
      if (m) {
        violations.push({ file: p, word, snippet: snippet(content, m.index ?? 0) });
      }
    }
    const lev = content.match(LEVERAGE_VERB_RE);
    if (lev) {
      violations.push({ file: p, word: 'leverage (verb)', snippet: snippet(content, lev.index ?? 0) });
    }
    if (/—/.test(content)) {
      violations.push({ file: p, word: 'em dash', snippet: snippet(content, content.indexOf('—')) });
    }
  }
}

function snippet(content, idx) {
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + 40);
  return content.slice(start, end).replace(/\n/g, ' ');
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch {
    /* missing directory ok */
  }
}

if (violations.length === 0) {
  console.log('voice-lint: clean');
  process.exit(0);
}

for (const v of violations) {
  console.error(`${v.file}: "${v.word}" :: ${v.snippet}`);
}
console.error(`voice-lint: ${violations.length} violation(s)`);
process.exit(1);
