---
name: codebase-index
description: Maintain an up-to-date map of Agentica's design system — which components exist, their token dependencies, and where drift is occurring (orphaned/phantom tokens, components without a contract). Use when asked to index the design system, map component dependencies, or check for token drift.
---

# Skill: codebase-index

> Cross-tool port of `.claude/skills/codebase-index.md` (Claude Code's native
> implementation) — see `governance/ai-skills-reference.md` for the full picture of
> what Agentica's skills automate. This file follows the open Agent Skills format
> (agentskills.io) so Codex CLI and GitHub Copilot CLI load it automatically from
> `.agents/skills/`; content is identical in substance to the Claude Code version.
>
> **Most of this is now real, tool-agnostic tooling, not just a described process:**
> `node scripts/extract-relationships.js --fix-report` generates the relationship
> graph section below, and `node scripts/audit-tokens.js` generates the drift
> detection section. Run those first — only fall back to the manual process below
> for anything they don't cover (the Observatory-style system status report, and
> the Figma-specific "detached instances" check, which has no script yet).

## Objective

Maintain an up-to-date map of the system: which components exist, what their
dependencies are, which tokens they consume, and where drift is occurring.

## Component index

### Generation process

For each component in `guidelines/components/`:
1. Read the `.md` file (contract)
2. Read the token in `tokens/component.json`
3. Identify dependencies (semantic tokens used)
4. Identify components that use it (consumers)
5. Compute the completeness score (see the `ai-component-metadata` skill)

### Index format

```markdown
## Component index — [DATE]

| Component | Variants | Tokens | Score | Storybook |
|-----------|-----------|--------|-------|-----------|
| button    | 4         | 18     | 100%  | ✅ |
| input     | 3         | 12     | 70%   | ✅ |
| modal     | 2         | 8      | 40%   | 🟡 |
| badge     | 4         | 6      | 90%   | ✅ |
```

## Relationship graph

Generate with `node scripts/extract-relationships.js --fix-report` →
`relationships-report.json`. Manual shape, for reference:

### Downstream dependencies (component → tokens)

```
button.primary
  └── semantic.color.action.primary
        └── primitive.color.blue.700
  └── semantic.radius.control
        └── primitive.radius.md
  └── semantic.space.control.padding-x
        └── primitive.space.4
```

### Upstream dependencies (token → components)

```
semantic.color.action.primary
  ├── component.button.primary
  ├── component.button.secondary (text)
  └── component.input.default (border-focus)
```

This graph makes it possible to know instantly, if `primitive.color.blue.700` is
modified, which components are impacted.

## Drift detection

Generate with `node scripts/audit-tokens.js`. Categories checked:

- **Orphaned tokens** — defined in `component.json` but never used in code.
- **Phantom tokens** — used in code but not defined in the JSON files.
- **Components without a contract** — components in the code with no matching
  `.md` file in `guidelines/`.
- **Detached instances (Figma)** — Figma components whose properties have been
  overridden locally. No script for this yet; check manually via the Figma file.

## System status report

Output format for the Observatory dashboard:

```json
{
  "generatedAt": "2026-05-18T10:00:00Z",
  "components": {
    "total": 12,
    "agentReady": 8,
    "partial": 3,
    "notReady": 1
  },
  "tokens": {
    "primitives": 45,
    "semantic": 38,
    "component": 67,
    "orphaned": 2,
    "phantom": 0
  },
  "accessibility": {
    "violations": 0,
    "warnings": 3
  },
  "drift": {
    "hardcodedValues": 4,
    "deprecatedTokens": 1,
    "detachedInstances": 7
  }
}
```

## Recommended frequency

| Index type | Frequency | Trigger |
|-------------|-----------|-------------|
| Full index | Weekly | Cron or manual |
| Drift detection | On every PR | CI — `tokens-audit.yml` |
| Observatory report | Daily | Cron |
| Relationship graph | On every token addition | Manual (`npm run relationships`) |
