// C5-07 — the compliance badge renders a recorded audit verdict, never the
// badgeEnabled flag (ADR-100, issue 130). This file used to be a
// characterization test proving the opposite: with badgeEnabled: true, the
// generated site read "Compliance badge: enabled" even when governance pointed
// nowhere and no audit had ever run.
//
// doc-generator stays a pure renderer — it never runs an audit. badgeEnabled
// only decides whether a compliance line is shown; its content comes from the
// optional audit.lastResult, written by an audit step that actually ran before
// generation. Four rendering cases, plus the lastResult validation.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_PATH = join(ROOT, 'doc-generator', 'bin', 'cli.mjs');

const RECORDED = { passed: true, violationCount: 0, ranAt: '2026-09-25T10:00:00Z', engine: 'axe-core' };

let tmpRoot;
let instanceDir;
let outDir;

test.beforeEach(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), 'doc-generator-badge-'));
  instanceDir = join(tmpRoot, 'instance');
  mkdirSync(instanceDir, { recursive: true });
  writeFileSync(join(instanceDir, 'site.config.json'), JSON.stringify({ siteTitle: 'Badge Test', navigation: [] }));
  outDir = join(tmpRoot, 'dist-docs');
});

test.afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

function writeManifest(audit) {
  const manifest = {
    governance: 'this-file-does-not-exist.md', // no audit could have run against anything
    tokens: { primitive: 'p.json', semantic: 's.json', component: 'c.json' },
    components: 'components/',
    audit: { engine: 'axe-core', ...audit },
    site: 'site.config.json',
  };
  const manifestPath = join(instanceDir, 'design-system.manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

function generate(audit) {
  execFileSync('node', [CLI_PATH, writeManifest(audit), outDir], { encoding: 'utf8', stdio: 'pipe' });
  return readFileSync(join(outDir, 'index.html'), 'utf8');
}

function generateExpectingFailure(audit) {
  try {
    execFileSync('node', [CLI_PATH, writeManifest(audit), outDir], { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  throw new Error('expected the generator to reject this manifest');
}

test('badge requested, no recorded verdict → "not verified", never "enabled"', () => {
  const html = generate({ badgeEnabled: true });
  expect(html, 'fixture sanity: governance must really be missing').toContain('not found at build time');
  expect(html).toContain('<strong>not verified</strong> — no audit result recorded');
  expect(html).not.toContain('Compliance badge: enabled');
  expect(html).not.toMatch(/<strong>passed<\/strong>/);
});

test('badge requested, passing verdict → result, count, date and engine', () => {
  const html = generate({ badgeEnabled: true, lastResult: RECORDED });
  expect(html).toContain('<strong>passed</strong> — 0 violations, audited');
  expect(html).toContain('<time datetime="2026-09-25T10:00:00Z">');
  expect(html).toContain('with <code>axe-core</code>');
});

test('badge requested, failing verdict → "failed" with the violation count', () => {
  const html = generate({ badgeEnabled: true, lastResult: { ...RECORDED, passed: false, violationCount: 1 } });
  expect(html).toContain('<strong>failed</strong> — 1 violation, audited');
});

test('badge not requested → no compliance claim, even with a recorded verdict', () => {
  const html = generate({ badgeEnabled: false, lastResult: RECORDED });
  expect(html).toContain('Compliance badge: disabled');
  expect(html).not.toMatch(/<strong>(passed|failed|not verified)<\/strong>/);
});

test('invalid lastResult is rejected, naming each field, no output written', () => {
  const output = generateExpectingFailure({
    badgeEnabled: true,
    lastResult: { passed: 'yes', violationCount: -1, ranAt: 'yesterday', engine: '' },
  });
  expect(output).toContain('audit.lastResult.passed (expected a boolean, got string)');
  expect(output).toContain('audit.lastResult.violationCount (expected an integer >= 0, got -1)');
  expect(output).toContain('audit.lastResult.ranAt (expected an ISO 8601 date-time string, got "yesterday")');
  expect(output).toContain('audit.lastResult.engine (expected a non-empty string, got an empty string)');
  expect(existsSync(outDir)).toBe(false);
});

test('a contradictory verdict (passed with violations) is rejected', () => {
  const output = generateExpectingFailure({ badgeEnabled: true, lastResult: { ...RECORDED, violationCount: 2 } });
  expect(output).toContain('passed is true but violationCount is 2 — contradictory verdict');
  expect(existsSync(outDir)).toBe(false);
});
