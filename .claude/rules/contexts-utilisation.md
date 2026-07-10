# Rule: contexts-utilisation

> Two usage contexts in the Agentica site — editorial "direction" decision.
> **Type:** rule
> **Logical path:** .claude/rules/contexts-utilisation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json (semantic.marketing.*), decisions/ADR-057, guidelines/foundations/contextes.md

---

## Decision tree

```
Is the page meant to CONVINCE or ONBOARD a visitor?
  → YES: data-context="marketing"  (Narrative Marketing Mode)
  → NO   : no attribute            (Product SaaS Mode — default)
```

When in doubt: if the page contains component or token documentation → Product Mode.

---

## Page mapping

| Page | Mode | Attribute |
|------|------|-----------|
| `index.html` | Marketing | `data-context="marketing"` |
| `get-started.html` | Marketing | `data-context="marketing"` |
| `agents/index.html` | Marketing | `data-context="marketing"` |
| `pourquoi.html` | Marketing | `data-context="marketing"` |
| `architecture.html` | Marketing | `data-context="marketing"` |
| `qualite.html` | Marketing | `data-context="marketing"` |
| `ia.html` | Marketing | `data-context="marketing"` |
| `documentation.html` | Marketing | `data-context="marketing"` |
| `continuite.html` | Product | *(none)* |
| All others | Product | *(none)* |

---

## Product Mode (SaaS) — default

- Spacing: density=`normal` (ADR-025)
- Max typography: `semantic.typography.heading.1` (40px)
- Layout: regular grid, repeatability prioritized
- Visual variation: low — consistency first

**Allowed tokens:** `semantic.color.*`, `semantic.space.*`, `semantic.typography.*` (excluding marketing.*)

---

## Marketing Mode (Narrative) — `data-context="marketing"`

- Section spacing: `semantic.marketing.space.section-breathing` (96px)
- Hero gap: `semantic.marketing.space.hero-gap` (120px)
- Hero typography: `semantic.marketing.typography.display` (60px, bold, display line-height)
- Eyebrow label: `semantic.marketing.typography.eyebrow` (12px, bold)
- Layout: controlled asymmetry — editorial hierarchy
- Variation: controlled — max 3 sizes per section

**Allowed tokens:** all `semantic.*` tokens + `semantic.marketing.*`

**Forbidden tokens in marketing:**
```
❌ Hardcoded spacing values (96px, 120px) — use semantic.marketing.space.* tokens
❌ Gradient on more than one element per page (AI anti-patterns)
❌ Heading > 60px (beyond semantic.marketing.typography.display)
❌ More than 2 font weights on the entire page
```

---

## Rules for agents

```
✅ Read the mapping above before generating or modifying a page
✅ Use semantic.marketing.* only on data-context="marketing" pages
✅ Follow the anti-patterns listed in guidelines/foundations/contextes.md for marketing pages
❌ Add data-context="marketing" to a component documentation page
❌ Use semantic.marketing.typography.display in a shared component
❌ Modify the mapping without human approval (this is a governance decision)
```
