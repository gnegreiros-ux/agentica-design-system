// Precondition for campaign C5 (doc-generator), not a numbered C5 test itself.
// Guards the CI governance layer that C5 depends on: the "Governance &
// accessibility fixtures (PR gate)" job in .github/workflows/playwright.yml
// must actually run on every governance-relevant PR, and — the gap this file
// exists to catch — being required to run is not the same as being a
// *required* branch-protection check. Scope decided in EXEC-008
// (decisions/EXECUTION-LOG.md): investigating why PR #124 merged with this
// gate red (C2-05/#117, since fixed) found the gate was never added to
// main's required status checks — a deliberate, documented choice in the
// workflow file itself, but one that means a red gate never blocks a merge.
//
// Two independent claims, two tests:
// 1. The gate's `pull_request.paths` filter actually covers every spec file
//    it exists to run — a spec that lands outside the filter would silently
//    never execute on a PR. Local, deterministic, no network.
// 2. The gate is not (yet) a required status check on `main` — a
//    characterization of the current gap, tracked as
//    https://github.com/gnegreiros-ux/agentica-design-system/issues/149.
//    This needs a live read of GitHub's branch-protection API, which has no
//    local source of truth in this repo (no committed settings file) and
//    returns 401 even for this public repo without authentication. Rather
//    than add a network dependency to a CI job whose default token likely
//    lacks the `administration` permission this read needs, this test shells
//    out to the maintainer's own `gh` CLI session and skips — loudly, with a
//    reason, never a silent pass — when `gh` isn't available or authorized.
//    Decided with gnegreiros-ux, 2026-09-22.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'playwright.yml');
const GOVERNANCE_TESTS_DIR = join(ROOT, 'tests', 'governance');
const REPO_SLUG = 'gnegreiros-ux/agentica-design-system';
const GATE_JOB_NAME = 'Governance & accessibility fixtures (PR gate)';

function extractPullRequestPaths(workflowText) {
  const blockMatch = workflowText.match(/pull_request:\n {4}paths:\n((?: {6}- '[^']+'\n)+)/);
  if (!blockMatch) {
    throw new Error(
      "Could not find a pull_request.paths block in playwright.yml — the trigger was restructured, update this test's parser"
    );
  }
  return [...blockMatch[1].matchAll(/- '([^']+)'/g)].map((match) => match[1]);
}

function isCoveredByPaths(relPath, patterns) {
  return patterns.some((pattern) => {
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3);
      return relPath === prefix || relPath.startsWith(`${prefix}/`);
    }
    return relPath === pattern;
  });
}

test('playwright.yml PR-gate path filter covers every tests/governance/ spec and the three governance-relevant accessibility specs', () => {
  const workflowText = readFileSync(WORKFLOW_PATH, 'utf8');
  const declaredPaths = extractPullRequestPaths(workflowText);

  const governanceSpecs = readdirSync(GOVERNANCE_TESTS_DIR)
    .filter((name) => name.endsWith('.spec.js'))
    .map((name) => `tests/governance/${name}`);

  const requiredAccessibilitySpecs = [
    'tests/functional/accessibility.spec.js',
    'tests/functional/governance-accessibility.spec.js',
    'tests/functional/doc-generator-accessibility.spec.js',
  ];

  for (const relPath of [...governanceSpecs, ...requiredAccessibilitySpecs]) {
    expect(
      isCoveredByPaths(relPath, declaredPaths),
      `${relPath} is not covered by playwright.yml's pull_request.paths filter (${JSON.stringify(declaredPaths)}) — it would never trigger the PR gate on a PR that only touches this file, silently escaping the decoupling test suite`
    ).toBe(true);
  }
});

test('main branch protection does not yet require the PR gate as a status check — characterizes #149', () => {
  let requiredContexts;
  try {
    const raw = execFileSync(
      'gh',
      ['api', `repos/${REPO_SLUG}/branches/main/protection/required_status_checks`, '--jq', '.contexts'],
      { encoding: 'utf8' }
    );
    requiredContexts = JSON.parse(raw);
  } catch (error) {
    test.skip(true, `gh CLI unavailable or not authorized to read ${REPO_SLUG}'s branch protection — cannot verify #149 from here (${error.message})`);
    return;
  }

  expect(
    requiredContexts,
    `"${GATE_JOB_NAME}" is now a required status check on main — #149 has been resolved. Update this test to assert it IS required (and close https://github.com/${REPO_SLUG}/issues/149 if not already done)`
  ).not.toContain(GATE_JOB_NAME);
});
