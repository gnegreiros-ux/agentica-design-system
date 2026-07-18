#!/usr/bin/env node

/**
 * audit-language.js — English-only content audit (ADR-070, ADR-071, ADR-075)
 * Design system team — internal use
 *
 * Repository policy: all content is English-only, except two explicitly bilingual
 * zones — the public site (site/build.js, site/contenu.md) and the historical
 * ADR log (decisions/ADR-*.md, French preserved after a `<!-- FR -->` marker).
 * Everything else (root docs, guidelines/, .claude/, scripts/, .github/,
 * component code, starter-kit/, tokens/*.json) must be English-only.
 *
 * This script exists because that policy was previously enforced by hand, once,
 * per translation initiative — with no repeatable check to catch new French
 * content added afterward (see ADR-075: starter-kit/ was written in French
 * three days after ADR-071 made English mandatory for new content, and nothing
 * caught it until a manual pass weeks later).
 *
 * Detects, per tracked source file (outside the bilingual zones):
 *   1. French accented characters (à, é, è, ê, ë, ï, î, ô, ö, ù, û, ü, ç…)
 *   2. Unambiguous French stopwords, matched on word boundaries
 *
 * Usage:
 *   node scripts/audit-language.js
 *   node scripts/audit-language.js --ci   → exit 1 if anything is found
 *
 * Escape hatch: a line containing `lang-audit-ignore` is skipped — use sparingly,
 * for genuine false positives only (e.g. a French proper noun or quoted excerpt),
 * never to silence real leftover French content.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');

const CI_MODE = process.argv.includes('--ci');

// ─── Configuration ────────────────────────────────────────────────────────────

// Only scan file types that carry prose or user-facing strings.
const SCAN_EXTENSIONS = new Set(['.md', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.sh', '.yml', '.yaml', '.html', '.css']);

// Whole files that are bilingual by design — the FR content here is intentional,
// not leftover. site/dist/** and dist/** (generated mirrors of these) are excluded
// by directory prefix below.
const EXCLUDED_FILES = new Set([
  'site/build.js',
  'site/contenu.md',
  // Genuinely bilingual accessibility-audit tool — titleFr/descFr paired with
  // titleEn/descEn throughout, same convention as site/build.js.
  'site/audit-lib.js',
]);

// labelFr/labelEn is a recognized bilingual component feature (ADR-070 chantier 6:
// agtc-top-nav's labelFr/labelEn pairs are a real site feature, not residual content).
const LABEL_PAIR_RE = /\blabel(?:Fr|En)\s*:/;

// Directory prefixes excluded outright — generated output or vendored content.
const EXCLUDED_DIR_PREFIXES = [
  'site/dist/',
  'dist/',
  'packages/tokens/tokens/',
  'packages/tokens/css/',
  'packages/tokens/js/',
  'packages/tokens/tailwind/',
];

// decisions/ADR-*.md: bilingual historical log. French is legitimate but only
// AFTER a `<!-- FR -->` marker — only the English portion above it is audited.
const ADR_PATH_RE = /^decisions\/ADR-\d+-.*\.md$/;
const FR_MARKER = '<!-- FR -->';

// Unambiguous French stopwords — deliberately excludes words with plausible
// English collisions (e.g. "pour", "est") to keep false positives near zero.
const STOPWORDS = [
  'le', 'la', 'les', 'des', 'où', 'être', 'avec', 'dans', 'sur', 'sont',
  'cette', 'ces', 'équipe', 'système', 'chemin', 'aucun', 'aucune', 'jamais',
  'doit', 'doivent', 'ainsi', 'également', 'vérifier', 'règle', 'toujours', 'donc',
];
const STOPWORD_RE = new RegExp(`\\b(?:${STOPWORDS.join('|')})\\b`);
const ACCENT_RE = /[àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇœŒ]/;

// ─── Utilities ──────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';

function log(msg)       { console.log(msg); }
function ok(msg)        { console.log(`${GREEN}  ✓${RESET} ${msg}`); }
function error(msg)     { console.log(`${RED}  ✗${RESET} ${msg}`); }
function section(title) { console.log(`\n${BOLD}${CYAN}── ${title} ${RESET}`); }

function isExcluded(relPath) {
  if (EXCLUDED_FILES.has(relPath)) return true;
  return EXCLUDED_DIR_PREFIXES.some(prefix => relPath.startsWith(prefix));
}

// git ls-files respects .gitignore automatically — node_modules, test-results,
// playwright-report, storybook-static never need listing here.
function getTrackedFiles() {
  const output = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' });
  return output.split('\n').filter(Boolean);
}

// ─── Audit ────────────────────────────────────────────────────────────────────

function auditFile(relPath) {
  const ext = path.extname(relPath);
  if (!SCAN_EXTENSIONS.has(ext)) return [];
  if (isExcluded(relPath)) return [];

  let content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');

  // Bilingual ADR log: only the English portion above the FR marker is in scope.
  if (ADR_PATH_RE.test(relPath)) {
    const markerIdx = content.indexOf(FR_MARKER);
    if (markerIdx !== -1) content = content.slice(0, markerIdx);
  }

  const hits = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('lang-audit-ignore')) return;
    if (LABEL_PAIR_RE.test(line)) return;
    const accentMatch = line.match(ACCENT_RE);
    const stopwordMatch = line.match(STOPWORD_RE);
    if (!accentMatch && !stopwordMatch) return;
    hits.push({
      file: relPath,
      line: idx + 1,
      matched: (accentMatch || stopwordMatch)[0],
      text: line.trim().slice(0, 120),
    });
  });
  return hits;
}

function main() {
  log(`\n${BOLD}Audit — English-only content (ADR-070/071/075)${RESET}`);
  log(`${CYAN}${'─'.repeat(40)}${RESET}`);

  const files = getTrackedFiles();
  log(`${CYAN}Files tracked:${RESET} ${files.length}`);

  section('French content outside the bilingual zones');
  const allHits = files.flatMap(auditFile);

  if (allHits.length === 0) {
    ok('No French content detected outside site/, decisions/ADR-* FR sections');
  } else {
    allHits.forEach(h =>
      error(`${h.file}:${h.line}  →  "${h.matched}"  —  ${h.text}`)
    );
  }

  section('Summary');
  if (allHits.length === 0) {
    log(`\n${GREEN}${BOLD}  ✓ Clean — English-only outside the bilingual zones${RESET}\n`);
  } else {
    error(`${allHits.length} line(s) with French content detected`);
    log('');
  }

  if (CI_MODE && allHits.length > 0) {
    log(`${RED}CI: failed — translate or add lang-audit-ignore for a genuine false positive.${RESET}\n`);
    process.exit(1);
  }
}

main();
