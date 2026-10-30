// C2-04 — Rule 3 (never a hard-coded style value): scripts/audit-tokens.js
// must fail (--ci exit code non-zero) when a hardcoded hex color appears in
// a component-style file.
//
// The fixture is generated in an isolated temporary directory at test
// time, never committed: writing a literal hex value into a real, tracked
// file under the repo would make the unscoped tokens-audit CI check
// (scripts/audit-tokens.js --ci, no --src-dir, one of the 6 existing PR
// checks) fail permanently on every future PR — verified empirically
// before choosing this approach. Scoping the real script's own --src-dir
// flag at this temporary fixture keeps the violation entirely contained to
// this test.

import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runWithTruncationRetry } from './support/run-with-truncation-retry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const AUDIT_SCRIPT_PATH = join(ROOT, 'scripts', 'audit-tokens.js');

function runAuditScoped(srcDir) {
  return execFileSync('node', [AUDIT_SCRIPT_PATH, '--src-dir', srcDir, '--ci'], { encoding: 'utf8' });
}

test('audit-tokens.js --ci fails on a hardcoded hex color (Rule 3)', () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'tokens-audit-hardcoded-'));
  try {
    // Rule 3 violation, written out in full: no component may accept a
    // hard-coded style value — every visual value must reference a token.
    // This literal hex is the one deliberate violation this fixture exists
    // to exercise.
    writeFileSync(join(tmpDir, 'component.css'), '.example { color: #123456; }\n');

    function runOnce() {
      let threw = false;
      let output = '';
      try {
        output = runAuditScoped(tmpDir);
      } catch (error) {
        threw = true;
        output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      }
      return { threw, output };
    }

    // Bounded retry, workaround for #118 (see support/run-with-truncation-retry.mjs)
    // — only kicks in when the capture looks truncated, never unconditionally.
    const { threw, output } = runWithTruncationRetry(runOnce, 'hex-color');

    expect(threw, 'audit-tokens.js --ci must exit non-zero on a hardcoded hex color').toBe(true);
    expect(output).toContain('hex-color');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
