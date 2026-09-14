// C1-03 (negative test) — scripts/check-governance-sync.mjs must fail when
// a reference copy has been hand-edited instead of regenerated. This test
// fails if the sync check passes despite the drift.
//
// The mutation happens in an isolated temporary workspace, never on the
// real, committed files: check-governance-sync.mjs derives every file
// location from its own file's location (import.meta.url), not from an
// argument or cwd, so copying it — alongside a copy of GOVERNANCE.md and
// the two reference files — into a throwaway directory gives it a fully
// self-contained target to check, with zero risk of racing another test
// that reads the real files (e.g. C1-02) concurrently.

import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, cpSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function buildIsolatedWorkspace() {
  let tmpRoot = mkdtempSync(join(tmpdir(), 'governance-drift-'));
  // macOS: os.tmpdir() returns a path under /var, which is a symlink to
  // /private/var. Node resolves import.meta.url through that symlink, so
  // without this, a script's `if (import.meta.url === file://${argv[1]})`
  // self-invocation guard can silently never match and never run.
  tmpRoot = realpathSync(tmpRoot);

  mkdirSync(join(tmpRoot, 'scripts'), { recursive: true });
  mkdirSync(join(tmpRoot, 'clone', 'core', 'references'), { recursive: true });
  mkdirSync(join(tmpRoot, 'master-skill', 'references'), { recursive: true });

  cpSync(join(ROOT, 'scripts', 'sync-governance.mjs'), join(tmpRoot, 'scripts', 'sync-governance.mjs'));
  cpSync(join(ROOT, 'scripts', 'check-governance-sync.mjs'), join(tmpRoot, 'scripts', 'check-governance-sync.mjs'));
  cpSync(join(ROOT, 'GOVERNANCE.md'), join(tmpRoot, 'GOVERNANCE.md'));
  cpSync(
    join(ROOT, 'clone', 'core', 'references', 'non-negotiable-foundation.md'),
    join(tmpRoot, 'clone', 'core', 'references', 'non-negotiable-foundation.md')
  );
  cpSync(
    join(ROOT, 'master-skill', 'references', 'non-negotiable-foundation.md'),
    join(tmpRoot, 'master-skill', 'references', 'non-negotiable-foundation.md')
  );

  return tmpRoot;
}

function runCheck(tmpRoot) {
  execFileSync('node', [join(tmpRoot, 'scripts', 'check-governance-sync.mjs')], { stdio: 'pipe' });
}

test('check-governance-sync.mjs fails when a reference copy has drifted', () => {
  const tmpRoot = buildIsolatedWorkspace();
  try {
    // The violation this test proves is caught: a generated copy hand-edited
    // directly instead of regenerated via `npm run sync:governance` — exactly
    // what GOVERNANCE.md's Rule 2 (and this file's own header comment) forbid.
    const driftedCopy = join(tmpRoot, 'clone', 'core', 'references', 'non-negotiable-foundation.md');
    writeFileSync(driftedCopy, `${readFileSync(driftedCopy, 'utf8')}\nHand-edited drift — not from GOVERNANCE.md.\n`);

    expect(
      () => runCheck(tmpRoot),
      'check-governance-sync.mjs must exit with a non-zero status when a reference copy has drifted from GOVERNANCE.md'
    ).toThrow();
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
