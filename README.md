# Agentica™ — Agentic Design System

Copyright © 2026 Guilherme Negreiros

> A design system structured to be read by humans **and** AI agents.
> Based on work presented at the AI Design Systems Conference 2026 (Into Design Systems).
> **Type:** instruction
> **Logical path:** README.md
> **Read before:** (entry point — read first)
> **Relations:** AGENTS.md, DESIGN.md, How-to-designers.md, How-to-devs.md

**Author:** Guilherme Negreiros
**Documentation site:** https://agentica.design

---

## Core principle

**The human always has the final word.**
Agents propose, detect, and execute.
Strategic decisions, exceptions, and values belong to the teams.

---

## Kit structure

```
agentica-design-system/
│
├── README.md                          ← you are here
├── DESIGN.md                          ← portable brand contract
├── AGENTS.md                          ← AI agent router (single source of truth for governance)
├── CLAUDE.md                          ← thin adapter — imports AGENTS.md, Claude Code specifics only
├── How-to-designers.md                ← design system team guide (designers)
├── How-to-devs.md                     ← design system team guide (developers)
│
├── tokens/
│   ├── primitives.json                ← layer 1 — raw values
│   ├── semantic.json                  ← layer 2 — UX intentions
│   └── component.json                 ← layer 3 — UI contracts
│
├── style-dictionary/
│   └── config.json                    ← CSS, JS, iOS, Android compilation
│
├── scripts/
│   └── audit-tokens.js                ← drift audit: orphans, ghosts, hardcoded values
│
├── .eslintrc-ds.json                  ← anti-AI-drift lint (hex, arbitrary values)
│
├── governance/                        ← agent-agnostic — read natively by any AI tool
│   ├── rules/                         ← project constraints and conventions
│   │   ├── project-overview.md
│   │   ├── tokens-system.md
│   │   ├── development.md
│   │   ├── code-style.md
│   │   ├── git-workflow.md
│   │   └── components/button.md
│   ├── instructions/
│   │   ├── codebase-context.md        ← full technical context
│   │   └── session-spec.md            ← condensed spec reloaded every AI session
│   ├── ai-skills-reference.md         ← what .claude/skills/ automates, ported vs. still to reproduce
│   └── tool-parity/                   ← per-tool sign-off: what's replaced, what's accepted absent
│
├── .claude/
│   └── skills/                        ← Claude Code-native implementation (source of truth)
│       ├── ai-component-metadata.md
│       ├── ai-ds-composer.md
│       └── codebase-index.md
│
├── .agents/
│   └── skills/                        ← open Agent Skills format — Codex CLI + GitHub Copilot
│       └── ai-component-metadata/SKILL.md   load these automatically, no setup
│
├── .gemini/
│   ├── settings.json                  ← Gemini CLI hooks (real ADR/UX-pattern reminders)
│   └── hooks/*.js
│
├── components/
│   └── ds-icon.js                     ← icon Web Component (Lucide)
│
└── guidelines/
    ├── overview.md
    ├── foundations/
    │   ├── color.md
    │   ├── typography.md              ← Atkinson Hyperlegible (accessibility)
    │   └── spacing.md                 ← 4px grid
    └── components/
        ├── overview.md
        ├── button.md                  ← full contract (reference example)
        └── icon.md                    ← ds-icon contract (Lucide)
```

---

## Quick start

### 1. Customize
Replace the placeholders in `DESIGN.md` and `governance/rules/project-overview.md`:
- `[SYSTEM_NAME]`
- `[ORGANIZATION_NAME]`
- `[OWNER_NAME]`

### 2. Install dependencies
```bash
npm install style-dictionary
npm install --save-dev eslint eslint-plugin-tailwindcss
```

### 3. Compile the tokens
```bash
npx style-dictionary build --config style-dictionary/config.json
# → dist/css/   CSS variables
# → dist/js/    ES6 modules
# → dist/ios/   Swift
# → dist/android/ XML
```

### 4. Enable linting
```bash
# Extend your existing ESLint config:
# { "extends": ["./.eslintrc-ds.json"] }
```

### 5. Run the audit
```bash
node scripts/audit-tokens.js              # console report
node scripts/audit-tokens.js --fix-report # + audit-report.json
node scripts/audit-tokens.js --ci         # CI/CD mode — exit 1 on violations
```

---

## Token architecture

```
Primitive tokens    →   Semantic tokens   →   Component tokens
(raw values)             (UX intent)            (UI contracts)
primitives.json          semantic.json          component.json
```

**Absolute rule:** primitives are never used directly in components.
Always go through the semantic layer.

---

## What this kit is not

- ❌ A ready-to-use component library
- ❌ A replacement for Figma or Storybook
- ❌ A standalone tool — it requires a team that maintains the contracts

## What this kit is

- ✅ An architectural foundation for an agentic system
- ✅ A template for formalized governance
- ✅ A contract readable by both humans and AI agents
- ✅ A starting point to adapt to your organization

---

## Credits

This kit was designed and developed by **Guilherme Negreiros**, drawing on the work and teachings of the following people and resources:

- *The Design System Guide* — Romina Kavcic
- *Into Design Systems* — AI Design Systems Conference 2026
- Jan Six — GitHub / Tokens Studio (IDS 2026)
- Cristian Morales Achiardi — Enara Health (IDS 2026)
- George William Amalan — *Your Design System Is a Suggestion Box*, Design Systems Collective, May 2026
