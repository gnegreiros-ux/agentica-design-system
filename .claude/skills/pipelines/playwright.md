# Pipeline: playwright

> E2E tests for critical journeys on the documentation site.
> **Status:** 🔜 Planned — non-blocking until activated
> **Trigger:** any change in `site/build.js`, `components/`

---

## Objective

Once activated, this pipeline:
1. Runs E2E tests on the deployed site (or locally)
2. Validates critical journeys (navigation, FR/EN switch, token explorer)
3. Integrates the axe-core audit per page

---

## Command (future)

```bash
npx playwright test
```

## Critical journeys to cover

- [ ] Main navigation — all links functional
- [ ] FR ↔ EN switch — content changes correctly
- [ ] Token explorer filter — consistent results
- [ ] Skip-link button — focus lands on `#main-content`
- [ ] Every component — hover, focus, disabled states keyboard-accessible

## Activation

1. `npm install @playwright/test`
2. `npx playwright install`
3. Create `tests/` with the specs
4. Change the status to `✅ Active`
5. Reference ADR-010
