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
 *   node scripts/audit-tokens.js --fix-report   → génère un rapport JSON
 *   node scripts/audit-tokens.js --ci           → exit 1 si violations critiques
 */

const fs   = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  tokensDir:   path.resolve(__dirname, '../tokens'),
  sourceGlobs: ['../src/**/*.{js,jsx,ts,tsx,css,scss,html}'],
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
  { name: 'primitive-direct',regex: /var\(--ds-primitive-/g,            severity: 'warning', message: 'Token primitif utilisé directement' },
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
    if (value && typeof value === 'object' && value.value !== undefined) {
      keys.push(fullKey);
    } else if (value && typeof value === 'object') {
      keys.push(...extractTokenKeys(value, fullKey));
    }
  }
  return keys;
}

// Récupérer tous les fichiers source récursivement
function getSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'dist', '.claude'].includes(entry.name)) {
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
    // Convertir en pattern CSS var : button.primary.background → --ds-component-button-primary-background
    const cssVar = '--ds-component-' + tokenKey.replace(/\./g, '-');
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
  const definedKeys = extractTokenKeys(semanticTokens);
  const phantoms = [];

  // Chercher toutes les références --ds-semantic-* dans les sources
  const semanticVarRegex = /var\(--ds-semantic-([\w-]+)\)/g;
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = semanticVarRegex.exec(content)) !== null) {
      const usedVar = match[1];
      // Convertir CSS var → clé token : color-action-primary → semantic.color.action.primary
      const tokenKey = 'semantic.' + usedVar.replace(/-/g, '.');
      const isDefined = definedKeys.some(k => k === tokenKey || k.startsWith(tokenKey));
      if (!isDefined && !phantoms.find(p => p.cssVar === usedVar)) {
        phantoms.push({ cssVar: `--ds-semantic-${usedVar}`, file: path.relative(process.cwd(), file) });
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

function auditHardcodedValues(sourceFiles) {
  section('3. Valeurs hardcodées (vecteurs de dérive IA)');
  const violations = [];

  for (const file of sourceFiles) {
    const content  = fs.readFileSync(file, 'utf8');
    const lines    = content.split('\n');
    const relFile  = path.relative(process.cwd(), file);

    for (const pattern of DRIFT_PATTERNS) {
      lines.forEach((line, idx) => {
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
      if (value && typeof value === 'object' && typeof value.value === 'string') {
        const ref = value.value.match(/^\{(.+)\}$/);
        if (ref) {
          const refKey = ref[1];
          const isDefined = layer === 'semantic'
            ? primitiveKeys.some(k => k === refKey || refKey.startsWith(k))
            : semanticKeys.some(k => k === refKey || refKey.startsWith(k)) || refKey === 'transparent';
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

  // Récupérer les fichiers source (chercher dans src/ ou à la racine)
  const srcDir     = path.resolve(__dirname, '../src');
  const rootDir    = path.resolve(__dirname, '..');
  const sourceFiles = fs.existsSync(srcDir)
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
