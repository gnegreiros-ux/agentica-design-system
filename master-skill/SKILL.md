---
name: design-system-builder
description: Guides and executes the from-scratch construction of an agentic design system for any team — component architecture, tokens, governance, and audit — with explicit human confirmation before every structural decision.
---

# Design System Builder

This skill is not passive documentation to read. It is an execution flow that an agent follows, together with a human, to build an agentic design system from scratch in a target project.

> **Before doing anything else, read `execution/05-human-gates-checklist.md`.** It lists every point across the phases below where this skill stops and waits for explicit human confirmation. See the stop points before seeing the first action.

## What this skill produces

A design system foundation with:
- A component architecture decision, recorded rather than assumed
- A three-layer token structure (primitive → semantic → component)
- A non-negotiable governance foundation (`GOVERNANCE.md`) in the target project
- Accessibility, hard-coded-style, and primitive-token audits wired into the build
- Agent instructions with explicit, unambiguous trigger conditions

## Structure

```
master-skill/
├── SKILL.md                              ← this file
├── execution/
│   ├── 00-component-architecture.md      ← Web Components (default) vs a documented deviation
│   ├── 01-governance-setup.md            ← writing GOVERNANCE.md in the target project
│   ├── 02-token-architecture.md          ← primitive → semantic → component
│   ├── 03-audit-setup.md                 ← accessibility, hard-coded style, primitive tokens
│   ├── 04-agent-instructions.md          ← trigger conditions, agent-alone vs human-required
│   └── 05-human-gates-checklist.md       ← every stop point, consolidated
└── references/
    └── non-negotiable-foundation.md      ← generated from GOVERNANCE.md, never edited by hand
```

## Execution flow

Run the phases in `execution/` in order, 00 through 04. Each phase depends on the previous one being confirmed by the human — do not skip ahead because a later phase seems obvious or low-risk. Each phase file states its own stop point; `05-human-gates-checklist.md` is the cross-cutting summary of all of them.

## Non-negotiable foundation

Every action this skill takes respects `references/non-negotiable-foundation.md` without exception. See that file for the four rules and why each one exists.
