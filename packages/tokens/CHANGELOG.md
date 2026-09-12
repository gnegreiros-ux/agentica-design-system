# @agentica-ds/tokens

## 0.2.0

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

## Unreleased

### Major Changes

- The next major version of this package will switch its license from MIT to Apache
  License 2.0, in line with the main repository (see `decisions/ADR-095` and the root
  `LICENSE`/`NOTICE` files). The license of already-published versions is unaffected.

## 0.1.3

### Patch Changes

- Add keywords to package.json for npm search discoverability.

## 0.1.2

### Patch Changes

- Add repository, homepage, and bugs metadata to package.json.

## 0.1.1

### Patch Changes

- Add README.md to each package (install and usage docs).
