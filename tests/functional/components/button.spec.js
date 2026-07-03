import { test, expect } from '@playwright/test';

// Tests sur button.html — 16 vraies instances <agtc-button> présentes sur la page

test.describe('agtc-button — fonctionnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button.html');
    await page.waitForLoadState('networkidle');
  });

  // --- Variants présentes ---

  test('les 4 variantes sont dans le DOM', async ({ page }) => {
    for (const variant of ['primary', 'secondary', 'ghost', 'critical']) {
      await expect(page.locator(`agtc-button[variant="${variant}"]`).first()).toBeAttached();
    }
  });

  // --- Attribut disabled ---

  test('disabled — attribut reflect sur le host', async ({ page }) => {
    const disabledBtn = page.locator('agtc-button[variant="primary"][disabled]').first();
    await expect(disabledBtn).toBeAttached();
    await expect(disabledBtn).toHaveAttribute('disabled');
  });

  test('disabled — le bouton interne n\'est pas cliquable', async ({ page }) => {
    const disabledBtn = page.locator('agtc-button[variant="primary"][disabled]').first();
    // Playwright refuse de cliquer un élément dont le bouton interne est disabled
    // On vérifie via JS que l'état est correct
    const isDisabled = await disabledBtn.evaluate((el) => {
      const btn = el.shadowRoot?.querySelector('button');
      return btn ? btn.disabled : false;
    });
    expect(isDisabled).toBe(true);
  });

  // --- Variant critical ---

  test('critical — présent sans pattern de confirmation par défaut', async ({ page }) => {
    const criticalBtn = page.locator('agtc-button[variant="critical"]').first();
    await expect(criticalBtn).toBeAttached();
    // La variante critical ne doit pas avoir l'état confirming par défaut
    const isConfirming = await criticalBtn.evaluate((el) =>
      el.hasAttribute('confirming') || el.classList.contains('confirming')
    );
    expect(isConfirming).toBe(false);
  });

  // --- icon-only : label accessible obligatoire ---

  test('icon-only — a un label accessible', async ({ page }) => {
    const iconOnlyBtns = page.locator('agtc-button[icon-only]');
    const count = await iconOnlyBtns.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = iconOnlyBtns.nth(i);
      const label = await btn.getAttribute('label');
      expect(label, `agtc-button[icon-only] #${i} doit avoir un label`).toBeTruthy();
    }
  });

  // --- Focus visible dans le shadow DOM ---

  test('primary — focus-visible accessible au clavier', async ({ page }) => {
    const btn = page.locator('agtc-button[variant="primary"]').first();
    // Déclenche le focus via Tab
    await btn.evaluate((el) => el.shadowRoot?.querySelector('button')?.focus());
    // L'élément shadow interne doit être focusable (pas de tabindex=-1)
    const tabIndex = await btn.evaluate((el) => {
      const inner = el.shadowRoot?.querySelector('button');
      return inner ? inner.tabIndex : -1;
    });
    expect(tabIndex).toBeGreaterThanOrEqual(0);
  });

  // --- Clic sur primary déclenche un événement ---

  test('primary — clic déclenche un événement click', async ({ page }) => {
    const btn = page.locator('agtc-button[variant="primary"]').first();
    let clicked = false;
    await page.exposeFunction('onBtnClick', () => { clicked = true; });
    await btn.evaluate((el) =>
      el.addEventListener('click', () => window.onBtnClick())
    );
    await btn.click();
    await page.waitForTimeout(100);
    expect(clicked).toBe(true);
  });
});
