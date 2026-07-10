# Rule: tokens-system

> Absolute rules for managing tokens in this system.
> These rules apply to every agent and every team.
> **Type:** rule
> **Logical path:** .claude/rules/tokens-system.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json, DESIGN.md

---

## Reference standard — Design Tokens (W3C DTCG)

> Official source for the design tokens standard: **https://www.designtokens.org/**
> (W3C Design Tokens Community Group — DTCG).

This system follows the **DTCG format** as the token interoperability standard:

| DTCG convention | Application in this repository |
|-----------------|---------------------------|
| `$value` | Token value (primitives) — e.g. `"$value": "#fcfcfc"` |
| `$type` | Token type — `color`, `dimension`, etc. (mandatory, see `code-style.md`) |
| `$description` | Human + agent readable description |
| `{group.token}` alias | Cross-token reference — e.g. `{primitive.color.teal.11}` |
| `$schema` | `https://design-tokens.github.io/community-group/format/` |

> Any evolution of the `tokens/*.json` file format must remain **DTCG-compliant**.
> In case of divergence between a local habit and the standard, the
> designtokens.org standard prevails. Decision: **ADR-052**.

---

## The three levels — non-negotiable rule

```
Primitive tokens   →   Semantic tokens   →   Component tokens
(raw values)             (UX intent)            (institutional contracts)
```

### Level 1 — Primitives (`tokens/primitives.json`)
- Physical values: colors, spacing, radii, font sizes.
- **Very stable.** Rarely changed.
- **Never used directly in components.** Always through a semantic token.

### Level 2 — Semantic (`tokens/semantic.json`)
- Translate primitives into business language.
- Example: `color.action.primary` = `primitive.color.blue.700`
- **What agents should use** to understand intent.
- Named to express **function**, not value.

### Level 3 — Component (`tokens/component.json`)
- Decisions specific to each component.
- Carry behavioral rules (e.g. `requiresConfirmation: true`).
- **Institutional contracts** — any modification requires approval.

---

## Absolute rules

```
❌ FORBIDDEN: color: #3B82F6                 → use var(--ds-color-action-primary)
❌ FORBIDDEN: padding: 16px                  → use var(--ds-space-control-padding-x)
❌ FORBIDDEN: primitive token in a component → go through the semantic token
❌ FORBIDDEN: modifying a component token without human approval
```

---

## Naming rule

Format: `[category].[role].[variant]`

| ✅ Valid | ❌ Invalid |
|----------|------------|
| `color.action.primary` | `blue500` |
| `space.control.padding` | `mainPadding` |
| `radius.button.default` | `btnRadius` |
| `color.feedback.danger` | `red` |

---

## Token governance rule

| Change type | Who can make it | Approval |
|-------------------|-------------------|--------------|
| Primitive token value | Dev or agent | Principal Designer |
| Adding a semantic token | Dev or agent (PR) | Design System Lead |
| Modifying a component token | Human only | Principal Designer |
| Deleting a token | Human only | Principal Designer + impact audit |

---

## What agents see — and what they miss

An AI agent understands `color.feedback.danger` as **an intent**.
It does not understand `red-700` as **an intent** — it's just a value.

> "Agents understand function, not just value."
> — Jan Six, GitHub, IDS 2026
