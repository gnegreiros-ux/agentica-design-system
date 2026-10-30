// C5-05 (replaced, decided in the C5 plan) — the original test called for
// "generated output is gitignored and nothing generated ever gets committed", but
// that only proves fixture hygiene, not a property of the generator itself. The
// real, testable invariant: doc-generator/src/build.mjs writes every file through
// resolve(outDir, <name>) — mkdirSync(outDir) then two conditional writeFileSync
// calls, nothing else — so no file should ever land outside the resolved outDir,
// whatever shape that argument takes. Two cases: a relative outDir (the CLI's own
// default-adjacent usage), and an outDir whose string literally contains a `..`
// segment that nets to a subdirectory of the working directory — proving the
// intermediate/parent path a `..` segment passes through is never itself written
// to, only the final resolved directory.
//
// Verified by walking the whole sandbox directory tree before and after each run
// and asserting every new file is a descendant of the resolved outDir — not by
// checking a handful of expected paths, so an unexpected stray write anywhere in
// the sandbox would fail this test.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI_PATH = join(ROOT, 'doc-generator', 'bin', 'cli.mjs');

function listFilesRecursive(root) {
  if (!existsDir(root)) return [];
  const out = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(full);
    }
  })(root);
  return out;
}

function existsDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function writeMinimalInstance(instanceDir) {
  mkdirSync(instanceDir, { recursive: true });
  writeFileSync(join(instanceDir, 'governance.md'), '# GOVERNANCE\n');
  writeFileSync(join(instanceDir, 'site.config.json'), JSON.stringify({ siteTitle: 'Containment Test', navigation: [] }));
  const manifest = {
    governance: 'governance.md',
    tokens: { primitive: 'p.json', semantic: 's.json', component: 'c.json' },
    components: 'components/',
    audit: { engine: 'axe-core', badgeEnabled: true },
    site: 'site.config.json',
  };
  const manifestPath = join(instanceDir, 'design-system.manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

test.describe('C5-05 — the generator never writes outside the resolved outDir', () => {
  let sandbox;

  test.beforeEach(() => {
    sandbox = mkdtempSync(join(tmpdir(), 'doc-generator-containment-'));
  });

  test.afterEach(() => {
    rmSync(sandbox, { recursive: true, force: true });
  });

  test('a relative outDir contains every written file, nothing written elsewhere in the sandbox', () => {
    const workspace = join(sandbox, 'workspace');
    const manifestPath = writeMinimalInstance(join(workspace, 'instance'));
    const relativeOutDir = join('instance', 'dist-docs');
    const resolvedOutDir = resolve(workspace, relativeOutDir);

    const before = new Set(listFilesRecursive(sandbox));

    execFileSync('node', [CLI_PATH, relative(workspace, manifestPath), relativeOutDir], {
      cwd: workspace,
      encoding: 'utf8',
    });

    const after = listFilesRecursive(sandbox);
    const newFiles = after.filter((file) => !before.has(file));

    expect(newFiles.length, 'the generator must write at least one file').toBeGreaterThan(0);
    for (const file of newFiles) {
      const isInsideOutDir = !relative(resolvedOutDir, file).startsWith('..' + sep) && relative(resolvedOutDir, file) !== '..';
      expect(isInsideOutDir, `${file} was written outside the resolved outDir ${resolvedOutDir}`).toBe(true);
    }
  });

  test('an outDir string containing ".." nets to a subdirectory, and only that final directory receives writes', () => {
    const workspace = join(sandbox, 'workspace');
    const manifestPath = writeMinimalInstance(join(workspace, 'instance'));
    // "nested/../actual-out" nets to workspace/actual-out — the intermediate
    // "nested" segment must never itself be created or written to.
    const traversingOutDir = join('nested', '..', 'actual-out');
    const resolvedOutDir = resolve(workspace, 'actual-out');
    const neverCreatedDir = resolve(workspace, 'nested');

    const before = new Set(listFilesRecursive(sandbox));

    execFileSync('node', [CLI_PATH, relative(workspace, manifestPath), traversingOutDir], {
      cwd: workspace,
      encoding: 'utf8',
    });

    const after = listFilesRecursive(sandbox);
    const newFiles = after.filter((file) => !before.has(file));

    expect(newFiles.length, 'the generator must write at least one file').toBeGreaterThan(0);
    expect(existsDir(neverCreatedDir), `the intermediate "nested" segment of a ".."-containing outDir must never be created (${neverCreatedDir})`).toBe(false);
    for (const file of newFiles) {
      const isInsideOutDir = !relative(resolvedOutDir, file).startsWith('..' + sep) && relative(resolvedOutDir, file) !== '..';
      expect(isInsideOutDir, `${file} was written outside the resolved outDir ${resolvedOutDir}`).toBe(true);
    }
  });
});
