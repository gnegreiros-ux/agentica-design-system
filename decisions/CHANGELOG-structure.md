# decisions/CHANGELOG-structure.md

> Log of structural/organizational moves in this repository — file and directory
> relocations, renames, and format migrations that are the mechanical consequence of
> a decision recorded in `decisions/`, not a decision in themselves.
> **Type:** instruction
> **Logical path:** decisions/CHANGELOG-structure.md
> **Read before:** decisions/README.md
> **Relations:** decisions/README.md, decisions/ADR-097-invocable-skill-directory-convention.md

---

## Why this file exists

An ADR answers *why*. It stays immutable once active, and its body is never edited
to follow a later file move (see the "Stale paths inside an ADR body" note in
`decisions/README.md`). But "what moved where, and when" still needs a place to
live that isn't buried in git history — this file is that place. Each entry names
the governing ADR; it does not re-argue the decision.

---

## 2026-09-17 — Invocable skills moved to `<name>/SKILL.md`

Governing decision: [ADR-097](ADR-097-invocable-skill-directory-convention.md).

Six custom skills relocated from flat files (invisible to Claude Code's skill
loader) to the directory format it actually discovers, each gaining a YAML
frontmatter (`name`, `description`) while keeping its existing citation metadata
block, unchanged in position, just below the frontmatter:

| Skill | Before | After |
|---|---|---|
| quality-gate | `.claude/skills/quality-gate.md` | `.claude/skills/quality-gate/SKILL.md` |
| ux-pattern-review | `.claude/skills/ux-pattern-review.md` | `.claude/skills/ux-pattern-review/SKILL.md` |
| ai-component-metadata | `.claude/skills/ai-component-metadata.md` | `.claude/skills/ai-component-metadata/SKILL.md` |
| ai-ds-composer | `.claude/skills/ai-ds-composer.md` | `.claude/skills/ai-ds-composer/SKILL.md` |
| codebase-index | `.claude/skills/codebase-index.md` | `.claude/skills/codebase-index/SKILL.md` |
| post-change-pipeline | `.claude/skills/post-change-pipeline.md` | `.claude/skills/post-change-pipeline/SKILL.md` |

`quality-gate/SKILL.md` also had its internal relative links to `pipelines/*.md`
corrected to `../pipelines/*.md` (it moved one directory level deeper).

Live references updated to the new path: `governance/ai-skills-reference.md`,
`governance/instructions/codebase-context.md`, `governance/rules/post-change-pipeline.md`,
`governance/rules/ux-patterns-sources.md`, `governance/tool-parity/TEMPLATE.md`,
`governance/tool-parity/gemini.md`, `guidelines/components/overview.md`,
`.claude/skills/pipelines/ux-patterns.md`, `.claude/skills/document/SKILL.md`,
`.agents/skills/*/SKILL.md` (their "Cross-tool port of" line), `README.md`,
`How-to-devs.md`, `How-to-without-agents.md`, and `site/build.js` (rebuilt after
editing — 130 files regenerated, no stale path in the output).

Not touched, deliberately: ADR-027, ADR-029, and ADR-036 bodies, and every other
historical ADR mentioning the old flat-file path — see the immutability note in
`decisions/README.md`. `.claude/settings.local.json`'s cached Bash permission entry
referencing the old `ux-pattern-review.md` path was also left as-is: it is a stale,
harmless permission-cache entry, not a documentation surface.

Related: GitHub issue #122, volet 1.

---

## 2026-10-07 — Clone's source directory renamed `clone/core/` → `clone/core-source/`

Governing decision: [ADR-105](ADR-105-clone-core-source-rename.md).

`clone/core/`, the Clone's source directory, renamed in place to `clone/core-source/` —
a sibling of `personnalisation/`, not moved under `packages/`. The move disambiguates
the directory's literal path from `GOVERNANCE.md`'s own, unrelated use of "core" as an
abstract foundation concept (Rules 3–4), which is untouched by this move.

Functional references updated in the same change: `clone/package.json` (`audit` script),
`scripts/sync-governance.mjs` (`DESTINATIONS`), and six test files —
`tests/governance/clone-audit-adapter-substitution.spec.js`,
`tests/governance/clone-audit-runs-unconditionally.spec.js`,
`tests/governance/clone-personalization-tiers.spec.js`,
`tests/governance/clone-core-reinstall-preserves-personalization.spec.js`,
`tests/governance/governance-sync-idempotence.spec.js`, and
`tests/governance/governance-drift-detection.spec.js`.

Prose updated for accuracy in files that travel with the renamed directory and ship in
the npm package: `clone/README.md`, `clone/core-source/README.md`, the three audit
`.mjs` stub comments, the three audit specs under `clone/core-source/audit/specs/`
(their `clone/` path prefix also dropped from the `**Component:**` line, so the
reference resolves against the package root the way `clone-package-self-contained.spec.js`
checks it; each also gained a one-line pointer to the shipped
`non-negotiable-foundation.md` so its `` `GOVERNANCE.md` `` citation isn't dangling),
`clone/personnalisation/GUIDE.md`, and the four `clone/personnalisation/*/example.md`
files that mentioned `core/`. `tests/governance/tokens-audit-primitive-layer-scope.spec.js`'s
fixture label (`'core'` → `'core-source'`) and `scripts/audit-tokens.js`'s nearby comment
were relabeled for the same reason, with no change to `PRIMITIVE_LAYER_PATHS` itself.

Not touched, deliberately, per ADR-105: `GOVERNANCE.md`, `clone/core-source/references/non-negotiable-foundation.md`
(generated, verbatim copy of `GOVERNANCE.md`'s own "core" vocabulary), `ADR-100`'s body
(stale path expected, per the immutability note in `decisions/README.md`), and the one
`site/build.js` changelog entry dated for the `sync-governance.mjs` delivery (a dated
record of repo state at the time it was written).

Related: issue #225 (separate, pre-existing gap found while verifying this rename —
the personalization architecture decided 2026-09-12 named a `personnalisation/composants/`
tier that was never built; out of scope for this move).
