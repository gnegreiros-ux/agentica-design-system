# Component: Card — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-05-31
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/card.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, DESIGN.md

---

## Intent

**Why this component exists:**
Group visually related information inside a bounded container, with optional header and footer support.

**This component is not:**
- A navigation link (place an `<a>` inside it)
- A modal (use `<agtc-modal>`)
- An interactive component — not clickable by default

---

## Variants

| Variant | Visual effect | Usage |
|----------|-------------|-------|
| `default` | Thin border, surface background | General use |
| `elevated` | Drop shadow, surface background | Highlighting, hierarchy |
| `flat` | Subtle background, no visible border | Secondary sections, dense groupings |

---

## Padding

| Value | Size | Usage |
|--------|--------|-------|
| `none` | 0px | Full-bleed media, padding-free lists |
| `sm` | `primitive.space.3` | Constrained spaces |
| `md` | `semantic.space.layout.component` | Default — general use |
| `lg` | `primitive.space.6` | Spacious content, forms |

---

## Slots

| Slot | Behavior |
|------|-------------|
| `header` | Automatic bottom separator if content is present |
| (default) | Card body |
| `footer` | Automatic top separator if content is present |

Separators are hidden if the slot is empty (detected via `slotchange`).

---

## Properties

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `variant` | String | `default` | Visual variant |
| `padding` | String | `md` | Internal padding size |

---

## Tokens used

| Variant | Background token | Border token | Shadow token |
|----------|-----------------|-------------|--------------|
| default | `component.card.default.background` | `component.card.default.border` | — |
| elevated | `component.card.elevated.background` | transparent | `component.card.elevated.shadow` |
| flat | `component.card.flat.background` | transparent | — |

| Property | Token |
|-----------|-------|
| Radius | `component.card.default.radius` |
| Padding md | `component.card.default.padding` |
| Padding none | `component.card.padding-none` |
| Padding sm | `component.card.padding-sm` |
| Padding lg | `component.card.padding-lg` |

### Typography — dual context (ADR-057)

The card's typography follows the usage context declared via `data-context` on `<body>`.

| Role | SaaS/Product token | Marketing token (`data-context="marketing"`) |
|------|--------------------|---------------------------------------------|
| Standard title | `component.card.typography.title.size` (14px) | `component.card.typography.marketing.title.size` (16px) |
| Prominent title (persona, feature) | — | `component.card.typography.marketing.hero-title.size` (20px) |
| Body | `component.card.typography.body.size` (14px) | `component.card.typography.marketing.body.size` (16px) |
| Meta / secondary label | `component.card.typography.meta.size` (12px) | `component.card.typography.marketing.meta.size` (14px) |

**Rule:** use `component.card.typography.marketing.*` only on pages with `data-context="marketing"` (`index.html`, `get-started.html`, `agents/index.html`). Never apply these tokens on a component documentation page.

Marketing overrides are applied via `[data-context="marketing"] .card-title { font-size: var(--agtc-component-card-typography-marketing-title-size) }` in `siteCSS()` — the tokens cascade automatically without modifying the Web Component.

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Non-interactive | No `role` added — neutral semantics (`<div>`) |
| Clickable card | Wrap in an `<a>` with accessible text |
| Readable content | Contrast of text inside ≥ 4.5:1 |
| Focus | Managed by the interactive elements inside, not the card itself |

---

## Behaviors

- `overflow: hidden` — content never overflows the radius
- Body padding is adjusted automatically when a header/footer is present (no double spacing)
- Header/footer separators adapt to the variant (consistent border color)

---

## Composition

```html
<!-- Clickable card — <a> inside -->
<agtc-card variant="elevated">
  <a href="/detail" style="display:block;text-decoration:none">
    <h3>Card title</h3>
    <p>Content description.</p>
  </a>
</agtc-card>

<!-- With footer actions -->
<agtc-card>
  <span slot="header">Title</span>
  Main card content.
  <div slot="footer">
    <agtc-button variant="primary">Confirm</agtc-button>
    <agtc-button variant="ghost">Cancel</agtc-button>
  </div>
</agtc-card>
```

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Clickable `<agtc-card>` without an `<a>` | Not accessible — no native focus |
| Hardcoded background color | Bypasses variant tokens |
| Inline padding style | Use the `padding` values |
| Card with no content | Empty display — always provide a body |
| Invented variant | Escalate to the design system team |
| **Nested interactive element** (`<button>` inside an enclosing `<a>`) | Invalid HTML, ambiguous on click and via keyboard (see pattern C2) |
| "Fully clickable" card containing ≥ 2 distinct actions | Target conflict — use an `::after` overlay or dedicated actions (see C2) |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036). Decision: **C1, C3, C4 approved + C2 revised**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Clear visual grouping (clustering) of related content | [Dashboard — grouped layout](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Component intent |
| **Clickable card — revised rule** | [Smashing — clickable cards](https://www.smashingmagazine.com/category/design-patterns/) · [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ (revised) | See contract below |
| Hierarchy via elevation/shadow, not color alone | [Dashboard — composition](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | `elevated` variant |
| Detail-on-demand: the card summarizes, detail opens elsewhere | [Dashboard — screenspace](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Usage guideline: avoid the card becoming a "container for all detail" |

### Clickability contract (revised C2)

- **Card with a single destination** → the link covers the **entire surface** (encompassing
  click target, visible focus on the card).
- **Card with distinct actions** (≥ 2 buttons/links) → the card **is not** a global link:
  - either a **primary link** (the title) extended over the card via an `::after` overlay, with
    secondary buttons placed above it (`position: relative; z-index`) to remain clickable;
  - or a **non-interactive container** where each action has its own `<button>`/`<a>`.
- **Never nest an interactive element** inside another one.

---

## Implementation

### Web Component (Lit)
```html
<!-- Default -->
<agtc-card>
  <p>Card content.</p>
</agtc-card>

<!-- Elevated -->
<agtc-card variant="elevated">
  <p>Highlighted card.</p>
</agtc-card>

<!-- Flat -->
<agtc-card variant="flat">
  <p>Secondary section.</p>
</agtc-card>

<!-- With header and footer -->
<agtc-card padding="lg">
  <span slot="header">Account settings</span>
  <p>Manage your personal information.</p>
  <div slot="footer">
    <agtc-button variant="primary">Save</agtc-button>
  </div>
</agtc-card>

<!-- Padding none — full-bleed image -->
<agtc-card variant="elevated" padding="none">
  <img src="cover.jpg" alt="Cover" style="width:100%;display:block">
  <div style="padding:var(--agtc-semantic-space-layout-component)">
    <h3>Title</h3>
  </div>
</agtc-card>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a variant | Principal Designer + Tech Lead |
| Modifying a token | Principal Designer |
| Adding a new slot | Design system team |
| Accessibility bug fix | Design system team review |
