# DESIGN.md — Portable Design System Contract

> Portable specification, versioned with the code.
> Readable by both humans and AI agents.
> **Type:** contract
> **Logical path:** DESIGN.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md
> **Relations:** AGENTS.md, tokens/semantic.json, tokens/component.json, guidelines/components/

> **Note for reuse:** Replace "Agentica (agtc)" and "GNegreiros.com" with your system's and organization's name.

---

## 1. System identity and intent

**System name:** Agentica (agtc)
**Organization:** GNegreiros.com
**Site:** https://agentica.design
**Version:** 1.0.0
**Last updated:** 2026-05-30
**Owner:** Guilherme Negreiros

### Mission
This design system encodes interface decisions shared across all teams.
It guarantees consistency, accessibility, and the organization's digital sovereignty.

### Guiding principles
1. **The human has the final word.** Agents propose, humans approve.
2. **If it's not a token, it's not a decision.** Any local value is debt.
3. **Documentation instructs.** It must be readable by machines, not just humans.
4. **Digital sovereignty.** Tools, data, and decisions remain under organizational control.

---

## 2. Token architecture

### Three levels — absolute rule

```
Primitive tokens   →  Semantic tokens  →  Component tokens
(raw values)           (UX intent)          (UI contracts)
```

| Level | Source file | Example |
|--------|---------------|---------|
| Primitive | `tokens/primitives.json` | `blue-700`, `space-4` |
| Semantic | `tokens/semantic.json` | `color.action.primary` |
| Component | `tokens/component.json` | `button.critical.requiresConfirmation` |

### Token governance rules
- Primitive tokens are **never** used directly in components.
- Semantic tokens encode **intent**, not value.
- Component tokens are **institutional contracts** — any change requires approval.
- No hardcoded color or spacing in code. **Ever.**

### Standard conformance (W3C DTCG)
The `tokens/*.json` files follow the **Design Tokens Format** from the W3C Community Group (DTCG) —
official source: **https://www.designtokens.org/**. Conventions applied: `$value`, `$type`,
`$description`, cross-token aliases `{group.token}`, and `$schema` pointing to the DTCG format.
This guarantees interoperability with Style Dictionary, Tokens Studio, and any compatible tool.
In case of divergence between a local habit and the standard, **the standard prevails**
(see `.claude/rules/tokens-system.md` and ADR-052).

---

## 3. Components — general rules

Every component is a **contract**. It encodes:
- Its intent (why it exists)
- Its allowed variants
- Its non-negotiable accessibility rules
- Its behaviors (states, animations)
- Its governance (who approves changes)

Component contracts live in `guidelines/components/`.

---

## 4. Accessibility — non-negotiable

| Rule | Standard |
|-------|----------|
| Normal text contrast | WCAG AA — 4.5:1 minimum |
| Large text contrast | WCAG AA — 3:1 minimum |
| Keyboard navigation | 100% of interactions accessible |
| ARIA attributes | Required on all interactive components |
| Automated tests | axe-core + Playwright before every deployment |

---

## 5. Token Change Request (TCR)

Every token change follows this flow:

1. Problem identified and documented
2. Formal request submitted (TCR)
3. Layer identified (primitive / semantic / component)
4. Impact assessment
5. Approval based on risk level
6. Change + automatic compilation
7. Tests and audits
8. Communication to teams

**The design system team always has the final word.**

---

## 6. Usage contexts

The system distinguishes two editorial modes, declared via `data-context` on `<body>`:

| Dimension | Product Mode (SaaS) | Marketing Mode (Narrative) |
|-----------|---------------------|--------------------------|
| Goal | Enable action | Communicate a vision |
| Spacing | density=normal | `semantic.marketing.space.*` (96-120px) |
| Max typography | `heading.1` — 40px | `marketing.typography.display` — 60px |
| Layout | Regular grid | Controlled asymmetry |
| Visual variation | Low (repeatability) | Controlled (editorial hierarchy) |
| Attribute | *(absent)* | `data-context="marketing"` |

**Selection rule:** if the page convinces or onboards → Marketing. If it documents → Product.
See `.claude/rules/contexts-utilisation.md` and `guidelines/foundations/contextes.md`.

---

## 7. What agents can do

| Action | Allowed |
|--------|----------|
| Read component contracts | ✅ |
| Generate code from tokens | ✅ |
| Detect drift | ✅ |
| Propose corrections | ✅ (with human approval) |
| Modify a semantic token | ❌ — TCR required |
| Modify a component contract | ❌ — Principal Designer approval |
| Deploy to production | ❌ — human validation required |
