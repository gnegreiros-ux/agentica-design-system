// C2-07 (reduced scope) — GOVERNANCE.md's Audit governance section states
// the compliance badge is a display, never a condition on whether the
// audit runs. This cannot be tested behaviorally yet: clone/ is at
// skeleton stage, and no real badge-rendering or personalization-config-
// consumption code exists anywhere under clone/ today — verified:
// clone/personnalisation/governance/example.md's `badgeEnabled: false` is
// illustrative markdown, never read by any .mjs/.js file under clone/.
//
// This test proves only the narrower, real claim available today:
// clone/core/audit/index.mjs invokes all three core audits unconditionally,
// inside one Promise.all with no conditional (if/ternary/&&/||) around any
// of the three calls, and imports no config or personalization module that
// could gate them. It does NOT prove "a disabled badge doesn't affect the
// audit" — there is no badge to disable yet.
//
// TODO (tracked, not done here): once a real badge/personalization-config
// mechanism is wired into core/audit, rewrite this as a behavioral test —
// actually disable the badge, run the build, assert the audit still runs
// and its verdict is still reachable. Same reduced-scope treatment as
// C2-08 in tests/governance/clone-audit-adapter-substitution.spec.js.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEX_PATH = join(ROOT, 'clone', 'core', 'audit', 'index.mjs');

test('clone/core/audit/index.mjs invokes all three core audits unconditionally', () => {
  const source = readFileSync(INDEX_PATH, 'utf8');

  const importLines = source.match(/^import .+$/gm) ?? [];
  for (const line of importLines) {
    expect(line, `No import of a config/personalization module expected: "${line}"`).not.toMatch(
      /config|personnalisation|personalization/i
    );
  }

  const mainBody = source.slice(source.indexOf('async function main'));
  const promiseAllMatch = mainBody.match(/Promise\.all\(\s*\[([\s\S]*?)\]\s*\)/);
  expect(promiseAllMatch, 'Expected the three core audits to be invoked inside one Promise.all([...])').not.toBeNull();

  const invocationBlock = promiseAllMatch[1];
  expect(
    invocationBlock,
    'Expected no conditional control flow around the audit invocations'
  ).not.toMatch(/\bif\b|\?|&&|\|\|/);

  for (const call of ['checkHardcodedStyle()', 'checkPrimitiveTokenUsage()', 'runAccessibilityAudit()']) {
    expect(invocationBlock, `Expected ${call} to be invoked unconditionally inside main()`).toContain(call);
  }
});
