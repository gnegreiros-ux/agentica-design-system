# Testing — Guide for consuming teams

> This guide is for **product teams** who consume the Agentica design system
> and want to test their final product.
>
> For testing the design system itself, see `How-to-devs.md`.

---

## The two scopes (ADR-066)

The design system distinguishes two separate responsibilities:

| Scope | Owner | Repo | Tool |
|-----------|-------------|-------|-------|
| DS tests | DS team | `agentica-design-system` | Playwright (internal CI) |
| Product tests | Your team | Your repo | Playwright (your CI) |

The DS cannot test your product on your behalf — it doesn't know your context,
your pages, or your visual decisions. It provides you with a kit to get started.

---

## Minimal setup in 3 steps

### 1. Install Playwright in your project

```bash
npm init playwright@latest
# → Choose JavaScript, tests/ folder, add GitHub Actions
```

### 2. Configure the base URL

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000', // your dev port
    reducedMotion: 'reduce',          // deterministic screenshots
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Load DS tokens in your tests

`agtc-*` components require the CSS tokens to render correctly.
If your app already loads `agtc.js` and `tokens.css`, there's nothing else to do.

---

## Recommended test patterns

### Basic visual test (light + dark)

```js
import { test, expect } from '@playwright/test';

test.describe('My product page', () => {
  for (const theme of ['light', 'dark']) {
    test(`${theme} render`, async ({ page }) => {
      await page.goto('/my-page');
      await page.evaluate((t) =>
        document.documentElement.setAttribute('data-theme', t), theme
      );
      await expect(page).toHaveScreenshot(`my-page-${theme}.png`, { fullPage: true });
    });
  }
});
```

### Verify a DS component renders correctly

```js
import { test, expect } from '@playwright/test';

test('agtc-button — variants visible', async ({ page }) => {
  await page.goto('/my-page-with-button');
  const btn = page.locator('agtc-button[variant="primary"]');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveScreenshot('btn-primary.png');
});
```

### Test the behavior of an interactive DS component

```js
test('agtc-top-nav — mobile menu opens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.locator('.menu-btn').click();
  await expect(page.locator('.site-nav')).toBeVisible();
});
```

### axe-core integration (accessibility)

```bash
npm install -D @axe-core/playwright
```

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('my page — 0 WCAG violations', async ({ page }) => {
  await page.goto('/my-page');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

## Handling DS updates

When you bump the DS version in your `package.json`, some components may
have changed visually (redesign, contrast fix, new token).

**Recommended process after a DS upgrade:**

```bash
# 1. Update the DS
npm install @agentica-ds/tokens@latest @agentica-ds/components@latest

# 2. Run your visual tests
npx playwright test

# 3. If diffs appear:
#    - Check the DS CHANGELOG
#    - Compare the visual diff: intentional or regression?
#    - If intentional → update your snapshots
npx playwright test --update-snapshots

# 4. Commit the new snapshots with a note in your PR
```

---

## Where to find documentation of testable behaviors

Each `agtc-*` component documents its expected behaviors in `guidelines/components/`:

| Component | Guideline |
|-----------|-----------|
| `agtc-button` | `guidelines/components/button.md` |
| `agtc-top-nav` | `guidelines/components/top-nav.md` |
| `agtc-card` | `guidelines/components/card.md` |
| … | `guidelines/components/` |

These guidelines describe states, variants and accessibility — these are the behaviors
your tests should cover if you use these components.

---

## Governance rules

```
✅ Your snapshots live in your repo — not in the DS repo
✅ You own your tests and your baselines
✅ Approving any visual diff is your responsibility
❌ Don't ask the DS to maintain your product tests
❌ Don't test using hex or px values taken from tokens (they can change)
   → Test observable behavior, not internal values
```
