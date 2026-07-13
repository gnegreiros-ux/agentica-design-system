---
paths:
  - "components/agtc-button*"
  - "guidelines/components/button.md"
---

# Rule: components/button

> Button-specific rules for agents.
> This file complements the full contract in `guidelines/components/button.md`.
> **Type:** rule
> **Logical path:** .claude/rules/components/button.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, guidelines/components/button.md
> **Relations:** guidelines/components/button.md, tokens/component.json, .claude/rules/tokens-system.md

---

## Absolute rules

```
✅ Maximum 1 primary button per section or form
✅ Always an explicit label (never "OK", "Confirm" alone)
✅ The critical button MUST have a confirmation pattern before executing
✅ Always a visible :focus-visible
✅ Width preserved during async (loading) states
❌ Never a critical button without a confirmation pattern
❌ Never two primary buttons side by side
❌ Never a hardcoded color or spacing value
❌ Never an invented variant not defined in component.json
```

---

## Allowed variants

| Variant | Token | Usage |
|----------|-------|-------|
| `primary` | `component.button.primary` | Main action of a section |
| `secondary` | `component.button.secondary` | Alternative action |
| `critical` | `component.button.critical` | Irreversible action — see special rules |
| `ghost` | `component.button.ghost` | Tertiary action, low emphasis |

---

## Special rules — critical variant

If you generate or modify a `critical` button:

1. Verify that `requiresConfirmation: true` is present in the token
2. Verify that the confirmation pattern exists in the interface
3. Verify that the label describes the action (e.g. "Permanently delete the folder")
4. Verify the contrast: minimum 4.5:1 on a white background
5. **Escalate to a human** if you have any doubt about the impact of the action

---

## Anti-patterns to detect

```
❌ <button style="background: red;">Delete</button>
   → Hardcoded value + no token + unrecognized variant

❌ <ds-button variant="critical">OK</ds-button>
   → Non-explicit label for a critical action

❌ Two <ds-button variant="primary"> in the same form
   → Broken hierarchy

❌ <ds-button variant="danger">   (nonexistent variant)
   → Escalate — ask for the correct variant
```

---

## Mandatory escalation

Escalate to a human if:
- The requested variant does not exist in `component.json`
- Whether the critical button's action is clearly irreversible or not is unclear
- The confirmation pattern is not defined in the system
