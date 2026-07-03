import { test, expect } from '@playwright/test';

// tabs.html n'a pas d'instance <agtc-tabs> dans le HTML statique.
// Le composant est enregistré via agtc.js — on l'injecte via evaluate().

test.describe('agtc-tabs — fonctionnel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tabs.html');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const fixture = document.createElement('div');
      fixture.id = 'tabs-fixture';
      fixture.style.cssText = 'padding:24px;';
      document.body.appendChild(fixture);

      const tabs = document.createElement('agtc-tabs');
      tabs.label = 'Test tabs';
      tabs.selected = 'overview';

      // Le contenu est rendu via slots nommés (slot="<value>"), pas via la propriété panel
      ['overview', 'usage', 'tokens'].forEach((val) => {
        const p = document.createElement('p');
        p.setAttribute('slot', val);
        p.textContent = `Contenu ${val}`;
        tabs.appendChild(p);
      });

      fixture.appendChild(tabs);

      tabs.tabs = [
        { value: 'overview', label: "Vue d'ensemble" },
        { value: 'usage',    label: 'Usage' },
        { value: 'tokens',   label: 'Tokens' },
      ];
    });

    await page.waitForFunction(() => {
      const el = document.querySelector('#tabs-fixture agtc-tabs');
      return el && el.shadowRoot !== null;
    });
    await page.waitForTimeout(150);
  });

  // --- Structure ARIA ---

  test('role="tablist" présent dans le shadow DOM', async ({ page }) => {
    const hasTablist = await page.locator('#tabs-fixture agtc-tabs').evaluate((el) =>
      el.shadowRoot?.querySelector('[role="tablist"]') !== null
    );
    expect(hasTablist).toBe(true);
  });

  test('3 onglets avec role="tab"', async ({ page }) => {
    const count = await page.locator('#tabs-fixture agtc-tabs').evaluate((el) =>
      el.shadowRoot?.querySelectorAll('[role="tab"]').length ?? 0
    );
    expect(count).toBe(3);
  });

  test('l\'onglet sélectionné a aria-selected="true"', async ({ page }) => {
    const selectedTab = await page.locator('#tabs-fixture agtc-tabs').evaluate((el) => {
      const tab = el.shadowRoot?.querySelector('[role="tab"][aria-selected="true"]');
      return tab?.textContent?.trim() ?? null;
    });
    expect(selectedTab).toBeTruthy();
  });

  // --- Switching ---

  test('clic sur le 2e onglet met à jour aria-selected', async ({ page }) => {
    const tabs = page.locator('#tabs-fixture agtc-tabs');

    await tabs.evaluate((el) => {
      const tabEls = el.shadowRoot?.querySelectorAll('[role="tab"]') ?? [];
      tabEls[1]?.click();
    });
    await page.waitForTimeout(100);

    const selectedIndex = await tabs.evaluate((el) => {
      const tabEls = Array.from(el.shadowRoot?.querySelectorAll('[role="tab"]') ?? []);
      return tabEls.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    });
    expect(selectedIndex).toBe(1);
  });

  test('clic sur le 2e onglet rend le panel usage visible', async ({ page }) => {
    await page.locator('#tabs-fixture agtc-tabs').evaluate((el) => {
      const tabEls = el.shadowRoot?.querySelectorAll('[role="tab"]') ?? [];
      tabEls[1]?.click();
    });
    await page.waitForTimeout(100);

    // Le panel usage ne doit pas avoir l'attribut [hidden] (contenu via slot light DOM)
    const panelHidden = await page.evaluate(() => {
      const tabs = document.querySelector('#tabs-fixture agtc-tabs');
      const panel = tabs?.shadowRoot?.querySelector('#panel-usage');
      return panel?.hasAttribute('hidden') ?? true;
    });
    expect(panelHidden).toBe(false);
  });

  // --- Keyboard ---

  test('ArrowRight déplace le focus vers l\'onglet suivant', async ({ page }) => {
    const tabs = page.locator('#tabs-fixture agtc-tabs');

    await tabs.evaluate((el) => {
      el.shadowRoot?.querySelector('[role="tab"]')?.focus();
    });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);

    const focusedIndex = await tabs.evaluate((el) => {
      const tabEls = Array.from(el.shadowRoot?.querySelectorAll('[role="tab"]') ?? []);
      return tabEls.findIndex((t) => t === el.shadowRoot?.activeElement);
    });
    expect(focusedIndex).toBe(1);
  });
});
