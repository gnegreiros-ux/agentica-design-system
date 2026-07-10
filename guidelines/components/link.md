# Component: Link — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-04
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/link.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-043-agtc-link-implementation.md, guidelines/components/button.md, DESIGN.md

---

## Intent

**Why this component exists:**
A textual **navigation** link, internal or external, inline or standalone. Formalizes the ~2700
`<a>` elements on the site and the uniform treatment of external links.

**This component is not:**
- A button (`agtc-button`) — a link **navigates**, a button **acts**
- A tab / a primary nav (distinct components)

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `href` | String | `#` | Destination (required) |
| `external` | Boolean | `false` | Forces external treatment (auto-detected for http(s) from another origin) |
| `underline` | String | `always` | `always` / `hover` / `none` |

Text via the **slot**.

---

## Tokens used

| Role | Token |
|------|-------|
| Link color | `component.link.default.text` |
| Hover color | `component.link.default.text-hover` |
| Focus ring | `component.link.default.border-focus` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Distinguishable beyond color | Underline (`always`) in body text — WCAG 1.4.1 |
| Keyboard focus | Visible `:focus-visible` (tokenized ring) — WCAG 2.4.7 |
| External link / new tab | `rel="noopener noreferrer"` + icon **+ hidden text "(opens in a new tab)"** — WCAG H83 (the icon alone is not enough) |
| Link text | Descriptive, readable out of context — never "click here" (WCAG 2.4.4); console warning if generic |
| Semantics | Real `<a href>` — for an action, use `agtc-button` |

---

## Behaviors

- `underline="always"` (default): always underlined — recommended in **body text**.
- `underline="hover"`: underlined on hover only — for **nav** (where context already distinguishes the link).
- `underline="none"`: never underlined — contexts where the link is clearly identified otherwise.
- **External**: opens in a new tab, secured (`noopener`), announced to AT.

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| A link used to trigger a JS action without navigation | Use `agtc-button` |
| `target="_blank"` without `rel="noopener"` or warning | Security flaw (tabnabbing) + AT loses its bearings |
| "Click here" / "learn more" text alone | Unreadable out of context (WCAG 2.4.4) |
| Link distinguishable by color alone in body text | WCAG 1.4.1 |
| Hardcoded color | Bypasses the tokens |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036/043). Decision: **LK1–LK8 all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Underline in body text (beyond color) | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | `underline="always"` by default (WCAG 1.4.1) |
| Visible `:focus-visible` | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | Tokenized ring |
| External link: `rel="noopener noreferrer"` + icon + AT text | [WCAG H83](https://www.w3.org/WAI/WCAG21/Techniques/html/H83) | ✅ | Hidden "(opens in a new tab)" |
| Auto-detect external + override | [Coder's Block](https://codersblock.com/blog/external-links-new-tabs-and-accessibility/) | ✅ | http(s) other origin, `external` forces |
| Descriptive link text | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | Console warning if generic |
| Link = navigation, button = action | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | `<a href>` required |
| Distinct visited state | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ❌ | Out of v1 — not very relevant in docs/apps; possible later addition |
| Hover cue even without permanent underline | [NN/g](https://www.nngroup.com/articles/guidelines-for-visualizing-links/) | ✅ | `hover`/`none` underline on hover |

---

## Implementation

### Component (Lit)
```html
<!-- Inline (underlined by default) -->
See the <agtc-link href="/guidelines/link">guideline</agtc-link>.

<!-- External (new tab, secured, announced) -->
<agtc-link href="https://lucide.dev" external>Lucide</agtc-link>

<!-- Nav (underline on hover) -->
<agtc-link href="/components" underline="hover">Components</agtc-link>
```

### Class (static site HTML)
```html
<a class="agtc-link" href="/components">Components</a>
<a class="agtc-link" href="https://lucide.dev" target="_blank" rel="noopener noreferrer">
  Lucide <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span>
</a>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a state (visited) or a variant | Principal Designer + Tech Lead |
| Modifying a token | Principal Designer |
| Changing the default underline | Principal Designer |
| Accessibility bug fix | Design system team review |
