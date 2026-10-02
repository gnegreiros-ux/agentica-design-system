// Guards what C3-08 (cold walkthrough of the personalization guide, run
// 2026-09-29) found: someone holding only the published Clone package was
// blocked before reading a single line of guidance — no entry point at the
// package root, nothing saying what to install, and the guide pointing to
// files (GOVERNANCE.md, a Master Skill phase) that the package doesn't ship.
//
// Everything here reads the package exactly as npm would publish it
// (`npm pack --dry-run --json`), not the clone/ directory as a whole: a file
// sitting in clone/ but excluded from the tarball is as missing to the reader
// as a file that doesn't exist.
//
// Three claims:
// 1. The package ships a root README.md that names the guide, the checklist
//    and the verification command.
// 2. Every `npm run <script>` the shipped docs tell the reader to run exists
//    in the package's own scripts — lines explicitly addressed to the
//    canonical repository excepted.
// 3. Every file path the shipped docs reference in backticks resolves inside
//    the package — except GOVERNANCE.md, allowed only where the same file
//    also points to its shipped copy, and the files the README tells the
//    reader to create.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLONE_DIR = join(ROOT, 'clone');
const SHIPPED_GOVERNANCE_COPY = 'non-negotiable-foundation.md';

// Files the README tells the reader to create — referenced before they exist
// by design. Each must appear in README.md's suggested-file table.
const FILES_THE_READER_CREATES = ['tokens.json', 'decisions.md', 'triggers.md', 'config.json'];

function packedFiles() {
  const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: CLONE_DIR, encoding: 'utf8' });
  return JSON.parse(raw)[0].files.map((file) => file.path);
}

function shippedMarkdown() {
  return packedFiles()
    .filter((path) => path.endsWith('.md'))
    .map((path) => ({ path, text: readFileSync(join(CLONE_DIR, path), 'utf8') }));
}

test('the Clone package ships a root README.md that names the guide, the checklist and the verification command', () => {
  const files = packedFiles();
  expect(files, 'the published Clone package has no README.md at its root — a reader has no entry point (C3-08)').toContain('README.md');

  const readme = readFileSync(join(CLONE_DIR, 'README.md'), 'utf8');
  for (const needle of ['personnalisation/GUIDE.md', 'personnalisation/CHECKLIST.md', 'npm run build']) {
    expect(readme, `README.md must mention ${needle}`).toContain(needle);
  }
  for (const name of FILES_THE_READER_CREATES) {
    expect(readme, `FILES_THE_READER_CREATES lists ${name}, but README.md doesn't suggest creating it — stale entry`).toContain(`\`${name}\``);
  }
});

test('every `npm run <script>` in the shipped docs exists in the Clone package itself', () => {
  const scripts = JSON.parse(readFileSync(join(CLONE_DIR, 'package.json'), 'utf8')).scripts ?? {};
  for (const { path, text } of shippedMarkdown()) {
    for (const line of text.split('\n')) {
      // A command explicitly addressed to the canonical repository (e.g. the
      // generated governance copy's "do not edit" note) is not for the reader.
      if (line.includes('canonical repository')) continue;
      for (const match of line.matchAll(/npm run ([\w:.-]+)/g)) {
      expect(
        Object.keys(scripts),
        `${path} tells the reader to run \`npm run ${match[1]}\`, which the Clone package doesn't define`
      ).toContain(match[1]);
      }
    }
  }
});

test('every file path referenced in the shipped docs resolves inside the package', () => {
  const files = new Set(packedFiles());
  for (const { path, text } of shippedMarkdown()) {
    const fileDir = dirname(path);
    for (const match of text.matchAll(/`([^`\s]+\.(?:md|json|mjs|js))`/g)) {
      const ref = match[1];
      const base = ref.split('/').pop();

      if (ref === 'GOVERNANCE.md') {
        // The shipped copy itself names its source — that's not a dangling reference.
        if (path.endsWith(SHIPPED_GOVERNANCE_COPY)) continue;
        expect(
          text.includes(SHIPPED_GOVERNANCE_COPY),
          `${path} cites GOVERNANCE.md, which the package doesn't ship, without pointing to its shipped copy (${SHIPPED_GOVERNANCE_COPY})`
        ).toBe(true);
        continue;
      }
      if (FILES_THE_READER_CREATES.includes(base)) continue;

      // A bare file name (no directory) is a generic mention, e.g. "each
      // subfolder's `example.md`": it must match at least one shipped file.
      const bareNameShipped = !ref.includes('/') && [...files].some((file) => file.split('/').pop() === ref);
      const candidates = [normalize(join(fileDir, ref)), normalize(ref)];
      expect(
        bareNameShipped || candidates.some((candidate) => files.has(candidate) && existsSync(join(CLONE_DIR, candidate))),
        `${path} references \`${ref}\`, which is not in the published package`
      ).toBe(true);
    }
  }
});
