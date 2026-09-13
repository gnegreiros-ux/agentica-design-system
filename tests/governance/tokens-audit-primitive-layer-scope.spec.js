// C2-06 — the most important test in this lot: PRIMITIVE_LAYER_PATHS in
// scripts/audit-tokens.js must exclude exactly clone/personnalisation/branding/
// and nothing else. Three fixtures with STRICTLY IDENTICAL content are
// placed at three locations — only the path decides the outcome, never the
// content:
//   - clone/personnalisation/branding/  → must PASS (legitimate exclusion)
//   - clone/personnalisation/theme/     → must FAIL (in scope)
//   - clone/core/                       → must FAIL (in scope)
//
// Runs against a copy of the real scripts/audit-tokens.js in an isolated
// temporary directory that mirrors just the relevant subtree, never the
// real repo: the unscoped (--ci, no --src-dir) code path this test
// exercises walks the script's OWN rootDir (derived from the script file's
// own location), so this is the only way to exercise that exact code path
// without writing an intentionally-bad fixture into the real, tracked
// repo — which would make the real tokens-audit CI check fail on every
// future PR.

import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, cpSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runWithTruncationRetry } from './support/run-with-truncation-retry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Identical, on purpose — see the file header comment.
const IDENTICAL_VIOLATION = '.example { color: #654321; }\n';

function buildIsolatedWorkspace() {
  let tmpRoot = mkdtempSync(join(tmpdir(), 'tokens-scope-'));
  tmpRoot = realpathSync(tmpRoot);

  mkdirSync(join(tmpRoot, 'scripts'), { recursive: true });
  cpSync(join(ROOT, 'scripts', 'audit-tokens.js'), join(tmpRoot, 'scripts', 'audit-tokens.js'));

  const locations = {
    excluded: join('clone', 'personnalisation', 'branding'),
    theme: join('clone', 'personnalisation', 'theme'),
    core: join('clone', 'core'),
  };

  for (const relDir of Object.values(locations)) {
    const dir = join(tmpRoot, relDir);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'fixture.css'), IDENTICAL_VIOLATION);
  }

  return { tmpRoot, locations };
}

test('PRIMITIVE_LAYER_PATHS excludes only clone/personnalisation/branding/', () => {
  const { tmpRoot, locations } = buildIsolatedWorkspace();
  try {
    const corePath = join(locations.core, 'fixture.css');

    function runOnce() {
      let output = '';
      try {
        output = execFileSync('node', [join(tmpRoot, 'scripts', 'audit-tokens.js'), '--ci'], {
          encoding: 'utf8',
          cwd: tmpRoot,
        });
      } catch (error) {
        output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      }
      return { threw: false, output };
    }

    // Bounded retry, workaround for #118 (see support/run-with-truncation-retry.mjs)
    // — only kicks in when the capture looks truncated, never unconditionally.
    // Anchored on corePath rather than "CI: failed" alone, since either one
    // being present already proves the run reached this fixture's section.
    const { output } = runWithTruncationRetry(runOnce, corePath);

    const excludedPath = join(locations.excluded, 'fixture.css');
    const themePath = join(locations.theme, 'fixture.css');

    expect(
      output,
      `clone/personnalisation/branding/ is the documented primitive-authoring layer — identical content must not be reported (saw: ${excludedPath})`
    ).not.toContain(excludedPath);
    expect(
      output,
      `clone/personnalisation/theme/ must stay in scope — identical content, different path (expected to find: ${themePath})`
    ).toContain(themePath);
    expect(
      output,
      `clone/core/ must stay in scope — identical content, different path (expected to find: ${corePath})`
    ).toContain(corePath);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
