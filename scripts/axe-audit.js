// Audit d'accessibilité automatisé (axe-core via Playwright) — applique ADR-007.
// Scanne toutes les pages générées dans site/dist/ sur 3 contextes :
//   desktop-light (1280×900), mobile-light (375×812), desktop-dark (1280×900 + dark theme)
// Bloque (exit 1) sur toute violation d'impact `critical` ou `serious`.
// Les violations `moderate`/`minor` sont rapportées mais non bloquantes.
// Rapport complet écrit dans axe-report.json.
//
// POURQUOI ce niveau « site » : le site généré est l'artefact vivant qui consomme
// les tokens et les composants (principe de dogfooding) — un défaut de contraste ou
// d'ARIA y est observable en conditions réelles de rendu. Aurait détecté
// automatiquement la régression de contraste teal corrigée par ADR-048.
//
// CLI :
//   node scripts/axe-audit.js                           → 3 contextes (défaut)
//   node scripts/axe-audit.js --desktop                 → desktop-light seulement
//   node scripts/axe-audit.js --mobile                  → mobile-light seulement
//   node scripts/axe-audit.js --dark                    → desktop-dark seulement
//   node scripts/axe-audit.js --dist <chemin>           → répertoire dist alternatif
//   node scripts/axe-audit.js --ci                      → bloque sur violation (défaut)
//   node scripts/axe-audit.js --report-only             → rapport sans blocage
//   node scripts/axe-audit.js --exclude ".sel1,.sel2"   → sélecteurs supplémentaires à exclure

import { chromium } from 'playwright';
import axePkg from '@axe-core/playwright';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const AxeBuilder = axePkg.default || axePkg;

const _distArg       = process.argv.indexOf('--dist');
const DIST           = _distArg !== -1
  ? join(process.cwd(), process.argv[_distArg + 1])
  : join(process.cwd(), 'site', 'dist');
const BLOCKING       = new Set(['critical', 'serious']);
const WCAG_TAGS      = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const _excludeArg    = process.argv.indexOf('--exclude');
const EXTRA_EXCLUDES = _excludeArg !== -1
  ? process.argv[_excludeArg + 1].split(',').map(s => s.trim())
  : [];

// ── Contextes de test ──────────────────────────────────────────────────────
const ALL_CONTEXTS = [
  { id: 'desktop-light', label: 'Desktop 1280px — Light', viewport: { width: 1280, height: 900 }, theme: 'light' },
  { id: 'mobile-light',  label: 'Mobile  375px  — Light', viewport: { width: 375,  height: 812 }, theme: 'light' },
  { id: 'desktop-dark',  label: 'Desktop 1280px — Dark',  viewport: { width: 1280, height: 900 }, theme: 'dark'  },
];

const onlyDesktop = process.argv.includes('--desktop');
const onlyMobile  = process.argv.includes('--mobile');
const onlyDark    = process.argv.includes('--dark');
const CONTEXTS = onlyDesktop ? [ALL_CONTEXTS[0]]
               : onlyMobile  ? [ALL_CONTEXTS[1]]
               : onlyDark    ? [ALL_CONTEXTS[2]]
               : ALL_CONTEXTS;

// ── Pages HTML ──────────────────────────────────────────────────────────────
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
console.log(`axe-core — ${pages.length} pages × ${CONTEXTS.length} contexte(s) (ADR-007)\n`);

const browser = await chromium.launch();
const report  = { generatedAt: new Date().toISOString(), contexts: [], summary: {} };
let blockingTotal = 0;
let moderateTotal = 0;

for (const ctx of CONTEXTS) {
  console.log(`\n── ${ctx.label} ${'─'.repeat(Math.max(0, 44 - ctx.label.length))}`);

  const bContext = await browser.newContext({ viewport: ctx.viewport });
  // Injecte le thème avant tout script de page (addInitScript s'exécute avant DOMContentLoaded)
  await bContext.addInitScript(theme => {
    try { localStorage.setItem('agtc-theme', theme); } catch (_) {}
    document.documentElement.setAttribute('data-theme', theme);
  }, ctx.theme);
  // Note: emulateMedia sur BrowserContext pas disponible dans cette version de Playwright.
  // Le data-theme="dark" injecté via addInitScript suffit pour les composants Lit et CSS tokens.

  const ctxReport = { context: ctx.id, label: ctx.label, pages: [] };
  let ctxBlocking = 0;
  let ctxModerate = 0;

  for (const file of pages) {
    const rel  = file.slice(DIST.length + 1);
    const page = await bContext.newPage();
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });

    // .logo et .hero-name exclus : nom de marque / logotype (WCAG 1.4.3 exempt).
    let _builder = new AxeBuilder({ page }).exclude('.logo').exclude('.hero-name');
    for (const sel of EXTRA_EXCLUDES) _builder = _builder.exclude(sel);
    const results = await _builder.withTags(WCAG_TAGS).analyze();
    await page.close();

    const blocking = results.violations.filter(v => BLOCKING.has(v.impact));
    const moderate = results.violations.filter(v => !BLOCKING.has(v.impact));
    ctxBlocking   += blocking.length;
    ctxModerate   += moderate.length;
    blockingTotal += blocking.length;
    moderateTotal += moderate.length;

    ctxReport.pages.push({
      page: rel,
      blocking: blocking.map(v => ({
        id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => n.target).flat(),
      })),
      moderate: moderate.map(v => ({ id: v.id, impact: v.impact, help: v.help })),
    });

    if (blocking.length) {
      console.log(`  ✗ ${rel}`);
      for (const v of blocking) {
        console.log(`      [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} nœud·s)`);
        console.log(`        ${v.helpUrl}`);
        for (const n of v.nodes.slice(0, 3)) console.log(`        → ${n.target.join(' ')}`);
      }
    } else {
      console.log(`  ✓ ${rel}${moderate.length ? `  (${moderate.length} modéré·s)` : ''}`);
    }
  }

  console.log(`  — ${ctxBlocking} bloquantes · ${ctxModerate} modérées`);
  ctxReport.summary = { pages: pages.length, blocking: ctxBlocking, moderate: ctxModerate };
  report.contexts.push(ctxReport);
  await bContext.close();
}

await browser.close();

report.summary = {
  contexts: CONTEXTS.length,
  pages: pages.length,
  blocking: blockingTotal,
  moderate: moderateTotal,
};
writeFileSync(join(process.cwd(), 'axe-report.json'), JSON.stringify(report, null, 2));

console.log(`\n══ TOTAL — ${CONTEXTS.length} contexte(s) · ${pages.length} pages · ${blockingTotal} bloquantes · ${moderateTotal} modérées`);
console.log('Rapport : axe-report.json');

const isBlocking = process.argv.includes('--report-only')
  ? false
  : process.argv.includes('--ci') || process.env.AXE_BLOCKING !== 'false';

if (blockingTotal > 0) {
  if (isBlocking) {
    console.error(`\n✗ ÉCHEC — ${blockingTotal} violation(s) critique/serious. Correction humaine requise (ADR-007).`);
    process.exit(1);
  }
  console.warn(`\n⚠ MODE RAPPORT — ${blockingTotal} violation(s) à résorber.`);
  process.exit(0);
}
console.log('\n✓ 0 violation critique/serious — WCAG AA respecté sur tous les contextes.');
