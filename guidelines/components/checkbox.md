# Component: Checkbox — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-01
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/checkbox.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-037-agtc-checkbox-implementation.md, DESIGN.md

---

## Intent

**Why this component exists:**
Allow an **independent** binary selection — check/uncheck an option, accept a
condition, or mark a task as done.

**This component is not:**
- An immediate-effect on/off setting (use a future `<agtc-toggle>` — see NN/g checkbox vs toggle)
- A mutually exclusive choice within a list (use a future `<agtc-radio>`)
- An action button (use `<agtc-button>`)

---

## Shape — decision

**Square only.** NN/g explicitly recommends a square for a checkbox; a circle conventionally
signals a radio button. The ToDo reference (circles) was set aside in favor of usability
convention. See ADR-037.

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `label` | String | — | Clickable label — provide `label` **or** slotted text |
| `checked` | Boolean | `false` | Checked state |
| `indeterminate` | Boolean | `false` | Partial state (`aria-checked="mixed"`) — for a "select all" parent |
| `disabled` | Boolean | `false` | Disabled — non-interactive |
| `required` | Boolean | `false` | Required — `aria-required` |
| `name` | String | — | Field name for forms |
| `value` | String | `'on'` | Submitted value when checked |

---

## Events

| Event | Detail | Trigger |
|-----------|--------|---------------|
| `agtc-change` | `{ checked, name, value }` | On every toggle (check/uncheck) |

---

## Tokens used

| Property | Component token |
|-----------|-----------------|
| Background (empty box) | `component.checkbox.default.background` |
| Border | `component.checkbox.default.border` |
| Border hover | `component.checkbox.default.border-hover` |
| Border focus | `component.checkbox.default.border-focus` |
| Checked fill | `component.checkbox.default.fill` |
| Checked fill hover | `component.checkbox.default.fill-hover` |
| Check mark / dash | `component.checkbox.default.check` |
| Label | `component.checkbox.default.label` |
| Radius | `component.checkbox.default.radius` |

> Box size: `--agtc-semantic-icon-size-control` (20px). Gap between box and text:
> `--agtc-semantic-space-control-gap`.

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Accessible element | Native `<input type="checkbox">` (role, state, keyboard) |
| Accessible name | Implicit wrapping `<label>` — label text |
| Visible focus | `outline` on the box via `:focus-visible` |
| Touch target | ≥ 24px tall (WCAG 2.5.8) |
| Indeterminate state | DOM `indeterminate` property → `aria-checked="mixed"` |
| Box/check contrast | ≥ 3:1 (UI component, WCAG 1.4.11) |

---

## Behaviors and states

| State | Behavior |
|------|-------------|
| Default | Empty square, default border, surface background |
| Hover | Teal border (border-hover) |
| Focus | Teal outline (border-focus) — keyboard |
| Checked | Teal fill + white check mark |
| Indeterminate | Teal fill + white dash |
| Disabled | Subtle background, non-interactive, dimmed label |

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Round box | Radio convention — confusing (NN/g) |
| Pre-checked box for consent | Dark pattern (IxDF / GDPR) |
| Negatively phrased label ("Do not send me…") | Checked/unchecked ambiguity (NN/g) |
| Checkbox for an immediate-effect setting | Prefer a toggle (NN/g) |
| Hardcoded value or size | Bypasses tokens |

---

## UX Patterns Reference

> Patterns approved by the Design System Lead via the `ux-pattern-review` workflow
> (see `.claude/rules/ux-patterns-sources.md` and ADR-036). Decision: **all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Checkbox (not toggle) for an independent item | [NN/g — checkbox vs toggle](https://www.nngroup.com/articles/toggle-switch-guidelines/) | ✅ | Independent 0–N selection, not an immediate-effect setting |
| **Square shape** (a circle signals a radio) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Usability convention; deliberate departure from the round ToDo mockup |
| Clickable label (box **or** text) — Fitts's law | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) · [IxDF](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Implicit `<label>` wrapping box + text |
| Touch target ≥ 24×24px | [IxDF — touch targets](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `.root` min-height 24px (WCAG 2.5.8) |
| Complete visible states (default/hover/focus/checked/disabled) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Affordance and immediate feedback |
| Positively phrased label (no negation) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | `label` writing rule (documented anti-pattern) |
| No pre-checked consent (anti-dark-pattern) | [IxDF — deceptive patterns](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `checked` defaults to `false` |
| Native ARIA semantics (`role=checkbox`, `aria-checked`) | [NN/g — checkboxes](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) | ✅ | Native `<input type="checkbox">`, `indeterminate` → `mixed` |

---

## Implementation

### Web Component (Lit)
```html
<!-- Basic -->
<agtc-checkbox label="Receive the newsletter" name="newsletter"></agtc-checkbox>

<!-- Checked by default -->
<agtc-checkbox label="Enable notifications" checked></agtc-checkbox>

<!-- Parent of a "select all" group -->
<agtc-checkbox label="Select all" indeterminate></agtc-checkbox>

<!-- Disabled -->
<agtc-checkbox label="Option unavailable" disabled></agtc-checkbox>

<!-- Slotted text instead of the label attribute -->
<agtc-checkbox>I accept the <a href="/terms">terms</a></agtc-checkbox>
```

### Listening to the event
```javascript
document.querySelector('agtc-checkbox')
  .addEventListener('agtc-change', (e) => {
    console.log(e.detail); // { checked, name, value }
  });
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a shape variant (e.g. round) | Principal Designer (NN/g deviation must be justified) |
| Modifying a component token | Principal Designer |
| Changing behavior | Design system team |
| Accessibility bug fix | Design system team review |
