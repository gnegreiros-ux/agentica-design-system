---
name: ux-pattern-review
description: Before publishing a new or UX-relevant-modified Agentica component, look up the reference UX patterns from the 5 source-of-truth references, present them to the human with direct links for approval, then document the decision across 6 surfaces (guideline, code, story, site, ADR, GitHub Projects). Use when creating a new component or making a UX-relevant change (new variant/state, validation logic, error/help display, interaction) to an existing one.
---

# Skill: ux-pattern-review

> Cross-tool port of `.claude/skills/ux-pattern-review.md` (Claude Code's native
> implementation) — see `governance/ai-skills-reference.md` for the full picture of
> what Agentica's skills automate. This file follows the open Agent Skills format
> (agentskills.io) so Codex CLI and GitHub Copilot CLI load it automatically from
> `.agents/skills/`; content is identical in substance to the Claude Code version.

## Objective

Before publishing a component — new or modified in a UX-relevant way — present to
the human the **UX patterns suggested** by the 5 reference sources (see
`governance/rules/ux-patterns-sources.md`), **with direct links**, so they can
**judge and approve** which ones to apply. The decision is then **documented
everywhere**.

> **The human always has the final word.** This skill proposes, the human decides.

## When to run this skill

- On the **creation** of a new component (always).
- On a **relevant modification** of an existing component: new variant/state,
  change to validation logic, error/help display, an interaction, or adding a type.
- **Not necessary** for: contrast fix, typo, variable rename, refactor with no
  behavior change.

## Process

### Step 1 — Frame it
Identify:
- The component involved and its **type** (field, action, feedback, container,
  icon, navigation, data…).
- The **nature of the change** (creation vs. modification; which UX aspect is
  affected).

### Step 2 — Consult the sources (hybrid)
- Read the **type → priority sources matrix** in `governance/rules/ux-patterns-sources.md`.
- Look up the priority source(s) for this component type (fetch the page if you
  have web access; otherwise use what you already know of that source and say so).
- Always include NN/g as the usability baseline.

### Step 3 — Present the suggested patterns
Produce a table (format below) listing each candidate pattern with: name, source +
**direct link**, problem it solves, default recommendation. Explicitly cover the
**review checklist** questions: states, error display, help text, **validation
timing**, required markers, progressive disclosure, dark patterns.

### Step 4 — Wait for human approval
- The human checks off the patterns to apply (✅) and rejects the others (❌), with
  justification.
- **Do not build or publish anything before this approval.**
- If in doubt about the impact (e.g. critical action, sensitive data): escalate.

### Step 5 — Document on the 6 surfaces
Propagate the **Pattern Decision Record** (see `governance/rules/ux-patterns-sources.md`):
1. **Guideline** `guidelines/components/<comp>.md` → section `## UX Patterns Reference`.
2. **Code** `components/agtc-<comp>.js` → "WHY" header comment block + links.
3. **Storybook** `components/agtc-<comp>.stories.js` → `parameters.docs.description.component`.
4. **Site** → `node site/build.js`.
5. **ADR** for the component's implementation → list of applied patterns.
6. **GitHub Projects** → reflect the work item (status, domain) — see ADR-069.

## Output format — suggested patterns

```markdown
## UX pattern review — <component>

Type: <type> · Nature: <creation | modification: aspect affected>
Sources consulted: <list with links>

| Pattern | Source (link) | Problem solved | Recommendation | Decision |
|---------|---------------|-----------------|----------------|----------|
| Inline error under the field | [NN/g — error handling](https://www.nngroup.com/articles/design-pattern-guidelines/) | Where to show the error | Recommended | ☐ ✅ / ☐ ❌ |
| onBlur validation (not onChange) | [IxDF — forms](https://ixdf.org/literature/topics/ui-design-patterns) | When to validate | Recommended | ☐ ✅ / ☐ ❌ |
| Required marker `*` + aria-required | [IxDF — required fields](https://ixdf.org/literature/topics/ui-design-patterns) | Signal required fields | Recommended | ☐ ✅ / ☐ ❌ |
| … | … | … | … | ☐ ✅ / ☐ ❌ |

### Open questions for the human
- [validation timing, edge cases, trade-offs]

### Awaiting approval
> Check off the patterns to apply. No publishing before your decision.
```

## What this skill does NOT do

```
❌ Invent a pattern not from the reference sources
❌ Decide alone which patterns to apply
❌ Build or publish a component without human approval
❌ Skip propagation to the 6 surfaces
❌ Bypass quality-gate's UX pattern review requirement
```
