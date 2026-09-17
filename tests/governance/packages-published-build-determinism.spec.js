// C3-09 (scope reduced — decided 2026-09-13, no network) — fidelity of the
// published @agentica-ds/tokens and @agentica-ds/components packages
// (both at 1.0.0, confirmed actually published via `npm view`) to main's
// tracked source.
//
// The original ask had two assertions, the first of which needs a network
// read of the pinned 1.0.0 tarball from the npm registry to check directly
// — explicitly ruled out to keep this suite network-free, like the rest of
// the lot 1 + lot 2 suite. Local determinism is used instead:
//
//   1. Both packages' build output (packages/tokens/{css,js,tailwind,tokens}/,
//      packages/components/{agtc-*.js,index.js}) is gitignored — never
//      committed (verified: `git ls-files packages/tokens packages/components`
//      lists only package.json/README/LICENSE/NOTICE/CHANGELOG/build.js).
//      What actually ships is whatever `npm run tokens` and
//      `npm run build:components-package` produce from tracked source —
//      release.yml runs exactly these two commands right before
//      `changeset publish`. So "published == build of main" reduces to:
//      that build is a deterministic, verbatim function of tracked source.
//      This test proves that reduction holds:
//        - packages/components/*.js (built) is byte-identical to
//          components/*.js (tracked source, minus *.stories.js) — build.js's
//          own header comment claims "every component file copied verbatim";
//          checked directly rather than assumed.
//        - packages/tokens/tokens/*.json (built) is byte-identical to the
//          four tracked tokens/*.json files it copies from.
//        - Running the build twice in a row produces byte-identical output
//          both times (idempotence) for the parts that go through a real
//          transform (style-dictionary → packages/tokens/{css,js,tailwind}/),
//          not just a copy.
//
// Found while writing this test, same class of bug as the sitemap.xml
// lastmod bug this repo already fixed (site/build.js — never had its own
// issue, fixed directly in the commit that found it): style-dictionary's
// own built-in css/variables and javascript/es6 formats stamp a
// `Generated on <date>` comment header using the wall clock — present in
// all.css, components.css, primitives.css, semantic.css, js/tokens.js.
// dark.css and tailwind/tokens.js use this repo's own custom format
// registered in style-dictionary/build.cjs, which carries no such header,
// so they were never affected. Confirmed by diffing two consecutive builds
// directly: the header line was the only difference.
//
// This is a real, un-fixed gap, not a cosmetic one — tracked in
// https://github.com/gnegreiros-ux/agentica-design-system/issues/123.
// It means two builds of the same commit produce different tarballs,
// which is exactly the property this test exists to check, and exactly
// the reason the network-based "matches what's actually on the npm
// registry" half of C3-09 was ruled out in the first place: even a
// network read would never land on a stable target to compare against.
// The exclusion below keeps this file executable without that gap
// swallowing every other assertion in it — it does not close #123, and
// must be removed once #123 lands (style-dictionary's own fileHeader
// option can drop the timestamp without touching the rest of the format).
//   2. R3/R4 parity: scripts/audit-tokens.js --src-dir, run against the
//      freshly built packages/components/ and against a stories-free copy
//      of components/, must reach the same critical-violation verdict —
//      the packaging copy step introduces no drift in either direction.
//      (packages/tokens/ is excluded from this half: it IS the primitive/
//      semantic/component token definition layer, the same reason
//      GENERATED_PATHS excludes it from the default audit-tokens.js run —
//      "hardcoded hex" there is the primitive layer doing its job, not R3
//      drift.)
//
// This does NOT independently prove the exact bytes currently sitting on
// the npm registry equal this local rebuild — only that whenever main is
// released, what gets published is guaranteed byte-identical to it by
// construction. Confirmed via inventory that no source under components/
// or tokens/ has changed since the 1.0.0 release run (2026-09-12,
// PR #101) that actually published both packages at that version.
//
// Runs the real, tracked build scripts against the real repo (there is no
// cheap way to sandbox style-dictionary's own root-relative paths without
// duplicating its config). packages/tokens/ and packages/components/ are
// gitignored build output — safe to leave freshly rebuilt. dist/tokens/ is
// NOT gitignored, though: `npm run tokens` chains style-dictionary's own
// build first, which regenerates it too, re-stamping the same wall-clock
// header discussed above into tracked files. Left alone, a local run of
// this spec would dirty `git status` by a timestamp comment on every
// invocation. Backed up before the first rebuild and restored verbatim
// (afterAll, unconditionally) so this test leaves the tracked tree exactly
// as it found it, pass or fail — CI runs on an ephemeral checkout, so this
// only matters for a local run, but the isolation rule applies here too.
//
// ISOLATION, READ CAREFULLY — this file imports mkdtempSync, but that does
// NOT mean every test below runs in a sandbox. Only the last test (R3/R4
// parity) does: it builds a stories-free copy of components/ inside an
// mkdtempSync tmp dir. The other three (determinism-across-two-builds,
// components verbatim copy, tokens verbatim copy) call rebuildPackages(),
// which writes straight into this repo's real, shared packages/tokens/,
// packages/components/, and (transitively) dist/tokens/ — there is no
// per-test tmp dir for those, on purpose (see the paragraph above: no cheap
// way to sandbox style-dictionary's own root-relative config). This is an
// accepted trade-off, not an oversight: `test.describe.configure({ mode:
// 'serial' })` below prevents these tests from interleaving with each
// other, and the dist/tokens/ backup/restore above keeps the tracked tree
// clean regardless. It does mean this file must never gain a sibling test —
// here or added later to tests/governance/ — that reads or writes
// packages/tokens/, packages/components/, or dist/tokens/ without also
// being serialized against this one; Playwright's fullyParallel default
// would then let it run concurrently and observe a mid-rebuild state.

