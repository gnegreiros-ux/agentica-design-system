#!/usr/bin/env node

/**
 * check-commit-messages.js — Conventional Commits format gate
 * Design system team — internal use
 *
 * Enforces governance/rules/git-workflow.md's commit convention:
 *   type(scope): short description
 * (scope optional). Types allowed are exactly the ones in that file's table —
 * feat, fix, token, docs, a11y, style, refactor, test, chore, ci. A type not
 * in that list is a real governance question (should it be added to the
 * table?), not something this script silently accepts.
 *
 * Scope: only the commits a pull request actually introduces — every commit
 * already on `main` was necessarily checked (or grandfathered) when it
 * merged, so re-validating all of history on every push would be noise, not
 * signal. Merge commits ("Merge pull request #…", "Merge branch …") are
 * GitHub/git-generated and exempt.
 *
 * Usage:
 *   node scripts/check-commit-messages.js <base-sha> <head-sha>
 *   node scripts/check-commit-messages.js <base-sha> <head-sha> --ci   → exit 1 on any violation
 */

import { execSync } from 'child_process';

const CI_MODE = process.argv.includes('--ci');
const [base, head] = process.argv.slice(2).filter(a => !a.startsWith('--'));

const RESET = '\x1b[0m', RED = '\x1b[31m', GREEN = '\x1b[32m', CYAN = '\x1b[36m', BOLD = '\x1b[1m';
function ok(msg)    { console.log(`${GREEN}  ✓${RESET} ${msg}`); }
function error(msg) { console.log(`${RED}  ✗${RESET} ${msg}`); }

if (!base || !head) {
  console.error('Usage: node scripts/check-commit-messages.js <base-sha> <head-sha> [--ci]');
  process.exit(2);
}

const TYPES = ['feat', 'fix', 'token', 'docs', 'a11y', 'style', 'refactor', 'test', 'chore', 'ci'];
const PATTERN = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9./-]+\\))?: .+`);
const MERGE_PATTERN = /^Merge (pull request|branch|remote-tracking branch)/;

console.log(`\n${BOLD}Commit message format — Conventional Commits gate${RESET}`);
console.log(`${CYAN}${'─'.repeat(40)}${RESET}`);

let subjects;
try {
  subjects = execSync(`git log --format=%H%x1f%s "${base}..${head}"`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map(line => { const [sha, subject] = line.split('\x1f'); return { sha, subject }; });
} catch (e) {
  console.error(`Could not read commit range ${base}..${head}: ${e.message}`);
  process.exit(2);
}

if (subjects.length === 0) {
  ok('No new commits in range — nothing to check');
  process.exit(0);
}

let violations = 0;
for (const { sha, subject } of subjects) {
  if (MERGE_PATTERN.test(subject)) continue;
  if (PATTERN.test(subject)) {
    ok(`${sha.slice(0, 7)}  ${subject}`);
  } else {
    error(`${sha.slice(0, 7)}  ${subject}`);
    error(`         → expected "type(scope): description" or "type: description", type one of: ${TYPES.join(', ')}`);
    violations++;
  }
}

console.log(`\n${BOLD}Summary${RESET}`);
if (violations === 0) {
  console.log(`${GREEN}${BOLD}  ✓ Every commit in range follows the convention${RESET}\n`);
} else {
  console.log(`${RED}${BOLD}  ✗ ${violations} commit(s) don't follow governance/rules/git-workflow.md's convention${RESET}\n`);
  if (CI_MODE) process.exit(1);
}
