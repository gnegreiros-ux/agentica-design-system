// C5-06 — the generator submits to Rule 1 like any other component: a
// documentation-site generator that produces an inaccessible site would ruin
// the decoupling story's argument in a single screenshot. Reuses the same
// AxeBuilder harness as tests/functional/accessibility.spec.js and
// governance-accessibility.spec.js.
//
// Served in isolation from the production build, on its own port (see
// playwright.config.js's third webServer entry) — the fixture's manifest and
// content live under tests/functional/fixtures/doc-generator/, generated fresh
// before serving, never copied into site/dist. Unlike the production site and
// the C2-01/02/03 fixtures, this generator's output has no light/dark theme —
// templates.mjs emits no CSS or data-theme attribute at all — so there is only
// one pass here, not a light+dark pair.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const FIXTURE_BASE_URL = 'http://localhost:8082';

const PAGES = [
  { path: '/index.html', label: 'index' },
  { path: '/governance.html', label: 'governance' },
];

test.describe('C5-06 — doc-generator output passes WCAG 2.2 AA', () => {
  for (const { path, label } of PAGES) {
    test(`${label} — 0 critical/serious violations`, async ({ page }) => {
      await page.goto(`${FIXTURE_BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

      if (blocking.length > 0) {
        const msg = blocking
          .map((v) => `[${v.impact}] ${v.id} — ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`)
          .join('\n\n');
        expect.soft(blocking, `a11y violations on ${path}:\n${msg}`).toHaveLength(0);
      }

      expect(blocking).toHaveLength(0);
    });
  }
});
