import { test, expect } from '@playwright/test';

test.describe('Navigation — tests fonctionnels', () => {
  // --- Mega menu (docs-panel) ---
  // Testé sur /documentation.html : la home masque certains éléments du header (data-page="home")

  test.describe('docs-panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/documentation.html');
      await page.waitForLoadState('networkidle');
    });

    test('fermé par défaut', async ({ page }) => {
      // Le panel utilise la classe CSS is-open, pas l'attribut hidden, pour l'état ouvert
      await expect(page.locator('[data-docs-panel]')).not.toHaveClass(/is-open/);
    });

    test('s\'ouvre au survol du docs-trigger', async ({ page }) => {
      // Le trigger ouvre via mouseenter (UX hover), pas via click
      // click → closeDocs() (navigation vers documentation.html)
      const trigger = page.locator('[data-docs-trigger]');
      const panel = page.locator('[data-docs-panel]');

      await trigger.hover();
      await page.waitForTimeout(100); // rAF + transition CSS

      await expect(panel).toHaveClass(/is-open/);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('se ferme au clic en dehors du panel', async ({ page }) => {
      // Le trigger ouvre via mouseenter, ferme uniquement via clic extérieur ou Escape
      const trigger = page.locator('[data-docs-trigger]');
      const panel = page.locator('[data-docs-panel]');

      await trigger.hover();
      await expect(panel).toHaveClass(/is-open/);

      // Clic en dehors du panel (coin haut-gauche de la page)
      await page.mouse.click(10, 10);
      await expect(panel).not.toHaveClass(/is-open/);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('se ferme avec Escape', async ({ page }) => {
      const trigger = page.locator('[data-docs-trigger]');
      const panel = page.locator('[data-docs-panel]');

      await trigger.hover();
      await page.waitForTimeout(100); // rAF + transition
      await expect(panel).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');
      await expect(panel).not.toHaveClass(/is-open/);
    });
  });

  // --- Menu mobile ---

  test.describe('menu mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('bouton présent dans le DOM en desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.locator('[data-menu-toggle]')).toBeAttached();
    });

    test('s\'ouvre sur mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('[data-main-nav]')).toBeVisible();
    });

    test('se ferme au second clic (mobile)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      const btn = page.locator('[data-menu-toggle]');

      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'true');

      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // --- Bascule de thème ---
  // La home masque le theme-toggle via [data-page="home"] .theme-toggle { display:none }
  // → tests sur documentation.html

  test.describe('theme toggle', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/documentation.html');
      await page.waitForLoadState('networkidle');
    });

    test('bascule de dark à light', async ({ page }) => {
      await page.evaluate(() =>
        document.documentElement.setAttribute('data-theme', 'dark')
      );
      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('bascule de light à dark', async ({ page }) => {
      await page.evaluate(() =>
        document.documentElement.setAttribute('data-theme', 'light')
      );
      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('persiste dans localStorage', async ({ page }) => {
      await page.locator('[data-theme-toggle]').click();
      const stored = await page.evaluate(() => localStorage.getItem('agtc-theme'));
      expect(['light', 'dark']).toContain(stored);
    });
  });

  // --- Bouton back-to-top ---

  test.describe('back-to-top', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('n\'a pas la classe is-visible en haut de page', async ({ page }) => {
      // Le JS gère la visibilité via .is-visible (seuil = innerHeight)
      const btn = page.locator('[data-back-to-top]');
      await expect(btn).not.toHaveClass(/is-visible/);
    });

    test('obtient la classe is-visible après scroll (> innerHeight)', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight + 50));
      await page.waitForTimeout(400);
      await expect(page.locator('[data-back-to-top]')).toHaveClass(/is-visible/);
    });
  });
});
