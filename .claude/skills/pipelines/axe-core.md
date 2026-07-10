# Pipeline: axe-core

> Automated WCAG accessibility audit via axe-core.
> **Status:** ✅ Active — **report mode** (non-blocking during burn-down; switch to blocking planned)
> **Trigger:** any change in `components/`, `site/build.js`, `tokens/`

---

## Objective

Once activated, this pipeline:
1. Runs axe-core on every generated page
2. Reports critical violations (level A and AA)
3. Blocks the commit if critical violations are present

---

## Commands (future)

```bash
# Via Playwright
npx playwright test --grep axe

# Via dedicated script
node scripts/axe-audit.js
```

## Absolute rule

**0 critical violations (impact: critical | serious) allowed.**
Moderate violations are flagged but non-blocking.

## Checks to implement

- [ ] Exit 0 on every page of the site
- [ ] No violations on components (ds-button, ds-icon, etc.)
- [ ] Full report in `axe-report.json`

## Pages to audit

- `/index.html`
- `/foundations/*.html`
- `/components/*.html`
- `/tokens/index.html`
- `/decisions/*.html`
- `/agents/index.html`

## Activation — ✅ done (2026-06-06)

1. ✅ `@axe-core/playwright` added to devDependencies (`npm run axe`)
2. ✅ `scripts/axe-audit.js` created — scans `site/dist/**`, excludes the logotype
   (`.logo`/`.hero-name`, exempt under WCAG 1.4.3), exits 1 on `critical`/`serious`
   (unless `AXE_BLOCKING=false`). Report → `axe-report.json`.
3. ✅ Workflow `.github/workflows/axe.yml` — builds the site + runs the audit, artifact uploaded.
4. ✅ Applies **ADR-007**.

### Burn-down — resolved (76 → 0)

At activation time: **76 violations** (`critical`/`serious`) across 73 pages. All resolved:

- **`color-contrast`** (dominant cause): the action teal `action.primary` (teal.11) as **text**
  on the page background `#fcfcfc` (gray.1) measured **4.44:1** with the old value `#008573` —
  failing the 4.5:1 threshold by a hair, **uniformly** (secondary/ghost buttons, active nav links,
  inline code `td code`, prose links). No Radix teal step between teal.11 and teal.12 (near-black).
  **Resolved (ADR-050)**: teal.11 retuned `#008573` → `#007a68` = **5.14:1** on `#fcfcfc` (white
  text on top = 5.27:1).
- **`aria-prohibited-attr`**: `aria-label` on decorative `<div>` elements (spacing bars,
  palette swatches) without a role that permits the attribute. **Resolved**: added `role="img"`.
- **`label`** (×2): demo `<input>` without an associated label. **Resolved**: `for`/`id` association added.
- **Residual `color-contrast`** (demo labels in disabled state, exempt under WCAG 1.4.3): **Resolved**
  via `aria-disabled="true"` on the disabled demo row (axe exempts disabled controls).

Status: **0 violations** across 74 pages. The gate can now switch to **blocking** — remove
`AXE_BLOCKING: 'false'` from the `.github/workflows/axe.yml` workflow, consistent with the intent of ADR-007.
