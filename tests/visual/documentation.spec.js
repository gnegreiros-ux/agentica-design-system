import { test, expect } from '@playwright/test';

test.describe('Documentation — visual regressions', () => {
  for (const theme of ['light', 'dark']) {
    test(`page documentation — ${theme}`, async ({ page }) => {
      await page.goto('/documentation.html');
      await page.waitForLoadState('networkidle');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page).toHaveScreenshot(`documentation-${theme}.png`, { fullPage: true });
    });

    test(`foundations/color — ${theme}`, async ({ page }) => {
      await page.goto('/foundations/color.html');
      await page.waitForLoadState('networkidle');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page).toHaveScreenshot(`foundations-color-${theme}.png`, { fullPage: true });
    });

    test(`foundations/typography — ${theme}`, async ({ page }) => {
      await page.goto('/foundations/typography.html');
      await page.waitForLoadState('networkidle');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page).toHaveScreenshot(`foundations-typography-${theme}.png`, { fullPage: true });
    });

    test(`foundations/spacing — ${theme}`, async ({ page }) => {
      await page.goto('/foundations/spacing.html');
      await page.waitForLoadState('networkidle');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await expect(page).toHaveScreenshot(`foundations-spacing-${theme}.png`, { fullPage: true });
    });
  }
});
