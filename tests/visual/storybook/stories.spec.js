import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Visual regressions for every Storybook story, light and dark (ADR-104).
// Replaces what Chromatic covered (ADR-066 retired it for the DS scope): the
// site's component pages (tests/visual/components/) don't show every
// variant and state a story isolates.
//
// Stories are enumerated from the built Storybook's own index
// (storybook-static/index.json), never hard-coded: a new story is covered
// the moment it exists. The build is served on :6007 by playwright.config.js
// when storybook-static/ exists — run `npm run build-storybook` first.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INDEX_PATH = join(ROOT, 'storybook-static', 'index.json');
const BASE = 'http://localhost:6007';
const THEMES = ['light', 'dark'];

if (!existsSync(INDEX_PATH)) {
  test('Storybook build present', () => {
    // In CI a missing build is a broken workflow, not something to skip.
    test.skip(!process.env.CI, 'storybook-static/ not built — run `npm run build-storybook` to include story snapshots');
    throw new Error('storybook-static/index.json is missing — the workflow must run `npm run build-storybook` before the visual tests');
  });
} else {
  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
  const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');

  for (const story of stories) {
    test.describe(`${story.title} — ${story.name}`, () => {
      for (const theme of THEMES) {
        test(`${story.id} — ${theme}`, async ({ page }) => {
          // `/iframe`, not `/iframe.html`: `serve` redirects .html URLs to their
          // clean form and drops the query string, so the story would never load.
          await page.goto(`${BASE}/iframe?id=${story.id}&viewMode=story&globals=theme:${theme}`);
          await page.waitForLoadState('networkidle');
          await page.evaluate(() => document.fonts.ready);
          const root = page.locator('#storybook-root');
          await expect(root).toBeVisible();
          await expect(root).toHaveScreenshot(`${story.id}-${theme}.png`);
        });
      }
    });
  }
}
