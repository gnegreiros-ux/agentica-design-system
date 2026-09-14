// C2-01, C2-02, C2-03 — Rule 1 (WCAG 2.2 AA) is non-negotiable: each fixture
// here introduces exactly one deliberate, documented violation and the
// test fails if the accessibility audit does not catch it.
//
// Reuses the same harness as tests/functional/accessibility.spec.js
// (AxeBuilder, the same WCAG_TAGS) — kept in a separate file rather than
// added to that file's PAGES list, which audits the real production site.
// Fixtures are served in isolation from the production build, on their own
// port (see playwright.config.js's second webServer entry), never copied
// into site/dist.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const FIXTURES_BASE_URL = 'http://localhost:8081';

test.describe('C2-01 — Rule 1: meaningful visual content without alt text', () => {
  test('the accessibility audit fails on a meaningful image with no alt attribute', async ({ page }) => {
    await page.goto(`${FIXTURES_BASE_URL}/missing-alt.html`);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = results.violations.filter((v) => v.id === 'image-alt');

    expect(blocking.length, 'Expected the missing-alt fixture to trigger an image-alt violation').toBeGreaterThan(0);
  });
});

test.describe('C2-02 — Rule 1: text contrast below 4.5:1', () => {
  test('the accessibility audit fails on text under the minimum contrast ratio', async ({ page }) => {
    await page.goto(`${FIXTURES_BASE_URL}/low-contrast.html`);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = results.violations.filter((v) => v.id === 'color-contrast');

    expect(blocking.length, 'Expected the low-contrast fixture to trigger a color-contrast violation').toBeGreaterThan(0);
  });
});

test.describe('C2-03 — Rule 1: focus indicator not visible', () => {
  // axe-core's automated ruleset cannot evaluate WCAG 2.4.7 (focus visible)
  // or 2.1.2 (no keyboard trap): both require actually rendering the
  // :focus state via real interaction, which a static DOM analysis pass
  // never triggers. Verified empirically against this exact fixture before
  // writing this test: AxeBuilder.analyze() reports zero violations on a
  // `button:focus { outline: none; }` page — a known, documented axe-core
  // gap (Deque, axe-core's publisher, states automated tooling covers
  // roughly 30-40% of WCAG success criteria; focus-visible and keyboard
  // traps are canonical examples of the manual-only remainder).
  //
  // The real violation is therefore proven with an actual keyboard
  // interaction and a computed-style check, not with AxeBuilder. The axe
  // scan is kept alongside it only to document — not to prove — that it
  // stays silent on this fixture.

  test('the button has no visible focus indicator after a real Tab keypress', async ({ page }) => {
    await page.goto(`${FIXTURES_BASE_URL}/invisible-focus.html`);

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Focus me with Tab');

    const focusStyle = await focused.evaluate((el) => {
      const style = getComputedStyle(el);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
    });

    const hasVisibleIndicator =
      (focusStyle.outlineStyle !== 'none' && parseFloat(focusStyle.outlineWidth) > 0) ||
      (focusStyle.boxShadow && focusStyle.boxShadow !== 'none');

    expect(
      hasVisibleIndicator,
      'Expected no visible focus indicator on this fixture (the deliberate WCAG 2.4.7 violation) — found one, so the fixture no longer demonstrates it'
    ).toBe(false);
  });

  test('axe-core does not catch this violation — documented tooling gap, not a passing audit', async ({ page }) => {
    await page.goto(`${FIXTURES_BASE_URL}/invisible-focus.html`);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    // Intentionally NOT framed as "the audit passes" — this documents a
    // known tooling limitation. If this ever starts failing (axe-core
    // reports a violation here), that means axe-core gained focus-visible
    // detection — re-evaluate this whole describe block at that point.
    expect(results.violations).toHaveLength(0);
  });
});
