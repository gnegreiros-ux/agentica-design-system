# Theme — example

This is where an existing semantic token (defined in `core/`) is mapped to a primitive value declared in `../branding/`.

## Mapping direction

Semantic → primitive, never the other way. A `core/` component never sees a primitive directly (Rule 4).

## Coverage check

Verify every semantic family the core actually uses is complete. For example, the `feedback` family covers success, error, warning, *and* info — not only the cases the team has happened to hit so far.

## Dark mode

If the team supports a dark mode, every semantic token has both a light value and a dark value — never leave one mode unmapped.

## Extending the semantic vocabulary

If a real team need isn't covered by any core semantic token, declare a new one here — in a dedicated file in `theme/`, never in `core/`. A new semantic token must:

- Reference only a primitive from `../branding/`, never a hard-coded value (Rule 3).
- Follow the same naming convention as the core's semantic taxonomy.
- Pass the same lint as core (no hard-coded values, no component consuming a primitive directly — Rule 4).
- Extend the existing vocabulary, never duplicate or replace it — reuse a core token first if one already covers the need.

🛑 A new semantic token changes what components can consume. Present it to a human, with its justification, before it is used in any component — the same validation rule as any other structural decision.

## Example (fictional values — replace with your own)

```json
{
  "color": {
    "text": {
      "danger": { "value": "{color.brand.accent}" }
    },
    "feedback": {
      "success": { "value": "{color.brand.primary}" },
      "error": { "value": "#C62828" },
      "warning": { "value": "{color.brand.accent}" },
      "info": { "value": "{color.brand.secondary}" }
    }
  }
}
```
