// C2-05 — Rule 4 (never consume a primitive token directly): asserts what
// GOVERNANCE.md's Rule 4 requires — scripts/audit-tokens.js --ci must fail
// when a component consumes a primitive token directly.
//
// scripts/audit-tokens.js declares its "primitive-direct" detection with
// `severity: 'error'` (see DRIFT_PATTERNS in that file), and --ci mode exits
// non-zero on any error, so a fixture consuming `var(--agtc-primitive-...)`
// makes the run fail. The severity was `warning` — and this test red, as a
// documented gap — until ADR-098 hardened it. This test guards against that
// regression: if the severity is ever softened back, or an exemption starts
// swallowing primitive-direct again, this fails.

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
    // The failing run ends in process.exit(1), so a truncated capture is exactly
    // the case that retry exists for.
    const { threw, output } = runWithTruncationRetry(runOnce, 'primitive-direct');

    expect(
      threw,
      'audit-tokens.js --ci must exit non-zero on a primitive token consumed directly (Rule 4, ADR-098) — the primitive-direct severity or its exemption has regressed, see the file header comment'
    ).toBe(true);
    expect(output).toContain('primitive-direct');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
