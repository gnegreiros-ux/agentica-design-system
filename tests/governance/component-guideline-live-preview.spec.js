// Every published component's guideline page must render the REAL Web Component
// in its "Preview" section, not a hand-coded visual mock or an escaped
// code sample. axe-core (axe-audit.js, ADR-007) scans site/dist/*.html — if the
// page shows a hand-rolled <span>/<svg> replica instead of the real
// <agtc-X> instance, the audit checks the replica's accessibility, not the
// component's actual shadow DOM / ARIA implementation. A real but invisible gap:
// the page renders fine, axe-core reports 0 violations, and the component itself
// stays unaudited (#245, found via the #227 follow-up — 11/17 components were // audit-ignore: issue numbers, not colors
// in exactly this state, discovered only by grepping for a literal <agtc-X> tag
// rather than trusting that a page mentioning the component's name means it
// renders it).
//
// Detection: a real instance appears in the page source as a literal `<agtc-x`
// (an opening angle bracket, not the HTML-escaped `&lt;agtc-x` a <pre><code>
// sample uses to *display* markup as text). This is exactly the difference
// between a rendered element and a documentation snippet — grepping the raw
// HTML file for the literal substring distinguishes the two without a browser.
//
// PENDING_REMEDIATION is a burn-down list, not a permanent exception list: each
// entry is removed in the same PR that makes that component's guideline page
// render the real element (one component at a time, per #245's decision — never // audit-ignore: issue number, not a color
// batch-remove several at once; that defeats the point of catching one
// regression at a time). A documented, permanent architectural exception (like
// top-nav choosing not to dogfood on the site itself) still needs a real
// <agtc-top-nav> on its OWN guideline/preview page — that is a different
// decision than whether the site's live nav consumes it — so it is NOT grounds
// to stay on this list once its page exists and renders the component.
//
// DOCUMENTED_ALTERNATE_FORM is different from PENDING_REMEDIATION: these
// components' own contract (an ADR) documents a second, equally first-class
// static-site form in addition to the Web Component — e.g. code-block
// (ADR-041): `.code-block` class on a plain `<pre><code>`, enhanced by
// site/build.js's siteJS() with a real <button>, aria-label (language
// included), and role="status"/aria-live copy feedback — verified against
// that script, not assumed. axe-core auditing that real DOM already covers
// the actual implementation; forcing a literal <agtc-code-block> tag onto
// this page would not make the audit more real, only cosmetically satisfy
// this test. code-block was originally miscategorized into
// PENDING_REMEDIATION by the #227/#245 audit, which only grepped for the // audit-ignore: issue numbers, not colors
// Web Component tag and didn't check whether an alternate form was in play.
import { test, expect } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GUIDELINES_DIR = join(ROOT, 'guidelines', 'components');
const DIST_COMPONENTS_DIR = join(ROOT, 'site', 'dist', 'components');

// Tracked in #245 — remove an entry only in the PR that fixes that component's // audit-ignore: issue number, not a color
// preview to render the real <agtc-x>. Never add an entry without a reason above
// this line and an issue reference.
// Empty: #245's burn-down is complete (card, checkbox, icon, input, radio, // audit-ignore: issue number, not a color
// tabs, toggle, feature-card, top-nav all now render the real element on
// their guideline page). Left as a named, documented Set rather than removed
// so a future regression has a place to land one entry at a time.
const PENDING_REMEDIATION = new Set([]);

const DOCUMENTED_ALTERNATE_FORM = new Set([
  'code-block', // ADR-041 — see comment above
  'table', // ADR-040 — same reasoning: `<table class="agtc-table">` on components/table.html
           // is a real semantic <table>/<thead>/<tbody>/<th scope="col">/<caption>, the
           // documented static-site form of the "mix" — no JS enhancement needed (unlike
           // code-block's copy button) since the accessibility contract here is satisfied
           // entirely by the native HTML already present. Also miscategorized by #227/#245. // audit-ignore: issue numbers, not colors
]);

const components = readdirSync(GUIDELINES_DIR)
  .filter((f) => f.endsWith('.md') && f !== 'overview.md')
  .map((f) => f.replace(/\.md$/, ''))
  .sort();

function hasLiveInstance(name) {
  const page = join(DIST_COMPONENTS_DIR, `${name}.html`);
  if (!existsSync(page)) return false;
  const src = readFileSync(page, 'utf8');
  return new RegExp(`<agtc-${name}[\\s>]`).test(src);
}

test('every published component not on the pending-remediation list renders its real element on its guideline page', () => {
  expect(components.length, 'no guidelines/components/*.md found — did the layout change?').toBeGreaterThan(0);

  const toCheck = components.filter((name) => !PENDING_REMEDIATION.has(name) && !DOCUMENTED_ALTERNATE_FORM.has(name));
  expect(toCheck.length, 'PENDING_REMEDIATION + DOCUMENTED_ALTERNATE_FORM cover every published component — nothing left to guard').toBeGreaterThan(0);

  const regressed = toCheck.filter((name) => !hasLiveInstance(name));

  expect(
    regressed,
    `these components' guideline pages no longer render a real <agtc-x> instance in their `
      + `Preview section (hand-coded mock, escaped code sample, or the page itself went missing) — `
      + `axe-core would then audit a replica instead of the actual Web Component: ${regressed.join(', ')}`,
  ).toEqual([]);
});

test('PENDING_REMEDIATION entries that have actually been fixed must be removed from the list', () => {
  // The inverse check: if a component on the burn-down list now DOES render the
  // real element, someone fixed it and forgot to take it off the list — the
  // list would then silently stop guarding that component against a future
  // regression. Catches the list going stale in either direction.
  const fixed = [...PENDING_REMEDIATION].filter((name) => components.includes(name) && hasLiveInstance(name));

  expect(
    fixed,
    `these components are still listed in PENDING_REMEDIATION but their guideline page already `
      + `renders the real element — remove them from the list so this test guards them too: ${fixed.join(', ')}`,
  ).toEqual([]);
});

test('the live-instance check actually distinguishes a real element from an escaped code sample (self-check)', () => {
  // badge is a known-good page (real <agtc-badge> in its Preview section).
  expect(hasLiveInstance('badge')).toBe(true);

  // #245's burn-down is complete, so PENDING_REMEDIATION no longer has a live // audit-ignore: issue number, not a color
  // escaped-only page to borrow — a deliberately-constructed fixture proves
  // the regex distinguishes a rendered element from an HTML-escaped code
  // sample instead (same shape a <pre><code> doc snippet produces in a real
  // guideline page).
  const escapedOnlyFixture = '<pre><code>&lt;agtc-example label="Sample"&gt;&lt;/agtc-example&gt;</code></pre>';
  expect(escapedOnlyFixture.includes('&lt;agtc-example'), 'fixture must contain an escaped <agtc-example> code sample').toBe(true);
  expect(new RegExp('<agtc-example[\\s>]').test(escapedOnlyFixture)).toBe(false); // but no live instance
});
