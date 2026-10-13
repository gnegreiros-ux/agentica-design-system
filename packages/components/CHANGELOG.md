# @agentica-ds/components

## 1.0.1

### Patch Changes

- 6f946ce: `agtc-top-nav`: directory-style hrefs (`'../tokens/'`, `'/tokens/'` — the form the component
  guideline documents) are now marked active (`aria-current="page"` + indicator) on their section's
  pages. Previously the last segment was read as a file name, so no link was ever active with that
  form. Hrefs ending in `section/index.html` behave as before; a non-section `dir/index.html` href is
  now active only on that directory instead of on any `index.html` page.
- b4e9e0e: `agtc-top-nav`: the mobile menu panel's shadow now uses the `semantic.shadow.raised`
  token (`--agtc-semantic-shadow-raised`). It consumed `--agtc-shadow-md`, a variable
  defined only by the documentation site's CSS — so in any app using the package, the
  mobile menu had no shadow at all. It now renders the same shadow as other raised
  menus, wherever the component is used.
- 086088a: `agtc-top-nav`: the mobile menu panel background uses the new
  `background.surface-raised` token, so in dark mode the panel reads as raised above the
  page instead of blending into it. No change in light mode.

## 1.0.0

### Major Changes

- Switch this package's license from MIT to Apache License 2.0, in line with the main
  repository (ADR-095). `package.json`'s `license` field, `LICENSE`, `README.md`, and
  `NOTICE` all updated to reflect the change. Already-published MIT versions are
  unaffected — only this and later versions are Apache-2.0.

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
