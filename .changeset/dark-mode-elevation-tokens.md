---
"@agentica-ds/tokens": minor
---

Dark-mode elevation (ADR-103). New token `semantic.color.background.surface-raised`
(`--agtc-semantic-color-background-surface-raised`) for dropdown menus, popovers and mobile
nav panels — white like `surface` in light mode, one step lighter than `surface` in dark
mode. `semantic.shadow.header`, `shadow.raised` and `shadow.card` now have dark variants in
`dark.css` (same geometry, stronger opacity) so elevation stays visible on dark backgrounds.
`semantic.shadow.card-hover` is deprecated (never consumed; use
`component.card.elevated.shadow`); it is not removed.
