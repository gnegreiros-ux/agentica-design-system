import { test, expect } from '@playwright/test';

// Tests on segmented.html — 2 real <agtc-segmented> instances present

test.describe('agtc-segmented — functional', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/segmented.html');
    await page.waitForLoadState('networkidle');
  });

  // --- Rendering ---

  test('instances are in the DOM', async ({ page }) => {
    await expect(page.locator('agtc-segmented').first()).toBeAttached();
  });

  test('options are rendered as buttons in the shadow DOM', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    const buttonCount = await seg.evaluate((el) =>
      el.shadowRoot?.querySelectorAll('button').length ?? 0
    );
    expect(buttonCount).toBeGreaterThan(1);
  });

  // --- Initial value ---

  test('the initial value is reflected on the host', async ({ page }) => {
    const value = await page.locator('agtc-segmented').first().getAttribute('value');
    expect(value).toBeTruthy();
  });

  test('the initial option has aria-current or aria-pressed', async ({ page }) => {
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

  // --- Selection ---

  test('clicking an option changes the value (JS property)', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    // .value is a Lit property (reflect:false) — read via evaluate(), not getAttribute()
    const initialValue = await seg.evaluate((el) => el.value);

    await seg.evaluate((el) => {
      const btns = el.shadowRoot?.querySelectorAll('button') ?? [];
      btns[1]?.click();
    });

    await page.waitForTimeout(100);
    const newValue = await seg.evaluate((el) => el.value);
    expect(newValue).not.toBe(initialValue);
  });

  test('clicking an option emits a change event', async ({ page }) => {
    const seg = page.locator('agtc-segmented').first();
    let eventFired = false;

    await page.exposeFunction('onSegChange', () => { eventFired = true; });
    // The component emits 'change' (native CustomEvent), not 'agtc-change'
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

  test('keyboard — focus on the first button', async ({ page }) => {
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
