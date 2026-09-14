// C1-05 — GOVERNANCE.md must define exactly four rules, numbered 1 to 4,
// in that order, with stable titles. The numbering is part of the
// contract: the Clone, the Master Skill, and past ADRs cross-reference
// "Rule 3", "Rule 4", etc. — if the numbering or title text ever shifts,
// those references silently point at the wrong rule.
//
// This test intentionally hardcodes the expected titles rather than only
// checking for four headings in sequence: a title rename is exactly the
// kind of drift this test exists to catch, so it must fail on one, not
// just on a renumbering.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GOVERNANCE_PATH = join(ROOT, 'GOVERNANCE.md');

const EXPECTED_RULES = [
  { number: 1, title: 'WCAG 2.2 AA compliance, minimum' },
  { number: 2, title: 'The final word always belongs to a human' },
  { number: 3, title: 'Never hard-coded style' },
  { number: 4, title: 'Never consume a primitive token directly' },
];

test('GOVERNANCE.md defines exactly 4 rules, numbered 1-4 in order, with stable titles', () => {
  const content = readFileSync(GOVERNANCE_PATH, 'utf8');
  const ruleHeadingPattern = /^## Rule (\d+) — (.+)$/gm;
  const found = [...content.matchAll(ruleHeadingPattern)].map((match) => ({
    number: Number(match[1]),
    title: match[2].trim(),
  }));

  expect(found, `Expected exactly 4 rule headings, found ${found.length}`).toHaveLength(4);
  expect(found).toEqual(EXPECTED_RULES);
});
