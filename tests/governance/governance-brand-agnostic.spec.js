// C1-01 — GOVERNANCE.md must stay brand-agnostic: no mention of Agentica's
// own name, stack, or brand palette in the file that defines the
// non-negotiable foundation any brand is meant to adopt.
//
// Plain Node assertions, no browser — deliberately not using the `page`
// fixture (see tests/governance/README intent in the lot instructions).

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_BLACKLIST, buildBlacklistPattern } from './support/brand-blacklist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GOVERNANCE_PATH = join(ROOT, 'GOVERNANCE.md');

test.describe('C1-01 — GOVERNANCE.md is brand-agnostic', () => {
  const content = readFileSync(GOVERNANCE_PATH, 'utf8');

  for (const term of BRAND_BLACKLIST) {
    test(`does not mention "${term}"`, () => {
      const match = content.match(buildBlacklistPattern(term));
      expect(
        match,
        match ? `Found "${match[0]}" in GOVERNANCE.md — expected zero occurrences of blacklisted term "${term}"` : undefined
      ).toBeNull();
    });
  }
});