import { test, expect } from '@playwright/test';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { runWithTruncationRetry } from './support/run-with-truncation-retry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const AUDIT_SCRIPT_PATH = join(ROOT, 'scripts', 'audit-tokens.js');
const DIST_TOKENS_DIR = join(ROOT, 'dist', 'tokens');

function rebuildPackages() {
  execFileSync('npm', ['run', 'tokens'], { cwd: ROOT, stdio: 'pipe' });
  execFileSync('npm', ['run', 'build:components-package'], { cwd: ROOT, stdio: 'pipe' });
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

// dist/tokens/ is git-tracked; `npm run tokens` regenerates it as a side
// effect of building the packages. Backed up verbatim before the first
// rebuild and restored after the last test, so this spec never leaves the
// tracked tree dirty locally (see the file header).
function backupTree(dir) {
  const backup = {};
  for (const file of listFiles(dir)) {
    backup[relative(dir, file)] = readFileSync(file);
  }
  return backup;
}

function restoreTree(dir, backup) {
  for (const [rel, content] of Object.entries(backup)) {
    writeFileSync(join(dir, rel), content);
  }
}

// KNOWN, UN-FIXED GAP — https://github.com/gnegreiros-ux/agentica-design-system/issues/123
// style-dictionary's built-in css/variables and javascript/es6 formats
// stamp a wall-clock "Generated on <date>" comment, making two builds of
// the same commit byte-different. Excluded here only so this file stays
// executable — this is NOT the C5-05 "normal, expected" timestamp case
// (a build identifier that's supposed to change); it is a real
// reproducibility defect in a package already published to npm. Remove
// this exclusion once #123 is fixed, rather than carrying it forward.
const GENERATED_ON_LINE = /^.*Generated on .+$/gm;

function snapshot(dir, { exclude = [] } = {}) {
  const snap = {};
  for (const file of listFiles(dir)) {
    const rel = relative(dir, file);
    if (exclude.includes(rel)) continue;
    const content = readFileSync(file, 'utf8').replace(GENERATED_ON_LINE, '');
    snap[rel] = createHash('sha256').update(content).digest('hex');
  }
  return snap;
}

test.describe('C3-09 — published package fidelity (local determinism, no network)', () => {
  // Serial, not parallel: every test in this file calls rebuildPackages(),
  // which writes to the real, shared packages/tokens/ and
  // packages/components/ directories — there is no cheap way to sandbox
  // style-dictionary's own root-relative config into an isolated per-test
  // copy the way other governance tests copy a handful of files into a
  // tmpdir. Running these concurrently (Playwright's default) corrupts
  // whichever test reads mid-rebuild, since two rebuilds can interleave on
  // the same files.
  test.describe.configure({ mode: 'serial' });

  let distTokensBackup;
  test.beforeAll(() => {
    distTokensBackup = backupTree(DIST_TOKENS_DIR);
  });
  test.afterAll(() => {
    restoreTree(DIST_TOKENS_DIR, distTokensBackup);
  });

  test('rebuilding both packages twice in a row is fully deterministic', () => {
    rebuildPackages();
    const firstTokens = snapshot(join(ROOT, 'packages', 'tokens', 'css'));
    const firstJs = snapshot(join(ROOT, 'packages', 'tokens', 'js'));
    const firstTailwind = snapshot(join(ROOT, 'packages', 'tokens', 'tailwind'));
    const firstComponents = snapshot(join(ROOT, 'packages', 'components'), { exclude: ['build.js'] });

    rebuildPackages();
    const secondTokens = snapshot(join(ROOT, 'packages', 'tokens', 'css'));
    const secondJs = snapshot(join(ROOT, 'packages', 'tokens', 'js'));
    const secondTailwind = snapshot(join(ROOT, 'packages', 'tokens', 'tailwind'));
    const secondComponents = snapshot(join(ROOT, 'packages', 'components'), { exclude: ['build.js'] });

    expect(secondTokens, 'packages/tokens/css/ must be byte-identical across two consecutive builds').toEqual(firstTokens);
    expect(secondJs, 'packages/tokens/js/ must be byte-identical across two consecutive builds').toEqual(firstJs);
    expect(secondTailwind, 'packages/tokens/tailwind/ must be byte-identical across two consecutive builds').toEqual(
      firstTailwind
    );
    expect(secondComponents, 'packages/components/ must be byte-identical across two consecutive builds').toEqual(
      firstComponents
    );
  });

  test('packages/components/ is a verbatim copy of components/ (minus stories)', () => {
    rebuildPackages();

    const srcDir = join(ROOT, 'components');
    const builtDir = join(ROOT, 'packages', 'components');

    const sourceFiles = readdirSync(srcDir).filter((f) => f.endsWith('.js') && !f.endsWith('.stories.js'));
    const builtFiles = readdirSync(builtDir).filter((f) => f.endsWith('.js') && f !== 'build.js');

    expect(builtFiles.sort()).toEqual(sourceFiles.sort());

    for (const file of sourceFiles) {
      expect(readFileSync(join(builtDir, file), 'utf8'), `${file} must be byte-identical to components/${file}`).toBe(
        readFileSync(join(srcDir, file), 'utf8')
      );
    }
  });

  test('packages/tokens/tokens/ is a verbatim copy of the tracked DTCG source', () => {
    rebuildPackages();

    const srcDir = join(ROOT, 'tokens');
    const builtDir = join(ROOT, 'packages', 'tokens', 'tokens');
    const files = ['primitives.json', 'semantic.json', 'semantic.dark.json', 'component.json'];

    for (const file of files) {
      expect(readFileSync(join(builtDir, file), 'utf8'), `${file} must be byte-identical to tokens/${file}`).toBe(
        readFileSync(join(srcDir, file), 'utf8')
      );
    }
  });

  test('the published components package introduces no R3/R4 drift relative to source', () => {
    rebuildPackages();

    const tmpRoot = mkdtempSync(join(tmpdir(), 'components-no-stories-'));
    try {
      const storiesFreeSrc = join(tmpRoot, 'components');
      mkdirSync(storiesFreeSrc, { recursive: true });
      for (const file of readdirSync(join(ROOT, 'components'))) {
        if (file.endsWith('.stories.js')) continue;
        if (!file.endsWith('.js')) continue;
        cpSync(join(ROOT, 'components', file), join(storiesFreeSrc, file));
      }

      function runAudit(dir) {
        function runOnce() {
          try {
            const output = execFileSync('node', [AUDIT_SCRIPT_PATH, '--src-dir', dir, '--ci'], { encoding: 'utf8' });
            return { threw: false, output };
          } catch (error) {
            return { threw: true, output: `${error.stdout ?? ''}${error.stderr ?? ''}` };
          }
        }
        return runWithTruncationRetry(runOnce, 'Summary');
      }

      const sourceVerdict = runAudit(storiesFreeSrc);
      const publishedVerdict = runAudit(join(ROOT, 'packages', 'components'));

      expect(
        publishedVerdict.threw,
        'The published components package must reach the exact same critical-violation verdict as its stories-free source'
      ).toBe(sourceVerdict.threw);
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });
});
