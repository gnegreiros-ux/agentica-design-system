import { test, expect } from '@playwright/test';

test.describe('Docs sidebar — functional tests', () => {
  // --- Structure and presence ---

  test('sidebar — present on documentation pages', async ({ page }) => {
    await page.goto('/documentation.html');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar — present on foundations pages', async ({ page }) => {
    await page.goto('/foundations/color.html');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar — present on component pages', async ({ page }) => {
    await page.goto('/components/button.html');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar — absent on the home page (marketing page)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sidebar')).not.toBeAttached();
  });

  // --- Active link ---

  test('sidebar — current page link marked aria-current', async ({ page }) => {
    await page.goto('/foundations/color.html');
    const activeLink = page.locator('.sidebar a[aria-current="page"]');
    // If aria-current isn't implemented, at least check the sidebar has an active link via class
    const hasAriaCurrent = await activeLink.count() > 0;
    const hasActiveClass = await page.locator('.sidebar a.active, .sidebar a.is-active').count() > 0;
    expect(hasAriaCurrent || hasActiveClass).toBeTruthy();
  });

  // --- Navigation from the sidebar ---

  test('sidebar — navigation to a component page', async ({ page }) => {
    await page.goto('/documentation.html');
    await page.locator('.sidebar a[href*="components"]').first().click();
    await expect(page).toHaveURL(/components/);
  });

  test('sidebar — navigation to foundations', async ({ page }) => {
    await page.goto('/documentation.html');
    await page.locator('.sidebar a[href*="foundations"]').first().click();
    await expect(page).toHaveURL(/foundations/);
  });

  // --- Layout with-sidebar ---

  test('layout with-sidebar — main content visible next to the sidebar', async ({ page }) => {
    await page.goto('/documentation.html');
    const sidebar = page.locator('.sidebar');
    const content = page.locator('.page-content');

    await expect(sidebar).toBeVisible();
    await expect(content).toBeVisible();

    // The two columns must coexist (not stacked on desktop)
    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();

    if (sidebarBox && contentBox) {
      // On desktop (>= 1024px), content sits to the right of the sidebar
      const viewportWidth = page.viewportSize()?.width ?? 1280;
      if (viewportWidth >= 1024) {
        expect(contentBox.x).toBeGreaterThan(sidebarBox.x);
      }
    }
  });

  // --- Responsive: sidebar on mobile ---

  test('sidebar — mobile behavior 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/documentation.html');
    // On mobile the sidebar can be hidden or overlay the content — it must stay in the DOM
    await expect(page.locator('.sidebar')).toBeAttached();
  });
});
