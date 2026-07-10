# Instruction: codebase-context

> Methodology for understanding and navigating this repository.
> This file describes HOW to work in this system, not just WHAT to do.
> **Type:** instruction
> **Logical path:** .claude/instructions/codebase-context.md
> **Read before:** AGENTS.md, DESIGN.md
> **Relations:** AGENTS.md, .claude/rules/project-overview.md, .claude/rules/tokens-system.md

---

## Mandatory reading order

Before any task, read in this order:

```
1. AGENTS.md                               ← router, autonomy levels
2. DESIGN.md                               ← global brand contract
3. .claude/rules/project-overview.md       ← project context
4. .claude/rules/tokens-system.md          ← token rules
5. [task-specific file]                    ← depending on what you need to do
```

---

## Conflict resolution

If two rules appear to conflict, apply in this priority order:

```
1. DESIGN.md (global rules)
2. .claude/rules/tokens-system.md (token rules)
3. .claude/rules/[specific rule]
4. guidelines/components/[component].md (contract)
```

If in doubt: **escalate to a human. Do not improvise.**

---

## Audit methodology

### Token audit
1. Read `.claude/skills/ai-component-metadata.md`
2. Scan all code files for hardcoded values
3. Scan for deprecated tokens
4. Generate a structured report (list by file, by type of drift)
5. Propose fixes — do not apply without approval

### Component audit
1. Read `guidelines/components/[component].md`
2. Compare against the implementation in the code
3. Verify metadata in `tokens/component.json`
4. Run axe-core if available
5. Produce a compliance report

### Accessibility audit
1. Check contrast ratios (min 4.5:1 text, 3:1 UI)
2. Check that `:focus-visible` is present on all interactive elements
3. Check required ARIA attributes
4. Check keyboard navigation
5. Escalate any critical violation immediately

---

## Code generation

Before generating a component:
1. Read the contract in `guidelines/components/[component].md`
2. Verify that all tokens used exist in `tokens/component.json`
3. Generate the code with tokens (never a hardcoded value)
4. Include ARIA attributes and focus handling
5. Flag any case not covered by the system

---

## Documentation updates

Before modifying a `.md` file:
1. Verify that the change reflects the actual system (not an intention)
2. Update the last-modified date
3. Open a `docs/` PR — do not push directly
4. If the change affects a component contract: approval required

---

## Context economy

To avoid saturating context:
- Only read files relevant to the current task
- Use skills for repeatable tasks
- Specialized sub-agents for complex multi-domain tasks
- Do not load all tokens — search by the relevant component
