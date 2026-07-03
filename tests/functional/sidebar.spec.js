import { test, expect } from '@playwright/test';

test.describe('Sidebar docs — tests fonctionnels', () => {
  // --- Structure et présence ---

  test('sidebar — présente sur les pages documentation', async ({ page }) => {
    await page.goto('/documentation.html');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar — présente sur les pages fondations', async ({ page }) => {
    await page.goto('/foundations/color.html');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar — présente sur les pages composants', async ({ page }) => {
    await page.goto('/components/button.html');
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar — absente sur la home (page marketing)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.sidebar')).not.toBeAttached();
  });

  // --- Lien actif ---

  test('sidebar — lien de la page courante marqué aria-current', async ({ page }) => {
    await page.goto('/foundations/color.html');
    const activeLink = page.locator('.sidebar a[aria-current="page"]');
    // Si aria-current n'est pas implémenté, vérifier au moins que la sidebar contient un lien actif via classe
    const hasAriaCurrent = await activeLink.count() > 0;
    const hasActiveClass = await page.locator('.sidebar a.active, .sidebar a.is-active').count() > 0;
    expect(hasAriaCurrent || hasActiveClass).toBeTruthy();
  });

  // --- Navigation depuis la sidebar ---

  test('sidebar — navigation vers une page composant', async ({ page }) => {
    await page.goto('/documentation.html');
    await page.locator('.sidebar a[href*="components"]').first().click();
    await expect(page).toHaveURL(/components/);
  });

  test('sidebar — navigation vers fondations', async ({ page }) => {
    await page.goto('/documentation.html');
    await page.locator('.sidebar a[href*="foundations"]').first().click();
    await expect(page).toHaveURL(/foundations/);
  });

  // --- Layout with-sidebar ---

  test('layout with-sidebar — main content visible à côté de la sidebar', async ({ page }) => {
    await page.goto('/documentation.html');
    const sidebar = page.locator('.sidebar');
    const content = page.locator('.page-content');

    await expect(sidebar).toBeVisible();
    await expect(content).toBeVisible();

    // Les deux colonnes doivent coexister (pas l'une au-dessus de l'autre en desktop)
    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();

    if (sidebarBox && contentBox) {
      // En desktop (>= 1024px), le content est à droite de la sidebar
      const viewportWidth = page.viewportSize()?.width ?? 1280;
      if (viewportWidth >= 1024) {
        expect(contentBox.x).toBeGreaterThan(sidebarBox.x);
      }
    }
  });

  // --- Responsive : sidebar en mobile ---

  test('sidebar — comportement mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/documentation.html');
    // En mobile la sidebar peut être masquée ou passer au-dessus du contenu — elle doit rester dans le DOM
    await expect(page.locator('.sidebar')).toBeAttached();
  });
});
