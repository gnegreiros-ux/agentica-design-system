// C2-05 — Rule 4 (never consume a primitive token directly): asserts what
// GOVERNANCE.md's Rule 4 requires — scripts/audit-tokens.js --ci must fail
// when a component consumes a primitive token directly.
//
// KNOWN, DOCUMENTED GAP — this test currently fails (red), and is expected
// to until the gap below is closed as its own, separate piece of work:
// scripts/audit-tokens.js declares its "primitive-direct" detection with
// `severity: 'warning'` (see DRIFT_PATTERNS in that file), and --ci mode
// only exits non-zero when criticalCount > 0 — which counts errors,
// phantom tokens, and structure issues, but never warnings. Verified
// directly: a fixture consuming `var(--agtc-primitive-...)` produces exit
// code 0 today. GOVERNANCE.md describes Rule 4 as non-negotiable and
// enforced by a build-failing static lint — the tooling does not yet do
// that for this specific pattern.
//
// Not fixed here: closing this gap means changing audit-tokens.js's
// severity for "primitive-direct", and this lot's rules forbid touching
// that file to make a test pass. This test intentionally encodes the
// requirement, not the current behavior, and is reported red rather than
// silently adjusted to match what the tool does today.

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

test('audit-tokens.js --ci fails on a primitive token consumed directly (Rule 4)', () => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'tokens-audit-primitive-'));
  try {
    // Rule 4 violation, written out in full: components only consume
    // semantic tokens, never primitive tokens directly. This direct
    // primitive reference is the one deliberate violation this fixture
    // exists to exercise.
    writeFileSync(join(tmpDir, 'component.css'), '.example { color: var(--agtc-primitive-color-red-500); }\n');

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
    // Not expected to matter here today: this run currently exits 0 (see the
    // header comment), a natural exit with no process.exit() truncation risk.
    const { threw, output } = runWithTruncationRetry(runOnce, 'primitive-direct');

    expect(
      threw,
      'audit-tokens.js --ci must exit non-zero on a primitive token consumed directly (Rule 4) — currently does not, see the file header comment'
    ).toBe(true);
    expect(output).toContain('primitive-direct');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
