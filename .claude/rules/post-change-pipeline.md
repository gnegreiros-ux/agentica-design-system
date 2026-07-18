# Rule: post-change-pipeline

> Mandatory quality gate before any commit — non-negotiable for any agent or session.
> **Type:** rule
> **Logical path:** .claude/rules/post-change-pipeline.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/skills/quality-gate.md, .claude/skills/pipelines/, .claude/rules/git-workflow.md, decisions/ADR-029-quality-gate-pre-commit.md

---

## Absolute rule

> **No commit without the quality gate having been run and approved by the human.**

This quality gate applies to **every modification**, no matter how small.
It cannot be skipped, shortened, or deferred.

---

## Execution reference

See `.claude/skills/quality-gate.md` — orchestrator for all pipelines.

Active (blocking) pipelines:

| # | Pipeline | File |
|---|----------|------|
| 1 | Token consistency | `pipelines/tokens-audit.md` |
| 2 | Language (English-only) | `pipelines/language-audit.md` |
| 3 | WCAG 2.2 | `pipelines/wcag.md` |
| 4 | UX pattern review | `pipelines/ux-patterns.md` |
| 5 | Rule/ADR compliance | `pipelines/adr-conformity.md` |
| 6 | Missing ADRs | `pipelines/adr-triggers.md` |
| 7 | Documentation | `pipelines/docs.md` |
| 8 | Site rebuild | `pipelines/site.md` |
| 9 | Commit | `pipelines/commit.md` |

Planned pipelines (non-blocking until activated):
`style-dictionary.md` · `storybook.md` · `chromatic.md` · `axe-core.md` · `playwright.md`

---

## Violations of this rule

Committing without an approved quality gate is a serious violation of the governance
contract. The human always has the final word — this pipeline is the operational
guarantee of that principle.
