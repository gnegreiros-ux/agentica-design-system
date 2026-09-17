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
