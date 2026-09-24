// Every component with a Storybook story must actually be defined when that
// story renders. A custom element that is never registered doesn't error — it
// renders as an empty unknown tag (or its raw light DOM), and Chromatic
// happily baselines that. It went unnoticed twice: agtc-image (#151, fixed in
// #161) and agtc-tabs + agtc-top-nav (#162, fixed in #165), whose baselines
// had never checked the real components — hiding a real top-nav bug (#164).
//
// Static check, no Storybook build: a component counts as registered for its
// stories when its module is reachable, following relative imports
// transitively, from .storybook/preview.js or from its own *.stories.js file
// (agtc-checkbox, agtc-feature-card, … import themselves from their story).
// Transitive, so a future component-to-component import also counts.
// Verified against a real Storybook build on 2026-09-24: this rule and
// customElements.get() agree on all 104 stories.
//
// Out of scope: a component that only *uses* another one by tag name
// (agtc-image renders <agtc-icon> in its fallback) relies on that one being
// registered too — covered here only because every storied component must be.

import { test, expect } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const COMPONENTS_DIR = join(ROOT, 'components');
const PREVIEW = join(ROOT, '.storybook', 'preview.js');

const IMPORT_PATTERN = /^\s*import\s+(?:[^'"]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+\.js)['"]/gm;

function relativeJsImports(file) {
  const src = readFileSync(file, 'utf8');
  return [...src.matchAll(IMPORT_PATTERN)].map((m) => resolve(dirname(file), m[1]));
}

function reachableFrom(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    stack.push(...relativeJsImports(file));
  }
  return seen;
}

const componentFiles = readdirSync(COMPONENTS_DIR)
  .filter((f) => /^agtc-.+\.js$/.test(f) && !f.endsWith('.stories.js'))
  .map((f) => join(COMPONENTS_DIR, f));

const storied = componentFiles.filter((f) => existsSync(f.replace(/\.js$/, '.stories.js')));

test('every storied component is reachable from preview.js or its own story', () => {
  expect(storied.length, 'no components/*.stories.js found — did the layout change?').toBeGreaterThan(0);

  const fromPreview = reachableFrom(PREVIEW);
  const unregistered = storied.filter((component) => {
    const story = component.replace(/\.js$/, '.stories.js');
    return !fromPreview.has(component) && !reachableFrom(story).has(component);
  });

  expect(
    unregistered.map((f) => relative(ROOT, f)),
    'these components have stories but are never imported by .storybook/preview.js or their '
      + 'own story file — the custom element is never defined, so their stories (and Chromatic '
      + 'baselines) show an empty or raw element. Import the component in preview.js.',
  ).toEqual([]);
});

test('the import walk actually follows imports (self-check)', () => {
  // Guards against the check passing vacuously if the import pattern stops
  // matching: preview.js must reach its components, and a story that imports
  // its own component (agtc-checkbox) must be followed to it.
  const fromPreview = reachableFrom(PREVIEW);
  expect(fromPreview.has(join(COMPONENTS_DIR, 'agtc-button.js'))).toBe(true);
  expect(
    reachableFrom(join(COMPONENTS_DIR, 'agtc-checkbox.stories.js')).has(join(COMPONENTS_DIR, 'agtc-checkbox.js')),
  ).toBe(true);
});
