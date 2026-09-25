// C5-04 (green cases) — doc-generator/src/manifest.mjs's readManifest() must
// reject an invalid manifest with an explicit error naming the fault, and never
// produce a partial site. readManifest() runs before generateSite() writes
// anything (doc-generator/src/build.mjs: readManifest() is the first call), so a
// rejected manifest means outDir is never even created — asserted directly below,
// not inferred from the process exit code alone.
//
// Cases, matching manifest.mjs's actual checks: a missing top-level field, a
// JSON syntax error, and a wrong type — every path/label field must be a
// non-empty string and audit.badgeEnabled a boolean. Until issue 128 was fixed
// only badgeEnabled was type-checked: a non-string components value was
// stringified into the page ("[object Object]", exit 0), and a non-string
// governance/site crashed inside node:path without naming the field (issue
// 129). The last case covers the other half of 129: manifest.site pointing at
// a file that is not valid JSON must name the field and both files.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_PATH = join(ROOT, 'doc-generator', 'bin', 'cli.mjs');

function validManifest(overrides = {}) {
  return {
    governance: 'governance.md',
    tokens: { primitive: 'tokens/primitive.json', semantic: 'tokens/semantic.json', component: 'tokens/component.json' },
    components: 'components/',
    audit: { engine: 'axe-core', badgeEnabled: true },
    site: 'site.config.json',
    ...overrides,
  };
}

function runGeneratorExpectingFailure(manifestPath, outDir) {
  let threw = false;
  let output = '';
  try {
    execFileSync('node', [CLI_PATH, manifestPath, outDir], { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    threw = true;
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  return { threw, output };
}

test.describe('C5-04 — invalid manifest fails loudly, never a partial site', () => {
  let tmpRoot;
  let manifestDir;
  let outDir;

  test.beforeEach(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'doc-generator-manifest-'));
    manifestDir = join(tmpRoot, 'instance');
    mkdirSync(manifestDir, { recursive: true });
    outDir = join(tmpRoot, 'dist-docs');
  });

  test.afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  test('a missing top-level field is rejected, naming the field, no output written', () => {
    const manifest = validManifest();
    delete manifest.components;
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const { threw, output } = runGeneratorExpectingFailure(manifestPath, outDir);

    expect(threw, 'a manifest missing a required field must make the CLI exit non-zero').toBe(true);
    expect(output).toContain('components');
    expect(existsSync(outDir), 'outDir must not exist at all after a rejected manifest').toBe(false);
  });

  test('malformed JSON is rejected with a JSON-syntax error, no output written', () => {
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, '{ "governance": "governance.md", '); // truncated, invalid JSON

    const { threw, output } = runGeneratorExpectingFailure(manifestPath, outDir);

    expect(threw, 'malformed JSON must make the CLI exit non-zero').toBe(true);
    expect(output).toContain('not valid JSON');
    expect(existsSync(outDir), 'outDir must not exist at all after malformed JSON').toBe(false);
  });

  test('a non-string components value is rejected, naming the field and both types, no output written', () => {
    const manifest = validManifest({ components: { thisShouldBeAString: true } });
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const { threw, output } = runGeneratorExpectingFailure(manifestPath, outDir);

    expect(threw, 'components must be a string path, not an object stringified into the page').toBe(true);
    expect(output).toContain('components (expected a non-empty string, got object)');
    expect(output).not.toContain('[object Object]');
    expect(existsSync(outDir), 'outDir must not exist at all after a rejected manifest').toBe(false);
  });

  test('a non-string governance value is rejected by name, not as an opaque node:path error', () => {
    const manifest = validManifest({ governance: 42 });
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const { threw, output } = runGeneratorExpectingFailure(manifestPath, outDir);

    expect(threw).toBe(true);
    expect(output).toContain('governance (expected a non-empty string, got number)');
    expect(output, 'the raw node:path message never named the manifest field').not.toContain('paths[1]');
    expect(existsSync(outDir)).toBe(false);
  });

  test('manifest.site pointing to invalid JSON names the field, the manifest and the file, no output written', () => {
    const manifest = validManifest({ site: 'site-broken.json' });
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    writeFileSync(join(manifestDir, 'site-broken.json'), '{ not json');

    const { threw, output } = runGeneratorExpectingFailure(manifestPath, outDir);

    expect(threw).toBe(true);
    expect(output).toContain('Manifest field "site"');
    expect(output).toContain(manifestPath);
    expect(output).toContain(join(manifestDir, 'site-broken.json'));
    expect(existsSync(outDir)).toBe(false);
  });

  test('audit.badgeEnabled with the wrong type is rejected, naming the field, no output written', () => {
    const manifest = validManifest({ audit: { engine: 'axe-core', badgeEnabled: 'true' } }); // string, not boolean
    const manifestPath = join(manifestDir, 'design-system.manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const { threw, output } = runGeneratorExpectingFailure(manifestPath, outDir);

    expect(threw, 'audit.badgeEnabled must be a real boolean, not a truthy string').toBe(true);
    expect(output).toContain('audit.badgeEnabled');
    expect(existsSync(outDir), 'outDir must not exist at all after a rejected manifest').toBe(false);
  });
});
