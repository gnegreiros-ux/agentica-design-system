// Smoke test anti-régression — vérifie que les composants clés ont leurs tokens CSS résolus.
// Détecte les régressions comme "agtc-button a perdu tout son style" en vérifiant
// que les propriétés CSS calculées des Shadow DOM sont non-vides et non-transparentes.
//
// CLI :
//   node scripts/smoke-test.js
//   node scripts/smoke-test.js --report-only   → rapport sans blocage (exit 0)

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = join(process.cwd(), 'site', 'dist');
const REPORT_ONLY = process.argv.includes('--report-only');

// ── Contrats de composants — ce qui DOIT être résolu ──────────────────────
// Chaque entrée : { page, component, selector (dans shadow DOM), property, check }
// check: 'non-empty' | 'non-transparent' | (value) => boolean
const CONTRACTS = [
  // ── agtc-button ──────────────────────────────────────────────────────────
  {
    label: 'agtc-button primary — background non-transparent',
    page: 'components/button.html',
    host: 'agtc-button[variant="primary"]',
    shadowSelector: 'button.primary',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent',
  },
  {
    label: 'agtc-button primary — couleur de texte non-vide',
    page: 'components/button.html',
    host: 'agtc-button[variant="primary"]',
    shadowSelector: 'button.primary',
    property: 'color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  {
    label: 'agtc-button secondary — border non-transparent',
    page: 'components/button.html',
    host: 'agtc-button[variant="secondary"]',
    shadowSelector: 'button.secondary',
    property: 'border-top-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  {
    label: 'agtc-button critical — background non-transparent',
    page: 'components/button.html',
    host: 'agtc-button[variant="critical"]',
    shadowSelector: 'button.critical',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  // ── agtc-badge ───────────────────────────────────────────────────────────
  {
    label: 'agtc-badge success — background non-transparent',
    page: 'components/badge.html',
    host: 'agtc-badge[variant="success"]',
    shadowSelector: 'span.badge',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  // ── agtc-banner ──────────────────────────────────────────────────────────
  {
    label: 'agtc-banner info — background non-transparent',
    page: 'components/banner.html',
    host: 'agtc-banner[variant="info"]',
    shadowSelector: '.banner',
    property: 'background-color',
    check: v => v !== '' && v !== 'rgba(0, 0, 0, 0)',
  },
  // ── agtc-top-nav ─────────────────────────────────────────────────────────
  {
    label: 'agtc-top-nav — nav display flex (desktop)',
    page: 'index.html',
    host: 'agtc-top-nav',
    shadowSelector: 'nav',
    property: 'display',
    check: v => v === 'flex',
  },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const results = [];
let failures = 0;

console.log('smoke-test — anti-régression composants\n');

for (const contract of CONTRACTS) {
  const page = await context.newPage();
  const url  = pathToFileURL(join(DIST, contract.page)).href;
  await page.goto(url, { waitUntil: 'load' });

  // Attendre que le custom element soit défini et upgradé
  await page.waitForFunction(
    host => customElements.get(host.split('[')[0]) !== undefined,
    contract.host,
    { timeout: 5000 }
  ).catch(() => {});

  let value = '';
  let error = '';

  try {
    value = await page.evaluate(({ host, shadow, prop }) => {
      const el = document.querySelector(host);
      if (!el) return '__HOST_NOT_FOUND__';
      const shadowEl = el.shadowRoot?.querySelector(shadow);
      if (!shadowEl) return '__SHADOW_NOT_FOUND__';
      return window.getComputedStyle(shadowEl).getPropertyValue(prop).trim();
    }, { host: contract.host, shadow: contract.shadowSelector, prop: contract.property });
  } catch (e) {
    error = e.message;
    value = '__ERROR__';
  }

  await page.close();

  const pass = !error && value !== '__HOST_NOT_FOUND__' && value !== '__SHADOW_NOT_FOUND__'
    && value !== '__ERROR__' && contract.check(value);

  const status = pass ? '✓' : '✗';
  console.log(`${status} ${contract.label}`);
  if (!pass) {
    failures++;
    const reason = error || (value.startsWith('__') ? value : `valeur obtenue: "${value}"`);
    console.log(`    → ${reason}`);
  }

  results.push({ label: contract.label, pass, value, page: contract.page });
}

await browser.close();

writeFileSync(
  join(process.cwd(), 'smoke-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), results, failures }, null, 2)
);

console.log(`\n— ${CONTRACTS.length} contrats · ${failures} échec(s)`);
console.log('Rapport : smoke-report.json');

if (failures > 0) {
  if (REPORT_ONLY) {
    console.warn(`\n⚠ ${failures} contrat(s) de composant non respecté(s) — corriger avant merge.`);
    process.exit(0);
  }
  console.error(`\n✗ ÉCHEC — régression détectée sur ${failures} composant(s).`);
  process.exit(1);
}
console.log('\n✓ Tous les contrats de composants sont respectés.');
