// C1-04 — scripts/sync-governance.mjs must be idempotent: running it twice
// in a row on the same working copy produces no diff on the second run.
//
// Runs against an isolated temporary working copy (never the real,
// committed reference files), since this script writes to disk — running
// it against the real repo as a side effect of a test would be an
// unnecessary, unreviewed write to tracked files.

import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync, mkdirSync, readFileSync, cpSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('sync-governance.mjs produces no diff on a second consecutive run', () => {
  let tmpRoot = mkdtempSync(join(tmpdir(), 'governance-idempotence-'));
  // See governance-drift-detection.spec.js for why realpathSync is required
  // here: sync-governance.mjs guards its own execution with
  // `if (import.meta.url === file://${process.argv[1]})`, which silently
  // never matches if tmpRoot is the unresolved /var symlink on macOS.
  tmpRoot = realpathSync(tmpRoot);

  try {
    mkdirSync(join(tmpRoot, 'scripts'), { recursive: true });
    cpSync(join(ROOT, 'scripts', 'sync-governance.mjs'), join(tmpRoot, 'scripts', 'sync-governance.mjs'));
    cpSync(join(ROOT, 'GOVERNANCE.md'), join(tmpRoot, 'GOVERNANCE.md'));

    const scriptPath = join(tmpRoot, 'scripts', 'sync-governance.mjs');
    const destinations = [
      join(tmpRoot, 'clone', 'core', 'references', 'non-negotiable-foundation.md'),
      join(tmpRoot, 'master-skill', 'references', 'non-negotiable-foundation.md'),
    ];

    execFileSync('node', [scriptPath]);
    const afterFirstRun = destinations.map((d) => readFileSync(d, 'utf8'));

    execFileSync('node', [scriptPath]);
    const afterSecondRun = destinations.map((d) => readFileSync(d, 'utf8'));

    expect(afterSecondRun).toEqual(afterFirstRun);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
