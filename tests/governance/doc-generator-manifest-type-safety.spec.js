// C5-04 (fail-open case) — characterization of #128, not a green test.
//
// readManifest() (doc-generator/src/manifest.mjs) only checks that
// tokens.primitive/semantic/component, components, and audit.engine are truthy —
// never their type. generateSite() (doc-generator/src/build.mjs) never reads any
// of these fields as a file either; it only echoes them into the page through
// escapeHtml(), which stringifies anything. Give one of them a non-string value
// (an object, here) and the generator does not fail: it exits 0 and writes a
// fully-formed site whose Components section reads the literal text
// "[object Object]" instead of a real path — a false green, not a crash.
//
// This is deliberately a characterization test, not `test.fail()` (rejected for
// this exact pattern, see EXEC-005 in decisions/EXECUTION-LOG.md and the C2-05
// test's own header): `test.fail()` goes green the moment the run fails for any
// reason at all, which would hide the day this generator starts type-checking
// these fields just as easily as it hides the bug today. This test instead
// asserts the specific wrong behavior by name and must go red — loudly — the day
// #128 is fixed, as the signal to rewrite it as a real rejection test.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_PATH = join(ROOT, 'doc-generator', 'bin', 'cli.mjs');

test('#128 — a non-string components value is never type-checked and silently produces a wrong site (exit 0)', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'doc-generator-type-safety-'));
  try {
    const manifestDir = join(tmpRoot, 'instance');
    mkdirSync(manifestDir, { recursive: true });

    const manifest = {
      governance: 'governance.md',
      tokens: { primitive: 'tokens/primitive.json', semantic: 'tokens/semantic.json', component: 'tokens/component.json' },
      components: { thisShouldBeAString: true }, // Rule-4-shaped bug: wrong type, never rejected
      audit: { engine: 'axe-core', badgeEnabled: true },
      site: 'site.config.json',
    };
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const outDir = join(tmpRoot, 'dist-docs');
    let threw = false;
    try {
      execFileSync('node', [CLI_PATH, manifestPath, outDir], { encoding: 'utf8', stdio: 'pipe' });
    } catch {
      threw = true;
    }

    expect(
      threw,
      '#128 is fixed — components is now type-checked and this generator rejects a non-string value. ' +
        'Rewrite this test as a real rejection case in doc-generator-manifest-validation.spec.js and delete this file.'
    ).toBe(false);

    const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8');
    expect(
      indexHtml,
      '#128: a non-string components value should have been rejected, not stringified into the page as "[object Object]"'
    ).toContain('[object Object]');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
