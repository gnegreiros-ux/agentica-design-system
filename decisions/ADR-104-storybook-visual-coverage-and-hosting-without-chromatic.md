# ADR-104 — Storybook without Chromatic: Playwright story snapshots and Storybook hosted with the site

> **Date:** 2026-10-02
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** infrastructure
> **Logical path:** decisions/ADR-104-storybook-visual-coverage-and-hosting-without-chromatic.md
> **Read before:** ADR-066, ADR-006, ADR-065, ADR-009
> **Relations:** ADR-066 (completes), ADR-006 (superseded), ADR-065 (Chromatic modes part superseded), `tests/visual/storybook/stories.spec.js`, `playwright.config.js`, `.github/workflows/playwright.yml`, `.github/workflows/deploy-site.yml`, `site/build.js` (`STORYBOOK_URL`)

---

## Context

ADR-066 (2026-07-02) replaced Chromatic with Playwright for the design system's visual
regression testing. Three things Chromatic still did were never moved, so it lingered:

1. **Story-level visual coverage.** Playwright snapshots covered the site's pages
   (component pages in light and dark), not every Storybook story. A story isolates
   variants and states (disabled, error, empty, every variant) that the site pages don't
   all show. Chromatic kept running on branches for this, hit its free-tier quota again in
   2026-09, and its baselines were never reliably approved.
2. **Hosting the public Storybook.** The site's "Storybook" links pointed to
   `main--….chromatic.com` — and since `chromatic.yml` no longer ran on `main`, that
   hosted Storybook had stopped following `main`.
3. **Residues** treated as active by tooling and agents: `chromatic.yml`, the
   `chromatic` npm script and `@chromatic-com/storybook` addon, `.storybook/modes.js`, a
   "✅ Active, mandatory" Chromatic pipeline in the quality gate, a `chromatic` row in the
   tool-parity attestations, and ADR-006 still "Active".

Storybook itself never depended on Chromatic: stories, Docs, Controls, the a11y addon,
themes and the Vitest addon all run without it.

## Decision

1. **Every Storybook story gets a Playwright visual snapshot, light and dark**
   (`tests/visual/storybook/stories.spec.js`). Stories are enumerated from the built
   Storybook's `storybook-static/index.json` — never hard-coded, so a new story is
   covered as soon as it exists. Each story is opened in Storybook's iframe with
   `globals=theme:<light|dark>` and `#storybook-root` is captured. Chromium only, like
   every other reference snapshot. Baselines follow ADR-066 exactly: generated in CI
   through `workflow_dispatch` (`update_snapshots=true`), diffed, committed by a human.
2. **`playwright.config.js` serves `storybook-static/` on :6007 only when it has been
   built.** `playwright.yml` builds it in the Chromium job; runs that don't need story
   snapshots (the PR governance gate) don't pay for the build. In CI, a missing build
   fails the suite instead of skipping it.
3. **Storybook is published with the site at `https://agentica.design/storybook/`.**
   `deploy-site.yml` builds Storybook into `site/dist/storybook/` inside the deploy job
   only — never committed, so `site-freshness.yml` is unaffected. It now also deploys on
   changes to `components/` and `.storybook/`. `STORYBOOK_URL` in `site/build.js` points
   there.
4. **Chromatic is removed entirely:** `chromatic.yml`, the `chromatic` script,
   `@chromatic-com/storybook`, `.storybook/modes.js` and `parameters.chromatic`, the
   Chromatic pipeline doc (replaced by an active `pipelines/playwright.md`), and the
   `chromatic` control of `scripts/check-tool-parity.js` and the tool-parity
   attestations — visual regression is a CI gate now, identical for every AI tool, so
   there is nothing left to attest per tool. ADR-006 is superseded.

## Rejected alternatives

- **Keep Chromatic for stories only (free tier).** Rejected: the quota was exhausted
  twice, baselines went unapproved, and ADR-066's cost and data-sovereignty reasons apply
  unchanged.
- **Storybook test-runner / Vitest browser-mode screenshots.** Rejected for now: a second
  snapshot toolchain next to Playwright, with its own baseline location and update flow,
  for the same result.
- **Snapshot stories in all three browsers.** Rejected: 3× the reference images for no
  rendering signal the site pages' cross-browser functional tests don't already give;
  consistent with ADR-066 (reference snapshots = Chromium).
- **Host Storybook on a separate service (Netlify, Vercel…).** Rejected: a new account
  and a third party for something GitHub Pages already serves for free, alongside the site.

## Consequences

- 104 stories × 2 themes = 208 new reference PNGs under
  `tests/visual/snapshots/visual/storybook/`. They must be generated in CI before this
  change reaches `main`, or the push-to-`main` Playwright run fails on missing baselines.
- Any change to a component, a story, a token or `.storybook/` can now change story
  snapshots — the quality gate's Playwright pipeline asks for the expected changes to be
  listed and regenerated via CI.
- The `CHROMATIC_PROJECT_TOKEN` repository secret and the Chromatic project are no longer
  used; deleting them is a manual step for the maintainer.
- Lost compared with Chromatic: its web review UI. Same trade-off ADR-066 already accepted —
  the Playwright HTML report replaces it.
