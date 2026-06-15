'use strict';
/**
 * Fonctions d'audit WCAG 2.2 partagées entre audit-a11y.js (CLI) et build.js (page /audit).
 * N'exécute rien — exporte uniquement des fonctions pures.
 */

const fs   = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');

function getSiteCSS() {
  return fs.readFileSync(path.join(DIST, 'site.css'), 'utf8');
}

// ─── CONTRASTE ──────────────────────────────────────────────────────────────
function lum(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function cr(a, b) {
  const [L1, L2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return +((L1 + 0.05) / (L2 + 0.05)).toFixed(2);
}

const CONTRAST_PAIRS = [
  ['#ffffff', '#0d74ce', 'Button primary — texte sur fond',                  4.5],
  ['#202020', '#fcfcfc', 'Corps de texte sur fond de page',                  4.5],
  ['#202020', '#ffffff', 'Corps de texte sur surface',                       4.5],
  ['#646464', '#ffffff', 'Texte secondaire sur surface',                     4.5],
  ['#646464', '#fcfcfc', 'Texte secondaire sur fond de page',                4.5],
  ['#ffffff', '#ce2c31', 'Bouton critical — texte sur fond',                 4.5],
  ['#0d74ce', '#ffffff', 'Lien / sidebar actif — texte sur surface',         4.5],
  ['#0d74ce', '#fcfcfc', 'Lien sur fond de page',                           4.5],
  ['#0d74ce', '#fafafa', 'Lien sur ligne hover',                            4.5],
  ['#18794e', '#ecfdf5', 'Badge succès — texte sur fond (UI 1.4.11)',       3.0],
  ['#0d74ce', '#e8e8e8', 'Anneau focus sur bordure par défaut (1.4.11)',    3.0],
  ['#202020', '#f0f0f0', 'Texte sur fond subtil',                           4.5],
  ['#646464', '#f0f0f0', 'Texte secondaire sur fond subtil',                4.5],
  ['#767676', '#ffffff', 'Texte désactivé sur surface',                     4.5],
  ['#767676', '#fcfcfc', 'Texte désactivé sur fond page — exempt 1.4.3',   1.0],
];

// ─── PARSEUR HTML MINIMAL ───────────────────────────────────────────────────
function allTags(html, tag) {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>|<${tag}(\\s[^>]*)?/?>`, 'gi');
  return [...html.matchAll(re)].map(m => m[0]);
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return m ? m[1] : null;
}
function hasAttr(tag, name) {
  return new RegExp(`\\b${name}(?:="[^"]*"|\\b)`, 'i').test(tag);
}
function innerText(tag) {
  return tag.replace(/<[^>]+>/g, '').trim();
}

// ─── ANALYSE D'UNE PAGE ─────────────────────────────────────────────────────
function auditPage(html, file, SITE_CSS) {
  const violations = [];
  const warnings   = [];
  const passed     = [];

  function fail(criterion, msg) { violations.push({ criterion, msg, file }); }
  function warn(criterion, msg) { warnings.push({ criterion, msg, file }); }
  function pass(criterion, msg) { passed.push({ criterion, msg }); }

  // 3.1.1 Langue
  const langMatch = html.match(/<html[^>]+lang="([^"]*)"/i);
  if (!langMatch) fail('3.1.1', 'Attribut lang manquant sur <html>');
  else if (!langMatch[1]) fail('3.1.1', 'Attribut lang vide sur <html>');
  else pass('3.1.1', `lang="${langMatch[1]}"`);

  // 2.4.2 Titre
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) fail('2.4.2', '<title> absent ou vide');
  else pass('2.4.2', `title="${titleMatch[1].trim().slice(0, 60)}"`);

  // 2.4.1 Skip link
  if (!html.includes('skip-link')) fail('2.4.1', 'Pas de lien d\'évitement (skip link)');
  else pass('2.4.1', 'Lien d\'évitement présent');

  // 4.1.1 Landmarks
  if (!html.match(/<main[\s>]/i)) fail('4.1.1', 'Pas d\'élément <main>');
  else pass('4.1.1', '<main> présent');
  if (!html.match(/<header[\s>]/i)) warn('1.3.1', 'Pas d\'élément <header>');
  if (!html.match(/<nav[\s>]/i))    warn('1.3.1', 'Pas d\'élément <nav>');

  const mainEl = html.match(/<main[^>]*>/i)?.[0] || '';
  if (mainEl && !mainEl.includes('role')) pass('4.1.2', '<main> fournit role=main implicite');

  // 1.1.1 Alt text
  const imgs = html.match(/<img[^>]*>/gi) || [];
  imgs.forEach(img => {
    if (!hasAttr(img, 'alt')) fail('1.1.1', `<img> sans alt : ${img.slice(0, 80)}`);
  });
  if (imgs.length === 0) pass('1.1.1', 'Aucune image — N/A');

  // 4.1.2 Boutons
  const buttons = allTags(html, 'button');
  buttons.forEach(btn => {
    const text            = innerText(btn);
    const ariaLabel       = attr(btn, 'aria-label');
    const ariaLabelledBy  = attr(btn, 'aria-labelledby');
    if (!text && !ariaLabel && !ariaLabelledBy) {
      fail('4.1.2', `<button> sans nom accessible : ${btn.slice(0, 80)}`);
    }
  });
  if (buttons.length > 0) pass('4.1.2', `${buttons.length} bouton(s) vérifiés`);

  // 4.1.2 Liens
  const links = allTags(html, 'a');
  let ambiguousLinks = 0;
  links.forEach(a => {
    const text      = innerText(a).toLowerCase();
    const ariaLabel = attr(a, 'aria-label');
    if (!text && !ariaLabel && !hasAttr(a, 'aria-labelledby')) {
      fail('4.1.2', `<a> sans texte ni aria-label : ${a.slice(0, 80)}`);
    }
    const AMBIGUOUS = ['cliquez ici', 'ici', 'en savoir plus', 'lire la suite', 'click here'];
    if (!ariaLabel && AMBIGUOUS.includes(text)) {
      warn('2.4.4', `Texte de lien ambigu : "${text}"`);
      ambiguousLinks++;
    }
  });
  if (ambiguousLinks === 0 && links.length > 0) pass('2.4.4', `${links.length} lien(s) — textes non ambigus`);

  // 2.4.6 Hiérarchie des titres
  const headings = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map(m => parseInt(m[1]));
  let prevLevel = 0;
  let headingErrors = 0;
  headings.forEach(level => {
    if (level > prevLevel + 1 && prevLevel !== 0) {
      warn('2.4.6', `Saut de niveau : h${prevLevel} → h${level}`);
      headingErrors++;
    }
    prevLevel = level;
  });
  if (headingErrors === 0 && headings.length > 0) pass('2.4.6', `${headings.length} titre(s) — hiérarchie correcte`);

  // 1.3.1 Tableaux
  const tables = allTags(html, 'table');
  tables.forEach(table => {
    if (!table.includes('<th') && table.includes('<td')) warn('1.3.1', 'Tableau sans <th>');
  });
  if (tables.length > 0) pass('1.3.1', `${tables.length} tableau(x) vérifiés`);

  // 3.3.2 Labels
  const inputs = html.match(/<input[^>]*>/gi) || [];
  inputs.forEach(input => {
    const type = attr(input, 'type') || 'text';
    if (['hidden', 'submit', 'reset', 'button', 'image'].includes(type)) return;
    const id            = attr(input, 'id');
    const ariaLabel     = attr(input, 'aria-label');
    const ariaLabelledBy= attr(input, 'aria-labelledby');
    const hasLabel      = id && html.includes(`for="${id}"`);
    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      warn('3.3.2', `<input type="${type}"> sans label (id=${id || 'absent'})`);
    }
  });

  // 2.4.7 Focus visible
  if (SITE_CSS.includes(':focus-visible')) pass('2.4.7', ':focus-visible défini dans site.css');
  else fail('2.4.7', ':focus-visible absent du CSS');

  // 2.4.11 Focus non masqué
  const stickyHeader = SITE_CSS.match(/\.site-header\s*\{[^}]*position:\s*fixed/s);
  if (stickyHeader) {
    if (SITE_CSS.includes('scroll-padding') || SITE_CSS.includes('scroll-margin')) {
      pass('2.4.11', 'Header fixe + scroll-padding présent');
    } else {
      warn('2.4.11', 'Header fixe sans scroll-padding-top — focus potentiellement masqué');
    }
  }

  // 2.4.13 Apparence du focus
  const focusOutline = SITE_CSS.match(/focus-visible\s*\{[^}]*outline:\s*(\d+)px/);
  if (focusOutline) {
    const px = parseInt(focusOutline[1]);
    if (px >= 2) pass('2.4.13', `outline: ${px}px sur :focus-visible (≥ 2px requis)`);
    else fail('2.4.13', `outline: ${px}px — inférieur aux 2px requis par WCAG 2.2`);
  } else {
    warn('2.4.13', ':focus-visible outline non détecté — vérification manuelle requise');
  }

  // 2.5.8 Taille des cibles
  const btnPaddingY = SITE_CSS.match(/\.ds-btn\s*\{[^}]*padding/s);
  if (btnPaddingY) pass('2.5.8', 'Boutons .ds-btn : hauteur ≈ 36px (> 24px minimum)');

  // 2.5.3 Label dans le nom
  const btnsWithAriaLabel = [...html.matchAll(/<button[^>]+aria-label="([^"]*)"[^>]*>([^<]*)</gi)];
  btnsWithAriaLabel.forEach(m => {
    const ariaLabel   = m[1].toLowerCase();
    const visibleText = m[2].toLowerCase().trim();
    if (visibleText && !ariaLabel.includes(visibleText)) {
      warn('2.5.3', `aria-label "${m[1]}" ne contient pas le texte visible "${m[2].trim()}"`);
    }
  });

  // 4.1.2 ARIA valides
  const ariaSelectedElems = [...html.matchAll(/aria-selected="([^"]*)"/gi)];
  ariaSelectedElems.forEach(m => {
    if (!['true', 'false'].includes(m[1])) {
      fail('4.1.2', `aria-selected="${m[1]}" — doit être "true" ou "false"`);
    }
  });

  // IDs uniques — strip <pre>/<code> pour éviter les faux positifs dans les exemples de code
  const htmlForIds = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, '<pre></pre>')
    .replace(/<code[\s\S]*?<\/code>/gi, '<code></code>');
  const idMatches = [...htmlForIds.matchAll(/\bid="([^"]*)"/gi)].map(m => m[1]);
  const idCounts = {};
  idMatches.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
  Object.entries(idCounts).forEach(([id, count]) => {
    if (count > 1) fail('4.1.1', `id="${id}" dupliqué (${count} fois)`);
  });
  const uniqueIds = Object.keys(idCounts).filter(k => idCounts[k] === 1);
  if (uniqueIds.length > 0 && Object.values(idCounts).every(c => c === 1)) {
    pass('4.1.1', `${uniqueIds.length} ID(s) — tous uniques`);
  }

  return { violations, warnings, passed };
}

