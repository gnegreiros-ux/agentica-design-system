# Skill: ai-ds-composer

> Reusable capability: assemble interface patterns from natural language.
> This skill translates a request into a valid assembly of system components.
> **Type:** skill
> **Logical path:** .claude/skills/ai-ds-composer.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/components/overview.md, .claude/rules/components/, tokens/component.json

---

## Objective

Enable interface composition in natural language while guaranteeing
that the result respects the system's rules, tokens, and contracts.

---

## Composition process

### Step 1 — Understand the request
Extract from the request:
- The user's goal (what they want to accomplish)
- The context (page type, flow, platform)
- The specified constraints (accessibility, language, density)

### Step 2 — Read the catalog
Consult `guidelines/components/overview.md` to identify:
- Available components
- Existing patterns that already solve this need
- Anti-patterns to avoid

### Step 3 — Compose
Assemble the components while respecting:
- Each component's rules (`.claude/rules/components/`)
- Visual hierarchy (only one primary per section)
- Accessibility constraints (WCAG 2.1 AA)
- Token dependencies

### Step 4 — Validate
Before returning the result, verify:
```
✅ All components used exist in the system
✅ No invented variant
✅ Referenced tokens exist in component.json
✅ No hardcoded value
✅ Accessibility respected
✅ Each component's rules respected
```

### Step 5 — Flag uncovered cases
If the request requires something that does not exist in the system:
- Do not invent a component
- Flag the gap to the responsible designer
- Propose the closest available alternative

---

## Output format

```markdown
## Composition: [request title]

### Components used
- `ds-button` (variant: primary) — primary action
- `ds-input` (type: text) — name entry
- `ds-badge` (variant: success) — confirmation

### Structure
[HTML code / pseudo-code with the components]

### Tokens applied
- background: `var(--agtc-component-button-primary-background)`
- spacing: `var(--agtc-semantic-space-layout-component)`

### Rules respected
- [x] Only one primary button
- [x] Focus visible on all interactive elements
- [x] Sufficient contrast

### Uncovered cases / escalation
- [ ] The date picker pattern does not exist yet → flag to the Design System Lead
```

---

## What this skill does NOT do

```
❌ Invent components
❌ Invent tokens
❌ Bypass accessibility rules
❌ Decide editorial content (final copy, labels)
❌ Make product architecture decisions
```
