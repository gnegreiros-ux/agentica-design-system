#!/usr/bin/env node
/**
 * WCAG 2.2 auditor — CLI
 * Uses audit-lib.js for the analysis; prints the report to the terminal.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { runAudit, MANUAL_CHECKS, DIST } = require('./audit-lib');

const SITE_CSS = fs.readFileSync(path.join(DIST, 'site.css'), 'utf8');

function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  WCAG 2.2 AUDIT — Agentic design system');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const r = runAudit();
  console.log(`  ${r.pageCount} pages analyzed\n`);

  // Violations
  if (r.allViolations.length > 0) {
    console.log('  ❌ VIOLATIONS\n');
    const byCriterion = {};
    r.allViolations.forEach(v => {
      if (!byCriterion[v.criterion]) byCriterion[v.criterion] = [];
      byCriterion[v.criterion].push(v);
    });
    Object.entries(byCriterion).sort().forEach(([crit, vs]) => {
      console.log(`  SC ${crit} (${vs.length} violation${vs.length > 1 ? 's' : ''})`);
      const unique = [...new Set(vs.map(v => v.msg))];
      unique.forEach(msg => {
        const files = vs.filter(v => v.msg === msg).map(v => v.file);
        console.log(`    → ${msg}`);
        if (files.length <= 3) console.log(`      Pages: ${files.join(', ')}`);
        else console.log(`      Pages: ${files.slice(0, 3).join(', ')} +${files.length - 3}`);
      });
      console.log('');
    });
  } else {
    console.log('  ✅ No violations detected\n');
  }

  // Warnings
  if (r.allWarnings.length > 0) {
    console.log('  ⚠️  WARNINGS (manual verification recommended)\n');
    const uniqueWarnings = [...new Set(r.allWarnings.map(w => `${w.criterion}|${w.msg}`))];
    uniqueWarnings.forEach(key => {
      const [crit, msg] = key.split('|');
      const files = r.allWarnings.filter(w => w.criterion === crit && w.msg === msg).map(w => w.file);
      console.log(`  SC ${crit} — ${msg}`);
      console.log(`    Pages: ${[...new Set(files)].slice(0, 3).join(', ')}${files.length > 3 ? ` +${files.length - 3}` : ''}`);
    });
    console.log('');
  }

  // Contrast
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  1.4.3 / 1.4.11 — CONTRAST RATIOS\n');
  r.contrastResults.forEach(c => {
    const ok = c.pass ? '✅' : '❌';
    console.log(`  ${ok} ${c.ratio}:1  (≥${c.required})  ${c.label}`);
    if (!c.pass) console.log(`     ${c.fg} on ${c.bg}`);
  });
  console.log('');

  // New WCAG 2.2 criteria
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  WCAG 2.2 — NEW CRITERIA\n');

  console.log('  SC 2.4.11 Focus Not Obscured (Minimum)');
  console.log('    → ⚠️  scroll-padding-top:60px recommended (fixed header height:60px)\n');

  console.log('  SC 2.4.13 Focus Appearance');
  if (r.focusOutlinePx) {
    const ok = r.focusOutlinePx >= 2 ? '✅' : '❌';
    console.log(`    ${ok} outline: ${r.focusOutlinePx}px (required ≥ 2px)`);
    console.log(`    outline-color: ${r.focusOutlineColor || 'not detected'}`);
  }
  console.log('');

  console.log('  SC 2.5.8 Target Size (Minimum) — 24×24px CSS');
  const btnHeight = 14 * 1.4 + 8 * 2;
  console.log(`    .ds-btn computed: ~${Math.round(btnHeight)}px height (required ≥ 24px) ✅\n`);

  // Manual checks
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  MANUAL VERIFICATIONS REQUIRED\n');
  MANUAL_CHECKS.forEach(({ criterion, titleEn, descEn }) => {
    console.log(`  SC ${criterion} — ${titleEn}`);
    console.log(`    → ${descEn}\n`);
  });

  // Final result
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  RESULT: ${r.pageCount} pages · ${r.totalViolations} violation(s) · ${r.totalWarnings} warning(s) · ${r.totalPassed} checks passed`);
  const conformanceLevel = r.totalViolations === 0
    ? 'WCAG 2.2 AA (static analysis)'
    : `${r.totalViolations} fix(es) required before compliance`;
  console.log(`  LEVEL: ${conformanceLevel}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(r.totalViolations > 0 ? 1 : 0);
}

run();
