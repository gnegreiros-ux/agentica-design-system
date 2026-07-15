import { test, expect } from '@playwright/test';

test.describe('Navigation — functional tests', () => {
  // --- Mega menu (docs-panel) ---
  // Tested on /documentation.html: the home page hides some header elements (data-page="home")

  test.describe('docs-panel', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/documentation.html');
      await page.waitForLoadState('networkidle');
    });

    test('closed by default', async ({ page }) => {
      // The panel uses the is-open CSS class, not the hidden attribute, for the open state
      await expect(page.locator('[data-docs-panel]')).not.toHaveClass(/is-open/);
    });

    test('opens on hover of docs-trigger', async ({ page }) => {
      // The trigger opens via mouseenter (UX hover), not via click
      // click → closeDocs() (navigation to documentation.html)
      const trigger = page.locator('[data-docs-trigger]');
      const panel = page.locator('[data-docs-panel]');

      await trigger.hover();
      await page.waitForTimeout(100); // rAF + CSS transition

      await expect(panel).toHaveClass(/is-open/);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('closes on click outside the panel', async ({ page }) => {
      // The trigger opens via mouseenter, closes only via outside click or Escape
      const trigger = page.locator('[data-docs-trigger]');
      const panel = page.locator('[data-docs-panel]');

      await trigger.hover();
      await expect(panel).toHaveClass(/is-open/);

      // Click outside the panel (top-left corner of the page)
      await page.mouse.click(10, 10);
      await expect(panel).not.toHaveClass(/is-open/);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('closes with Escape', async ({ page }) => {
      const trigger = page.locator('[data-docs-trigger]');
      const panel = page.locator('[data-docs-panel]');

      await trigger.hover();
      await page.waitForTimeout(100); // rAF + transition
      await expect(panel).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');
      await expect(panel).not.toHaveClass(/is-open/);
    });
  });

  // --- Mobile menu ---

  test.describe('mobile menu', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('button present in the DOM on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(page.locator('[data-menu-toggle]')).toBeAttached();
    });

    test('opens on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('[data-menu-toggle]')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('[data-main-nav]')).toBeVisible();
    });

    test('closes on second click (mobile)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      const btn = page.locator('[data-menu-toggle]');

      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'true');

      await btn.click();
      await expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // --- Theme toggle ---
  // The home page hides the theme-toggle via [data-page="home"] .theme-toggle { display:none }
  // → tests on documentation.html

  test.describe('theme toggle', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/documentation.html');
      await page.waitForLoadState('networkidle');
    });

    test('switches from dark to light', async ({ page }) => {
      await page.evaluate(() =>
        document.documentElement.setAttribute('data-theme', 'dark')
      );
      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('switches from light to dark', async ({ page }) => {
      await page.evaluate(() =>
        document.documentElement.setAttribute('data-theme', 'light')
      );
      await page.locator('[data-theme-toggle]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('persists in localStorage', async ({ page }) => {
      await page.locator('[data-theme-toggle]').click();
      const stored = await page.evaluate(() => localStorage.getItem('agtc-theme'));
      expect(['light', 'dark']).toContain(stored);
    });
  });

  // --- Back-to-top button ---

  test.describe('back-to-top', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('does not have the is-visible class at the top of the page', async ({ page }) => {
      // The JS handles visibility via .is-visible (threshold = innerHeight)
      const btn = page.locator('[data-back-to-top]');
      await expect(btn).not.toHaveClass(/is-visible/);
    });

    test('gets the is-visible class after scrolling (> innerHeight)', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight + 50));
      await page.waitForTimeout(400);
      await expect(page.locator('[data-back-to-top]')).toHaveClass(/is-visible/);
    });
  });
});
