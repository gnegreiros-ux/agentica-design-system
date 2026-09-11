# Rule: post-change-pipeline

> Mandatory quality gate before any commit — non-negotiable for any agent or session.
> **Type:** rule
> **Logical path:** governance/rules/post-change-pipeline.md
> **Read before:** AGENTS.md, DESIGN.md, governance/rules/project-overview.md
> **Relations:** .claude/skills/quality-gate.md, .claude/skills/pipelines/, governance/rules/git-workflow.md, decisions/ADR-029-quality-gate-pre-commit.md

---

## Absolute rule

> **No commit without the quality gate having been run and approved by the human.**

This quality gate applies to **every modification**, no matter how small.
It cannot be skipped, shortened, or deferred.

---

## Execution reference

See `.claude/skills/quality-gate.md` — orchestrator for all pipelines.

Active (blocking) pipelines:

| # | Pipeline | File | CI-enforced? |
|---|----------|------|--------------|
| 1 | Token consistency | `pipelines/tokens-audit.md` | ✅ `.github/workflows/tokens-audit.yml` |
| 2 | Language (English-only) | `pipelines/language-audit.md` | ✅ `.github/workflows/lang-audit.yml` — **required** check |
| 3 | WCAG 2.2 | `pipelines/wcag.md` | — |
| 4 | UX pattern review | `pipelines/ux-patterns.md` | — |
| 5 | Rule/ADR compliance | `pipelines/adr-conformity.md` | — |
| 6 | Missing ADRs | `pipelines/adr-triggers.md` | — |
| 7 | Documentation | `pipelines/docs.md` | — |
| 8 | Site rebuild | `pipelines/site.md` | ✅ `.github/workflows/site-freshness.yml` |
| 9 | Commit | `pipelines/commit.md` | ✅ `.github/workflows/commit-lint.yml` (PR only) |
| 10 | Visual regression | `pipelines/chromatic.md` | ⚠️ `.github/workflows/chromatic.yml` exists but its automatic `push`/`pull_request` triggers are currently disabled (free-tier snapshot limit) — manual (`workflow_dispatch`) only |

A CI-enforced pipeline still belongs in `quality-gate`: the CI check is a backstop that
catches it regardless of tool, not a replacement for running it proactively during the
session — see `governance/ai-skills-reference.md`'s "Tool parity gate" section.

Planned pipelines (not yet built, non-blocking until activated):
`style-dictionary.md` · `storybook.md` · `axe-core.md`
(`axe-core.md` itself is `✅ Active` in report mode — see that file; it's listed here too
because its blocking mode is still planned) · `playwright.md`

---

## Violations of this rule

Committing without an approved quality gate is a serious violation of the governance
contract. The human always has the final word — this pipeline is the operational
guarantee of that principle.
