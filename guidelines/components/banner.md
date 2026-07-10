# Component: Banner — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-03
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/banner.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-042-agtc-banner-implementation.md, guidelines/components/badge.md, DESIGN.md

---

## Intent

**Why this component exists:**
Display a **contextual inline message** (callout / alert) within the page flow: information,
success, warning, or error. Generalizes the site's `contribution-banner`.

**This component is not:**
- A *toast* (temporary floating notification) — separate component, planned later
- A *modal* / `alertdialog` (interrupts and captures focus)
- An `agtc-badge` (compact status label)

---

## Variants

| Variant | Semantics | Typical usage |
|----------|-----------|---------------|
| `neutral` | Neutral | Generic information |
| `brand` | Identity | Product highlight, contribution |
| `info` | Information | Contextual help (default) |
| `success` | Success | Operation confirmation |
| `warning` | Attention | Consequence to check |
| `danger` | Error | Failure, blocked action |

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `variant` | String | `info` | Semantic variant |
| `heading` | String | — | Optional title |
| `icon` | String | (per variant) | Lucide icon — overrides the default |
| `no-icon` | Boolean | `false` | Hides the icon |
| `dismissible` | Boolean | `false` | Shows a close button (emits `dismiss`) |
| `live` | String | `off` | `off` / `polite` (role=status) / `assertive` (role=alert) — **dynamic usage** |

Body via the default **slot** · actions via **`slot="actions"`**.

---

## Tokens used

| Role | Token |
|------|-------|
| Background (per variant) | `component.banner.<variant>.background` |
| Accent — left border + icon (per variant) | `component.banner.<variant>.accent` |
| Heading text | `component.banner.heading-text` |
| Body text | `component.banner.body-text` |
| Close button / hover | `component.banner.close-color` / `close-hover` |
| Focus ring | `component.banner.border-focus` |
| Radius / padding | `component.banner.radius` / `padding-x` / `padding-y` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Meaning never conveyed by color alone | Icon per variant **+** severity prefix hidden for AT ("Error: "…) |
| Static banner | **No** live region (does not announce itself on load) |
| Dynamic banner | `live="polite"` (role=status) or `live="assertive"` (role=alert) — **sparingly** |
| Close button | Real `<button>`, `aria-label="Close"`, `:focus-visible`; never captures focus |
| Contrast | gray.12/gray.11 text on subtle background ≥ 4.5:1 |

---

## Behaviors

- **Inline**: the banner stays in the flow, does not float, does not capture focus.
- **Dismiss**: click → emits `dismiss` (cancelable via `preventDefault`) then hides.
- **Persistence**: do not auto-hide a `danger` / `warning` banner (N9).

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| `role="alert"` on a static page banner | Announces itself on load — disruptive |
| Color alone for severity | Inaccessible (color blindness, AT) |
| Auto-dismissing an error | The user misses the message |
| Banner used for a floating notification | Use a *toast* (separate component) |
| Close button without `aria-label` or focus | Unusable via keyboard / AT |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036/042). Decision: **N1–N9 all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Semantic variants (6) | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Aligned with `agtc-badge` |
| Meaning never conveyed by color alone (icon + AT text) | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Hidden severity prefix |
| Icon per variant | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Overridable, `no-icon` possible |
| Static by default (no live region) | [MDN — status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role) | ✅ | `live="off"` by default |
| Assertive `role="alert"` used sparingly | [A11Y Collective](https://www.a11y-collective.com/blog/aria-alert/) | ✅ | Via `live="assertive"` |
| Accessible close button, no focus trap | [MDN — alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role) | ✅ | `dismissible` + `dismiss` event |
| Heading + body + action zone | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | `heading` + slot + `slot="actions"` |
| Left accent border + subtle background | [Dashboard](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Reuses the `contribution-banner` style |
| No auto-dismiss for critical messages | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Documented guidance (persistent danger/warning) |

---

## Implementation

### Component (Lit)
```html
<agtc-banner variant="warning" heading="Warning">
  This action will affect 3 linked files.
</agtc-banner>

<agtc-banner variant="brand" heading="Contribute" dismissible>
  This system is open to contributions.
  <span slot="actions"><a href="…">View on GitHub →</a></span>
</agtc-banner>

<!-- Dynamic notification (inserted via JS) -->
<agtc-banner variant="danger" live="assertive" heading="Error">
  Unable to reach the server.
</agtc-banner>
```

### Class (static site HTML)
```html
<div class="agtc-banner info">
  <span class="banner-icon">…</span>
  <div class="banner-content"><strong>Title</strong><span>Message body.</span></div>
</div>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a variant | Principal Designer + Tech Lead |
| Modifying a token | Principal Designer |
| Adding a behavior (auto-dismiss, toast) | Principal Designer + new ADR |
| Accessibility bug fix | Design system team review |
