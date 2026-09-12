// Generates the read-only reference copies of GOVERNANCE.md consumed by the
// Master Skill and the Clone. GOVERNANCE.md is the single canonical source —
// these copies are never edited by hand (Rule 2: the human edits the source,
// never the generated output).
//
// Run manually only: `npm run sync:governance`. Never wired into a pre-commit
// hook or a CI job that commits on its own behalf — see governance/rules and
// GOVERNANCE.md's "Update governance" section for why.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = join(ROOT, 'GOVERNANCE.md');

const CANONICAL_NOTE_PATTERN = /^> \*\*Canonical source\*\*:.*\n/m;

const DERIVED_NOTE =
  '> **Source of truth**: this content is derived from `GOVERNANCE.md`, the ' +
  'single canonical source for the non-negotiable foundation. Do not edit ' +
  'this file directly — run `npm run sync:governance` after updating ' +
  '`GOVERNANCE.md`.\n';

// Destinations confirmed 2026-09-12 for the v0.4.0 decoupling initiative
// (Tickets 1-3): both the Clone and the Master Skill currently live in this
// same repository. Add further destinations here — never hard-code a single
// output path.
export const DESTINATIONS = [
  join(ROOT, 'clone', 'core', 'references', 'non-negotiable-foundation.md'),
  join(ROOT, 'master-skill', 'references', 'non-negotiable-foundation.md'),
];

export function buildDerivedContent(sourceContent = readFileSync(SOURCE_PATH, 'utf8')) {
  if (!CANONICAL_NOTE_PATTERN.test(sourceContent)) {
    throw new Error(
      'GOVERNANCE.md is missing its "Canonical source" note — refusing to generate derived copies from an unexpected source shape.'
    );
  }
  return sourceContent.replace(CANONICAL_NOTE_PATTERN, DERIVED_NOTE);
}

function main() {
  const derivedContent = buildDerivedContent();

  for (const destination of DESTINATIONS) {
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, derivedContent);
    console.log(`Synced: ${destination}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
