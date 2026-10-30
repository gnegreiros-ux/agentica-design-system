// Issue 208 — a web component must only consume custom properties that
// @agentica-ds/tokens actually defines (or give them a fallback): it ships in
// @agentica-ds/components without the site's CSS. agtc-top-nav consumed
// var(--agtc-shadow-md), a variable defined only by site/build.js — the site
// rendered fine, every other consumer got no shadow at all. The phantom-token
// check only looked at --agtc-semantic-*, so nothing caught it.
//
// scripts/audit-tokens.js check 5 (auditUndefinedComponentVars) reports such a
// var() as a critical violation, so --ci exits non-zero. This test guards both
// directions: an undefined, fallback-less variable in an agtc-*.js file fails
// the run; a real token or a var() with a fallback does not.

import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runWithTruncationRetry } from './support/run-with-truncation-retry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const AUDIT_SCRIPT_PATH = join(ROOT, 'scripts', 'audit-tokens.js');

function runAuditOn(componentSource) {
  const tmpDir = mkdtempSync(join(tmpdir(), 'tokens-audit-component-var-'));
  try {
    writeFileSync(join(tmpDir, 'agtc-example.js'), componentSource);
    function runOnce() {
      let threw = false;
      let output = '';
      try {
        output = execFileSync('node', [AUDIT_SCRIPT_PATH, '--src-dir', tmpDir, '--ci'], { encoding: 'utf8' });
      } catch (error) {
        threw = true;
        output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      }
      return { threw, output };
    }
    // Bounded retry, workaround for #118 (see support/run-with-truncation-retry.mjs).
    return runWithTruncationRetry(runOnce, 'Undefined custom properties');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

test('audit-tokens.js --ci fails when a component consumes a non-token --agtc-* variable without fallback', () => {
  // The deliberate violation: a site-only variable, exactly the issue 208 shape.
  const { threw, output } = runAuditOn('const styles = `.menu { box-shadow: var(--agtc-shadow-md); }`;\n');

  expect(
    threw,
    'audit-tokens.js --ci must exit non-zero when agtc-*.js consumes a --agtc-* variable the token package does not define and gives it no fallback (issue 208)'
  ).toBe(true);
  expect(output).toContain('Undefined in the token package: --agtc-shadow-md');
});

test('audit-tokens.js --ci accepts a real token and a non-token variable with a fallback', () => {
  const { threw, output } = runAuditOn(
    'const styles = `.menu { box-shadow: var(--agtc-semantic-shadow-raised); top: var(--agtc-header-height, 64px); }`;\n'
  );

  expect(output).toContain('Every custom property consumed by a component is a token or has a fallback');
  expect(threw, output).toBe(false);
});
