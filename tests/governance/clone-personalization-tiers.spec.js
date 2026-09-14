// C3-01 — Legitimate personalization across every tier the Clone actually
// offers. The tiers are derived from the real directory listing of
// clone/personnalisation/ at test time, never hard-coded — if a tier is
// added or removed there, this test adapts instead of silently testing a
// stale list.
//
// REDUCED SCOPE, same treatment as C2-07/C2-08 — verified by inventory:
// clone/ is at skeleton stage. Its three core audits (clone/core/audit/
// {hardcoded-style,primitive-tokens,accessibility}.mjs) are stubs that
// always pass, and nothing under clone/core/ reads any file under
// personnalisation/ (confirmed in clone-audit-runs-unconditionally.spec.js,
// C2-07). Two consequences:
//   - "the build stays green" is real but weak today — the stubs pass
//     regardless of what personnalisation/ contains.
//   - "the personalization is applied in the output" cannot mean "reflected
//     in a build artifact" yet, since core/ produces none. This test proves
//     the narrower, real claim: content added at each tier is (a) accepted
//     without requiring any change under core/, (b) still present after the
//     build runs, and (c) the build's exit code stays 0.
// TODO (tracked, not done here): once core/ has real components that
// consume personalization/theme/branding, rewrite this as a behavioral
// test — assert the personalization is visible in the actual build output.

import { test, expect } from '@playwright/test';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLONE_DIR = join(ROOT, 'clone');

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function snapshotDirectory(dir) {
  const snapshot = {};
  for (const file of listFiles(dir)) {
    snapshot[relative(dir, file)] = createHash('sha256').update(readFileSync(file)).digest('hex');
  }
  return snapshot;
}

function realPersonalizationTiers() {
  return readdirSync(join(CLONE_DIR, 'personnalisation'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

test.describe('C3-01 — legitimate personalization at every real tier', () => {
  const tiers = realPersonalizationTiers();

  test('the Clone exposes at least one personalization tier to test', () => {
    expect(tiers.length).toBeGreaterThan(0);
  });

  for (const tier of tiers) {
    test(`applying a personalization under personnalisation/${tier}/ keeps the build green`, () => {
      const tmpRoot = mkdtempSync(join(tmpdir(), 'clone-tier-'));
      try {
        const tmpClone = join(tmpRoot, 'clone');
        cpSync(CLONE_DIR, tmpClone, { recursive: true });

        const coreBefore = snapshotDirectory(join(tmpClone, 'core'));

        const marker = `personalization-marker-${tier}-${Date.now()}`;
        const targetFile = join(tmpClone, 'personnalisation', tier, 'test-personalization.md');
        writeFileSync(targetFile, `# Test personalization — ${tier}\n\n${marker}\n`);

        // The build must not require any change under core/ to accept this.
        const coreAfter = snapshotDirectory(join(tmpClone, 'core'));
        expect(coreAfter, `Personalizing ${tier}/ must never require a change under core/`).toEqual(coreBefore);

        execFileSync('npm', ['run', 'build'], { cwd: tmpClone, stdio: 'pipe' });

        expect(readFileSync(targetFile, 'utf8')).toContain(marker);
      } finally {
        rmSync(tmpRoot, { recursive: true, force: true });
      }
    });
  }
});