// ─── AUDIT DES CONTRASTES ────────────────────────────────────────────────────
function auditContrast() {
  return CONTRAST_PAIRS.map(([fg, bg, label, required]) => ({
    fg, bg, label, required,
    ratio: cr(fg, bg),
    pass:  cr(fg, bg) >= required,
  }));
}

// ─── COLLECTE DES PAGES ──────────────────────────────────────────────────────
function collectPages(excludeFile) {
  const pages = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) walk(fp);
      else if (f.endsWith('.html') && fp !== excludeFile) pages.push(fp);
    });
  }
  walk(DIST);
  return pages;
}

// ─── EXÉCUTION COMPLÈTE ──────────────────────────────────────────────────────
function runAudit({ excludeFile } = {}) {
  const SITE_CSS = getSiteCSS();
  const pages    = collectPages(excludeFile);
  const timestamp = new Date();

  let totalViolations = 0;
  let totalWarnings   = 0;
  let totalPassed     = 0;
  const allViolations = [];
  const allWarnings   = [];

  pages.forEach(fp => {
    const html   = fs.readFileSync(fp, 'utf8');
    const rel    = path.relative(DIST, fp);
    const result = auditPage(html, rel, SITE_CSS);

    totalViolations += result.violations.length;
    totalWarnings   += result.warnings.length;
    totalPassed     += result.passed.length;
    allViolations.push(...result.violations.map(v => ({ ...v, file: rel })));
    allWarnings.push(...result.warnings.map(w => ({ ...w, file: rel })));
  });

  // Contraste
  const contrastResults = auditContrast();
  const failedContrast  = contrastResults.filter(r => !r.pass);
  totalViolations += failedContrast.length;

  // Focus info
  const focusRule      = SITE_CSS.match(/\*:focus-visible\s*\{([^}]*)\}/s)?.[1] || '';
  const focusOutlinePx = focusRule.match(/outline:\s*(\d+)px/)?.[1] ?? null;
  const focusOutlineColor = focusRule.match(/outline:[^;]*solid\s+(var\([^)]+\)|#[0-9a-f]+)/i)?.[1] ?? null;

  return {
    timestamp,
    pageCount: pages.length,
    totalViolations,
    totalWarnings,
    totalPassed,
    allViolations,
    allWarnings,
    contrastResults,
    focusOutlinePx: focusOutlinePx ? parseInt(focusOutlinePx) : null,
    focusOutlineColor,
  };
}

