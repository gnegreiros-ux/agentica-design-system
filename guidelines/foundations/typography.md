# Foundation — Typography

> Typography foundation of the design system — typeface, scale, tokens and usage rules.
> **Type:** guideline
> **Logical path:** guidelines/foundations/typography.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, decisions/ADR-021-atkinson-hyperlegible.md, decisions/ADR-023-echelle-typographique-minor-third.md

---

## Primary typeface — Atkinson Hyperlegible

Designed by Applied Design Works for the Braille Institute of America (2019, Open Font License).
Goal: maximum differentiation of ambiguous characters for people with low vision.

**Why this choice:**

| Ambiguous pair | Treatment |
|--------------|-----------|
| `l` / `1` / `I` | Deliberately distinct — unique serifs and shapes |
| `O` / `0` | Distinct — the zero is slashed |
| `b` / `d` / `p` / `q` | Intentional asymmetries — non-mirrored |
| `n` / `u` / `m` | Accentuated counter-forms |

See [ADR-021](../../decisions/ADR-021-atkinson-hyperlegible.md) for the full rationale.

---

## Available weights

Atkinson Hyperlegible supports only **2 weights**:

| Token | Value | Actual weight | Usage |
|-------|--------|----------------|-------|
| `fontWeight.regular` | 400 | Regular | Body text, descriptions |
| `fontWeight.medium`  | 500 | → 400 (browser rounding) | Labels, controls — documented behavior |
| `fontWeight.bold`    | 700 | Bold | Titles, emphasis |

> ⚠️ `fontWeight.medium` (500) does not exist in Atkinson Hyperlegible. Browsers round it down to Regular (400). This trade-off is acceptable and deliberately chosen.

---

## Size scale — Minor Third (1.2 ratio)

See [ADR-023](../../decisions/ADR-023-echelle-typographique-minor-third.md) for the full rationale.

**Principle:** 1.200 ratio (Minor Third), rounded to the nearest multiple of 4px. Unit: `rem` (respects browser zoom — WCAG 1.4.4).

| Primitive token | rem | px | Context |
|---------------|-----|----|---------|
| `primitive.fontSize.xs`   | 0.75rem  | 12px | Details, annotations, captions |
| `primitive.fontSize.sm`   | 0.875rem | 14px | Labels, metadata, helper text |
| `primitive.fontSize.base` | 1rem     | 16px | Main body text |
| `primitive.fontSize.lg`   | 1.25rem  | 20px | Heading 5, subtitles |
| `primitive.fontSize.xl`   | 1.5rem   | 24px | Heading 4 |
| `primitive.fontSize.2xl`  | 1.75rem  | 28px | Heading 3 |
| `primitive.fontSize.3xl`  | 2rem     | 32px | Heading 2 |
| `primitive.fontSize.4xl`  | 2.5rem   | 40px | Heading 1 |
| `primitive.fontSize.5xl`  | 3rem     | 48px | Hero display |

---

## Line-height rules

Only three values, assigned by size context:

| Token | Value | Rule |
|-------|--------|-------|
| `primitive.lineHeight.reading` | 1.6 | Any text ≤ base (xs, sm, base) — WCAG 1.4.12 |
| `primitive.lineHeight.heading` | 1.1 | Intermediate headings (lg, xl, 2xl) |
| `primitive.lineHeight.display` | 1.0 | Large headings (3xl, 4xl, 5xl) |

---

## Letter-spacing (tracking) rules

Eleven values, from tight (large numbers/display titles) to wide (badges/labels in small caps).
Debt resolved in two phases: ADR-067 (category + `wide`/`widest` for the `agtc-code-block`
language badge), ADR-068 (full extension — the 9 `--agtc-tracking-*` site variables, ~50 call
sites, no longer have any hardcoded value).

| Token | Value | Role |
|-------|--------|------|
| `primitive.letterSpacing.tighter` | -0.03em | Large display numbers/digits (stats, KPIs) |
| `primitive.letterSpacing.tight` | -0.025em | H1 titles outside the hero |
| `primitive.letterSpacing.snug` | -0.02em | Logo, secondary stat numbers, home section titles |
| `primitive.letterSpacing.heading` | -0.015em | H2 titles, ADR page titles |
| `primitive.letterSpacing.normal` | 0em | Default — body text, labels, details |
| `primitive.letterSpacing.relaxed` | 0.04em | Language buttons, contrast table headers |
| `primitive.letterSpacing.wide` | 0.06em | Small caps — code language indicator, tables |
| `primitive.letterSpacing.label` | 0.08em | Uppercase property/metadata labels |
| `primitive.letterSpacing.loose` | 0.09em | Uppercase audience label |
| `primitive.letterSpacing.overline` | 0.1em | Uppercase contextual badges/tags (overline) |
| `primitive.letterSpacing.widest` | 0.12em | Marketing eyebrow label |

Each primitive has a `semantic.typography.letter-spacing.*` alias of the same name. The site
consumes these tokens through a `--agtc-tracking-*` named scale (`site/build.js`) that reuses
the same names except for two historical exceptions preserved to avoid touching call sites:
`--agtc-tracking-wide` → `letter-spacing.relaxed` (0.04em) and `--agtc-tracking-wider` →
`letter-spacing.wide` (0.06em) — see ADR-068 for the detail of this naming collision.

---

## Semantic styles — the 9 levels

| Semantic token | Size | Weight | Line-height | Role |
|-----------------|--------|---------|-------------|------|
| `semantic.typography.detail`    | xs (12px)  | 400 | 1.6 | Annotations, captions, contextual help |
| `semantic.typography.label`     | sm (14px)  | 500 | 1.6 | Form labels, tags, metadata |
| `semantic.typography.body`      | base (16px)| 400 | 1.6 | Main body text |
| `semantic.typography.heading.5` | lg (20px)  | 500 | 1.1 | H5, section subtitles |
| `semantic.typography.heading.4` | xl (24px)  | 700 | 1.1 | H4 |
| `semantic.typography.heading.3` | 2xl (28px) | 700 | 1.1 | H3 |
| `semantic.typography.heading.2` | 3xl (32px) | 700 | 1.0 | H2 |
| `semantic.typography.heading.1` | 4xl (40px) | 700 | 1.0 | Main H1 |
| `semantic.typography.hero`      | 5xl (48px) | 700 | 1.0 | Hero title, landing page |

---

## Usage rules

```
✅ Always reference a semantic token for typography
✅ font-family always via var(--agtc-semantic-typography-fontFamily)
✅ Choose the level by INTENT (h1 for main title, body for paragraph)

❌ Never a hardcoded font-size: font-size: 16px
❌ Never a hardcoded font-family: font-family: 'Atkinson Hyperlegible'
❌ Never a primitive token directly in a component
❌ Never invent an intermediate level (e.g. 18px) — choose an existing step
```

---

## Google Fonts import

For web projects using the CDN:

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

For projects with a local npm dependency:

```bash
npm install @fontsource/atkinson-hyperlegible
```

```javascript
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
```
