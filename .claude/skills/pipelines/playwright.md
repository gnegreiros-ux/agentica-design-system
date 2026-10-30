# Pipeline: playwright

> Visual regression, functional and accessibility tests (ADR-066, ADR-104).
> **Status:** ✅ Active — `.github/workflows/playwright.yml`
> **Trigger:** any change in `components/`, `tokens/`, `.storybook/`, `site/`

---

## What runs, and when

| Suite | Scope | When |
|---|---|---|
| `tests/visual/` | Site pages (home, docs, component pages), light + dark; **every Storybook story**, light + dark (`tests/visual/storybook/`, ADR-104 — replaces Chromatic) | Push to `main` (Chromium only) |
| `tests/functional/` | Navigation, sidebar, language, component interactions, accessibility | Push to `main` (Chromium, Firefox, WebKit) |
| `tests/governance/` + accessibility specs | Governance suite | Every PR — required check `Governance & accessibility fixtures (PR gate)` (ADR-101) |

Reference PNGs live in `tests/visual/snapshots/`. Report:
https://designsystem.gnegreiros.com/playwright-report/

## Before committing a visual change

A change to `components/`, `tokens/`, `.storybook/` or the site's look will change
reference snapshots. Flag it in the impact report:

- [ ] Snapshots expected to change — listed
- [ ] After merge (or on the PR branch): regenerate via CI, never locally (macOS rendering
      ≠ Linux CI):

```bash
gh workflow run playwright.yml --ref <branch> -f update_snapshots=true
```

- [ ] Download the `snapshots-updated-chromium` artifact, diff it against the committed
      snapshots, and commit only the files expected to change — human approval required
      (ADR-004, ADR-066).

## Running locally (checks only, never to produce baselines)

```bash
node site/build.js && npm run build-storybook
npx playwright test --project=chromium
```

`tests/visual/storybook/` needs `storybook-static/` (built by `npm run build-storybook`);
without it, that suite is skipped locally and fails in CI.
