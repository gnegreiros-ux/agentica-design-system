#!/usr/bin/env node

/**
 * audit-tokens.js — Audit du système de tokens
 * Équipe design system — usage interne
 *
 * Détecte :
 *   1. Tokens orphelins   — définis dans component.json mais jamais utilisés dans le code
 *   2. Tokens fantômes    — utilisés dans le code mais non définis dans semantic.json
 *   3. Valeurs hardcodées — hex, rgb, px arbitraires dans le code (vecteurs de dérive IA)
 *   4. Références directes à des primitifs dans des composants
 *
 * Usage :
 *   node scripts/audit-tokens.js
 *   node scripts/audit-tokens.js --fix-report          → génère un rapport JSON
 *   node scripts/audit-tokens.js --ci                  → exit 1 si violations critiques
 *   node scripts/audit-tokens.js --src-dir <chemin>    → analyse un répertoire source spécifique
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Configuration ────────────────────────────────────────────────────────────

const TOKEN_PREFIXES = {
  primitive: '--agtc-primitive-',
  semantic:  '--agtc-semantic-',
  component: '--agtc-component-',
};

const _srcArgIdx = process.argv.indexOf('--src-dir');

const CONFIG = {
  tokensDir:   path.resolve(__dirname, '../tokens'),
  sourceDir:   _srcArgIdx !== -1 ? path.resolve(process.cwd(), process.argv[_srcArgIdx + 1]) : null,
  outputFile:  path.resolve(__dirname, '../audit-report.json'),
  ciMode:      process.argv.includes('--ci'),
  fixReport:   process.argv.includes('--fix-report'),
};

// Extensions de fichiers source à analyser
const SOURCE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.md'];

// Patterns de dérive à détecter dans le code source
const DRIFT_PATTERNS = [
  { name: 'hex-color',       regex: /#[0-9a-fA-F]{3,8}\b/g,           severity: 'error',   message: 'Couleur hex en dur' },
  { name: 'rgb-color',       regex: /rgb\s*\([^)]+\)/g,                severity: 'error',   message: 'Valeur rgb() en dur' },
  { name: 'hsl-color',       regex: /hsl\s*\([^)]+\)/g,                severity: 'error',   message: 'Valeur hsl() en dur' },
  { name: 'tailwind-arbitrary', regex: /(?:p|m|text|bg|border)-\[[\d.]+(?:px|rem|em)[^\]]*\]/g, severity: 'error', message: 'Tailwind arbitrary value' },
  { name: 'inline-px',       regex: /(?:padding|margin|font-size|gap|border-radius)\s*:\s*\d+px/g, severity: 'warning', message: 'Valeur px inline sans token' },
  { name: 'primitive-direct', regex: new RegExp('var\\(' + TOKEN_PREFIXES.primitive, 'g'), severity: 'warning', message: 'Token primitif utilisé directement' },
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';

function log(msg)        { console.log(msg); }
function ok(msg)         { console.log(`${GREEN}  ✓${RESET} ${msg}`); }
function warn(msg)       { console.log(`${YELLOW}  ⚠${RESET} ${msg}`); }
function error(msg)      { console.log(`${RED}  ✗${RESET} ${msg}`); }
function section(title)  { console.log(`\n${BOLD}${CYAN}── ${title} ${RESET}`); }

// Charger un fichier JSON tokens
function loadTokens(filename) {
  const filepath = path.join(CONFIG.tokensDir, filename);
  if (!fs.existsSync(filepath)) {
    warn(`Fichier tokens introuvable : ${filename}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

// Extraire récursivement toutes les clés de token (chemin pointé)
function extractTokenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // métadonnées
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && value.$value !== undefined) {
      keys.push(fullKey);
    } else if (value && typeof value === 'object') {
      keys.push(...extractTokenKeys(value, fullKey));
    }
  }
  return keys;
}

// Collecte les noms de variables CSS générés pour un arbre de tokens, en reproduisant
// la transform kebab de Style Dictionary (segments de chemin joints par '-'). Construit
// dans le sens direct (arbre → nom de variable) car la conversion inverse est ambiguë :
// un tiret dans le nom généré peut être une frontière de segment OU un tiret interne au
// nom d'un segment (ex. "label-bold", "line-height" sont chacun UN seul segment).
function collectCssVarNames(obj, cssPrefix, pathParts = []) {
  const names = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const parts = [...pathParts, key];
    if (value && typeof value === 'object' && value.$value !== undefined) {
      names.push(cssPrefix + parts.join('-'));
    } else if (value && typeof value === 'object') {
      names.push(...collectCssVarNames(value, cssPrefix, parts));
    }
  }
  return names;
}

// Récupérer tous les fichiers source récursivement
function getSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.claude', 'storybook-static', 'playwright-report', 'test-results', 'Temp'].includes(entry.name)) {
      files.push(...getSourceFiles(fullPath));
    } else if (entry.isFile() && SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

// ─── Audits ───────────────────────────────────────────────────────────────────

function auditOrphanedTokens(componentTokens, sourceFiles) {
  section('1. Tokens orphelins (définis mais jamais utilisés)');
  const allComponentKeys = extractTokenKeys(componentTokens);
  const orphaned = [];

  for (const tokenKey of allComponentKeys) {
    // Convertir en pattern CSS var : button.primary.background → --agtc-component-button-primary-background
    const cssVar = TOKEN_PREFIXES.component + tokenKey.replace(/\./g, '-');
    const used = sourceFiles.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(cssVar) || content.includes(tokenKey);
    });
    if (!used) orphaned.push({ token: tokenKey, cssVar });
  }

  if (orphaned.length === 0) {
    ok(`Aucun token orphelin détecté (${allComponentKeys.length} tokens vérifiés)`);
  } else {
    orphaned.forEach(t => warn(`Orphelin : ${t.token}  →  ${t.cssVar}`));
  }
  return orphaned;
}

function auditPhantomTokens(semanticTokens, sourceFiles) {
  section('2. Tokens fantômes (utilisés dans le code mais non définis)');
  // semantic.json nests everything under a top-level "semantic" key (DTCG $schema/$metadata
  // wrapper) — collectCssVarNames strips it via semanticTokens.semantic.
  const definedVars = new Set(collectCssVarNames(semanticTokens.semantic || semanticTokens, TOKEN_PREFIXES.semantic));
  const phantoms = [];

  // Chercher toutes les références --agtc-semantic-* dans les sources
  const semanticVarRegex = new RegExp('var\\(' + TOKEN_PREFIXES.semantic + '([\\w-]+)\\)', 'g');
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = semanticVarRegex.exec(content)) !== null) {
      const cssVar = TOKEN_PREFIXES.semantic + match[1];
      if (!definedVars.has(cssVar) && !phantoms.find(p => p.cssVar === cssVar)) {
        phantoms.push({ cssVar, file: path.relative(process.cwd(), file) });
      }
    }
  }

  if (phantoms.length === 0) {
    ok('Aucun token fantôme détecté');
  } else {
    phantoms.forEach(p => error(`Fantôme : ${p.cssVar}  dans  ${p.file}`));
  }
  return phantoms;
}

// Documented, human-approved fallback shapes where a literal color sits next to its
// token reference on purpose — not drift. See .claude/rules/no-visited-nav.md (ADR-047/059
// Safari :visited exception), the var(--x, #fallback) CSS resilience pattern used
// throughout site/build.js, and the vFill(token, fallback) Figma-plugin equivalent
// (.claude/instructions/figma-components.md §0) — Figma Plugin API has no CSS var()
// concept, so a resolved literal fallback next to the token name is the correct pattern.
const COLOR_EXCEPTION_LINE = /vFill\(|var\(--[\w-]+\s*,\s*#|:visited\s*(,|\{)|\w*[Tt]ok:\s*["']|["'](color|component)\/[\w-]+["']/;

function auditHardcodedValues(sourceFiles) {
  section('3. Valeurs hardcodées (vecteurs de dérive IA)');
  const violations = [];
  const colorPatternNames = new Set(['hex-color', 'rgb-color', 'hsl-color']);

  for (const file of sourceFiles) {
    const content  = fs.readFileSync(file, 'utf8');
    const lines    = content.split('\n');
    const relFile  = path.relative(process.cwd(), file);

    for (const pattern of DRIFT_PATTERNS) {
      lines.forEach((line, idx) => {
        if (colorPatternNames.has(pattern.name) && COLOR_EXCEPTION_LINE.test(line)) return;
        const matches = [...line.matchAll(new RegExp(pattern.regex.source, 'g'))];
        for (const match of matches) {
          violations.push({
            severity: pattern.severity,
            type:     pattern.name,
            message:  pattern.message,
            file:     relFile,
            line:     idx + 1,
            value:    match[0].trim(),
          });
        }
      });
    }
  }

  const errors   = violations.filter(v => v.severity === 'error');
  const warnings = violations.filter(v => v.severity === 'warning');

  if (violations.length === 0) {
    ok('Aucune valeur hardcodée détectée');
  } else {
    errors.forEach(v =>
      error(`[${v.type}] ${v.file}:${v.line}  →  "${v.value}"  (${v.message})`)
    );
    warnings.forEach(v =>
      warn(`[${v.type}] ${v.file}:${v.line}  →  "${v.value}"  (${v.message})`)
    );
  }
  return violations;
}

function auditTokenStructure(primitives, semantic, component) {
  section('4. Structure des tokens (cohérence des trois couches)');
  const issues = [];

  // Vérifier que les tokens sémantiques référencent bien des primitifs existants
  const primitiveKeys = extractTokenKeys(primitives);
  const semanticEntries = extractTokenKeys(semantic);

  // Vérifier que les tokens de composant référencent des sémantiques existants
  const componentKeys = extractTokenKeys(component);
  const semanticKeys  = extractTokenKeys(semantic);

  let refErrors = 0;
  function checkRefs(obj, layer) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) continue;
      if (value && typeof value === 'object' && typeof value.$value === 'string') {
        const ref = value.$value.match(/^\{(.+)\}$/);
        if (ref) {
          const refKey = ref[1];
          const isDefined = layer === 'semantic'
            ? primitiveKeys.some(k => k === refKey)
            : (semanticKeys.some(k => k === refKey) || refKey === 'transparent');
          if (!isDefined) {
            warn(`Référence non résolue dans ${layer} : {${refKey}}`);
            issues.push({ layer, ref: refKey });
            refErrors++;
          }
        }
      } else if (value && typeof value === 'object') {
        checkRefs(value, layer);
      }
    }
  }

  checkRefs(semantic,   'semantic');
  checkRefs(component,  'component');

  if (refErrors === 0) {
    ok(`Structure cohérente — ${semanticEntries.length} tokens sémantiques, ${componentKeys.length} tokens de composant`);
  }
  return issues;
}

// ─── Rapport ──────────────────────────────────────────────────────────────────

function generateReport(results) {
  const report = {
    generatedAt:  new Date().toISOString(),
    summary: {
      orphanedTokens:   results.orphaned.length,
      phantomTokens:    results.phantoms.length,
      hardcodedErrors:  results.violations.filter(v => v.severity === 'error').length,
      hardcodedWarnings:results.violations.filter(v => v.severity === 'warning').length,
      structureIssues:  results.structureIssues.length,
    },
    details: results,
  };

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
  log(`\n${CYAN}Rapport écrit :${RESET} audit-report.json`);
  return report;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  log(`\n${BOLD}Audit — Système de tokens${RESET}`);
  log(`${CYAN}${'─'.repeat(40)}${RESET}`);

  // Charger les tokens
  const primitives = loadTokens('primitives.json');
  const semantic   = loadTokens('semantic.json');
  const component  = loadTokens('component.json');

  // Récupérer les fichiers source — priorité : --src-dir > src/ > racine
  const srcDir     = CONFIG.sourceDir || path.resolve(__dirname, '../src');
  const rootDir    = path.resolve(__dirname, '..');
  const sourceFiles = (CONFIG.sourceDir || fs.existsSync(srcDir))
    ? getSourceFiles(srcDir)
    : getSourceFiles(rootDir).filter(f => !f.includes('node_modules') && !f.includes('dist'));

  log(`${CYAN}Fichiers analysés :${RESET} ${sourceFiles.length}`);

  // Lancer les audits
  const orphaned       = auditOrphanedTokens(component, sourceFiles);
  const phantoms       = auditPhantomTokens(semantic, sourceFiles);
  const violations     = auditHardcodedValues(sourceFiles);
  const structureIssues = auditTokenStructure(primitives, semantic, component);

  // Résumé
  section('Résumé');
  const criticalCount = phantoms.length +
    violations.filter(v => v.severity === 'error').length +
    structureIssues.length;
  const warnCount = orphaned.length +
    violations.filter(v => v.severity === 'warning').length;

  if (criticalCount === 0 && warnCount === 0) {
    log(`\n${GREEN}${BOLD}  ✓ Système propre — aucune dérive détectée${RESET}\n`);
  } else {
    if (criticalCount > 0) error(`${criticalCount} violation(s) critique(s) détectée(s)`);
    if (warnCount > 0)     warn(`${warnCount} avertissement(s)`);
    log('');
  }

  // Rapport JSON
  if (CONFIG.fixReport) {
    generateReport({ orphaned, phantoms, violations, structureIssues });
  }

  // Mode CI — exit 1 si violations critiques
  if (CONFIG.ciMode && criticalCount > 0) {
    log(`${RED}CI : échec — corriger les violations critiques avant de merger.${RESET}\n`);
    process.exit(1);
  }
}

main();
