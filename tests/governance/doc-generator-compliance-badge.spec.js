// C5-07 (reduced scope, per the C5 plan) — characterization of #130, not a green
// test. doc-generator/src/build.mjs never runs any audit: the "Compliance badge"
// line in generateSite() is an unconditional echo of manifest.audit.badgeEnabled —
// `${manifest.audit.badgeEnabled ? 'enabled' : 'disabled'}` — with no read of
// manifest.audit.engine's value and no check that manifest.governance actually
// resolved to real content. This test proves the gap concretely: point
// governance at a file that does not exist (so the page's own Governance section
// says "not found at build time") while badgeEnabled stays true — the badge still
// reads "enabled" in the same page, even though nothing that could be called an
// audit ever ran against anything.
//
// Same characterization convention as the other C5-04/#128 test and C2-05 (see
// EXEC-005 in decisions/EXECUTION-LOG.md): asserts the current, wrong behavior by
// name, not `test.fail()`, so it goes red the day #130 makes the badge reflect a
// real audit verdict instead of echoing a flag.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_PATH = join(ROOT, 'doc-generator', 'bin', 'cli.mjs');

test('#130 — compliance badge reads "enabled" even though governance points nowhere and no audit ever ran', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'doc-generator-badge-'));
  try {
    const instanceDir = join(tmpRoot, 'instance');
    mkdirSync(instanceDir, { recursive: true });
    writeFileSync(join(instanceDir, 'site.config.json'), JSON.stringify({ siteTitle: 'Badge Test', navigation: [] }));

    const manifest = {
      governance: 'this-file-does-not-exist.md', // deliberately absent
      tokens: { primitive: 'p.json', semantic: 's.json', component: 'c.json' },
      components: 'components/',
      audit: { engine: 'nonexistent-engine', badgeEnabled: true },
      site: 'site.config.json',
    };
    const manifestPath = join(instanceDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const outDir = join(tmpRoot, 'dist-docs');
    execFileSync('node', [CLI_PATH, manifestPath, outDir], { encoding: 'utf8' });

    const indexHtml = readFileSync(join(outDir, 'index.html'), 'utf8');

    expect(
      indexHtml,
      '#130: the Governance section should confirm the file was never found — otherwise this test fixture is not proving what it claims'
    ).toContain('not found at build time');
    expect(
      indexHtml,
      '#130: the compliance badge reads "enabled" with no audit ever having run and governance missing entirely — ' +
        'it echoes audit.badgeEnabled, not a real verdict. Fix #130 to gate the badge on an actual audit result, then rewrite this as a green test.'
    ).toContain('Compliance badge: enabled');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
