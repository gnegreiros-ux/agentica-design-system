// Case-insensitive terms that must never appear in GOVERNANCE.md — the
// non-negotiable foundation must stay usable by any brand, not just
// Agentica. Reused by C4-05 (lot 2, Master-Skill output brand-agnosticism)
// against a generated instance, so the list and its matching rules live
// here once rather than being copied into every consumer.
export const BRAND_BLACKLIST = [
  'Agentica',
  'Lit',
  'lit-element',
  'RAMQ',
  'gnegreiros',
  'Atkinson',
  '#0D9B8A',
  '#ED6B86',
  '#5FE3D0',
  '#0D1815',
  'teal',
  'rose',
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Text terms use a classic \b...\b word boundary, so a term embedded inside
// an unrelated English word isn't flagged as a false positive — verified
// against GOVERNANCE.md: a plain case-insensitive substring match on "Lit"
// matches "Accessibility", "compatibility", "responsibility",
// "traceability" and "literal", none of which are a brand mention.
//
// Hex codes cannot use the same \b boundary: '#' is a non-word character,
// and \b only matches at a transition between a word and a non-word
// character, so a leading \b right before '#' can never be satisfied
// (confirmed: /\b#0D9B8A\b/i.test(' #0D9B8A ') === false — this would make
// the test silently blind to real hex leaks). For hex codes, the leading
// '#' already delimits the term unambiguously on its own; the only real
// risk is matching a *prefix* of a longer, unrelated hex value, guarded
// here with a negative lookahead that rejects a trailing hex digit — so
// e.g. "#0D9B8AFF" is not flagged as containing the banned "#0D9B8A".
export function buildBlacklistPattern(term) {
  if (term.startsWith('#')) {
    return new RegExp(`${escapeRegExp(term)}(?![0-9a-fA-F])`, 'i');
  }
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
}
