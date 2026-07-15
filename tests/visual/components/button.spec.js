import { test, expect } from '@playwright/test';

test.describe('Button component — visual regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button.html');
    await page.waitForLoadState('networkidle');
  });

  for (const theme of ['light', 'dark']) {
    test(`page button — ${theme}`, async ({ page }) => {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page).toHaveScreenshot(`button-page-${theme}.png`, { fullPage: true });
    });
  }
});
