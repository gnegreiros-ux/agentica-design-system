// C5-04 (green cases) — doc-generator/src/manifest.mjs's readManifest() must
// reject an invalid manifest with an explicit error naming the fault, and never
// produce a partial site. readManifest() runs before generateSite() writes
// anything (doc-generator/src/build.mjs: readManifest() is the first call), so a
// rejected manifest means outDir is never even created — asserted directly below,
// not inferred from the process exit code alone.
//
// Three cases, matching manifest.mjs's actual checks: a missing top-level field, a
// JSON syntax error, and the one field this generator does type-check —
// audit.badgeEnabled (typeof !== 'boolean', not just truthiness like every other
// field). The two other "wrong type" cases the plan originally grouped under
// C5-04 are NOT here:
// - tokens.*/components/audit.engine given a wrong type is a separate
//   characterization test (doc-generator-manifest-type-safety.spec.js, #128) —
//   readManifest() never type-checks those fields at all, so this generator
//   currently accepts them and produces a silently wrong site, exit 0.
// - governance/site given a wrong type crashes with an opaque message instead of
//   a partial site, tracked as issue #129 (message-quality gap only) — no test,
//   per the C5 plan.

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
