# Component: Badge — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-05-31
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/badge.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, DESIGN.md

---

## Intent

**Why this component exists:**
Display a status, category, or count in a compact, non-interactive way.

**This component is not:**
- A button (use `<agtc-button>`)
- A contextual alert (use `<agtc-alert>`)
- A clickable tag (wrap it in a `<button>`)

---

## Variants

| Variant | Semantics | Typical usage |
|----------|-----------|---------------|
| `neutral` | Neutral, informative | Default status, generic labels |
| `brand` | Product identity | New features, highlights |
| `success` | Success, validated | "Active", "Approved", "Completed" status |
| `warning` | Attention required | "Pending", "Needs review" status |
| `danger` | Error, critical | "Rejected", "Expired", "Error" status |
| `info` | Neutral information | "In progress", "Draft" status |

---

## Sizes

| Size | Usage |
|--------|-------|
| `md` | Default — general use in lists and tables |
| `sm` | Constrained spaces — dense tables, headers |

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `variant` | String | `neutral` | Semantic variant |
| `size` | String | `md` | Size: `md` or `sm` |
| `icon` | String | — | Lucide icon as prefix |
| `icon-only` | Boolean | `false` | Displays only the icon |
| `label` | String | — | **Required if `icon-only`** — WCAG 1.1.1 |

---

## Tokens used

| Variant | Background token | Text token | Border token |
|----------|-----------------|-----------|--------------|
| neutral | `component.badge.neutral.background` | `component.badge.neutral.text` | `component.badge.neutral.border` |
| brand | `component.badge.brand.background` | `component.badge.brand.text` | — |
| success | `component.badge.success.background` | `component.badge.success.text` | — |
| warning | `component.badge.warning.background` | `component.badge.warning.text` | — |
| danger | `component.badge.danger.background` | `component.badge.danger.text` | — |
| info | `component.badge.info.background` | `component.badge.info.text` | — |

| Property | Token |
|-----------|-------|
| Radius md | `component.badge.md.radius` (pill — 9999px) |
| Padding X md | `component.badge.md.padding-x` |
| Padding Y md | `component.badge.md.padding-y` |
| Font size md | `component.badge.md.font-size` |
| Radius sm | `component.badge.sm.radius` (pill — 9999px) |
| Padding X sm | `component.badge.sm.padding-x` |
| Padding Y sm | `component.badge.sm.padding-y` |
| Font size sm | `component.badge.sm.font-size` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Semantic role | `role="status"` — announces changes to screen readers |
| Icon-only badge | `aria-label` required (WCAG 1.1.1) |
| Icon-only badge without label | `aria-hidden="true"` — purely decorative |
| Text/background contrast | 4.5:1 minimum on white background (WCAG AA) |
| Non-interactive | No `tabindex` — if clickable, wrap in a `<button>` |

---

## Behaviors

The badge is **non-interactive** by default.

- `user-select: none` — text is not selectable
- `white-space: nowrap` — never wraps to a new line
- Icon-only: `aspect-ratio: 1` — perfect square shape

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Clickable badge without wrapping | Not accessible, no focus |
| `icon-only` without `label` | Inaccessible (WCAG 1.1.1) |
| Variant invented outside of `component.json` | Escalate to the design system team |
| Hardcoded color | Bypasses semantic tokens |
| Badge used for an action | Use `<agtc-button>` instead |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Status not encoded by color alone | [NN/g — indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | **Recommended**: for critical statuses (`danger`/`warning`), add a distinctive icon or label (not enforced, but good practice) |
| `role="status"` to announce changes to AT | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Already in place |
| Consistent semantic mapping (traffic-light) | [Dashboard — color/semantic](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | success/warning/danger variants |
| Non-interactive badge — wrap if clickable | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Existing anti-pattern |

---

## Implementation

### Web Component (Lit)
```html
<!-- Basic text badge -->
<agtc-badge>New</agtc-badge>
<agtc-badge variant="success">Active</agtc-badge>
<agtc-badge variant="warning">Pending</agtc-badge>
<agtc-badge variant="danger">Rejected</agtc-badge>
<agtc-badge variant="info">In progress</agtc-badge>
<agtc-badge variant="brand">Beta</agtc-badge>

<!-- With icon -->
<agtc-badge variant="success" icon="check">Approved</agtc-badge>
<agtc-badge variant="danger" icon="x">Expired</agtc-badge>

<!-- Size sm -->
<agtc-badge size="sm" variant="neutral">Draft</agtc-badge>

<!-- Icon-only — label required -->
<agtc-badge icon-only icon="check" label="Approved" variant="success"></agtc-badge>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a variant | Principal Designer + Tech Lead |
| Modifying a token | Principal Designer |
| Size change | Design system team |
| Accessibility bug fix | Design system team review |
