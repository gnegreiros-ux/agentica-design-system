import { test, expect } from '@playwright/test';

// Tests on button.html — 16 real <agtc-button> instances present on the page

test.describe('agtc-button — functional', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button.html');
    await page.waitForLoadState('networkidle');
  });

  // --- Variants present ---

  test('all 4 variants are in the DOM', async ({ page }) => {
    for (const variant of ['primary', 'secondary', 'ghost', 'critical']) {
      await expect(page.locator(`agtc-button[variant="${variant}"]`).first()).toBeAttached();
    }
  });

  // --- disabled attribute ---

  test('disabled — attribute reflects onto the host', async ({ page }) => {
    const disabledBtn = page.locator('agtc-button[variant="primary"][disabled]').first();
    await expect(disabledBtn).toBeAttached();
    await expect(disabledBtn).toHaveAttribute('disabled');
  });

  test('disabled — the inner button is not clickable', async ({ page }) => {
    const disabledBtn = page.locator('agtc-button[variant="primary"][disabled]').first();
    // Playwright refuses to click an element whose inner button is disabled
    // Verify via JS that the state is correct
    const isDisabled = await disabledBtn.evaluate((el) => {
      const btn = el.shadowRoot?.querySelector('button');
      return btn ? btn.disabled : false;
    });
    expect(isDisabled).toBe(true);
  });

  // --- Critical variant ---

  test('critical — present with no confirmation pattern by default', async ({ page }) => {
    const criticalBtn = page.locator('agtc-button[variant="critical"]').first();
    await expect(criticalBtn).toBeAttached();
    // The critical variant must not have the confirming state by default
    const isConfirming = await criticalBtn.evaluate((el) =>
      el.hasAttribute('confirming') || el.classList.contains('confirming')
    );
    expect(isConfirming).toBe(false);
  });

  // --- icon-only: accessible label mandatory ---

  test('icon-only — has an accessible label', async ({ page }) => {
    const iconOnlyBtns = page.locator('agtc-button[icon-only]');
    const count = await iconOnlyBtns.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = iconOnlyBtns.nth(i);
      const label = await btn.getAttribute('label');
      expect(label, `agtc-button[icon-only] #${i} must have a label`).toBeTruthy();
    }
  });

  // --- Focus visible in the shadow DOM ---

  test('primary — focus-visible accessible via keyboard', async ({ page }) => {
    const btn = page.locator('agtc-button[variant="primary"]').first();
    // Trigger focus via Tab
    await btn.evaluate((el) => el.shadowRoot?.querySelector('button')?.focus());
    // The inner shadow element must be focusable (no tabindex=-1)
    const tabIndex = await btn.evaluate((el) => {
      const inner = el.shadowRoot?.querySelector('button');
      return inner ? inner.tabIndex : -1;
    });
    expect(tabIndex).toBeGreaterThanOrEqual(0);
  });

  // --- Clicking primary triggers an event ---

  test('primary — click triggers a click event', async ({ page }) => {
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
