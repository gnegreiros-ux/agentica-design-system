# Branding — example

This is where a team declares the primitive tokens specific to its own brand. Nothing here is consumed directly by a `core-source/` component — Rule 4 always applies; these primitives get mapped to semantic tokens in `../theme/`.

## What to declare here

- **Colors**, with roles assigned (primary, accent, secondary, etc.)
- **Type scale**: size, line-height, and letter-spacing per step
- **Secondary/mono typefaces**, if used
- **Icon library** chosen
- **Spacing, radius, shadow** scales
- **Decorative/illustration tokens**, if the team has a use for them
- **Dark mode values**, if the team supports a dark mode

## Accessibility reminder

Font choice is not purely aesthetic — weigh legibility (e.g. typefaces designed for accessibility) with the same rigor as color contrast.

## Format

A **JSON file of DTCG-style tokens** — the same shape as the canonical repository's own
token files (built with Style Dictionary, see ADR-030). Not CSS custom properties, not
a theme object consumed directly by a component: this file only *declares* primitives.
Nothing here is wired to any output yet — see "Current limitations" in `../../README.md`.

## Example (fictional values — replace with your own)

This example is **complete**: it covers every category listed above at least once. Your
own file may have more steps in a scale, more named colors, etc. — but it should never
have *fewer categories* than this one.

```json
{
  "color": {
    "brand": {
      "primary": { "value": "#2E7D32" },
      "accent": { "value": "#F9A825" },
      "secondary": { "value": "#37474F" },
      "error": { "value": "#C62828" },
      "success": { "value": "#2E7D32" },
      "warning": { "value": "#F9A825" },
      "info": { "value": "#1565C0" },
      "neutral-0": { "value": "#FFFFFF" },
      "neutral-100": { "value": "#F5F5F5" },
      "neutral-500": { "value": "#757575" },
      "neutral-900": { "value": "#212121" }
    },
    "brand-dark": {
      "primary": { "value": "#66BB6A" },
      "accent": { "value": "#FFCA28" },
      "secondary": { "value": "#90A4AE" },
      "error": { "value": "#EF5350" },
      "success": { "value": "#66BB6A" },
      "warning": { "value": "#FFCA28" },
      "info": { "value": "#42A5F5" },
      "neutral-0": { "value": "#1B1B1B" },
      "neutral-100": { "value": "#303030" },
      "neutral-500": { "value": "#9E9E9E" },
      "neutral-900": { "value": "#F5F5F5" }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": { "value": "Atkinson Hyperlegible" },
      "secondary": { "value": "Inter" },
      "mono": { "value": "Atkinson Hyperlegible Mono" }
    },
    "scale": {
      "step-0": { "size": "12px", "lineHeight": "16px", "letterSpacing": "0" },
      "step-1": { "size": "14px", "lineHeight": "20px", "letterSpacing": "0" },
      "step-2": { "size": "16px", "lineHeight": "24px", "letterSpacing": "0" },
      "step-3": { "size": "20px", "lineHeight": "28px", "letterSpacing": "-0.01em" },
      "step-4": { "size": "24px", "lineHeight": "32px", "letterSpacing": "-0.01em" },
      "step-5": { "size": "32px", "lineHeight": "40px", "letterSpacing": "-0.02em" }
    }
  },
  "icon": {
    "library": { "value": "lucide" }
  },
  "space": {
    "0": { "value": "0px" },
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "6": { "value": "24px" },
    "8": { "value": "32px" }
  },
  "radius": {
    "sm": { "value": "4px" },
    "md": { "value": "8px" },
    "pill": { "value": "9999px" }
  },
  "shadow": {
    "card": { "value": "0 1px 2px rgba(0,0,0,0.08)" },
    "raised": { "value": "0 4px 12px rgba(0,0,0,0.12)" }
  },
  "illustration": {
    "style": { "value": "flat-outline" }
  }
}
```

## Checklist — does your file skip anything?

- [ ] Every named color has both a light (`color.brand.*`) and a dark (`color.brand-dark.*`) value, if you support dark mode.
- [ ] The type scale has enough steps for your real content (headings, body, detail/caption) — two steps is almost never enough.
- [ ] A secondary or mono typeface is declared if your product uses one anywhere (code blocks, data tables).
- [ ] Icon library is named explicitly, even if it's the one suggested here.
- [ ] Space, radius, and shadow each have a full scale, not a single value — components need more than one step of each.
- [ ] Decorative/illustration tokens are declared if you have any — if not, say so explicitly rather than leaving the section out silently.

Reminder: a primitive declared here stays a primitive — Rule 4 still applies. No `core-source/` component will ever consume it directly.
