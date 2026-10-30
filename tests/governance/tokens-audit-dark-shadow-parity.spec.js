// Issue 210 — both modes must always offer the same options, adapted to each mode
// (human rule, 2026-09-28). A shadow tuned for a light background nearly vanishes on a
// dark one, so every non-deprecated semantic.shadow.* token must have a variant in
// semantic.dark.json.
//
// scripts/audit-tokens.js check 6 (auditDarkShadowParity) reports a missing dark
// variant as a critical violation, so --ci exits non-zero. Each test copies the real
// token files to a temp directory, applies one mutation, and runs the audit on it with
// --tokens-dir, scoped to an empty source directory so only the token checks matter.

import { test, expect } from '@playwright/test';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runWithTruncationRetry } from './support/run-with-truncation-retry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const AUDIT_SCRIPT_PATH = join(ROOT, 'scripts', 'audit-tokens.js');

function runAuditWith(mutate) {
  const tmpDir = mkdtempSync(join(tmpdir(), 'tokens-audit-dark-shadow-'));
  try {
    const tokensDir = join(tmpDir, 'tokens');
    const srcDir = join(tmpDir, 'src');
    cpSync(join(ROOT, 'tokens'), tokensDir, { recursive: true });
    mkdirSync(srcDir);
    const read = name => JSON.parse(readFileSync(join(tokensDir, name), 'utf8'));
    const write = (name, data) => writeFileSync(join(tokensDir, name), JSON.stringify(data, null, 2));
    mutate({ read, write });

    function runOnce() {
      let threw = false;
      let output = '';
      try {
        output = execFileSync('node', [AUDIT_SCRIPT_PATH, '--tokens-dir', tokensDir, '--src-dir', srcDir, '--ci'], { encoding: 'utf8' });
      } catch (error) {
        threw = true;
        output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      }
      return { threw, output };
    }
    // Bounded retry, workaround for #118 (see support/run-with-truncation-retry.mjs).
    return runWithTruncationRetry(runOnce, 'Dark-mode shadow parity');
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

test('audit-tokens.js --ci fails when a semantic shadow has no dark variant', () => {
  const { threw, output } = runAuditWith(({ read, write }) => {
    const dark = read('semantic.dark.json');
    delete dark.semantic.shadow.raised;
    write('semantic.dark.json', dark);
  });

  expect(
    threw,
    'audit-tokens.js --ci must exit non-zero when a semantic.shadow.* token has no variant in semantic.dark.json (issue 210)'
  ).toBe(true);
  expect(output).toContain('No dark variant in semantic.dark.json: semantic.shadow.raised');
});

test('audit-tokens.js skips a deprecated semantic shadow with no dark variant', () => {
  const { output } = runAuditWith(({ read, write }) => {
    const light = read('semantic.json');
    light.semantic.shadow.raised.$deprecated = 'Test fixture: deprecated shadows need no dark variant';
    write('semantic.json', light);
    const dark = read('semantic.dark.json');
    delete dark.semantic.shadow.raised;
    write('semantic.dark.json', dark);
  });

  expect(output).toContain('Every semantic.shadow.* token has a dark variant');
  expect(output).not.toContain('No dark variant in semantic.dark.json');
});

test('the repository tokens pass the dark-mode shadow parity check', () => {
  const { output } = runAuditWith(() => {});

  expect(output).toContain('Every semantic.shadow.* token has a dark variant');
});