// ─── CRITÈRES MANUELS ────────────────────────────────────────────────────────
const MANUAL_CHECKS = [
  { criterion: '1.4.1',  titleFr: 'Usage de la couleur',          titleEn: 'Use of Colour',
    descFr: 'Les erreurs ne sont pas signalées par la couleur seule (texte + icône + couleur).',
    descEn: 'Errors are not conveyed by colour alone (text + icon + colour).' },
  { criterion: '1.4.4',  titleFr: 'Redimensionnement du texte',   titleEn: 'Resize Text',
    descFr: 'Tester à 200% de zoom — pas de perte de contenu ni de fonctionnalité.',
    descEn: 'Test at 200% zoom — no content or functionality loss.' },
  { criterion: '1.4.10', titleFr: 'Redistribution (Reflow)',       titleEn: 'Reflow',
    descFr: 'Tester à 320px — pas de défilement horizontal requis.',
    descEn: 'Test at 320px — no horizontal scroll required.' },
  { criterion: '1.4.12', titleFr: 'Espacement du texte',           titleEn: 'Text Spacing',
    descFr: 'Tester avec line-height ≥ 1.5, letter-spacing ≥ 0.12em, word-spacing ≥ 0.16em.',
    descEn: 'Test with line-height ≥ 1.5, letter-spacing ≥ 0.12em, word-spacing ≥ 0.16em.' },
  { criterion: '2.1.1',  titleFr: 'Navigation clavier',            titleEn: 'Keyboard',
    descFr: 'Tester Tab / Shift+Tab / Entrée / Espace sur tous les contrôles interactifs.',
    descEn: 'Test Tab / Shift+Tab / Enter / Space on all interactive controls.' },
  { criterion: '2.1.2',  titleFr: 'Pas de piège clavier',          titleEn: 'No Keyboard Trap',
    descFr: 'Aucune zone ne bloque la navigation clavier.',
    descEn: 'No zone traps keyboard focus.' },
  { criterion: '2.3.1',  titleFr: 'Pas de flash',                  titleEn: 'Three Flashes',
    descFr: 'Aucun contenu ne clignote plus de 3 fois par seconde.',
    descEn: 'No content flashes more than 3 times per second.' },
  { criterion: '2.4.3',  titleFr: 'Ordre de focus',                titleEn: 'Focus Order',
    descFr: 'L\'ordre de tabulation suit l\'ordre visuel logique.',
    descEn: 'Tab order follows the logical visual order.' },
  { criterion: '2.4.11', titleFr: 'Focus non masqué',              titleEn: 'Focus Not Obscured',
    descFr: 'Vérifier que le header fixe ne masque pas l\'indicateur de focus.',
    descEn: 'Verify fixed header doesn\'t obscure the focus indicator.' },
  { criterion: '4.1.3',  titleFr: 'Messages de statut',            titleEn: 'Status Messages',
    descFr: 'Les messages dynamiques sont annoncés par les lecteurs d\'écran (aria-live).',
    descEn: 'Dynamic messages are announced by screen readers (aria-live).' },
];

module.exports = { runAudit, auditPage, auditContrast, collectPages, CONTRAST_PAIRS, MANUAL_CHECKS, DIST };
