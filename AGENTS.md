# AGENTS.md — Agent Router

> This file is the entry point for any AI agent interacting with this design system.
> Read this file first. Always.
> **Type:** instruction
> **Logical path:** AGENTS.md
> **Author:** Guilherme Negreiros
> **Read before:** DESIGN.md
> **Relations:** DESIGN.md, .claude/rules/project-overview.md, .claude/instructions/codebase-context.md, How-to-sans-agents.md (fallback if agents are unavailable)

---

## Core principle

**The human always has the final word.**
Agents execute, propose, and detect drift.
Strategic decisions, exceptions, and values belong to the teams.

---

## Available agents

### Designer Agent
**Role:** Monitor drift in Figma
**Can:** Detect detached instances, components without a description, inconsistent spacing
**Cannot:** Automatically modify Figma files
**Produces:** Drift reports — human approval required before action

### Developer Agent
**Role:** Detect token misuse in code
**Can:** Detect hardcoded colors, deprecated tokens, duplicated components, open suggestion PRs
**Cannot:** Merge without human approval
**Produces:** Correction PRs — review required

### Documentation Agent
**Role:** Keep docs in sync with components
**Can:** Generate changelogs, migration guides, accessibility notes
**Cannot:** Publish without validation
**Produces:** Documentation drafts — human validation required

### QA Agent
**Role:** Systematic checks before merge
**Can:** Run accessibility tests, visual regressions, token conformance
**Cannot:** Approve a merge
**Produces:** Conformance reports — blocking on critical violations

---

## Orchestrator

The orchestrator coordinates the agents. It decides:
- Which changes are safe to automate
- Which require human approval
- When to escalate to the team

**Escalation rule:** Any change touching a semantic token or a component contract is automatically escalated.

---

## Files to read before any action

```
DESIGN.md                              ← portable contract — always read first
.claude/rules/project-overview.md      ← project context
.claude/rules/tokens-system.md         ← token rules
.claude/rules/ux-patterns-sources.md   ← sources + UX pattern review (before any component)
.claude/rules/figma-components.md      ← Figma rules (properties, auto-layout, naming, API)
.claude/instructions/codebase-context.md ← technical context
.claude/instructions/session-spec.md   ← condensed spec for this session
tokens/semantic.json                   ← source of truth for UX intentions
decisions/                             ← why decisions were made (ADRs)
```

---

## What agents must never do

- ❌ Use a hardcoded color or spacing value
- ❌ Reference a primitive token directly in a component
- ❌ Modify a semantic token without an approved TCR
- ❌ Deploy to production without human validation
- ❌ Ignore an accessibility violation report
- ❌ Bypass lint rules

---

## Project tracking and decision documentation

### Project management

Task tracking (statuses, backlog, priorities, dependencies) lives exclusively in
[GitHub Projects](https://github.com/users/gnegreiros-ux/projects/1) — never in a
versioned file in the repo. See `.claude/rules/project-overview.md` (ADR-069).

### Architectural decisions (ADR)

Decisions are documented in `decisions/` (not `docs/adr/`) — one file per ADR,
format `ADR-XXX-title.md`. Read the ADRs that touch the area you're about to work on
before taking any action. See `.claude/skills/pipelines/adr-triggers.md` to know when
to create a new one.

### Domain context

No `CONTEXT.md` at the root — domain context lives in `DESIGN.md` (portable brand
contract), `guidelines/` (foundations and components), and the `.claude/rules/` rules.
