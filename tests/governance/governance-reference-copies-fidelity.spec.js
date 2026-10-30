// C1-02 — the generated reference copies consumed by the Clone and the
// Master Skill must be faithful to GOVERNANCE.md, the single canonical
// source.
//
// Deliberately independent of scripts/sync-governance.mjs's own
// buildDerivedContent(): this test verifies fidelity from first principles
// rather than re-running the sync script's transformation logic, so a bug
// in that script's output would still be caught here instead of being
// silently reused as the "expected" value.
//
// Normalization is limited to line endings and trailing whitespace, plus
// one documented, intentional exception below — nothing else is
// normalized.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DESTINATIONS } from '../../scripts/sync-governance.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GOVERNANCE_PATH = join(ROOT, 'GOVERNANCE.md');

// The one documented, intentional divergence between GOVERNANCE.md and its
// reference copies: scripts/sync-governance.mjs swaps GOVERNANCE.md's
// "Canonical source" note for a "Source of truth" note in every generated
// copy (see DERIVED_NOTE in that file) — a real content difference by
// design, not a line-ending or trailing-whitespace artifact. Verified
// directly: GOVERNANCE.md's raw content never equals
// buildDerivedContent()'s output (they differ on exactly this line), while
// both current reference copies do equal it. A literal "normalize EOL and
// trailing whitespace only, nothing else" comparison would therefore fail
// permanently even when everything is correctly in sync — so this one known
// line is stripped from both sides (independently of the sync script)
// before the rest of the content is compared byte-for-byte.
const PROVENANCE_NOTE_PATTERN = /^> \*\*(Canonical source|Source of truth)\*\*:.*\n/m;

function normalize(content) {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n');
}

function stripProvenanceNote(content) {
  return content.replace(PROVENANCE_NOTE_PATTERN, '');
}

function fingerprint(content) {
  return createHash('sha256').update(content).digest('hex');
}

test.describe('C1-02 — reference copies are faithful to GOVERNANCE.md', () => {
  const sourceFingerprint = fingerprint(
    stripProvenanceNote(normalize(readFileSync(GOVERNANCE_PATH, 'utf8')))
  );

  for (const destination of DESTINATIONS) {
    test(`${relative(ROOT, destination)} matches GOVERNANCE.md content`, () => {
      const destFingerprint = fingerprint(
        stripProvenanceNote(normalize(readFileSync(destination, 'utf8')))
      );
      expect(
        destFingerprint,
        `Content mismatch beyond the documented provenance-note line — ${destination} has drifted from GOVERNANCE.md`
      ).toBe(sourceFingerprint);
    });
  }
});
