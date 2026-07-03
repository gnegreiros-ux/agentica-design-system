import { test, expect } from '@playwright/test';

// toggle.html n'a pas d'instance <agtc-toggle> dans le HTML statique.
// Le composant est chargé via agtc.js — on l'injecte via evaluate().

test.describe('agtc-toggle — fonctionnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/toggle.html');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'toggle-fixture';
      fixture.style.cssText = 'padding:24px;display:flex;flex-direction:column;gap:16px;';
      document.body.appendChild(fixture);

      const t1 = document.createElement('agtc-toggle');
      t1.id = 'toggle-off';
      t1.label = 'Mode sombre';
      t1.name = 'dark-mode';

      const t2 = document.createElement('agtc-toggle');
      t2.id = 'toggle-on';
      t2.label = 'Notifications';
      t2.name = 'notifs';
      t2.checked = true;

      const t3 = document.createElement('agtc-toggle');
      t3.id = 'toggle-disabled';
      t3.label = 'Synchronisation';
      t3.name = 'sync';
      t3.disabled = true;

      fixture.append(t1, t2, t3);
    });

    await page.waitForFunction(() =>
      document.querySelector('#toggle-off')?.shadowRoot !== null
    );
    await page.waitForTimeout(100);
  });

  // --- État initial ---

  test('toggle off — checked est false par défaut', async ({ page }) => {
    const checked = await page.locator('#toggle-off').evaluate((el) => el.checked);
    expect(checked).toBe(false);
  });

  test('toggle on — checked est true', async ({ page }) => {
    const checked = await page.locator('#toggle-on').evaluate((el) => el.checked);
    expect(checked).toBe(true);
  });

  // --- Interaction ---

  test('clic bascule checked de false à true', async ({ page }) => {
    await page.locator('#toggle-off').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    const checked = await page.locator('#toggle-off').evaluate((el) => el.checked);
    expect(checked).toBe(true);
  });

  test('clic bascule checked de true à false', async ({ page }) => {
    await page.locator('#toggle-on').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    const checked = await page.locator('#toggle-on').evaluate((el) => el.checked);
    expect(checked).toBe(false);
  });

  test('clic émet un événement agtc-change', async ({ page }) => {
    let eventValue = null;
    await page.exposeFunction('onToggleChange', (val) => { eventValue = val; });
    await page.locator('#toggle-off').evaluate((el) =>
      el.addEventListener('agtc-change', (e) => window.onToggleChange(e.detail?.checked))
    );
    await page.locator('#toggle-off').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    expect(eventValue).toBe(true);
  });

  // --- État disabled ---

  test('disabled — le composant a l\'attribut disabled', async ({ page }) => {
    await expect(page.locator('#toggle-disabled')).toHaveAttribute('disabled');
  });

  test('disabled — le input interne est disabled', async ({ page }) => {
    const inputDisabled = await page.locator('#toggle-disabled').evaluate((el) => {
      const input = el.shadowRoot?.querySelector('input');
      return input?.disabled ?? false;
    });
    expect(inputDisabled).toBe(true);
  });

  test('disabled — clic ne change pas l\'état', async ({ page }) => {
    await page.locator('#toggle-disabled').evaluate((el) => {
      el.shadowRoot?.querySelector('input')?.click();
    });
    await page.waitForTimeout(100);
    const checked = await page.locator('#toggle-disabled').evaluate((el) => el.checked);
    expect(checked).toBe(false);
  });

  // --- Accessibilité ---

  test('le input interne est de type checkbox ou role switch', async ({ page }) => {
    const role = await page.locator('#toggle-off').evaluate((el) => {
      const input = el.shadowRoot?.querySelector('input');
      return input?.getAttribute('role') ?? input?.type;
    });
    expect(['switch', 'checkbox']).toContain(role);
  });

  test('un label est associé à l\'input', async ({ page }) => {
    const hasLabel = await page.locator('#toggle-off').evaluate((el) => {
      const label = el.shadowRoot?.querySelector('label');
      const input = el.shadowRoot?.querySelector('input');
      return label !== null || input?.getAttribute('aria-label') !== null;
    });
    expect(hasLabel).toBe(true);
  });
});
