# Component: Feature Card — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-25
> **Type:** contract
> **Logical path:** guidelines/components/feature-card.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-063-agtc-feature-card.md

---

## Intent

**Why this component exists:**
Present a capability, role, or feature in a compact editorial block — icon + title + body — with a visual interactivity affordance (animated border-bottom). Designed for "Value by role" narrative marketing sections.

**This component is not:**
- A navigation link (place an `<a>` inside if clickable)
- A data card (`<agtc-card>` for generic content surfaces)
- A button or primary action

---

## Variants

| Variant | Border-bottom | Usage |
|----------|--------------|-------|
| `default` | Primary color (`--agtc-semantic-color-action-primary`) | SaaS / product pages |
| `marketing` | Primary → accent gradient | `data-context="marketing"` pages |

---

## Token contract

| Usage | CSS token |
|-------|-----------|
| Card background (glassmorphism) | `--agtc-semantic-color-background-overlay-dark` |
| Card border | `--agtc-semantic-color-border-overlay-dark` |
| Border-bottom (`default`) | `--agtc-semantic-color-action-primary` |
| Border-bottom gradient (`marketing`) | `--agtc-semantic-color-action-primary` → `--agtc-semantic-color-brand-accent` |

> Token debt fixed on 2026-07-07 (Figma audit): the `:host`'s `background` and `border`
> used hardcoded `rgba()` values, and the marketing gradient referenced
> `--agtc-semantic-color-accent` (non-existent, silent CSS fallback).
> See `.claude/rules/tokens-system.md`.

## Attributes

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `heading` | `String` | `''` | Card title (2-3 words max) |
| `heading-level` | `Number` | `3` | HTML heading level (1–6) — adjust based on page hierarchy |
| `variant` | `String` | `'default'` | `"default"` or `"marketing"` |

## Slots

| Slot | Expected content |
|------|----------------|
| `icon` (named) | 20×20px SVG — functional icon, not decorative |
| *(default)* | Short description — 1 to 2 sentences |

---

## Usage rules

```
✅ Maximum 1 heading level per section — adjust heading-level based on context
✅ Functional icon only — represent the block's intent, not decoration
✅ Short body — 1 to 2 sentences, no nested lists
✅ Use variant="marketing" only on data-context="marketing" pages
❌ Never a primary button inside — the card is not a primary action zone
❌ Never a raster image inside — use only SVG icons in the icon slot
```

---

## UX Patterns Reference

Review approved on 2026-06-25 (ADR-063).

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Icon + title pairing | [NN/g — Icons & Indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Functional signal: the icon helps identify the block before reading the title |
| Controlled interactivity affordance | [IxDF — UI Design Patterns](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | `scaleX` animation only on hover/focus — no distracting idle animation |
| Non-interactive by default | [Smashing Magazine — Card patterns](https://www.smashingmagazine.com/category/design-patterns/) | ✅ | `:host` is neither `<a>` nor `<button>` — the action goes inside if needed |
| Touch targets ≥ 24×24px | [IxDF — Touch Targets](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | 36px icon, non-interactive — compliant with WCAG 2.5.8 |
| Flexible heading level | [NN/g — Visual Hierarchy](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `heading-level` attribute (default 3) — avoids skipped levels in page hierarchy |
| Contextual variant | [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | `default` / `marketing` — adapts emphasis without duplicating the component |
| `prefers-reduced-motion` | [IxDF — Accessibility](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Border always visible (`scaleX(1)`), transition disabled |
| Accessible markup | [IF — Data Patterns Catalogue](https://catalogue.projectsbyif.com/) | ✅ | `role="heading"` + `aria-level` in the shadow DOM — SR-agnostic of the wrapper tag |

---

## Accessibility

- `role="heading"` + `aria-level="${headingLevel}"` → correctly read by SRs regardless of context
- `prefers-reduced-motion: reduce` → full-width border-bottom from the start, no animation
- The `icon` slot must contain an SVG with `aria-hidden="true"` — the title is the semantic label
- Visible focus: `:host(:focus-within)::after` ensures a visual indication during keyboard navigation

---

## Usage example

```html
<!-- SaaS context — default variant -->
<agtc-feature-card heading="Accessibility" heading-level="3">
  <svg slot="icon" ...></svg>
  WCAG 2.1 AA automatically checked before every commit.
</agtc-feature-card>

<!-- Marketing context -->
<agtc-feature-card heading="Designers" variant="marketing" heading-level="3">
  <svg slot="icon" ...></svg>
  Semantic tokens, component contracts, and documented decisions.
</agtc-feature-card>
```
