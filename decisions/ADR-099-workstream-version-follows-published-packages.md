# ADR-099 — Workstream version tracks the published package state, not an independent counter

> **Date:** 2026-09-23
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-099-workstream-version-follows-published-packages.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-072-npm-package-architecture.md
> **Relations:** ADR-072 (independent package versioning — not touched by this decision), ADR-074, `package.json` (root), `Temp/plan-de-tests-decouplage-v0.4.0.md` (gitignored, local)

---

## Context

Two separate version numbers exist for "Agentica" with no stated relationship between them:

- The repo's own workstream tags (`v0.1.0` → `v0.4.0`, root `package.json` at `0.4.0`) track
  the découplage chantier's own milestones, most recently synced 0.1.0 → 0.4.0 in PR #116.
- `@agentica-ds/tokens` and `@agentica-ds/components`, the two published npm packages, are
  both currently live at `1.0.0` on the registry — with no corresponding git tag (the last
  package-scoped tags in git history are `@agentica-ds/tokens@0.1.3` and
  `@agentica-ds/components@0.1.3`).

Anyone asking "what version of Agentica is this" gets two different, unrelated answers. This
surfaced 2026-09-23 while closing out the découplage v0.4.0 test campaign
(`Temp/plan-de-tests-decouplage-v0.4.0.md` §10, gitignored, local), which flagged it as a
clarification to resolve before declaring the workstream closed.

## Decision

The repo-level/workstream version (root `package.json`, `vX.Y.Z` git tags) is not an
independent counter. It reflects milestones in the actually-published package state, not its
own separate release cadence.

Concretely: once the découplage v0.4.0 workstream (`GOVERNANCE.md`, Clone, Master Skill,
doc-generator, and its test campaign) is fully closed, the repo is tagged **`v1.0.0`** —
matching the version already live for `@agentica-ds/tokens` and `@agentica-ds/components` —
instead of continuing its own separate `0.x` counter. Root `package.json` stays at `0.4.0`
until that closure actually happens; it is not bumped prematurely just to match the packages
ahead of the work being done.

This decision is scoped to **the relationship between the workstream/repo-level version and
the packages' published state**. It says nothing about the packages' relationship to each
other.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| A single literal version everywhere — workstream = `@agentica-ds/tokens` = `@agentica-ds/components`, always in lockstep | Would reverse ADR-072's deliberate decision to version the two packages independently via Changesets, specifically to avoid a tokens-only change forcing a components version bump (and vice versa). Not this decision's scope to reopen. |
| Two permanently independent, unrelated version tracks (workstream keeps counting its own `0.x` forever, regardless of what's published) | This is the status quo that caused the confusion this ADR resolves — two numbers for "the same product" with no stated relationship misleads anyone trying to answer a simple question. |

## Consequences

- Root `package.json` and the repo's `vX.Y.Z` tags move to `1.0.0` **once the découplage v0.4.0
  workstream is actually closed** (test campaign included) — not before.
- `@agentica-ds/tokens` and `@agentica-ds/components` keep versioning independently of each
  other via Changesets, exactly as ADR-072 already decided. This ADR does not touch that.
- Future workstream milestones follow the same principle: the repo-level tag reflects where
  the published product has actually reached, not a counter that can drift ahead of or behind
  what a consumer can actually install.

## Incidents or triggers

Discovered 2026-09-23 while closing §10 (exit criteria) of the découplage v0.4.0 test plan —
point 4's own text already named this as "a clarification to resolve before closure, before the
question comes up under the pressure of a publication."
