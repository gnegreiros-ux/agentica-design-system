---
name: design-system-builder
description: Guides and executes the from-scratch construction of an agentic design system for any team — component architecture, tokens, governance, and audit — with explicit human confirmation before every structural decision.
---

# Design System Builder

This skill is not passive documentation to read. It is an execution flow that an agent follows, together with a human, to build an agentic design system from scratch in a target project.

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
├── SKILL.md                          ← this file
├── execution/                        ← the actual execution logic
└── references/
    └── non-negotiable-foundation.md  ← generated from GOVERNANCE.md, never edited by hand
```

The `execution/` phases are a separate, follow-up piece of work — this file only establishes the skill's identity and structure.

## Non-negotiable foundation

Every action this skill takes respects `references/non-negotiable-foundation.md` without exception. See that file for the four rules and why each one exists.
