# Usage contexts — Product Mode vs Marketing Mode

> Editorial "direction" decision — how to distinguish pages that persuade from pages that document.
> **Type:** guideline
> **Logical path:** guidelines/foundations/contextes.md
> **Read before:** DESIGN.md, .claude/rules/contexts-utilisation.md
> **Relations:** decisions/ADR-057, tokens/semantic.json (semantic.marketing.*)

---

## Why two contexts?

A design system produces homogeneous output by default. Without an explicit distinction, a
product's home page looks like its documentation page: same spacing, same typography, same
visual density.

The two contexts formalize a difference in intent:

| | Product Mode (SaaS) | Marketing Mode (Narrative) |
|-|---------------------|--------------------------|
| **Purpose** | Enable action | Communicate a vision |
| **Reader** | User who is working | Visitor who is evaluating |
| **Tone** | Precision, efficiency | Clarity, conviction |
| **Space** | Normal density | Generous breathing room |
| **Hierarchy** | Repeatable, predictable | Editorial, unique |

---

## Declaration — how to activate each mode

```html
<!-- Marketing Mode (persuasion pages) -->
<body data-context="marketing">

<!-- Product Mode (default — documentation, components) -->
<body>
```

CSS reacts automatically via `[data-context="marketing"]`.

---

## Tokens by context

### Product Mode — allowed tokens

```css
/* Typography — maximum heading.1 */
font-size: var(--agtc-semantic-typography-heading-1-size);      /* 40px */

/* Spacing — density=normal */
gap: var(--agtc-semantic-space-layout-section);                 /* 48px */
padding: var(--agtc-semantic-space-layout-component);           /* 24px */
```

### Marketing Mode — additional tokens

```css
/* Display typography — hero only */
font-size: var(--agtc-semantic-marketing-typography-display-size);        /* 60px */
font-weight: var(--agtc-semantic-marketing-typography-display-weight);    /* bold */
line-height: var(--agtc-semantic-marketing-typography-display-line-height); /* display */

/* Eyebrow label */
font-size: var(--agtc-semantic-marketing-typography-eyebrow-size);            /* 12px */
font-weight: var(--agtc-semantic-marketing-typography-eyebrow-weight);        /* bold */
letter-spacing: var(--agtc-semantic-marketing-typography-eyebrow-letter-spacing); /* 0.12em — ADR-067 */

/* Section spacing */
gap: var(--agtc-semantic-marketing-space-section-breathing);   /* 96px */
padding-top: var(--agtc-semantic-marketing-space-hero-gap);    /* 120px */
```

---

## Current page mapping

| Page | Mode | Justification |
|------|------|---------------|
| `/` (home) | Marketing | Presents the vision — onboards |
| `/get-started.html` | Marketing | Persuades and onboards the visitor |
| `/agents/` | Marketing | Explains the agentic system |
| `/foundations/*` | Product | Documents the foundations |
| `/components/*` | Product | Documents the components |
| `/decisions/*` | Product | Archives the decisions |

---

## Anti-patterns

> Originally distilled from `Redesign/AI anti-patters.md` (exploration folder deleted on
> 2026-06-20) — content fully carried over below; this section is now the sole source.

These mistakes apply specifically to Marketing Mode:

### Spacing

```
❌ Section spacing outside the scale (96, 120px for marketing sections)
❌ Hardcoded values — always via semantic.marketing.space.*
✅ Section breathing = 96px via var(--agtc-semantic-marketing-space-section-breathing)
✅ Hero gap = 120px via var(--agtc-semantic-marketing-space-hero-gap)
```

### Typography

```
❌ More than 3 sizes per section (headline, body, caption — max)
❌ More than 2 weights across the entire page
❌ Display title > 60px (beyond marketing.typography.display)
❌ Italic in body text
❌ All-caps except for 11-12px labels
✅ Eyebrow 12px bold → title 60px bold → body 16-17px regular: clear hierarchy
```

### Visuals

```
❌ Gradient on more than one element on the page
❌ Gradient on buttons
❌ Decorative shadows (glassmorphism, backdrop-filter, colored shadows > 4px)
❌ 3D orbs, spheres, floating blobs in the hero
❌ Particles, mesh gradients, "cosmic" images
✅ Hero image = real UI or real artifact (or text only if nothing real exists)
```

### Motion

```
❌ Scroll-triggered animations (scroll-triggered entrances)
❌ Parallax, stagger reveals, blur-to-focus
❌ Scale-on-hover, rotate-on-hover, elastic easing
✅ Hover: 150ms ease-out, opacity 0.7 or translateY(-1px) only
```

### Copywriting

```
❌ Buzzwords: "leverage", "unlock", "empower", "supercharge", "revolutionize", "seamless"
❌ Tease headlines: "Ready to transform your tokens?"
✅ Statement headlines: "Design tokens that work." — assertion, not promise
✅ Feature cards: title = concrete thing name, description = concrete benefit with at least one noun
```

---

## Do / Don't

### DO — Controlled asymmetry (home page)

```
[eyebrow 12px bold]   "AGENTIC DESIGN SYSTEM"
[H1 60px bold]        "Design tokens agents understand."
[body 17px]           "Agentica encodes interface decisions for humans and AI alike."
[CTA]                 → 96px of breathing room before the next section
```

### DON'T — Generic SaaS card on the hero page

```
[H2 24px]  "Why Agentica?"
[4 cards with abstract icons]
  ⚡ Fast    — "Fast."
  🔒 Secure  — "Secure."
  🎨 Design  — "Beautiful."
  🤖 AI-ready — "AI-ready."
```

→ Abstract icons with no content, adjective titles, descriptions with no noun.

---

## Pre-publication checklist

- [ ] The mode is declared (`data-context="marketing"` or absent)
- [ ] Typography: max 3 sizes per section, max 2 weights on the page
- [ ] Spacing: values from `semantic.marketing.space.*` or `semantic.space.*`
- [ ] No gradient on more than one element
- [ ] Hero image: real content or text only
- [ ] Headlines: assertions, no buzzwords
