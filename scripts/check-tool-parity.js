#!/usr/bin/env node

/**
 * check-tool-parity.js — AI tool parity attestation gate
 * Design system team — internal use
 *
 * Context: AGENTS.md + governance/rules/ + governance/instructions/ make this
 * repo's rules readable by any AI coding tool, but the mandatory pre-commit
 * checks (governance/ai-skills-reference.md's "Pipelines" table) only *execute*
 * as Claude Code Skills today. A team plugging in a different tool otherwise gets
 * the rulebook with no signal about which enforcement they're missing.
 *
 * This script closes that gap for the "did anyone even look at this" part: it
 * scans the repo for known AI-tool config paths (Claude Code's .claude/ itself is
 * the reference implementation and is exempt), and for each one found, requires a
 * matching governance/tool-parity/<slug>.md attestation — one row per mandatory
 * control, each explicitly marked "Replaced: <how>" or "Accepted absence: <why>",
 * signed with a name and a date. A missing attestation, a row still saying the
 * template's "_TODO_", or a signed-off row missing its name/date, all fail the
 * check. This does NOT verify the control is actually well-replaced — it verifies
 * a human made and recorded an explicit call, which is what it can enforce.
 *
 * Usage:
 *   node scripts/check-tool-parity.js
 *   node scripts/check-tool-parity.js --ci   → exit 1 on any violation
 *
 * To add a newly-adopted tool: add its detection path(s) to TOOL_CONFIGS below,
 * then `cp governance/tool-parity/TEMPLATE.md governance/tool-parity/<slug>.md`
 * and fill it in — see that template for the exact format this script parses.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');

const CI_MODE = process.argv.includes('--ci');

const RESET = '\x1b[0m', RED = '\x1b[31m', YELLOW = '\x1b[33m', GREEN = '\x1b[32m', CYAN = '\x1b[36m', BOLD = '\x1b[1m';
function ok(msg)        { console.log(`${GREEN}  ✓${RESET} ${msg}`); }
function warn(msg)      { console.log(`${YELLOW}  ⚠${RESET} ${msg}`); }
function error(msg)     { console.log(`${RED}  ✗${RESET} ${msg}`); }
function section(title) { console.log(`\n${BOLD}${CYAN}── ${title} ${RESET}`); }

// ─── Known AI-tool config surfaces ─────────────────────────────────────────────
// .claude/ is intentionally absent — it's the reference implementation these
// controls are defined against, not a tool needing to attest parity with itself.
// Add a tool here the moment its config file/dir first lands in the repo, using
// only conventions confirmed by that tool's own docs (don't guess a path).
const TOOL_CONFIGS = {
  // Codex CLI has no repo-level config file of its own to detect — verified
  // against developers.openai.com/codex docs (2026-09-11): it reads root/nested
  // AGENTS.md like every other tool here, with no Codex-specific marker file.
  // (A prior `.codex/hooks.json` in this repo turned out to be exactly that
  // mistake — a fabricated path mimicking Claude's hook schema, which Codex
  // has no mechanism to read at all. Don't reintroduce a `.codex` entry
  // without a verified, official Codex doc naming a real repo-level file.)
  copilot:  ['.github/copilot-instructions.md', '.github/instructions'],
  cursor:   ['.cursor', '.cursorrules'],
  windsurf: ['.windsurf', '.windsurfrules'],
  // Gemini CLI: GEMINI.md is its default context filename (configurable via
  // context.fileName in settings.json), and .gemini/settings.json carries a
  // real hooks system structurally close to Claude Code's — verified against
  // geminicli.com/docs (2026-09-11).
  gemini:   ['.gemini', 'GEMINI.md'],
};

// tokens-audit, language-audit, site, and commit are deliberately absent: as of
// 2026-09-11 they're tool-agnostic CI gates (.github/workflows/tokens-audit.yml,
// lang-audit.yml, site-freshness.yml, commit-lint.yml) that run identically for
// every tool and human. There's no per-tool decision left to attest for them —
// asking every new tool's attestation to re-declare "Replaced: universal CI"
// would be pure busywork. Only list a control here if its enforcement can
// legitimately differ depending on which AI tool is driving the session.
const REQUIRED_CONTROLS = [
  'wcag', 'ux-patterns', 'adr-conformity', 'adr-triggers', 'docs', 'chromatic', 'axe-core',
];

function detectTools() {
  const found = {};
  for (const [slug, candidates] of Object.entries(TOOL_CONFIGS)) {
    const hit = candidates.find(p => fs.existsSync(path.join(ROOT, p)));
    if (hit) found[slug] = hit;
  }
  return found;
}

// Parses the "| control | reference | Decision | Confirmed by | Date |" table
// rows this script's TEMPLATE.md defines. Deliberately line-based, not a full
// Markdown table parser — the template's shape is the contract.
function parseAttestation(content) {
  const rows = {};
  for (const line of content.split('\n')) {
    if (!/^\|\s*[a-z-]+\s*\|/.test(line)) continue;
    const control = line.match(/^\|\s*([a-z-]+)\s*\|/)[1];
    if (!REQUIRED_CONTROLS.includes(control)) continue;
    // Full split (not a lazy regex) so a stray literal "|" inside a cell — e.g.
    // an escaped "Write\|Edit" or a shell pipe quoted in prose — surfaces as a
    // malformed row instead of silently shifting columns and passing by accident.
    const cells = line.split('|').map(c => c.trim());
    // A well-formed "| control | reference | decision | confirmed by | date |"
    // row split on "|" yields 7 entries: '', control, reference, decision,
    // confirmedBy, date, ''.
    if (cells.length !== 7) {
      rows[control] = { malformed: true };
      continue;
    }
    const [, , , decision, confirmedBy, date] = cells;
    rows[control] = { decision, confirmedBy, date };
  }
  return rows;
}

function validAttestationRow(row) {
  if (!row) return { valid: false, reason: 'row missing from the table' };
  if (row.malformed) {
    return { valid: false, reason: 'malformed row — unexpected number of "|"-separated columns (check for a stray literal "|" inside a cell)' };
  }
  if (!row.decision || row.decision.includes('_TODO_')) {
    return { valid: false, reason: 'Decision still a placeholder' };
  }
  if (!/^(Replaced:|Accepted absence:)\s*\S/.test(row.decision)) {
    return { valid: false, reason: 'Decision must start with "Replaced: " or "Accepted absence: " followed by real content' };
  }
  if (!row.confirmedBy) return { valid: false, reason: '"Confirmed by" is empty — a human must sign this' };
  if (!row.date)        return { valid: false, reason: '"Date" is empty' };
  return { valid: true };
}

function main() {
  console.log(`\n${BOLD}AI tool parity — attestation gate${RESET}`);
  console.log(`${CYAN}${'─'.repeat(40)}${RESET}`);

  const detected = detectTools();
  const slugs = Object.keys(detected);

  section('Detected tool configs');
  if (slugs.length === 0) {
    ok('No non-Claude AI tool config detected — nothing to attest');
    console.log(`\n${GREEN}${BOLD}  ✓ Nothing to check${RESET}\n`);
    process.exit(0);
  }
  slugs.forEach(slug => console.log(`  · ${slug}  →  ${detected[slug]}`));

  section('Attestations');
  let violations = 0;

  for (const slug of slugs) {
    const attestationPath = path.join(ROOT, 'governance', 'tool-parity', `${slug}.md`);
    if (!fs.existsSync(attestationPath)) {
      error(`${slug}: no attestation at governance/tool-parity/${slug}.md`);
      error(`         → cp governance/tool-parity/TEMPLATE.md governance/tool-parity/${slug}.md and fill it in`);
      violations++;
      continue;
    }

    const rows = parseAttestation(fs.readFileSync(attestationPath, 'utf8'));
    const missingOrInvalid = [];
    for (const control of REQUIRED_CONTROLS) {
      const { valid, reason } = validAttestationRow(rows[control]);
      if (!valid) missingOrInvalid.push(`${control} (${reason})`);
    }

    if (missingOrInvalid.length === 0) {
      ok(`${slug}: governance/tool-parity/${slug}.md — all ${REQUIRED_CONTROLS.length} controls signed off`);
    } else {
      error(`${slug}: governance/tool-parity/${slug}.md incomplete`);
      missingOrInvalid.forEach(m => error(`         → ${m}`));
      violations += missingOrInvalid.length;
    }
  }

  section('Summary');
  if (violations === 0) {
    console.log(`${GREEN}${BOLD}  ✓ Every detected tool has a complete attestation${RESET}`);
  } else {
    console.log(`${RED}${BOLD}  ✗ ${violations} unresolved control(s) across ${slugs.length} tool(s)${RESET}`);
    console.log(`  A human owner must either wire the equivalent control for that tool and record\n  how ("Replaced: …"), or explicitly accept it's absent ("Accepted absence: …") —\n  see governance/tool-parity/TEMPLATE.md.`);
  }
  console.log('');

  if (CI_MODE && violations > 0) process.exit(1);
}

main();
