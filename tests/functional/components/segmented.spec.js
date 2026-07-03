import { test, expect } from '@playwright/test';

// Tests sur segmented.html — 2 vraies instances <agtc-segmented> présentes

test.describe('agtc-segmented — fonctionnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/segmented.html');
    await page.waitForLoadState('networkidle');
  });

  // --- Rendu ---

  test('les instances sont dans le DOM', async ({ page }) => {
    await expect(page.locator('agtc-segmented').first()).toBeAttached();
  });

  test('les options sont rendues comme boutons dans le shadow DOM', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    const buttonCount = await seg.evaluate((el) =>
      el.shadowRoot?.querySelectorAll('button').length ?? 0
    );
    expect(buttonCount).toBeGreaterThan(1);
  });

  // --- Valeur initiale ---

  test('la valeur initiale est reflétée sur le host', async ({ page }) => {
    const value = await page.locator('agtc-segmented').first().getAttribute('value');
    expect(value).toBeTruthy();
  });

  test('l\'option initiale a aria-current ou aria-pressed', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    const currentBtn = await seg.evaluate((el) => {
      const btns = el.shadowRoot?.querySelectorAll('button') ?? [];
      for (const btn of btns) {
        if (btn.getAttribute('aria-current') === 'true' ||
            btn.getAttribute('aria-pressed') === 'true') {
          return btn.textContent?.trim();
        }
      }
      return null;
    });
    expect(currentBtn).toBeTruthy();
  });

  // --- Sélection ---

  test('cliquer une option change la valeur (propriété JS)', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    // .value est une propriété Lit (reflect:false) — lire via evaluate(), pas getAttribute()
    const initialValue = await seg.evaluate((el) => el.value);

    await seg.evaluate((el) => {
      const btns = el.shadowRoot?.querySelectorAll('button') ?? [];
      btns[1]?.click();
    });

    await page.waitForTimeout(100);
    const newValue = await seg.evaluate((el) => el.value);
    expect(newValue).not.toBe(initialValue);
  });

  test('cliquer une option émet un événement change', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    let eventFired = false;

    await page.exposeFunction('onSegChange', () => { eventFired = true; });
    // Le composant émet 'change' (CustomEvent natif), pas 'agtc-change'
    await seg.evaluate((el) =>
      el.addEventListener('change', () => window.onSegChange())
    );

    await seg.evaluate((el) => {
      const btns = el.shadowRoot?.querySelectorAll('button') ?? [];
      btns[1]?.click();
    });

    await page.waitForTimeout(100);
    expect(eventFired).toBe(true);
  });

  // --- Keyboard nav ---

  test('keyboard — focus sur le premier bouton', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    await seg.evaluate((el) => {
      el.shadowRoot?.querySelector('button')?.focus();
    });

    const isFocused = await seg.evaluate((el) =>
      el.shadowRoot?.activeElement?.tagName === 'BUTTON'
    );
    expect(isFocused).toBe(true);
  });
});
