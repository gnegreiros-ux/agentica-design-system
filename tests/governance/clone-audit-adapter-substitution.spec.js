// C2-08 (reduced scope) — clone/core has no real engine wired to axe-core
// yet at this skeleton stage: the default "axe-core" adapter in
// clone/core/audit/accessibility.mjs is itself a stub ("no core components
// to scan yet"), not real axe-core. This test therefore proves only the
// narrower, real claim: substituting a fake adapter into the exported
// runAccessibilityAudit(adapter) interface produces the substituted
// adapter's verdict, and modifies zero files under clone/core/. It does
// NOT prove "a real engine was swapped for axe-core" — there is no real
// engine here to swap out.

import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAccessibilityAudit } from '../../clone/core/audit/accessibility.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLONE_CORE_DIR = join(ROOT, 'clone', 'core');

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
    const stat = statSync(file);
    snapshot[relative(dir, file)] = {
      size: stat.size,
      hash: createHash('sha256').update(readFileSync(file)).digest('hex'),
    };
  }
  return snapshot;
}

test('substituting an audit adapter touches no file under clone/core/', async () => {
  const before = snapshotDirectory(CLONE_CORE_DIR);

  const fakeAdapter = {
    name: 'fake-engine',
    async run() {
      return { passed: false, message: 'fake engine — predictable, deterministic verdict' };
    },
  };
  const result = await runAccessibilityAudit(fakeAdapter);

  expect(result.name).toBe('accessibility (fake-engine)');
  expect(result.passed).toBe(false);
  expect(result.message).toBe('fake engine — predictable, deterministic verdict');

  const after = snapshotDirectory(CLONE_CORE_DIR);
  expect(after, 'Substituting an audit adapter must not modify any file under clone/core/').toEqual(before);
});
