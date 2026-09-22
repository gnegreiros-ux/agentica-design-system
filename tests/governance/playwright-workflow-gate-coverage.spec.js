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
// Design locked with gnegreiros-ux (2026-09-19, revisited and completed
// 2026-09-22 — an earlier, narrower version of this file merged in PR #150
// used text regex instead of a real YAML parse and a hardcoded 3-entry
// accessibility-spec list instead of a recursive, default-required scan;
// this version replaces it):
// - Parses playwright.yml for real with js-yaml (an explicit devDependency
//   since PR #132 — never the transitive/hoisted copy some other package
//   might carry).
// - Enumerates tests/functional/**/*.spec.js **recursively**. A flat
//   top-level glob previously missed tests/functional/components/*.spec.js
//   entirely — the same "artifact never exercised on a real case" pattern
//   as issue #127.
// - Default-required-unless-excluded: every functional spec must either be
//   covered by the gate's pull_request.paths filter, or be named in
//   EXCLUDED_FUNCTIONAL_SPECS below with its own one-line reason. A spec
//   that is neither fails this test by name. An EXCLUDED_FUNCTIONAL_SPECS
//   entry that no longer exists on disk also fails — the exclusion list is
//   itself audited, not a write-once escape hatch.
// - Separately verifies tests/governance appears as a whole-directory entry
//   in both pull_request.paths and the governance-checks job's actual run
//   command — not just that individual files under it happen to be covered.
//
// Three independent claims, three tests:
// 1. Every tests/governance/ spec and every tests/functional/ spec is either
//    covered by the gate's path filter or explicitly, individually excluded
//    with a reason. Local, deterministic, no network.
// 2. tests/governance appears as a directory in both the path filter and the
//    job's run command — not merely implied by individual file coverage.
// 3. The gate is not (yet) a required status check on `main` — a
//    characterization of the current gap, tracked as
//    https://github.com/gnegreiros-ux/agentica-design-system/issues/149.
//    This needs a live read of GitHub's branch-protection API, which has no
//    local source of truth in this repo (no committed settings file) and
//    returns 401 even for this public repo without authentication. Rather
//    than add a network dependency to a CI job whose default token likely
//    lacks the `administration` permission this read needs, this test shells
//    out to the maintainer's own `gh` CLI session and skips — loudly, with a
//    reason, never a silent pass — when `gh` isn't available or authorized.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'playwright.yml');
const REPO_SLUG = 'gnegreiros-ux/agentica-design-system';
const GATE_JOB_NAME = 'Governance & accessibility fixtures (PR gate)';
const GATE_JOB_ID = 'governance-checks';

// Every tests/functional/ spec NOT covered by the gate's path filter must be
// named here, with a real reason — never a placeholder. All seven existing
// exclusions test the production site itself (real site/dist pages on
// baseURL :8080), not the decoupling governance suite: they belong to the
// full visual/functional/3-browser matrix that ADR-076 deliberately kept
// push-to-main-only (rejected making it a PR gate over the 3x-per-iteration
// cost). Validated with gnegreiros-ux, 2026-09-22.
const EXCLUDED_FUNCTIONAL_SPECS = [
  {
    path: 'tests/functional/components/button.spec.js',
    reason: 'Production-site interaction test on button.html — part of the push-to-main-only visual/functional matrix (ADR-076), unrelated to the governance suite.',
  },
  {
    path: 'tests/functional/components/segmented.spec.js',
    reason: 'Production-site interaction test on segmented.html — same push-to-main-only matrix as button.spec.js.',
  },
  {
    path: 'tests/functional/components/tabs.spec.js',
    reason: 'Production-site interaction test on tabs.html — same push-to-main-only matrix.',
  },
  {
    path: 'tests/functional/components/toggle.spec.js',
    reason: 'Production-site interaction test on toggle.html — same push-to-main-only matrix.',
  },
  {
    path: 'tests/functional/language.spec.js',
    reason: 'Bilingual-rendering check (ADR-070/071/075) across the whole production site — same push-to-main-only matrix, not a governance-suite concern.',
  },
  {
    path: 'tests/functional/nav.spec.js',
    reason: 'Production-site navigation (mega menu) test — same push-to-main-only matrix.',
  },
  {
    path: 'tests/functional/sidebar.spec.js',
    reason: 'Production-site docs-sidebar test — same push-to-main-only matrix.',
  },
];

