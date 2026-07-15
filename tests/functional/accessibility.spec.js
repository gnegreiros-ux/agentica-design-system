import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// axe-core integration in Playwright (ADR-007 + ADR-066).
// Replaces the axe.yml workflow (deprecated) — a11y violations now appear
// in the Playwright HTML report alongside the visual and functional tests.
// Scope: critical pages (home, docs, components) in light + dark.
// The full audit (every page × 3 contexts → axe-report.json) remains in
// scripts/axe-audit.js for manual burn-down sessions.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const PAGES = [
  { path: '/',                           label: 'home' },
  { path: '/documentation.html',         label: 'documentation' },
  { path: '/foundations/color.html',     label: 'color' },
  { path: '/foundations/typography.html',label: 'typography' },
  { path: '/foundations/spacing.html',   label: 'spacing' },
  { path: '/components/button.html',     label: 'button' },
  { path: '/components/badge.html',      label: 'badge' },
  { path: '/components/input.html',      label: 'input' },
  { path: '/components/tabs.html',       label: 'tabs' },
  { path: '/components/toggle.html',     label: 'toggle' },
];

function buildAxe(page) {
  return new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    // Logo and hero-name: logotypes/brand marks, exempt from the WCAG 1.4.3 ratio
    .exclude('.logo')
    .exclude('.hero-name');
}

test.describe('WCAG AA accessibility — light', () => {
  for (const { path, label } of PAGES) {
    test(`${label} — 0 critical/serious violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await buildAxe(page).analyze();
      const blocking = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      );

      if (blocking.length > 0) {
        const msg = blocking.map(v =>
          `[${v.impact}] ${v.id} — ${v.help}\n  ${v.nodes.slice(0,3).map(n => n.target.join(' ')).join('\n  ')}`
        ).join('\n\n');
        expect.soft(blocking, `a11y violations on ${path}:\n${msg}`).toHaveLength(0);
      }

      expect(blocking).toHaveLength(0);
    });
  }
});

test.describe('WCAG AA accessibility — dark', () => {
  test.use({
    // Inject the dark theme before the page loads
    storageState: undefined,
  });

  for (const { path, label } of PAGES) {
    test(`${label} dark — 0 critical/serious violations`, async ({ page }) => {
      await page.addInitScript(() => {
        try { localStorage.setItem('agtc-theme', 'dark'); } catch (_) {}
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await buildAxe(page).analyze();
      const blocking = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      );

      if (blocking.length > 0) {
        const msg = blocking.map(v =>
          `[${v.impact}] ${v.id} — ${v.help}\n  ${v.nodes.slice(0,3).map(n => n.target.join(' ')).join('\n  ')}`
        ).join('\n\n');
        expect.soft(blocking, `a11y violations on ${path} (dark):\n${msg}`).toHaveLength(0);
      }

      expect(blocking).toHaveLength(0);
    });
  }
});
