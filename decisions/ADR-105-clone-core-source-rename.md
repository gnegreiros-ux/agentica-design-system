# ADR-105 — "core" names two different things; the Clone's source directory becomes `core-source/`

> **Date:** 2026-10-07
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-105-clone-core-source-rename.md
> **Read before:** AGENTS.md, GOVERNANCE.md, clone/README.md
> **Relations:** GOVERNANCE.md (Rules 3, 4 — unaffected), ADR-100 (unaffected, path in its body now stale by design), decisions/README.md ("Stale paths inside an ADR body" note), decisions/CHANGELOG-structure.md, clone/core-source/README.md

---

## Context

"Core" names two legitimate but different things in this repository, and the collision already produced one real analysis error in a working session (2026-10-07): an issue was edited on the premise that `clone/core/` could never hold components, then that edit had to be reverted once it became clear the premise conflated the two senses below.

1. **The abstract sense** — `GOVERNANCE.md`'s foundation concept. Rules 3 and 4 say, respectively: *"No component in the foundation ("core") accepts a hard-coded style value (hex color, pixel size, arbitrary spacing, etc.). Every visual value references a token."* and *"Components only consume semantic tokens (e.g. `color-text-danger`), never primitive tokens (e.g. `red-500`) directly."* Here "core" means "whatever components a design system built on this governance ships," independently of any file path. This sense is not renamed by this decision — it is `GOVERNANCE.md`'s own vocabulary, copied verbatim into `clone/core-source/references/non-negotiable-foundation.md` by `scripts/sync-governance.mjs`, and neither file is touched here.

2. **The path sense** — `clone/core/`, a literal directory in this repository. Verified before this decision, not assumed: `clone/core/` is the Clone's **source only**. `tests/governance/clone-core-reinstall-preserves-personalization.spec.js:35` already names a simulated "installed" copy *"Never the real, tracked clone/"*, and its reinstall step (line 53) copies **from** the tracked `clone/core/` into that simulation. `tests/governance/clone-package-self-contained.spec.js` runs `npm pack --dry-run` directly on `clone/`, confirmed live to return the tracked tree byte-for-byte, with no build/transform step. No second, persisted "installed" artifact exists anywhere in this repository — "installed" is always an ephemeral copy derived from this one tracked directory.

Both senses are legitimate on their own. The problem is that nothing distinguishes them in code, tests, or prose: a sentence like "will `core/` ever contain components?" is unanswerable without first asking which of the two is meant.

## Decision

1. **The abstract sense of "core" is untouched.** `GOVERNANCE.md` Rules 3/4 and `clone/core-source/references/non-negotiable-foundation.md` (its generated, verbatim copy) keep saying "core" exactly as before. This ADR does not redefine, rename, or edit either file.

2. **The path `clone/core/` is renamed `clone/core-source/`.** The abstract sense belongs to `GOVERNANCE.md` and cannot be renamed without a much larger change — reopening the governance document itself, as the rejected alternatives below describe. The path has no such cost: it is a directory in this repository, renamed in place. `core-source/` stays a sibling of `personnalisation/` (not moved under `packages/`), preserving the side-by-side layout that teaches the Clone's central split.

3. **Components never live in `clone/core-source/`.** Verified, not assumed: `clone/personnalisation/` has exactly five real tiers today — `agent-config/`, `branding/`, `docs-site/`, `governance/`, `theme/` (directory listing checked 2026-10-07; the same five that `tests/governance/clone-personalization-tiers.spec.js` (C3-01) enumerates and tests). No tier for components exists. This ADR does not create one and does not decide where a future component source for an audit would come from — it only closes the exact question that produced the 2026-10-07 error: `clone/core-source/` is the audit engine and the four rules, never a components library of its own, in either sense of "core." Where component source would actually come from, if and when that need arises, is left for that future decision.

4. **Naming convention from now on, in code, tests, and ADRs:**
   - `core-source/` (or the literal path `clone/core-source/`) refers only to the Clone's source directory.
   - Unqualified "core," with no path, refers only to `GOVERNANCE.md`'s abstract foundation concept.
   - A sentence that needs both must say so explicitly (e.g. "the foundation ('core') as implemented by `clone/core-source/`") rather than relying on either word alone.

5. **One specific dated record is not rewritten by this rename.** `site/build.js`'s changelog entry dated for the `sync-governance.mjs` delivery names the pre-rename path `clone/core/references/`. It is not edited for this rename, for the same reason an ADR body is not: it is a dated record of repo state at the time it was written, not current state. This point settles only that one entry — it is not a general rule about dated records outside ADR bodies; such a rule, if it should exist, belongs in its own ADR.

6. **This ADR supersedes nothing.** `ADR-100`'s `Status:` and body stay exactly as published, stale path included, per the immutability note in `decisions/README.md:193-206`. The rename itself is a mechanical move, logged in `decisions/CHANGELOG-structure.md` citing this ADR as the governing decision — not a new ADR per moved file.

## Rejected alternatives

| Alternative | Reason for rejection |
|---|---|
| Rename the abstract sense instead (e.g. call `GOVERNANCE.md`'s concept something other than "core") | `GOVERNANCE.md` is the canonical source shipped to both the Clone and the Master Skill; renaming its vocabulary is a far larger, unrelated change for a problem that only needs the path side fixed. |
| Move `clone/core/` under `packages/` instead of renaming in place | Rejected by the decision-maker: the current `core/` / `personnalisation/` side-by-side layout is itself what teaches the Clone's central separation; moving one of the two under a different parent breaks that visual symmetry for no gain. |
| Leave both senses as "core" and rely on context to disambiguate | This is the status quo that already produced a real, documented analysis error in this session — context alone did not disambiguate it even for careful reading. |

## Consequences

- `clone/core/` is renamed `clone/core-source/`; every functional reference (`clone/package.json`, `scripts/sync-governance.mjs`, four `tests/governance/clone-*.spec.js` files) is updated in the same change, logged in `decisions/CHANGELOG-structure.md`.
- Prose references inside files that travel with the renamed directory (`clone/core-source/README.md`, the three audit `.mjs` stub comments, the three audit specs, `clone/README.md`, `clone/personnalisation/**/*.md`) are updated for accuracy, same change.
- `GOVERNANCE.md`, `clone/core-source/references/non-negotiable-foundation.md`, `ADR-100`, and the one `site/build.js` changelog entry named in point 5 are explicitly **not** touched.
- `tests/governance/tokens-audit-primitive-layer-scope.spec.js`'s fixture label (`join('clone', 'core')`, line 42) is relabeled `'core-source'` — not required for the test to pass (it runs against an isolated temp copy), but a `'core'` label in a file about something else is exactly the kind of collision this ADR exists to stop recreating.
- `tests/governance/clone-core-reinstall-preserves-personalization.spec.js`'s filename is unchanged — it describes a behavior (reinstalling the core source), not a path.

## Incidents or triggers

2026-10-07: during a backlog-documentation session, "will `core/` ever contain components?" was answered using issue #172's and `ADR-100`'s language without first separating the two senses of "core," producing an edit to issue #172 that had to be reverted once the error was found.
