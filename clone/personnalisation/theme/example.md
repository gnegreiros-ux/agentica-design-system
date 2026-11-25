# Theme — example

This is where an existing semantic token (defined in `core-source/`) is mapped to a primitive value declared in `../branding/`.

## Mapping direction

Semantic → primitive, never the other way. A `core-source/` component never sees a primitive directly (Rule 4).

## Coverage check

Verify every semantic family the core actually uses is complete. For example, the `feedback` family covers success, error, warning, *and* info — not only the cases the team has happened to hit so far.

## Dark mode

If the team supports a dark mode, every semantic token has both a light value and a dark value — never leave one mode unmapped.

## Extending the semantic vocabulary

If a real team need isn't covered by any core semantic token, declare a new one here — in a dedicated file in `theme/`, never in `core-source/`. A new semantic token must:

- Reference only a primitive from `../branding/`, never a hard-coded value (Rule 3).
- Follow the same naming convention as the core's semantic taxonomy.
- Pass the same lint as core (no hard-coded values, no component consuming a primitive directly — Rule 4).
- Extend the existing vocabulary, never duplicate or replace it — reuse a core token first if one already covers the need.

🛑 A new semantic token changes what components can consume. Present it to a human, with its justification, before it is used in any component — the same validation rule as any other structural decision.

## Format

Same as `../branding/example.md`: a **JSON file of DTCG-style tokens**. The only
difference is what a value may reference — here, every value is a `{reference}` to a
primitive declared in `../branding/`, never a literal (Rule 3), and light/dark pairs
both resolve to `color.brand.*` / `color.brand-dark.*` respectively — the semantic name
never changes between modes, only what it points to.

## Example (fictional values — replace with your own)

Mapped against the complete `../branding/example.md` primitives. This covers every family
the core actually needs (text, feedback, background, border) in both modes — not just
the cases you've happened to hit so far.

```json
{
  "color": {
    "text": {
      "default": {
        "light": { "value": "{color.brand.neutral-900}" },
        "dark": { "value": "{color.brand-dark.neutral-900}" }
      },
      "subdued": {
        "light": { "value": "{color.brand.neutral-500}" },
        "dark": { "value": "{color.brand-dark.neutral-500}" }
      },
      "danger": {
        "light": { "value": "{color.brand.error}" },
        "dark": { "value": "{color.brand-dark.error}" }
      },
      "link": {
        "light": { "value": "{color.brand.secondary}" },
        "dark": { "value": "{color.brand-dark.secondary}" }
      }
    },
    "feedback": {
      "success": {
        "light": { "value": "{color.brand.success}" },
        "dark": { "value": "{color.brand-dark.success}" }
      },
      "error": {
        "light": { "value": "{color.brand.error}" },
        "dark": { "value": "{color.brand-dark.error}" }
      },
      "warning": {
        "light": { "value": "{color.brand.warning}" },
        "dark": { "value": "{color.brand-dark.warning}" }
      },
      "info": {
        "light": { "value": "{color.brand.info}" },
        "dark": { "value": "{color.brand-dark.info}" }
      }
    },
    "background": {
      "page": {
        "light": { "value": "{color.brand.neutral-100}" },
        "dark": { "value": "{color.brand-dark.neutral-100}" }
      },
      "surface": {
        "light": { "value": "{color.brand.neutral-0}" },
        "dark": { "value": "{color.brand-dark.neutral-100}" }
      }
    },
    "border": {
      "default": {
        "light": { "value": "{color.brand.neutral-500}" },
        "dark": { "value": "{color.brand-dark.neutral-500}" }
      }
    }
  },
  "space": {
    "component": { "value": "{space.2}" },
    "layout": { "value": "{space.6}" }
  },
  "radius": {
    "control": { "value": "{radius.sm}" },
    "card": { "value": "{radius.md}" }
  },
  "shadow": {
    "card": { "value": "{shadow.card}" }
  }
}
```

## Checklist — does your file skip anything?

- [ ] Every semantic color has both a `light` and a `dark` value, if you support dark mode — not just the ones you noticed first.
- [ ] `feedback` covers success, error, warning, *and* info — see "Coverage check" above.
- [ ] `background` and `border` are mapped, not just `text` and `feedback` — components need a surface and an edge, not only content colors.
- [ ] Every value is a `{reference}` to `../branding/`, never a literal hex or px value (Rule 3).
- [ ] Space/radius/shadow semantic names are mapped too, if your components need more than one step of each.