function findSpecsRecursive(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...findSpecsRecursive(full));
    } else if (entry.endsWith('.spec.js')) {
      out.push(full);
    }
  }
  return out;
}

function toRepoRelative(absolutePath) {
  return absolutePath.slice(ROOT.length + 1).split('\\').join('/');
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

function loadWorkflow() {
  const workflowText = readFileSync(WORKFLOW_PATH, 'utf8');
  // js-yaml's default schema (YAML 1.2) parses a bare `on:` key as the
  // literal string "on", not the boolean true — verified directly against
  // this exact file before relying on it (some other YAML parsers/schemas
  // are known to coerce `on:` to a boolean, which would break this read).
  const doc = loadYaml(workflowText);
  return { doc, declaredPaths: doc.on.pull_request.paths };
}

function findGovernanceChecksRunCommand(doc) {
  const job = doc.jobs[GATE_JOB_ID];
  if (!job) {
    throw new Error(`No "${GATE_JOB_ID}" job found in playwright.yml — has the gate job been renamed?`);
  }
  const runStep = job.steps.find((step) => typeof step.run === 'string' && step.run.includes('playwright test'));
  if (!runStep) {
    throw new Error(`No step running "playwright test" found in the "${GATE_JOB_ID}" job — has it been restructured?`);
  }
  return runStep.run;
}

test('every tests/governance/ and tests/functional/ spec is covered by the PR gate or explicitly, individually excluded', () => {
  const { declaredPaths } = loadWorkflow();

  const governanceSpecs = findSpecsRecursive(join(ROOT, 'tests', 'governance')).map(toRepoRelative);
  const functionalSpecs = findSpecsRecursive(join(ROOT, 'tests', 'functional')).map(toRepoRelative);

  const excludedPaths = new Set(EXCLUDED_FUNCTIONAL_SPECS.map((entry) => entry.path));

  // Every governance spec must be covered — there is no legitimate exclusion
  // for a governance test from its own gate.
  for (const relPath of governanceSpecs) {
    expect(
      isCoveredByPaths(relPath, declaredPaths),
      `${relPath} is not covered by playwright.yml's pull_request.paths filter — a governance spec must never be excluded from its own gate`
    ).toBe(true);
  }

  // Every functional spec is either covered or explicitly excluded with a reason.
  for (const relPath of functionalSpecs) {
    const covered = isCoveredByPaths(relPath, declaredPaths);
    const excluded = excludedPaths.has(relPath);
    expect(
      covered || excluded,
      `${relPath} is neither covered by pull_request.paths nor listed in EXCLUDED_FUNCTIONAL_SPECS — ` +
        `it would silently never run on a PR. Either add it to the path filter, or add it to ` +
        `EXCLUDED_FUNCTIONAL_SPECS with a real reason.`
    ).toBe(true);
    if (covered && excluded) {
      throw new Error(`${relPath} is both covered by the path filter and listed as excluded — remove it from EXCLUDED_FUNCTIONAL_SPECS, the entry is stale.`);
    }
  }

  // The exclusion list itself must not drift: every entry must name a real,
  // still-existing, still-uncovered functional spec — never a write-once
  // escape hatch nobody audits again.
  const functionalSpecsSet = new Set(functionalSpecs);
  for (const entry of EXCLUDED_FUNCTIONAL_SPECS) {
    expect(entry.reason && entry.reason.length > 0, `EXCLUDED_FUNCTIONAL_SPECS entry for ${entry.path} has no reason`).toBeTruthy();
    expect(
      functionalSpecsSet.has(entry.path),
      `EXCLUDED_FUNCTIONAL_SPECS names ${entry.path}, which no longer exists under tests/functional/ — remove this stale entry`
    ).toBe(true);
  }
});

test('tests/governance appears as a whole directory in both pull_request.paths and the governance-checks run command', () => {
  const { doc, declaredPaths } = loadWorkflow();
  const runCommand = findGovernanceChecksRunCommand(doc);

  expect(
    declaredPaths,
    `pull_request.paths must include 'tests/governance/**' as a whole-directory entry (found: ${JSON.stringify(declaredPaths)})`
  ).toContain('tests/governance/**');

  const runCommandTokens = runCommand.trim().split(/\s+/);
  expect(
    runCommandTokens,
    `the ${GATE_JOB_ID} job's run command must pass 'tests/governance' as a whole directory (found command: ${runCommand})`
  ).toContain('tests/governance');
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
