# Branding — example

This is where a team declares the primitive tokens specific to its own brand. Nothing here is consumed directly by a `core/` component — Rule 4 always applies; these primitives get mapped to semantic tokens in `../theme/`.

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

## Example (fictional values — replace with your own)

```json
{
  "color": {
    "brand": {
      "primary": { "value": "#2E7D32" },
      "accent": { "value": "#F9A825" },
      "secondary": { "value": "#37474F" }
    }
  },
  "typography": {
    "scale": {
      "step-0": { "size": "16px", "lineHeight": "24px" },
      "step-1": { "size": "20px", "lineHeight": "28px" }
    }
  },
  "space": {
    "1": { "value": "4px" },
    "2": { "value": "8px" }
  }
}
```

Reminder: a primitive declared here stays a primitive — Rule 4 still applies. No `core/` component will ever consume it directly.
