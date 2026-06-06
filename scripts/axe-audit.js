// Audit d'accessibilité automatisé (axe-core via Playwright) — applique ADR-007.
// Scanne toutes les pages générées dans site/dist/ et bloque (exit 1) sur toute
// violation d'impact `critical` ou `serious`. Les violations `moderate`/`minor`
// sont rapportées mais non bloquantes. Rapport complet écrit dans axe-report.json.
//
// POURQUOI ce niveau « site » : le site généré est l'artefact vivant qui consomme
// les tokens et les composants (principe de dogfooding) — un défaut de contraste ou
// d'ARIA y est observable en conditions réelles de rendu. Aurait détecté
// automatiquement la régression de contraste teal corrigée par ADR-048.

import { chromium } from 'playwright';
import axePkg from '@axe-core/playwright';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const AxeBuilder = axePkg.default || axePkg;

const DIST = join(process.cwd(), 'site', 'dist');
const BLOCKING = new Set(['critical', 'serious']);
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Liste récursivement toutes les pages .html du site généré.
function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out.sort();
}

const pages = htmlFiles(DIST);
console.log(`axe-core — audit de ${pages.length} pages générées (ADR-007)\n`);

const browser = await chromium.launch();
const context = await browser.newContext();
const report = { generatedAt: new Date().toISOString(), pages: [], summary: {} };
let blockingTotal = 0;
let moderateTotal = 0;

for (const file of pages) {
  const rel = file.slice(DIST.length + 1);
  const page = await context.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });

  // .logo et .hero-name exclus : le mot-symbole « Agentica » (en-tête + héros) est
  // un nom de marque / logotype, exempt de contraste par WCAG 1.4.3. Tout le reste
  // est audité.
  const results = await new AxeBuilder({ page })
    .exclude('.logo').exclude('.hero-name')
    .withTags(WCAG_TAGS).analyze();
  await page.close();

  const blocking = results.violations.filter((v) => BLOCKING.has(v.impact));
  const moderate = results.violations.filter((v) => !BLOCKING.has(v.impact));
  blockingTotal += blocking.length;
  moderateTotal += moderate.length;

  report.pages.push({
    page: rel,
    blocking: blocking.map((v) => ({
      id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => n.target).flat(),
    })),
    moderate: moderate.map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
  });

  if (blocking.length) {
    console.log(`✗ ${rel}`);
    for (const v of blocking) {
      console.log(`    [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} nœud·s)`);
      console.log(`      ${v.helpUrl}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`      → ${n.target.join(' ')}`);
    }
  } else {
    console.log(`✓ ${rel}${moderate.length ? `  (${moderate.length} modéré·s)` : ''}`);
  }
}

await browser.close();

report.summary = { pages: pages.length, blocking: blockingTotal, moderate: moderateTotal };
writeFileSync(join(process.cwd(), 'axe-report.json'), JSON.stringify(report, null, 2));

console.log(`\n— ${pages.length} pages · ${blockingTotal} bloquantes (critical/serious) · ${moderateTotal} modérées`);
console.log('Rapport : axe-report.json');

// Mode : bloquant par défaut (esprit ADR-007). AXE_BLOCKING=false → rapport seul
// (exit 0) pendant la phase de burn-down des violations héritées. Basculer en
// bloquant (retirer la variable du workflow) une fois 0 violation atteint.
const blocking = process.env.AXE_BLOCKING !== 'false';

if (blockingTotal > 0) {
  if (blocking) {
    console.error(`\n✗ ÉCHEC — ${blockingTotal} violation(s) critique/serious. Correction humaine requise (ADR-007).`);
    process.exit(1);
  }
  console.warn(`\n⚠ MODE RAPPORT — ${blockingTotal} violation(s) critique/serious à résorber (burn-down). Gate non bloquant pour l'instant (ADR-007, bascule prévue).`);
  process.exit(0);
}
console.log('\n✓ 0 violation critique/serious — WCAG AA (plancher automatique) respecté.');
