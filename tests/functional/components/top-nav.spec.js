import { test, expect } from '@playwright/test';

// agtc-top-nav active-link detection (issue 164). The guideline documents
// directory-style hrefs ('../tokens/'); _isActive() used to read 'tokens' as a
// file name, so no link was ever marked active with that form. The site itself
// passes 'section/index.html' hrefs, which must keep working too.
//
// Each case injects a fresh instance with an explicit `current`, so the result
// doesn't depend on the URL of the page hosting the fixture.

const DIR_ITEMS = [
  { label: 'Tokens',      href: '../tokens/' },
  { label: 'Components',  href: '../components/' },
  { label: 'Decisions',   href: '../decisions/' },
  { label: 'Get started', href: '../get-started.html', cta: true },
];

const SITE_ITEMS = [
  { label: 'Home',        href: '../index.html' },
  { label: 'Foundations', href: '../foundations/index.html' },
  { label: 'Get started', href: '../get-started.html', cta: true },
];

async function activeLabels(page, items, current) {
  return page.evaluate(async ({ items, current }) => {
    document.querySelector('#top-nav-fixture')?.remove();
    const fixture = document.createElement('div');
    fixture.id = 'top-nav-fixture';
    document.body.appendChild(fixture);
    const nav = document.createElement('agtc-top-nav');
    nav.items = items;
    nav.current = current;
    fixture.appendChild(nav);
    await nav.updateComplete;
    return [...nav.shadowRoot.querySelectorAll('a[aria-current="page"]')].map(a => a.textContent.trim());
  }, { items, current });
}

test.describe('agtc-top-nav — active link', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => !!customElements.get('agtc-top-nav'));
  });

  test('directory-style href is active on its section index', async ({ page }) => {
    expect(await activeLabels(page, DIR_ITEMS, '/tokens/')).toEqual(['Tokens']);
  });

  test('directory-style href is active on a page inside its section', async ({ page }) => {
    expect(await activeLabels(page, DIR_ITEMS, '/components/button.html')).toEqual(['Components']);
  });

  test('no link is active outside every known section', async ({ page }) => {
    expect(await activeLabels(page, DIR_ITEMS, '/unknown/')).toEqual([]);
  });

  test('file href (CTA) is active on its own page only', async ({ page }) => {
    expect(await activeLabels(page, DIR_ITEMS, '/get-started.html')).toEqual(['Get started']);
  });

  test('site convention (section/index.html) still works', async ({ page }) => {
    expect(await activeLabels(page, SITE_ITEMS, '/foundations/colors.html')).toEqual(['Foundations']);
    expect(await activeLabels(page, SITE_ITEMS, '/index.html')).toEqual(['Home']);
  });
});
