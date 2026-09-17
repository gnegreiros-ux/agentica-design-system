// C3-02 (reduced scope, decided 2026-09-13) — negative test on a direct
// core/ modification.
//
// The original test called for two things: (1) the modification is
// detected, and (2) a reinstall replaces it without silently losing the
// personalization. (1) is not testable today — verified by inventory, no
// mechanism anywhere in this repo (script, checksum, manifest, scheduled
// check) detects a direct edit to a file under clone/core/. Building one
// here would mean inventing a bespoke detector never asked for, or a piece
// of the npm-package update governance this lot explicitly defers (C3-03/
// 04/05/07) — building either just to make this test pass is exactly the
// kind of maquette the lot's instructions forbid. Tracked as its own gap:
// https://github.com/gnegreiros-ux/agentica-design-system/issues/121
//
// This test proves the narrower, real claim instead: a fresh copy of
// core/ (a "reinstall") overwrites a direct edit made to an installed
// copy, and the personalization living alongside it survives byte-for-byte
// untouched. No detection is asserted — only the replace-without-loss
// boundary, which needs no new mechanism to exercise: it's a plain file
// copy over an existing directory.

import { test, expect } from '@playwright/test';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLONE_DIR = join(ROOT, 'clone');

test('reinstalling core/ replaces a direct modification without losing personalization', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'clone-reinstall-'));
  try {
    // Simulated "installed" copy — this is the tree a team would have on
    // disk after adopting the Clone. Never the real, tracked clone/.
    const installedClone = join(tmpRoot, 'installed');
    cpSync(CLONE_DIR, installedClone, { recursive: true });

    // Legitimate personalization already in place before the incident.
    const personalizationFile = join(installedClone, 'personnalisation', 'branding', 'test-personalization.md');
    const personalizationContent = '# Team branding\n\nprimitive.color.brand.500 = #336699\n';
    writeFileSync(personalizationFile, personalizationContent);

    // The incident: someone edits a core file directly, exactly what
    // GOVERNANCE.md and clone/core/README.md say never happens.
    const coreFile = join(installedClone, 'core', 'audit', 'index.mjs');
    const pristineCoreFileContent = readFileSync(coreFile, 'utf8');
    writeFileSync(coreFile, `${pristineCoreFileContent}\n// unauthorized direct edit\n`);
    expect(readFileSync(coreFile, 'utf8')).toContain('unauthorized direct edit');

    // The reinstall: a fresh copy of core/ from the canonical source,
    // exactly what re-running the Clone's installation step would do.
    cpSync(join(CLONE_DIR, 'core'), join(installedClone, 'core'), { recursive: true, force: true });

    expect(
      readFileSync(coreFile, 'utf8'),
      'A reinstall must fully replace a directly modified core file, leaving no trace of the edit'
    ).toBe(pristineCoreFileContent);

    expect(
      readFileSync(personalizationFile, 'utf8'),
      'A core reinstall must never touch, let alone lose, the personalization living alongside it'
    ).toBe(personalizationContent);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
