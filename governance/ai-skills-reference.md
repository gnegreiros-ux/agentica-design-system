# AI skills reference

> What `.claude/skills/` automates in Claude Code, and what an equivalent behavior
> looks like in another AI coding tool. Read this if you use Copilot, Cursor, Codex,
> Windsurf, Amp, Devin, or any tool other than Claude Code, and want to reproduce
> the same guardrails with your own tool's rules, custom prompts, or hooks.
> **Type:** reference
> **Logical path:** governance/ai-skills-reference.md
> **Read before:** AGENTS.md
> **Relations:** AGENTS.md, .claude/skills/, governance/rules/post-change-pipeline.md

---

## Why this file exists

`.claude/skills/` is Claude Code's native mechanism for packaging repeatable,
invokable capabilities (slash commands, pre-commit orchestration, reusable review
checklists). It is Claude Code-specific implementation and does not move as part of
the `governance/` migration — see AGENTS.md.

Other AI tools have no shared standard for this yet. This file describes, tool-agnostically,
**what each skill does and why it exists in Agentica**, so a team using a different
assistant knows what behavior to reproduce with whatever mechanism their tool offers
(a custom rule, a system prompt, a pre-commit hook, a saved prompt template). It is
deliberately descriptive of the expected behavior, not prescriptive of any specific
competing product's mechanism.

---

## Core skills

| Skill | File | Trigger |
|-------|------|---------|
| ai-component-metadata | `.claude/skills/ai-component-metadata.md` | Verifying a component is "agent-ready" |
| ai-ds-composer | `.claude/skills/ai-ds-composer.md` | Composing an interface from a natural-language request |
| codebase-index | `.claude/skills/codebase-index.md` | Needing an up-to-date map of the system's components/tokens/dependencies |
| post-change-pipeline | `.claude/skills/post-change-pipeline.md` | After every modification, before every commit — mandatory, no exceptions |
| quality-gate | `.claude/skills/quality-gate.md` | Pre-commit — orchestrates every active pipeline below |
| ux-pattern-review | `.claude/skills/ux-pattern-review.md` | Before publishing a new component, or a UX-relevant change to an existing one |
| document (`/document`) | `.claude/skills/document/SKILL.md` | Invoked manually at the end of a work session |

### ai-component-metadata
Audits and enriches a component's structured metadata (props, states, token bindings,
ARIA contract) so an agent can reliably analyze, validate, and reuse it later without
re-reading the implementation from scratch.
**Reproduce with:** a custom rule that treats a component as incomplete until it ships
machine-readable metadata describing its props, states, and token bindings.

### ai-ds-composer
Translates a natural-language interface request into a valid assembly of *existing*
system components, refusing to invent new markup or styles outside the token/contract
system.
**Reproduce with:** a custom rule that forces any UI-generation request to route through
the existing component library and design tokens rather than generating bespoke markup.

### codebase-index
Maintains a live index of which components exist, their dependencies, and which tokens
they consume — a fast-navigation map loaded as context instead of re-scanning the repo.
**Reproduce with:** a generated index or manifest file (components → dependencies →
tokens) kept current and loaded as context before starting work.

### post-change-pipeline
Analyzes the impact of a change immediately after it's made and produces a report for
human approval — runs on every modification, however small, with no skip path.
**Reproduce with:** a pre-commit hook or rule that blocks the commit until an impact
report exists and a human has reviewed it.

### quality-gate
The pre-commit orchestrator: runs every active pipeline (see below) in a fixed order,
compiles the results into one report, and blocks the commit until a human explicitly
approves it.
**Reproduce with:** a single ordered pre-commit checklist or script chaining all your
quality gates (schema/lint, accessibility, i18n, doc-sync, build) that requires explicit
human sign-off before a commit is allowed to proceed.

### ux-pattern-review
Before a new or UX-relevant-modified component ships, presents the human with the
reference UX patterns from Agentica's 5 source-of-truth references (with direct links),
captures their decision, and propagates it across 6 documentation surfaces.
**Reproduce with:** a rule requiring that any new or changed interactive pattern cite its
reference sources and record an explicit human decision in the docs before merge.

### document (`/document`)
A post-work documentation orchestrator invoked manually. Given what was just done in a
session, it checks every documentation surface the repo has (guidelines, ADRs, the
git-workflow rules, the site changelog, GitHub Projects, READMEs, component stories),
writes the ones that need updating, verifies the build/tests still pass, and proposes —
but never executes — a commit and push.
**Reproduce with:** a saved prompt or custom command that, at the end of a work session,
sweeps every known documentation location, drafts the needed updates, and proposes (not
executes) a commit for human review.

---

## Pipelines — quality-gate's sub-checklists

`quality-gate` runs 14 individual pipeline checklists, each documented as its own file
under `.claude/skills/pipelines/`. They are not independently invoked skills — they are
quality-gate's building blocks, run in this order:

| Pipeline | Status | Checks |
|----------|--------|--------|
| tokens-audit | ✅ Active | Token system consistency (primitive → semantic → component) |
| language-audit | ✅ Active | English-only content policy (ADR-070/071/075) |
| wcag | ✅ Active | WCAG 2.2 AA compliance checklist |
| ux-patterns | ✅ Active | Blocking guardrail requiring `ux-pattern-review` before publishing |
| adr-conformity | ✅ Active | Change complies with every active ADR |
| adr-triggers | ✅ Active | Whether the change requires a new ADR |
| docs | ✅ Active | Canonical checklist of every documentation surface to update |
| site | ✅ Active | Rebuild and validate the static documentation site |
| commit | ✅ Active | Commit message format and conventions |
| chromatic | ✅ Active | Visual regression tests against the approved baseline |
| axe-core | 🔜 Report mode | Automated accessibility audit (non-blocking during burn-down) |
| storybook | 🔜 Planned | Story presence and consistency with the token system |
| style-dictionary | 🔜 Planned | Token compilation output validation |
| playwright | 🔜 Planned | End-to-end critical-journey tests |

**Reproduce with:** a documented, ordered set of automated and manual gates — schema/lint
checks, an i18n check, an accessibility check, a design-decision log requirement, a
doc-sync check, a build verification step, and a commit-convention check — that all run,
in order, before a commit is proposed.
