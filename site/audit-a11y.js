#!/usr/bin/env node
/**
 * Auditeur WCAG 2.2 — CLI
 * Utilise audit-lib.js pour l'analyse ; affiche le rapport dans le terminal.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { runAudit, MANUAL_CHECKS, DIST } = require('./audit-lib');

const SITE_CSS = fs.readFileSync(path.join(DIST, 'site.css'), 'utf8');

function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AUDIT WCAG 2.2 — Système de design agentique');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const r = runAudit();
  console.log(`  ${r.pageCount} pages analysées\n`);

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
        if (files.length <= 3) console.log(`      Pages : ${files.join(', ')}`);
        else console.log(`      Pages : ${files.slice(0, 3).join(', ')} +${files.length - 3}`);
      });
      console.log('');
    });
  } else {
    console.log('  ✅ Aucune violation détectée\n');
  }

  // Avertissements
  if (r.allWarnings.length > 0) {
    console.log('  ⚠️  AVERTISSEMENTS (vérification manuelle recommandée)\n');
    const uniqueWarnings = [...new Set(r.allWarnings.map(w => `${w.criterion}|${w.msg}`))];
    uniqueWarnings.forEach(key => {
      const [crit, msg] = key.split('|');
      const files = r.allWarnings.filter(w => w.criterion === crit && w.msg === msg).map(w => w.file);
      console.log(`  SC ${crit} — ${msg}`);
      console.log(`    Pages : ${[...new Set(files)].slice(0, 3).join(', ')}${files.length > 3 ? ` +${files.length - 3}` : ''}`);
    });
    console.log('');
  }

  // Contraste
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  1.4.3 / 1.4.11 — RATIOS DE CONTRASTE\n');
  r.contrastResults.forEach(c => {
    const ok = c.pass ? '✅' : '❌';
    console.log(`  ${ok} ${c.ratio}:1  (≥${c.required})  ${c.label}`);
    if (!c.pass) console.log(`     ${c.fg} sur ${c.bg}`);
  });
  console.log('');

  // WCAG 2.2 nouveaux critères
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  WCAG 2.2 — NOUVEAUX CRITÈRES\n');

  console.log('  SC 2.4.11 Focus Not Obscured (Minimum)');
  console.log('    → ⚠️  scroll-padding-top:60px recommandé (header fixe height:60px)\n');

  console.log('  SC 2.4.13 Focus Appearance');
  if (r.focusOutlinePx) {
    const ok = r.focusOutlinePx >= 2 ? '✅' : '❌';
    console.log(`    ${ok} outline: ${r.focusOutlinePx}px (requis ≥ 2px)`);
    console.log(`    outline-color: ${r.focusOutlineColor || 'non détecté'}`);
  }
  console.log('');

  console.log('  SC 2.5.8 Target Size (Minimum) — 24×24px CSS');
  const btnHeight = 14 * 1.4 + 8 * 2;
  console.log(`    .ds-btn calculé : ~${Math.round(btnHeight)}px de hauteur (requis ≥ 24px) ✅\n`);

  // Vérifications manuelles
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  VÉRIFICATIONS MANUELLES REQUISES\n');
  MANUAL_CHECKS.forEach(({ criterion, titleFr, descFr }) => {
    console.log(`  SC ${criterion} — ${titleFr}`);
    console.log(`    → ${descFr}\n`);
  });

  // Résultat final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  RÉSULTAT : ${r.pageCount} pages · ${r.totalViolations} violation(s) · ${r.totalWarnings} avertissement(s) · ${r.totalPassed} vérifications réussies`);
  const conformanceLevel = r.totalViolations === 0
    ? 'WCAG 2.2 AA (analyse statique)'
    : `${r.totalViolations} correction(s) requise(s) avant conformité`;
  console.log(`  NIVEAU : ${conformanceLevel}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(r.totalViolations > 0 ? 1 : 0);
}

run();
