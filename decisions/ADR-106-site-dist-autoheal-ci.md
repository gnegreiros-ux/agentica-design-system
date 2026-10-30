# ADR-106 — site/dist/ auto-rebuild post-merge on main (issue #236)

> **Date:** 2026-10-19
> **Status:** 🔶 Proposed
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-106-site-dist-autoheal-ci.md
> **Read before:** .github/workflows/site-freshness.yml, .github/workflows/site-dist-autoheal.yml
> **Relations:** ADR-105 (clone/core-source rename, no functional relation but
> the most recent ADR at the time), site/build.js (AUDIT_SOURCES, auditSourcesDate()),
> issue #236

---

## Context

`site-freshness.yml` fails in CI when a PR touches a path listed in
`AUDIT_SOURCES` (`site/build.js:7704` — `site`, `tokens`, `decisions`,
`guidelines`, `components`, `Brand`, `package.json`, `package-lock.json`)
without `site/dist/` having been rebuilt in the same commit. `auditSourcesDate()`
is already deterministic — it derives the audit date via `git log -1
--format=%cI` on `AUDIT_SOURCES`, explicitly excluding `site/dist/` — so
this is not a non-determinism bug (already fixed for the sitemap.xml case,
PR #114; partial recurrence PR #156). The real problem, documented by
issue #236, is an unenforced contract: nothing mechanically requires
rebuilding `site/dist/` as soon as an `AUDIT_SOURCES` path changes — only
human discipline (or the memory of a past CI failure) does so today.

## Decision

Two-stage hybrid solution:

1. **On PRs: no change.** `site-freshness.yml` keeps failing with a clear
   message if `site/dist/` is stale. This gate remains the reference human
   review — it never commits on behalf of the PR's author.
2. **After merge to `main`: new workflow `site-dist-autoheal.yml`**
   (triggered on `push` to `main` only) that rebuilds `site/dist/` and,
   if a difference is detected, commits it automatically under a
   dedicated bot author (`agentica-bot <bot@agentica.design>`), with the
   message `chore(site): auto-rebuild dist [auto-healed]`, citing issue
   #236 and this ADR.

`agentica-bot <bot@agentica.design>` is preferred over a CI platform's
native identity (e.g. `github-actions[bot]`) for a reason of digital
sovereignty and portability: a platform-owned name would not survive a CI
change, whereas `agentica-bot` is a name entirely controlled by the
project, in its own domain (`agentica.design`).

The workflow is designed to never loop: its only write path
(`site/dist/`) is explicitly excluded from `auditSourcesDate()`'s
calculation (`:(exclude)site/dist`), so its own commit can never
re-trigger a new, different rebuild cycle. An `[auto-healed]` guard in the
commit message avoids even the redundant rebuild of a possible second run.

## Rejected alternatives

| Alternative | Reason for rejection |
|---|---|
| Auto-commit directly on PRs (same mechanism, triggered on `pull_request`) | A PR coming from a fork has no write access to the target repository — `GITHUB_TOKEN` is read-only there by default, and granting it write access (`pull_request_target` or equivalent) would open a path for unreviewed code to run with a write token. Rejected for security, not convenience. |
| Restrict `AUDIT_SOURCES` to reduce how often it fails | Would empty the check of its purpose: `AUDIT_SOURCES` exists precisely because these paths (`decisions/`, `guidelines/`, etc.) influence the content `site/build.js` publishes. Shrinking the list would mean accepting that `site/dist/` silently diverges from its own sources, instead of fixing the missing contract. |
| Do nothing (status quo) | Already produced two documented incidents (PR #114, recurrence PR #156) and issue #236 — human discipline alone is not enough. |

## Consequences

- New file `.github/workflows/site-dist-autoheal.yml`, minimal scope
  `permissions: contents: write`, never on `pull_request`.
- `main` can receive, in addition to human commits, automatic commits
  signed by `agentica-bot`, always limited to `site/dist/` and always
  immediately after a push that needed one.
- Residual risks to watch: silent job failure (default GitHub
  notification only, no additional alert configured); concurrent push
  conflict on `main` (the job fails visibly, never forces —
  `git push` without `--force`).

## Incidents or triggers

Issue #236. History: PR #114 (fix `lastmod` derived from git log),
recurrence PR #156 (same class of problem on a path not covered at the
time).
