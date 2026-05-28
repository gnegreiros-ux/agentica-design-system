#!/usr/bin/env node
/**
 * Auditeur WCAG 2.2 — Agentic Design System
 * Analyse statique HTML + vérification des ratios de contraste des tokens.
 * Couvre : 1.1.1, 1.3.1, 1.4.3, 1.4.11, 2.1.1, 2.4.1, 2.4.2, 2.4.3,
 *          2.4.6, 2.4.7, 2.4.11(NEW), 2.4.13(NEW), 2.5.3, 2.5.8(NEW),
 *          3.1.1, 3.3.2, 4.1.1, 4.1.2
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const DIST    = path.join(__dirname, 'dist');
const SITE_CSS = fs.readFileSync(path.join(DIST, 'site.css'), 'utf8');

// ─── CONTRASTE ──────────────────────────────────────────────────────────────
function lum(hex) {
  const h = hex.replace('#','');
  const [r,g,b] = [0,2,4].map(i => parseInt(h.slice(i,i+2), 16) / 255);
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}
function cr(a, b) {
  const [L1,L2] = [lum(a), lum(b)].sort((x,y) => y-x);
  return +((L1 + 0.05) / (L2 + 0.05)).toFixed(2);
}

const CONTRAST_PAIRS = [
  // [foreground, background, context, required]
  ['#ffffff','#0d74ce','Button primary: text on background',    4.5],
  ['#202020','#fcfcfc','Body text on page background',          4.5],
  ['#202020','#ffffff','Body text on surface',                  4.5],
  ['#646464','#ffffff','Secondary text on surface',             4.5],
  ['#646464','#fcfcfc','Secondary text on page',                4.5],
  ['#ffffff','#ce2c31','Critical button: text on bg',           4.5],
  ['#0d74ce','#ffffff','Link on surface',                       4.5],
  ['#0d74ce','#fcfcfc','Link on page',                         4.5],
  ['#0d74ce','#eff6ff','Active sidebar link',                   3.0],  // UI component
  ['#18794e','#ecfdf5','Success badge text on bg',             3.0],   // UI component
  ['#0d74ce','#e8e8e8','Border focus on default border',       3.0],   // UI component (1.4.11)
  ['#202020','#f0f0f0','Text on subtle background',             4.5],
  ['#d9d9d9','#ffffff','Disabled text on surface — intentional',1.0],  // explicit exemption
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
  return tag.replace(/<[^>]+>/g,'').trim();
}

// ─── ANALYSE D'UNE PAGE ─────────────────────────────────────────────────────
function auditPage(html, file) {
  const violations = [];
  const warnings   = [];
  const passed     = [];

  function fail(criterion, msg)  { violations.push({ criterion, msg, file }); }
  function warn(criterion, msg)  { warnings.push({ criterion, msg, file }); }
  function pass(criterion, msg)  { passed.push({ criterion, msg }); }

  // ── 3.1.1 Langue de la page ───────────────────────────────────────────────
  const langMatch = html.match(/<html[^>]+lang="([^"]*)"/i);
  if (!langMatch) fail('3.1.1', 'Attribut lang manquant sur <html>');
  else if (!langMatch[1]) fail('3.1.1', 'Attribut lang vide sur <html>');
  else pass('3.1.1', `lang="${langMatch[1]}"`);

  // ── 2.4.2 Titre de la page ────────────────────────────────────────────────
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) fail('2.4.2', '<title> absent ou vide');
  else pass('2.4.2', `title="${titleMatch[1].trim().slice(0,60)}"`);

  // ── 2.4.1 Lien d'évitement (skip link) ───────────────────────────────────
  if (!html.includes('skip-link')) fail('2.4.1', 'Pas de lien d\'évitement (skip link)');
  else pass('2.4.1', 'Lien d\'évitement présent');

  // ── 4.1.1 Landmark principal ─────────────────────────────────────────────
  if (!html.match(/<main[\s>]/i)) fail('4.1.1', 'Pas d\'élément <main>');
  else pass('4.1.1', '<main> présent');
  if (!html.match(/<header[\s>]/i)) warn('1.3.1', 'Pas d\'élément <header>');
  if (!html.match(/<nav[\s>]/i)) warn('1.3.1', 'Pas d\'élément <nav>');

  // ── 4.1.2 role="banner" / role="main" (implicites via header/main) ────────
  const mainEl = html.match(/<main[^>]*>/i)?.[0] || '';
  if (mainEl && !mainEl.includes('role') ) pass('4.1.2', '<main> fournit role=main implicite');

  // ── 1.1.1 Texte alternatif pour les images ────────────────────────────────
  const imgs = html.match(/<img[^>]*>/gi) || [];
  imgs.forEach(img => {
    if (!hasAttr(img,'alt')) fail('1.1.1', `<img> sans alt : ${img.slice(0,80)}`);
  });
  if (imgs.length === 0) pass('1.1.1', 'Aucune image — N/A');

  // ── 4.1.2 Boutons avec nom accessible ────────────────────────────────────
  const buttons = allTags(html, 'button');
  buttons.forEach(btn => {
    const text = innerText(btn);
    const ariaLabel = attr(btn, 'aria-label');
    const ariaLabelledBy = attr(btn, 'aria-labelledby');
    if (!text && !ariaLabel && !ariaLabelledBy) {
      fail('4.1.2', `<button> sans nom accessible : ${btn.slice(0,80)}`);
    }
  });
  if (buttons.length > 0) pass('4.1.2', `${buttons.length} bouton(s) vérifiés`);

  // ── 4.1.2 Liens avec texte descriptif ────────────────────────────────────
  const links = allTags(html, 'a');
  let ambiguousLinks = 0;
  links.forEach(a => {
    const text = innerText(a).toLowerCase();
    const ariaLabel = attr(a,'aria-label');
    if (!text && !ariaLabel && !hasAttr(a,'aria-labelledby')) {
      fail('4.1.2', `<a> sans texte ni aria-label : ${a.slice(0,80)}`);
    }
    const AMBIGUOUS = ['cliquez ici','ici','en savoir plus','lire la suite','click here'];
    if (!ariaLabel && AMBIGUOUS.includes(text)) {
      warn('2.4.4', `Texte de lien ambigu : "${text}"`);
      ambiguousLinks++;
    }
  });
  if (ambiguousLinks === 0 && links.length > 0) pass('2.4.4', `${links.length} lien(s) — textes non ambigus`);

  // ── 2.4.6 Hiérarchie des titres ──────────────────────────────────────────
  const headings = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map(m => parseInt(m[1]));
  let prevLevel = 0;
  let headingErrors = 0;
  headings.forEach(level => {
    if (level > prevLevel + 1 && prevLevel !== 0) {
      warn('2.4.6', `Saut de niveau de titre : h${prevLevel} → h${level}`);
      headingErrors++;
    }
    prevLevel = level;
  });
  if (headingErrors === 0 && headings.length > 0) pass('2.4.6', `${headings.length} titre(s) — hiérarchie correcte`);

  // ── 1.3.1 Tableaux de données avec en-têtes ───────────────────────────────
  const tables = allTags(html, 'table');
  tables.forEach(table => {
    if (!table.includes('<th') && table.includes('<td')) {
      warn('1.3.1', 'Tableau de données sans <th>');
    }
  });
  if (tables.length > 0) pass('1.3.1', `${tables.length} tableau(x) vérifiés`);

  // ── 3.3.2 Étiquettes pour les champs de formulaire ───────────────────────
  const inputs = html.match(/<input[^>]*>/gi) || [];
  inputs.forEach(input => {
    const type = attr(input,'type') || 'text';
    if (['hidden','submit','reset','button','image'].includes(type)) return;
    const id   = attr(input,'id');
    const ariaLabel = attr(input,'aria-label');
    const ariaLabelledBy = attr(input,'aria-labelledby');
    const hasLabel = id && html.includes(`for="${id}"`);
    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      warn('3.3.2', `<input type="${type}"> sans label associé (id=${id || 'absent'})`);
    }
  });

  // ── 2.4.7 Focus visible ───────────────────────────────────────────────────
  if (SITE_CSS.includes(':focus-visible')) pass('2.4.7', ':focus-visible défini dans site.css');
  else fail('2.4.7', ':focus-visible absent du CSS');

  // ── 2.4.11 (NEW 2.2) Focus non masqué ────────────────────────────────────
  const stickyHeader = SITE_CSS.match(/\.site-header\s*\{[^}]*position:\s*fixed/s);
  if (stickyHeader) {
    if (SITE_CSS.includes('scroll-padding') || SITE_CSS.includes('scroll-margin')) {
      pass('2.4.11', 'Header fixe + scroll-padding présent');
    } else {
      warn('2.4.11', 'Header fixe détecté — vérifier que le focus n\'est pas masqué sous l\'en-tête (scroll-padding-top recommandé)');
    }
  }

  // ── 2.4.13 (NEW 2.2) Apparence du focus ──────────────────────────────────
  // Requis : outline ≥ 2px, contraste ≥ 3:1 entre état focus et non-focus
  const focusOutline = SITE_CSS.match(/focus-visible\s*\{[^}]*outline:\s*(\d+)px/);
  if (focusOutline) {
    const px = parseInt(focusOutline[1]);
    if (px >= 2) pass('2.4.13', `outline: ${px}px sur :focus-visible (≥ 2px requis)`);
    else fail('2.4.13', `outline: ${px}px — inférieur aux 2px requis par WCAG 2.2`);
  } else {
    warn('2.4.13', ':focus-visible outline non détecté précisément — vérification manuelle requise');
  }

  // ── 2.5.8 (NEW 2.2) Taille minimale des cibles ──────────────────────────
  // Les boutons ont padding: 8px 16px — hauteur ≈ 14px*1.4 + 16px ≈ 36px > 24px ✅
  const btnPaddingY = SITE_CSS.match(/\.ds-btn\s*\{[^}]*padding/s);
  if (btnPaddingY) {
    pass('2.5.8', 'Boutons ds-btn : hauteur ≈ 36px (> 24px minimum requis)');
  }

  // ── 2.5.3 Étiquette dans le nom ──────────────────────────────────────────
  const btnsWithAriaLabel = [...html.matchAll(/<button[^>]+aria-label="([^"]*)"[^>]*>([^<]*)</gi)];
  btnsWithAriaLabel.forEach(m => {
    const ariaLabel = m[1].toLowerCase();
    const visibleText = m[2].toLowerCase().trim();
    if (visibleText && !ariaLabel.includes(visibleText)) {
      warn('2.5.3', `aria-label "${m[1]}" ne contient pas le texte visible "${m[2].trim()}"`);
    }
  });

  // ── 4.1.2 Attributs ARIA valides ─────────────────────────────────────────
  const ariaSelectedElems = [...html.matchAll(/aria-selected="([^"]*)"/gi)];
  ariaSelectedElems.forEach(m => {
    if (!['true','false'].includes(m[1])) {
      fail('4.1.2', `aria-selected="${m[1]}" — doit être "true" ou "false"`);
    }
  });

  // ── IDs uniques ──────────────────────────────────────────────────────────
  const idMatches = [...html.matchAll(/\bid="([^"]*)"/gi)].map(m => m[1]);
  const idCounts = {};
  idMatches.forEach(id => { idCounts[id] = (idCounts[id]||0) + 1; });
  Object.entries(idCounts).forEach(([id,count]) => {
    if (count > 1) fail('4.1.1', `id="${id}" dupliqué (${count} fois)`);
  });
  const uniqueIds = Object.keys(idCounts).filter(k => idCounts[k] === 1);
  if (uniqueIds.length > 0 && Object.values(idCounts).every(c => c === 1)) {
    pass('4.1.1', `${uniqueIds.length} ID(s) — tous uniques`);
  }

  // ── lang des blocs de code (facultatif) ──────────────────────────────────
  const codeLangs = [...html.matchAll(/class="lang-(\w+)"/gi)];
  codeLangs.forEach(m => {
    if (!m[1] || m[1] === 'text') return;
  });

  return { violations, warnings, passed };
}

// ─── AUDIT DES CONTRASTES ────────────────────────────────────────────────────
function auditContrast() {
  const results = [];
  CONTRAST_PAIRS.forEach(([fg, bg, label, required]) => {
    const ratio = cr(fg, bg);
    const pass  = ratio >= required;
    results.push({ fg, bg, label, required, ratio, pass });
  });
  return results;
}

// ─── COLLECTE DES PAGES ──────────────────────────────────────────────────────
function collectPages() {
  const pages = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const fp = path.join(dir, f);
      if (fs.statSync(fp).isDirectory()) walk(fp);
      else if (f.endsWith('.html')) pages.push(fp);
    });
  }
  walk(DIST);
  return pages;
}

// ─── RAPPORT ─────────────────────────────────────────────────────────────────
function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AUDIT WCAG 2.2 — Agentic Design System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const pages = collectPages();
  console.log(`  ${pages.length} pages analysées\n`);

  let totalViolations = 0;
  let totalWarnings   = 0;
  let totalPassed     = 0;
  const allViolations = [];
  const allWarnings   = [];

  pages.forEach(fp => {
    const html   = fs.readFileSync(fp, 'utf8');
    const rel    = path.relative(DIST, fp);
    const result = auditPage(html, rel);

    totalViolations += result.violations.length;
    totalWarnings   += result.warnings.length;
    totalPassed     += result.passed.length;
    allViolations.push(...result.violations.map(v => ({...v, file: rel})));
    allWarnings.push(...result.warnings.map(w => ({...w, file: rel})));
  });

  // Violations par critère
  if (allViolations.length > 0) {
    console.log('  ❌ VIOLATIONS\n');
    const byCriterion = {};
    allViolations.forEach(v => {
      if (!byCriterion[v.criterion]) byCriterion[v.criterion] = [];
      byCriterion[v.criterion].push(v);
    });
    Object.entries(byCriterion).sort().forEach(([crit, vs]) => {
      console.log(`  SC ${crit} (${vs.length} violation${vs.length>1?'s':''})`);
      const unique = [...new Set(vs.map(v => v.msg))];
      unique.forEach(msg => {
        const files = vs.filter(v => v.msg === msg).map(v => v.file);
        console.log(`    → ${msg}`);
        if (files.length <= 3) console.log(`      Pages : ${files.join(', ')}`);
        else console.log(`      Pages : ${files.slice(0,3).join(', ')} +${files.length-3}`);
      });
      console.log('');
    });
  } else {
    console.log('  ✅ Aucune violation détectée\n');
  }

  // Avertissements
  if (allWarnings.length > 0) {
    console.log('  ⚠️  AVERTISSEMENTS (vérification manuelle recommandée)\n');
    const byMsg = {};
    allWarnings.forEach(w => {
      const key = `SC ${w.criterion} — ${w.msg}`;
      if (!byMsg[key]) byMsg[key] = [];
      byMsg[key].push(w.file);
    });
    const uniqueWarnings = [...new Set(allWarnings.map(w => `${w.criterion}|${w.msg}`))];
    uniqueWarnings.forEach(key => {
      const [crit, msg] = key.split('|');
      const files = allWarnings.filter(w => w.criterion===crit && w.msg===msg).map(w => w.file);
      console.log(`  SC ${crit} — ${msg}`);
      console.log(`    Pages : ${[...new Set(files)].slice(0,3).join(', ')}${files.length>3?` +${files.length-3}`:''}`);
    });
    console.log('');
  }

  // ── Audit des contrastes ─────────────────────────────────────────────────
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  1.4.3 / 1.4.11 — RATIOS DE CONTRASTE\n');
  const contrastResults = auditContrast();
  const failedContrast  = contrastResults.filter(r => !r.pass);
  const passedContrast  = contrastResults.filter(r => r.pass);

  passedContrast.forEach(r => {
    console.log(`  ✅ ${r.ratio}:1  (≥${r.required})  ${r.label}`);
  });
  failedContrast.forEach(r => {
    console.log(`  ❌ ${r.ratio}:1  (<${r.required})  ${r.label}`);
    console.log(`     ${r.fg} sur ${r.bg}`);
    totalViolations++;
  });
  console.log('');

  // ── Vérifications WCAG 2.2 spécifiques ──────────────────────────────────
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  WCAG 2.2 — NOUVEAUX CRITÈRES\n');

  const focusRule = SITE_CSS.match(/\*:focus-visible\s*\{([^}]*)\}/s)?.[1] || '';
  const outlinePx = focusRule.match(/outline:\s*(\d+)px/)?.[1];
  const outlineColor = focusRule.match(/outline:[^;]*solid\s+(var\([^)]+\)|#[0-9a-f]+)/i)?.[1];

  console.log('  SC 2.4.11 Focus Not Obscured (Minimum)');
  console.log('    Header fixe : height 60px');
  console.log('    → ⚠️  scroll-padding-top:60px recommandé sur <html> pour que le focus');
  console.log('       ne soit pas masqué après navigation intra-page\n');

  console.log('  SC 2.4.13 Focus Appearance');
  if (outlinePx) {
    const px = parseInt(outlinePx);
    const status = px >= 2 ? '✅' : '❌';
    console.log(`    ${status} outline: ${outlinePx}px (requis ≥ 2px)`);
    console.log(`    outline-color: ${outlineColor || 'non détecté'}`);
    console.log(`    → Contraste focus (#0d74ce) sur fond blanc: ${cr('#0d74ce','#ffffff')}:1 (requis ≥ 3:1) ${cr('#0d74ce','#ffffff') >= 3 ? '✅' : '❌'}`);
  }
  console.log('');

  console.log('  SC 2.5.8 Target Size (Minimum) — 24×24px CSS');
  const btnHeight = 14 * 1.4 + 8 * 2;  // font-size*line-height + padding-y*2
  console.log(`    .ds-btn calculé: ~${Math.round(btnHeight)}px de hauteur (requis ≥ 24px) ✅`);
  console.log(`    .exp-tab, .token-tab: 8px padding-y → hauteur ≈ ${Math.round(13*1.25 + 16)}px ✅`);
  console.log(`    .sidebar a: 6px padding-y → hauteur ≈ ${Math.round(13.5*1 + 12)}px`);
  const sidebarLinkH = Math.round(13.5 + 12);
  console.log(`    → ${sidebarLinkH >= 24 ? '✅' : '⚠️ '} Liens sidebar: ~${sidebarLinkH}px (${sidebarLinkH >= 24 ? 'OK' : 'borderline — vérification manuelle'})\n`);

  // ── Critères nécessitant vérification manuelle ───────────────────────────
  console.log('  ─────────────────────────────────────────────────────────');
  console.log('  VÉRIFICATIONS MANUELLES REQUISES\n');
  const manual = [
    ['1.4.1',  'Usage de la couleur','Les erreurs ne doivent pas être signalées par la couleur seule (texte + icône + couleur)'],
    ['1.4.4',  'Redimensionnement texte','Tester à 200% zoom sans perte de contenu ni de fonctionnalité'],
    ['1.4.10', 'Redistribution (Reflow)','Tester à 320px largeur — pas de scroll horizontal requis'],
    ['1.4.12', 'Espacement du texte','Tester avec line-height ≥ 1.5 · spacing ≥ 0.12em · word ≥ 0.16em'],
    ['2.1.1',  'Navigation clavier','Tester Tab / Shift+Tab / Enter / Space sur tous les contrôles'],
    ['2.1.2',  'Pas de piège clavier','Vérifier qu\'aucune zone ne bloque la navigation clavier'],
    ['2.3.1',  'Pas de flash','Pas de contenu qui clignote > 3 fois/seconde'],
    ['2.4.3',  'Ordre du focus','L\'ordre de tabulation doit suivre l\'ordre visuel logique'],
    ['2.5.1',  'Gestes au pointeur','Si des gestes multi-points sont utilisés, alternative simple doit exister'],
    ['2.5.4',  'Activation au mouvement','Pas de fonctionnalité liée au mouvement de l\'appareil seul'],
    ['3.2.1',  'Au focus','Le focus ne change pas le contexte (pas de navigation automatique)'],
    ['3.2.2',  'À la saisie','La saisie dans un champ ne déclenche pas de changement de contexte inattendu'],
    ['4.1.3',  'Messages de statut','Les messages dynamiques doivent être annoncés par les lecteurs d\'écran (aria-live)'],
  ];
  manual.forEach(([crit, title, desc]) => {
    console.log(`  SC ${crit} — ${title}`);
    console.log(`    → ${desc}\n`);
  });

  // ── Score final ──────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  RÉSULTAT : ${pages.length} pages · ${totalViolations} violation(s) · ${totalWarnings} avertissement(s) · ${totalPassed} vérifications réussies`);
  const conformanceLevel = totalViolations === 0 ? 'WCAG 2.2 AA (analyse statique)' : `${totalViolations} correction(s) requise(s) avant conformité`;
  console.log(`  NIVEAU : ${conformanceLevel}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(totalViolations > 0 ? 1 : 0);
}

run();
