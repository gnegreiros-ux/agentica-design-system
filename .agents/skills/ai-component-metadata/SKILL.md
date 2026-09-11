---
name: ai-component-metadata
description: Audit and enrich Agentica component metadata to verify a component is "agent-ready" — has the structured intent, variants, rules, accessibility, behavior, dependencies, anti-patterns, owner, approval level, and version an agent needs to analyze, validate, and use it correctly. Use when asked to audit component metadata, check if a component is agent-ready, or score component completeness.
---

# Skill: ai-component-metadata

> Cross-tool port of `.claude/skills/ai-component-metadata.md` (Claude Code's native
> implementation) — see `governance/ai-skills-reference.md` for the full picture of
> what Agentica's skills automate. This file follows the open Agent Skills format
> (agentskills.io) so Codex CLI and GitHub Copilot CLI load it automatically from
> `.agents/skills/`; content is identical in substance to the Claude Code version.

## Objective

Ensure every component has the structured metadata an agent needs to analyze,
validate, and use it correctly.

## Required metadata — checklist

For each component, verify the presence of:

```
✅ intent          — Why this component exists
✅ variants        — List of allowed variants
✅ rules           — Usage rules (when to use, when not to use)
✅ accessibility   — WCAG requirements (contrast, focus, ARIA)
✅ behavior        — States, animations, special interactions
✅ dependencies    — Tokens and components it depends on
✅ antiPatterns    — What must never be done with this component
✅ owner           — Who is responsible
✅ approvalLevel   — What approval level is required to modify it
✅ version         — Current contract version
```

## Metadata audit process

### Step 1 — Inventory
For each component in `guidelines/components/`:
- Read the `.md` file
- Read the matching token in `tokens/component.json`
- Compare the two to detect gaps

### Step 2 — Scoring
Compute a completeness score:
- 10 required fields × 10 points = 100 points possible
- Score < 70: component not agent-ready → flag it
- Score 70–89: partially agent-ready → improvement recommended
- Score ≥ 90: agent-ready ✅

### Step 3 — Report
Produce a structured report:

```markdown
## Metadata report — [DATE]

| Component | Score | Missing | Priority |
|-----------|-------|---------|----------|
| button    | 100%  | —       | ✅ |
| input     | 70%   | antiPatterns, approvalLevel | 🟡 |
| modal     | 40%   | rules, accessibility, behavior, dependencies | 🔴 |

### Recommendations
[List of actions to take, in priority order]
```

### Step 4 — Do not modify without approval
This skill only produces reports and suggestions. **Never modify files directly.**

## Enriched metadata format (JSON example)

```json
{
  "component": {
    "button": {
      "$metadata": {
        "intent": "Trigger an action in the interface",
        "variants": ["primary", "secondary", "critical", "ghost"],
        "rules": [
          "Maximum 1 primary button per section",
          "The critical button requires confirmation"
        ],
        "accessibility": {
          "minimumContrast": "4.5:1",
          "requiresFocusVisible": true,
          "ariaAttributes": ["aria-label if no visible text", "aria-disabled"]
        },
        "antiPatterns": [
          "Two primary buttons side by side",
          "Generic label ('OK' or 'Confirm') alone for a critical button"
        ],
        "owner": "design-system-team",
        "approvalLevel": "principal-designer",
        "version": "2.1.0"
      }
    }
  }
}
```
