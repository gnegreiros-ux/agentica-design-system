import { test, expect } from '@playwright/test';

test.describe('Home — régressions visuelles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Attendre que les illustrations lazy soient potentiellement visibles
    await page.waitForLoadState('networkidle');
  });

  test('light mode — pleine page', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await expect(page).toHaveScreenshot('home-light.png', { fullPage: true });
  });

  test('dark mode — pleine page', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page).toHaveScreenshot('home-dark.png', { fullPage: true });
  });

  test('hero above-the-fold — light', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('home-hero-light.png', {
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  });

  test('hero above-the-fold — dark', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page).toHaveScreenshot('home-hero-dark.png', {
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  });

  test('mobile 375px — light', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page).toHaveScreenshot('home-mobile-light.png', { fullPage: true });
  });
});
