// C1-06 — the governance-sync CI job must only signal a desynchronization
// and fail the build; it must never write to the repo or commit on its own
// behalf (GOVERNANCE.md's Rule 2 applied to the sync tooling itself).
//
// If any of these assertions ever need to change because the workflow
// grew a write or auto-commit step, that is a Rule 2 violation to report,
// not a test to relax — do not remove a failing assertion here to make
// this file green again.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { DESTINATIONS } from '../../scripts/sync-governance.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'governance-sync.yml');
const CHECK_SCRIPT_PATH = join(ROOT, 'scripts', 'check-governance-sync.mjs');
const GOVERNANCE_PATH = join(ROOT, 'GOVERNANCE.md');

const FORBIDDEN_WRITE_PATTERNS = [
  /git\s+commit/i,
  /git\s+push/i,
  /git\s+add\b/i,
  /add-and-commit/i,
  /git-auto-commit/i,
  /create-pull-request/i,
];

function fingerprint(content) {
  return createHash('sha256').update(content).digest('hex');
}

test.describe('C1-06 — governance sync only signals drift, never applies it', () => {
  test('the CI workflow calls the read-only check, not the generator', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');
    expect(workflow).toContain('check-governance-sync.mjs');
    expect(workflow).not.toContain('sync-governance.mjs');
  });

  test('the CI workflow declares read-only repo permissions', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');
    expect(workflow).toMatch(/permissions:\s*\n\s*contents:\s*read/);
  });

  test('the CI workflow contains no write or auto-commit step', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');
    for (const pattern of FORBIDDEN_WRITE_PATTERNS) {
      expect(
        workflow,
        `Found a write/commit pattern (${pattern}) in governance-sync.yml — this is a Rule 2 violation; report it, do not remove this assertion to pass`
      ).not.toMatch(pattern);
    }
  });

  test('check-governance-sync.mjs contains no file-write call', () => {
    const scriptSource = readFileSync(CHECK_SCRIPT_PATH, 'utf8');
    expect(scriptSource).not.toMatch(/writeFileSync|appendFileSync|createWriteStream/);
  });

  test('running the check against the real repo mutates nothing on disk', () => {
    const filesToWatch = [GOVERNANCE_PATH, ...DESTINATIONS];
    const before = filesToWatch.map((f) => fingerprint(readFileSync(f, 'utf8')));

    // The repo is expected to be in sync today (see C1-02) — this run
    // should exit 0 without needing any injected drift scenario.
    expect(() => {
      execFileSync('node', [CHECK_SCRIPT_PATH], { stdio: 'pipe' });
    }).not.toThrow();

    const after = filesToWatch.map((f) => fingerprint(readFileSync(f, 'utf8')));
    expect(after).toEqual(before);
  });
});
