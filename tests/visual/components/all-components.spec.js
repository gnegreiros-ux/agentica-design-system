import { test, expect } from '@playwright/test';

// Régressions visuelles de toutes les pages composants (sauf button.html, déjà couvert)
const PAGES = [
  'badge', 'banner', 'card', 'checkbox', 'code-block',
  'icon', 'input', 'link', 'radio', 'segmented',
  'table', 'tabs', 'toggle',
];

for (const name of PAGES) {
  test.describe(`${name} — régressions visuelles`, () => {
    for (const theme of ['light', 'dark']) {
      test(`page ${name} — ${theme}`, async ({ page }) => {
        await page.goto(`/components/${name}.html`);
        await page.waitForLoadState('networkidle');
        await page.evaluate((t) =>
          document.documentElement.setAttribute('data-theme', t), theme
        );
        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { fullPage: true });
      });
    }
  });
}
