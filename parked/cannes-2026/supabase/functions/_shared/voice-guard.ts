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

const BANNED_RE = new RegExp(`\\b(${BANNED.map(escape).join('|')})\\b`, 'i');
const LEVERAGE_VERB_RE = /\b(?:to|can|will|would|could|should|must|may|might|let's|lets)\s+leverage\b|\bleverag(?:es|ed|ing)\b/i;
const EM_DASH_RE = /—/;
const EXCLAIM_RE = /!/;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type VoiceCheck = { valid: boolean; violations: string[] };

export function checkVoice(text: string): VoiceCheck {
  const violations: string[] = [];
  const banned = text.match(BANNED_RE);
  if (banned) violations.push(`banned word: "${banned[0]}"`);
  const lev = text.match(LEVERAGE_VERB_RE);
  if (lev) violations.push(`leverage as verb: "${lev[0]}"`);
  if (EM_DASH_RE.test(text)) violations.push('em dash present');
  if (EXCLAIM_RE.test(text)) violations.push('exclamation mark present');
  if (EMOJI_RE.test(text)) violations.push('emoji present');
  return { valid: violations.length === 0, violations };
}
