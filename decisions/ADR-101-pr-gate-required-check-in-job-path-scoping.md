# ADR-101 — The Playwright PR gate becomes a required check on `main`, scoped by path inside the job

> **Date:** 2026-09-25
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-101-pr-gate-required-check-in-job-path-scoping.md
> **Read before:** ADR-076, governance/rules/git-workflow.md § Protection rules
> **Relations:** ADR-076 (amended), ADR-066, issue #149, issue #117, PR #124, `.github/workflows/playwright.yml`, `tests/governance/playwright-workflow-gate-coverage.spec.js`

---

## Context

The `Governance & accessibility fixtures (PR gate)` job of `playwright.yml` runs the
decoupling v0.4.0 suite (`tests/governance/` + the accessibility specs) on pull
requests. It was never a required status check on `main`, so a red gate did not block
a merge: PR #124 was merged with it red (C2-05, #117).

It could not simply be added to `required_status_checks`: its workflow was scoped with a
trigger-level `pull_request.paths` filter, and a required check whose workflow is skipped
by such a filter never reports — it stays "pending" and blocks the merge of every PR that
doesn't touch those paths (#149).

## Decision

1. **No trigger-level path filter on the gate's `pull_request` trigger.** The gate job runs
   on every PR and always reports a status.
2. **The path scope moves inside the job**, as the `gate` list of a
   `dorny/paths-filter` step. Every later step is guarded by that step's output: a PR
   with no gate-relevant change passes in a few seconds; a PR with one runs the full suite.
3. **One job, no `needs:`.** If path detection lived in a separate job, a failure there
   would *skip* the gate job — and GitHub counts a skipped required check as passing. In a
   single job, a detection failure fails the required check itself.
4. **`Governance & accessibility fixtures (PR gate)` is added to `main`'s
   `required_status_checks`** — a human step, done by the maintainer once this change is
   merged (branch protection is not versioned in the repo).
5. The scope list also includes `.github/workflows/playwright.yml` itself, so a change to
   the gate's definition proves it still runs.

`tests/governance/playwright-workflow-gate-coverage.spec.js` locks points 1–3 (no trigger
filter, no whole-job skip, every step guarded) and reads the scope from the paths-filter
list instead of `pull_request.paths`.

This amends ADR-076's "`lang-audit` only" required-check list for this one job. The full
3-browser visual/functional matrix stays push-to-main-only, as ADR-076 decided.

## Rejected alternatives

- **Keep the trigger filter and add the check as required.** Rejected: deadlocks every
  out-of-scope PR (the exact problem described in #149).
- **Separate `changes` job + `needs:` + an umbrella job with `if: always()`.** Rejected:
  more moving parts for the same result, and the dependent-job-skipped-counts-as-pass
  trap must then be handled explicitly in the umbrella job's logic.
- **Run the governance suite unconditionally on every PR.** Rejected: ~2–3 minutes of
  install + build + Chromium on PRs (docs, site copy, changesets) that cannot affect it.

## Consequences

- Every PR now triggers `playwright.yml`; on out-of-scope PRs only the gate job starts and
  finishes almost immediately (the matrix and report jobs remain skipped on `pull_request`).
- One more third-party action (`dorny/paths-filter@v3`), with `pull-requests: read` on the
  gate job only.
- Once the check is required, the characterization test for #149 in the coverage spec
  ("does not yet require the PR gate") fails on purpose, as it was written to: it must
  then be flipped to assert the check **is** required, and #149 closed.
