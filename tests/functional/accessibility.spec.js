import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Intégration axe-core dans Playwright (ADR-007 + ADR-066).
// Remplace le workflow axe.yml (déprécié) — les violations a11y apparaissent
// désormais dans le rapport HTML Playwright avec les tests visuels et fonctionnels.
// Périmètre : pages critiques (home, doc, composants) en light + dark.
// L'audit complet (toutes pages × 3 contextes → axe-report.json) reste dans
// scripts/axe-audit.js pour les sessions de burn-down manuelles.

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
    // Logo et hero-name : logotypes/marques, exonérés du ratio WCAG 1.4.3
    .exclude('.logo')
    .exclude('.hero-name');
}

test.describe('Accessibilité WCAG AA — light', () => {
  for (const { path, label } of PAGES) {
    test(`${label} — 0 violation critique/serious`, async ({ page }) => {
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
        expect.soft(blocking, `Violations a11y sur ${path}:\n${msg}`).toHaveLength(0);
      }

      expect(blocking).toHaveLength(0);
    });
  }
});

test.describe('Accessibilité WCAG AA — dark', () => {
  test.use({
    // Injecte le thème sombre avant le chargement de la page
    storageState: undefined,
  });

  for (const { path, label } of PAGES) {
    test(`${label} dark — 0 violation critique/serious`, async ({ page }) => {
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
        expect.soft(blocking, `Violations a11y sur ${path} (dark):\n${msg}`).toHaveLength(0);
      }

      expect(blocking).toHaveLength(0);
    });
  }
});
