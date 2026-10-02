# @agentica-ds/tokens

## 1.1.0

### Minor Changes

- 086088a: Dark-mode elevation (ADR-103). New token `semantic.color.background.surface-raised`
  (`--agtc-semantic-color-background-surface-raised`) for dropdown menus, popovers and mobile
  nav panels — white like `surface` in light mode, one step lighter than `surface` in dark
  mode. `semantic.shadow.header`, `shadow.raised` and `shadow.card` now have dark variants in
  `dark.css` (same geometry, stronger opacity) so elevation stays visible on dark backgrounds.
  `semantic.shadow.card-hover` is deprecated (never consumed; use
  `component.card.elevated.shadow`); it is not removed.

### Patch Changes

- 66c7b28: Drop the `Generated on <date>` line from the header comment of the built CSS and JS
  files (`all.css`, `components.css`, `primitives.css`, `semantic.css`, `js/tokens.js`).
  It was stamped with the build clock, so two builds of the same commit produced
  different tarballs; the build is now byte-for-byte reproducible. No token name or
  value changes.

## 1.0.0

### Major Changes

- Switch this package's license from MIT to Apache License 2.0, in line with the main
  repository (ADR-095). `package.json`'s `license` field, `LICENSE`, `README.md`, and
  `NOTICE` all updated to reflect the change. Already-published MIT versions are
  unaffected — only this and later versions are Apache-2.0.

### Minor Changes

- 197c507: Add `semantic.layout.container` tokens (ADR-096): five page-container max-widths — `cta`
  (600px), `intro` (700px), `docs` (960px), `default` (1180px), `wide` (1280px). Closes a gap
  where no governed token existed for page/section container width, surfaced by an AI-tool
  interoperability test.

### Patch Changes

- 9ef26b6: Add a `NOTICE` file to each package attributing the third-party components it
  incorporates or depends on (Radix UI Colors + Atkinson Hyperlegible for
  `tokens`; Lit + Lucide for `components`), and include it in the published
  tarball via `files`. Informational only — does not change either package's
  own license.

## 0.1.3

### Patch Changes

- Add keywords to package.json for npm search discoverability.

## 0.1.2

### Patch Changes

- Add repository, homepage, and bugs metadata to package.json.

## 0.1.1

### Patch Changes

- Add README.md to each package (install and usage docs).
