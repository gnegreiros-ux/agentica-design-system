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
//   covered by the gate's path filter (the paths-filter `gate` list, #149), or be named in
//   EXCLUDED_FUNCTIONAL_SPECS below with its own one-line reason. A spec
//   that is neither fails this test by name. An EXCLUDED_FUNCTIONAL_SPECS
//   entry that no longer exists on disk also fails — the exclusion list is
//   itself audited, not a write-once escape hatch.
// - Separately verifies tests/governance appears as a whole-directory entry
//   in both the gate's path filter and the governance-checks job's actual run
//   command — not just that individual files under it happen to be covered.
//
// Four independent claims, four tests:
// 1. Every tests/governance/ spec and every tests/functional/ spec is either
//    covered by the gate's path filter or explicitly, individually excluded
//    with a reason. Local, deterministic, no network.
// 2. tests/governance appears as a directory in both the path filter and the
//    job's run command — not merely implied by individual file coverage.
// 3. The gate always reports on every PR (#149, ADR-101): no trigger-level
//    path filter, no whole-job skip, every real step guarded by the
//    paths-filter output — the precondition for it being a required check.
// 4. The gate IS a required status check on `main` (#149, ADR-101 — made
//    required on 2026-09-28, right after the in-job path scoping merged in
//    #215). Guards against it being dropped from branch protection.
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
// named here, with a real reason — never a placeholder. All eight existing
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
    path: 'tests/functional/components/top-nav.spec.js',
    reason: 'Production-site interaction test (agtc-top-nav active link, injected on button.html) — same push-to-main-only matrix.',
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
  // Since #149 the gate's scope is no longer a trigger-level `paths` filter
  // (a required check skipped that way never reports and blocks every PR)
  // but the `gate` filter of the job's own paths-filter step.
  const filterStep = findPathsFilterStep(doc);
  const filters = loadYaml(filterStep.with.filters);
  if (!Array.isArray(filters.gate)) {
    throw new Error('The paths-filter step in the governance-checks job has no `gate` filter list — has it been renamed?');
  }
  return { doc, declaredPaths: filters.gate, filterStep };
}

function findPathsFilterStep(doc) {
  const job = doc.jobs[GATE_JOB_ID];
  if (!job) {
    throw new Error(`No "${GATE_JOB_ID}" job found in playwright.yml — has the gate job been renamed?`);
  }
  const step = job.steps.find((s) => typeof s.uses === 'string' && s.uses.startsWith('dorny/paths-filter@'));
  if (!step) {
    throw new Error(`No dorny/paths-filter step found in the "${GATE_JOB_ID}" job — where is the gate's path scope defined now?`);
  }
  return step;
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
      `${relPath} is not covered by the gate's paths-filter \`gate\` list in playwright.yml — a governance spec must never be excluded from its own gate`
    ).toBe(true);
  }

  // Every functional spec is either covered or explicitly excluded with a reason.
  for (const relPath of functionalSpecs) {
    const covered = isCoveredByPaths(relPath, declaredPaths);
    const excluded = excludedPaths.has(relPath);
    expect(
      covered || excluded,
      `${relPath} is neither covered by the gate's paths-filter list nor listed in EXCLUDED_FUNCTIONAL_SPECS — ` +
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

test('tests/governance appears as a whole directory in both the gate path filter and the governance-checks run command', () => {
  const { doc, declaredPaths } = loadWorkflow();
  const runCommand = findGovernanceChecksRunCommand(doc);

  expect(
    declaredPaths,
    `the gate's paths-filter list must include 'tests/governance/**' as a whole-directory entry (found: ${JSON.stringify(declaredPaths)})`
  ).toContain('tests/governance/**');

  const runCommandTokens = runCommand.trim().split(/\s+/);
  expect(
    runCommandTokens,
    `the ${GATE_JOB_ID} job's run command must pass 'tests/governance' as a whole directory (found command: ${runCommand})`
  ).toContain('tests/governance');
});

test('the PR gate always reports on every PR — no trigger-level path filter, no whole-job skip, every real step guarded', () => {
  const { doc, filterStep } = loadWorkflow();
  const trigger = doc.on.pull_request ?? {};

  // A required check whose workflow is skipped by a trigger-level filter
  // stays "pending" forever and blocks every unrelated PR (#149).
  expect(trigger.paths, 'pull_request must not carry a `paths` filter — scope the gate inside the job instead (#149)').toBeUndefined();
  expect(trigger['paths-ignore'], 'pull_request must not carry a `paths-ignore` filter (#149)').toBeUndefined();

  const job = doc.jobs[GATE_JOB_ID];
  expect(job.if, 'the gate job may only be conditioned on the event type, never on changed paths').toBe("github.event_name == 'pull_request'");
  expect(job.needs, 'the gate job must not depend on another job — a failed dependency skips it, and GitHub counts a skipped required check as passing').toBeUndefined();

  // Every step after detection must be guarded by its output, so a PR with
  // no gate-relevant change passes quickly, and one with a change really runs.
  const steps = job.steps;
  const filterIndex = steps.indexOf(filterStep);
  expect(filterStep.id, 'the paths-filter step needs an id for later steps to read its output').toBeTruthy();
  for (const step of steps.slice(filterIndex + 1)) {
    const label = step.name ?? step.uses;
    expect(
      typeof step.if === 'string' && step.if.includes(`steps.${filterStep.id}.outputs.gate`),
      `step "${label}" is not guarded by steps.${filterStep.id}.outputs.gate`
    ).toBe(true);
  }
});

test('main branch protection requires the PR gate as a status check (#149)', () => {
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
    `"${GATE_JOB_NAME}" is no longer a required status check on main — a PR could merge without the governance suite having run. Restore it in branch protection (ADR-101, #149)`
  ).toContain(GATE_JOB_NAME);
});
