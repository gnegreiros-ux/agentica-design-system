---
"@agentica-ds/tokens": patch
---

Deprecate 6 never-consumed semantic tokens (issue #206/#209; HM-11). Metadata only — no
`$value` changes, `dist/tokens/**` is byte-identical.

- `semantic.color.brand.primary-hover`, `brand.accent-hover`, `brand.secondary-hover` — brand
  color is identity, not interaction (ADR-048/050). Use `semantic.color.action.primary-hover`.
- `semantic.color.overlay.dark` — `rd-bg-fade` now composes `background.inverse` with
  `overlay.subtle`/`overlay.medium` instead of this single stop. Use
  `semantic.color.background.inverse`.
- `semantic.space.layout.page-gutter` — the site's own page-section gutter value, not a
  design-system API; its `$intent` cited the wrong ADR. No alternative — belongs in
  `site/build.js`.
- `semantic.shadow.card-hover` — retrofits the `com.agentica.usage.alternative` field (added
  by ADR-103) to match the new `$deprecated` convention on the other 5.

Each carries `$deprecated` (explanatory string, per DTCG) and, where one exists, a
machine-readable `$extensions["com.agentica.usage"].alternative` (ADR-102). None are removed —
they ship in `@agentica-ds/tokens` across 6 platforms; removal only at a major version.
