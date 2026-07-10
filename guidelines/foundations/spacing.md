# Foundation — Spacing

> Spacing foundation of the design system — 4px grid and usage rules.
> **Type:** guideline
> **Logical path:** guidelines/foundations/spacing.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, decisions/ADR-020-grille-4px.md

---

## Principle — The 4px grid

**Every dimensional value is a multiple of 4px.**

This base module guarantees visual consistency across all display densities, simplifies spacing decisions, and enables automated drift audits.

> "If the value isn't in the table, it isn't a system value."

See [ADR-020](../../decisions/ADR-020-grille-4px.md) for the full rationale and rejected alternatives.

---

## Full primitive scale

| Primitive token | Value | Multiplier | Typical usage |
|----------------|--------|----------------|-----------|
| `primitive.space.1`  | 4px  | 4 × 1  | Micro — minimal internal gap, separator |
| `primitive.space.2`  | 8px  | 4 × 2  | Small — control vertical padding |
| `primitive.space.3`  | 12px | 4 × 3  | Intermediate |
| `primitive.space.4`  | 16px | 4 × 4  | Standard — control horizontal padding |
| `primitive.space.5`  | 20px | 4 × 5  | Medium |
| `primitive.space.6`  | 24px | 4 × 6  | Large intermediate |
| `primitive.space.8`  | 32px | 4 × 8  | Large — separation between components |
| `primitive.space.10` | 40px | 4 × 10 | Very large |
| `primitive.space.12` | 48px | 4 × 12 | Macro |
| `primitive.space.16` | 64px | 4 × 16 | Macro — separation between page sections |

Primitives are **never used directly** in components. Always go through a semantic token.

---

## Semantic tokens

Semantic tokens translate the scale into UX intentions:

| Semantic token | Resolved value | Intent |
|-----------------|----------------|-----------|
| `semantic.space.control.padding-x` | 16px (`space.4`) | Horizontal padding of interactive controls |
| `semantic.space.control.padding-y` | 8px (`space.2`)  | Vertical padding of interactive controls |
| `semantic.space.control.gap`       | 8px (`space.2`)  | Internal gap (icon + label in a button) |
| `semantic.space.layout.section`    | 32px (`space.8`) | Separation between page sections |
| `semantic.space.layout.component`  | 20px (`space.5`) | Separation between components |

In CSS:
```css
padding: var(--agtc-semantic-space-control-padding-y) var(--agtc-semantic-space-control-padding-x);
gap: var(--agtc-semantic-space-control-gap);
margin-bottom: var(--agtc-semantic-space-layout-component);
```

---

## Usage rules

```
✅ Always use a semantic token in components
✅ If no semantic token matches, create one (PR required)
✅ Any new primitive value must be a multiple of 4

❌ Never a hardcoded px value: padding: 14px
❌ Never Tailwind arbitrary values: p-[14px]
❌ Never a primitive token in a component: var(--agtc-primitive-space-4)
```

---

## Which level to use when

| Context | Recommended token | Value |
|----------|-----------------|--------|
| Gap between icon and label | `control.gap` | 8px |
| Button / input padding | `control.padding-x/y` | 16px / 8px |
| Margin between two components | `layout.component` | 20px |
| Margin between sections | `layout.section` | 32px |
| Micro spacing (badge, tag) | `primitive.space.1` via new semantic token | 4px |
| Card padding | Create `semantic.space.card.padding` = `space.6` | 24px |

---

## Density system

See [ADR-025](../../decisions/ADR-025-densite-espacement-math-tokens.md) for the full rationale and the floor/ceil technique.

Three spacing levels adapted to usage contexts:

| Mode | Factor | Context | Token group |
|------|---------|----------|-----------------|
| **compact** | ×0.75 | Dashboards, tables, data-dense tools | `semantic.space.compact.*` |
| **normal** | ×1.0 | Everyday usage — forms, settings | `semantic.space.control.*` (default) |
| **comfortable** | ×1.25 | Marketing, onboarding, long-form reading | `semantic.space.comfortable.*` |

### Resolved values by mode — all on the 4px grid

| Base token | Normal | Compact | Comfortable |
|--------------|--------|---------|-------------|
| `control.padding-x` (base: 16px) | **16px** | **12px** | **20px** |
| `control.padding-y` (base: 8px) | **8px** | **4px** | **12px** |
| `control.gap` (base: 8px) | **8px** | **4px** | **12px** |
| `layout.section` (base: 32px) | **32px** | **24px** | **40px** |
| `layout.component` (base: 20px) | **20px** | **12px** | **28px** |

The `floor()/ceil()` technique guarantees that every computed value stays a multiple of 4px.

### Usage in components

```css
/* Normal (default) */
padding: var(--agtc-semantic-space-control-padding-y) var(--agtc-semantic-space-control-padding-x);

/* Compact — data-dense SaaS */
padding: var(--agtc-semantic-space-compact-control-padding-y) var(--agtc-semantic-space-compact-control-padding-x);

/* Comfortable — marketing */
padding: var(--agtc-semantic-space-comfortable-control-padding-y) var(--agtc-semantic-space-comfortable-control-padding-x);
```

```
❌ Never an invented intermediate value: padding: 10px
✅ If density doesn't match — choose the closest of the three modes
```
