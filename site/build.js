#!/usr/bin/env node
'use strict';

// ─── SETUP ─────────────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const DIST       = path.join(__dirname, 'dist');
const TOKENS_DIR = path.join(ROOT, 'tokens');
const DEC_DIR    = path.join(ROOT, 'decisions');

const { execSync }               = require('child_process');
const { runAudit, MANUAL_CHECKS } = require('./audit-lib');

const ensureDir = (d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };

// ─── COMPOSANTS WEB ────────────────────────────────────────────────────────
// Bundle chaque Web Component Lit avec ses dépendances (esbuild, IIFE).
// Le site charge les bundles via <script defer> — pas de bundler côté site.
function bundleComponents() {
  // site/node_modules (CI: npm ci in site/) takes priority over root node_modules (dev: transitive via Storybook)
  const esbuildBin = fs.existsSync(path.join(__dirname, 'node_modules', '.bin', 'esbuild'))
    ? path.join(__dirname, 'node_modules', '.bin', 'esbuild')
    : path.join(ROOT, 'node_modules', '.bin', 'esbuild');
  const entry = path.join(ROOT, 'components', 'index.js');
  const out   = path.join(DIST, 'components', 'agtc.js');
  ensureDir(path.dirname(out));
  if (fs.existsSync(entry)) {
    // NODE_PATH: dit à esbuild où chercher lit/lucide — site/node_modules en priorité (CI), root/node_modules en fallback (dev)
    const nodePath = [
      path.join(__dirname, 'node_modules'),
      path.join(ROOT, 'node_modules'),
    ].filter(p => fs.existsSync(p)).join(path.delimiter);
    execSync(`"${esbuildBin}" "${entry}" --bundle --format=iife --outfile="${out}" --minify`, {
      cwd: ROOT,
      env: { ...process.env, NODE_PATH: nodePath },
    });
    console.log('  bundled: site/dist/components/agtc.js');
  }
}
const write = (fp, c) => { ensureDir(path.dirname(fp)); fs.writeFileSync(fp, c, 'utf8'); };
const read  = (fp) => { try { return fs.readFileSync(fp, 'utf8'); } catch { return ''; } };
const readJson = (fp) => { try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return {}; } };

// ─── MARKDOWN (minimal, no deps) ───────────────────────────────────────────
function esc(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function inl(t) {
  return t
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g, (_, c) => `<code>${esc(c)}</code>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
}
function parseMd(text) {
  const lines = text.split('\n'); const out = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('```')) {
      const lang = l.slice(3).trim() || 'text'; const code = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(esc(lines[i])); i++; }
      out.push(`<pre class="code-block"><code class="lang-${lang}">${code.join('\n')}</code></pre>`);
      i++; continue;
    }
    if (/^-{3,}$/.test(l.trim())) { out.push('<hr>'); i++; continue; }
    const hm = l.match(/^(#{1,4}) (.+)$/);
    if (hm) { const v = hm[1].length; out.push(`<h${v}>${inl(hm[2])}</h${v}>`); i++; continue; }
    if (l.startsWith('> ')) {
      const qs = []; while (i < lines.length && lines[i].startsWith('> ')) { qs.push(lines[i].slice(2)); i++; }
      out.push(`<blockquote><p>${inl(qs.join(' '))}</p></blockquote>`); continue;
    }
    if (/^\|/.test(l) && i+1 < lines.length && /^\|[-| ]+\|/.test(lines[i+1])) {
      const rows = [l]; i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const pr = (r,t) => r.replace(/\\\|/g,'\x00').split('|').filter(c=>c.trim()).map(c=>`<${t}>${inl(c.trim().replace(/\x00/g,'|'))}</${t}>`).join('');
      out.push(`<div class="table-wrap" tabindex="0"><table><thead><tr>${pr(rows[0],'th')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${pr(r,'td')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^[-*] /.test(l)) {
      const items = []; while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(`<li>${inl(lines[i].slice(2))}</li>`); i++; }
      out.push(`<ul>${items.join('')}</ul>`); continue;
    }
    if (l.trim() === '') { i++; continue; }
    const ps = [l]; i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('>') && !lines[i].startsWith('```') && !lines[i].startsWith('|') && !/^[-*] /.test(lines[i]) && !/^-{3,}$/.test(lines[i].trim())) {
      ps.push(lines[i]); i++;
    }
    out.push(`<p>${inl(ps.join(' '))}</p>`);
  }
  return out.join('\n');
}

// ─── LUCIDE ICONS ─────────────────────────────────────────────────────────
const lucideIcons = require('lucide');
function icon(name, size = 24, color = 'currentColor') {
  const key = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const data = lucideIcons[key];
  if (!data) return '';
  const children = data.map(([tag, attrs]) => {
    const a = Object.entries(attrs || {}).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<${tag} ${a}/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${children}</svg>`;
}

function storybookIcon(size = 18) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.34.24l-.12 2.71a.18.18 0 0 0 .29.15l1.06-.8.9.7a.18.18 0 0 0 .28-.14L18.65.1l1.33-.1a1.2 1.2 0 0 1 1.28 1.2v21.6A1.2 1.2 0 0 1 20 24l-16.1-.72a1.2 1.2 0 0 1-1.15-1.16L2 2.32a1.2 1.2 0 0 1 1.13-1.27l13.2-.83.01.02zM13.27 9.3c0 .47 3.16.24 3.59-.08 0-3.2-1.72-4.89-4.86-4.89-3.15 0-4.9 1.72-4.9 4.29 0 4.45 6 4.53 6 6.96 0 .7-.32 1.1-1.05 1.1-.96 0-1.35-.49-1.3-2.16 0-.36-3.65-.48-3.77 0-.27 4.03 2.23 5.2 5.1 5.2 2.79 0 4.97-1.49 4.97-4.18 0-4.77-6.1-4.64-6.1-7 0-.97.72-1.1 1.13-1.1.45 0 1.25.07 1.19 1.87z"/></svg>`;
}

// ─── TOKEN DATA ────────────────────────────────────────────────────────────
const primitives   = readJson(path.join(TOKENS_DIR, 'primitives.json'));
const semanticData = readJson(path.join(TOKENS_DIR, 'semantic.json'));

function extractColorScales(prim) {
  const scales = {};
  const colors = prim?.primitive?.color || {};
  for (const [name, steps] of Object.entries(colors)) {
    if (name === '_readme') continue;
    scales[name] = {};
    for (const [step, data] of Object.entries(steps)) {
      if (step === '_readme') continue;
      if (data?.$value) scales[name][step] = { value: data.$value, desc: data.$description || '' };
    }
  }
  return scales;
}

const COLOR_SCALES = extractColorScales(primitives);

// Resolves a {primitive.X.Y} reference against the primitives tree
function resolveRef(ref, data) {
  return ref.split('.').reduce((node, key) => node?.[key], data);
}

function resolveValue(val, data) {
  if (typeof val !== 'string') return String(val);
  const m = val.match(/^\{(.+)\}$/);
  if (!m) return val;
  const node = resolveRef(m[1], data);
  return node?.['$value'] ?? (typeof node === 'string' ? node : val);
}

// Flattens nested semantic tokens into 'category-subcategory-name' CSS keys
function flattenTokens(obj, data, prefix = '') {
  const result = {};
  for (const [key, node] of Object.entries(obj)) {
    if (key.startsWith('$') || key === '_readme') continue;
    const k = prefix ? `${prefix}-${key}` : key;
    if (node && typeof node === 'object' && ('$value' in node || 'value' in node)) {
      result[k] = resolveValue(node.$value ?? node.value, data);
    } else if (node && typeof node === 'object') {
      Object.assign(result, flattenTokens(node, data, k));
    }
  }
  return result;
}

// SEM is now resolved dynamically from semantic.json + primitives.json
const SEM = flattenTokens(semanticData.semantic, primitives);

const COMP = {
  'button-primary-background':          'var(--agtc-semantic-color-action-primary)',
  'button-primary-background-hover':    'var(--agtc-semantic-color-action-primary-hover)',
  'button-primary-background-disabled': 'var(--agtc-semantic-color-action-primary-disabled)',
  'button-primary-text':                'var(--agtc-semantic-color-text-on-action)',
  'button-primary-padding-x':           'var(--agtc-semantic-space-control-padding-x)',
  'button-primary-padding-y':           'var(--agtc-semantic-space-control-padding-y)',
  'button-primary-radius':              'var(--agtc-semantic-radius-control)',
  'button-critical-background':         'var(--agtc-semantic-color-feedback-danger)',
  'button-critical-background-hover':   'var(--agtc-semantic-color-feedback-danger-subtle)',
  'button-critical-text':               'var(--agtc-semantic-color-text-on-danger)',
  'button-critical-border':             'var(--agtc-semantic-color-feedback-danger)',
  'button-secondary-background':        'transparent',
  'button-secondary-background-hover':  'var(--agtc-semantic-color-background-subtle)',
  'button-secondary-text':              'var(--agtc-semantic-color-action-primary)',
  'button-secondary-border':            'var(--agtc-semantic-color-action-primary)',
  'button-ghost-background':            'transparent',
  'button-ghost-background-hover':      'var(--agtc-semantic-color-background-subtle)',
  'button-ghost-text':                  'var(--agtc-semantic-color-action-primary)',
  'button-ghost-border':                'transparent',
  'input-default-background':           'var(--agtc-semantic-color-background-surface)',
  'input-default-border':               'var(--agtc-semantic-color-border-default)',
  'input-default-border-focus':         'var(--agtc-semantic-color-border-focus)',
  'input-default-border-error':         'var(--agtc-semantic-color-border-danger)',
  'input-default-text':                 'var(--agtc-semantic-color-text-primary)',
  'input-default-placeholder':          'var(--agtc-semantic-color-text-secondary)',
  'input-default-radius':               'var(--agtc-semantic-radius-control)',
  'input-default-padding-x':            'var(--agtc-semantic-space-control-padding-x)',
  'input-default-padding-y':            'var(--agtc-semantic-space-control-padding-y)',
  'card-default-background':            'var(--agtc-semantic-color-background-surface)',
  'card-default-border':                'var(--agtc-semantic-color-border-default)',
  'card-default-radius':                'var(--agtc-semantic-radius-card)',
  'card-default-padding':               'var(--agtc-semantic-space-layout-component)',
  'card-elevated-background':           'var(--agtc-semantic-color-background-surface)',
  'card-elevated-border':               'transparent',
  'card-elevated-shadow':               'var(--agtc-semantic-shadow-card)',
  'card-flat-background':               'var(--agtc-semantic-color-background-subtle)',
  'card-flat-border':                   'transparent',
  'card-padding-none':                  '0px',
  'card-padding-sm':                    'var(--agtc-semantic-space-component-padding-md)',
  'card-padding-lg':                    'var(--agtc-semantic-space-component-padding-2xl)',
  /* Typographie — contexte Produit SaaS (défaut) */
  'card-typography-title-size':         'var(--agtc-semantic-typography-label-size)',
  'card-typography-title-weight':       'var(--agtc-semantic-fontWeight-bold)',
  'card-typography-body-size':          'var(--agtc-semantic-typography-label-size)',
  'card-typography-body-weight':        'var(--agtc-semantic-typography-label-weight)',
  'card-typography-meta-size':          'var(--agtc-semantic-typography-detail-size)',
  /* Typographie — contexte Marketing (data-context="marketing") */
  'card-typography-marketing-title-size':      'var(--agtc-semantic-typography-heading-5-size)',
  'card-typography-marketing-title-weight':    'var(--agtc-semantic-fontWeight-bold)',
  'card-typography-marketing-hero-title-size': 'var(--agtc-semantic-typography-heading-5-size)',
  'card-typography-marketing-hero-title-weight':'var(--agtc-semantic-fontWeight-bold)',
  'card-typography-marketing-body-size':       'var(--agtc-semantic-typography-body-size)',
  'card-typography-marketing-meta-size':       'var(--agtc-semantic-typography-label-size)',
  'badge-neutral-background':           'var(--agtc-semantic-color-background-subtle)',
  'badge-neutral-text':                 'var(--agtc-semantic-color-text-secondary)',
  'badge-neutral-border':               'var(--agtc-semantic-color-border-default)',
  'badge-brand-background':             'var(--agtc-semantic-color-brand-primary-subtle)',
  'badge-brand-text':                   'var(--agtc-semantic-color-brand-primary-text)',
  'badge-brand-border':                 'transparent',
  'badge-success-background':           'var(--agtc-semantic-color-feedback-success-subtle)',
  'badge-success-text':                 'var(--agtc-semantic-color-feedback-success)',
  'badge-success-border':               'var(--agtc-semantic-color-feedback-success-border)',
  'badge-warning-background':           'var(--agtc-semantic-color-feedback-warning-subtle)',
  'badge-warning-text':                 'var(--agtc-semantic-color-feedback-warning-text)',
  'badge-warning-border':               'transparent',
  'badge-danger-background':            'var(--agtc-semantic-color-feedback-danger-subtle)',
  'badge-danger-text':                  'var(--agtc-semantic-color-feedback-danger)',
  'badge-danger-border':                'transparent',
  'badge-info-background':              'var(--agtc-semantic-color-feedback-info-subtle)',
  'badge-info-text':                    'var(--agtc-semantic-color-feedback-info-text)',
  'badge-info-border':                  'transparent',
  'badge-md-radius':                    '9999px',
  'badge-md-padding-x':                 'var(--agtc-semantic-space-component-padding-md)',
  'badge-md-padding-y':                 'var(--agtc-semantic-space-component-padding-xs)',
  'badge-md-font-size':                 'var(--agtc-semantic-typography-label-size)',
  'badge-sm-radius':                    '9999px',
  'badge-sm-padding-x':                 'var(--agtc-semantic-space-component-padding-sm)',
  'badge-sm-padding-y':                 'var(--agtc-semantic-space-component-padding-2xs)',
  'badge-sm-font-size':                 'var(--agtc-semantic-typography-detail-size)',
  'table-default-header-background':    'var(--agtc-semantic-color-background-subtle)',
  'table-default-header-text':          'var(--agtc-semantic-color-text-secondary)',
  'table-default-cell-text':            'var(--agtc-semantic-color-text-primary)',
  'table-default-border':               'var(--agtc-semantic-color-border-default)',
  'table-default-row-hover':            'var(--agtc-semantic-color-background-hover)',
  'table-default-stripe':               'var(--agtc-semantic-color-background-subtle)',
  'table-default-caption-text':         'var(--agtc-semantic-color-text-secondary)',
  'table-default-radius':               'var(--agtc-semantic-radius-card)',
  'table-default-font-size':            'var(--agtc-semantic-typography-label-size)',
  'table-padding-x':                    'var(--agtc-semantic-space-component-padding-md)',
  'table-padding-y-compact':            'var(--agtc-semantic-space-component-padding-sm)',
  'table-padding-y-comfortable':        'var(--agtc-semantic-space-component-padding-md)',
  'code-block-default-background':            'var(--agtc-semantic-color-background-code)',
  'code-block-default-text':                  'var(--agtc-semantic-color-text-on-code)',
  'code-block-default-meta-text':             'var(--agtc-semantic-color-text-on-code-muted)',
  'code-block-default-copy-background':       'var(--agtc-semantic-color-background-code-raised)',
  'code-block-default-copy-background-hover': 'var(--agtc-semantic-color-background-code-raised-hover)',
  'code-block-default-copy-text':             'var(--agtc-semantic-color-text-on-code-strong)',
  'code-block-default-border-focus':          'var(--agtc-semantic-color-border-focus)',
  'code-block-default-radius':                'var(--agtc-semantic-radius-card)',
  'code-block-default-font-size':             'var(--agtc-semantic-typography-label-size)',
  'code-block-default-padding-x':             'var(--agtc-semantic-space-component-padding-xl)',
  'code-block-default-padding-y':             'var(--agtc-semantic-space-component-padding-lg)',
  'banner-neutral-background':          'var(--agtc-semantic-color-background-subtle)',
  'banner-neutral-accent':              'var(--agtc-semantic-color-text-secondary)',
  'banner-brand-background':            'var(--agtc-semantic-color-brand-primary-subtle)',
  'banner-brand-accent':                'var(--agtc-semantic-color-brand-primary)',
  'banner-info-background':             'var(--agtc-semantic-color-feedback-info-subtle)',
  'banner-info-accent':                 'var(--agtc-semantic-color-feedback-info)',
  'banner-success-background':          'var(--agtc-semantic-color-feedback-success-subtle)',
  'banner-success-accent':              'var(--agtc-semantic-color-feedback-success)',
  'banner-warning-background':          'var(--agtc-semantic-color-feedback-warning-subtle)',
  'banner-warning-accent':              'var(--agtc-semantic-color-feedback-warning)',
  'banner-danger-background':           'var(--agtc-semantic-color-feedback-danger-subtle)',
  'banner-danger-accent':               'var(--agtc-semantic-color-feedback-danger)',
  'banner-heading-text':                'var(--agtc-semantic-color-text-primary)',
  'banner-body-text':                   'var(--agtc-semantic-color-text-secondary)',
  'banner-close-color':                 'var(--agtc-semantic-color-text-secondary)',
  'banner-close-hover':                 'var(--agtc-semantic-color-text-primary)',
  'banner-border-focus':                'var(--agtc-semantic-color-border-focus)',
  'banner-radius':                      'var(--agtc-semantic-radius-card)',
  'banner-padding-x':                   'var(--agtc-semantic-space-component-padding-xl)',
  'banner-padding-y':                   'var(--agtc-semantic-space-component-padding-lg)',
  'link-default-text':                  'var(--agtc-semantic-color-action-primary)',
  'link-default-text-hover':            'var(--agtc-semantic-color-action-primary-hover)',
  'link-default-border-focus':          'var(--agtc-semantic-color-border-focus)',
  'segmented-default-track-background':  'var(--agtc-semantic-color-background-subtle)',
  'segmented-default-text':              'var(--agtc-semantic-color-text-secondary)',
  'segmented-default-text-hover':        'var(--agtc-semantic-color-text-primary)',
  'segmented-default-selected-background':'var(--agtc-semantic-color-action-primary)',
  'segmented-default-selected-text':     'var(--agtc-semantic-color-text-on-action)',
  'segmented-default-border-focus':      'var(--agtc-semantic-color-border-focus)',
  'segmented-default-radius':            'var(--agtc-semantic-radius-control)',
  'tabs-default-tab-text':              'var(--agtc-semantic-color-text-secondary)',
  'tabs-default-tab-text-hover':        'var(--agtc-semantic-color-text-primary)',
  'tabs-default-tab-text-active':       'var(--agtc-semantic-color-action-primary)',
  'tabs-default-indicator':             'var(--agtc-semantic-color-action-primary)',
  'tabs-default-border':                'var(--agtc-semantic-color-border-default)',
  'tabs-default-border-focus':          'var(--agtc-semantic-color-border-focus)',
  'tabs-default-padding-x':            'var(--agtc-semantic-space-control-padding-x)',
  'tabs-default-padding-y':            'var(--agtc-semantic-space-control-padding-y)',
  'top-nav-tab-color':                  'var(--agtc-semantic-color-text-secondary)',
  'top-nav-tab-color-hover':            'var(--agtc-semantic-color-text-primary)',
  'top-nav-tab-background-hover':       'var(--agtc-semantic-color-background-subtle)',
  'top-nav-tab-color-active':           'var(--agtc-semantic-color-action-primary)',
  'top-nav-tab-indicator-color':        'var(--agtc-semantic-color-action-primary)',
  'top-nav-tab-indicator-width':        '2px',
  'top-nav-tab-padding-x':             '14px',
  'top-nav-tab-font-size':             'var(--agtc-semantic-typography-label-size)',
  'top-nav-tab-font-weight':           'var(--agtc-semantic-typography-label-weight)',
  'top-nav-tab-font-weight-active':    'var(--agtc-semantic-fontWeight-bold)',
  'top-nav-tab-focus-ring':            'var(--agtc-semantic-color-border-focus)',
  'top-nav-cta-gap':                   '8px',
  'top-nav-cta-background':            'var(--agtc-semantic-color-action-primary)',
  'top-nav-cta-background-hover':      'var(--agtc-semantic-color-action-primary-hover)',
  'top-nav-cta-color':                 'var(--agtc-semantic-color-text-on-action)',
  'top-nav-cta-padding-x':             'var(--agtc-semantic-space-control-padding-x)',
  'top-nav-cta-padding-y':             'var(--agtc-semantic-space-control-padding-y)',
  'top-nav-cta-radius':                'var(--agtc-semantic-radius-control)',
  'toggle-default-track-off':           'var(--agtc-semantic-color-control-track-off)',
  'toggle-default-track-off-hover':     'var(--agtc-semantic-color-control-track-off-hover)',
  'toggle-default-track-on':            'var(--agtc-semantic-color-action-primary)',
  'toggle-default-track-on-hover':      'var(--agtc-semantic-color-action-primary-hover)',
  'toggle-default-knob':                'var(--agtc-semantic-color-background-surface)',
  'toggle-default-border-focus':        'var(--agtc-semantic-color-border-focus)',
  'toggle-default-label':               'var(--agtc-semantic-color-text-primary)',
};

// ─── PIPELINES DATA ──────────────────────────────────────────────────────────
const PIPELINES = [
  {
    id: 'quality-gate', icon: 'shield', status: 'orchestrator', blocking: true, order: 0,
    title_fr: 'Orchestrateur qualité', title_en: 'Quality orchestrator',
    trigger_fr: 'Avant tout commit', trigger_en: 'Before every commit',
    desc_short_fr: 'Coordonne l\'exécution séquentielle de tous les pipelines actifs, génère un rapport d\'impact unifié et attend l\'approbation humaine avant tout commit.',
    desc_short_en: 'Coordinates sequential execution of all active pipelines, generates a unified impact report, and awaits human approval before any commit.',
    marketing_fr: 'Un seul point de contrôle avant chaque commit. L\'orchestrateur exécute tous les gates, présente un rapport unifié et attend votre validation — aucune régression n\'atteint le dépôt par inadvertance.',
    marketing_en: 'One control point before every commit. The orchestrator runs all gates, presents a unified report, and waits for your approval — no regression reaches the repository by accident.',
    objective_fr: 'Garantir qu\'aucun commit ne franchit la ligne sans avoir passé tous les contrôles actifs et reçu une approbation humaine explicite.',
    objective_en: 'Ensure no commit crosses the line without passing all active checks and receiving explicit human approval.',
    steps: [
      { role_fr:'01 · Analyse', role_en:'01 · Analysis', title_fr:'Identifier les fichiers modifiés', title_en:'Identify modified files', desc_fr:'git diff --name-only → filtrer les pipelines déclenchés selon la matrice de chaque pipeline.', desc_en:'git diff --name-only → filter triggered pipelines according to each pipeline\'s trigger matrix.' },
      { role_fr:'02 · Exécution', role_en:'02 · Execution', title_fr:'Exécuter chaque pipeline actif', title_en:'Run each active pipeline', desc_fr:'Tokens · WCAG · Patterns UX · ADRs · Documentation · Site · Commit — dans l\'ordre défini.', desc_en:'Tokens · WCAG · UX Patterns · ADRs · Documentation · Site · Commit — in the defined order.' },
      { role_fr:'03 · Approbation', role_en:'03 · Approval', title_fr:'Rapport + décision humaine', title_en:'Report + human decision', desc_fr:'Checklist complète présentée à l\'humain. Commit uniquement après approbation explicite.', desc_en:'Full checklist presented to the human. Commit only after explicit approval.' },
    ],
    checks_fr: ['Cohérence tokens (tokens-audit) — déclenché si tokens/ modifiés','Conformité WCAG 2.2 AA (wcag) — déclenché si interface modifiée','Revue patterns UX (ux-patterns) — déclenché si nouveau composant','Conformité ADRs (adr-conformity) — toujours exécuté','ADRs manquants (adr-triggers) — toujours exécuté','Documentation complète (docs) — toujours exécuté','Rebuild site (site) — déclenché si tokens/decisions/guidelines modifiés','Format commit (commit) — dernier pipeline, toujours exécuté'],
    checks_en: ['Token consistency (tokens-audit) — triggered if tokens/ modified','WCAG 2.2 AA compliance (wcag) — triggered if interface modified','UX pattern review (ux-patterns) — triggered if new component','ADR compliance (adr-conformity) — always run','Missing ADRs (adr-triggers) — always run','Complete documentation (docs) — always run','Site rebuild (site) — triggered if tokens/decisions/guidelines modified','Commit format (commit) — last pipeline, always run'],
    trigger_table_fr: [['tokens/*.json','Oui — tokens-audit + wcag déclenchés'],['components/*.js','Oui — wcag + ux-patterns + chromatic'],['site/build.js','Oui — tokens-audit + site'],['decisions/ADR-*.md','Oui — site + docs'],['guidelines/**/*.md','Oui — site + docs'],['Tout fichier','Oui — adr-conformity + adr-triggers + docs + commit']],
    trigger_table_en: [['tokens/*.json','Yes — tokens-audit + wcag triggered'],['components/*.js','Yes — wcag + ux-patterns + chromatic'],['site/build.js','Yes — tokens-audit + site'],['decisions/ADR-*.md','Yes — site + docs'],['guidelines/**/*.md','Yes — site + docs'],['Any file','Yes — adr-conformity + adr-triggers + docs + commit']],
    command: null,
  },
  {
    id: 'tokens-audit', icon: 'zap', status: 'active', blocking: true, order: 1,
    title_fr: 'Cohérence des tokens', title_en: 'Token consistency',
    trigger_fr: 'tokens/, components/, site/build.js, guidelines/', trigger_en: 'tokens/, components/, site/build.js, guidelines/',
    desc_short_fr: 'Garantit l\'absence de valeurs codées en dur, de tokens orphelins et de références fantômes entre les trois niveaux du système de tokens.',
    desc_short_en: 'Guarantees no hardcoded values, orphaned tokens, or phantom references across the three token system levels.',
    marketing_fr: 'Zéro dérive silencieuse. Chaque valeur hex ou pixel codé en dur est détecté et bloqué avant d\'atteindre le dépôt. L\'intégrité du système de tokens est une garantie structurelle, pas une convention.',
    marketing_en: 'Zero silent drift. Every hardcoded hex or pixel is detected and blocked before reaching the repository. Token system integrity is a structural guarantee, not a convention.',
    objective_fr: 'Protéger l\'intégrité du système de tokens sur les trois niveaux — primitif → sémantique → composant — en détectant toute violation avant le commit.',
    objective_en: 'Protect token system integrity across three levels — primitive → semantic → component — by detecting any violation before the commit.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Fichiers tokens ou composants modifiés', title_en:'Token or component files modified', desc_fr:'tokens/*.json · components/*.js · site/build.js · guidelines/', desc_en:'tokens/*.json · components/*.js · site/build.js · guidelines/' },
      { role_fr:'02 · Contrôles', role_en:'02 · Checks', title_fr:'6 vérifications automatisées', title_en:'6 automated checks', desc_fr:'Valeurs hex · Tailles px · font-family en dur · Références fantômes · Tokens orphelins · Grille 4px · Échelle Minor Third · Gouvernance composants', desc_en:'Hex values · px sizes · hardcoded font-family · Phantom refs · Orphaned tokens · 4px grid · Minor Third scale · Component governance' },
      { role_fr:'03 · Résultat', role_en:'03 · Outcome', title_fr:'Commit bloqué ou validé', title_en:'Commit blocked or cleared', desc_fr:'exit 1 sur violation critique → commit bloqué. exit 0 → commit autorisé. Tokens orphelins signalés sans blocage.', desc_en:'exit 1 on critical violation → commit blocked. exit 0 → commit cleared. Orphaned tokens flagged without blocking.' },
    ],
    checks_fr: ['Aucune valeur hex (#RRGGBB) dans components/ ou site/build.js','Aucun font-size en px codé en dur dans site/build.js','Aucun font-family en dur (hors var())','Toutes les références {primitive.X.Y} résolues dans primitives.json','Tous les var(--agtc-semantic-…) résolus dans semantic.json','Tout token d\'espacement = multiple de 4px (ADR-020)','Font-sizes sur l\'échelle Minor Third uniquement (ADR-023)','Toute modification de component.json → approbation Principal Designer'],
    checks_en: ['No hex value (#RRGGBB) in components/ or site/build.js','No hardcoded font-size in px in site/build.js','No hardcoded font-family (outside var())','All {primitive.X.Y} references resolved in primitives.json','All var(--agtc-semantic-…) resolved in semantic.json','Every spacing token = multiple of 4px (ADR-020)','Font-sizes on Minor Third scale only (ADR-023)','Any component.json change → Principal Designer approval required'],
    trigger_table_fr: [['tokens/primitives.json','Oui — vérification complète'],['tokens/semantic.json','Oui — vérification complète'],['tokens/component.json','Oui — approbation Principal Designer requise'],['site/build.js','Oui — vérification valeurs hardcodées'],['components/*.js','Oui — vérification tokens de composant']],
    trigger_table_en: [['tokens/primitives.json','Yes — full check'],['tokens/semantic.json','Yes — full check'],['tokens/component.json','Yes — Principal Designer approval required'],['site/build.js','Yes — check for hardcoded values'],['components/*.js','Yes — check component tokens']],
    command: 'node scripts/audit-tokens.js --ci\n# exit 1 si violations critiques\n# exit 0 si propre (warnings tolérés)',
  },
  {
    id: 'wcag', icon: 'eye', status: 'active', blocking: true, order: 2,
    title_fr: 'Conformité WCAG 2.2', title_en: 'WCAG 2.2 compliance',
    trigger_fr: 'site/build.js, components/, tokens/ (couleurs)', trigger_en: 'site/build.js, components/, tokens/ (colors)',
    desc_short_fr: 'Checklist de conformité WCAG 2.2 AA — contraste, focus visible, cibles tactiles et animation — à valider après toute modification d\'interface.',
    desc_short_en: 'WCAG 2.2 AA compliance checklist — contrast, visible focus, touch targets, and animation — to validate after any interface change.',
    marketing_fr: 'L\'accessibilité n\'est pas optionnelle. Ce pipeline garantit que chaque interface respecte les critères WCAG 2.2 AA avant d\'atteindre les utilisateurs — contraste, focus et cibles tactiles inclus.',
    marketing_en: 'Accessibility is not optional. This pipeline guarantees every interface meets WCAG 2.2 AA criteria before reaching users — contrast, focus, and touch targets included.',
    objective_fr: 'Garantir la conformité WCAG 2.2 AA sur tous les composants et pages modifiés, en couvrant les critères de contraste, de focus et de cibles tactiles.',
    objective_en: 'Ensure WCAG 2.2 AA compliance across all modified components and pages, covering contrast, focus, and touch target criteria.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Interface ou couleurs modifiées', title_en:'Interface or colors modified', desc_fr:'site/build.js · components/*.js · tokens/ (couleurs) · Nouveau composant interactif', desc_en:'site/build.js · components/*.js · tokens/ (colors) · New interactive component' },
      { role_fr:'02 · Contrôles', role_en:'02 · Checks', title_fr:'6 critères WCAG 2.2', title_en:'6 WCAG 2.2 criteria', desc_fr:'1.4.3 Contraste texte ≥ 4.5:1 · 1.4.11 Non-textuel ≥ 3:1 · 1.4.12 Espacement · 2.4.7 Focus visible · 2.4.11 Focus non masqué · 2.5.8 Cibles ≥ 24×24px', desc_en:'1.4.3 Text contrast ≥ 4.5:1 · 1.4.11 Non-text ≥ 3:1 · 1.4.12 Spacing · 2.4.7 Focus visible · 2.4.11 Focus not hidden · 2.5.8 Targets ≥ 24×24px' },
      { role_fr:'03 · Résultat', role_en:'03 · Outcome', title_fr:'Violation = blocage', title_en:'Violation = block', desc_fr:'Toute violation d\'un critère AA = commit bloqué. Les nouvelles valeurs de contraste sont vérifiées avec WebAIM Contrast Checker.', desc_en:'Any AA criterion violation = commit blocked. New contrast values are checked with WebAIM Contrast Checker.' },
    ],
    checks_fr: ['Texte normal sur fond : ratio ≥ 4.5:1 (critère 1.4.3)','Texte large (≥ 18pt ou 14pt gras) : ratio ≥ 3:1','Composants non-textuels (icônes, bordures) : ratio ≥ 3:1 (1.4.11)',':focus-visible explicite sur tous les éléments interactifs (2.4.7)','Focus non masqué par le header fixe ou les modales (2.4.11)','Étiquette dans le nom accessible — aria-label contient le texte visible (2.5.3)','Cibles tactiles ≥ 24×24px (critère 2.5.8, nouveau WCAG 2.2)','prefers-reduced-motion respecté sur toutes les animations'],
    checks_en: ['Normal text on background: ratio ≥ 4.5:1 (criterion 1.4.3)','Large text (≥ 18pt or 14pt bold): ratio ≥ 3:1','Non-text components (icons, borders): ratio ≥ 3:1 (1.4.11)','Explicit :focus-visible on all interactive elements (2.4.7)','Focus not hidden by fixed header or modals (2.4.11)','Label in accessible name — aria-label contains visible text (2.5.3)','Touch targets ≥ 24×24px (criterion 2.5.8, new in WCAG 2.2)','prefers-reduced-motion respected on all animations'],
    trigger_table_fr: [['tokens/primitives.json (couleurs)','Oui — vérification contraste complète'],['tokens/semantic.json (couleurs)','Oui — vérification contraste complète'],['site/build.js (CSS)','Oui — focus visible, cibles tactiles'],['components/*.js','Oui — ARIA, focus, rôles'],['Nouveau composant interactif','Oui — checklist WCAG complète']],
    trigger_table_en: [['tokens/primitives.json (colors)','Yes — full contrast check'],['tokens/semantic.json (colors)','Yes — full contrast check'],['site/build.js (CSS)','Yes — focus visible, touch targets'],['components/*.js','Yes — ARIA, focus, roles'],['New interactive component','Yes — full WCAG checklist']],
    command: null,
  },
  {
    id: 'ux-patterns', icon: 'layout-template', status: 'active', blocking: true, order: 3,
    title_fr: 'Revue patterns UX', title_en: 'UX pattern review',
    trigger_fr: 'Nouveau composant ou modification UX pertinente', trigger_en: 'New component or relevant UX change',
    desc_short_fr: 'Aucun composant n\'est publié sans que les patterns UX de référence aient été présentés à l\'humain et que sa décision ait été documentée sur 6 surfaces.',
    desc_short_en: 'No component is published without presenting reference UX patterns to the human and documenting their decision across 6 surfaces.',
    marketing_fr: 'Les patterns UX ne s\'improvisent pas. Ce gate garantit que chaque décision d\'interface s\'appuie sur des sources reconnues — NN/g, IxDF, Smashing — et porte une approbation humaine traçable.',
    marketing_en: 'UX patterns are not improvised. This gate ensures every interface decision is backed by recognized sources — NN/g, IxDF, Smashing — and carries traceable human approval.',
    objective_fr: 'Garantir que toute création ou modification comportementale d\'un composant s\'appuie sur des patterns de référence approuvés et documentés sur 6 surfaces.',
    objective_en: 'Ensure every component behavioral creation or change is backed by approved reference patterns, documented across 6 surfaces.',
    steps: [
      { role_fr:'01 · Présentation', role_en:'01 · Presentation', title_fr:'Patterns présentés avec liens directs', title_en:'Patterns presented with direct links', desc_fr:'NN/g · IxDF · Smashing · IF Data Patterns — tableau de patterns avec liens vers sources.', desc_en:'NN/g · IxDF · Smashing · IF Data Patterns — pattern table with links to sources.' },
      { role_fr:'02 · Décision', role_en:'02 · Decision', title_fr:'Approbation humaine par pattern', title_en:'Human approval per pattern', desc_fr:'Chaque pattern : ✅ Appliqué ou ❌ Rejeté (avec justification). Aucun pattern appliqué sans décision explicite.', desc_en:'Each pattern: ✅ Applied or ❌ Rejected (with justification). No pattern applied without explicit decision.' },
      { role_fr:'03 · Documentation', role_en:'03 · Documentation', title_fr:'6 surfaces documentées', title_en:'6 surfaces documented', desc_fr:'Guideline · Code · Storybook · Site · ADR · Log — la décision est gravée partout.', desc_en:'Guideline · Code · Storybook · Site · ADR · Log — the decision is recorded everywhere.' },
    ],
    checks_fr: ['Patterns suggérés présentés à l\'humain (tableau + liens directs vers sources)','Checklist états couverts : default, hover, focus, error, disabled, loading','Affichage état d\'erreur : emplacement, couleur tokenisée, role="alert", message explicite','Moment de validation décidé : onChange / onBlur / onSubmit','Required markers : visuel * + aria-required','Dark patterns absents : pas de consentement forcé, pas de hiérarchie trompeuse','Décision consignée pour chaque pattern (✅/❌) avec justification','6 surfaces documentées : guideline, code, story, site, ADR, log'],
    checks_en: ['Patterns presented to human (table + direct links to sources)','States checklist: default, hover, focus, error, disabled, loading','Error state display: location, tokenized color, role="alert", explicit message','Validation timing decided: onChange / onBlur / onSubmit','Required markers: visual * + aria-required','No dark patterns: no forced consent, no misleading hierarchy','Decision recorded for each pattern (✅/❌) with justification','6 surfaces documented: guideline, code, story, site, ADR, log'],
    trigger_table_fr: [['Nouveau components/agtc-*.js','Oui — revue complète'],['Nouvelle guidelines/components/*.md','Oui — revue complète'],['Nouvelle variante ou nouvel état','Oui'],['Changement de la logique de validation','Oui'],['Correction contraste / WCAG','Non — couvert par wcag.md'],['Refactor sans changement de comportement','Non']],
    trigger_table_en: [['New components/agtc-*.js','Yes — full review'],['New guidelines/components/*.md','Yes — full review'],['New variant or new state','Yes'],['Change in validation logic','Yes'],['Contrast / WCAG fix','No — covered by wcag.md'],['Refactor with no behavior change','No']],
    command: null,
  },
  {
    id: 'adr-conformity', icon: 'shield-check', status: 'active', blocking: true, order: 4,
    title_fr: 'Conformité aux ADRs', title_en: 'ADR compliance',
    trigger_fr: 'Tout changement', trigger_en: 'Every change',
    desc_short_fr: 'Vérifie que chaque changement respecte les Architecture Decision Records actifs — tokens, commits, typographie, espacement, gouvernance.',
    desc_short_en: 'Verifies that every change respects active Architecture Decision Records — tokens, commits, typography, spacing, governance.',
    marketing_fr: 'Les décisions passées protègent le présent. Ce gate s\'assure que chaque changement reste cohérent avec les ADRs actifs — pas de dérive, pas de contradiction non documentée.',
    marketing_en: 'Past decisions protect the present. This gate ensures every change stays consistent with active ADRs — no drift, no undocumented contradiction.',
    objective_fr: 'Détecter toute violation des ADRs actifs avant le commit et bloquer les changements non conformes aux décisions architecturales du système.',
    objective_en: 'Detect any violation of active ADRs before the commit and block changes that don\'t comply with the system\'s architectural decisions.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Systématique — tout changement', title_en:'Systematic — every change', desc_fr:'Exécuté sans exception sur chaque session de modification, quel que soit le fichier modifié.', desc_en:'Run without exception on every modification session, regardless of which file was changed.' },
      { role_fr:'02 · Vérification', role_en:'02 · Verification', title_fr:'Contrôle par ADR actif', title_en:'Check per active ADR', desc_fr:'ADR-001 (niveaux tokens) · ADR-004 (gouvernance) · ADR-014 (commits) · ADR-016 (log) · ADR-020 (grille 4px) · ADR-023 (Minor Third) · ADR-027 (pipeline) · ADR-028 (mono)', desc_en:'ADR-001 (token levels) · ADR-004 (governance) · ADR-014 (commits) · ADR-016 (log) · ADR-020 (4px grid) · ADR-023 (Minor Third) · ADR-027 (pipeline) · ADR-028 (mono)' },
      { role_fr:'03 · Résultat', role_en:'03 · Outcome', title_fr:'Violation = blocage + escalade', title_en:'Violation = block + escalation', desc_fr:'Violation d\'un ADR actif → commit bloqué. Modification de component.json → escalade au Principal Designer.', desc_en:'Active ADR violation → commit blocked. component.json change → escalation to Principal Designer.' },
    ],
    checks_fr: ['ADR-001 : aucun token primitif utilisé directement dans un composant','ADR-004 : aucun merge sur main/develop sans approbation humaine','ADR-014 : format Conventional Commits (type(scope): description en minuscules)','ADR-016 : log/kit-construction.md mis à jour, sans chemin /Users/','ADR-020 : tout espacement = multiple de 4px','ADR-021 : police via var(--agtc-semantic-typography-fontFamily), jamais en dur','ADR-023 : font-size uniquement sur les 9 échelons Minor Third','ADR-028 : police mono via var(--agtc-font-mono), jamais en dur'],
    checks_en: ['ADR-001: no primitive token used directly in a component','ADR-004: no merge to main/develop without human approval','ADR-014: Conventional Commits format (type(scope): description in lowercase)','ADR-016: log/kit-construction.md updated, no /Users/ paths','ADR-020: every spacing = multiple of 4px','ADR-021: font via var(--agtc-semantic-typography-fontFamily), never hardcoded','ADR-023: font-size only on 9 Minor Third steps','ADR-028: mono font via var(--agtc-font-mono), never hardcoded'],
    trigger_table_fr: [['Tout fichier modifié','Oui — vérification de tous les ADRs actifs'],['tokens/component.json','Oui — escalade Principal Designer (ADR-004)'],['Message de commit','Oui — format Conventional Commits (ADR-014)'],['log/kit-construction.md','Oui — chemins locaux interdits (ADR-016)']],
    trigger_table_en: [['Any modified file','Yes — check against all active ADRs'],['tokens/component.json','Yes — Principal Designer escalation (ADR-004)'],['Commit message','Yes — Conventional Commits format (ADR-014)'],['log/kit-construction.md','Yes — local paths forbidden (ADR-016)']],
    command: null,
  },
  {
    id: 'adr-triggers', icon: 'git-branch', status: 'active', blocking: true, order: 5,
    title_fr: 'Déclencheurs ADRs', title_en: 'ADR triggers',
    trigger_fr: 'Tout changement', trigger_en: 'Every change',
    desc_short_fr: 'Détermine si un changement crée une décision architecturale nouvelle — et donc requiert un ADR — ou s\'il applique simplement une décision existante.',
    desc_short_en: 'Determines whether a change creates a new architectural decision — requiring an ADR — or simply applies an existing one.',
    marketing_fr: 'Aucune décision sans trace. Ce gate distingue les changements qui appliquent les règles existantes de ceux qui en créent de nouvelles — et s\'assure que ces derniers sont documentés.',
    marketing_en: 'No decision without a trace. This gate distinguishes changes that apply existing rules from those that create new ones — and ensures the latter are documented.',
    objective_fr: 'Bloquer tout commit contenant une décision architecturale nouvelle non documentée par un ADR.',
    objective_en: 'Block any commit containing a new architectural decision not documented by an ADR.',
    steps: [
      { role_fr:'01 · Analyse', role_en:'01 · Analysis', title_fr:'Classifier chaque changement', title_en:'Classify each change', desc_fr:'Décision nouvelle (= ADR requis) ou application d\'une décision existante (= pas d\'ADR nécessaire).', desc_en:'New decision (= ADR required) or application of an existing decision (= no ADR needed).' },
      { role_fr:'02 · Critères', role_en:'02 · Criteria', title_fr:'4 questions de déclenchement', title_en:'4 trigger questions', desc_fr:'Décision nouvelle ? · Impact cross-équipe ? · Difficile à défaire ? · Alternatives rejetées ? — 2 "oui" → ADR obligatoire.', desc_en:'New decision? · Cross-team impact? · Hard to reverse? · Rejected alternatives? — 2 "yes" → ADR mandatory.' },
      { role_fr:'03 · Résultat', role_en:'03 · Outcome', title_fr:'ADR créé ou commit validé', title_en:'ADR created or commit cleared', desc_fr:'Décision non documentée → commit bloqué jusqu\'à création de l\'ADR. Décision existante appliquée → commit autorisé.', desc_en:'Undocumented decision → commit blocked until ADR created. Existing decision applied → commit cleared.' },
    ],
    checks_fr: ['Nouvelle police de caractères → ADR requis (type : Typographie)','Nouvelle palette de couleurs → ADR requis (type : Couleur / Marque)','Nouveau composant au système → ADR requis (type : Composant)','Nouveau pipeline CI/CD → ADR requis (type : Infrastructure)','Changement de token sémantique (sens/intention) → ADR requis (type : Token)','Correction de valeur dans un token existant → pas d\'ADR (application d\'ADR existant)','Ajout de page au site → pas d\'ADR (documentation courante)','Si ≥ 2 critères "oui" → ADR obligatoire'],
    checks_en: ['New typeface → ADR required (type: Typography)','New color palette → ADR required (type: Color / Brand)','New system component → ADR required (type: Component)','New CI/CD pipeline → ADR required (type: Infrastructure)','Semantic token change (meaning/intent) → ADR required (type: Token)','Value correction in existing token → no ADR (applies existing ADR)','New site page → no ADR (routine documentation)','If ≥ 2 "yes" criteria → ADR mandatory'],
    trigger_table_fr: [['Nouvelle police','ADR requis — type Typographie'],['Nouveau composant','ADR requis — type Composant'],['Nouveau pipeline CI/CD','ADR requis — type Infrastructure'],['Changement d\'intention d\'un token','ADR requis — type Token'],['Correction de valeur de token','Pas d\'ADR — application d\'ADR existant'],['Ajout de page de documentation','Pas d\'ADR — documentation courante']],
    trigger_table_en: [['New typeface','ADR required — Typography type'],['New component','ADR required — Component type'],['New CI/CD pipeline','ADR required — Infrastructure type'],['Token intent change','ADR required — Token type'],['Token value correction','No ADR — applies existing ADR'],['Documentation page addition','No ADR — routine documentation']],
    command: null,
  },
  {
    id: 'docs', icon: 'book-open', status: 'active', blocking: true, order: 6,
    title_fr: 'Documentation complète', title_en: 'Complete documentation',
    trigger_fr: 'Tout changement', trigger_en: 'Every change',
    desc_short_fr: 'Checklist exhaustive des mises à jour de documentation requises après chaque changement — guidelines, ADRs, log de construction, parité bilingue FR/EN.',
    desc_short_en: 'Exhaustive checklist of documentation updates required after every change — guidelines, ADRs, build log, FR/EN bilingual parity.',
    marketing_fr: 'Un système de design sans documentation est un système de design mort. Ce gate garantit que chaque changement laisse une trace lisible — par les humains comme par les agents IA.',
    marketing_en: 'A design system without documentation is a dead design system. This gate ensures every change leaves a readable trace — for humans and AI agents alike.',
    objective_fr: 'S\'assurer que chaque modification du système est accompagnée de sa documentation correspondante, sans dette documentaire silencieuse.',
    objective_en: 'Ensure every system modification is accompanied by its corresponding documentation, with no silent documentation debt.',
    steps: [
      { role_fr:'01 · Matrice', role_en:'01 · Matrix', title_fr:'Fichier modifié → documentation requise', title_en:'Modified file → required documentation', desc_fr:'Chaque type de changement a ses surfaces de documentation obligatoires (matrice guideline/ADR/log).', desc_en:'Each type of change has its mandatory documentation surfaces (guideline/ADR/log matrix).' },
      { role_fr:'02 · Vérification', role_en:'02 · Verification', title_fr:'Toutes les surfaces documentées', title_en:'All surfaces documented', desc_fr:'guidelines/ · decisions/ · log/kit-construction.md · DESIGN.md · AGENTS.md · .claude/rules/ · Site rebuild', desc_en:'guidelines/ · decisions/ · log/kit-construction.md · DESIGN.md · AGENTS.md · .claude/rules/ · Site rebuild' },
      { role_fr:'03 · Parité', role_en:'03 · Parity', title_fr:'FR/EN — aucune langue absente', title_en:'FR/EN — no language missing', desc_fr:'Tout contenu ajouté en français → version anglaise requise (et vice versa). Aucune langue absente sur le site.', desc_en:'Any content added in French → English version required (and vice versa). No language missing on the site.' },
    ],
    checks_fr: ['guidelines/foundations/*.md mis à jour si fondation modifiée (couleur, typo, espacement)','guidelines/components/[composant].md mis à jour si composant modifié','decisions/ADR-0XX.md créé pour toute décision architecturale nouvelle','decisions/README.md mis à jour pour chaque nouvel ADR','log/kit-construction.md — entrée horodatée, sans chemin /Users/','DESIGN.md mis à jour si identité, gouvernance ou principes changent','AGENTS.md mis à jour si nouvelle règle pour les agents','Parité bilingue FR/EN vérifiée sur toutes les pages modifiées'],
    checks_en: ['guidelines/foundations/*.md updated if foundation changed (color, type, spacing)','guidelines/components/[component].md updated if component changed','decisions/ADR-0XX.md created for any new architectural decision','decisions/README.md updated for each new ADR','log/kit-construction.md — timestamped entry, no /Users/ paths','DESIGN.md updated if identity, governance or principles change','AGENTS.md updated if new rule for agents','FR/EN bilingual parity verified on all modified pages'],
    trigger_table_fr: [['tokens/ (couleurs)','guidelines/foundations/color.md'],['tokens/ (typo)','guidelines/foundations/typography.md'],['components/agtc-*.js','guidelines/components/[composant].md'],['Tout changement','log/kit-construction.md (horodaté, sans /Users/)'],['Décision architecturale','decisions/ADR-0XX.md + decisions/README.md'],['Tout changement visible','Site rebuild : node site/build.js']],
    trigger_table_en: [['tokens/ (colors)','guidelines/foundations/color.md'],['tokens/ (type)','guidelines/foundations/typography.md'],['components/agtc-*.js','guidelines/components/[component].md'],['Every change','log/kit-construction.md (timestamped, no /Users/)'],['Architectural decision','decisions/ADR-0XX.md + decisions/README.md'],['Any visible change','Site rebuild: node site/build.js']],
    command: null,
  },
  {
    id: 'site', icon: 'globe', status: 'active', blocking: true, order: 7,
    title_fr: 'Rebuild du site', title_en: 'Site rebuild',
    trigger_fr: 'site/build.js, tokens/, decisions/, guidelines/', trigger_en: 'site/build.js, tokens/, decisions/, guidelines/',
    desc_short_fr: 'Rebuild et validation du site de documentation statique — vérifie les assets, les métadonnées OG, le nombre de fichiers attendu et la parité bilingue.',
    desc_short_en: 'Rebuild and validation of the static documentation site — verifies assets, OG metadata, expected file count, and bilingual parity.',
    marketing_fr: 'Le site est la vitrine du système. Ce pipeline garantit que chaque changement est immédiatement reflété sur la documentation — assets, métadonnées et parité FR/EN inclus.',
    marketing_en: 'The site is the system\'s showcase. This pipeline ensures every change is immediately reflected in the documentation — assets, metadata and FR/EN parity included.',
    objective_fr: 'Garantir que le site de documentation est toujours synchronisé avec l\'état réel des tokens, des décisions et des composants.',
    objective_en: 'Ensure the documentation site is always synchronized with the actual state of tokens, decisions, and components.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Tokens, décisions ou guidelines modifiés', title_en:'Tokens, decisions, or guidelines modified', desc_fr:'site/build.js · tokens/*.json · decisions/ADR-*.md · guidelines/**/*.md · Brand/', desc_en:'site/build.js · tokens/*.json · decisions/ADR-*.md · guidelines/**/*.md · Brand/' },
      { role_fr:'02 · Rebuild', role_en:'02 · Rebuild', title_fr:'node site/build.js', title_en:'node site/build.js', desc_fr:'Génère toutes les pages HTML, CSS et JS. Compile les tokens en variables CSS. Copie logo, favicons et image sociale.', desc_en:'Generates all HTML, CSS and JS pages. Compiles tokens into CSS variables. Copies logo, favicons and social image.' },
      { role_fr:'03 · Vérification', role_en:'03 · Verification', title_fr:'Assets · OG · Parité · Count', title_en:'Assets · OG · Parity · Count', desc_fr:'logo.svg · social.png · favicon · og:image · twitter:card · lang-fr/en parity · nombre de fichiers attendu', desc_en:'logo.svg · social.png · favicon · og:image · twitter:card · lang-fr/en parity · expected file count' },
    ],
    checks_fr: ['node site/build.js exit 0 (aucune erreur de compilation)','Nombre de fichiers générés ≥ baseline (37 + ADRs + nouvelles pages)','logo.svg présent dans site/dist/','social.png présent dans site/dist/','Chaque page : og:title, og:description, og:image présents','twitter:card, twitter:domain présents','Parité bilingue : chaque lang-fr a un lang-en correspondant','validateCssVars() exit 0 : aucune var(--agtc-…) orpheline'],
    checks_en: ['node site/build.js exit 0 (no compilation error)','Generated file count ≥ baseline (37 + ADRs + new pages)','logo.svg present in site/dist/','social.png present in site/dist/','Each page: og:title, og:description, og:image present','twitter:card, twitter:domain present','Bilingual parity: each lang-fr has a corresponding lang-en','validateCssVars() exit 0: no orphaned var(--agtc-…)'],
    trigger_table_fr: [['site/build.js','Rebuild complet'],['tokens/primitives.json','Rebuild (tokens.css régénéré)'],['tokens/semantic.json','Rebuild (tokens.css régénéré)'],['decisions/ADR-*.md','Rebuild (nouvelle page ADR générée)'],['guidelines/**/*.md','Rebuild si contenu injecté'],['Brand/','Rebuild + copie assets (logo, favicons, image sociale)']],
    trigger_table_en: [['site/build.js','Full rebuild'],['tokens/primitives.json','Rebuild (tokens.css regenerated)'],['tokens/semantic.json','Rebuild (tokens.css regenerated)'],['decisions/ADR-*.md','Rebuild (new ADR page generated)'],['guidelines/**/*.md','Rebuild if content injected'],['Brand/','Rebuild + copy assets (logo, favicons, social image)']],
    command: 'cd site && node build.js',
  },
  {
    id: 'commit', icon: 'git-branch', status: 'active', blocking: true, order: 8,
    title_fr: 'Format et intégrité du commit', title_en: 'Commit format and integrity',
    trigger_fr: 'Systématique — dernier pipeline avant tout commit', trigger_en: 'Systematic — last pipeline before every commit',
    desc_short_fr: 'Dernier gate avant tout commit — vérifie le format Conventional Commits, l\'absence de chemins locaux, de secrets et toute tentative de contournement de hooks.',
    desc_short_en: 'Last gate before any commit — verifies Conventional Commits format, absence of local paths, secrets, and any hook bypass attempt.',
    marketing_fr: 'Chaque commit est une entrée dans l\'histoire du projet. Ce gate garantit qu\'elle est lisible, cohérente et sans contamination — messages clairs, pas de secrets, pas de contournement des hooks.',
    marketing_en: 'Every commit is an entry in the project\'s history. This gate ensures it is readable, consistent and uncontaminated — clear messages, no secrets, no hook bypass.',
    objective_fr: 'Garantir que chaque commit respecte le format Conventional Commits, ne contient ni secrets ni chemins locaux, et n\'a pas contourné les hooks de validation.',
    objective_en: 'Ensure every commit follows Conventional Commits format, contains no secrets or local paths, and hasn\'t bypassed validation hooks.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Systématique — tout commit', title_en:'Systematic — every commit', desc_fr:'Dernier pipeline dans la séquence quality-gate. Exécuté sans exception.', desc_en:'Last pipeline in the quality-gate sequence. Run without exception.' },
      { role_fr:'02 · Vérification', role_en:'02 · Verification', title_fr:'6 contrôles pré-commit', title_en:'6 pre-commit checks', desc_fr:'Format message · Périmètre cohérent · Fichiers interdits · Chemins locaux · --no-verify interdit · Push immédiat', desc_en:'Message format · Coherent scope · Forbidden files · Local paths · --no-verify forbidden · Immediate push' },
      { role_fr:'03 · Résultat', role_en:'03 · Outcome', title_fr:'Commit + push validés', title_en:'Commit + push validated', desc_fr:'Un seul commit cohérent par session. Push immédiat après le commit. Origin/main à jour.', desc_en:'One coherent commit per session. Immediate push after commit. Origin/main up to date.' },
    ],
    checks_fr: ['Format : type(scope): description courte en minuscules (ADR-014)','Types valides : feat · fix · token · docs · a11y · style · refactor · test · chore · ci','Messages interdits : "update", "fix", "wip", "changes", "misc"','Un seul commit cohérent par session — pas de commit partiel','Aucun fichier .env ou secret dans les fichiers staged','log/kit-construction.md sans chemin /Users/[nom]/','--no-verify interdit — diagnostiquer et corriger les hooks qui échouent','Push immédiat après le commit — origin/main à jour'],
    checks_en: ['Format: type(scope): short description in lowercase (ADR-014)','Valid types: feat · fix · token · docs · a11y · style · refactor · test · chore · ci','Forbidden messages: "update", "fix", "wip", "changes", "misc"','One coherent commit per session — no partial commit','No .env or secret files in staged files','log/kit-construction.md with no /Users/[name]/ path','--no-verify forbidden — diagnose and fix failing hooks','Immediate push after commit — origin/main up to date'],
    trigger_table_fr: [['Tout commit','Systématique — dernier pipeline'],['Message de commit','Format Conventional Commits requis (ADR-014)'],['log/kit-construction.md staged','Vérification chemins locaux /Users/'],['Fichiers staged','Scan anti-secrets (.env, credentials)']],
    trigger_table_en: [['Every commit','Systematic — last pipeline'],['Commit message','Conventional Commits format required (ADR-014)'],['log/kit-construction.md staged','Check for /Users/ local paths'],['Staged files','Anti-secrets scan (.env, credentials)']],
    command: 'git add [fichiers spécifiques]\ngit diff --staged\ngit commit -m "$(cat <<\'EOF\'\ntype(scope): description\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\nEOF\n)"\ngit push',
  },
  {
    id: 'chromatic', icon: 'camera', status: 'active', blocking: true, order: 9,
    title_fr: 'Régression visuelle (Chromatic)', title_en: 'Visual regression (Chromatic)',
    trigger_fr: 'components/, tokens/, .storybook/', trigger_en: 'components/, tokens/, .storybook/',
    desc_short_fr: 'Publie les stories sur Chromatic et compare les captures avec le baseline approuvé — tout changement visuel non intentionnel bloque le commit.',
    desc_short_en: 'Publishes stories to Chromatic and compares captures against the approved baseline — any unintentional visual change blocks the commit.',
    marketing_fr: 'Aucune régression visuelle silencieuse. Chaque pixel qui change est capturé, comparé au baseline et soumis à approbation. Les designers contrôlent les évolutions visuelles — pas les accidents de code.',
    marketing_en: 'No silent visual regression. Every changed pixel is captured, compared to the baseline and submitted for approval. Designers control visual changes — not code accidents.',
    objective_fr: 'Détecter et bloquer toute régression visuelle non intentionnelle sur les composants avant qu\'elle n\'atteigne le dépôt.',
    objective_en: 'Detect and block any unintentional visual regression on components before it reaches the repository.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Composants, tokens ou Storybook modifiés', title_en:'Components, tokens or Storybook modified', desc_fr:'components/ · tokens/ · .storybook/ — tout changement visuel potentiel.', desc_en:'components/ · tokens/ · .storybook/ — any potential visual change.' },
      { role_fr:'02 · Capture', role_en:'02 · Capture', title_fr:'Publication + comparaison baseline', title_en:'Publication + baseline comparison', desc_fr:'npm run chromatic → Storybook publié sur Chromatic → captures comparées au baseline approuvé.', desc_en:'npm run chromatic → Storybook published on Chromatic → captures compared against approved baseline.' },
      { role_fr:'03 · Résultat', role_en:'03 · Outcome', title_fr:'Approbation ou blocage', title_en:'Approval or block', desc_fr:'Chromatic exit 0 ou changements explicitement approuvés → commit autorisé. Régressions détectées → commit bloqué.', desc_en:'Chromatic exit 0 or changes explicitly approved → commit cleared. Regressions detected → commit blocked.' },
    ],
    checks_fr: ['Chromatic exit 0 ou changements visuels explicitement approuvés','Aucune régression non intentionnelle sur les composants existants','Captures de tous les états : default, hover, focus, disabled, loading','CHROMATIC_PROJECT_TOKEN en variable d\'environnement (jamais en clair dans le dépôt)','Workflow CI .github/workflows/chromatic.yml actif'],
    checks_en: ['Chromatic exit 0 or visual changes explicitly approved','No unintentional regression on existing components','Captures of all states: default, hover, focus, disabled, loading','CHROMATIC_PROJECT_TOKEN as environment variable (never in plain text in repo)','CI workflow .github/workflows/chromatic.yml active'],
    trigger_table_fr: [['components/agtc-*.js','Oui — capture + comparaison baseline'],['tokens/*.json','Oui — impact visuel potentiel'],[ '.storybook/','Oui — configuration des captures'],['site/build.js','Non — pas de stories Storybook']],
    trigger_table_en: [['components/agtc-*.js','Yes — capture + baseline comparison'],['tokens/*.json','Yes — potential visual impact'],['.storybook/','Yes — capture configuration'],['site/build.js','No — no Storybook stories']],
    command: 'export CHROMATIC_PROJECT_TOKEN=chpt_xxx\nnpm run chromatic\n# CI : secret GitHub CHROMATIC_PROJECT_TOKEN injecté automatiquement',
  },
  {
    id: 'axe-core', icon: 'check-circle', status: 'active', blocking: false, order: 10,
    title_fr: 'Audit automatique axe-core', title_en: 'axe-core automated audit',
    trigger_fr: 'components/, site/build.js, tokens/', trigger_en: 'components/, site/build.js, tokens/',
    desc_short_fr: 'Audit automatique WCAG via axe-core sur toutes les pages générées. En mode rapport (non bloquant) — 0 violation active, bascule en bloquant imminente.',
    desc_short_en: 'Automated WCAG audit via axe-core on all generated pages. In report mode (non-blocking) — 0 active violations, switch to blocking imminent.',
    marketing_fr: '76 violations initiales → 0. L\'audit axe-core a été lancé avec un burn-down complet avant toute ouverture. La bascule en bloquant est imminente — le système ne laisse aucune régression d\'accessibilité s\'accumuler.',
    marketing_en: '76 initial violations → 0. The axe-core audit was launched with a complete burn-down before any opening. The switch to blocking is imminent — the system lets no accessibility regression accumulate.',
    objective_fr: 'Détecter automatiquement toute violation d\'accessibilité critique ou sérieuse sur l\'ensemble des pages générées, et bloquer les commits qui en introduisent de nouvelles.',
    objective_en: 'Automatically detect any critical or serious accessibility violation across all generated pages, and block commits that introduce new ones.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Composants ou interface modifiés', title_en:'Components or interface modified', desc_fr:'components/ · site/build.js · tokens/ — tout changement pouvant impacter l\'accessibilité.', desc_en:'components/ · site/build.js · tokens/ — any change that may impact accessibility.' },
      { role_fr:'02 · Audit', role_en:'02 · Audit', title_fr:'Scan toutes pages via axe-core', title_en:'Scan all pages via axe-core', desc_fr:'node scripts/axe-audit.js — scanne site/dist/**. Violations critiques/sérieuses → exit 1 (si AXE_BLOCKING=true).', desc_en:'node scripts/axe-audit.js — scans site/dist/**. Critical/serious violations → exit 1 (if AXE_BLOCKING=true).' },
      { role_fr:'03 · Transition', role_en:'03 · Transition', title_fr:'0 violation — bascule en bloquant', title_en:'0 violations — switching to blocking', desc_fr:'76 violations résorbées lors du burn-down (2026-06-06). Retirer AXE_BLOCKING=false du workflow pour activer le mode strict.', desc_en:'76 violations resolved during burn-down (2026-06-06). Remove AXE_BLOCKING=false from workflow to enable strict mode.' },
    ],
    checks_fr: ['node scripts/axe-audit.js exit 0 sur toutes les pages','Aucune violation de niveau critical ou serious','Rapport complet disponible dans axe-report.json','Logotype exclu de l\'audit contraste (exempt WCAG 1.4.3)','0 violation active depuis le burn-down du 2026-06-06'],
    checks_en: ['node scripts/axe-audit.js exit 0 on all pages','No critical or serious level violations','Full report available in axe-report.json','Logotype excluded from contrast audit (exempt WCAG 1.4.3)','0 active violations since burn-down of 2026-06-06'],
    trigger_table_fr: [['components/agtc-*.js','Oui — audit axe sur le composant'],['site/build.js (CSS)','Oui — impact potentiel accessibilité'],['tokens/ (couleurs)','Oui — contraste potentiellement impacté']],
    trigger_table_en: [['components/agtc-*.js','Yes — axe audit on component'],['site/build.js (CSS)','Yes — potential accessibility impact'],['tokens/ (colors)','Yes — contrast potentially impacted']],
    command: 'npm run axe\n# ou : node scripts/axe-audit.js\n# Rapport → axe-report.json\n# CI : .github/workflows/axe.yml (artefact uploadé)',
  },
  {
    id: 'style-dictionary', icon: 'layers', status: 'planned', blocking: false, order: 11,
    title_fr: 'Compilation Style Dictionary', title_en: 'Style Dictionary compilation',
    trigger_fr: 'tokens/*.json', trigger_en: 'tokens/*.json',
    desc_short_fr: 'Compile les trois niveaux de tokens JSON en CSS, JavaScript, Swift et Android XML — garantit que toutes les références se résolvent dans toutes les plateformes cibles.',
    desc_short_en: 'Compiles the three JSON token levels to CSS, JavaScript, Swift and Android XML — guarantees all references resolve across all target platforms.',
    marketing_fr: 'Un token défini, partout disponible. Style Dictionary compile automatiquement les tokens en variables CSS, modules JS, valeurs Swift et XML Android — cohérence multi-plateforme sans effort manuel.',
    marketing_en: 'One defined token, available everywhere. Style Dictionary automatically compiles tokens into CSS variables, JS modules, Swift values and Android XML — cross-platform consistency without manual effort.',
    objective_fr: 'Garantir que toute modification des tokens JSON se propage correctement dans toutes les plateformes cibles via Style Dictionary.',
    objective_en: 'Ensure every JSON token modification propagates correctly to all target platforms via Style Dictionary.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Tokens JSON modifiés', title_en:'JSON tokens modified', desc_fr:'tokens/primitives.json · tokens/semantic.json · tokens/component.json', desc_en:'tokens/primitives.json · tokens/semantic.json · tokens/component.json' },
      { role_fr:'02 · Compilation', role_en:'02 · Compilation', title_fr:'Style Dictionary build', title_en:'Style Dictionary build', desc_fr:'npx style-dictionary build → CSS · JS · Swift · Android XML depuis les mêmes sources JSON.', desc_en:'npx style-dictionary build → CSS · JS · Swift · Android XML from the same JSON sources.' },
      { role_fr:'03 · Validation', role_en:'03 · Validation', title_fr:'Sorties vérifiées', title_en:'Outputs verified', desc_fr:'dist/css/ · dist/js/ · dist/ios/ · dist/android/ — aucune référence non résolue, cohérence sources/sorties.', desc_en:'dist/css/ · dist/js/ · dist/ios/ · dist/android/ — no unresolved reference, source/output consistency.' },
    ],
    checks_fr: ['exit 0 sur la compilation (aucune erreur de résolution de référence)','dist/css/variables.css contient tous les tokens sémantiques','Valeur résolue en CSS = valeur dans primitives.json','Aucun token {unresolved.ref} dans les sorties','dist/js/, dist/ios/, dist/android/ générés correctement'],
    checks_en: ['exit 0 on compilation (no reference resolution error)','dist/css/variables.css contains all semantic tokens','Resolved CSS value = value in primitives.json','No {unresolved.ref} token in outputs','dist/js/, dist/ios/, dist/android/ correctly generated'],
    trigger_table_fr: [['tokens/primitives.json','Oui — compilation complète'],['tokens/semantic.json','Oui — compilation complète'],['tokens/component.json','Oui — compilation complète + approbation PD']],
    trigger_table_en: [['tokens/primitives.json','Yes — full compilation'],['tokens/semantic.json','Yes — full compilation'],['tokens/component.json','Yes — full compilation + PD approval']],
    command: 'npx style-dictionary build --config style-dictionary/config.json\n# Activation : npm install style-dictionary + configurer style-dictionary/config.json',
  },
  {
    id: 'playwright', icon: 'mouse-pointer-click', status: 'planned', blocking: false, order: 12,
    title_fr: 'Tests E2E Playwright', title_en: 'Playwright E2E tests',
    trigger_fr: 'site/build.js, components/', trigger_en: 'site/build.js, components/',
    desc_short_fr: 'Tests de parcours critiques sur le site de documentation — navigation, bascule FR/EN, explorateur de tokens, skip-link et navigation clavier sur les composants.',
    desc_short_en: 'Critical path tests on the documentation site — navigation, FR/EN toggle, token explorer, skip-link and keyboard navigation on components.',
    marketing_fr: 'Les fonctionnalités critiques testées en conditions réelles. Playwright valide chaque parcours utilisateur — bascule de langue, navigation clavier, explorateur de tokens — avant chaque déploiement.',
    marketing_en: 'Critical features tested in real conditions. Playwright validates every user journey — language switch, keyboard navigation, token explorer — before every deployment.',
    objective_fr: 'Garantir l\'intégrité des parcours critiques du site de documentation après chaque modification de build ou de composant.',
    objective_en: 'Guarantee the integrity of critical documentation site journeys after every build or component modification.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Build ou composants modifiés', title_en:'Build or components modified', desc_fr:'site/build.js · components/ — tout changement pouvant impacter les parcours utilisateur.', desc_en:'site/build.js · components/ — any change that may impact user journeys.' },
      { role_fr:'02 · Tests', role_en:'02 · Tests', title_fr:'5 parcours critiques', title_en:'5 critical journeys', desc_fr:'Navigation principale · Bascule FR↔EN · Filtre explorateur tokens · Skip-link focus · Navigation clavier composants', desc_en:'Main navigation · FR↔EN toggle · Token explorer filter · Skip-link focus · Component keyboard navigation' },
      { role_fr:'03 · Intégration axe', role_en:'03 · axe integration', title_fr:'Audit axe-core par page', title_en:'axe-core audit per page', desc_fr:'Chaque parcours intègre un audit axe-core de la page testée pour détecter les violations en contexte réel.', desc_en:'Each journey integrates an axe-core audit of the tested page to detect violations in real context.' },
    ],
    checks_fr: ['Navigation principale — tous les liens fonctionnels','Bascule FR ↔ EN — contenu change correctement','Filtre explorateur de tokens — résultats cohérents','Bouton skip-link — focus positionné sur #main-content','Chaque composant — états hover, focus, disabled accessibles au clavier'],
    checks_en: ['Main navigation — all links functional','FR ↔ EN toggle — content changes correctly','Token explorer filter — consistent results','Skip-link button — focus positioned on #main-content','Each component — hover, focus, disabled states keyboard accessible'],
    trigger_table_fr: [['site/build.js','Oui — parcours navigation + bascule langue'],['components/','Oui — navigation clavier + audit axe']],
    trigger_table_en: [['site/build.js','Yes — navigation journeys + language toggle'],['components/','Yes — keyboard navigation + axe audit']],
    command: 'npx playwright test\n# Activation :\n# npm install @playwright/test && npx playwright install\n# Créer tests/ avec les specs (ADR-010)',
  },
  {
    id: 'storybook', icon: 'book-open', status: 'planned', blocking: false, order: 13,
    title_fr: 'Validation Storybook', title_en: 'Storybook validation',
    trigger_fr: 'components/', trigger_en: 'components/',
    desc_short_fr: 'Vérifie que chaque composant a une story Storybook, que les variantes correspondent à component.json et que le build Storybook réussit sans erreur.',
    desc_short_en: 'Verifies that every component has a Storybook story, that variants match component.json, and that the Storybook build succeeds without errors.',
    marketing_fr: 'Le catalogue interactif comme source de vérité. Storybook garantit que chaque composant est documenté, prévisualisable et testable — designers et développeurs parlent le même langage.',
    marketing_en: 'The interactive catalog as source of truth. Storybook ensures every component is documented, previewable and testable — designers and developers speak the same language.',
    objective_fr: 'Garantir que chaque composant du système dispose d\'une story Storybook cohérente avec les tokens et les variantes définis dans component.json.',
    objective_en: 'Ensure every system component has a Storybook story consistent with the tokens and variants defined in component.json.',
    steps: [
      { role_fr:'01 · Déclencheur', role_en:'01 · Trigger', title_fr:'Composants modifiés', title_en:'Components modified', desc_fr:'components/agtc-*.js — tout nouveau composant ou changement de comportement.', desc_en:'components/agtc-*.js — any new component or behavior change.' },
      { role_fr:'02 · Vérification', role_en:'02 · Verification', title_fr:'Stories + cohérence variantes', title_en:'Stories + variant consistency', desc_fr:'Chaque components/agtc-[nom].js a un stories/agtc-[nom].stories.js. Les variantes = component.json.', desc_en:'Every components/agtc-[name].js has a stories/agtc-[name].stories.js. Variants match component.json.' },
      { role_fr:'03 · Build', role_en:'03 · Build', title_fr:'Build Storybook exit 0', title_en:'Storybook build exit 0', desc_fr:'npx storybook build exit 0 — aucune erreur de compilation, aucune importation de valeur hardcodée dans les stories.', desc_en:'npx storybook build exit 0 — no compilation error, no hardcoded value import in stories.' },
    ],
    checks_fr: ['Chaque components/agtc-[nom].js a un stories/agtc-[nom].stories.js','Les variantes dans la story = variantes dans tokens/component.json','Build Storybook exit 0 (aucune erreur)','Aucun import de valeur hardcodée dans les stories','parameters.docs.description.component renseigné (patterns UX appliqués)'],
    checks_en: ['Every components/agtc-[name].js has a stories/agtc-[name].stories.js','Variants in story = variants in tokens/component.json','Storybook build exit 0 (no errors)','No hardcoded value import in stories','parameters.docs.description.component filled (applied UX patterns)'],
    trigger_table_fr: [['components/agtc-*.js','Oui — vérification story + build'],['tokens/component.json','Oui — cohérence variantes story/tokens']],
    trigger_table_en: [['components/agtc-*.js','Yes — story check + build'],['tokens/component.json','Yes — story/tokens variant consistency']],
    command: 'npx storybook build\n# Activation :\n# npx storybook@latest init (configurer pour Web Components / Lit)\n# ADR-009 prévu — vérifier et activer',
  },
];

// ─── CSS ───────────────────────────────────────────────────────────────────
function tokensCSS() {
  const lines = [':root {', '  /* ── Primitive colors — Radix UI ── */'];
  for (const [scale, steps] of Object.entries(COLOR_SCALES))
    for (const [step, { value }] of Object.entries(steps))
      lines.push(`  --agtc-primitive-color-${scale}-${step}: ${value};`);
  // Espacements primitifs — référencés par certains tokens composant (badge, card)
  lines.push('\n  /* ── Primitive spacing — grille 4px ── */');
  for (const [step, tok] of Object.entries(primitives.primitive?.space || {}))
    lines.push(`  --agtc-primitive-space-${step}: ${tok.$value};`);
  lines.push('\n  /* ── Semantic tokens — UX intentions ── */');
  for (const [k, v] of Object.entries(SEM)) lines.push(`  --agtc-semantic-${k}: ${v};`);
  lines.push('\n  /* ── Component tokens — UI contracts ── */');
  for (const [k, v] of Object.entries(COMP)) lines.push(`  --agtc-component-${k}: ${v};`);
  lines.push('}');

  // Extension tokens (layout, gradients, shadows, dark mode) — from Redesign/tokens.css
  lines.push(`
/* ── Extension tokens : layout + gradients + shadows ── */
:root {
  --agtc-space-1:4px;  --agtc-space-2:8px;  --agtc-space-3:12px; --agtc-space-4:16px;
  --agtc-space-5:24px; --agtc-space-6:32px; --agtc-space-7:48px; --agtc-space-8:64px;
  --agtc-space-9:96px; --agtc-space-10:128px;
  --agtc-header-height:64px;
  /* Dimensions structurelles du site — tokens site-only */
  --agtc-site-header-padding-x:24px;
  --agtc-site-sidebar-width:236px;
  --agtc-site-toc-width:208px;
  --agtc-content-max:1180px;
  --agtc-semantic-radius-pill:999px;
  --agtc-semantic-color-border-strong:var(--agtc-primitive-color-gray-6);
  --agtc-shadow-sm:0 1px 2px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.05);
  --agtc-shadow-md:0 4px 12px rgba(16,24,40,.07),0 2px 6px rgba(16,24,40,.05);
  --agtc-shadow-lg:0 18px 40px -12px rgba(16,24,40,.18),0 8px 16px -8px rgba(16,24,40,.10);
  --agtc-shadow-glow:0 0 0 1px rgba(13,155,138,.20),0 12px 32px -8px rgba(13,155,138,.30);
  --agtc-drop-shadow-sm:0 1px 2px rgba(0,0,0,.3);
  --agtc-font-size-detail:.75rem;   --agtc-font-size-label:.875rem;
  --agtc-font-size-body:1rem;       --agtc-font-size-h5:1.25rem;
  --agtc-font-size-h4:1.5rem;       --agtc-font-size-h3:1.75rem;
  --agtc-font-size-h2:2rem;         --agtc-font-size-h1:2.5rem;
  --agtc-font-size-display:clamp(2.5rem,5vw,3.5rem);
  --agtc-line-height-text:1.6;      --agtc-line-height-heading:1.05;
  /* Accent (rose) and secondary (prune) brand primitives */
  --agtc-primitive-color-accent-9:#ed6b86;   --agtc-primitive-color-accent-10:#e05f7b;
  --agtc-primitive-color-accent-11:#a6294c;  --agtc-primitive-color-accent-12:#5d1f2e;
  --agtc-primitive-color-accent-8:#c8818c;
  --agtc-primitive-color-secondary-9:#463239; --agtc-primitive-color-secondary-11:#6b4b56;
  /* Brand semantic tokens (nouveaux — absents de tokens/semantic.json) */
  --agtc-semantic-color-accent:#ed6b86;
  --agtc-semantic-color-secondary:#463239;
  --agtc-semantic-color-tertiary:var(--agtc-primitive-color-slate-9);
  /* Brand gradients (teal → accent rose) */
  --agtc-gradient-brand:linear-gradient(115deg,var(--agtc-primitive-color-teal-11) 0%,var(--agtc-primitive-color-teal-9) 38%,var(--agtc-primitive-color-accent-9) 78%,var(--agtc-primitive-color-accent-10) 100%);
  --agtc-gradient-text:linear-gradient(100deg,var(--agtc-primitive-color-teal-8) 0%,var(--agtc-primitive-color-accent-8) 100%);
  --agtc-gradient-text-light:linear-gradient(100deg,var(--agtc-primitive-color-teal-11) 0%,var(--agtc-primitive-color-accent-11) 100%);
  --agtc-gradient-aurora:radial-gradient(60% 50% at 18% 8%,rgba(18,165,148,.26) 0%,transparent 60%),radial-gradient(55% 50% at 88% 22%,rgba(237,107,134,.20) 0%,transparent 62%),radial-gradient(70% 60% at 60% 100%,rgba(70,50,57,.40) 0%,transparent 60%);
  --agtc-surface-grid:rgba(95,227,208,.10);
  /* Surfaces semi-transparentes pour fonds sombres (home-section-ink) */
  --agtc-surface-glass:rgba(255,255,255,.06);
  --agtc-surface-glass-border:rgba(255,255,255,.10);
  --agtc-surface-glass-strong:rgba(255,255,255,.22);
  --agtc-surface-glass-hover:rgba(255,255,255,.12);
  --agtc-surface-glass-ghost-text:rgba(255,255,255,.85);
  --agtc-surface-accent-border:rgba(237,107,134,.45);
  --agtc-surface-overlay:rgba(0,0,0,.40);
  /* Espacement comfortable — valeurs pré-résolues (ceil() non supporté en CSS natif)
     comfortable = ceil(base × 1.25 / 4) × 4 */
  --agtc-semantic-space-comfortable-layout-component:28px;
  --agtc-semantic-space-comfortable-layout-section:40px;
  --agtc-semantic-space-comfortable-control-padding-x:20px;
  --agtc-semantic-space-comfortable-control-padding-y:12px;
  --agtc-semantic-space-comfortable-control-gap:12px;
  /* Font-weight sémantique — bold(700) et display(800) complètent la palette DTCG */
  --agtc-semantic-fontWeight-bold:700;
  --agtc-semantic-fontWeight-display:800;
  /* Tracking (letter-spacing) — échelle systémique */
  --agtc-tracking-tighter:-.03em;
  --agtc-tracking-tight:-.025em;
  --agtc-tracking-snug:-.02em;
  --agtc-tracking-heading:-.015em;
  --agtc-tracking-wide:.04em;
  --agtc-tracking-wider:.06em;
  --agtc-tracking-label:.08em;
  --agtc-tracking-loose:.09em;
  --agtc-tracking-overline:.1em;
  --agtc-tracking-eyebrow:.12em;
  color-scheme:light;
}
/* ── Dark mode — semantic overrides only ── */
:root[data-theme="dark"] {
  --agtc-semantic-color-action-primary:#34d3bb;
  --agtc-semantic-color-action-primary-hover:#5fe0cd;
  --agtc-semantic-color-action-primary-disabled:#33373d;
  --agtc-semantic-color-feedback-danger:#ff9592;
  --agtc-semantic-color-feedback-danger-subtle:#291415;
  --agtc-semantic-color-feedback-success:#3dd68c;
  --agtc-semantic-color-feedback-success-subtle:#132d21;
  --agtc-semantic-color-feedback-info:#34d3bb;
  --agtc-semantic-color-feedback-info-subtle:#0f2925;
  --agtc-semantic-color-feedback-info-border:#1e5e57;
  --agtc-semantic-color-feedback-warning:#ffca16;
  --agtc-semantic-color-brand-primary:#34d3bb;
  --agtc-semantic-color-background-page:#0a0c11;
  --agtc-semantic-color-background-surface:#13161d;
  --agtc-semantic-color-background-subtle:#1b1f27;
  --agtc-semantic-color-background-hover:#232833;
  --agtc-semantic-color-background-inverse:#120c0f;
  --agtc-semantic-color-text-primary:#edeef0;
  --agtc-semantic-color-text-secondary:#a4abb8;
  --agtc-semantic-color-text-disabled:#6b7280;
  --agtc-semantic-color-text-on-action:#04201c;
  --agtc-semantic-color-text-on-inverse:rgba(255,255,255,.92);
  --agtc-semantic-color-text-on-inverse-muted:rgba(255,255,255,.62);
  --agtc-semantic-color-border-default:#272c36;
  --agtc-semantic-color-border-strong:#363c48;
  --agtc-semantic-color-border-focus:#34d3bb;
  --agtc-semantic-color-border-danger:#ff9592;
  --agtc-semantic-color-accent:#ff8aa1;
  --agtc-semantic-color-secondary:#6b4b56;
  --agtc-semantic-color-brand-secondary:#6b4b56;
  --agtc-semantic-color-brand-secondary-text:#edd9df;
  /* Subtle + text — manquants en dark, provoquent des échecs de contraste */
  --agtc-semantic-color-brand-primary-subtle:#0d2924;
  --agtc-semantic-color-brand-primary-text:#34d3bb;
  --agtc-semantic-color-brand-accent-subtle:#2a1520;
  --agtc-semantic-color-brand-accent-text:#ed6b86;
  --agtc-semantic-color-feedback-warning-subtle:#241800;
  --agtc-semantic-color-feedback-warning-text:#ffca16;
  --agtc-semantic-color-feedback-info-text:#34d3bb;
  /* text-on-danger : fond danger est rose clair en dark (#ff9592) → texte doit être foncé */
  --agtc-semantic-color-text-on-danger:#3d0f0f;
  --agtc-semantic-color-tertiary:#6b7280;
  --agtc-semantic-color-illustration-ink:#14121a;
  --agtc-shadow-sm:0 1px 2px rgba(0,0,0,.4);
  --agtc-shadow-md:0 4px 14px rgba(0,0,0,.45);
  --agtc-shadow-lg:0 20px 44px -12px rgba(0,0,0,.6);
  --agtc-shadow-glow:0 0 0 1px rgba(52,211,187,.28),0 14px 36px -8px rgba(52,211,187,.22);
  color-scheme:dark;
}`);

  return lines.join('\n');
}

function siteCSS() { return `
/* Agentica — site.css (uses design system tokens) */
/* Google Fonts chargé via <link> dans <head> (non bloquant) — pas d'@import */
:root{--agtc-font-mono:var(--agtc-semantic-typography-mono-family)}


*,*::before,*::after{box-sizing:border-box}
*{margin:0;padding:0}

body{
  font-family:'Atkinson Hyperlegible',system-ui,sans-serif;
  background:var(--agtc-semantic-color-background-page);
  color:var(--agtc-semantic-color-text-primary);
  font-size:var(--agtc-semantic-typography-body-size);
  font-weight:var(--agtc-semantic-typography-body-weight);
  line-height:var(--agtc-semantic-typography-body-line-height);
}

/* ── HEADER ─────────────────────────────────────────────── */
.site-header{
  position:fixed;top:0;left:0;right:0;height:var(--agtc-header-height,64px);z-index:100;
  background:color-mix(in srgb,var(--agtc-semantic-color-background-surface) 85%,transparent);
  backdrop-filter:saturate(150%) blur(14px);
  -webkit-backdrop-filter:saturate(150%) blur(14px);
  border-top:3px solid var(--agtc-semantic-color-action-primary);
  border-bottom:1px solid var(--agtc-semantic-color-border-default);
  box-shadow:var(--agtc-shadow-sm);
  display:flex;align-items:center;padding:0 var(--agtc-site-header-padding-x);gap:16px;
}
.logo{display:flex;align-items:center;gap:9px;text-decoration:none;flex-shrink:0}
.logo-mark{height:26px;width:26px;flex-shrink:0;display:block}
.logo-name{font-size:1.05rem;font-weight:var(--agtc-semantic-fontWeight-display);letter-spacing:var(--agtc-tracking-snug);color:var(--agtc-semantic-color-brand-primary);line-height:1}
/* ── Règle système : no-visited-nav (ADR-047) ───────────────────────────
   Les éléments de navigation ne portent jamais d'état :visited distinct.
   Exception Safari : valeur hex avant var() (ADR-059).
   agtc-top-nav gère :visited dans son shadow DOM (ADR-060). */
.sidebar a:visited,
.toc a:visited,
.nav-card:visited,
.github-btn:visited,
.storybook-btn:visited     {color:#646464;color:var(--agtc-semantic-color-text-secondary)}
.footer-links a:visited    {color:rgba(255,255,255,.75);color:var(--agtc-semantic-color-text-on-inverse-secondary)}
.audit-footer-link:visited {color:rgba(255,255,255,.52);color:var(--agtc-semantic-color-text-on-inverse-muted)}
/* Dark mode — valeurs résolues pour Safari (var() ignoré dans :visited) */
[data-theme="dark"] .sidebar a:visited,
[data-theme="dark"] .toc a:visited,
[data-theme="dark"] .nav-card:visited,
[data-theme="dark"] .github-btn:visited,
[data-theme="dark"] .storybook-btn:visited     {color:#a4abb8;color:var(--agtc-semantic-color-text-secondary)}
.github-btn,.storybook-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--agtc-semantic-radius-control);color:var(--agtc-semantic-color-text-secondary);text-decoration:none;transition:color .12s,background .12s;flex-shrink:0}
.github-btn:hover,.storybook-btn:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.github-btn:active,.storybook-btn:active{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.github-btn:focus-visible,.storybook-btn:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}

/* ── LAYOUT ─────────────────────────────────────────────── */
.layout{display:flex;margin-top:var(--agtc-header-height,64px);min-height:calc(100vh - var(--agtc-header-height,64px))}
.sidebar{
  width:var(--agtc-site-sidebar-width);flex-shrink:0;
  border-right:1px solid var(--agtc-semantic-color-border-default);
  background:var(--agtc-semantic-color-background-surface);
  position:sticky;top:var(--agtc-header-height,64px);height:calc(100vh - var(--agtc-header-height,64px));overflow-y:auto;
  padding:20px 0;
}
.sidebar-group{margin-bottom:8px}
.sidebar-label{
  font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);
  color:var(--agtc-semantic-color-text-secondary);padding:8px 20px 4px;display:block;
}
.sidebar a{
  display:block;padding:6px 20px;text-decoration:none;font-size:var(--agtc-semantic-typography-label-size);
  color:var(--agtc-semantic-color-text-secondary);border-radius:0;
  transition:background .1s,color .1s;border-left:2px solid transparent;
}
.sidebar a:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.sidebar a:focus-visible{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary);outline:none;box-shadow:inset 0 0 0 2px var(--agtc-semantic-color-border-focus)}
.sidebar a:active{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.sidebar a.active{
  background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-action-primary);
  border-left-color:var(--agtc-semantic-color-action-primary);border-left-width:3px;font-weight:var(--agtc-semantic-typography-label-weight);
}
.content{flex:1;padding:52px 64px;max-width:960px}

/* ── HOME LAYOUT ────────────────────────────────────────── */
.home-layout{margin-top:var(--agtc-header-height,64px)}

.stat-band{
  display:flex;flex-wrap:wrap;
  background:var(--agtc-semantic-color-brand-secondary);
  border-top:1px solid rgba(255,255,255,.12);
  border-bottom:1px solid rgba(255,255,255,.12);
}
.stat-item{
  flex:1;min-width:150px;padding:28px 32px;text-align:center;
  border-right:1px solid rgba(255,255,255,.12);
}
.stat-item:last-child{border-right:none}
.stat-num{font-size:var(--agtc-font-size-display);font-weight:var(--agtc-semantic-fontWeight-display);display:block;letter-spacing:var(--agtc-tracking-snug);color:var(--agtc-semantic-color-action-primary)}
.stat-text{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);margin-top:4px;display:block}
.stat-band .stat-text{color:rgba(255,255,255,.72)}

.home-section{padding:var(--agtc-space-9,96px) var(--agtc-space-5,24px);max-width:var(--agtc-content-max,1180px);margin:0 auto}
.home-section h2{font-size:var(--agtc-semantic-typography-heading-3-size);font-weight:var(--agtc-semantic-fontWeight-bold);letter-spacing:var(--agtc-tracking-snug);margin-bottom:8px}
.home-section > p{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);margin-bottom:32px;line-height:1.7}

/* ── NAV CARDS ───────────────────────────────────────────── */
.nav-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
/* Cartes-grilles : surface (fond/bordure/rayon) via le contrat du composant card
   (component.card.* — ADR-035). Layout interne et hover restent propres au site. */
.nav-card{
  background:var(--agtc-component-card-default-background);
  border:1px solid var(--agtc-component-card-default-border);
  border-radius:var(--agtc-component-card-default-radius);
  padding:24px;text-decoration:none;color:inherit;
  transition:border-color .18s;display:block;
}
.nav-card:focus-visible{border-color:var(--agtc-semantic-color-action-primary);outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.nav-card-icon{width:var(--agtc-semantic-icon-size-nav);height:var(--agtc-semantic-icon-size-nav);margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:var(--agtc-semantic-color-action-primary)}.nav-card-icon svg{width:var(--agtc-semantic-icon-size-nav);height:var(--agtc-semantic-icon-size-nav)}
.nav-card-title{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-brand-secondary-text);margin-bottom:6px}
.nav-card-desc{font-size:var(--agtc-component-card-typography-body-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.55}
.icon-ok{color:var(--agtc-semantic-color-feedback-success);display:inline-flex;vertical-align:middle;margin-right:4px}
.icon-no{color:var(--agtc-semantic-color-feedback-danger);display:inline-flex;vertical-align:middle;margin-right:4px}
.icon-ok svg,.icon-no svg{display:inline;vertical-align:middle}
.agtc-badge .icon-ok,.agtc-badge .icon-no{margin-right:0}
h3 .icon-ok,h3 .icon-no{margin-right:6px}

/* ── TOKEN PIPELINE ─────────────────────────────────────── */
.pipeline{display:flex;align-items:stretch;margin:32px 0;gap:0;border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);overflow:hidden}
.pipeline-step{flex:1;padding:24px;background:var(--agtc-semantic-color-background-surface)}
.pipeline-step+.pipeline-step{border-left:1px solid var(--agtc-semantic-color-border-default)}
.pipeline-step:first-child{background:var(--agtc-semantic-color-background-subtle)}
.pipeline-step:last-child{background:var(--agtc-semantic-color-background-surface);border-left:3px solid var(--agtc-semantic-color-action-primary)}
.pipeline-tag{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.pipeline-title{font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:6px}
.pipeline-desc{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.5}
.pipeline-example{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-action-primary);margin-top:10px;background:var(--agtc-semantic-color-background-surface);padding:6px 10px;border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-default)}

/* ── ILLUSTRATIONS ───────────────────────────────────────── */
.illus-block{margin:32px 0 24px;border-radius:var(--agtc-semantic-radius-card);overflow:hidden;line-height:0}
.illus-block svg{display:block;width:100%;height:auto}
.illus-lazy[data-svg]{aspect-ratio:800/420;width:100%;background:var(--agtc-semantic-color-background-subtle);display:block}
.illus-dark-row{background:var(--agtc-semantic-color-brand-secondary,#463239);width:100vw;position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;padding:var(--agtc-space-8,64px) 0;line-height:0}
.illus-dark-row .illus-block{margin:0;border-radius:0;max-width:var(--agtc-content-max,1180px);margin-left:auto;margin-right:auto}

/* ── SECTION FOND SECONDAIRE (bordeaux) ───────────────────── */
.section-secondary{background:var(--agtc-semantic-color-brand-secondary,#463239);padding:var(--agtc-space-9) var(--agtc-space-5);position:relative;overflow:hidden}
.section-secondary .si-inner{max-width:var(--agtc-content-max,1180px);margin:0 auto;position:relative}
.section-secondary h2{font-size:var(--agtc-semantic-typography-heading-3-size);color:var(--agtc-semantic-color-text-on-inverse,rgba(255,255,255,.92));border-top:none;padding-top:0;margin-top:0}
.section-secondary .eyebrow{color:rgba(255,255,255,.55)}
.section-secondary .si-inner>p{color:rgba(255,255,255,.75)}
.section-secondary .illus-block{border-radius:0;margin:var(--agtc-space-8,64px) calc(-1 * var(--agtc-space-5,24px));width:calc(100% + 2*var(--agtc-space-5,24px));max-width:none}
.section-secondary .context-card{background:rgba(0,0,0,.18);border-color:rgba(255,255,255,.12)}
.section-secondary .context-card-accent{background:rgba(0,0,0,.28);border-color:rgba(255,255,255,.22)}
.section-secondary .context-title{color:var(--agtc-semantic-color-text-on-inverse,rgba(255,255,255,.92))}
.section-secondary .context-desc{color:rgba(255,255,255,.75)}
.section-secondary .context-badge{background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.18);color:rgba(255,255,255,.7)}
.section-secondary .context-badge-accent{color:rgba(255,255,255,.9)}
.section-secondary .context-attr{background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.18);color:rgba(255,255,255,.7)}
.section-secondary .context-attr em{color:rgba(255,255,255,.45)}
.section-secondary .ds-btn{border-color:rgba(255,255,255,.3);color:var(--agtc-semantic-color-text-on-inverse,rgba(255,255,255,.92))}
.section-secondary .ds-btn:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.5)}
.section-secondary .pipeline{border-color:rgba(255,255,255,.12)}
.section-secondary .pipeline-step{background:rgba(0,0,0,.18);border-color:rgba(255,255,255,.1)}
.section-secondary .pipeline-step+.pipeline-step{border-left-color:rgba(255,255,255,.12)}
.section-secondary .pipeline-step:first-child{background:rgba(0,0,0,.28)}
.section-secondary .pipeline-step:last-child{border-left:3px solid var(--agtc-semantic-color-brand-primary)}
.section-secondary .pipeline-tag{color:rgba(255,255,255,.7)}
.section-secondary .pipeline-title{color:rgba(255,255,255,.95)}
.section-secondary .pipeline-desc{color:rgba(255,255,255,.75)}
.section-secondary .pipeline-example{background:rgba(0,0,0,.2);border-color:rgba(255,255,255,.15);color:var(--agtc-semantic-color-brand-primary)}
/* Stat-band & CTA sur fond secondaire */
.section-secondary .stat-text{color:rgba(255,255,255,.72)}
.section-secondary .cta-final h2{color:var(--agtc-semantic-color-text-on-inverse,rgba(255,255,255,.92))}
.section-secondary .cta-final p{color:rgba(255,255,255,.75)}
/* Stack — spécificité renforcée pour override les règles de base */
.section-secondary .stack-flow .stack-node,.section-secondary .stack-flow .stack-node:last-child{background:rgba(0,0,0,.18)!important;border-right-color:rgba(255,255,255,.1)!important}
.section-secondary .stack-flow .stack-node-icon{color:var(--agtc-semantic-color-brand-primary)!important}
.section-secondary .stack-flow .stack-node-label{color:rgba(255,255,255,.92)!important}
.section-secondary .stack-flow .stack-node-sub{color:rgba(255,255,255,.72)!important}

/* ── DEUX CONTEXTES CARDS ─────────────────────────────────── */
.contexts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin:24px 0 32px}
.context-card{padding:28px;border-radius:var(--agtc-semantic-radius-card);display:flex;flex-direction:column;gap:12px;border:1px solid var(--agtc-semantic-color-border-default)}
.context-badge{display:inline-block;font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-secondary);padding:3px 10px;border-radius:var(--agtc-semantic-radius-control);background:var(--agtc-semantic-color-background-subtle);border:1px solid var(--agtc-semantic-color-border-default);width:fit-content}
.context-badge-accent{color:var(--agtc-semantic-color-brand-accent-text);background:var(--agtc-semantic-color-brand-accent-subtle);border-color:var(--agtc-semantic-color-brand-accent)}
.context-title{font-size:var(--agtc-semantic-typography-heading-4-size,18px);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-brand-secondary-text);line-height:1.3}
.context-desc{font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.6}
.context-attr{display:inline-block;font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);padding:4px 10px;border-radius:var(--agtc-semantic-radius-control);background:var(--agtc-semantic-color-background-subtle);border:1px solid var(--agtc-semantic-color-border-default);color:var(--agtc-semantic-color-text-secondary);margin-top:4px}
.context-attr em{color:var(--agtc-semantic-color-text-tertiary,var(--agtc-semantic-color-text-secondary));font-style:italic}
.context-card-accent{border-color:var(--agtc-semantic-color-brand-accent);background:var(--agtc-semantic-color-brand-accent-subtle,var(--agtc-semantic-color-background-subtle))}
.context-card-accent .context-title{color:var(--agtc-semantic-color-brand-accent-text)}
.context-card-accent .context-attr{background:var(--agtc-semantic-color-background-default,var(--agtc-semantic-color-background-surface));border-color:var(--agtc-semantic-color-brand-accent);color:var(--agtc-semantic-color-brand-accent-text)}

/* ── DARK ILLUSTRATION SECTIONS ──────────────────────────── */
.home-section-ink{background:var(--agtc-semantic-color-illustration-ink,#211f26);overflow-x:hidden}
.home-section-ink .home-section h2{
  color:var(--agtc-semantic-color-text-on-inverse,#eff1f3);
  border-top:none;margin-top:0;padding-top:0;
}
.home-section-ink .home-section>p{color:var(--agtc-semantic-color-text-on-inverse-secondary)}
.home-section-ink .illus-block{border-radius:0;margin-left:-72px;margin-right:-72px;margin-top:64px;margin-bottom:0}
/* Principle cards : verre sombre sur fond ink */
.home-section-ink .principle-card{background:var(--agtc-surface-glass);border-color:var(--agtc-surface-glass-border)}
.home-section-ink .principle-title{color:var(--agtc-semantic-color-text-on-inverse,#eff1f3)}
.home-section-ink .principle-desc{color:var(--agtc-semantic-color-text-on-inverse-secondary)}

/* ── THÈME LIGHT [data-theme="light"] ────────────────────── */
/* Les sections .home-section-ink restent toujours sombres (illustration-ink).
   Seules les principle-cards s'adaptent au thème light. */
[data-theme="light"] .home-section-ink .principle-card{background:var(--agtc-component-card-default-background);border-color:var(--agtc-component-card-default-border)}
[data-theme="light"] .home-section-ink .principle-title{color:var(--agtc-semantic-color-text-primary)}
[data-theme="light"] .home-section-ink .principle-desc{color:var(--agtc-semantic-color-text-secondary)}

/* ── PRINCIPLE CARDS ─────────────────────────────────────── */
.principle-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:24px 0}
.principle-card{background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:var(--agtc-component-card-default-padding)}
.principle-num{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-action-primary);margin-bottom:8px}
.principle-title{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-text-primary);margin-bottom:6px}
.principle-desc{font-size:var(--agtc-component-card-typography-body-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.55}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
h1:not(.hero h1){font-size:var(--agtc-semantic-typography-heading-2-size);font-weight:var(--agtc-semantic-fontWeight-display);line-height:1.0;letter-spacing:var(--agtc-tracking-tight);margin-bottom:10px}
.page-lead{font-size:var(--agtc-semantic-typography-heading-5-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.65;margin-bottom:48px;max-width:580px}
h2{font-size:var(--agtc-semantic-typography-heading-5-size);font-weight:var(--agtc-semantic-fontWeight-bold);letter-spacing:var(--agtc-tracking-heading);margin-top:56px;margin-bottom:16px;padding-top:48px;border-top:1px solid var(--agtc-semantic-color-border-default)}
h2.first{margin-top:32px;padding-top:0;border-top:none}
h3{font-size:var(--agtc-semantic-typography-body-size);font-weight:var(--agtc-semantic-fontWeight-bold);margin-top:32px;margin-bottom:12px}
p{color:var(--agtc-semantic-color-text-secondary);margin-bottom:16px;line-height:1.7}

code{font-family:var(--agtc-font-mono);font-size:.85em;background:var(--agtc-semantic-color-background-subtle);padding:2px 5px;border-radius:var(--agtc-semantic-radius-control);color:var(--agtc-semantic-color-text-primary)}
pre.code-block{background:var(--agtc-component-code-block-default-background);border-radius:var(--agtc-component-code-block-default-radius);padding:var(--agtc-component-code-block-default-padding-y) var(--agtc-component-code-block-default-padding-x);overflow-x:auto;margin:18px 0;position:relative}
pre.code-block code{background:none;color:var(--agtc-component-code-block-default-text);font-family:var(--agtc-semantic-typography-mono-family);font-size:var(--agtc-component-code-block-default-font-size);padding:0;border-radius:0}
pre.code-block .code-lang{position:absolute;top:12px;left:18px;color:var(--agtc-component-code-block-default-meta-text);font-size:var(--agtc-semantic-typography-detail-size);text-transform:uppercase;letter-spacing:var(--agtc-tracking-wider);font-weight:var(--agtc-semantic-typography-label-weight);font-family:var(--agtc-semantic-typography-mono-family)}
pre.code-block.has-lang{padding-top:38px}
.code-copy{position:absolute;top:10px;right:10px;display:inline-flex;align-items:center;gap:6px;background:var(--agtc-component-code-block-default-copy-background);color:var(--agtc-component-code-block-default-copy-text);border:none;border-radius:var(--agtc-semantic-radius-control);padding:4px 10px;font-size:var(--agtc-semantic-typography-detail-size);font-family:inherit;cursor:pointer}
.code-copy:hover{background:var(--agtc-component-code-block-default-copy-background-hover)}
.code-copy:focus-visible{outline:2px solid var(--agtc-component-code-block-default-border-focus);outline-offset:2px}

blockquote{border-left:3px solid var(--agtc-semantic-color-action-primary);padding:14px 20px;margin:20px 0;background:var(--agtc-semantic-color-background-subtle);border-radius:0 var(--agtc-semantic-radius-control) var(--agtc-semantic-radius-control) 0}
blockquote p{margin:0;font-style:italic;color:var(--agtc-semantic-color-text-primary)}

hr{border:none;border-top:1px solid var(--agtc-semantic-color-border-default);margin:32px 0}

ul,ol{padding-left:22px;margin:12px 0}
li{margin-bottom:6px;color:var(--agtc-semantic-color-text-secondary);line-height:1.65}
li code{font-size:.8em}

/* ── TABLES ─────────────────────────────────────────────── */
/* Tables du site : consomment le contrat du composant table (component.table.* — ADR-040).
   Le site s'aligne sur le composant (dogfooding cat. A) ; il garde sa présentation
   d'en-tête (majuscules, tracking), mais toutes les COULEURS viennent du composant. */
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:16px 0 28px;outline-offset:2px}.table-wrap:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus)}
table{width:100%;border-collapse:collapse;margin:0;font-size:var(--agtc-semantic-typography-label-size);table-layout:auto;min-width:420px}
th{text-align:left;padding:10px 16px;background:var(--agtc-component-table-default-header-background);color:var(--agtc-component-table-default-header-text);font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-wider);border-bottom:1px solid var(--agtc-component-table-default-border);white-space:nowrap}
td{padding:12px 16px;border-bottom:1px solid var(--agtc-component-table-default-border);color:var(--agtc-component-table-default-cell-text);vertical-align:top;word-break:break-word;overflow-wrap:anywhere}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--agtc-component-table-default-row-hover)}
td code{color:var(--agtc-semantic-color-action-primary);word-break:break-all}

/* ── COLOR SYSTEM ───────────────────────────────────────── */
.semantic-colors{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:24px 0}
.color-token{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:16px;display:flex;align-items:center;gap:14px}
.color-swatch{width:44px;height:44px;display:inline-block;border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0}
.color-info{}
.color-name{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:3px}
.color-value{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)}
.color-intent{font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);margin-top:4px}

.palette-section{margin:40px 0}
.palette-scale-name{font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:capitalize;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.palette-steps{display:grid;grid-template-columns:repeat(12,1fr);gap:4px}
.palette-step{height:48px;border-radius:var(--agtc-semantic-radius-control);cursor:default;position:relative}
.palette-step:hover::after{content:attr(title);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--agtc-semantic-color-background-inverse-raised);color:var(--agtc-semantic-color-text-on-inverse);font-size:var(--agtc-semantic-typography-detail-size);padding:4px 8px;border-radius:var(--agtc-semantic-radius-control);white-space:nowrap;z-index:10;font-family:var(--agtc-font-mono);pointer-events:none}

/* ── SPACING ────────────────────────────────────────────── */
.space-demo{display:flex;flex-direction:column;gap:6px;margin:28px 0}
.space-item{display:flex;align-items:center;gap:12px}
.space-bar{background:var(--agtc-semantic-color-viz-scale-bar);border-radius:3px;height:20px;min-width:4px;flex-shrink:0}
.space-label{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);min-width:72px}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
.type-specimen{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:24px;margin:12px 0}
.type-spec-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-secondary);margin-bottom:12px}

/* ── COMPONENT DEMOS ────────────────────────────────────── */
.demo-box{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:40px;margin:24px 0}
.demo-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.demo-group{margin-bottom:28px}
.demo-group:last-child{margin-bottom:0}
.demo-group-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-secondary);margin-bottom:12px;display:block}

.agtc-button{
  display:inline-flex;align-items:center;gap:6px;
  padding:var(--agtc-component-button-primary-padding-y) var(--agtc-component-button-primary-padding-x);
  border-radius:var(--agtc-component-button-primary-radius);
  font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);font-family:inherit;cursor:pointer;
  border:1.5px solid transparent;transition:background .12s,color .12s,border-color .12s;line-height:1.4;
  text-decoration:none;
}
.agtc-button:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.agtc-button:disabled{cursor:not-allowed;opacity:.45}
.agtc-button.primary{background:var(--agtc-component-button-primary-background);color:var(--agtc-component-button-primary-text);border-color:var(--agtc-component-button-primary-background)}
.agtc-button.primary:hover:not(:disabled){background:var(--agtc-component-button-primary-background-hover);border-color:var(--agtc-component-button-primary-background-hover)}
.agtc-button.secondary{background:var(--agtc-component-button-secondary-background);color:var(--agtc-component-button-secondary-text);border-color:var(--agtc-component-button-secondary-border)}
.agtc-button.secondary:hover:not(:disabled){background:var(--agtc-component-button-secondary-background-hover)}
.agtc-button.ghost{background:var(--agtc-component-button-ghost-background);color:var(--agtc-component-button-ghost-text);border-color:transparent}
.agtc-button.ghost:hover:not(:disabled){background:var(--agtc-component-button-ghost-background-hover)}
.agtc-button.critical{background:var(--agtc-component-button-critical-background);color:var(--agtc-component-button-critical-text);border-color:var(--agtc-component-button-critical-border)}
.agtc-button.critical:hover:not(:disabled){background:var(--agtc-component-button-critical-background-hover);color:var(--agtc-component-button-critical-border)}
.agtc-button.icon-only{padding:var(--agtc-component-button-primary-padding-y)}

.variant-tag{display:inline-flex;align-items:center;font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-wider);padding:2px 8px;border-radius:var(--agtc-semantic-radius-control);background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-secondary)}

/* ── TOKEN EXPLORER ─────────────────────────────────────── */
.token-search-status{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);min-height:1.2em;margin:-8px 0 8px}
.explorer-search{
  width:100%;max-width:480px;padding:10px 14px;
  border:1.5px solid var(--agtc-semantic-color-border-default);
  border-radius:var(--agtc-semantic-radius-control);
  font-size:var(--agtc-semantic-typography-label-size);background:var(--agtc-semantic-color-background-surface);
  color:var(--agtc-semantic-color-text-primary);font-family:inherit;margin-bottom:20px;
}
.explorer-search:focus,.explorer-search:focus-visible{outline:none;border-color:var(--agtc-semantic-color-border-focus);box-shadow:0 0 0 3px var(--agtc-semantic-color-action-focus-ring,rgba(59,130,246,.25))}
.explorer-tabs{display:flex;gap:2px;border-bottom:2px solid var(--agtc-semantic-color-border-default);margin-bottom:20px}
.exp-tab{
  padding:8px 20px;font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);color:var(--agtc-semantic-color-text-secondary);
  border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;
  margin-bottom:-2px;font-family:inherit;transition:color .1s;
}
.exp-tab.active{color:var(--agtc-semantic-color-action-primary);border-bottom-color:var(--agtc-semantic-color-action-primary)}
.exp-tab:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px;border-radius:var(--agtc-semantic-radius-control)}
.exp-panel{display:none}
.exp-panel.active{display:block}
.token-row td:first-child code{color:var(--agtc-semantic-color-action-primary)}
.token-table{table-layout:fixed}
.token-table td{overflow-wrap:break-word;word-break:break-word}
/* En-têtes : jamais de coupure au milieu d'un mot — retour à la ligne aux espaces seulement */
.token-table th{overflow-wrap:normal;word-break:normal;hyphens:none}

/* ── UTILITY CLASSES ─────────────────────────────────────── */
.mono-sm{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size)}
.demo-col{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.prop-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);display:block;margin-bottom:6px;color:var(--agtc-semantic-color-text-secondary)}

/* ── agtc-table (classe — moitié light DOM du mix, ADR-040) ─────────────── */
.agtc-table{
  width:100%;border-collapse:collapse;
  font-size:var(--agtc-component-table-default-font-size);
  color:var(--agtc-component-table-default-cell-text);
}
.agtc-table caption{
  text-align:start;color:var(--agtc-component-table-default-caption-text);
  padding:var(--agtc-component-table-padding-y-compact) var(--agtc-component-table-padding-x);
}
.agtc-table caption.visually-hidden{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;
}
.agtc-table th{
  text-align:start;font-weight:var(--agtc-semantic-typography-label-weight);
  color:var(--agtc-component-table-default-header-text);
  background:var(--agtc-component-table-default-header-background);white-space:nowrap;
}
.agtc-table th,.agtc-table td{
  padding:var(--agtc-component-table-padding-y-compact) var(--agtc-component-table-padding-x);
  border-bottom:1px solid var(--agtc-component-table-default-border);vertical-align:top;
}
.agtc-table th.num,.agtc-table td.num{text-align:end}
.agtc-table tbody tr:last-child td{border-bottom:none}
.agtc-table tbody tr:hover{background:var(--agtc-component-table-default-row-hover)}
.agtc-table.striped tbody tr:nth-child(even){background:var(--agtc-component-table-default-stripe)}
.agtc-table.striped tbody tr:nth-child(even):hover{background:var(--agtc-component-table-default-row-hover)}

/* ── agtc-banner (classe — moitié light DOM du mix, ADR-042) ────────────── */
.agtc-banner{display:flex;align-items:flex-start;gap:12px;padding:var(--agtc-component-banner-padding-y) var(--agtc-component-banner-padding-x);border:1px solid var(--agtc-semantic-color-border-default);border-left-width:3px;border-radius:0 var(--agtc-component-banner-radius) var(--agtc-component-banner-radius) 0;margin:18px 0}
.agtc-banner .banner-icon{flex-shrink:0;line-height:0;padding-top:1px}
.agtc-banner .banner-content{flex:1;min-width:0}
.agtc-banner .banner-content strong{display:block;color:var(--agtc-component-banner-heading-text);font-weight:var(--agtc-semantic-typography-label-weight);font-size:var(--agtc-semantic-typography-label-size);margin-bottom:3px}
.agtc-banner .banner-content>span{display:block;color:var(--agtc-component-banner-body-text);font-size:var(--agtc-semantic-typography-label-size);line-height:1.55}
.agtc-banner.neutral{background:var(--agtc-component-banner-neutral-background);border-left-color:var(--agtc-component-banner-neutral-accent)}
.agtc-banner.neutral .banner-icon{color:var(--agtc-component-banner-neutral-accent)}
.agtc-banner.brand{background:var(--agtc-component-banner-brand-background);border-left-color:var(--agtc-component-banner-brand-accent)}
.agtc-banner.brand .banner-icon{color:var(--agtc-component-banner-brand-accent)}
.agtc-banner.info{background:var(--agtc-component-banner-info-background);border-left-color:var(--agtc-component-banner-info-accent)}
.agtc-banner.info .banner-icon{color:var(--agtc-component-banner-info-accent)}
.agtc-banner.success{background:var(--agtc-component-banner-success-background);border-left-color:var(--agtc-component-banner-success-accent)}
.agtc-banner.success .banner-icon{color:var(--agtc-component-banner-success-accent)}
.agtc-banner.warning{background:var(--agtc-component-banner-warning-background);border-left-color:var(--agtc-component-banner-warning-accent)}
.agtc-banner.warning .banner-icon{color:var(--agtc-component-banner-warning-accent)}
.agtc-banner.danger{background:var(--agtc-component-banner-danger-background);border-left-color:var(--agtc-component-banner-danger-accent)}
.agtc-banner.danger .banner-icon{color:var(--agtc-component-banner-danger-accent)}

/* ── Utilitaire d'accessibilité ────────────────────────────────────────── */
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}

/* ── agtc-link (classe — moitié light DOM du mix, ADR-043) ──────────────── */
.agtc-link{color:var(--agtc-component-link-default-text);text-decoration:underline;text-underline-offset:2px;border-radius:2px}
.agtc-link:hover{color:var(--agtc-component-link-default-text-hover)}
.agtc-link:focus-visible{outline:2px solid var(--agtc-component-link-default-border-focus);outline-offset:2px}
.agtc-link.underline-hover,.agtc-link.underline-none{text-decoration:none}
.agtc-link.underline-hover:hover{text-decoration:underline}

/* ── agtc-segmented (classe — moitié light DOM du mix, ADR-044) ─────────── */
.agtc-segmented{display:inline-flex;gap:2px;padding:2px;background:var(--agtc-component-segmented-default-track-background);border-radius:var(--agtc-component-segmented-default-radius)}
.agtc-segmented button{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:5px 12px;border:none;border-radius:calc(var(--agtc-component-segmented-default-radius) - 2px);background:none;color:var(--agtc-component-segmented-default-text);font-family:inherit;font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);line-height:1.2;white-space:nowrap;cursor:pointer;transition:background .12s,color .12s}
.agtc-segmented button:hover{color:var(--agtc-component-segmented-default-text-hover)}
.agtc-segmented button[aria-current="true"]{background:var(--agtc-component-segmented-default-selected-background);color:var(--agtc-component-segmented-default-selected-text);font-weight:var(--agtc-semantic-fontWeight-bold)}
.agtc-segmented button:focus-visible{outline:2px solid var(--agtc-component-segmented-default-border-focus);outline-offset:2px}

/* ── DECISIONS ──────────────────────────────────────────── */
.adr-num{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)}
.adr-title a{color:var(--agtc-semantic-color-action-primary);text-decoration:none;font-weight:var(--agtc-semantic-typography-label-weight)}
.adr-title a:hover{text-decoration:underline}
/* ── agtc-badge (classe — moitié light DOM du mix, ADR-034 ; dogfooding cat. A) ── */
.agtc-badge{display:inline-flex;align-items:center;gap:4px;font-weight:var(--agtc-semantic-typography-label-weight);line-height:1;white-space:nowrap;border:1px solid transparent;padding:var(--agtc-component-badge-md-padding-y) var(--agtc-component-badge-md-padding-x);border-radius:var(--agtc-component-badge-md-radius);font-size:var(--agtc-component-badge-md-font-size)}
.agtc-badge.sm{padding:var(--agtc-component-badge-sm-padding-y) var(--agtc-component-badge-sm-padding-x);font-size:var(--agtc-component-badge-sm-font-size)}
.agtc-badge.neutral{background:var(--agtc-component-badge-neutral-background);color:var(--agtc-component-badge-neutral-text);border-color:var(--agtc-component-badge-neutral-border)}
.agtc-badge.brand{background:var(--agtc-component-badge-brand-background);color:var(--agtc-component-badge-brand-text)}
.agtc-badge.success{background:var(--agtc-component-badge-success-background);color:var(--agtc-component-badge-success-text)}
.agtc-badge.warning{background:var(--agtc-component-badge-warning-background);color:var(--agtc-component-badge-warning-text)}
.agtc-badge.danger{background:var(--agtc-component-badge-danger-background);color:var(--agtc-component-badge-danger-text)}
.agtc-badge.info{background:var(--agtc-component-badge-info-background);color:var(--agtc-component-badge-info-text)}
/* ── ADR HEADER — redesign scannable (sans doublon) ───────── */
.adr-header{margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid var(--agtc-semantic-color-border-default)}
.adr-header-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.adr-number{font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-action-primary);background:var(--agtc-semantic-color-background-subtle);padding:3px 10px;border-radius:var(--agtc-semantic-radius-pill);border:1px solid var(--agtc-semantic-color-border-default)}
.adr-type{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-on-inverse);background:var(--agtc-semantic-color-brand-secondary);padding:3px 8px;border-radius:var(--agtc-semantic-radius-control)}
.adr-page-title{font-size:var(--agtc-semantic-typography-heading-2-size);font-weight:var(--agtc-semantic-fontWeight-display);letter-spacing:var(--agtc-tracking-heading);margin:0 0 16px;line-height:1.15;color:var(--agtc-semantic-color-text-primary)}
.adr-meta{display:flex;flex-wrap:wrap;gap:0 32px;margin:0;padding:0}
.adr-meta-item{display:flex;gap:6px;align-items:baseline;padding:4px 0}
.adr-meta-item dt{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);color:var(--agtc-semantic-color-text-secondary);white-space:nowrap}
.adr-meta-item dd{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-primary);margin:0}

/* ── AGENTS ──────────────────────────────────────────────── */
.agent-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.agent-card{padding:var(--agtc-space-5)}
.agent-type{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.agent-name{font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.agent-desc{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.5}
.rules-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
.rule-can,.rule-cannot{padding:20px;border-radius:var(--agtc-semantic-radius-card);border:1px solid}
.rule-can{background:var(--agtc-semantic-color-feedback-success-subtle);border-color:var(--agtc-semantic-color-feedback-success-border)}
.rule-cannot{background:var(--agtc-semantic-color-feedback-danger-subtle);border-color:var(--agtc-semantic-color-feedback-danger-border)}
.rule-can h3{color:var(--agtc-semantic-color-feedback-success);margin-top:0;font-size:var(--agtc-semantic-typography-label-size)}
.rule-cannot h3{color:var(--agtc-semantic-color-feedback-danger);margin-top:0;font-size:var(--agtc-semantic-typography-label-size)}
.rule-can li{color:var(--agtc-semantic-color-feedback-success);font-size:var(--agtc-semantic-typography-label-size)}
.rule-cannot li{color:var(--agtc-semantic-color-feedback-danger);font-size:var(--agtc-semantic-typography-label-size)}

/* ── SIDEBAR DRAWER (mobile) ─────────────────────────────── */
.sidebar-toggle{display:none;align-items:center;gap:6px;background:var(--agtc-semantic-color-background-subtle);border:1px solid var(--agtc-semantic-color-border-default);cursor:pointer;padding:6px 12px;color:var(--agtc-semantic-color-text-secondary);border-radius:var(--agtc-semantic-radius-control);font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-typography-label-weight);font-family:inherit;margin-bottom:20px}
.sidebar-toggle-label{font-size:var(--agtc-semantic-typography-detail-size)}
.sidebar-toggle:hover,.sidebar-toggle:focus-visible{background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-primary);border-color:var(--agtc-semantic-color-border-focus);outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.sidebar-overlay{display:none;position:fixed;inset:0;top:var(--agtc-header-height,64px);background:var(--agtc-surface-overlay);z-index:89;backdrop-filter:blur(2px)}
.sidebar-overlay.active{display:block}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media(max-width:768px){
  .layout{flex-direction:column}
  .sidebar{
    position:fixed;top:var(--agtc-header-height,64px);left:0;bottom:0;z-index:90;
    width:280px;max-width:85vw;
    transform:translateX(-100%);
    transition:transform .28s cubic-bezier(.4,0,.2,1);
    border-right:1px solid var(--agtc-semantic-color-border-default);
    box-shadow:var(--agtc-semantic-shadow-raised);
    overflow-y:auto;
    height:calc(100vh - var(--agtc-header-height,64px));
  }
  .sidebar.open{transform:translateX(0)}
  .sidebar-toggle{display:flex}
  .content{padding:28px 20px}
  .home-section{padding:var(--agtc-space-7,48px) var(--agtc-space-4,16px)}
  .home-section-ink .illus-block{margin-left:-20px;margin-right:-20px;margin-top:64px;margin-bottom:0}
  .pipeline{flex-direction:column}
  .pipeline-step+.pipeline-step{border-left:none;border-top:1px solid var(--agtc-semantic-color-border-default)}
  .rules-split{grid-template-columns:1fr}
  .site-header{padding:0 12px;gap:8px}
  .logo-name{max-width:90px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
  .storybook-btn{display:none}
  .github-btn{display:none}
  .lang-switch{margin-left:auto !important}
  .menu-toggle{flex-shrink:0}
  .nav-grid{grid-template-columns:repeat(2,1fr)}
}

/* ── ACCESSIBILITY ───────────────────────────────────────── */
*:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
/* Liens de contenu : consomment le contrat du composant link (component.link.* — ADR-043). */
a{color:var(--agtc-component-link-default-text)}
a:hover{color:var(--agtc-component-link-default-text-hover)}
.skip-link{position:absolute;top:-40px;left:8px;background:var(--agtc-semantic-color-action-primary);color:var(--agtc-semantic-color-text-on-action);padding:8px 16px;border-radius:var(--agtc-semantic-radius-control);font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);text-decoration:none;z-index:1000}
.skip-link:focus{top:8px}

/* ── LANG TOGGLE (consomme .agtc-segmented — ADR-044, dogfooding cat. A) ──── */
/* Override compact pour le header (le composant n'a pas encore de taille sm). */
.lang-switch button{padding:3px 9px;font-size:var(--agtc-semantic-typography-detail-size);letter-spacing:var(--agtc-tracking-wide)}
html[data-lang="fr"] .lang-en{display:none}
html[data-lang="en"] .lang-fr{display:none}

/* ── MOBILE MENU ─────────────────────────────────────────── */
.menu-toggle{display:none;background:none;border:none;cursor:pointer;padding:4px;color:var(--agtc-semantic-color-text-primary);border-radius:var(--agtc-semantic-radius-control)}
.menu-toggle:hover,.menu-toggle:focus-visible{background:var(--agtc-semantic-color-background-subtle);outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}

/* ── TOC ─────────────────────────────────────────────────── */
.toc{width:var(--agtc-site-toc-width);flex-shrink:0;padding:20px 16px;position:sticky;top:var(--agtc-header-height,64px);height:calc(100vh - var(--agtc-header-height,64px));overflow-y:auto;border-left:1px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-surface)}
.toc:empty{display:none;width:0;padding:0;border:none}
.toc-title{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-overline);color:var(--agtc-semantic-color-text-secondary);margin-bottom:10px;display:block}
.toc a{display:block;font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);text-decoration:none;padding:4px 0 4px 10px;border-left:2px solid transparent;margin-left:-2px;line-height:1.4;transition:color .1s,border-color .1s}
.toc a:hover,.toc a.active,.toc a:focus-visible{color:var(--agtc-semantic-color-action-primary);border-left-color:var(--agtc-semantic-color-action-primary);outline:none}
.toc a:active{color:var(--agtc-semantic-color-action-primary);border-left-color:var(--agtc-semantic-color-action-primary)}
.toc a:focus-visible{box-shadow:0 0 0 2px var(--agtc-semantic-color-border-focus)}

/* ── DO / DON'T ──────────────────────────────────────────── */
.dos-donts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.do-section,.dont-section{padding:20px;border-radius:var(--agtc-semantic-radius-card);border:1px solid}
.do-section{background:var(--agtc-semantic-color-feedback-success-subtle);border-color:var(--agtc-semantic-color-feedback-success-border)}
.dont-section{background:var(--agtc-semantic-color-feedback-danger-subtle);border-color:var(--agtc-semantic-color-feedback-danger-border)}
.do-section h3{color:var(--agtc-semantic-color-feedback-success);margin-top:0;font-size:var(--agtc-semantic-typography-label-size)}
.dont-section h3{color:var(--agtc-semantic-color-feedback-danger);margin-top:0;font-size:var(--agtc-semantic-typography-label-size)}
.do-section li{color:var(--agtc-semantic-color-feedback-success);font-size:var(--agtc-semantic-typography-label-size)}
.dont-section li{color:var(--agtc-semantic-color-feedback-danger);font-size:var(--agtc-semantic-typography-label-size)}

/* ── TOKEN TILES ─────────────────────────────────────────── */
.token-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
.token-tile{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:24px;text-align:center}
.token-tile-count{font-size:var(--agtc-semantic-typography-heading-1-size);font-weight:var(--agtc-semantic-fontWeight-display);color:var(--agtc-semantic-color-action-primary);letter-spacing:var(--agtc-tracking-snug);display:block}
.token-tile-label{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary);margin-top:6px;display:block}

/* ── FOOTER ──────────────────────────────────────────────── */
.site-footer{background:var(--agtc-semantic-color-background-inverse);color:var(--agtc-semantic-color-text-on-inverse-muted);padding:40px 32px;font-size:var(--agtc-semantic-typography-label-size);margin-top:auto}
.footer-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;align-items:start}
.footer-col{display:flex;flex-direction:column;gap:10px}
.footer-col-right{align-items:flex-start;text-align:left}
.footer-logo{display:inline-flex;align-items:center;gap:8px;text-decoration:none;margin-bottom:4px}
.footer-logo-name{font-size:var(--agtc-semantic-typography-body-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-on-inverse)}
.footer-name{font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-on-inverse-secondary)}
.footer-copy{color:var(--agtc-semantic-color-text-on-inverse-muted);font-size:var(--agtc-semantic-typography-detail-size)}
.footer-links{display:flex;flex-direction:column;gap:8px}
.footer-links a,.footer-link{color:var(--agtc-semantic-color-text-on-inverse-secondary);text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:color .12s;font-size:var(--agtc-semantic-typography-detail-size)}
.footer-links a:hover,.footer-link:hover{color:var(--agtc-semantic-color-text-on-inverse)}
.footer-links a:active,.footer-link:active{color:var(--agtc-semantic-color-text-on-inverse)}
.footer-links a:focus-visible,.footer-link:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.footer-credit{font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-on-inverse-muted);display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}

/* ── INFO CARDS ──────────────────────────────────────────── */
.info-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.info-card-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:8px}

/* ── AUDIT PAGE ──────────────────────────────────────────── */
.audit-hero{text-align:center;padding:48px 0 32px;border-bottom:1px solid var(--agtc-semantic-color-border-default);margin-bottom:40px}
.audit-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:var(--agtc-semantic-radius-pill);font-weight:var(--agtc-semantic-fontWeight-bold);font-size:var(--agtc-semantic-typography-body-size);margin-bottom:16px}
.audit-badge.pass{background:var(--agtc-semantic-color-feedback-success-subtle);color:var(--agtc-semantic-color-feedback-success)}
.audit-badge.fail{background:var(--agtc-semantic-color-feedback-danger-subtle);color:var(--agtc-semantic-color-feedback-danger)}
.audit-meta{color:var(--agtc-semantic-color-text-secondary);font-size:var(--agtc-semantic-typography-label-size);margin-bottom:6px}
.audit-date{color:var(--agtc-semantic-color-text-secondary);font-size:var(--agtc-semantic-typography-detail-size)}
.audit-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:48px}
.audit-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);box-shadow:var(--agtc-semantic-shadow-card);padding:var(--agtc-space-6);text-align:center}
.audit-card--pass{border-color:var(--agtc-semantic-color-feedback-success-border)}
.audit-card--warn{border-color:var(--agtc-semantic-color-feedback-warning-border)}
.audit-card--fail{border-color:var(--agtc-semantic-color-feedback-danger-border)}
.audit-number{display:block;font-size:var(--agtc-semantic-typography-heading-2-size);font-weight:var(--agtc-semantic-fontWeight-display);letter-spacing:var(--agtc-tracking-tighter);line-height:1;margin-bottom:6px}
.audit-card--pass .audit-number{color:var(--agtc-semantic-color-feedback-success)}
.audit-card--warn .audit-number{color:var(--agtc-semantic-color-feedback-warning)}
.audit-card--fail .audit-number{color:var(--agtc-semantic-color-feedback-danger)}
.audit-section{margin-bottom:48px}
.audit-section h2{font-size:var(--agtc-semantic-typography-heading-5-size);font-weight:var(--agtc-semantic-fontWeight-bold);margin:0 0 16px;padding-bottom:8px;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
.audit-contrast-table{width:100%;border-collapse:collapse;font-size:var(--agtc-semantic-typography-label-size)}
.audit-contrast-table th{text-align:left;padding:8px 10px;background:var(--agtc-semantic-color-background-subtle);border-bottom:2px solid var(--agtc-semantic-color-border-default);font-weight:var(--agtc-semantic-typography-label-weight);font-size:var(--agtc-semantic-typography-detail-size);text-transform:uppercase;letter-spacing:var(--agtc-tracking-wide)}
.audit-contrast-table td{padding:8px 10px;border-bottom:1px solid var(--agtc-semantic-color-border-default);vertical-align:middle}
.audit-contrast-table tr:last-child td{border-bottom:none}
.audit-contrast-pass{color:var(--agtc-semantic-color-feedback-success);font-weight:var(--agtc-semantic-typography-label-weight)}
.audit-contrast-fail{color:var(--agtc-semantic-color-feedback-danger);font-weight:var(--agtc-semantic-typography-label-weight)}
.audit-swatch{width:14px;height:14px;border-radius:3px;display:inline-block;vertical-align:middle;border:1px solid var(--agtc-semantic-color-border-swatch);margin-right:4px}
.audit-manual-list{list-style:none;padding:0;margin:0}
.audit-manual-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
.audit-manual-item:last-child{border-bottom:none}
.audit-manual-crit{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-secondary);font-family:var(--agtc-semantic-typography-mono-family,monospace);flex-shrink:0;width:52px;padding-top:1px}
.audit-manual-body strong{display:block;font-size:var(--agtc-semantic-typography-label-size);margin-bottom:3px}
.audit-manual-body span{font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)}
.audit-method{background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-card);padding:20px 24px;font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.6}
.audit-footer-link{color:var(--agtc-semantic-color-text-on-inverse-muted);text-decoration:none;font-size:var(--agtc-semantic-typography-detail-size);display:inline-flex;align-items:center;gap:4px;transition:color .12s}
.audit-footer-link:hover,.audit-footer-link:active{color:var(--agtc-semantic-color-text-on-inverse-secondary)}
@media(max-width:640px){.audit-cards{grid-template-columns:1fr 1fr}}
.info-card-title{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-brand-secondary-text);margin-bottom:4px}
.info-card-body{font-size:var(--agtc-component-card-typography-body-size);color:var(--agtc-semantic-color-text-secondary)}
/* ── INFOBOX (callout informationnel de doc — consomme feedback.info-*) ───── */
.infobox{display:flex;gap:12px;align-items:flex-start;padding:16px 20px;margin:24px 0;border-radius:var(--agtc-semantic-radius-card);background:var(--agtc-semantic-color-feedback-info-subtle);border:1px solid var(--agtc-semantic-color-feedback-info-border)}
.infobox-icon{color:var(--agtc-semantic-color-feedback-info);flex-shrink:0;line-height:0;margin-top:1px}
.infobox-body{font-size:var(--agtc-semantic-typography-label-size);line-height:1.6;color:var(--agtc-semantic-color-text-primary)}
.infobox-body a{color:var(--agtc-semantic-color-text-primary);text-decoration:underline;font-weight:var(--agtc-semantic-typography-label-weight)}

/* ── TOOL CARDS ──────────────────────────────────────────── */
.tool-card{background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:16px;display:flex;gap:12px;align-items:flex-start}
.tool-card-icon{color:var(--agtc-semantic-color-action-primary);flex-shrink:0;margin-top:0}
.tool-card-name{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-text-primary)}
.tool-card-role{color:var(--agtc-semantic-color-text-secondary);font-weight:var(--agtc-semantic-typography-body-weight)}
.tool-card-desc{font-size:var(--agtc-component-card-typography-title-size);color:var(--agtc-semantic-color-text-secondary);margin-top:4px}

/* ── STANDARDS BAND ──────────────────────────────────────── */
.standards-band{display:flex;gap:20px;align-items:center;background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:24px}
.standards-logo{flex-shrink:0;display:flex;color:var(--agtc-semantic-color-text-primary);text-decoration:none}
.standards-logo svg{display:block;height:56px;width:56px}
.standards-title{font-size:var(--agtc-semantic-typography-body-size);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:4px}
.standards-band p{margin:0;font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary)}
@media (max-width:560px){.standards-band{flex-direction:column;align-items:flex-start}}

/* ── VENDOR LOGOS (frameworks / plateformes / outils) ────── */
.vendor-logo{height:20px;width:20px;flex-shrink:0;display:inline-block;vertical-align:middle;object-fit:contain}
.platform-cell{display:flex;align-items:center;gap:8px}
.platform-logos-grid{display:flex;flex-wrap:wrap;gap:24px;margin:28px 0;align-items:center;justify-content:center}
.platform-logo-item{display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.85;transition:opacity .15s}
.platform-logo-item:hover{opacity:1}
.platform-logo-item img{width:40px;height:40px;object-fit:contain;filter:drop-shadow(var(--agtc-drop-shadow-sm))}
.platform-logo-label{font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-on-inverse-muted);text-align:center;white-space:nowrap}
.tool-card-icon :is(svg,img){width:var(--agtc-semantic-icon-size-nav);height:var(--agtc-semantic-icon-size-nav)}

/* ── STEP CARDS ──────────────────────────────────────────── */
.step-card{background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:16px}
.step-card-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.step-card-title{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-text-primary);margin-bottom:4px}
.step-card-body{font-size:var(--agtc-component-card-typography-meta-size);color:var(--agtc-semantic-color-text-secondary)}

/* ── DENSITY CARDS ───────────────────────────────────────── */
.density-grid{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px}
.density-card{flex:1;min-width:140px;padding:16px;background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-default)}
.density-card.active{border-width:2px;border-color:var(--agtc-semantic-color-action-primary)}
.density-card-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.density-card-label.active{color:var(--agtc-semantic-color-action-primary)}
.density-card-desc{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.density-card-formula{display:flex;gap:6px;align-items:center}
.density-card-bar{height:24px;background:var(--agtc-semantic-color-action-primary);border-radius:2px}
.density-card-math{font-size:var(--agtc-semantic-typography-detail-size);font-family:var(--agtc-font-mono);color:var(--agtc-semantic-color-text-secondary)}

/* ── LINEHEIGHT DEMO CARDS ───────────────────────────────── */
.lh-demo-grid{display:flex;gap:24px;flex-wrap:wrap}
.lh-demo-card{flex:1;min-width:160px;padding:16px;background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-default)}
.lh-demo-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);color:var(--agtc-semantic-color-text-secondary);margin-bottom:8px}

/* ── GENERIC GRIDS ───────────────────────────────────────── */
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
.grid-auto-220{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:24px}

/* ── BANNER responsive (le contribution-banner consomme .agtc-banner — ADR-042) ── */
@media(max-width:768px){.agtc-banner{flex-wrap:wrap}}

/* ── AUDIENCE CARDS ──────────────────────────────────────── */
.audience-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:28px 0}
.audience-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.audience-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:10px}
.audience-label{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-loose);color:var(--agtc-semantic-color-text-secondary);margin-bottom:4px}
.audience-title{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.audience-desc{font-size:var(--agtc-component-card-typography-body-size);color:var(--agtc-semantic-color-text-secondary);line-height:1.55}

/* ── KPI BAND ────────────────────────────────────────────── */
.kpi-band{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:28px 0}
.kpi-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:var(--agtc-component-card-default-padding)}
.kpi-num{font-size:var(--agtc-semantic-typography-heading-2-size);font-weight:var(--agtc-semantic-fontWeight-display);color:var(--agtc-semantic-color-action-primary);letter-spacing:var(--agtc-tracking-snug);display:block;margin-bottom:4px}
.kpi-label{font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-primary);font-weight:var(--agtc-semantic-typography-label-weight);margin-bottom:6px;display:block}
.kpi-source{font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)}
.kpi-source a{color:var(--agtc-semantic-color-action-primary);font-size:var(--agtc-semantic-typography-detail-size)}

/* ── TECH STACK PIPELINE ─────────────────────────────────── */
.stack-flow{display:flex;align-items:stretch;gap:0;margin:28px 0;overflow-x:auto;border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);overflow:hidden}
.stack-node{flex:1;min-width:100px;padding:16px 12px;background:var(--agtc-semantic-color-background-surface);text-align:center;border-right:1px solid var(--agtc-semantic-color-border-default);position:relative}
.stack-node:last-child{border-right:none;background:var(--agtc-semantic-color-background-subtle)}
.stack-node-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:8px;display:flex;justify-content:center}
.stack-node-icon :is(svg,img){width:var(--agtc-semantic-icon-size-control);height:var(--agtc-semantic-icon-size-control)}
.stack-node-title{font-size:var(--agtc-component-card-typography-title-size);font-weight:var(--agtc-component-card-typography-title-weight);color:var(--agtc-semantic-color-text-primary)}
.stack-node-sub{font-size:var(--agtc-component-card-typography-title-size);color:var(--agtc-semantic-color-text-secondary);margin-top:4px}

/* ── RESPONSIVE (additions) ──────────────────────────────── */
@media(max-width:1200px){.toc{display:none}}
/* ── CHANGELOG TIMELINE ──────────────────────────────────── */
.changelog-timeline{position:relative;padding-left:0}
.changelog-item{position:relative;margin-bottom:36px;display:grid;grid-template-columns:110px 1fr;gap:28px;align-items:start}
.changelog-item-date{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-typography-label-weight);color:var(--agtc-semantic-color-text-secondary);padding-top:20px;text-align:right;white-space:nowrap}
.changelog-item-content{position:relative}
.changelog-item-content::before{content:'';position:absolute;left:-19px;top:20px;width:10px;height:10px;border-radius:50%;background:var(--agtc-semantic-color-border-strong);border:2px solid var(--agtc-semantic-color-background-surface)}
.changelog-item.latest .changelog-item-content::before{background:var(--agtc-semantic-color-action-primary);border-color:var(--agtc-semantic-color-background-surface)}
.changelog-timeline-track{position:absolute;left:124px;top:8px;bottom:8px;width:2px;background:var(--agtc-semantic-color-border-default)}
.changelog-accordion{border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);overflow:hidden}
.changelog-summary{display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;list-style:none;background:var(--agtc-semantic-color-background-surface);user-select:none}
.changelog-summary::-webkit-details-marker{display:none}
.changelog-summary:hover{background:var(--agtc-semantic-color-background-subtle)}
.changelog-chevron{margin-left:auto;color:var(--agtc-semantic-color-text-secondary);transition:transform .2s}
details[open] .changelog-chevron{transform:rotate(180deg)}
.changelog-version{font-size:var(--agtc-semantic-typography-body-size);font-weight:var(--agtc-semantic-fontWeight-display);color:var(--agtc-semantic-color-text-primary);letter-spacing:var(--agtc-tracking-snug)}
.changelog-item.latest .changelog-version{color:var(--agtc-semantic-color-action-primary)}
.changelog-badge{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);padding:2px 8px;border-radius:var(--agtc-semantic-radius-pill);background:var(--agtc-semantic-color-feedback-warning-subtle,#ffefd6);color:var(--agtc-semantic-color-feedback-warning-text,#582d1d)}
.changelog-body{padding:0 20px 20px;border-top:1px solid var(--agtc-semantic-color-border-default)}
.changelog-body h2{font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);margin:16px 0 6px;color:var(--agtc-semantic-color-text-secondary);text-transform:uppercase;letter-spacing:var(--agtc-tracking-wider)}
.changelog-body ul{margin:0 0 10px;padding-left:18px}
.changelog-body li{font-size:var(--agtc-semantic-typography-label-size);margin-bottom:4px;color:var(--agtc-semantic-color-text-primary)}
@media(max-width:768px){.changelog-item{grid-template-columns:1fr}.changelog-item-date{padding-top:0;text-align:left}.changelog-timeline-track{display:none}.changelog-item-content::before{display:none}}
.back-to-top{position:fixed;bottom:24px;right:24px;z-index:200;display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-secondary);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-control);font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);cursor:pointer;box-shadow:var(--agtc-semantic-shadow-raised);transition:opacity .2s,transform .2s;opacity:0;transform:translateY(8px);pointer-events:none}
.back-to-top:not([hidden]){opacity:1;transform:translateY(0);pointer-events:auto}
.back-to-top:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary);border-color:var(--agtc-semantic-color-border-focus)}
.back-to-top:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
@media(max-width:768px){.back-to-top{bottom:16px;right:16px;padding:8px 12px}}
@media(max-width:768px){
  .menu-toggle{display:flex;align-items:center}
  .dos-donts{grid-template-columns:1fr}
  .token-tiles{grid-template-columns:1fr}
  .agent-grid{grid-template-columns:1fr}
  .stack-flow{flex-direction:column}
  .stack-node{border-right:none;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
  .footer-inner{grid-template-columns:1fr;gap:20px}
  .footer-col-right{align-items:flex-start;text-align:left}
}

/* ── MARKETING CONTEXT (data-context="marketing") — ADR-057 ─── */
/* Activated on pages that convice/onboard: home, get-started, agents.
   All values reference semantic.marketing.* tokens — no hard-coded values. */
[data-context="marketing"] .hero-eyebrow{
  font-size:var(--agtc-semantic-marketing-typography-eyebrow-size);
  font-weight:var(--agtc-semantic-marketing-typography-eyebrow-weight);
  letter-spacing:var(--agtc-tracking-eyebrow);text-transform:uppercase;
  color:var(--agtc-semantic-color-action-primary);
}
[data-context="marketing"] .hero-title{
  font-size:clamp(2.625rem,6.5vw,var(--agtc-semantic-marketing-typography-display-size));
  font-weight:var(--agtc-semantic-marketing-typography-display-weight);
  line-height:var(--agtc-semantic-marketing-typography-display-line-height);
}
[data-context="marketing"] .marketing-section{
  padding-top:var(--agtc-semantic-marketing-space-section-breathing);
  padding-bottom:var(--agtc-semantic-marketing-space-section-breathing);
}
[data-context="marketing"] .marketing-hero{
  padding-top:var(--agtc-semantic-marketing-space-hero-gap);
  padding-bottom:var(--agtc-semantic-marketing-space-hero-gap);
}
[data-context="marketing"] .home-section h2{
  font-size:var(--agtc-semantic-typography-heading-1-size);
  line-height:var(--agtc-semantic-typography-heading-1-line-height);
  letter-spacing:var(--agtc-tracking-tighter);
}
[data-context="marketing"] .home-section > p{
  font-size:var(--agtc-semantic-typography-body-size);
  line-height:var(--agtc-line-height-text,1.6);
}
/* ── CARD TYPOGRAPHY — surcharges contexte Marketing (ADR-057) ── */
/* Titres de cards génériques → body-size (16px) minimum */
[data-context="marketing"] .nav-card-title,
[data-context="marketing"] .info-card-title,
[data-context="marketing"] .principle-title,
[data-context="marketing"] .step-card-title{
  font-size:var(--agtc-component-card-typography-marketing-title-size);
  font-weight:var(--agtc-component-card-typography-marketing-title-weight);
}
/* Titre de carte prominente (audience/persona) → heading-5 (20px) */
[data-context="marketing"] .audience-title{
  font-size:var(--agtc-component-card-typography-marketing-hero-title-size);
  font-weight:var(--agtc-component-card-typography-marketing-hero-title-weight);
}
/* Corps de cards → body-size (16px) en marketing */
[data-context="marketing"] .nav-card-desc,
[data-context="marketing"] .info-card-body,
[data-context="marketing"] .principle-desc,
[data-context="marketing"] .audience-desc{
  font-size:var(--agtc-component-card-typography-marketing-body-size);
}
/* Méta/rôle → label-size (14px) en marketing (step-card-body, tool-card-role/desc) */
[data-context="marketing"] .step-card-body,
[data-context="marketing"] .tool-card-role,
[data-context="marketing"] .tool-card-desc{
  font-size:var(--agtc-component-card-typography-marketing-meta-size);
}
/* Espacement comfortable (28px) en contexte marketing pour tous les conteneurs card-like */
[data-context="marketing"] .principle-card,
[data-context="marketing"] .step-card,
[data-context="marketing"] .nav-card,
[data-context="marketing"] .info-card,
[data-context="marketing"] .tool-card,
[data-context="marketing"] .audience-card,
[data-context="marketing"] .kpi-card{
  padding:var(--agtc-semantic-space-comfortable-layout-component);
}
/* Icônes de card — 32px en contexte Marketing (semantic.icon.size.feature) */
/* tool-card-icon exclus : cartes compactes horizontales → icon-size-nav (24px) dans tous contextes */
[data-context="marketing"] .audience-icon svg,
[data-context="marketing"] .info-card-icon svg,
[data-context="marketing"] .nav-card-icon svg{
  width:var(--agtc-semantic-icon-size-feature);
  height:var(--agtc-semantic-icon-size-feature);
}

/* ── SECTION-SECONDARY en contexte Marketing — uniformisation des niveaux ── */
/* heading-1-size pour tous les h2, même espacement que home-section */
[data-context="marketing"] .section-secondary h2{
  font-size:var(--agtc-semantic-typography-heading-1-size);
  line-height:var(--agtc-semantic-typography-heading-1-line-height);
  letter-spacing:var(--agtc-tracking-tighter);
}
[data-context="marketing"] .section-secondary{
  padding-top:var(--agtc-semantic-marketing-space-section-breathing,96px);
  padding-bottom:var(--agtc-semantic-marketing-space-section-breathing,96px);
}
[data-context="marketing"] .home-section{
  padding-top:var(--agtc-semantic-marketing-space-section-breathing,96px);
  padding-bottom:var(--agtc-semantic-marketing-space-section-breathing,96px);
}
/* ── SCROLL PADDING — compense header fixe (ADR-057) ─────── */
html { scroll-padding-top:calc(var(--agtc-header-height,64px) + 12px); }

/* ── THEME TOGGLE ────────────────────────────────────────── */
.theme-toggle{
  display:flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:var(--agtc-semantic-radius-pill);
  background:transparent;border:1px solid var(--agtc-semantic-color-border-default);
  color:var(--agtc-semantic-color-text-secondary);cursor:pointer;
  transition:background .15s,color .15s;flex-shrink:0;
}
.theme-toggle:hover{background:var(--agtc-semantic-color-background-hover);color:var(--agtc-semantic-color-text-primary)}
.theme-toggle:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
/* Sun icon in light mode, moon in dark */
:root[data-theme="light"] .theme-toggle .icon-moon{display:none}
:root[data-theme="dark"]  .theme-toggle .icon-sun{display:none}

/* ── HERO — aurora background ────────────────────────────── */
.hero{
  position:relative;overflow:hidden;
  padding-top:calc(var(--agtc-header-height,64px) + var(--agtc-space-6,32px));
  padding-bottom:var(--agtc-space-7,48px);
  background:var(--agtc-semantic-color-background-inverse);
  color:var(--agtc-semantic-color-text-on-inverse);
  isolation:isolate;
}
.hero::before{
  content:"";position:absolute;inset:0;z-index:0;
  background:var(--agtc-gradient-aurora);
  animation:auroraDrift 18s ease-in-out infinite;
  pointer-events:none;
}
.hero::after{
  content:"";position:absolute;inset:0;z-index:0;
  background-image:linear-gradient(var(--agtc-surface-grid) 1px,transparent 1px),
    linear-gradient(90deg,var(--agtc-surface-grid) 1px,transparent 1px);
  background-size:48px 48px;opacity:.5;pointer-events:none;
}
.hero-inner{position:relative;z-index:1;max-width:var(--agtc-content-max,1180px);margin:0 auto;padding:0 var(--agtc-space-6,32px)}
.hero-badge{
  display:inline-flex;align-items:center;gap:var(--agtc-space-2,8px);
  padding:var(--agtc-space-1,4px) var(--agtc-space-3,12px);
  border:1px solid var(--agtc-surface-glass-border);
  border-radius:var(--agtc-semantic-radius-pill);
  font-size:var(--agtc-font-size-label,.875rem);
  color:var(--agtc-semantic-color-text-on-inverse-muted);
  background:var(--agtc-surface-glass);
  margin-bottom:var(--agtc-space-5,24px);
}
.hero-badge .pulse{
  width:8px;height:8px;border-radius:50%;
  background:var(--agtc-semantic-color-accent);
  animation:pulse 2s ease-in-out infinite;
}
.hero-eyebrow{
  font-size:var(--agtc-font-size-label,.875rem);font-weight:var(--agtc-semantic-typography-label-weight);
  letter-spacing:var(--agtc-tracking-eyebrow);text-transform:uppercase;
  color:var(--agtc-semantic-color-action-primary);
  margin-bottom:var(--agtc-space-3,12px);
}
.hero-title{
  font-size:var(--agtc-font-size-display,clamp(2.5rem,5vw,3.5rem));
  font-weight:var(--agtc-semantic-fontWeight-display);letter-spacing:var(--agtc-tracking-tighter);
  line-height:var(--agtc-line-height-heading,1.05);
  color:var(--agtc-semantic-color-text-on-inverse);
  margin:0 0 var(--agtc-space-5,24px);
}
.hero-title .grad{
  background:var(--agtc-gradient-text);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-title .verb{color:var(--agtc-semantic-color-action-primary);font-style:normal}
.hero-formula{font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-on-inverse-muted);opacity:.85;margin-bottom:var(--agtc-space-3);letter-spacing:.01em}
.hero-tagline{
  font-size:var(--agtc-font-size-h5,1.25rem);
  color:var(--agtc-semantic-color-text-on-inverse-muted);
  line-height:var(--agtc-line-height-text,1.6);
  max-width:580px;margin-bottom:var(--agtc-space-7,48px);
}
.hero-actions{display:flex;gap:var(--agtc-space-3,12px);flex-wrap:wrap;align-items:center}
.hero-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:var(--agtc-space-8,64px);
  align-items:center;
}
@media(max-width:860px){.hero-grid{grid-template-columns:1fr}}

/* ── LAYER STACK — 3D isometric token layers ─────────────── */
.layer-stack{
  perspective:1400px;position:relative;
  height:420px;display:block;
}
.layer-plane{
  position:absolute;left:50%;top:50%;width:330px;
  background:var(--agtc-surface-glass-hover);
  border:1px solid var(--agtc-surface-glass-border);
  border-radius:var(--agtc-semantic-radius-md,8px);
  padding:var(--agtc-space-4,16px) var(--agtc-space-5,24px);
  /* rgba(0,0,0,.6) : ombre décorative 3D sur fond sombre — pas de token équivalent */
  box-shadow:0 30px 60px -20px rgba(0,0,0,.6);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.layer-plane.l1{transform:translate(-50%,-50%) translate(-86px,96px) rotateX(52deg) rotateZ(-32deg)}
.layer-plane.l2{transform:translate(-50%,-50%) rotateX(52deg) rotateZ(-32deg)}
.layer-plane.l3{transform:translate(-50%,-50%) translate(86px,-96px) rotateX(52deg) rotateZ(-32deg);border-color:var(--agtc-surface-accent-border)}
.pl-tag{font-size:var(--agtc-font-size-detail,.75rem);font-weight:var(--agtc-semantic-typography-label-weight);letter-spacing:var(--agtc-tracking-overline);text-transform:uppercase;color:var(--agtc-semantic-color-text-on-inverse-muted);margin-bottom:var(--agtc-space-1,4px)}
.pl-title{font-size:var(--agtc-font-size-label,.875rem);font-weight:var(--agtc-semantic-typography-label-weight);color:var(--agtc-semantic-color-text-on-inverse);margin-bottom:var(--agtc-space-1,4px)}
.pl-code{font-size:var(--agtc-font-size-detail,.75rem);font-family:var(--agtc-font-mono,monospace);color:var(--agtc-semantic-color-text-on-inverse-muted)}

/* ── ANIMATIONS ───────────────────────────────────────────── */
@keyframes auroraDrift{
  0%,100%{transform:translate(0,0) scale(1)}
  50%{transform:translate(-3%,2%) scale(1.04)}
}
@keyframes planeFloat{
  0%,100%{transform:perspective(600px) rotateX(12deg) rotateY(-8deg) translateZ(0)}
  50%{transform:perspective(600px) rotateX(8deg) rotateY(-5deg) translateZ(12px)}
}
@keyframes pulse{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:.6;transform:scale(.85)}
}

/* ── REDUCED MOTION ───────────────────────────────────────── */
@media(prefers-reduced-motion:reduce){
  .hero::before,.layer-plane,.hero-badge .pulse{animation:none!important}
}

/* ── HERO — responsive ───────────────────────────────────── */
@media(max-width:768px){
  .hero{padding-top:calc(var(--agtc-header-height,64px) + var(--agtc-space-7,48px));padding-bottom:var(--agtc-space-7,48px)}
  .layer-stack{display:none}
}

/* ══ REDESIGN PHASE 1 — classes issues de Redesign/site.css ══════════════════
   Ajout pur (aucune suppression). Toutes les valeurs passent par les tokens.
   Animations floatUp/particules non incluses (cf. handoff 2026-06-15).        */

/* Base */
html{scroll-behavior:smooth}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{overflow-x:hidden}

/* ── Header tools ────────────────────────────────────────── */
.header-tools{display:flex;align-items:center;gap:var(--agtc-space-2);flex-shrink:0}
.lang-toggle-group{display:flex;gap:2px}
.lang-btn{
  font-family:inherit;cursor:pointer;
  border-radius:var(--agtc-semantic-radius-control);
  border:1.5px solid var(--agtc-semantic-color-border-strong);
  background:transparent;color:var(--agtc-semantic-color-text-secondary);
  transition:background .14s,color .14s,border-color .14s;
  padding:5px 10px;font-size:var(--agtc-font-size-detail);font-weight:var(--agtc-semantic-fontWeight-bold);
  letter-spacing:var(--agtc-tracking-wide);min-width:38px;min-height:34px;
}
.lang-btn.active{background:var(--agtc-semantic-color-action-primary);color:var(--agtc-semantic-color-text-on-action);border-color:var(--agtc-semantic-color-action-primary)}
.lang-btn:hover:not(.active){background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.lang-btn:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.theme-btn{
  font-family:inherit;cursor:pointer;
  border-radius:var(--agtc-semantic-radius-control);
  border:1.5px solid var(--agtc-semantic-color-border-strong);
  background:transparent;color:var(--agtc-semantic-color-text-secondary);
  transition:background .14s,color .14s,border-color .14s;
  width:38px;height:34px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
}
.theme-btn:hover{color:var(--agtc-semantic-color-text-primary);border-color:var(--agtc-semantic-color-text-secondary)}
.theme-btn:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.theme-btn .icon-sun{display:none}
:root[data-theme="dark"] .theme-btn .icon-sun{display:block}
:root[data-theme="dark"] .theme-btn .icon-moon{display:none}


/* ── Marketing buttons (.ds-btn) ────────────────────────── */
.ds-btn{
  display:inline-flex;align-items:center;gap:var(--agtc-space-2);
  padding:11px var(--agtc-space-5);border-radius:var(--agtc-semantic-radius-control);
  font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);
  font-family:inherit;cursor:pointer;text-decoration:none;
  border:1.5px solid transparent;line-height:1.3;min-height:44px;
  transition:transform .12s,background .14s,color .14s,border-color .14s;
}
.ds-btn:active{transform:translateY(1px)}
.ds-btn:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.ds-btn.primary{background:var(--agtc-component-button-primary-background);color:var(--agtc-component-button-primary-text);border-color:var(--agtc-component-button-primary-background)}
.ds-btn.primary:hover{background:var(--agtc-component-button-primary-background-hover);border-color:var(--agtc-component-button-primary-background-hover)}
.ds-btn.secondary{background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-primary);border-color:var(--agtc-semantic-color-border-strong)}
.ds-btn.secondary:hover{background:var(--agtc-semantic-color-background-subtle)}
.ds-btn.ghost{background:transparent;color:var(--agtc-component-button-ghost-text)}
.ds-btn.ghost:hover{background:var(--agtc-component-button-ghost-background-hover)}
/* Variantes on-dark — contexte hero sombre (token surface-glass documenté) */
.ds-btn.on-dark.primary{color:var(--agtc-semantic-color-text-on-inverse)}
.ds-btn.on-dark.secondary{background:var(--agtc-surface-glass);border-color:var(--agtc-surface-glass-strong);color:var(--agtc-semantic-color-text-on-inverse)}
.ds-btn.on-dark.secondary:hover{background:var(--agtc-surface-glass-hover)}
.ds-btn.on-dark.ghost{color:var(--agtc-surface-glass-ghost-text)}
.ds-btn.on-dark.ghost:hover{background:var(--agtc-surface-glass)}

/* ── Card utilities ──────────────────────────────────────── */
.card-surface{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);box-shadow:var(--agtc-semantic-shadow-card);position:relative;overflow:hidden;transition:border-color .18s}
.card-surface::after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:var(--agtc-semantic-color-action-primary);transform:scaleX(0);transform-origin:left;transition:transform .25s}
.card-surface:hover::after{transform:scaleX(1)}

/* ── Section inverse (sections sombres marketing) ────────── */
.section-inverse{background:var(--agtc-semantic-color-background-inverse);color:var(--agtc-semantic-color-text-on-inverse);padding:var(--agtc-space-9) var(--agtc-space-5);position:relative;overflow:hidden}
.section-inverse .si-inner{max-width:var(--agtc-content-max);margin:0 auto;position:relative}
.section-inverse h2{color:var(--agtc-semantic-color-text-on-inverse)}
.section-inverse .si-inner > p{color:var(--agtc-semantic-color-text-on-inverse-muted)}

/* ── Eyebrow label ───────────────────────────────────────── */
.eyebrow{display:inline-block;font-size:var(--agtc-font-size-detail);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-eyebrow);color:var(--agtc-semantic-color-action-primary);margin-bottom:var(--agtc-space-3)}

/* ── Audience section ────────────────────────────────────── */
.audience-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:var(--agtc-space-4);margin:var(--agtc-space-6) 0}
.audience-card{padding:var(--agtc-space-6)}
.audience-icon{width:46px;height:46px;border-radius:var(--agtc-semantic-radius-card);display:flex;align-items:center;justify-content:center;color:var(--agtc-semantic-color-action-primary);background:var(--agtc-semantic-color-background-subtle);margin-bottom:var(--agtc-space-4)}
.audience-title{font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:var(--agtc-space-2)}
.audience-desc{font-size:var(--agtc-font-size-label);color:var(--agtc-semantic-color-text-secondary);line-height:1.6}

/* ── KPI cards ───────────────────────────────────────────── */
.kpi-band{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:var(--agtc-space-4);margin:var(--agtc-space-6) 0}
.kpi-card{padding:var(--agtc-space-6)}
.kpi-num{font-size:var(--agtc-font-size-display);font-weight:var(--agtc-semantic-fontWeight-bold);letter-spacing:var(--agtc-tracking-tighter);display:block;margin-bottom:var(--agtc-space-1);color:var(--agtc-semantic-color-brand-accent);white-space:nowrap}
.kpi-label{font-size:var(--agtc-font-size-body);color:var(--agtc-semantic-color-brand-secondary-text);font-weight:var(--agtc-semantic-fontWeight-bold);margin-bottom:var(--agtc-space-2);display:block}
.kpi-source{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary);line-height:1.5}
.kpi-source a{color:var(--agtc-semantic-color-action-primary)}

/* ── Principle card ──────────────────────────────────────── */
.principle-icon{width:48px;height:48px;border-radius:var(--agtc-semantic-radius-card);display:flex;align-items:center;justify-content:center;color:var(--agtc-semantic-color-text-on-action);background:var(--agtc-semantic-color-action-primary);margin-bottom:var(--agtc-space-4);box-shadow:var(--agtc-shadow-md)}

/* ── Mini cards ──────────────────────────────────────────── */
.mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--agtc-space-4);margin:var(--agtc-space-6) 0}
.mini-card{padding:var(--agtc-space-5)}
.mini-card .mc-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:var(--agtc-space-3);display:flex}
.mini-card .mc-title{font-weight:var(--agtc-semantic-fontWeight-bold);font-size:var(--agtc-font-size-body);color:var(--agtc-semantic-color-text-primary);margin-bottom:var(--agtc-space-1)}
.mini-card .mc-desc{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary);line-height:1.55}

/* ── Principe fondamental ─────────────────────────────────── */
.pf-section{padding:var(--agtc-space-9) var(--agtc-space-5)}
.pf-section h2{color:var(--agtc-semantic-color-text-primary);margin-bottom:var(--agtc-space-6)}
.pf-frow{display:flex;align-items:stretch;width:100%}
.pf-fcell{flex:1;padding:clamp(18px,2.2vw,32px);display:flex;flex-direction:column;align-items:flex-start;gap:8px;position:relative}
.pf-fcell:not(:last-child)::after{content:'→';position:absolute;right:-16px;top:50%;transform:translateY(-50%);font-size:1.8rem;color:#fff;padding:4px;z-index:2}
.pf-cell-human{background:var(--agtc-semantic-color-brand-primary)}
.pf-cell-agent{background:var(--agtc-semantic-color-brand-accent)}
.pf-cell-system{background:var(--agtc-semantic-color-brand-secondary)}
/* Défaut : texte foncé (teal + rose) */
.pf-fi{line-height:1;color:#0a0c11;margin-bottom:4px}.pf-fi svg{width:40px;height:40px}
.pf-fr{font-size:1.1rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(10,12,17,.85)}
.pf-fv{font-size:clamp(1.6rem,2.8vw,2.4rem);font-weight:700;line-height:1.1}
.pf-fv-white{color:#0a0c11}.pf-fv-teal{color:#0a0c11}.pf-fv-green{color:#0a0c11}
.pf-fd{font-size:clamp(.95rem,1.1vw,1rem);line-height:1.55;max-width:21ch;color:rgba(10,12,17,.85)}
/* Override bordeaux : texte blanc (11.83:1) */
.pf-cell-system .pf-fi{color:#fff}
.pf-cell-system .pf-fr{color:rgba(255,255,255,.75)}
.pf-cell-system .pf-fv{color:#fff}
.pf-cell-system .pf-fd{color:rgba(255,255,255,.7)}
.pf-tagline{margin-top:1.6em;font-size:1.1rem;color:var(--agtc-semantic-color-text-secondary)}
@media(max-width:768px){
  .pf-frow{flex-direction:column}
  .pf-fcell:not(:last-child)::after{display:none}
}

/* ── Stack nodes ─────────────────────────────────────────── */
.stack-node{flex:1;min-width:110px;padding:var(--agtc-space-5) var(--agtc-space-3);text-align:center;background:var(--agtc-semantic-color-background-surface);border-right:1px solid var(--agtc-semantic-color-border-default)}
.stack-node:last-child{border-right:none;background:var(--agtc-semantic-color-background-subtle)}
.stack-node-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:var(--agtc-space-2);display:flex;justify-content:center}
.stack-node-label{font-size:var(--agtc-font-size-detail);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary)}
.stack-node-sub{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary);margin-top:3px}

/* ── CTA final ───────────────────────────────────────────── */
.cta-final{text-align:center}
.cta-final .cta-actions{display:flex;gap:var(--agtc-space-3);justify-content:center;flex-wrap:wrap;margin-top:var(--agtc-space-6)}

/* ── Brand band ──────────────────────────────────────────── */
.brand-band{position:relative;width:100%;height:160px;overflow:hidden;background:var(--agtc-semantic-color-background-inverse)}
.brand-band svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.brand-band .shape-plum{fill:var(--agtc-semantic-color-secondary)}
.brand-band .shape-accent{fill:var(--agtc-semantic-color-accent)}
.brand-band .shape-slate{fill:var(--agtc-semantic-color-tertiary)}
.brand-band .shape-surface{fill:var(--agtc-semantic-color-background-page)}
.brand-band .shape-teal{fill:var(--agtc-semantic-color-brand-primary)}
.brand-band .shape{opacity:.96;transition:transform .9s cubic-bezier(.22,1,.36,1)}
@media(hover:hover) and (prefers-reduced-motion:no-preference){
  .brand-band:hover .drift-a{transform:translateX(14px)}
  .brand-band:hover .drift-b{transform:translateX(-18px)}
  .brand-band:hover .drift-c{transform:translateY(-10px)}
}
@media(max-width:768px){.brand-band{height:110px}}

/* ── Contribution banner ─────────────────────────────────── */
.contrib-banner{display:flex;align-items:center;gap:var(--agtc-space-6);background:var(--agtc-semantic-color-brand-primary-subtle);border:1px solid var(--agtc-semantic-color-brand-primary);border-radius:var(--agtc-semantic-radius-card);padding:var(--agtc-space-7) var(--agtc-space-7);margin-top:var(--agtc-space-7);flex-wrap:wrap}
.contrib-banner-icon{flex-shrink:0;color:var(--agtc-semantic-color-text-primary);display:flex;align-items:center;justify-content:center}
.contrib-banner-content{flex:1;min-width:200px}
.contrib-banner-title{display:block;font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:var(--agtc-space-2)}
.contrib-banner-desc{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary);line-height:1.55;margin:0}
@media(max-width:640px){.contrib-banner{flex-direction:column;align-items:flex-start}}

/* ── Mobile — header tools ───────────────────────────────── */
@media(max-width:768px){
  .header-tools{margin-left:auto}
}

/* ── Reveal au défilement ────────────────────────────────── */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .6s,transform .6s}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}}

/* ══ REDESIGN PHASE 3 — hero 3D + home layout ═══════════════════════════════ */
/* ── Layer link (connector entre les planes) ─────────────────────────────── */
.layer-link{position:absolute;left:50%;top:50%;width:2px;height:120px;background:linear-gradient(var(--agtc-semantic-color-brand-primary),transparent);transform:translate(-50%,-50%) rotate(34deg);z-index:-1;opacity:.5}
/* ── CTA final paragraph max-width ──────────────────────────────────────── */
.cta-final > p{max-width:560px;margin:0 auto}
/* ── Home section h2 top margin reset ───────────────────────────────────── */
.home-section h2{margin-top:0}

/* ══ REDESIGN — sections narratives (feature/redesign) ══════════════════════
   Classes préfixées rd- dédiées à la refonte narrative.
   Toutes passent par les tokens sémantiques existants.                       */

/* ── REDESIGN — ambiance continue (prompt.md : "une seule atmosphère") ──────
   Pas d'alternance dark/light. Sections séparées par un border discret +
   surfaces subtiles. Tous les tokens passent par semantic.marketing.* ou
   semantic.* — jamais de valeur en dur. ADR-057, ADR-058. */
.rd-section{width:100%;overflow:hidden;border-top:1px solid var(--agtc-semantic-color-border-default)}
.rd-section-alt{background:var(--agtc-semantic-color-background-subtle)}
.rd-inner{max-width:1280px;margin:0 auto;padding:var(--agtc-semantic-marketing-space-section-breathing) clamp(1.5rem,5vw,5rem)}
.rd-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:center}
.rd-grid-rev{direction:rtl}.rd-grid-rev > *{direction:ltr}
@media(max-width:860px){.rd-grid,.rd-grid-rev{grid-template-columns:1fr;gap:3rem;direction:ltr}}

.rd-eyebrow{display:block;font-size:var(--agtc-semantic-marketing-typography-eyebrow-size);font-weight:var(--agtc-semantic-marketing-typography-eyebrow-weight);text-transform:uppercase;letter-spacing:var(--agtc-tracking-eyebrow);color:var(--agtc-semantic-color-action-primary);margin-bottom:1rem}
.rd-h2{font-size:clamp(2.25rem,5vw,3.5rem);font-weight:var(--agtc-semantic-fontWeight-bold);line-height:1.05;letter-spacing:var(--agtc-tracking-tighter);margin:0 0 1.75rem;color:var(--agtc-semantic-color-text-primary)}
.rd-lead{font-size:clamp(1.0625rem,1.8vw,1.25rem);line-height:1.7;color:var(--agtc-semantic-color-text-secondary);max-width:52ch;margin-bottom:2rem}

/* Hero stats — inside dark .hero section, donc tokens on-inverse */
.rd-hero-stats{display:flex;gap:2rem;flex-wrap:wrap;margin-top:2.5rem;padding-top:2rem;border-top:1px solid var(--agtc-surface-glass-border)}
.rd-stat-num{display:block;font-size:var(--agtc-font-size-h3,1.75rem);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-action-primary);line-height:1}
.rd-stat-label{display:block;font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-on-inverse-muted);margin-top:.25rem}

/* agtc-button.ghost sur fond .hero sombre — token glass, meme logique que ds-btn.on-dark */
.hero .agtc-button.ghost{color:var(--agtc-surface-glass-ghost-text);border-color:var(--agtc-surface-glass-border)}
.hero .agtc-button.ghost:hover:not(:disabled){background:var(--agtc-surface-glass)}

.rd-illus{display:flex;align-items:center;justify-content:center;overflow:visible}
.rd-illus img{width:100%;max-width:660px;height:auto;display:block}

/* ── PHASE 2.1 — sections continues · bleed · fondu images ──────────────────
   "Les images doivent toujours se fondre avec le fond de la section."
   Solution : TOUTES les sections rd-* passent sur fond inverse (dark).
   Le token remapping via CSS custom properties cascade automatiquement dans
   tous les enfants (cartes, textes, bordures, Web Components). ADR-057, ADR-058.

   Ambiance continue : une seule atmosphère sombre sur l'ensemble de la page.
   Les illustrations (fond sombre isométrique) se fondent dans le fond de section. */

/* ── Toutes sections rd-* = fond inverse. Token remapping en cascade. ─── */
[data-context="marketing"] .rd-section,
[data-context="marketing"] .rd-section-alt{
  background:var(--agtc-semantic-color-background-inverse);
  color:var(--agtc-semantic-color-text-on-inverse);
  /* Remap tokens sémantiques — enfants (cartes, textes, boutons) héritent automatiquement */
  --agtc-semantic-color-text-primary:var(--agtc-semantic-color-text-on-inverse);
  --agtc-semantic-color-text-secondary:var(--agtc-semantic-color-text-on-inverse-muted);
  --agtc-semantic-color-background-surface:var(--agtc-surface-glass);
  --agtc-semantic-color-background-subtle:var(--agtc-surface-glass);
  --agtc-semantic-color-border-default:var(--agtc-surface-glass-border);
}
/* rd-section-alt : légère variation via glass overlay */
[data-context="marketing"] .rd-section-alt{
  background:color-mix(in srgb,var(--agtc-semantic-color-background-inverse) 94%,white 6%);
}
@supports not (color:color-mix(in srgb,black 0%,white 0%)){
  [data-context="marketing"] .rd-section-alt{background:var(--agtc-semantic-color-background-inverse)}
}

/* Blend architectural — illustrations fusionnées comme background-image.
   mix-blend-mode:screen → pixels sombres du PNG disparaissent dans le fond sombre.
   Seul le contenu lumineux (teal, circuits, highlights) reste visible.
   mask-image conserve le fondu de bord. */
.rd-illus img,.rd-illus-center img{
  mix-blend-mode:screen;
  -webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 45%,transparent 90%);
  mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 45%,transparent 90%);
}

/* Full-width S5 : screen blend + fondu de bord */
.rd-illus-full img{
  mix-blend-mode:screen;
  -webkit-mask-image:radial-gradient(ellipse 85% 80% at 50% 50%,black 48%,transparent 90%);
  mask-image:radial-gradient(ellipse 85% 80% at 50% 50%,black 48%,transparent 90%);
}

/* Hero illustration : screen blend vers le fond sombre du hero */
.hero .rd-illus img{
  mix-blend-mode:screen;
  -webkit-mask-image:radial-gradient(ellipse 82% 78% at 55% 45%,black 45%,transparent 90%);
  mask-image:radial-gradient(ellipse 82% 78% at 55% 45%,black 45%,transparent 90%);
  max-width:none;
}

/* Hero plus asymétrique — illustration légèrement dominante */
[data-context="marketing"] .hero-grid{grid-template-columns:9fr 13fr}

/* Une seule histoire — sections sans bordures, flux naturel */
.rd-section{overflow:visible;border-top:none}

/* Protection contre le scroll horizontal du bleed */
.rd-wrap{overflow-x:hidden}

/* Bleed architectural : illustration sort de sa colonne */
.rd-illus-bleed-r img{width:135%;max-width:none !important}
.rd-illus-bleed-l img{width:135%;max-width:none !important;margin-left:-35%}

/* Séparation entre zones : très légère via .rd-section-alt uniquement */
.rd-section-alt{position:relative}

/* La section wow et alt n'ont pas besoin de border non plus */
.rd-section-wow{border-top:none}
.rd-illus-placeholder{aspect-ratio:4/3;width:100%;max-width:520px;background:var(--agtc-semantic-color-background-subtle);border:2px dashed var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;color:var(--agtc-semantic-color-text-secondary);font-size:var(--agtc-font-size-detail);text-align:center;padding:1.5rem}
.rd-illus-placeholder strong{display:block;font-size:var(--agtc-font-size-label);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary)}

.rd-list{list-style:none;padding:0;margin:1.5rem 0;display:grid;gap:.75rem}
.rd-list li{display:flex;align-items:baseline;gap:.75rem;font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-primary)}
.rd-list.dash li::before{content:"—";color:var(--agtc-semantic-color-action-primary);font-weight:700;flex-shrink:0}
.rd-list.check li::before{content:"✓";color:var(--agtc-semantic-color-action-primary);font-weight:700;flex-shrink:0}
.rd-list.arrow li::before{content:"→";color:var(--agtc-semantic-color-action-primary);font-weight:700;flex-shrink:0}
.rd-list.dot li::before{content:"◆";color:var(--agtc-semantic-color-action-primary);font-size:.5rem;flex-shrink:0;align-self:center}
.rd-list li.no::before{content:"✗";color:var(--agtc-semantic-color-feedback-danger);font-weight:700;flex-shrink:0}

.rd-dual{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin:2rem 0}
.rd-dual-card{padding:1.5rem;border-radius:var(--agtc-semantic-radius-card);background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default)}
.rd-dual-title{font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:1rem}
.rd-quote{font-size:var(--agtc-font-size-body);font-style:italic;color:var(--agtc-semantic-color-text-secondary);border-left:3px solid var(--agtc-semantic-color-action-primary);padding-left:1.5rem;margin:2rem 0 0;max-width:52ch}

.rd-stack{display:grid;gap:1rem}
.rd-stack-card{padding:1.25rem 1.5rem;border-radius:var(--agtc-semantic-radius-card);background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);display:grid;grid-template-columns:auto 1fr;gap:.75rem 1rem;align-items:start;transition:border-color .18s}
.rd-stack-card:hover{border-color:var(--agtc-semantic-color-action-primary)}
.rd-stack-num{font-size:var(--agtc-font-size-detail);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-action-primary);grid-row:1/3;padding-top:.15rem}
.rd-stack-title{font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary)}
.rd-stack-desc{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary)}

.rd-role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:1rem;margin-top:2rem}
.rd-role-card{padding:1.5rem;background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);transition:border-color .18s}
.rd-role-card:hover{border-color:var(--agtc-semantic-color-action-primary)}
.rd-role-name{font-size:var(--agtc-font-size-label);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem}
.rd-role-name::before{content:"";display:block;width:8px;height:8px;border-radius:50%;background:var(--agtc-semantic-color-action-primary);flex-shrink:0}
.rd-role-items{list-style:none;padding:0;margin:0;display:grid;gap:.375rem}
.rd-role-items li{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary)}

.rd-statement{font-size:clamp(1.25rem,2.5vw,1.875rem);font-style:normal;font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-action-primary);border-left:none;padding-left:0;margin-top:3rem;line-height:1.25;letter-spacing:var(--agtc-tracking-tighter)}

.rd-cta-inner{text-align:center;max-width:720px;margin:0 auto}
.rd-cta-inner .rd-lead{margin:0 auto 2rem;color:var(--agtc-semantic-color-text-on-inverse-muted)}
.rd-cta-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.rd-doc-nav{text-align:center;padding:var(--agtc-space-8,64px) clamp(1.5rem,5vw,5rem);border-top:1px solid var(--agtc-semantic-color-border-default)}
.rd-doc-nav a{color:var(--agtc-semantic-color-text-secondary);font-size:var(--agtc-font-size-detail)}
.rd-doc-nav a:visited{color:var(--agtc-semantic-color-text-secondary)}
.rd-doc-nav a:hover{color:var(--agtc-semantic-color-action-primary)}

@media(max-width:640px){.rd-dual{grid-template-columns:1fr}.rd-hero-stats{gap:1.25rem}}

/* ── PHASE 2 — rythme, compositions dynamiques, halos de profondeur ─────────
   Sections wow (fond inverse), asymétriques, centrées. Halos via rgba()
   — profondeur atmosphérique, pas gradient de marque. ADR-057, ADR-058.
   Un seul aurora (hero) conforme règle 1 gradient/page. */

/* Hero pleine hauteur sur pages marketing */
[data-context="marketing"] .hero{min-height:90svh;display:flex;align-items:center}
[data-context="marketing"] .hero .hero-inner{width:100%;padding-top:2rem;padding-bottom:2rem}

/* Sections marketing : 96px → 144px (×1.5) — plus d'air éditorial */
[data-context="marketing"] .rd-section>.rd-inner,
[data-context="marketing"] .rd-section-alt>.rd-inner,
[data-context="marketing"] .rd-section-wow>.rd-inner{
  padding-top:calc(var(--agtc-semantic-marketing-space-section-breathing)*1.5);
  padding-bottom:calc(var(--agtc-semantic-marketing-space-section-breathing)*1.5);
}

/* Sections monumentales — ×2 section-breathing (≈ 192px) — override la règle ×1.5 ci-dessus */
.rd-section-monument>.rd-inner{
  padding-top:calc(var(--agtc-semantic-marketing-space-section-breathing)*2);
  padding-bottom:calc(var(--agtc-semantic-marketing-space-section-breathing)*2);
}

/* Section "wow" — fond inverse, PAS d'aurora (quota 1 gradient = hero) */
.rd-section-wow{
  background:var(--agtc-semantic-color-background-inverse);
  color:var(--agtc-semantic-color-text-on-inverse);
}
.rd-section-wow .rd-h2{color:var(--agtc-semantic-color-text-on-inverse)}
.rd-section-wow .rd-eyebrow{color:var(--agtc-semantic-color-action-primary)}
.rd-section-wow .rd-lead{color:var(--agtc-semantic-color-text-on-inverse-muted)}
.rd-section-wow .rd-narrative{color:var(--agtc-semantic-color-text-on-inverse-muted)}
.rd-section-wow .rd-dual-card{background:var(--agtc-surface-glass);border-color:var(--agtc-surface-glass-border)}
.rd-section-wow .rd-dual-title{color:var(--agtc-semantic-color-text-on-inverse)}
.rd-section-wow .rd-list li{color:var(--agtc-semantic-color-text-on-inverse-muted)}
.rd-section-wow .rd-statement{color:var(--agtc-semantic-color-text-on-inverse-muted)}
.rd-section-wow .rd-quote{color:var(--agtc-semantic-color-text-on-inverse-muted);border-left-color:var(--agtc-semantic-color-action-primary)}
.rd-section-wow .rd-token-card{background:var(--agtc-surface-glass);border-color:var(--agtc-surface-glass-border)}
.rd-section-wow .rd-token-title{color:var(--agtc-semantic-color-text-on-inverse)}
.rd-section-wow .rd-token-desc{color:var(--agtc-semantic-color-text-on-inverse-muted)}

/* Grilles asymétriques 40/60 et 60/40 */
.rd-grid-40-60{display:grid;grid-template-columns:2fr 3fr;gap:clamp(2rem,5vw,5rem);align-items:center}
.rd-grid-60-40{display:grid;grid-template-columns:3fr 2fr;gap:clamp(2rem,5vw,5rem);align-items:center}
@media(max-width:860px){.rd-grid-40-60,.rd-grid-60-40{grid-template-columns:1fr}}

/* Section centrée — pauses narratives */
.rd-center{text-align:center}
.rd-center .rd-h2{max-width:22ch;margin-left:auto;margin-right:auto}
.rd-center .rd-lead{margin-left:auto;margin-right:auto;max-width:56ch}
.rd-center .rd-eyebrow{display:flex;justify-content:center}
.rd-center .rd-quote{text-align:center;border-left:none;padding-left:0;margin-left:auto;margin-right:auto;font-size:clamp(1.5rem,3vw,2.5rem);font-style:normal;font-weight:var(--agtc-semantic-fontWeight-bold);line-height:1.2;max-width:28ch}

/* Illustration pleine largeur (S5) */
.rd-illus-full{width:100%;margin:3rem 0}
.rd-illus-full img{width:100%;height:auto;display:block}

/* Illustration centrée (S3) */
.rd-illus-center{display:flex;justify-content:center;margin-bottom:5rem;overflow:visible}
.rd-illus-center img{width:100%;max-width:920px;height:auto;display:block}

/* Halos de profondeur — rgba() uniquement, pas de token gradient de marque */
.rd-halo{position:relative}
.rd-halo::before{content:"";position:absolute;inset:-35%;background:radial-gradient(ellipse 82% 82% at 50% 50%,rgba(18,165,148,.30) 0%,transparent 70%);pointer-events:none;z-index:0}
.rd-halo>*{position:relative;z-index:1}
.rd-halo-pink::before{background:radial-gradient(ellipse 82% 82% at 50% 50%,rgba(237,107,134,.24) 0%,transparent 70%)}
.rd-halo-violet::before{background:radial-gradient(ellipse 82% 82% at 50% 50%,rgba(120,80,200,.22) 0%,transparent 70%)}

/* Texte narratif — plus grand que body standard */
.rd-narrative{font-size:clamp(1.125rem,2vw,1.375rem);line-height:1.8;color:var(--agtc-semantic-color-text-primary);max-width:60ch}

/* Token flow — 4 cartes horizontales sous illustration S5 */
.rd-token-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:3rem}
@media(max-width:900px){.rd-token-flow{grid-template-columns:repeat(2,1fr)}}
@media(max-width:500px){.rd-token-flow{grid-template-columns:1fr}}
.rd-token-card{padding:1.5rem;background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);transition:border-color .18s}
.rd-token-card:hover{border-color:var(--agtc-semantic-color-action-primary)}
.rd-token-num{font-size:var(--agtc-font-size-detail);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-action-primary);margin-bottom:.5rem}
.rd-token-title{font-size:var(--agtc-font-size-body);font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary);margin-bottom:.375rem}
.rd-token-desc{font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary)}

/* Placeholder dans sections sombres (S7) */
.rd-section-wow .rd-illus-placeholder{background:var(--agtc-surface-glass);border-color:var(--agtc-surface-glass-border);color:var(--agtc-semantic-color-text-on-inverse-muted)}
.rd-section-wow .rd-illus-placeholder strong{color:var(--agtc-semantic-color-text-on-inverse)}

/* Centrage du CTA interne hero */
.rd-cta-inner .rd-eyebrow{display:flex;justify-content:center;margin-bottom:0.5rem}

/* Illustration simple (ni full ni center) utilisée dans rd-grid-* */
.rd-illus img{width:100%;height:auto;display:block}
`; }

function siteJS() { return `
document.addEventListener('DOMContentLoaded', () => {

  // ── Theme toggle ─────────────────────────────────────────
  const prefersDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
  const savedTheme = localStorage.getItem('agtc-theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.querySelectorAll('[data-theme-toggle], .theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('agtc-theme', next);
      btn.setAttribute('aria-label', next === 'dark' ? 'Basculer en thème clair / Switch to light theme' : 'Basculer en thème sombre / Switch to dark theme');
      if (btn.classList.contains('theme-btn')) btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  });

  // ── Animated counters — stat-band uniquement (fonctionnel, pas décoratif) ──
  const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const statBand = document.querySelector('.stat-band');
  if (statBand && 'IntersectionObserver' in window) {
    const animateCounter = (el, target, duration) => {
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const update = now => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (t < 1) requestAnimationFrame(update);
      };
      update(performance.now());
    };
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statBand.querySelectorAll('[data-count]').forEach(el =>
          animateCounter(el, parseInt(el.dataset.count, 10), 1200));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(statBand);
  }

  // ── Language toggle ─────────────────────────────────────
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const savedLang = urlLang || localStorage.getItem('agtc-lang') || 'fr';
  document.documentElement.setAttribute('data-lang', savedLang);
  // Bascule de langue — consomme le contrôle .agtc-segmented (ADR-044).
  // Sélecteur .lang-switch button : cible le switcher du header (pas <html data-lang>
  // ni les démos segmented de la page composant).
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.setAttribute('aria-current', btn.dataset.lang === savedLang ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem('agtc-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false'));
      // Update copy button labels when language switches
      document.querySelectorAll('.code-copy').forEach(b => { if (!b.textContent.includes('!')) b.textContent = lang === 'en' ? 'Copy' : 'Copier'; });
    });
  });

  // ── Language toggle .lang-btn (Redesign/site.css) ───────────────────────
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const on = btn.dataset.lang === savedLang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem('agtc-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-btn').forEach(b => {
        const a = b.dataset.lang === lang;
        b.classList.toggle('active', a);
        b.setAttribute('aria-pressed', a ? 'true' : 'false');
      });
      document.querySelectorAll('.code-copy').forEach(b => { if (!b.textContent.includes('!')) b.textContent = lang === 'en' ? 'Copy' : 'Copier'; });
    });
  });

  // ── Mobile menu (agtc-top-nav) ───────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const topNav = document.querySelector('agtc-top-nav');
  if (menuToggle && topNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = topNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', e => {
      if (!menuToggle.contains(e.target) && !topNav.contains(e.target)) {
        topNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Sidebar drawer (mobile) ──────────────────────────────
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.getElementById('site-sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (sidebarToggle && sidebar) {
    sidebarToggle.removeAttribute('hidden');
    const openDrawer = () => {
      sidebar.classList.add('open');
      sidebarOverlay && sidebarOverlay.classList.add('active');
      sidebarToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      sidebar.classList.remove('open');
      sidebarOverlay && sidebarOverlay.classList.remove('active');
      sidebarToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    sidebarOverlay && sidebarOverlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeDrawer();
    });
    sidebar.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });
  }

  // ── Active sidebar links ──────────────────────────────────
  // Note : agtc-top-nav gère aria-current="page" en interne (ADR-060).
  const p = window.location.pathname;
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith(a.getAttribute('href')?.split('/').pop() || '')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ── TOC auto-generation ──────────────────────────────────
  const tocEl = document.getElementById('page-toc');
  if (tocEl) {
    const headings = Array.from(document.querySelectorAll('.content h2'));
    if (headings.length > 1) {
      function slugify(t) {
        return t.toLowerCase()
          .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[ïî]/g,'i')
          .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u')
          .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      }
      const title = document.createElement('span');
      title.className = 'toc-title';
      title.innerHTML = '<span class="lang-fr">Sur cette page</span><span class="lang-en">On this page</span>';
      tocEl.appendChild(title);
      headings.forEach(h => {
        const frSpan = h.querySelector('.lang-fr');
        const enSpan = h.querySelector('.lang-en');
        const frText = frSpan ? frSpan.textContent : h.textContent;
        if (!h.id) h.id = slugify(frText);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        if (frSpan && enSpan) {
          a.innerHTML = '<span class="lang-fr">' + frSpan.textContent + '</span><span class="lang-en">' + enSpan.textContent + '</span>';
        } else {
          a.textContent = frText;
        }
        tocEl.appendChild(a);
      });
      // Active tracking
      const tocLinks = tocEl.querySelectorAll('a');
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            tocLinks.forEach(l => l.classList.remove('active'));
            const active = tocEl.querySelector('a[href="#' + e.target.id + '"]');
            if (active) active.classList.add('active');
          }
        });
      }, { rootMargin: '-10px 0px -80% 0px' });
      headings.forEach(h => obs.observe(h));
    }
  }

  // ── Token search ─────────────────────────────────────────
  const search = document.getElementById('token-search');
  const searchStatus = document.getElementById('token-search-status');
  if (search) {
    let debounceTimer;
    const runFilter = () => {
      const q = search.value.trim().toLowerCase();
      let totalVisible = 0;
      document.querySelectorAll('.token-section').forEach(section => {
        let sectionVisible = 0;
        section.querySelectorAll('.token-row').forEach(row => {
          const match = !q || row.textContent.toLowerCase().includes(q);
          row.style.display = match ? '' : 'none';
          if (match) sectionVisible++;
        });
        totalVisible += sectionVisible;
        section.style.display = sectionVisible === 0 && q ? 'none' : '';
      });
      if (searchStatus) {
        if (!q) {
          searchStatus.textContent = '';
        } else {
          const lang = document.documentElement.getAttribute('data-lang') || 'fr';
          searchStatus.textContent = lang === 'fr'
            ? totalVisible + ' token' + (totalVisible !== 1 ? 's' : '') + ' trouvé' + (totalVisible !== 1 ? 's' : '')
            : totalVisible + ' token' + (totalVisible !== 1 ? 's' : '') + ' found';
        }
      }
    };
    search.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 120);
    });
    search.addEventListener('search', runFilter);
  }

  // ── Code blocks : label de langue + bouton copier accessible (ADR-041) ──────
  // Région live unique partagée pour annoncer « Copié ! » aux lecteurs d'écran.
  let copyLive = document.getElementById('agtc-copy-live');
  if (!copyLive) {
    copyLive = document.createElement('span');
    copyLive.id = 'agtc-copy-live';
    copyLive.setAttribute('role', 'status');
    copyLive.setAttribute('aria-live', 'polite');
    Object.assign(copyLive.style, {position:'absolute',width:'1px',height:'1px',padding:'0',margin:'-1px',overflow:'hidden',clip:'rect(0 0 0 0)',whiteSpace:'nowrap',border:'0'});
    document.body.appendChild(copyLive);
  }

  document.querySelectorAll('pre.code-block').forEach(pre => {
    const code = pre.querySelector('code');

    // Label de langue depuis la classe lang-xxx (CD5)
    const langClass = [...(code?.classList || [])].find(c => c.startsWith('lang-'));
    const lang = langClass ? langClass.slice(5) : '';
    if (lang) {
      const tag = document.createElement('span');
      tag.className = 'code-lang';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = lang;
      pre.classList.add('has-lang');
      pre.appendChild(tag);
    }

    // Bouton copier accessible (CD2/CD3/CD4)
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    const copyLabel = () => document.documentElement.getAttribute('data-lang') === 'en' ? 'Copy' : 'Copier';
    btn.textContent = copyLabel();
    btn.setAttribute('aria-label', (document.documentElement.getAttribute('data-lang') === 'en' ? 'Copy code' : 'Copier le code') + (lang ? ' (' + lang + ')' : ''));
    pre.appendChild(btn);
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText((code?.textContent || '').replace(/^\\n+|\\n+$/g, '')); }
      catch { return; }
      const copiedLabel = document.documentElement.getAttribute('data-lang') === 'en' ? 'Copied!' : 'Copié !';
      btn.textContent = copiedLabel;
      copyLive.textContent = copiedLabel;
      setTimeout(() => { btn.textContent = copyLabel(); copyLive.textContent = ''; }, 1600);
    });
  });

  // ── Reveal au défilement ─────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(el => revealObs.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  // ── Bouton retour en haut ────────────────────────────────
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const onScroll = () => {
      const visible = window.scrollY > 200;
      backToTop.hidden = !visible;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Lazy-load des illustrations SVG (P1 perf — hors du HTML initial) ──────
  // Les SVG sont chargés et injectés inline → CSS custom properties (dark mode) conservées.
  const lazyIllusEls = document.querySelectorAll('.illus-lazy[data-svg]');
  if (lazyIllusEls.length && 'IntersectionObserver' in window) {
    const illusObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        fetch(el.dataset.svg)
          .then(r => r.ok ? r.text() : '')
          .then(svg => { if (svg) { el.innerHTML = svg; el.removeAttribute('data-svg'); } })
          .catch(() => {});
        illusObs.unobserve(el);
      });
    }, { rootMargin: '400px' });
    lazyIllusEls.forEach(el => illusObs.observe(el));
  }
});
`; }

// ─── HTML LAYOUT ───────────────────────────────────────────────────────────
// Storybook publié par Chromatic (branche main, toujours la dernière baseline).
// appId = 6a1c1e665ec5fe8fc0540983 ; permalien stable vérifié (HTTP 200).
const STORYBOOK_URL = 'https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/';
const SITE_URL      = 'https://designsystem.gnegreiros.com';

function layout({ title, pageTitle, depth = 0, section = '', sidebar = null, body, fullWidth = false, context = '' }) {
  const docTitle = pageTitle || `${title} — Agentica`;
  const base = depth > 0 ? '../' : '';
  // DÉMARRER = CTA (cta:true) — action primaire d'adoption (ADR-060).
  // Items définis ici, passés au composant agtc-top-nav via script inline.
  const navItems = JSON.stringify([
    { labelFr:'Accueil',        labelEn:'Home',           href:`${base}index.html` },
    { labelFr:'Pourquoi',       labelEn:'Why',            href:`${base}index.html#pourquoi` },
    { labelFr:'Architecture',   labelEn:'Architecture',   href:`${base}index.html#architecture` },
    { labelFr:'Qualité',        labelEn:'Quality',        href:`${base}index.html#qualite` },
    { labelFr:'IA',             labelEn:'AI',             href:`${base}index.html#ia` },
    { labelFr:'Documentation',  labelEn:'Documentation',  href:`${base}foundations/index.html` },
    { labelFr:'Démarrer',       labelEn:'Get started',    href:`${base}get-started.html`, cta:true },
  ]);

  const sidebarHtml = sidebar
    ? `<aside class="sidebar" id="site-sidebar" role="navigation" aria-label="Navigation secondaire">${sidebar}</aside>`
    : '';
  const tocHtml = !fullWidth ? `<nav class="toc" id="page-toc" aria-label="Table des matières"></nav>` : '';
  const mainClass = fullWidth ? 'home-layout' : 'layout';

  const auditHref = (depth > 0 ? '../'.repeat(depth) : '') + 'audit.html';
  const footer = `
<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-col">
      <a class="footer-logo" href="${base}index.html" aria-label="Agentica — Accueil">
        <svg class="footer-logo-mark" viewBox="0 0 198 198" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M178 0C189.046 0 198 8.95431 198 20V178C198 189.046 189.046 198 178 198H20C8.95431 198 0 189.046 0 178V20C0 8.95431 8.95431 0 20 0H178ZM162.432 114.077C161.826 113.896 161.174 113.97 160.624 114.283L106.965 144.868C106.256 145.272 105.81 146.02 105.786 146.84C105.762 147.676 106.19 148.441 106.878 148.895C115.792 154.77 124.922 160.382 134.29 165.495C144.063 170.83 154.337 175.629 163.01 177.658C167.325 178.668 171.75 179.119 175.71 178.238C179.937 177.299 183.616 174.815 185.644 170.392L185.836 169.946C187.68 165.474 186.793 160.335 184.538 155.586C177.933 141.999 170.755 128.668 163.835 115.242C163.544 114.678 163.037 114.258 162.432 114.077ZM140.076 70.7607C139.471 70.5803 138.819 70.6549 138.27 70.9678L24.7578 135.67C24.418 135.864 24.1329 136.14 23.9277 136.473C20.1113 143.146 16.7662 150.139 13.167 156.935C11.0764 160.883 10.117 166.194 12.8516 170.848C13.7117 172.311 15.0327 173.379 16.499 174.203C19.5354 175.91 23.0337 176.889 26.4238 177.564C26.9699 177.673 27.537 177.582 28.0215 177.306L155.764 104.492C156.853 103.871 157.258 102.492 156.681 101.373C151.631 91.5855 146.406 81.4618 141.479 71.9258C141.188 71.362 140.681 70.9413 140.076 70.7607ZM109.5 19.8975C103.425 17.9211 96.2835 17.7348 90.125 19.4375C87.2883 20.2219 83.7877 21.7439 81.709 24.8545C81.2725 25.4824 80.941 26.1837 80.6035 26.8691C79.2798 29.557 77.9795 32.5623 76.3262 35.0596C63.1108 60.4146 50.1416 85.8216 37.0674 111.143C36.5925 112.063 36.7747 113.188 37.5156 113.908C38.2568 114.628 39.3809 114.772 40.2773 114.262L133.396 61.1846C134.487 60.5629 134.892 59.1835 134.313 58.0645C125.822 41.6425 119.242 28.9434 117.784 26.1846C117.683 25.9685 117.564 25.7537 117.441 25.5488L117.103 25.0078C115.197 22.1834 111.985 20.706 109.5 19.8975Z" fill="#12A594"/>
        </svg>
        <span class="footer-logo-name">Agentica</span>
      </a>
      <span class="footer-name">Guilherme Negreiros</span>
      <a href="https://www.linkedin.com/in/gnegreiros/" target="_blank" rel="noopener noreferrer" class="footer-link">${icon('linkedin', 15)} LinkedIn</a>
    </div>
    <div class="footer-col">
      <nav class="footer-links" aria-label="Footer">
        <a href="${base}changelog.html">${icon('clock', 15)} Changelog</a>
        <a href="${STORYBOOK_URL}" target="_blank" rel="noopener noreferrer">${storybookIcon(15)} Storybook</a>
        <a href="https://github.com/gnegreiros-ux/agentic-design-system" target="_blank" rel="noopener noreferrer">${icon('github', 15)} GitHub</a>
        <a href="${auditHref}" class="footer-link">${icon('shield-check', 15)} Audit</a>
      </nav>
    </div>
    <div class="footer-col footer-col-right">
      <span class="footer-copy">© ${new Date().getFullYear()} Guilherme Negreiros</span>
      <span class="footer-credit">
        ${icon('bot', 14)}
        <span class="lang-fr">Développé avec Claude Code</span>
        <span class="lang-en">Built with Claude Code</span>
      </span>
    </div>
  </div>
</footer>`;

  return `<!DOCTYPE html>
<html lang="fr" data-lang="fr" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Agentica — système de design conçu pour les humains qui décident et les agents IA qui exécutent. Tokens, composants, gouvernance et WCAG 2.1.">
<meta name="author" content="Guilherme Negreiros">
<title>${docTitle}</title>
<meta property="og:type" content="website">
<meta property="og:site_name" content="Agentica">
<meta property="og:title" content="${docTitle}">
<meta property="og:description" content="Agentica — système de design conçu pour les humains qui décident et les agents IA qui exécutent. Tokens, composants, gouvernance et WCAG 2.1.">
<meta property="og:image" content="https://designsystem.gnegreiros.com/social.png">
<meta property="og:image:width" content="1076">
<meta property="og:image:height" content="681">
<meta property="og:url" content="https://designsystem.gnegreiros.com/">
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="designsystem.gnegreiros.com">
<meta property="twitter:url" content="https://designsystem.gnegreiros.com/">
<meta name="twitter:title" content="${docTitle}">
<meta name="twitter:description" content="Agentica — système de design conçu pour les humains qui décident et les agents IA qui exécutent. Tokens, composants, gouvernance et WCAG 2.1.">
<meta name="twitter:image" content="https://designsystem.gnegreiros.com/social.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="${base}tokens.css">
<link rel="stylesheet" href="${base}site.css">
<script src="${base}components/agtc.js" defer></script>
</head>
<body${context ? ` data-context="${context}"` : ''}>
<a class="skip-link" href="#main-content">
  <span class="lang-fr">Aller au contenu</span>
  <span class="lang-en">Skip to content</span>
</a>
<header class="site-header" role="banner">
  <a class="logo" href="${base}index.html" aria-label="Agentica — Accueil">
    <svg class="logo-mark" viewBox="0 0 198 198" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M178 0C189.046 0 198 8.95431 198 20V178C198 189.046 189.046 198 178 198H20C8.95431 198 0 189.046 0 178V20C0 8.95431 8.95431 0 20 0H178ZM162.432 114.077C161.826 113.896 161.174 113.97 160.624 114.283L106.965 144.868C106.256 145.272 105.81 146.02 105.786 146.84C105.762 147.676 106.19 148.441 106.878 148.895C115.792 154.77 124.922 160.382 134.29 165.495C144.063 170.83 154.337 175.629 163.01 177.658C167.325 178.668 171.75 179.119 175.71 178.238C179.937 177.299 183.616 174.815 185.644 170.392L185.836 169.946C187.68 165.474 186.793 160.335 184.538 155.586C177.933 141.999 170.755 128.668 163.835 115.242C163.544 114.678 163.037 114.258 162.432 114.077ZM140.076 70.7607C139.471 70.5803 138.819 70.6549 138.27 70.9678L24.7578 135.67C24.418 135.864 24.1329 136.14 23.9277 136.473C20.1113 143.146 16.7662 150.139 13.167 156.935C11.0764 160.883 10.117 166.194 12.8516 170.848C13.7117 172.311 15.0327 173.379 16.499 174.203C19.5354 175.91 23.0337 176.889 26.4238 177.564C26.9699 177.673 27.537 177.582 28.0215 177.306L155.764 104.492C156.853 103.871 157.258 102.492 156.681 101.373C151.631 91.5855 146.406 81.4618 141.479 71.9258C141.188 71.362 140.681 70.9413 140.076 70.7607ZM109.5 19.8975C103.425 17.9211 96.2835 17.7348 90.125 19.4375C87.2883 20.2219 83.7877 21.7439 81.709 24.8545C81.2725 25.4824 80.941 26.1837 80.6035 26.8691C79.2798 29.557 77.9795 32.5623 76.3262 35.0596C63.1108 60.4146 50.1416 85.8216 37.0674 111.143C36.5925 112.063 36.7747 113.188 37.5156 113.908C38.2568 114.628 39.3809 114.772 40.2773 114.262L133.396 61.1846C134.487 60.5629 134.892 59.1835 134.313 58.0645C125.822 41.6425 119.242 28.9434 117.784 26.1846C117.683 25.9685 117.564 25.7537 117.441 25.5488L117.103 25.0078C115.197 22.1834 111.985 20.706 109.5 19.8975Z" fill="#12A594"/>
    </svg>
    <span class="logo-name">Agentica</span>
  </a>
  <agtc-top-nav id="site-top-nav" nav-label="Navigation principale"></agtc-top-nav>
  <script>(function(){var items=${navItems};function init(){var n=document.getElementById('site-top-nav');if(!n)return;n.items=items;n.current=window.location.pathname;}if(customElements.get('agtc-top-nav')){init();}else{customElements.whenDefined('agtc-top-nav').then(init);}})()</script>
  <button class="theme-toggle" aria-label="Basculer thème sombre / Switch to dark theme" data-theme-toggle>
    <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
    <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
  <div class="agtc-segmented lang-switch" role="group" aria-label="Language" style="margin-left:8px;flex-shrink:0">
    <button type="button" data-lang="fr" aria-current="true">FR</button>
    <button type="button" data-lang="en" aria-current="false">EN</button>
  </div>
  <a href="${STORYBOOK_URL}" target="_blank" rel="noopener noreferrer" class="storybook-btn" aria-label="Storybook — Catalogue interactif des composants">
    ${storybookIcon(18)}
  </a>
  <a href="https://github.com/gnegreiros-ux/agentic-design-system" target="_blank" rel="noopener noreferrer" class="github-btn" aria-label="GitHub — Code source du projet">
    ${icon('github', 18)}
  </a>
  <button class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-top-nav">
    ${icon('menu', 24)}
  </button>
</header>
${sidebar ? `<div class="sidebar-overlay" aria-hidden="true"></div>` : ''}
<div class="${mainClass}" id="main-content"${fullWidth ? ' data-context="marketing"' : ''}>
  ${sidebarHtml}
  <main class="${fullWidth ? '' : 'content'}" role="main">${sidebar ? `<button class="sidebar-toggle" aria-label="Navigation secondaire" aria-expanded="false" aria-controls="site-sidebar" hidden>${icon('panel-left', 20)}<span class="sidebar-toggle-label"><span class="lang-fr">Navigation</span><span class="lang-en">Navigation</span></span></button>` : ''}${body}</main>
  ${tocHtml}
</div>
${footer}
<button class="back-to-top" aria-label="Retour en haut" hidden>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>
  <span class="lang-fr">Haut</span><span class="lang-en">Top</span>
</button>
<script src="${base}site.js"></script>
</body>
</html>`.replace(/(?<!table-wrap">)<table(\b[^>]*)>/g, '<div class="table-wrap" tabindex="0"><table$1>').replace(/<\/table>(?!\s*<\/div>)/g, '</table></div>');
}

function sidebarFoundations(base, current) {
  const links = [
    ['index.html',      '<span class="lang-fr">Vue d\'ensemble</span><span class="lang-en">Overview</span>'],
    ['color.html',      '<span class="lang-fr">Couleur</span><span class="lang-en">Color</span>'],
    ['spacing.html',    '<span class="lang-fr">Espacement</span><span class="lang-en">Spacing</span>'],
    ['typography.html', '<span class="lang-fr">Typographie</span><span class="lang-en">Typography</span>'],
    ['icons.html',      '<span class="lang-fr">Icônes</span><span class="lang-en">Icons</span>'],
    ['contextes.html',  '<span class="lang-fr">Contextes</span><span class="lang-en">Contexts</span>'],
  ].map(([h,l]) => `<a href="${base}foundations/${h}"${current===h?' class="active"':''}>${l}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label"><span class="lang-fr">Fondations</span><span class="lang-en">Foundations</span></span>${links}</div>`;
}

function sidebarComponents(base, current) {
  const links = [
    ['index.html', '<span class="lang-fr">Vue d\'ensemble</span><span class="lang-en">Overview</span>'],
    ['button.html','Button'],
    ['icon.html',  'Icon'],
    ['input.html', 'Input'],
    ['badge.html', 'Badge'],
    ['card.html',  'Card'],
    ['checkbox.html', 'Checkbox'],
    ['radio.html', 'Radio'],
    ['toggle.html', 'Toggle'],
    ['table.html', 'Table'],
    ['code-block.html', 'Code Block'],
    ['banner.html', 'Banner'],
    ['link.html', 'Link'],
    ['segmented.html', 'Segmented'],
    ['tabs.html',      'Tabs'],
  ].map(([h,l]) => `<a href="${base}components/${h}"${current===h?' class="active"':''}>${l}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label"><span class="lang-fr">Composants</span><span class="lang-en">Components</span></span>${links}</div>`;
}

function sidebarDecisions(base, adrs) {
  const links = adrs.slice(0,10).map(a => `<a href="${base}decisions/${a.slug}.html">ADR-${String(a.num).padStart(3,'0')}</a>`).join('');
  const more = adrs.length > 10 ? `<a href="${base}decisions/index.html">→ <span class="lang-fr">Tous les ADRs</span><span class="lang-en">All ADRs</span> (${adrs.length})</a>` : '';
  return `<div class="sidebar-group"><span class="sidebar-label"><span class="lang-fr">Décisions</span><span class="lang-en">Decisions</span></span><a href="${base}decisions/index.html"><span class="lang-fr">Index des ADRs</span><span class="lang-en">ADR index</span></a>${links}${more}</div>`;
}

// Variante pour les pages déjà dans decisions/ — liens relatifs sans préfixe
function sidebarDecisionsLocal(adrs) {
  const links = adrs.map(a => `<a href="${a.slug}.html">ADR-${String(a.num).padStart(3,'0')}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label"><span class="lang-fr">Décisions</span><span class="lang-en">Decisions</span></span><a href="index.html"><span class="lang-fr">Index des ADRs</span><span class="lang-en">ADR index</span></a>${links}</div>`;
}

function sidebarTokens(base, current) {
  const links = [
    ['#primitifs',   'Primitifs'],
    ['#semantiques', 'Sémantiques'],
    ['#composants',  'Composants'],
  ].map(([h,l]) => `<a href="${base}tokens/index.html${h}"${current===h?' class="active"':''}>${l}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label">Tokens</span>${links}</div>`;
}

function sidebarAgents(base) {
  return `<div class="sidebar-group"><span class="sidebar-label"><span class="lang-fr">Agents IA</span><span class="lang-en">AI Agents</span></span><a href="${base}agents/index.html"><span class="lang-fr">Vue d'ensemble</span><span class="lang-en">Overview</span></a><a href="${base}agents/index.html#types"><span class="lang-fr">Types d'agents</span><span class="lang-en">Agent types</span></a><a href="${base}agents/index.html#actions"><span class="lang-fr">Ce qu'ils peuvent faire</span><span class="lang-en">What they can do</span></a><a href="${base}agents/index.html#lecture"><span class="lang-fr">Ordre de lecture</span><span class="lang-en">Reading order</span></a><a href="${base}agents/index.html#escalade"><span class="lang-fr">Règle d'escalade</span><span class="lang-en">Escalation rule</span></a><a href="${base}agents/index.html#skills"><span class="lang-fr">Compétences</span><span class="lang-en">Skills</span></a></div>`;
}

function sidebarPipelines(base, current) {
  const link = (p) => `<a href="${base}pipelines/${p.id}.html"${current === p.id + '.html' ? ' class="active"' : ''}><span class="lang-fr">${p.title_fr}</span><span class="lang-en">${p.title_en}</span></a>`;
  const orchestrator = PIPELINES.filter(p => p.status === 'orchestrator');
  const active       = PIPELINES.filter(p => p.status === 'active');
  const planned      = PIPELINES.filter(p => p.status === 'planned');
  return `<div class="sidebar-group"><span class="sidebar-label"><span class="lang-fr">Pipelines</span><span class="lang-en">Pipelines</span></span><a href="${base}pipelines/index.html"${current === 'index.html' ? ' class="active"' : ''}><span class="lang-fr">Vue d'ensemble</span><span class="lang-en">Overview</span></a>${[...orchestrator, ...active, ...planned].map(link).join('')}</div>`;
}

// Section « Patterns UX de référence » — lue depuis la guideline markdown du composant
// (source unique de vérité). Extrait la section "## PATTERNS UX DE RÉFÉRENCE" et la rend
// via parseMd, comme la page icon. Voir workflow ux-pattern-review / ADR-036.
function uxPatternsFromMd(comp) {
  const md = read(path.join(ROOT, `guidelines/components/${comp}.md`));
  const lines = md.split('\n');
  const start = lines.findIndex(l => /^##\s+PATTERNS UX DE RÉFÉRENCE/i.test(l));
  if (start === -1) return '';
  let end = start + 1;
  while (end < lines.length && !/^##\s+/.test(lines[end])) end++;
  const section = lines.slice(start, end);
  // retirer lignes vides / séparateurs en fin de section
  while (section.length && (section[section.length - 1].trim() === '' || /^-{3,}$/.test(section[section.length - 1].trim()))) section.pop();
  return parseMd(section.join('\n'));
}

function contributionBanner() {
  return `
<div class="contrib-banner">
  <div class="contrib-banner-icon" aria-hidden="true">${icon('github', 40)}</div>
  <div class="contrib-banner-content">
    <strong class="contrib-banner-title">
      <span class="lang-fr">Contribuer à ce projet</span>
      <span class="lang-en">Contribute to this project</span>
    </strong>
    <p class="contrib-banner-desc">
      <span class="lang-fr">Ce système est ouvert aux contributions — tokens, composants, décisions architecturales, corrections d'accessibilité ou documentation. Toute amélioration est bienvenue.</span>
      <span class="lang-en">This system welcomes contributions — tokens, components, architectural decisions, accessibility fixes, or documentation. Every improvement counts.</span>
    </p>
  </div>
  <a href="https://github.com/gnegreiros-ux/agentic-design-system" target="_blank" rel="noopener noreferrer" class="ds-btn primary">
    <span class="lang-fr">Voir sur GitHub</span>
    <span class="lang-en">View on GitHub</span>
  </a>
</div>`;
}

// ─── PAGE: HOME ────────────────────────────────────────────────────────────
function countAllTokens(obj) {
  let n = 0;
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith('$') || k === '_readme') continue;
    if (v && typeof v === 'object' && ('$value' in v || 'value' in v)) n++;
    else if (v && typeof v === 'object') n += countAllTokens(v);
  }
  return n;
}

function buildHome(adrs) {
  const semCount    = Object.keys(SEM).length;
  const compCount   = Object.keys(COMP).length;
  const primCount   = countAllTokens(primitives.primitive || primitives);
  const totalTokens = primCount + semCount + compCount;

  // — Redesign : illustrations PNG servies directement (pas de SVG inline — cf. perf.md)


  const body = `
<div class="rd-wrap">
<!-- ═══════════════════════════════════════════════════════════════════════════
     S1 — HERO
     Aurora existante + auroraDrift. min-height 90svh via [data-context="marketing"].
     Typographie : hero-title (60px max via token marketing).
     Boutons : agtc-button (dogfooding ADR-058, ADR-062).
════════════════════════════════════════════════════════════════════════════ -->
<section class="hero" id="accueil" aria-label="Agentica">
  <div class="hero-inner">
    <div class="hero-grid">
      <div>
        <div class="hero-badge" aria-hidden="true">
          <span class="pulse"></span>
          Human First, AI Ready
        </div>
        <h1 class="hero-title">
          <span class="lang-fr">Le système de décisions<br>pour les humains<br>et les agents IA</span>
          <span class="lang-en">The decision system<br>for humans<br>and AI agents</span>
        </h1>
        <p class="hero-tagline">
          <span class="lang-fr">Les produits numériques accumulent des milliers de décisions invisibles. Agentica les transforme en contrats structurés — compréhensibles par les humains et les agents IA, avec les humains aux commandes.</span>
          <span class="lang-en">Digital products accumulate thousands of invisible decisions. Agentica transforms those decisions into structured contracts understandable by both humans and AI agents, while keeping humans in control.</span>
        </p>
        <div class="hero-actions">
          <a href="get-started.html" class="agtc-button primary">
            <span class="lang-fr">Découvrir la vision</span>
            <span class="lang-en">Discover the vision</span>
          </a>
          <a href="foundations/index.html" class="agtc-button ghost">
            <span class="lang-fr">Explorer la documentation →</span>
            <span class="lang-en">Explore documentation →</span>
          </a>
        </div>
        <div class="rd-hero-stats" role="list" aria-label="Statistiques du système">
          <div role="listitem"><span class="rd-stat-num">${totalTokens}+</span><span class="rd-stat-label"><span class="lang-fr">tokens</span><span class="lang-en">tokens</span></span></div>
          <div role="listitem"><span class="rd-stat-num">${adrs.length}</span><span class="rd-stat-label">ADRs</span></div>
          <div role="listitem"><span class="rd-stat-num">${compCount}</span><span class="rd-stat-label"><span class="lang-fr">composants</span><span class="lang-en">components</span></span></div>
          <div role="listitem"><span class="rd-stat-num">10</span><span class="rd-stat-label"><span class="lang-fr">gates qualité</span><span class="lang-en">quality gates</span></span></div>
        </div>
      </div>
      <div class="rd-illus rd-halo" aria-hidden="true">
        <img src="img/IMG-HERO-SYSTEM.png" alt="" width="560" height="460" loading="eager" fetchpriority="high">
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S2 — LE PROBLÈME
     Asymétrique 40/60 : peu de texte, illustration dominante.
     Texte narratif — pas de liste à puces.
     Ton lourd, déclaratif.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section rd-section-alt" id="pourquoi">
  <div class="rd-inner">
    <div class="rd-grid-40-60">
      <div>
        <span class="rd-eyebrow"><span class="lang-fr">Le problème</span><span class="lang-en">The problem</span></span>
        <h2 class="rd-h2">
          <span class="lang-fr">Les équipes accumulent des décisions invisibles</span>
          <span class="lang-en">Teams accumulate invisible decisions</span>
        </h2>
        <p class="rd-narrative">
          <span class="lang-fr">Les décisions se dispersent entre Figma, GitHub, Storybook, Slack et Confluence. La dette UX s'accumule en silence. La documentation devient obsolète. Les experts deviennent indispensables. L'IA reste inaccessible.</span>
          <span class="lang-en">Decisions scatter across Figma, GitHub, Storybook, Slack and Confluence. UX debt accumulates in silence. Documentation becomes outdated. Experts become indispensable. AI remains out of reach.</span>
        </p>
      </div>
      <div class="rd-illus rd-illus-bleed-r rd-halo-pink rd-halo" aria-hidden="true">
        <img src="img/IMG-CONTEXT.png" alt="" width="600" height="500" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S3 — HUMAN FIRST, AI READY — WOW 1
     Section sombre (fond inverse). Illustration centrée large + halo teal.
     Deux cartes (Humains / Agents IA) sous l'illustration.
     Citation finale centrée comme déclaration de principe.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section rd-section-wow rd-section-monument">
  <div class="rd-inner">
    <div class="rd-center">
      <span class="rd-eyebrow">Human First, AI Ready</span>
      <h2 class="rd-h2">
        <span class="lang-fr">Conçu pour les humains. Prêt pour les agents IA.</span>
        <span class="lang-en">Designed for humans. Ready for AI agents.</span>
      </h2>
      <p class="rd-lead">
        <span class="lang-fr">Deux consommateurs. Une seule source de vérité. Zéro compromis.</span>
        <span class="lang-en">Two consumers. One single source of truth. Zero compromise.</span>
      </p>
    </div>
    <div class="rd-illus-center rd-halo" aria-hidden="true">
      <img src="img/IMG-HUMANS-AI_EN.png" alt="" width="700" height="580" loading="lazy">
    </div>
    <div class="rd-dual">
      <div class="rd-dual-card">
        <div class="rd-dual-title"><span class="lang-fr">Les humains</span><span class="lang-en">Humans</span></div>
        <ul class="rd-list check">
          <li><span class="lang-fr">Comprennent</span><span class="lang-en">Understand</span></li>
          <li><span class="lang-fr">Décident</span><span class="lang-en">Decide</span></li>
          <li><span class="lang-fr">Approuvent</span><span class="lang-en">Approve</span></li>
          <li><span class="lang-fr">Gouvernent</span><span class="lang-en">Govern</span></li>
        </ul>
      </div>
      <div class="rd-dual-card">
        <div class="rd-dual-title"><span class="lang-fr">Les agents IA</span><span class="lang-en">AI agents</span></div>
        <ul class="rd-list check">
          <li><span class="lang-fr">Détectent</span><span class="lang-en">Detect</span></li>
          <li><span class="lang-fr">Analysent</span><span class="lang-en">Analyze</span></li>
          <li><span class="lang-fr">Proposent</span><span class="lang-en">Propose</span></li>
          <li><span class="lang-fr">Automatisent</span><span class="lang-en">Automate</span></li>
        </ul>
      </div>
    </div>
    <div class="rd-center">
      <blockquote class="rd-quote">
        <span class="lang-fr">« Le dernier mot reste toujours humain. »</span>
        <span class="lang-en">"The final word always remains human."</span>
      </blockquote>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S4 — CONNAISSANCES — MOMENT CALME
     Centré, minimal. Juste le titre et une courte déclaration narrative.
     Pas de liste. L'illustration est là pour respirer, pas pour expliquer.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section">
  <div class="rd-inner">
    <div class="rd-grid-40-60">
      <div>
        <span class="rd-eyebrow"><span class="lang-fr">Connaissances</span><span class="lang-en">Knowledge</span></span>
        <h2 class="rd-h2">
          <span class="lang-fr">Les connaissances sont un actif stratégique</span>
          <span class="lang-en">Knowledge is a strategic asset</span>
        </h2>
        <p class="rd-narrative">
          <span class="lang-fr">Les frameworks évoluent. Les outils changent. Les technologies disparaissent. Les connaissances, elles, doivent survivre. Agentica les structure pour qu'elles restent lisibles demain — par les humains et les agents IA.</span>
          <span class="lang-en">Frameworks evolve. Tools change. Technologies disappear. Knowledge must survive. Agentica structures it to remain readable tomorrow — by humans and AI agents alike.</span>
        </p>
      </div>
      <div class="rd-illus rd-illus-bleed-r rd-halo rd-halo-pink" aria-hidden="true">
        <img src="img/IMG-KNOWLEDGE-ASSETS.png" alt="" width="560" height="460" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S5 — SOURCE UNIQUE DE VÉRITÉ — WOW 2
     Section monumentale centrée. Illustration pleine largeur avec halo.
     4 cartes token-flow en rang horizontal sous l'image.
     La plus grande section de la page.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section rd-section-alt rd-section-monument" id="architecture">
  <div class="rd-inner">
    <div class="rd-center">
      <span class="rd-eyebrow"><span class="lang-fr">Architecture</span><span class="lang-en">Architecture</span></span>
      <h2 class="rd-h2">
        <span class="lang-fr">Une seule source de vérité</span>
        <span class="lang-en">One source of truth</span>
      </h2>
      <p class="rd-lead">
        <span class="lang-fr">Une même source alimente plusieurs destinations. Quatre niveaux. Une seule chaîne de décisions.</span>
        <span class="lang-en">One source feeds multiple destinations. Four levels. One decision chain.</span>
      </p>
    </div>
    <div class="rd-illus-full rd-halo-violet rd-halo" aria-hidden="true">
      <img src="img/IMG-SINGLE-SOURCE.png" alt="" width="1200" height="630" loading="lazy">
    </div>
    <div class="rd-token-flow">
      <div class="rd-token-card">
        <div class="rd-token-num">01</div>
        <div class="rd-token-title"><span class="lang-fr">Fondations</span><span class="lang-en">Foundations</span></div>
        <div class="rd-token-desc"><span class="lang-fr">Couleur, typographie, espacement.</span><span class="lang-en">Color, typography, spacing.</span></div>
      </div>
      <div class="rd-token-card">
        <div class="rd-token-num">02</div>
        <div class="rd-token-title"><span class="lang-fr">Contrats sémantiques</span><span class="lang-en">Semantic contracts</span></div>
        <div class="rd-token-desc"><span class="lang-fr">L'intention, pas la valeur brute.</span><span class="lang-en">Intent, not raw values.</span></div>
      </div>
      <div class="rd-token-card">
        <div class="rd-token-num">03</div>
        <div class="rd-token-title"><span class="lang-fr">Composants</span><span class="lang-en">Components</span></div>
        <div class="rd-token-desc"><span class="lang-fr">Contrats comportementaux.</span><span class="lang-en">Behavioral contracts.</span></div>
      </div>
      <div class="rd-token-card">
        <div class="rd-token-num">04</div>
        <div class="rd-token-title"><span class="lang-fr">Applications</span><span class="lang-en">Applications</span></div>
        <div class="rd-token-desc"><span class="lang-fr">Multiples plateformes.</span><span class="lang-en">Multiple platforms.</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S6 — VALEUR PAR RÔLE
     Section plus calme. Illustration placeholder + grille de rôles.
     Placeholder IMG-PERSONAS en attente de l'illustration.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section">
  <div class="rd-inner">
    <div class="rd-center">
      <span class="rd-eyebrow"><span class="lang-fr">Pour chaque rôle</span><span class="lang-en">For every role</span></span>
      <h2 class="rd-h2">
        <span class="lang-fr">Une valeur différente pour chaque rôle</span>
        <span class="lang-en">Different value for every role</span>
      </h2>
      <p class="rd-lead">
        <span class="lang-fr">Les bénéfices sont concrets. Quelle que soit votre position dans l'équipe.</span>
        <span class="lang-en">The benefits are concrete. Whatever your position in the team.</span>
      </p>
    </div>
    <div class="rd-illus-center" aria-hidden="true">
      <div class="rd-illus-placeholder">
        <strong>IMG-PERSONAS</strong>
        <span><span class="lang-fr">Illustration à venir</span><span class="lang-en">Illustration coming soon</span></span>
      </div>
    </div>
    <div class="rd-role-grid">
      <div class="rd-role-card">
        <div class="rd-role-name"><span class="lang-fr">Organisation</span><span class="lang-en">Organization</span></div>
        <ul class="rd-role-items">
          <li><span class="lang-fr">Réduire la dette</span><span class="lang-en">Reduce debt</span></li>
          <li><span class="lang-fr">Préserver les connaissances</span><span class="lang-en">Preserve knowledge</span></li>
          <li><span class="lang-fr">Préparer l'IA</span><span class="lang-en">Prepare for AI</span></li>
        </ul>
      </div>
      <div class="rd-role-card">
        <div class="rd-role-name"><span class="lang-fr">Gestionnaires</span><span class="lang-en">Managers</span></div>
        <ul class="rd-role-items">
          <li><span class="lang-fr">Gouvernance documentée</span><span class="lang-en">Documented governance</span></li>
          <li><span class="lang-fr">Onboarding accéléré</span><span class="lang-en">Faster onboarding</span></li>
          <li><span class="lang-fr">Réduction des risques</span><span class="lang-en">Risk reduction</span></li>
        </ul>
      </div>
      <div class="rd-role-card">
        <div class="rd-role-name">Product Owners</div>
        <ul class="rd-role-items">
          <li><span class="lang-fr">Décisions explicites</span><span class="lang-en">Explicit decisions</span></li>
          <li><span class="lang-fr">Cohérence garantie</span><span class="lang-en">Consistency guaranteed</span></li>
        </ul>
      </div>
      <div class="rd-role-card">
        <div class="rd-role-name"><span class="lang-fr">Designers</span><span class="lang-en">Designers</span></div>
        <ul class="rd-role-items">
          <li><span class="lang-fr">Source unique Figma</span><span class="lang-en">Single Figma source</span></li>
          <li><span class="lang-fr">Collaboration fluide</span><span class="lang-en">Fluid collaboration</span></li>
        </ul>
      </div>
      <div class="rd-role-card">
        <div class="rd-role-name"><span class="lang-fr">Développeurs</span><span class="lang-en">Developers</span></div>
        <ul class="rd-role-items">
          <li>Web Components</li>
          <li><span class="lang-fr">Multi-framework</span><span class="lang-en">Multi-framework</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S7 — QUALITÉ — WOW 3
     Section sombre. Illustration (placeholder IMG-QUALITY-GATES) côté gauche
     avec halo violet. Texte narratif à droite. Pas de liste à puces.
     La déclaration finale doit être mémorable.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section rd-section-wow" id="qualite">
  <div class="rd-inner">
    <div class="rd-grid-60-40">
      <div class="rd-halo-violet rd-halo" aria-hidden="true">
        <div class="rd-illus-placeholder">
          <strong>IMG-QUALITY-GATES</strong>
          <span><span class="lang-fr">Illustration à venir</span><span class="lang-en">Illustration coming soon</span></span>
        </div>
      </div>
      <div>
        <span class="rd-eyebrow"><span class="lang-fr">Qualité</span><span class="lang-en">Quality</span></span>
        <h2 class="rd-h2">
          <span class="lang-fr">La qualité est une propriété du système</span>
          <span class="lang-en">Quality is built into the system</span>
        </h2>
        <p class="rd-narrative">
          <span class="lang-fr">Avant chaque changement, Agentica vérifie automatiquement l'accessibilité, les régressions visuelles, la documentation, la cohérence des ADRs et l'intégrité des tokens. La qualité n'est pas une étape finale. Elle est structurelle.</span>
          <span class="lang-en">Before every change, Agentica automatically verifies accessibility, visual regressions, documentation, ADR consistency and token integrity. Quality is not a final step. It is structural.</span>
        </p>
        <p class="rd-statement">
          <span class="lang-fr">Rien n'entre dans le système sans contrôle.</span>
          <span class="lang-en">Nothing enters the system without control.</span>
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S8 — MÉMOIRE DES DÉCISIONS — MOMENT CALME
     Centré, narratif. Pas de liste — une seule déclaration forte.
     Lien vers les ADRs comme invitation à explorer.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section rd-section-alt">
  <div class="rd-inner">
    <div class="rd-grid-40-60">
      <div>
        <span class="rd-eyebrow"><span class="lang-fr">Traçabilité</span><span class="lang-en">Traceability</span></span>
        <h2 class="rd-h2">
          <span class="lang-fr">Chaque décision possède une mémoire</span>
          <span class="lang-en">Every decision has memory</span>
        </h2>
        <p class="rd-narrative">
          <span class="lang-fr">Derrière chaque bouton, chaque couleur, chaque règle d'accessibilité se cache une décision. Agentica en préserve le contexte, les alternatives explorées, les compromis acceptés — afin que personne ne soit jamais contraint de réinventer ce qui a déjà été résolu.</span>
          <span class="lang-en">Behind every button, every color, every accessibility rule lies a decision. Agentica preserves the context, the explored alternatives, the accepted trade-offs — so nobody is ever forced to reinvent what has already been resolved.</span>
        </p>
        <p><a href="decisions/index.html" class="agtc-button secondary"><span class="lang-fr">Voir les ${adrs.length} ADRs →</span><span class="lang-en">View all ${adrs.length} ADRs →</span></a></p>
      </div>
      <div class="rd-illus rd-illus-bleed-r rd-halo rd-halo-violet" aria-hidden="true">
        <img src="img/IMG-CONTRACTS.png" alt="" width="520" height="430" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S9 — HUMAN-IN-THE-LOOP — IA
     Section sombre. Layout préservé : illustration à gauche, deux cartes à droite.
     La structure peut/ne peut pas est la seule liste conservée — elle est essentielle.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section rd-section-wow" id="ia">
  <div class="rd-inner">
    <div class="rd-grid">
      <div class="rd-illus rd-illus-bleed-l rd-halo" aria-hidden="true">
        <img src="img/IMG-HUMAN-LOOP.png" alt="" width="520" height="430" loading="lazy">
      </div>
      <div>
        <span class="rd-eyebrow"><span class="lang-fr">Intelligence artificielle</span><span class="lang-en">Artificial intelligence</span></span>
        <h2 class="rd-h2">
          <span class="lang-fr">Automatisation sans perdre le contrôle</span>
          <span class="lang-en">Automation without losing control</span>
        </h2>
        <div class="rd-dual">
          <div class="rd-dual-card">
            <div class="rd-dual-title"><span class="lang-fr">Les agents peuvent :</span><span class="lang-en">AI agents can:</span></div>
            <ul class="rd-list check">
              <li><span class="lang-fr">Générer</span><span class="lang-en">Generate</span></li>
              <li><span class="lang-fr">Détecter</span><span class="lang-en">Detect</span></li>
              <li><span class="lang-fr">Documenter</span><span class="lang-en">Document</span></li>
              <li><span class="lang-fr">Proposer</span><span class="lang-en">Propose</span></li>
            </ul>
          </div>
          <div class="rd-dual-card">
            <div class="rd-dual-title"><span class="lang-fr">Les agents ne peuvent pas :</span><span class="lang-en">AI agents cannot:</span></div>
            <ul class="rd-list">
              <li class="no"><span class="lang-fr">Approuver</span><span class="lang-en">Approve</span></li>
              <li class="no"><span class="lang-fr">Déployer</span><span class="lang-en">Deploy</span></li>
              <li class="no"><span class="lang-fr">Contourner la gouvernance</span><span class="lang-en">Bypass governance</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     S10 — DURABILITÉ — CLÔTURE NARRATIVE
     Centré, narratif, calme. Invitation à la réflexion avant le CTA.
     Pas de liste — une déclaration de principes en texte continu.
════════════════════════════════════════════════════════════════════════════ -->
<section class="rd-section">
  <div class="rd-inner">
    <div class="rd-grid-60-40">
      <div class="rd-illus rd-illus-bleed-l rd-halo" aria-hidden="true">
        <img src="img/IMG-DURABILITY.png" alt="" width="520" height="430" loading="lazy">
      </div>
      <div>
        <span class="rd-eyebrow"><span class="lang-fr">Durabilité</span><span class="lang-en">Durability</span></span>
        <h2 class="rd-h2">
          <span class="lang-fr">Construire pour aujourd'hui. Préserver pour demain.</span>
          <span class="lang-en">Build for today. Preserve for tomorrow.</span>
        </h2>
        <p class="rd-narrative">
          <span class="lang-fr">Agentica repose sur les standards ouverts du W3C. Ses composants sont des Web Components natifs, portables, indépendants des frameworks. Ses décisions survivent aux outils. Ses connaissances restent accessibles, quelle que soit la technologie de demain.</span>
          <span class="lang-en">Agentica is built on W3C open standards. Its components are native Web Components — portable, framework-independent. Its decisions outlive the tools. Its knowledge remains accessible, whatever tomorrow's technology brings.</span>
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════════════════
     CTA FINAL — même atmosphère que le hero
     IMG-AGENTICA centré. Invitation à démarrer.
════════════════════════════════════════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-inner">
    <div class="rd-cta-inner">
      <span class="rd-eyebrow">Agentica</span>
      <h2 class="hero-title">
        <span class="lang-fr">Prêt à explorer Agentica ?</span>
        <span class="lang-en">Ready to explore Agentica?</span>
      </h2>
      <div class="rd-illus-center" aria-hidden="true">
        <img src="img/IMG-AGENTICA.png" alt="" width="400" height="300" loading="lazy">
      </div>
      <p class="rd-lead">
        <span class="lang-fr">Transformez les décisions en connaissances durables — compréhensibles par les humains et les agents IA.</span>
        <span class="lang-en">Transform decisions into durable knowledge understandable by humans and AI agents.</span>
      </p>
      <div class="rd-cta-actions">
        <a href="get-started.html" class="agtc-button primary"><span class="lang-fr">Démarrer</span><span class="lang-en">Get started</span></a>
        <a href="components/index.html" class="agtc-button ghost"><span class="lang-fr">Voir les composants →</span><span class="lang-en">View components →</span></a>
        <a href="https://github.com/gnegreiros-ux/agentic-design-system" target="_blank" rel="noopener noreferrer" class="agtc-button ghost">GitHub →</a>
      </div>
    </div>
  </div>
</section>

</div><!-- /rd-wrap -->

<!-- Navigation documentation — conservée pour le SEO et les agents -->
<nav class="rd-doc-nav" aria-label="Documentation">
  <a href="foundations/index.html"><span class="lang-fr">Fondations</span><span class="lang-en">Foundations</span></a> ·
  <a href="components/index.html"><span class="lang-fr">Composants</span><span class="lang-en">Components</span></a> ·
  <a href="tokens/index.html">Tokens</a> ·
  <a href="decisions/index.html"><span class="lang-fr">Décisions</span><span class="lang-en">Decisions</span></a> ·
  <a href="agents/index.html"><span class="lang-fr">Agents IA</span><span class="lang-en">AI Agents</span></a> ·
  <a href="pipelines/index.html">Pipelines</a>
</nav>

`;

  write(path.join(DIST, 'index.html'), layout({ title: 'Accueil', pageTitle: 'Agentica — Le système de décisions pour les humains et les agents IA', depth: 0, fullWidth: true, context: 'marketing', body }));
}

// ─── PAGE: FOUNDATIONS INDEX ─────────────────────────────────────────────────
function buildFoundationsIndex() {
  const body = `
<h1><span class="lang-fr">Fondations</span><span class="lang-en">Foundations</span></h1>
<p class="page-lead">
  <span class="lang-fr">Les fondations définissent les décisions visuelles de base du système : couleur, espacement, typographie et iconographie. Elles servent de socle à tous les composants et tokens sémantiques.</span>
  <span class="lang-en">Foundations define the system's core visual decisions: color, spacing, typography and iconography. They form the base for all components and semantic tokens.</span>
</p>

<h2 class="first"><span class="lang-fr">Catalogue</span><span class="lang-en">Catalog</span></h2>
<div class="nav-grid">
  <a href="color.html" class="nav-card">
    <span class="nav-card-icon">${icon('palette', 24)}</span>
    <div class="nav-card-title"><span class="lang-fr">Couleur</span><span class="lang-en">Color</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Échelles Radix 12 niveaux, tokens sémantiques, modes clair et sombre, contrastes WCAG.</span>
      <span class="lang-en">Radix 12-step scales, semantic tokens, light and dark modes, WCAG contrast.</span>
    </div>
  </a>
  <a href="spacing.html" class="nav-card">
    <span class="nav-card-icon">${icon('move-horizontal', 24)}</span>
    <div class="nav-card-title"><span class="lang-fr">Espacement</span><span class="lang-en">Spacing</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Grille de 4px, densités compact/default/spacious, tokens de contrôle et de mise en page.</span>
      <span class="lang-en">4px grid, compact/default/spacious densities, control and layout tokens.</span>
    </div>
  </a>
  <a href="typography.html" class="nav-card">
    <span class="nav-card-icon">${icon('type', 24)}</span>
    <div class="nav-card-title"><span class="lang-fr">Typographie</span><span class="lang-en">Typography</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Atkinson Hyperlegible — échelle de taille, poids, interligne, règles d'accessibilité.</span>
      <span class="lang-en">Atkinson Hyperlegible — size scale, weight, line-height, accessibility rules.</span>
    </div>
  </a>
  <a href="icons.html" class="nav-card">
    <span class="nav-card-icon">${icon('star', 24)}</span>
    <div class="nav-card-title"><span class="lang-fr">Icônes</span><span class="lang-en">Icons</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Bibliothèque Lucide — 1 500+ icônes, 3 tailles, règles WCAG 1.1.1 et contrat d'accessibilité.</span>
      <span class="lang-en">Lucide library — 1,500+ icons, 3 sizes, WCAG 1.1.1 rules and accessibility contract.</span>
    </div>
  </a>
  <a href="contextes.html" class="nav-card">
    <span class="nav-card-icon">${icon('layers', 24)}</span>
    <div class="nav-card-title"><span class="lang-fr">Contextes d'utilisation</span><span class="lang-en">Usage Contexts</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Mode Produit vs Mode Marketing — tokens dédiés, règles d'espacement et anti-patterns éditoriaux.</span>
      <span class="lang-en">Product Mode vs Marketing Mode — dedicated tokens, spacing rules and editorial anti-patterns.</span>
    </div>
  </a>
</div>
`;

  write(path.join(DIST, 'foundations/index.html'), layout({
    title: 'Fondations', depth: 1,
    sidebar: sidebarFoundations('../','index.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: COLOR ────────────────────────────────────────────────────────────
function buildColor() {
  const semanticColors = [
    ['color-action-primary',         'color.action.primary',         SEM['color-action-primary'],         '<span class="lang-fr">Action principale — CTA, bouton primaire</span><span class="lang-en">Primary action — CTA, primary button</span>'],
    ['color-action-primary-hover',   'color.action.primary-hover',   SEM['color-action-primary-hover'],   '<span class="lang-fr">État survol de l\'action principale</span><span class="lang-en">Primary action hover state</span>'],
    ['color-action-primary-disabled','color.action.primary-disabled',SEM['color-action-primary-disabled'],'<span class="lang-fr">Action principale désactivée</span><span class="lang-en">Disabled primary action</span>'],
    ['color-feedback-danger',        'color.feedback.danger',        SEM['color-feedback-danger'],        '<span class="lang-fr">Erreur, action destructrice, alerte critique</span><span class="lang-en">Error, destructive action, critical alert</span>'],
    ['color-feedback-danger-subtle', 'color.feedback.danger-subtle', SEM['color-feedback-danger-subtle'], '<span class="lang-fr">Fond subtil pour état danger</span><span class="lang-en">Subtle background for danger state</span>'],
    ['color-feedback-success',       'color.feedback.success',       SEM['color-feedback-success'],       '<span class="lang-fr">Confirmation, succès, validation</span><span class="lang-en">Confirmation, success, validation</span>'],
    ['color-feedback-info',          'color.feedback.info',          SEM['color-feedback-info'],          '<span class="lang-fr">Information neutre, aide contextuelle</span><span class="lang-en">Neutral information, contextual help</span>'],
    ['color-background-page',            'color.background.page',            SEM['color-background-page'],            '<span class="lang-fr">Fond de page principale</span><span class="lang-en">Main page background</span>'],
    ['color-background-surface',         'color.background.surface',         SEM['color-background-surface'],         '<span class="lang-fr">Fond de carte, panneau, modal</span><span class="lang-en">Card, panel, modal background</span>'],
    ['color-background-subtle',          'color.background.subtle',          SEM['color-background-subtle'],          '<span class="lang-fr">Fond secondaire, survol discret</span><span class="lang-en">Secondary background, subtle hover</span>'],
    ['color-background-hover',           'color.background.hover',           SEM['color-background-hover'],           '<span class="lang-fr">Fond au survol</span><span class="lang-en">Hover background</span>'],
    ['color-background-inverse',         'color.background.inverse',         SEM['color-background-inverse'],         '<span class="lang-fr">Fond sombre inversé — hero, footer, sections dark</span><span class="lang-en">Dark inverse background — hero, footer, dark sections</span>'],
    ['color-background-inverse-raised',  'color.background.inverse-raised',  SEM['color-background-inverse-raised'],  '<span class="lang-fr">Fond sombre élevé — tooltips, popovers sur fond inverse</span><span class="lang-en">Raised dark surface — tooltips, popovers on inverse bg</span>'],
    ['color-background-code',            'color.background.code',            SEM['color-background-code'],            '<span class="lang-fr">Fond des blocs de code</span><span class="lang-en">Code block background</span>'],
    ['color-background-code-raised',     'color.background.code-raised',     SEM['color-background-code-raised'],     '<span class="lang-fr">Fond code élevé — inline code sur surface</span><span class="lang-en">Raised code background — inline code on surface</span>'],
    ['color-text-primary',               'color.text.primary',               SEM['color-text-primary'],               '<span class="lang-fr">Texte principal, haute lisibilité</span><span class="lang-en">Primary text, high readability</span>'],
    ['color-text-secondary',             'color.text.secondary',             SEM['color-text-secondary'],             '<span class="lang-fr">Texte secondaire, labels, métadonnées</span><span class="lang-en">Secondary text, labels, metadata</span>'],
    ['color-text-disabled',              'color.text.disabled',              SEM['color-text-disabled'],              '<span class="lang-fr">Texte désactivé</span><span class="lang-en">Disabled text</span>'],
    ['color-text-on-action',             'color.text.on-action',             SEM['color-text-on-action'],             '<span class="lang-fr">Texte sur fond d\'action — boutons</span><span class="lang-en">Text on action background — buttons</span>'],
    ['color-text-on-inverse',            'color.text.on-inverse',            SEM['color-text-on-inverse'],            '<span class="lang-fr">Texte principal sur fond inversé (hero, footer)</span><span class="lang-en">Primary text on inverse background (hero, footer)</span>'],
    ['color-text-on-inverse-muted',      'color.text.on-inverse-muted',      SEM['color-text-on-inverse-muted'],      '<span class="lang-fr">Texte atténué sur fond inversé — métadonnées sombres</span><span class="lang-en">Muted text on inverse background — dark metadata</span>'],
    ['color-text-on-inverse-secondary',  'color.text.on-inverse-secondary',  SEM['color-text-on-inverse-secondary'],  '<span class="lang-fr">Texte secondaire sur fond inversé</span><span class="lang-en">Secondary text on inverse background</span>'],
    ['color-text-on-danger',             'color.text.on-danger',             SEM['color-text-on-danger'],             '<span class="lang-fr">Texte sur fond danger</span><span class="lang-en">Text on danger background</span>'],
    ['color-text-on-code',               'color.text.on-code',               SEM['color-text-on-code'],               '<span class="lang-fr">Texte sur fond code</span><span class="lang-en">Text on code background</span>'],
    ['color-text-on-code-muted',         'color.text.on-code-muted',         SEM['color-text-on-code-muted'],         '<span class="lang-fr">Texte atténué sur fond code</span><span class="lang-en">Muted text on code background</span>'],
    ['color-border-default',             'color.border.default',             SEM['color-border-default'],             '<span class="lang-fr">Bordure standard</span><span class="lang-en">Default border</span>'],
    ['color-border-strong',              'color.border.strong',              SEM['color-border-strong'],              '<span class="lang-fr">Bordure accentuée — séparateurs importants</span><span class="lang-en">Strong border — important separators</span>'],
    ['color-border-focus',               'color.border.focus',               SEM['color-border-focus'],               '<span class="lang-fr">Bordure focus — accessibilité clavier</span><span class="lang-en">Focus border — keyboard accessibility</span>'],
    ['color-border-danger',              'color.border.danger',              SEM['color-border-danger'],              '<span class="lang-fr">Bordure état erreur</span><span class="lang-en">Error state border</span>'],
    ['color-feedback-warning',           'color.feedback.warning',           SEM['color-feedback-warning'],           '<span class="lang-fr">Avertissement, attention requise</span><span class="lang-en">Warning, attention required</span>'],
    ['color-feedback-warning-subtle',    'color.feedback.warning-subtle',    SEM['color-feedback-warning-subtle'],    '<span class="lang-fr">Fond subtil avertissement</span><span class="lang-en">Subtle warning background</span>'],
    ['color-feedback-warning-text',      'color.feedback.warning-text',      SEM['color-feedback-warning-text'],      '<span class="lang-fr">Texte avertissement accessible</span><span class="lang-en">Accessible warning text</span>'],
    ['color-feedback-info-subtle',       'color.feedback.info-subtle',       SEM['color-feedback-info-subtle'],       '<span class="lang-fr">Fond subtil information</span><span class="lang-en">Subtle info background</span>'],
    ['color-feedback-info-border',       'color.feedback.info-border',       SEM['color-feedback-info-border'],       '<span class="lang-fr">Bordure état info</span><span class="lang-en">Info state border</span>'],
    ['color-feedback-info-text',         'color.feedback.info-text',         SEM['color-feedback-info-text'],         '<span class="lang-fr">Texte info accessible</span><span class="lang-en">Accessible info text</span>'],
    ['color-feedback-success-subtle',    'color.feedback.success-subtle',    SEM['color-feedback-success-subtle'],    '<span class="lang-fr">Fond subtil succès</span><span class="lang-en">Subtle success background</span>'],
    ['color-feedback-success-border',    'color.feedback.success-border',    SEM['color-feedback-success-border'],    '<span class="lang-fr">Bordure état succès</span><span class="lang-en">Success state border</span>'],
    ['color-feedback-danger-border',     'color.feedback.danger-border',     SEM['color-feedback-danger-border'],     '<span class="lang-fr">Bordure état danger</span><span class="lang-en">Danger state border</span>'],
    ['color-illustration-ink',           'color.illustration.ink',           SEM['color-illustration-ink'],           '<span class="lang-fr">Encre illustration — tracés et icons decoratifs</span><span class="lang-en">Illustration ink — decorative strokes and icons</span>'],
  ].filter(([, , v]) => v);

  const brandColors = [
    ['color-brand-primary',         'color.brand.primary',         SEM['color-brand-primary'],         '<span class="lang-fr">Couleur principale de la marque — Teal</span><span class="lang-en">Primary brand color — Teal</span>'],
    ['color-brand-primary-hover',   'color.brand.primary-hover',   SEM['color-brand-primary-hover'],   '<span class="lang-fr">Survol de la couleur principale</span><span class="lang-en">Primary brand hover</span>'],
    ['color-brand-primary-subtle',  'color.brand.primary-subtle',  SEM['color-brand-primary-subtle'],  '<span class="lang-fr">Fond subtil teal — badges, chips</span><span class="lang-en">Subtle teal background — badges, chips</span>'],
    ['color-brand-primary-text',    'color.brand.primary-text',    SEM['color-brand-primary-text'],    '<span class="lang-fr">Texte teal sur fond clair — WCAG AA</span><span class="lang-en">Teal text on light background — WCAG AA</span>'],
    ['color-brand-accent',          'color.brand.accent',          SEM['color-brand-accent'],          '<span class="lang-fr">Couleur accent — Rose-corail (CTA secondaire, highlights)</span><span class="lang-en">Accent color — Rose-coral (secondary CTA, highlights)</span>'],
    ['color-brand-accent-hover',    'color.brand.accent-hover',    SEM['color-brand-accent-hover'],    '<span class="lang-fr">Survol de l\'accent</span><span class="lang-en">Accent hover</span>'],
    ['color-brand-accent-subtle',   'color.brand.accent-subtle',   SEM['color-brand-accent-subtle'],   '<span class="lang-fr">Fond subtil accent — badges version</span><span class="lang-en">Subtle accent background — version badges</span>'],
    ['color-brand-accent-text',     'color.brand.accent-text',     SEM['color-brand-accent-text'],     '<span class="lang-fr">Texte accent — 7.1:1 WCAG AA+</span><span class="lang-en">Accent text — 7.1:1 WCAG AA+</span>'],
    ['color-brand-secondary',       'color.brand.secondary',       SEM['color-brand-secondary'],       '<span class="lang-fr">Couleur secondaire — Bordeaux (tags éditoriaux, type ADR)</span><span class="lang-en">Secondary brand color — Bordeaux (editorial tags, ADR type)</span>'],
    ['color-brand-secondary-hover', 'color.brand.secondary-hover', SEM['color-brand-secondary-hover'], '<span class="lang-fr">Survol de la couleur secondaire</span><span class="lang-en">Secondary brand hover</span>'],
    ['color-brand-secondary-text',  'color.brand.secondary-text',  SEM['color-brand-secondary-text'],  '<span class="lang-fr">Texte secondaire bordeaux — haute lisibilité</span><span class="lang-en">Bordeaux secondary text — high readability</span>'],
  ].filter(([, , v]) => v);

  const palette = Object.entries(COLOR_SCALES).map(([scale, steps]) => {
    const swatches = Object.entries(steps).map(([step, { value, desc }]) =>
      `<div class="palette-step" role="img" style="background:${value}" title="${step}: ${value} — ${desc}" aria-label="${scale} étape ${step}: ${value}"></div>`
    ).join('');
    return `<div class="palette-section"><div class="palette-scale-name">${scale}</div><div class="palette-steps">${swatches}</div></div>`;
  }).join('');

  const semRows = semanticColors.map(([key, name, value, intent]) => `
<tr class="token-row">
  <td><div class="color-chip"><span class="color-swatch" style="background:${value};border:1px solid var(--agtc-semantic-color-border-swatch)" aria-hidden="true"></span></div></td>
  <td><code>--agtc-semantic-${key}</code></td>
  <td class="mono-sm">${value}</td>
  <td>${intent}</td>
</tr>`).join('');

  const body = `
<h1><span class="lang-fr">Couleurs</span><span class="lang-en">Colors</span></h1>
<p class="page-lead">
  <span class="lang-fr">Système de couleur en trois niveaux : palettes primitives Radix UI → intentions sémantiques → contrats de composant. Les agents utilisent les tokens sémantiques, jamais les valeurs primitives.</span>
  <span class="lang-en">Three-level color system: Radix UI primitive palettes → semantic intentions → component contracts. Agents use semantic tokens, never primitive values.</span>
</p>

<h2 class="first"><span class="lang-fr">Palette primitive — Radix UI</span><span class="lang-en">Primitive palette — Radix UI</span></h2>
<p>
  <span class="lang-fr">${Object.keys(COLOR_SCALES).length} échelles de couleur, chacune avec <strong>12 paliers numérotés</strong> selon un système perceptuellement uniforme, conçu pour l'accessibilité et le mode sombre.</span>
  <span class="lang-en">${Object.keys(COLOR_SCALES).length} color scales, each with <strong>12 numbered steps</strong> following a perceptually uniform system designed for accessibility and dark mode.</span>
</p>

<div class="radix-guide" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 28px">
  <div class="step-card">
    <div class="step-card-label"><span class="lang-fr">Paliers 1–2</span><span class="lang-en">Steps 1–2</span></div>
    <div class="step-card-title"><span class="lang-fr">Fonds de page</span><span class="lang-en">Page backgrounds</span></div>
    <div class="step-card-body"><span class="lang-fr">Arrière-plans très subtils, quasi-blanc</span><span class="lang-en">Very subtle backgrounds, near-white</span></div>
  </div>
  <div class="step-card">
    <div class="step-card-label"><span class="lang-fr">Paliers 3–5</span><span class="lang-en">Steps 3–5</span></div>
    <div class="step-card-title"><span class="lang-fr">Éléments interactifs</span><span class="lang-en">Interactive elements</span></div>
    <div class="step-card-body"><span class="lang-fr">Survol, sélection, fonds de composants</span><span class="lang-en">Hover, selection, component backgrounds</span></div>
  </div>
  <div class="step-card">
    <div class="step-card-label"><span class="lang-fr">Paliers 6–8</span><span class="lang-en">Steps 6–8</span></div>
    <div class="step-card-title"><span class="lang-fr">Bordures</span><span class="lang-en">Borders</span></div>
    <div class="step-card-body"><span class="lang-fr">Séparateurs, contours de champs, dividers</span><span class="lang-en">Separators, field outlines, dividers</span></div>
  </div>
  <div class="step-card">
    <div class="step-card-label"><span class="lang-fr">Paliers 9–12</span><span class="lang-en">Steps 9–12</span></div>
    <div class="step-card-title"><span class="lang-fr">Solides & texte</span><span class="lang-en">Solids & text</span></div>
    <div class="step-card-body"><span class="lang-fr">CTA, texte haute lisibilité, contraste garanti</span><span class="lang-en">CTA, high-readability text, guaranteed contrast</span></div>
  </div>
</div>

<blockquote><p>
  <span class="lang-fr"><strong>Pourquoi Radix UI ?</strong> Chaque palette est testée pour garantir un contraste WCAG AA aux paliers 11–12, et conçue pour fonctionner en mode clair et sombre sans surcharge de tokens. Les paliers sont perceptuellement uniformes — le saut visuel entre deux paliers consécutifs est constant quelle que soit la teinte.</span>
  <span class="lang-en"><strong>Why Radix UI?</strong> Each palette is tested to guarantee WCAG AA contrast at steps 11–12, and designed to work in light and dark mode without token overhead. Steps are perceptually uniform — the visual jump between two consecutive steps is constant regardless of hue.</span>
</p></blockquote>

<div class="palette-grid">${palette}</div>

<h2><span class="lang-fr">Couleurs de marque</span><span class="lang-en">Brand colors</span></h2>
<p>
  <span class="lang-fr">Trois palettes de marque — Teal (primaire), Rose-corail (accent), Bordeaux (secondaire). Toujours consommées via les tokens sémantiques <code>color.brand.*</code>, jamais en valeur brute.</span>
  <span class="lang-en">Three brand palettes — Teal (primary), Rose-coral (accent), Bordeaux (secondary). Always consumed via <code>color.brand.*</code> semantic tokens, never as raw values.</span>
</p>
<div class="token-section">
<table class="token-table"><colgroup><col style="width:8%"><col style="width:44%"><col style="width:16%"><col style="width:32%"></colgroup>
  <thead><tr><th><span class="lang-fr">Couleur</span><span class="lang-en">Color</span></th><th>Token CSS</th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Intention</span><span class="lang-en">Intent</span></th></tr></thead>
  <tbody>${brandColors.map(([key, name, value, intent]) => `
<tr class="token-row">
  <td><div class="color-chip"><span class="color-swatch" style="background:${value};border:1px solid var(--agtc-semantic-color-border-swatch)" aria-hidden="true"></span></div></td>
  <td><code>--agtc-semantic-${key}</code></td>
  <td class="mono-sm">${value}</td>
  <td>${intent}</td>
</tr>`).join('')}</tbody>
</table>
</div>

<h2><span class="lang-fr">Tokens sémantiques UI</span><span class="lang-en">UI semantic tokens</span></h2>
<p>
  <span class="lang-fr">Ces ${semanticColors.length} tokens encodent les intentions UX. Chaque composant les référence — jamais les primitives directement.</span>
  <span class="lang-en">These ${semanticColors.length} tokens encode UX intentions. Every component references them — never the primitives directly.</span>
</p>
<input class="explorer-search" type="search" id="token-search" placeholder="Rechercher un token… / Search a token…" aria-label="Rechercher un token sémantique" autocomplete="off" spellcheck="false">
<p class="token-search-status" id="token-search-status" aria-live="polite" aria-atomic="true"></p>
<div class="token-section">
<table class="token-table"><colgroup><col style="width:8%"><col style="width:44%"><col style="width:16%"><col style="width:32%"></colgroup>
  <thead><tr><th><span class="lang-fr">Couleur</span><span class="lang-en">Color</span></th><th>Token CSS</th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Intention</span><span class="lang-en">Intent</span></th></tr></thead>
  <tbody>${semRows}</tbody>
</table>
</div>

<blockquote><p>
  <span class="lang-fr">Les agents comprennent <code>color.action.primary</code> comme une intention. Ils ne comprennent pas <code>${SEM['color-action-primary']}</code> comme une intention — c'est juste une valeur.</span>
  <span class="lang-en">Agents understand <code>color.action.primary</code> as an intention. They do not understand <code>${SEM['color-action-primary']}</code> as an intention — it is just a value.</span>
</p></blockquote>
`;

  write(path.join(DIST, 'foundations/color.html'), layout({
    title: 'Couleur', depth: 1,
    sidebar: sidebarFoundations('../','color.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: SPACING ──────────────────────────────────────────────────────────
function buildSpacing() {
  const semTokens = [
    ['space-control-padding-x', 'semantic.space.control.padding-x', SEM['space-control-padding-x'], '<span class="lang-fr">Padding horizontal des contrôles interactifs</span><span class="lang-en">Horizontal padding for interactive controls</span>'],
    ['space-control-padding-y', 'semantic.space.control.padding-y', SEM['space-control-padding-y'], '<span class="lang-fr">Padding vertical des contrôles interactifs</span><span class="lang-en">Vertical padding for interactive controls</span>'],
    ['space-control-gap',       'semantic.space.control.gap',       SEM['space-control-gap'],       '<span class="lang-fr">Écart interne (icône + label dans un contrôle)</span><span class="lang-en">Internal gap (icon + label inside a control)</span>'],
    ['space-layout-section',    'semantic.space.layout.section',    SEM['space-layout-section'],    '<span class="lang-fr">Séparation entre sections de page</span><span class="lang-en">Spacing between page sections</span>'],
    ['space-layout-component',  'semantic.space.layout.component',  SEM['space-layout-component'],  '<span class="lang-fr">Séparation entre composants</span><span class="lang-en">Spacing between components</span>'],
    ['radius-control',          'semantic.radius.control',          SEM['radius-control'],          '<span class="lang-fr">Rayon pour contrôles interactifs</span><span class="lang-en">Radius for interactive controls</span>'],
    ['radius-card',             'semantic.radius.card',             SEM['radius-card'],             '<span class="lang-fr">Rayon pour conteneurs (cartes, panneaux)</span><span class="lang-en">Radius for containers (cards, panels)</span>'],
  ];
  const primitives4px = [
    ['1',  '4px',  'Micro'],
    ['2',  '8px',  'Petit'],
    ['3',  '12px', ''],
    ['4',  '16px', 'Standard'],
    ['5',  '20px', ''],
    ['6',  '24px', ''],
    ['8',  '32px', 'Grand'],
    ['10', '40px', ''],
    ['12', '48px', 'Macro'],
    ['16', '64px', 'Macro XL'],
  ];
  const bars = primitives4px.map(([step, px, label]) =>
    `<div class="space-item"><div class="space-label"><code>space.${step}</code></div><div class="space-bar" role="img" style="width:${px}" aria-label="${px}"></div><strong style="font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)">${px}</strong>${label ? `<span style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);margin-left:4px">${label}</span>` : ''}</div>`
  ).join('');
  const semRows = semTokens.map(([k, name, v, i]) => `<tr class="token-row"><td><code>--agtc-semantic-${k}</code></td><td><code>${name}</code></td><td style="font-family:var(--agtc-font-mono)">${v}</td><td>${i}</td></tr>`).join('');

  const body = `
<h1><span class="lang-fr">Espacement</span><span class="lang-en">Spacing</span></h1>
<p class="page-lead">
  <span class="lang-fr">Toute valeur dimensionnelle est un multiple de <strong>4px</strong>. L'échelle compte 10 échelons (4px → 64px). Jamais de valeur en dur — toujours via un token sémantique.</span>
  <span class="lang-en">Every dimension is a multiple of <strong>4px</strong>. The scale has 10 steps (4px → 64px). No hardcoded values — always via a semantic token.</span>
</p>

<h2 class="first"><span class="lang-fr">Grille 4px — échelle primitive</span><span class="lang-en">4px grid — primitive scale</span></h2>
<p>
  <span class="lang-fr">Module de base : <code>4px</code>. Toute valeur hors de cette échelle est une dérive.</span>
  <span class="lang-en">Base unit: <code>4px</code>. Any value outside this scale is a drift.</span>
</p>
<div class="demo-box"><div class="space-demo">${bars}</div></div>

<h2><span class="lang-fr">Tokens sémantiques</span><span class="lang-en">Semantic tokens</span></h2>
<p>
  <span class="lang-fr">Les composants utilisent exclusivement ces tokens — jamais les primitifs directement.</span>
  <span class="lang-en">Components exclusively use these tokens — never primitives directly.</span>
</p>
<table class="token-table"><colgroup><col style="width:42%"><col style="width:28%"><col style="width:14%"><col style="width:16%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Intention</span><span class="lang-en">Intent</span></th></tr></thead>
  <tbody>${semRows}</tbody>
</table>

<h2><span class="lang-fr">Densité — math tokens</span><span class="lang-en">Density — math tokens</span></h2>
<p>
  <span class="lang-fr">Trois modes calculés via <strong>math tokens</strong> (Sam's Math Equations, Tokens Studio). L'arrondi <code>floor()</code>/<code>ceil()</code> garantit l'alignement 4px quel que soit le facteur. Voir <a href="../decisions/index.html">ADR-025</a>.</span>
  <span class="lang-en">Three modes computed via <strong>math tokens</strong> (Sam's Math Equations, Tokens Studio). <code>floor()</code>/<code>ceil()</code> rounding guarantees 4px alignment regardless of the factor. See <a href="../decisions/index.html">ADR-025</a>.</span>
</p>
<div class="demo-box" style="padding:16px 24px">
  <div class="density-grid">
    <div class="density-card">
      <div class="density-card-label">compact — ×0.75</div>
      <div class="density-card-desc"><span class="lang-fr">Dashboards, tableaux, outils pro</span><span class="lang-en">Dashboards, tables, pro tools</span></div>
      <div class="density-card-formula">
        <div class="density-card-bar" style="width:12px"></div>
        <span class="density-card-math">floor(16 × 0.75 / 4) × 4 = 12px</span>
      </div>
    </div>
    <div class="density-card active">
      <div class="density-card-label active">normal — ×1.0</div>
      <div class="density-card-desc"><span class="lang-fr">Formulaires, settings, SaaS quotidien</span><span class="lang-en">Forms, settings, everyday SaaS</span></div>
      <div class="density-card-formula">
        <div class="density-card-bar" style="width:16px"></div>
        <span class="density-card-math">16px (valeur primitive directe)</span>
      </div>
    </div>
    <div class="density-card">
      <div class="density-card-label">comfortable — ×1.25</div>
      <div class="density-card-desc"><span class="lang-fr">Marketing, onboarding, lecture</span><span class="lang-en">Marketing, onboarding, reading</span></div>
      <div class="density-card-formula">
        <div class="density-card-bar" style="width:20px"></div>
        <span class="density-card-math">ceil(16 × 1.25 / 4) × 4 = 20px</span>
      </div>
    </div>
  </div>
  <blockquote>
    <p>
      <span class="lang-fr"><code>floor(valeur × facteur / 4) × 4</code> — compact utilise floor(), comfortable utilise ceil(). Voir ADR-020 + ADR-025.</span>
      <span class="lang-en"><code>floor(value × factor / 4) × 4</code> — compact uses floor(), comfortable uses ceil(). See ADR-020 + ADR-025.</span>
    </p>
  </blockquote>
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>padding: 16px</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-semantic-space-control-padding-x)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>margin: 32px</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-semantic-space-layout-section)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>var(--agtc-primitive-space-4)</code> <span class="lang-fr">dans un composant — passer par le token sémantique</span><span class="lang-en">in a component — use the semantic token instead</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Valeur hors-grille :</span><span class="lang-en">Off-grid value:</span> <code>14px</code>, <code>18px</code>, <code>22px</code> — <span class="lang-fr">choisir l'échelon le plus proche</span><span class="lang-en">choose the closest step</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours via CSS Custom Properties référençant un token sémantique</span><span class="lang-en">Always via CSS Custom Properties referencing a semantic token</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Si aucun token sémantique ne correspond, en créer un (PR requise)</span><span class="lang-en">If no semantic token matches, create one (PR required)</span></li>
</ul>
`;

  write(path.join(DIST, 'foundations/spacing.html'), layout({
    title: 'Espacement', depth: 1,
    sidebar: sidebarFoundations('../','spacing.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: TYPOGRAPHY ───────────────────────────────────────────────────────
function buildTypography() {
  const fontFamily = SEM['typography-fontFamily'] || "'Atkinson Hyperlegible', system-ui, sans-serif";

  // Échelle Minor Third (ratio 1.200) — ADR-023
  const scaleSteps = [
    { step: '5xl',  px: '48px', rem: '3rem',    role: 'Hero display',    lh: '1.0',  weight: 700 },
    { step: '4xl',  px: '40px', rem: '2.5rem',  role: 'Heading 1',       lh: '1.0',  weight: 700 },
    { step: '3xl',  px: '32px', rem: '2rem',    role: 'Heading 2',       lh: '1.0',  weight: 700 },
    { step: '2xl',  px: '28px', rem: '1.75rem', role: 'Heading 3',       lh: '1.1',  weight: 700 },
    { step: 'xl',   px: '24px', rem: '1.5rem',  role: 'Heading 4',       lh: '1.1',  weight: 700 },
    { step: 'lg',   px: '20px', rem: '1.25rem', role: 'Heading 5',       lh: '1.1',  weight: 700 },
    { step: 'base', px: '16px', rem: '1rem',    role: 'Body',            lh: '1.6',  weight: 400 },
    { step: 'sm',   px: '14px', rem: '0.875rem',role: 'Label / metadata', lh: '1.6',  weight: 400 },
    { step: 'xs',   px: '12px', rem: '0.75rem', role: 'Detail / caption', lh: '1.6',  weight: 400 },
  ];
  const scaleRows = scaleSteps.map(({ step, px, rem, role, lh, weight }) =>
    `<tr class="token-row">
      <td><code>fontSize.${step}</code></td>
      <td style="font-family:var(--agtc-font-mono)">${rem} <span style="color:var(--agtc-semantic-color-text-secondary);font-size:var(--agtc-semantic-typography-detail-size)">(${px})</span></td>
      <td style="font-family:var(--agtc-font-mono)">${lh}</td>
      <td style="font-family:var(--agtc-font-mono)">${weight}</td>
      <td style="color:var(--agtc-semantic-color-text-secondary)">${role}</td>
    </tr>`
  ).join('');

  const scaleSpecimens = scaleSteps.map(({ step, rem, role, lh, weight }) =>
    `<div style="display:flex;align-items:baseline;gap:16px;padding:10px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default)">
      <code style="min-width:56px;font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);flex-shrink:0">${step}</code>
      <div style="font-size:${rem};font-weight:${weight};line-height:${lh};color:var(--agtc-semantic-color-text-primary)">${role}</div>
      <span style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);margin-left:auto;flex-shrink:0">${rem} · lh ${lh}</span>
    </div>`
  ).join('');

  const body = `
<h1><span class="lang-fr">Typographie</span><span class="lang-en">Typography</span></h1>
<p class="page-lead">
  <span class="lang-fr">Police principale : <strong>Atkinson Hyperlegible</strong> — conçue pour la basse vision. Échelle <strong>Minor Third</strong> (ratio 1.200, 9 échelons xs→5xl) arrondie au multiple de 4px. Trois modes de line-height : <code>reading</code> (1.6), <code>heading</code> (1.1), <code>display</code> (1.0). Voir <a href="../decisions/index.html">ADR-023</a>.</span>
  <span class="lang-en">Primary typeface: <strong>Atkinson Hyperlegible</strong> — designed for low vision. <strong>Minor Third</strong> scale (ratio 1.200, 9 steps xs→5xl) rounded to 4px multiples. Three line-height modes: <code>reading</code> (1.6), <code>heading</code> (1.1), <code>display</code> (1.0). See <a href="../decisions/index.html">ADR-023</a>.</span>
</p>

<h2 class="first"><span class="lang-fr">Police — Atkinson Hyperlegible</span><span class="lang-en">Typeface — Atkinson Hyperlegible</span></h2>
<div class="demo-box" style="padding:24px 28px">
  <p style="font-size:13px;color:var(--agtc-semantic-color-text-secondary);margin-bottom:16px"><code>--agtc-semantic-typography-fontFamily</code></p>
  <div style="font-size:28px;font-weight:var(--agtc-semantic-fontWeight-bold);letter-spacing:var(--agtc-tracking-heading);line-height:1.3;color:var(--agtc-semantic-color-text-primary);word-break:break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
  <div style="font-size:28px;line-height:1.3;color:var(--agtc-semantic-color-text-secondary);word-break:break-all;margin-top:4px">abcdefghijklmnopqrstuvwxyz</div>
  <div style="font-size:24px;line-height:1.4;color:var(--agtc-semantic-color-text-primary);margin-top:8px;font-weight:var(--agtc-semantic-fontWeight-bold)">0 1 2 3 4 5 6 7 8 9</div>
  <div style="font-size:18px;line-height:1.5;color:var(--agtc-semantic-color-text-secondary);margin-top:8px">! @ # $ % &amp; * ( ) [ ] { } , . ; : ' " - _ / \ ? + = &lt; &gt;</div>
  <div style="font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px">
    <span style="font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);display:block;margin-bottom:6px"><span class="lang-fr">Caractères ambigus — différenciation maximale</span><span class="lang-en">Ambiguous characters — maximum disambiguation</span></span>
    l 1 I &nbsp;·&nbsp; O 0 &nbsp;·&nbsp; b d p q &nbsp;·&nbsp; n u m &nbsp;·&nbsp; rn m
  </div>
  <div style="font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px">
    <span style="font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);display:block;margin-bottom:6px"><span class="lang-fr">Caractères accentués</span><span class="lang-en">Accented characters</span></span>
    À Â Ä Æ Ç É È Ê Ë Î Ï Ô Œ Ù Û Ü à â ä æ ç é è ê ë î ï ô œ ù û ü
  </div>
  <p style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);margin-top:12px;margin-bottom:0">
    <span class="lang-fr">2 graisses disponibles : Regular (400) · Bold (700). Le token <code>fontWeight.medium</code> (500) s'arrondit à 400.</span>
    <span class="lang-en">2 weights available: Regular (400) · Bold (700). The <code>fontWeight.medium</code> token (500) rounds to 400.</span>
  </p>
</div>

<h2><span class="lang-fr">Police monospace — Atkinson Hyperlegible Mono</span><span class="lang-en">Monospace typeface — Atkinson Hyperlegible Mono</span></h2>
<p>
  <span class="lang-fr">Compagnon monospace d'Atkinson Hyperlegible — même ADN d'accessibilité, glyphes monospacés optimisés pour le code et les valeurs de tokens.</span>
  <span class="lang-en">Monospace companion to Atkinson Hyperlegible — same accessibility DNA, monospaced glyphs optimised for code and token values.</span>
</p>
<div class="demo-box" style="padding:24px 28px">
  <p style="font-size:13px;color:var(--agtc-semantic-color-text-secondary);margin-bottom:16px"><code>--agtc-font-mono</code></p>
  <div style="font-family:var(--agtc-font-mono);font-size:22px;font-weight:var(--agtc-semantic-fontWeight-bold);line-height:1.3;color:var(--agtc-semantic-color-text-primary);word-break:break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
  <div style="font-family:var(--agtc-font-mono);font-size:22px;line-height:1.3;color:var(--agtc-semantic-color-text-secondary);word-break:break-all;margin-top:4px">abcdefghijklmnopqrstuvwxyz</div>
  <div style="font-family:var(--agtc-font-mono);font-size:20px;line-height:1.4;color:var(--agtc-semantic-color-text-primary);margin-top:8px;font-weight:var(--agtc-semantic-fontWeight-bold)">0 1 2 3 4 5 6 7 8 9</div>
  <div style="font-family:var(--agtc-font-mono);font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:8px">! @ # $ % &amp; * ( ) [ ] { } , . ; : ' " - _ / \ ? + = &lt; &gt;</div>
  <div style="font-family:var(--agtc-font-mono);font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px">
    <span style="font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);display:block;margin-bottom:6px"><span class="lang-fr">Caractères ambigus — clé pour le code</span><span class="lang-en">Ambiguous characters — critical for code</span></span>
    l 1 I &nbsp;·&nbsp; O 0 &nbsp;·&nbsp; b d p q &nbsp;·&nbsp; n u m &nbsp;·&nbsp; rn m
  </div>
  <div style="font-family:var(--agtc-font-mono);font-size:13px;line-height:1.7;color:var(--agtc-semantic-color-action-primary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px;word-break:break-all">
    <span style="font-size:var(--agtc-semantic-typography-detail-size);font-weight:var(--agtc-semantic-fontWeight-bold);text-transform:uppercase;letter-spacing:var(--agtc-tracking-label);display:block;margin-bottom:8px;color:var(--agtc-semantic-color-text-secondary)"><span class="lang-fr">Exemple — token CSS</span><span class="lang-en">Example — CSS token</span></span>
    --agtc-semantic-color-action-primary: #007a68;<br>
    --agtc-component-button-primary-background: var(--agtc-semantic-color-action-primary);
  </div>
  <p style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);margin-top:12px;margin-bottom:0">
    <span class="lang-fr">Utilisée sur : éléments <code>&lt;code&gt;</code>, valeurs de tokens, labels de l'explorateur, numéros ADR. Google Fonts : <code>family=Atkinson+Hyperlegible+Mono</code></span>
    <span class="lang-en">Used on: <code>&lt;code&gt;</code> elements, token values, explorer labels, ADR numbers. Google Fonts: <code>family=Atkinson+Hyperlegible+Mono</code></span>
  </p>
</div>

<h2><span class="lang-fr">Échelle Minor Third — 9 échelons</span><span class="lang-en">Minor Third scale — 9 steps</span></h2>
<p>
  <span class="lang-fr">Ratio : <strong>1.200</strong> (tierce mineure). Chaque échelon = échelon précédent × 1.2, arrondi au multiple de 4px le plus proche. Unité <code>rem</code> pour respecter le zoom navigateur (WCAG 1.4.4).</span>
  <span class="lang-en">Ratio: <strong>1.200</strong> (minor third). Each step = previous step × 1.2, rounded to the nearest 4px multiple. <code>rem</code> unit to honour browser zoom (WCAG 1.4.4).</span>
</p>
<div class="demo-box" style="padding:16px 24px">${scaleSpecimens}</div>

<h2><span class="lang-fr">Tableau — primitifs fontSize</span><span class="lang-en">Table — fontSize primitives</span></h2>
<table class="token-table"><colgroup><col style="width:12%"><col style="width:18%"><col style="width:18%"><col style="width:12%"><col style="width:40%"></colgroup>
  <thead><tr>
    <th><span class="lang-fr">Échelon</span><span class="lang-en">Step</span></th>
    <th><span class="lang-fr">Valeur rem (px)</span><span class="lang-en">Value rem (px)</span></th>
    <th>Line-height</th>
    <th>Weight</th>
    <th><span class="lang-fr">Rôle</span><span class="lang-en">Role</span></th>
  </tr></thead>
  <tbody>${scaleRows}</tbody>
</table>

<h2><span class="lang-fr">Modes de line-height</span><span class="lang-en">Line-height modes</span></h2>
<div class="demo-box" style="padding:16px 24px">
  <div class="lh-demo-grid">
    <div class="lh-demo-card">
      <div class="lh-demo-label"><code>reading</code> — 1.6</div>
      <div style="font-size:var(--agtc-semantic-typography-label-size);line-height:1.6;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Texte courant, labels, captions. Conforme WCAG 1.4.12. Maximise le confort de lecture sur plusieurs lignes.</span><span class="lang-en">Body text, labels, captions. Conforms to WCAG 1.4.12. Maximises reading comfort across multiple lines.</span></div>
    </div>
    <div class="lh-demo-card">
      <div class="lh-demo-label"><code>heading</code> — 1.1</div>
      <div style="font-size:1.25rem;line-height:1.1;font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Titres h5 → h3. Compact sans être étouffant.</span><span class="lang-en">Headings h5 → h3. Compact without feeling cramped.</span></div>
    </div>
    <div class="lh-demo-card">
      <div class="lh-demo-label"><code>display</code> — 1.0</div>
      <div style="font-size:2rem;line-height:1.0;font-weight:var(--agtc-semantic-fontWeight-bold);color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">h2, h1, hero.</span><span class="lang-en">h2, h1, hero.</span></div>
    </div>
  </div>
</div>

<h2><span class="lang-fr">Règles</span><span class="lang-en">Rules</span></h2>
<ul>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-size: 16px</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-primitive-fontSize-base)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-family: 'Atkinson Hyperlegible'</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-semantic-typography-fontFamily)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-weight: bold</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-semantic-fontWeight-bold)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Taille hors-échelle :</span><span class="lang-en">Off-scale size:</span> <code>15px</code>, <code>18px</code>, <code>22px</code> — <span class="lang-fr">choisir l'échelon Minor Third le plus proche</span><span class="lang-en">pick the closest Minor Third step</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Import Google Fonts (sans-serif) :</span><span class="lang-en">Google Fonts import (sans-serif):</span> <code>family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700</code></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Import Google Fonts (mono) :</span><span class="lang-en">Google Fonts import (mono):</span> <code>family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-family: monospace</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-font-mono)</code></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours choisir le mode <code>lineHeight</code> selon le rôle : <code>reading</code> ≤ base, <code>heading</code> pour lg–2xl, <code>display</code> pour 3xl+</span><span class="lang-en">Always pick the <code>lineHeight</code> mode for the role: <code>reading</code> ≤ base, <code>heading</code> for lg–2xl, <code>display</code> for 3xl+</span></li>
</ul>
`;

  write(path.join(DIST, 'foundations/typography.html'), layout({
    title: 'Typographie', depth: 1,
    sidebar: sidebarFoundations('../','typography.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: ICONS FOUNDATION ─────────────────────────────────────────────────
function buildIconsFoundation() {
  const sizes = [
    ['inline',  SEM['icon-size-inline']  || '16px', '<span class="lang-fr">Dans un texte courant, un label</span><span class="lang-en">In body text, a label</span>'],
    ['control', SEM['icon-size-control'] || '20px', '<span class="lang-fr">Dans un bouton, un input, un badge</span><span class="lang-en">In a button, input, or badge</span>'],
    ['nav',     SEM['icon-size-nav']     || '24px', '<span class="lang-fr">Navigation, en-tête, emphase</span><span class="lang-en">Navigation, header, emphasis</span>'],
  ];
  const sizeRows = sizes.map(([name, val, intent]) =>
    `<tr class="token-row"><td><code>--agtc-semantic-icon-size-${name}</code></td><td><code>semantic.icon.size.${name}</code></td><td style="font-family:var(--agtc-font-mono)">${val}</td><td>${intent}</td></tr>`
  ).join('');

  const sampleIcons = ['home','search','settings','user','bell','heart','star','trash-2','check','x','arrow-right','plus','edit','download','upload','eye','lock','mail','calendar','file-text'];
  const iconGrid = sampleIcons.map(name =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px;background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-control)">
      ${icon(name, 24)}
      <span style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary);font-family:var(--agtc-font-mono)">${name}</span>
    </div>`
  ).join('');

  const sizeDemo = sizes.map(([name, val]) =>
    `<div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default)">
      <div style="width:80px;color:var(--agtc-semantic-color-text-secondary);font-size:13px"><code>${name}</code></div>
      ${icon('star', parseInt(val), 'var(--agtc-semantic-color-action-primary)')}
      <div style="font-size:13px;color:var(--agtc-semantic-color-text-secondary)">${val} — <code>--agtc-semantic-icon-size-${name}</code></div>
    </div>`
  ).join('');

  const body = `
<h1><span class="lang-fr">Icônes</span><span class="lang-en">Icons</span></h1>
<p class="page-lead">
  <span class="lang-fr">Bibliothèque officielle : <strong>Lucide Icons</strong> (MIT) — 1 500+ icônes, cohérence géométrique stricte (<code>strokeWidth: 1.5px</code>), accessibilité WCAG 1.1.1 intégrée. Référence canonique : <a href="https://lucide.dev" target="_blank" rel="noopener">lucide.dev</a>.</span>
  <span class="lang-en">Official library: <strong>Lucide Icons</strong> (MIT) — 1,500+ icons, strict geometric consistency (<code>strokeWidth: 1.5px</code>), built-in WCAG 1.1.1 accessibility. Canonical reference: <a href="https://lucide.dev" target="_blank" rel="noopener">lucide.dev</a>.</span>
</p>

<h2 class="first"><span class="lang-fr">Tailles — 3 échelons sémantiques</span><span class="lang-en">Sizes — 3 semantic steps</span></h2>
<div class="demo-box" style="padding:8px 24px">
  ${sizeDemo}
</div>

<h2><span class="lang-fr">Tokens sémantiques</span><span class="lang-en">Semantic tokens</span></h2>
<table class="token-table"><colgroup><col style="width:44%"><col style="width:28%"><col style="width:14%"><col style="width:14%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Intention</span><span class="lang-en">Intent</span></th></tr></thead>
  <tbody>${sizeRows}</tbody>
</table>

<h2><span class="lang-fr">Galerie — aperçu Lucide</span><span class="lang-en">Gallery — Lucide preview</span></h2>
<p style="color:var(--agtc-semantic-color-text-secondary);font-size:14px;margin-bottom:16px">
  <span class="lang-fr">Extrait de 20 icônes. Catalogue complet sur <a href="https://lucide.dev" target="_blank" rel="noopener">lucide.dev</a>.</span>
  <span class="lang-en">Sample of 20 icons. Full catalog at <a href="https://lucide.dev" target="_blank" rel="noopener">lucide.dev</a>.</span>
</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px">
  ${iconGrid}
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours utiliser <code>&lt;agtc-icon name="…" size="control"&gt;</code></span><span class="lang-en">Always use <code>&lt;agtc-icon name="…" size="control"&gt;</code></span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Icône sémantique (seule info visible) → <code>label="…"</code> obligatoire</span><span class="lang-en">Semantic icon (sole visible info) → <code>label="…"</code> required</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Icône décorative (texte adjacent) → <code>decorative</code> obligatoire</span><span class="lang-en">Decorative icon (adjacent text) → <code>decorative</code> required</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Taille en dur : <code>style="width:20px"</code> — utiliser <code>size="control"</code></span><span class="lang-en">Hardcoded size: <code>style="width:20px"</code> — use <code>size="control"</code></span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">SVG inline hors <code>&lt;agtc-icon&gt;</code> — pas de contrat d'accessibilité</span><span class="lang-en">Inline SVG outside <code>&lt;agtc-icon&gt;</code> — no accessibility contract</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Icône sémantique sans <code>label</code> ni <code>decorative</code></span><span class="lang-en">Semantic icon without <code>label</code> or <code>decorative</code></span></li>
</ul>

<h2><span class="lang-fr">Composant</span><span class="lang-en">Component</span></h2>
<p>
  <span class="lang-fr">Voir le contrat complet du Web Component : <a href="../components/icon.html">agtc-icon →</a></span>
  <span class="lang-en">See the full Web Component contract: <a href="../components/icon.html">agtc-icon →</a></span>
</p>
`;

  write(path.join(DIST, 'foundations/icons.html'), layout({
    title: 'Icônes', depth: 1,
    sidebar: sidebarFoundations('../','icons.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: COMPONENTS INDEX ─────────────────────────────────────────────────
function buildComponentsIndex() {
  const body = `
<h1><span class="lang-fr">Composants</span><span class="lang-en">Components</span></h1>
<p class="page-lead">
  <span class="lang-fr">Chaque composant est un contrat — intention, variantes autorisées, tokens associés, règles d'accessibilité, cas limites, gouvernance. Les agents appliquent ces contrats sans les improviser.</span>
  <span class="lang-en">Each component is a contract — intent, allowed variants, associated tokens, accessibility rules, edge cases, governance. Agents apply these contracts without improvising.</span>
</p>

<h2 class="first"><span class="lang-fr">Workflow de création</span><span class="lang-en">Creation workflow</span></h2>
<ol style="color:var(--agtc-semantic-color-text-secondary);padding-left:22px">
  <li><span class="lang-fr">Définir l'intention du composant dans <code>guidelines/components/[nom].md</code></span><span class="lang-en">Define the component intent in <code>guidelines/components/[name].md</code></span></li>
  <li><span class="lang-fr">Créer les tokens dans <code>tokens/component.json</code> en référençant les sémantiques</span><span class="lang-en">Create tokens in <code>tokens/component.json</code> referencing semantic tokens</span></li>
  <li><span class="lang-fr">Implémenter le Web Component (Lit) dans <code>src/components/sda-[nom].js</code></span><span class="lang-en">Implement the Web Component (Lit) in <code>src/components/sda-[name].js</code></span></li>
  <li><span class="lang-fr">Créer la Storybook story pour documentation et tests visuels</span><span class="lang-en">Create the Storybook story for documentation and visual tests</span></li>
  <li><span class="lang-fr">Ouvrir une PR avec impact tokens documenté — approbation requise si composant modifié</span><span class="lang-en">Open a PR with documented token impact — approval required if component is modified</span></li>
</ol>

<h2><span class="lang-fr">Catalogue</span><span class="lang-en">Catalog</span></h2>
<div class="nav-grid">
  <a href="button.html" class="nav-card">
    <span class="nav-card-icon">${icon('mouse-pointer-click',24)}</span>
    <div class="nav-card-title">Button</div>
    <div class="nav-card-desc">
      <span class="lang-fr">4 variantes : primary, secondary, ghost, critical. Règles spéciales pour les actions irréversibles.</span>
      <span class="lang-en">4 variants: primary, secondary, ghost, critical. Special rules for irreversible actions.</span>
    </div>
  </a>
  <a href="icon.html" class="nav-card">
    <span class="nav-card-icon">${icon('star',24)}</span>
    <div class="nav-card-title">Icon</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Bibliothèque Lucide — 1 500+ icônes, 3 tailles, règles WCAG 1.1.1.</span>
      <span class="lang-en">Lucide library — 1,500+ icons, 3 sizes, WCAG 1.1.1 rules.</span>
    </div>
  </a>
  <a href="input.html" class="nav-card">
    <span class="nav-card-icon">${icon('pen-line',24)}</span>
    <div class="nav-card-title">Input</div>
    <div class="nav-card-desc">
      <span class="lang-fr">7 types, label obligatoire, toggle password, icônes hybrides, états complets.</span>
      <span class="lang-en">7 types, required label, password toggle, hybrid icons, complete states.</span>
    </div>
  </a>
  <a href="badge.html" class="nav-card">
    <span class="nav-card-icon">${icon('tag',24)}</span>
    <div class="nav-card-title">Badge</div>
    <div class="nav-card-desc">
      <span class="lang-fr">6 variantes sémantiques, 2 tailles, icônes, mode icon-only accessible.</span>
      <span class="lang-en">6 semantic variants, 2 sizes, icons, accessible icon-only mode.</span>
    </div>
  </a>
  <a href="card.html" class="nav-card">
    <span class="nav-card-icon">${icon('layout-template',24)}</span>
    <div class="nav-card-title">Card</div>
    <div class="nav-card-desc">
      <span class="lang-fr">3 variantes, 4 paddings, slots header/body/footer, composition libre.</span>
      <span class="lang-en">3 variants, 4 paddings, header/body/footer slots, free composition.</span>
    </div>
  </a>
  <a href="checkbox.html" class="nav-card">
    <span class="nav-card-icon">${icon('square-check',24)}</span>
    <div class="nav-card-title">Checkbox</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Sélection binaire, forme carrée (NN/g), états complets + indeterminate, label cliquable.</span>
      <span class="lang-en">Binary selection, square shape (NN/g), full states + indeterminate, clickable label.</span>
    </div>
  </a>
  <a href="radio.html" class="nav-card">
    <span class="nav-card-icon">${icon('circle-dot',24)}</span>
    <div class="nav-card-title">Radio</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Choix exclusif, forme ronde (NN/g), groupe ARIA radiogroup, navigation flèches.</span>
      <span class="lang-en">Exclusive choice, round shape (NN/g), ARIA radiogroup, arrow-key navigation.</span>
    </div>
  </a>
  <a href="toggle.html" class="nav-card">
    <span class="nav-card-icon">${icon('toggle-right',24)}</span>
    <div class="nav-card-title">Toggle</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Réglage on/off à effet immédiat, role=switch, état par position (WCAG 1.4.1).</span>
      <span class="lang-en">Immediate on/off setting, role=switch, state by position (WCAG 1.4.1).</span>
    </div>
  </a>
  <a href="table.html" class="nav-card">
    <span class="nav-card-icon">${icon('table',24)}</span>
    <div class="nav-card-title">Table</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Données en lecture seule, accessible (scope, caption), séparateurs/zébrage, scroll horizontal.</span>
      <span class="lang-en">Read-only data, accessible (scope, caption), dividers/striped, horizontal scroll.</span>
    </div>
  </a>
  <a href="code-block.html" class="nav-card">
    <span class="nav-card-icon">${icon('code',24)}</span>
    <div class="nav-card-title">Code Block</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Code en lecture seule, copiable (annonce AT), indicateur de langue, surface sombre tokenisée.</span>
      <span class="lang-en">Read-only code, copyable (AT announce), language indicator, tokenized dark surface.</span>
    </div>
  </a>
  <a href="banner.html" class="nav-card">
    <span class="nav-card-icon">${icon('megaphone',24)}</span>
    <div class="nav-card-title">Banner</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Message inline (callout/alerte), 6 variantes, statique par défaut, live region en opt-in.</span>
      <span class="lang-en">Inline message (callout/alert), 6 variants, static by default, opt-in live region.</span>
    </div>
  </a>
  <a href="link.html" class="nav-card">
    <span class="nav-card-icon">${icon('link',24)}</span>
    <div class="nav-card-title">Link</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Lien de navigation, souligné par défaut (WCAG 1.4.1), liens externes sécurisés et annoncés.</span>
      <span class="lang-en">Navigation link, underlined by default (WCAG 1.4.1), secure & announced external links.</span>
    </div>
  </a>
  <a href="segmented.html" class="nav-card">
    <span class="nav-card-icon">${icon('rows-3',24)}</span>
    <div class="nav-card-title">Segmented</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Contrôle segmenté mono-sélection à effet immédiat (FR/EN, densité), boutons + aria-current.</span>
      <span class="lang-en">Single-select segmented control with immediate effect (FR/EN, density), buttons + aria-current.</span>
    </div>
  </a>
  <a href="tabs.html" class="nav-card">
    <span class="nav-card-icon">${icon('panel-top',24)}</span>
    <div class="nav-card-title">Tabs</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Onglets horizontaux in-page (tablist/tab/tabpanel), activation auto, href optionnel.</span>
      <span class="lang-en">Horizontal in-page tabs (tablist/tab/tabpanel), auto activation, optional href.</span>
    </div>
  </a>
</div>
`;

  write(path.join(DIST, 'components/index.html'), layout({
    title: 'Composants', depth: 1,
    sidebar: sidebarComponents('../','index.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: BUTTON ───────────────────────────────────────────────────────────
function buildButton() {
  const tokenRows = [
    ['button-primary-background',          'semantic.color.action.primary',         SEM['color-action-primary']],
    ['button-primary-background-hover',    'semantic.color.action.primary-hover',   SEM['color-action-primary-hover']],
    ['button-primary-background-disabled', 'semantic.color.action.primary-disabled',SEM['color-action-primary-disabled']],
    ['button-primary-text',                'semantic.color.text.on-action',         SEM['color-text-on-action']],
    ['button-primary-padding-x',           'semantic.space.control.padding-x',      SEM['space-control-padding-x']],
    ['button-primary-padding-y',           'semantic.space.control.padding-y',      SEM['space-control-padding-y']],
    ['button-primary-radius',              'semantic.radius.control',               SEM['radius-control']],
    ['button-critical-background',         'semantic.color.feedback.danger',        SEM['color-feedback-danger']],
    ['button-secondary-text',              'semantic.color.action.primary',         SEM['color-action-primary']],
    ['button-secondary-border',            'semantic.color.action.primary',         SEM['color-action-primary']],
    ['button-ghost-text',                  'semantic.color.action.primary',         SEM['color-action-primary']],
  ];

  const body = `
<h1>Button</h1>
<p class="page-lead">
  <span class="lang-fr">Déclenche une action utilisateur. Quatre variantes, chacune avec une hiérarchie et un usage précis. La variante <code>critical</code> porte des règles comportementales spéciales pour les actions irréversibles.</span>
  <span class="lang-en">Triggers a user action. Four variants, each with a precise hierarchy and use case. The <code>critical</code> variant carries special behavioral rules for irreversible actions.</span>
</p>

<h2 class="first"><span class="lang-fr">Variantes</span><span class="lang-en">Variants</span></h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Primary — action principale, 1 maximum par section</span><span class="lang-en">Primary — main action, 1 maximum per section</span></span>
    <div class="demo-row">
      <agtc-button variant="primary"><span class="lang-fr">Enregistrer les modifications</span><span class="lang-en">Save changes</span></agtc-button>
      <agtc-button variant="primary" disabled><span class="lang-fr">Enregistrer (désactivé)</span><span class="lang-en">Save (disabled)</span></agtc-button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Secondary — action alternative</span><span class="lang-en">Secondary — alternative action</span></span>
    <div class="demo-row">
      <agtc-button variant="secondary"><span class="lang-fr">Annuler</span><span class="lang-en">Cancel</span></agtc-button>
      <agtc-button variant="secondary" disabled><span class="lang-fr">Annuler (désactivé)</span><span class="lang-en">Cancel (disabled)</span></agtc-button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Ghost — action tertiaire, faible emphase</span><span class="lang-en">Ghost — tertiary action, low emphasis</span></span>
    <div class="demo-row">
      <agtc-button variant="ghost"><span class="lang-fr">En savoir plus</span><span class="lang-en">Learn more</span></agtc-button>
      <agtc-button variant="ghost" disabled><span class="lang-fr">En savoir plus (désactivé)</span><span class="lang-en">Learn more (disabled)</span></agtc-button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Critical — action irréversible (confirmation obligatoire)</span><span class="lang-en">Critical — irreversible action (confirmation required)</span></span>
    <div class="demo-row">
      <agtc-button variant="critical"><span class="lang-fr">Supprimer définitivement</span><span class="lang-en">Delete permanently</span></agtc-button>
    </div>
  </div>
</div>

<h2><span class="lang-fr">Icônes</span><span class="lang-en">Icons</span></h2>
<p>
  <span class="lang-fr">Approche hybride : propriété (Figma, React, tous frameworks) ou slot (composition avancée). Le contenu slotté a toujours la priorité sur la propriété.</span>
  <span class="lang-en">Hybrid approach: property (Figma, React, all frameworks) or slot (advanced composition). Slotted content always takes priority over the property.</span>
</p>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Icône avant (prefix)</span><span class="lang-en">Leading icon (prefix)</span></span>
    <div class="demo-row">
      <agtc-button variant="primary" icon="plus"><span class="lang-fr">Ajouter</span><span class="lang-en">Add</span></agtc-button>
      <agtc-button variant="secondary" icon="download"><span class="lang-fr">Télécharger</span><span class="lang-en">Download</span></agtc-button>
      <agtc-button variant="ghost" icon="settings"><span class="lang-fr">Paramètres</span><span class="lang-en">Settings</span></agtc-button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Icône après (suffix)</span><span class="lang-en">Trailing icon (suffix)</span></span>
    <div class="demo-row">
      <agtc-button variant="primary" icon-suffix="arrow-right"><span class="lang-fr">Continuer</span><span class="lang-en">Continue</span></agtc-button>
      <agtc-button variant="secondary" icon-suffix="external-link"><span class="lang-fr">Exporter</span><span class="lang-en">Export</span></agtc-button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Icon-only — <code>label</code> obligatoire (WCAG 1.1.1)</span><span class="lang-en">Icon-only — <code>label</code> required (WCAG 1.1.1)</span></span>
    <div class="demo-row">
      <agtc-button variant="primary" icon="plus" icon-only label="Ajouter"></agtc-button>
      <agtc-button variant="secondary" icon="pencil" icon-only label="Modifier"></agtc-button>
      <agtc-button variant="ghost" icon="settings" icon-only label="Paramètres"></agtc-button>
      <agtc-button variant="critical" icon="trash-2" icon-only label="Supprimer définitivement"></agtc-button>
    </div>
  </div>
</div>
<pre class="code-block"><code class="lang-html">&lt;!-- Propriété icon — Figma Code Connect, React et tous les frameworks --&gt;
&lt;agtc-button icon="plus"&gt;<span class="lang-fr">Ajouter un élément</span><span class="lang-en">Add item</span>&lt;/agtc-button&gt;
&lt;agtc-button variant="secondary" icon-suffix="arrow-right"&gt;<span class="lang-fr">Continuer</span><span class="lang-en">Continue</span>&lt;/agtc-button&gt;

&lt;!-- Icon-only — label="" obligatoire --&gt;
&lt;agtc-button icon-only icon="x" label="<span class="lang-fr">Fermer le panneau</span><span class="lang-en">Close panel</span>"&gt;&lt;/agtc-button&gt;

&lt;!-- Slot — composition avancée, SVG custom --&gt;
&lt;agtc-button&gt;
  &lt;agtc-icon slot="prefix" name="plus"&gt;&lt;/agtc-icon&gt;
  <span class="lang-fr">Ajouter un élément</span><span class="lang-en">Add item</span>
&lt;/agtc-button&gt;</code></pre>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Maximum 1 bouton <code>primary</code> par section ou formulaire</span><span class="lang-en">Maximum 1 <code>primary</code> button per section or form</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours un libellé explicite — jamais "OK" ou "Confirmer" seul</span><span class="lang-en">Always an explicit label — never "OK" or "Confirm" alone</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Le bouton <code>critical</code> DOIT déclencher un pattern de confirmation</span><span class="lang-en">The <code>critical</code> button MUST trigger a confirmation pattern</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours un <code>:focus-visible</code> visible — <code>outline: 2px solid var(--agtc-semantic-color-border-focus)</code></span><span class="lang-en">Always a visible <code>:focus-visible</code> — <code>outline: 2px solid var(--agtc-semantic-color-border-focus)</code></span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais deux boutons <code>primary</code> côte à côte</span><span class="lang-en">Never two <code>primary</code> buttons side by side</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de couleur ou espacement en dur</span><span class="lang-en">Never hardcoded colors or spacing</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de variante inventée hors de <code>component.json</code></span><span class="lang-en">Never an invented variant outside <code>component.json</code></span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence sémantique</span><span class="lang-en">Semantic reference</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr">Contraste minimum 4.5:1 sur fond blanc (WCAG AA)</span><span class="lang-en">Minimum contrast 4.5:1 on white background (WCAG AA)</span></li>
  <li><span class="lang-fr">Navigation clavier complète — Tab, Enter, Space</span><span class="lang-en">Full keyboard navigation — Tab, Enter, Space</span></li>
  <li><span class="lang-fr">Focus visible : <code>outline: 2px solid var(--agtc-semantic-color-border-focus); outline-offset: 2px</code></span><span class="lang-en">Visible focus: <code>outline: 2px solid var(--agtc-semantic-color-border-focus); outline-offset: 2px</code></span></li>
  <li><span class="lang-fr">Pour les boutons icône seul : <code>aria-label</code> obligatoire</span><span class="lang-en">For icon-only buttons: <code>aria-label</code> required</span></li>
  <li><span class="lang-fr">État <code>loading</code> : <code>aria-busy="true"</code> + largeur préservée</span><span class="lang-en"><code>loading</code> state: <code>aria-busy="true"</code> + width preserved</span></li>
  <li><span class="lang-fr">État <code>disabled</code> : <code>aria-disabled="true"</code> ou <code>disabled</code></span><span class="lang-en"><code>disabled</code> state: <code>aria-disabled="true"</code> or <code>disabled</code></span></li>
</ul>

<h2><span class="lang-fr">Règles spéciales — variante critical</span><span class="lang-en">Special rules — critical variant</span></h2>
<p>Token <code>component.button.critical.$metadata.requires-confirmation</code> = <code>true</code>. <span class="lang-fr">Avant d'utiliser cette variante, vérifier :</span><span class="lang-en">Before using this variant, verify:</span></p>
<ol style="color:var(--agtc-semantic-color-text-secondary);padding-left:22px">
  <li><span class="lang-fr">Le pattern de confirmation existe dans l'interface (modale, popconfirm)</span><span class="lang-en">The confirmation pattern exists in the UI (modal, popconfirm)</span></li>
  <li><span class="lang-fr">Le libellé décrit l'action — ex: "Supprimer définitivement le dossier"</span><span class="lang-en">The label describes the action — e.g. "Delete folder permanently"</span></li>
  <li><span class="lang-fr">Le contraste est ≥ 4.5:1 sur fond blanc</span><span class="lang-en">Contrast is ≥ 4.5:1 on white background</span></li>
  <li><span class="lang-fr">L'agent escalade à un humain si le caractère irréversible de l'action n'est pas certain</span><span class="lang-en">The agent escalates to a human if the irreversibility of the action is uncertain</span></li>
</ol>

<h2><span class="lang-fr">Compatibilité frameworks</span><span class="lang-en">Framework compatibility</span></h2>
<table class="token-table"><colgroup><col style="width:25%"><col style="width:25%"><col style="width:25%"><col style="width:25%"></colgroup>
  <thead><tr><th>Framework</th><th><code>icon="..."</code></th><th><code>slot="prefix"</code></th><th>Figma Code Connect</th></tr></thead>
  <tbody>
    <tr><td><span class="platform-cell">${icon('code',18)}HTML natif</span></td><td>✅</td><td>✅</td><td>—</td></tr>
    <tr><td><span class="platform-cell"><img class="vendor-logo" src="../integrations/react.svg" alt="React" width="20" height="20" loading="lazy">React 19</span></td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td><span class="platform-cell"><img class="vendor-logo" src="../integrations/react.svg" alt="React" width="20" height="20" loading="lazy">React 18</span></td><td>✅</td><td>⚠️ <span class="lang-fr">via ref</span><span class="lang-en">via ref</span></td><td>✅</td></tr>
    <tr><td><span class="platform-cell"><img class="vendor-logo" src="../integrations/angular.svg" alt="Angular" width="20" height="20" loading="lazy">Angular</span></td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td><span class="platform-cell"><img class="vendor-logo" src="../integrations/vue.svg" alt="Vue" width="20" height="20" loading="lazy">Vue 3</span></td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td><span class="platform-cell"><img class="vendor-logo" src="../integrations/svelte.svg" alt="Svelte" width="20" height="20" loading="lazy">Svelte</span></td><td>✅</td><td>✅</td><td>✅</td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Implémentation — Lit Web Component</span><span class="lang-en">Implementation — Lit Web Component</span></h2>
<pre class="code-block"><code class="lang-javascript">import { LitElement, html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
// agtc-icon doit être enregistré par le consommateur pour les propriétés icon/icon-suffix
// import './agtc-icon.js';

class AgtcButton extends LitElement {
  static properties = {
    variant:    { type: String,  reflect: true }, // 'primary'|'secondary'|'ghost'|'critical'
    disabled:   { type: Boolean, reflect: true },
    loading:    { type: Boolean, reflect: true },
    iconOnly:   { type: Boolean, reflect: true, attribute: 'icon-only' },
    icon:       { type: String },                 // nom d'icône Lucide (prefix)
    iconSuffix: { type: String,  attribute: 'icon-suffix' }, // nom d'icône (suffix)
    label:      { type: String },                 // aria-label — obligatoire pour icon-only
    loadingLabel: { type: String, attribute: 'loading-label' },
  };

  render() {
    const busy = this.loading;
    return html\`
      &lt;button
        class="\${[this.variant, busy ? 'loading' : '', this.iconOnly ? 'icon-only' : ''].filter(Boolean).join(' ')}"
        ?disabled="\${this.disabled || busy}"
        aria-busy="\${busy}"
        aria-label="\${ifDefined(this.label ? (busy ? this.loadingLabel : this.label) : undefined)}"
      &gt;
        &lt;span class="spinner" aria-hidden="true"&gt;&lt;/span&gt;
        &lt;span class="content"&gt;
          &lt;slot name="prefix"&gt;
            \${this.icon ? html\`&lt;agtc-icon name="\${this.icon}" size="control"&gt;&lt;/agtc-icon&gt;\` : ''}
          &lt;/slot&gt;
          &lt;slot&gt;&lt;/slot&gt;
          &lt;slot name="suffix"&gt;
            \${this.iconSuffix ? html\`&lt;agtc-icon name="\${this.iconSuffix}" size="control"&gt;&lt;/agtc-icon&gt;\` : ''}
          &lt;/slot&gt;
        &lt;/span&gt;
      &lt;/button&gt;
    \`;
  }
}
customElements.define('agtc-button', AgtcButton);</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Libellé explicite décrivant l'action (<em>«&nbsp;Supprimer définitivement le dossier&nbsp;»</em>)</span><span class="lang-en">Explicit label describing the action (<em>"Delete folder permanently"</em>)</span></li>
      <li><span class="lang-fr">Maximum 1 bouton <code>primary</code> par section ou formulaire</span><span class="lang-en">Maximum 1 <code>primary</code> button per section or form</span></li>
      <li><span class="lang-fr">Toujours un <code>:focus-visible</code> visible pour la navigation clavier</span><span class="lang-en">Always a visible <code>:focus-visible</code> for keyboard navigation</span></li>
      <li><span class="lang-fr">État <code>loading</code> avec <code>aria-busy="true"</code> pour les actions asynchrones</span><span class="lang-en"><code>loading</code> state with <code>aria-busy="true"</code> for async actions</span></li>
      <li><span class="lang-fr">Pattern de confirmation obligatoire avant chaque action <code>critical</code></span><span class="lang-en">Mandatory confirmation pattern before each <code>critical</code> action</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Libellé vague : <em>«&nbsp;OK&nbsp;»</em>, <em>«&nbsp;Confirmer&nbsp;»</em>, <em>«&nbsp;Valider&nbsp;»</em> seul</span><span class="lang-en">Vague label: <em>"OK"</em>, <em>"Confirm"</em>, <em>"Submit"</em> alone</span></li>
      <li><span class="lang-fr">Deux boutons <code>primary</code> côte à côte dans le même formulaire</span><span class="lang-en">Two <code>primary</code> buttons side by side in the same form</span></li>
      <li><span class="lang-fr">Couleurs ou espacements en dur (<code>style="background:red"</code>)</span><span class="lang-en">Hardcoded colors or spacing (<code>style="background:red"</code>)</span></li>
      <li><span class="lang-fr">Variantes inventées hors de <code>tokens/component.json</code></span><span class="lang-en">Invented variants outside <code>tokens/component.json</code></span></li>
      <li><span class="lang-fr">Bouton <code>critical</code> sans pattern de confirmation</span><span class="lang-en"><code>critical</code> button without a confirmation pattern</span></li>
    </ul>
  </div>
</div>

<h2><span class="lang-fr">Anti-patterns</span><span class="lang-en">Anti-patterns</span></h2>
<table>
  <thead><tr><th><span class="lang-fr">Mauvais</span><span class="lang-en">Bad</span></th><th><span class="lang-fr">Pourquoi</span><span class="lang-en">Why</span></th></tr></thead>
  <tbody>
    <tr><td><code>&lt;button style="background:red"&gt;Supprimer&lt;/button&gt;</code></td><td><span class="lang-fr">Valeur en dur, variante non reconnue, pas de token</span><span class="lang-en">Hardcoded value, unrecognized variant, no token</span></td></tr>
    <tr><td><code>&lt;agtc-button variant="critical"&gt;OK&lt;/agtc-button&gt;</code></td><td><span class="lang-fr">Libellé non explicite pour une action critique</span><span class="lang-en">Non-explicit label for a critical action</span></td></tr>
    <tr><td><span class="lang-fr">Deux <code>variant="primary"</code> dans le même formulaire</span><span class="lang-en">Two <code>variant="primary"</code> in the same form</span></td><td><span class="lang-fr">Hiérarchie cassée — perte de clarté UX</span><span class="lang-en">Broken hierarchy — loss of UX clarity</span></td></tr>
    <tr><td><code>&lt;agtc-button variant="danger"&gt;</code></td><td><span class="lang-fr">Variante inexistante — escalader, demander la variante correcte</span><span class="lang-en">Non-existent variant — escalate, ask for the correct variant</span></td></tr>
  </tbody>
</table>
`;

  write(path.join(DIST, 'components/button.html'), layout({
    title: 'Button', depth: 1,
    sidebar: sidebarComponents('../','button.html'),
    body: body + uxPatternsFromMd('button') + contributionBanner()
  }));
}

// ─── PAGE: ICON ─────────────────────────────────────────────────────────────
function buildIcon() {
  const mdPath = path.join(ROOT, 'guidelines/components/icon.md');
  let rawMd = read(mdPath)
    .replace(/\*\*Auteur:\*\*[^\n]*\n/g, '')
    .replace(/\*\*Auteur :\*\*[^\n]*\n/g, '');
  const content = parseMd(rawMd);

  const tokenRows = [
    ['icon-size-inline',  'semantic.icon.size.inline',  SEM['icon-size-inline']],
    ['icon-size-control', 'semantic.icon.size.control', SEM['icon-size-control']],
    ['icon-size-nav',     'semantic.icon.size.nav',     SEM['icon-size-nav']],
  ].map(([comp, sem, val]) =>
    `<tr class="token-row"><td><code>--agtc-semantic-${comp}</code></td><td><code>${sem}</code></td><td style="font-family:var(--agtc-font-mono)">${val || '—'}</td></tr>`
  ).join('');

  const body = `
<h1>Icon</h1>
<p class="page-lead">
  <span class="lang-fr">Composant d'icône universel basé sur Lucide Icons (MIT). 1 500+ icônes, cohérence géométrique stricte (<code>strokeWidth: 1.5px</code>), accessibilité WCAG 1.1.1 intégrée.</span>
  <span class="lang-en">Universal icon component based on Lucide Icons (MIT). 1,500+ icons, strict geometric consistency (<code>strokeWidth: 1.5px</code>), built-in WCAG 1.1.1 accessibility.</span>
</p>

<h2 class="first">Tokens</h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>CSS Custom Property</th><th><span class="lang-fr">Token sémantique</span><span class="lang-en">Semantic token</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows}</tbody>
</table>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Toujours utiliser <code>&lt;agtc-icon name="…" size="control"&gt;</code></span><span class="lang-en">Always use <code>&lt;agtc-icon name="…" size="control"&gt;</code></span></li>
      <li><span class="lang-fr">Ajouter <code>label="…"</code> si l'icône est la seule information visible</span><span class="lang-en">Add <code>label="…"</code> if the icon is the sole visible information</span></li>
      <li><span class="lang-fr">Ajouter <code>decorative</code> si l'icône accompagne un texte qui la décrit</span><span class="lang-en">Add <code>decorative</code> if the icon accompanies text that describes it</span></li>
      <li><span class="lang-fr">Choisir le token de taille correspondant au contexte : <code>inline</code> dans un texte, <code>control</code> dans un bouton, <code>nav</code> en en-tête</span><span class="lang-en">Choose the size token matching the context: <code>inline</code> in text, <code>control</code> in a button, <code>nav</code> in a header</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">SVG inline sans passer par <code>&lt;agtc-icon&gt;</code> — aucun contrat d'accessibilité</span><span class="lang-en">Inline SVG without <code>&lt;agtc-icon&gt;</code> — no accessibility contract</span></li>
      <li><span class="lang-fr">Taille codée en dur : <code>style="width:20px"</code></span><span class="lang-en">Hardcoded size: <code>style="width:20px"</code></span></li>
      <li><span class="lang-fr">Icône sémantique sans <code>label</code> ni <code>decorative</code></span><span class="lang-en">Semantic icon without <code>label</code> or <code>decorative</code></span></li>
      <li><span class="lang-fr">Tailles inventées hors des 3 tokens sémantiques définis</span><span class="lang-en">Sizes invented outside the 3 defined semantic tokens</span></li>
    </ul>
  </div>
</div>

<h2><span class="lang-fr">Référence complète</span><span class="lang-en">Full reference</span></h2>
${content}
`;

  write(path.join(DIST, 'components/icon.html'), layout({
    title: 'Icon', depth: 1,
    sidebar: sidebarComponents('../','icon.html'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: INPUT ────────────────────────────────────────────────────────────
function buildInput() {
  const tokenRows = [
    ['input-default-background',    'semantic.color.background.surface',  SEM['color-background-surface']],
    ['input-default-border',        'semantic.color.border.default',       SEM['color-border-default']],
    ['input-default-border-focus',  'semantic.color.border.focus',         SEM['color-border-focus']],
    ['input-default-border-error',  'semantic.color.border.danger',        SEM['color-border-danger']],
    ['input-default-text',          'semantic.color.text.primary',         SEM['color-text-primary']],
    ['input-default-placeholder',   'semantic.color.text.secondary',       SEM['color-text-secondary']],
    ['input-default-radius',        'semantic.radius.control',             SEM['radius-control']],
    ['input-default-padding-x',     'semantic.space.control.padding-x',    SEM['space-control-padding-x']],
    ['input-default-padding-y',     'semantic.space.control.padding-y',    SEM['space-control-padding-y']],
  ];

  const body = `
<h1>Input</h1>
<p class="page-lead">
  <span class="lang-fr">Saisie de données avec label obligatoire, 7 types, icônes hybrides et gestion d'erreur accessible. Le label est non négociable — un input sans label est inaccessible (WCAG 1.3.1).</span>
  <span class="lang-en">Data entry with required label, 7 types, hybrid icons, and accessible error handling. The label is non-negotiable — an input without a label is inaccessible (WCAG 1.3.1).</span>
</p>

<h2 class="first"><span class="lang-fr">États</span><span class="lang-en">States</span></h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Défaut</span><span class="lang-en">Default</span></span>
    <div class="demo-row demo-col">
      <div style="display:flex;flex-direction:column;gap:4px;width:280px">
        <label for="demo-input-name" style="font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Nom complet</span><span class="lang-en">Full name</span></label>
        <input id="demo-input-name" type="text" placeholder="Jean Dupont" style="padding:var(--agtc-semantic-space-control-padding-y) var(--agtc-semantic-space-control-padding-x);border:1.5px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-control);font-size:var(--agtc-semantic-typography-body-size);background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-primary);outline:none;font-family:inherit">
        <span style="font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-text-secondary)"><span class="lang-fr">Tel qu'il apparaît sur votre document officiel.</span><span class="lang-en">As it appears on your official document.</span></span>
      </div>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Erreur</span><span class="lang-en">Error</span></span>
    <div class="demo-row demo-col">
      <div style="display:flex;flex-direction:column;gap:4px;width:280px">
        <label for="demo-input-email" style="font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Adresse e-mail</span><span class="lang-en">Email address</span></label>
        <input id="demo-input-email" type="email" value="jean@" style="padding:var(--agtc-semantic-space-control-padding-y) var(--agtc-semantic-space-control-padding-x);border:1.5px solid var(--agtc-semantic-color-border-danger);border-radius:var(--agtc-semantic-radius-control);font-size:var(--agtc-semantic-typography-body-size);background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-primary);outline:none;font-family:inherit">
        <span style="font-size:var(--agtc-semantic-typography-label-size);color:var(--agtc-semantic-color-feedback-danger)" role="alert"><span class="lang-fr">Format d'adresse invalide.</span><span class="lang-en">Invalid email format.</span></span>
      </div>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Désactivé</span><span class="lang-en">Disabled</span></span>
    <div class="demo-row demo-col">
      <div style="display:flex;flex-direction:column;gap:4px;width:280px">
        <label for="demo-input-code" style="font-size:var(--agtc-semantic-typography-label-size);font-weight:var(--agtc-semantic-typography-label-weight);color:var(--agtc-semantic-color-text-disabled)"><span class="lang-fr">Code d'accès</span><span class="lang-en">Access code</span></label>
        <input id="demo-input-code" type="text" value="••••••" disabled style="padding:var(--agtc-semantic-space-control-padding-y) var(--agtc-semantic-space-control-padding-x);border:1.5px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-control);font-size:var(--agtc-semantic-typography-body-size);background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-disabled);outline:none;font-family:inherit;cursor:not-allowed">
      </div>
    </div>
  </div>
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours fournir <code>label="…"</code> — jamais placeholder seul (WCAG 1.3.1)</span><span class="lang-en">Always provide <code>label="…"</code> — never placeholder alone (WCAG 1.3.1)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Utiliser <code>invalid</code> + <code>error-message</code> ensemble — l'erreur doit être expliquée</span><span class="lang-en">Use <code>invalid</code> + <code>error-message</code> together — the error must be explained</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Le focus visible est sur le wrapper <code>.control</code> — clavier et pointeur couverts</span><span class="lang-en">Visible focus is on the <code>.control</code> wrapper — keyboard and pointer covered</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais d'input sans label — avertissement console + violation WCAG 1.3.1</span><span class="lang-en">Never an input without label — console warning + WCAG 1.3.1 violation</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de valeur ou espacement codé en dur</span><span class="lang-en">Never hardcoded values or spacing</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence sémantique</span><span class="lang-en">Semantic reference</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Types supportés</span><span class="lang-en">Supported types</span></h2>
<table class="token-table">
  <thead><tr><th>Type</th><th><span class="lang-fr">Usage</span><span class="lang-en">Usage</span></th><th><span class="lang-fr">Particularité</span><span class="lang-en">Note</span></th></tr></thead>
  <tbody>
    <tr><td><code>text</code></td><td><span class="lang-fr">Saisie libre</span><span class="lang-en">Free text</span></td><td><span class="lang-fr">Défaut</span><span class="lang-en">Default</span></td></tr>
    <tr><td><code>email</code></td><td><span class="lang-fr">Adresse e-mail</span><span class="lang-en">Email address</span></td><td><span class="lang-fr">Validation native</span><span class="lang-en">Native validation</span></td></tr>
    <tr><td><code>password</code></td><td><span class="lang-fr">Mot de passe</span><span class="lang-en">Password</span></td><td><span class="lang-fr">Toggle show/hide intégré</span><span class="lang-en">Built-in show/hide toggle</span></td></tr>
    <tr><td><code>number</code></td><td><span class="lang-fr">Valeur numérique</span><span class="lang-en">Numeric value</span></td><td><span class="lang-fr">Spinners supprimés</span><span class="lang-en">Spinners removed</span></td></tr>
    <tr><td><code>search</code></td><td><span class="lang-fr">Recherche</span><span class="lang-en">Search</span></td><td>—</td></tr>
    <tr><td><code>tel</code></td><td><span class="lang-fr">Téléphone</span><span class="lang-en">Phone</span></td><td>—</td></tr>
    <tr><td><code>url</code></td><td>URL</td><td><span class="lang-fr">Validation native</span><span class="lang-en">Native validation</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr"><code>label</code> lié via <code>for</code>/<code>id</code> — jamais <code>aria-label</code> seul sur l'input</span><span class="lang-en"><code>label</code> linked via <code>for</code>/<code>id</code> — never <code>aria-label</code> alone on input</span></li>
  <li><span class="lang-fr"><code>aria-invalid="true"</code> + <code>role="alert"</code> sur l'error-message</span><span class="lang-en"><code>aria-invalid="true"</code> + <code>role="alert"</code> on error-message</span></li>
  <li><span class="lang-fr"><code>aria-describedby</code> lie helper-text et error-message à l'input</span><span class="lang-en"><code>aria-describedby</code> links helper-text and error-message to the input</span></li>
  <li><span class="lang-fr">Type <code>password</code> : <code>aria-label</code> du toggle change dynamiquement</span><span class="lang-en"><code>password</code> type: toggle <code>aria-label</code> changes dynamically</span></li>
  <li><span class="lang-fr">Champ requis : <code>aria-required="true"</code> + marqueur <code>*</code> visuel</span><span class="lang-en">Required field: <code>aria-required="true"</code> + visual <code>*</code> marker</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Basique --&gt;
&lt;agtc-input label="<span class="lang-fr">Nom complet</span><span class="lang-en">Full name</span>" name="fullname"&gt;&lt;/agtc-input&gt;

&lt;!-- Avec aide et erreur --&gt;
&lt;agtc-input
  label="<span class="lang-fr">Adresse e-mail</span><span class="lang-en">Email address</span>"
  type="email"
  helper-text="<span class="lang-fr">Utilisée pour les notifications</span><span class="lang-en">Used for notifications</span>"
  invalid
  error-message="<span class="lang-fr">Format invalide</span><span class="lang-en">Invalid format</span>"
&gt;&lt;/agtc-input&gt;

&lt;!-- Mot de passe avec toggle intégré --&gt;
&lt;agtc-input label="<span class="lang-fr">Mot de passe</span><span class="lang-en">Password</span>" type="password" required&gt;&lt;/agtc-input&gt;

&lt;!-- Avec icône --&gt;
&lt;agtc-input label="<span class="lang-fr">Rechercher</span><span class="lang-en">Search</span>" type="search" icon="search"&gt;&lt;/agtc-input&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Toujours fournir <code>label</code> avec un texte descriptif</span><span class="lang-en">Always provide <code>label</code> with descriptive text</span></li>
      <li><span class="lang-fr">Utiliser <code>helper-text</code> pour les contraintes de format</span><span class="lang-en">Use <code>helper-text</code> for format constraints</span></li>
      <li><span class="lang-fr">Paire <code>invalid</code> + <code>error-message</code> — jamais l'un sans l'autre</span><span class="lang-en">Pair <code>invalid</code> + <code>error-message</code> — never one without the other</span></li>
      <li><span class="lang-fr">Utiliser <code>required</code> pour les champs obligatoires</span><span class="lang-en">Use <code>required</code> for mandatory fields</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Input sans <code>label</code> — inaccessible</span><span class="lang-en">Input without <code>label</code> — inaccessible</span></li>
      <li><span class="lang-fr">Placeholder comme seule étiquette — disparaît à la saisie</span><span class="lang-en">Placeholder as sole label — disappears on input</span></li>
      <li><span class="lang-fr"><code>invalid</code> sans <code>error-message</code> — erreur sans explication</span><span class="lang-en"><code>invalid</code> without <code>error-message</code> — error without explanation</span></li>
      <li><span class="lang-fr">Styles inline sur le champ</span><span class="lang-en">Inline styles on the field</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/input.html'), layout({
    title: 'Input', depth: 1,
    sidebar: sidebarComponents('../','input.html'),
    body: body + uxPatternsFromMd('input') + contributionBanner()
  }));
}

// ─── PAGE: BADGE ─────────────────────────────────────────────────────────────
function buildBadge() {
  const tokenRows = [
    ['badge-neutral-background', 'semantic.color.background.subtle',     SEM['color-background-subtle']],
    ['badge-neutral-text',       'semantic.color.text.secondary',         SEM['color-text-secondary']],
    ['badge-neutral-border',     'semantic.color.border.default',         SEM['color-border-default']],
    ['badge-brand-background',   'semantic.color.brand.primary-subtle',   SEM['color-brand-primary-subtle']],
    ['badge-success-background', 'primitive.color.green.3',               ''],
    ['badge-success-text',       'semantic.color.feedback.success',       SEM['color-feedback-success']],
    ['badge-warning-background', 'primitive.color.orange.3',              ''],
    ['badge-danger-background',  'semantic.color.feedback.danger-subtle', SEM['color-feedback-danger-subtle']],
    ['badge-danger-text',        'semantic.color.feedback.danger',        SEM['color-feedback-danger']],
    ['badge-info-background',    'primitive.color.blue.3',                ''],
    ['badge-md-radius',          '—',                                     '9999px'],
    ['badge-md-font-size',       'semantic.typography.label.size',        SEM['typography-label-size']],
    ['badge-sm-font-size',       'semantic.typography.detail.size',       SEM['typography-detail-size']],
  ];

  const variantDemo = (variant, labelFr, labelEn) => `
    <div class="demo-group">
      <span class="demo-group-label">${variant}</span>
      <div class="demo-row" style="gap:8px;flex-wrap:wrap">
        <agtc-badge variant="${variant}"><span class="lang-fr">${labelFr}</span><span class="lang-en">${labelEn}</span></agtc-badge>
        <agtc-badge variant="${variant}" size="sm"><span class="lang-fr">${labelFr} (sm)</span><span class="lang-en">${labelEn} (sm)</span></agtc-badge>
      </div>
    </div>`;

  const body = `
<h1>Badge</h1>
<p class="page-lead">
  <span class="lang-fr">Étiquette compacte non interactive pour afficher un statut, une catégorie ou un compteur. 6 variantes sémantiques, 2 tailles, icônes, mode icon-only accessible.</span>
  <span class="lang-en">Compact non-interactive label for displaying status, category, or count. 6 semantic variants, 2 sizes, icons, accessible icon-only mode.</span>
</p>

<h2 class="first"><span class="lang-fr">Variantes</span><span class="lang-en">Variants</span></h2>
<div class="demo-box">
  ${variantDemo('neutral', 'Neutre', 'Neutral')}
  ${variantDemo('brand', 'Beta', 'Beta')}
  ${variantDemo('success', 'Actif', 'Active')}
  ${variantDemo('warning', 'En attente', 'Pending')}
  ${variantDemo('danger', 'Rejeté', 'Rejected')}
  ${variantDemo('info', 'En cours', 'In progress')}
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Non interactif — pour une action, utiliser <code>&lt;agtc-button&gt;</code></span><span class="lang-en">Non-interactive — for an action, use <code>&lt;agtc-button&gt;</code></span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr"><code>icon-only</code> exige <code>label="…"</code> — WCAG 1.1.1</span><span class="lang-en"><code>icon-only</code> requires <code>label="…"</code> — WCAG 1.1.1</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Choisir la variante par intention sémantique, pas par couleur</span><span class="lang-en">Choose variant by semantic intent, not by color</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de variante inventée hors de <code>component.json</code></span><span class="lang-en">Never an invented variant outside <code>component.json</code></span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de couleur codée en dur</span><span class="lang-en">Never hardcoded color</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr"><code>role="status"</code> — les changements de statut sont annoncés aux lecteurs d'écran</span><span class="lang-en"><code>role="status"</code> — status changes are announced to screen readers</span></li>
  <li><span class="lang-fr">Mode <code>icon-only</code> : <code>aria-label</code> obligatoire</span><span class="lang-en"><code>icon-only</code> mode: <code>aria-label</code> required</span></li>
  <li><span class="lang-fr">Badge décoratif sans texte : <code>aria-hidden="true"</code></span><span class="lang-en">Decorative badge without text: <code>aria-hidden="true"</code></span></li>
  <li><span class="lang-fr">Contraste 4.5:1 sur fond blanc vérifié pour toutes les variantes</span><span class="lang-en">4.5:1 contrast on white background verified for all variants</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Variantes --&gt;
&lt;agtc-badge&gt;<span class="lang-fr">Neutre</span><span class="lang-en">Neutral</span>&lt;/agtc-badge&gt;
&lt;agtc-badge variant="success"&gt;<span class="lang-fr">Actif</span><span class="lang-en">Active</span>&lt;/agtc-badge&gt;
&lt;agtc-badge variant="warning"&gt;<span class="lang-fr">En attente</span><span class="lang-en">Pending</span>&lt;/agtc-badge&gt;
&lt;agtc-badge variant="danger"&gt;<span class="lang-fr">Rejeté</span><span class="lang-en">Rejected</span>&lt;/agtc-badge&gt;
&lt;agtc-badge variant="info"&gt;<span class="lang-fr">En cours</span><span class="lang-en">In progress</span>&lt;/agtc-badge&gt;
&lt;agtc-badge variant="brand"&gt;Beta&lt;/agtc-badge&gt;

&lt;!-- Taille sm --&gt;
&lt;agtc-badge size="sm" variant="neutral"&gt;Draft&lt;/agtc-badge&gt;

&lt;!-- Avec icône --&gt;
&lt;agtc-badge variant="success" icon="check"&gt;<span class="lang-fr">Approuvé</span><span class="lang-en">Approved</span>&lt;/agtc-badge&gt;

&lt;!-- Icon-only — label obligatoire --&gt;
&lt;agtc-badge icon-only icon="check" label="<span class="lang-fr">Approuvé</span><span class="lang-en">Approved</span>" variant="success"&gt;&lt;/agtc-badge&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Choisir la variante par intention (<em>success</em> pour validé, <em>danger</em> pour erreur)</span><span class="lang-en">Choose variant by intent (<em>success</em> for approved, <em>danger</em> for error)</span></li>
      <li><span class="lang-fr">Ajouter <code>label</code> sur <code>icon-only</code> pour les lecteurs d'écran</span><span class="lang-en">Add <code>label</code> on <code>icon-only</code> for screen readers</span></li>
      <li><span class="lang-fr">Utiliser <code>size="sm"</code> dans les tableaux et espaces denses</span><span class="lang-en">Use <code>size="sm"</code> in tables and dense layouts</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Badge cliquable sans encapsulation dans <code>&lt;button&gt;</code></span><span class="lang-en">Clickable badge without wrapping in <code>&lt;button&gt;</code></span></li>
      <li><span class="lang-fr"><code>icon-only</code> sans <code>label</code> — inaccessible</span><span class="lang-en"><code>icon-only</code> without <code>label</code> — inaccessible</span></li>
      <li><span class="lang-fr">Variante choisie par couleur, pas par intention</span><span class="lang-en">Variant chosen by color, not by intent</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/badge.html'), layout({
    title: 'Badge', depth: 1,
    sidebar: sidebarComponents('../','badge.html'),
    body: body + uxPatternsFromMd('badge') + contributionBanner()
  }));
}

// ─── PAGE: CARD ──────────────────────────────────────────────────────────────
function buildCard() {
  const tokenRows = [
    ['card-default-background',  'semantic.color.background.surface',  SEM['color-background-surface']],
    ['card-default-border',      'semantic.color.border.default',       SEM['color-border-default']],
    ['card-default-radius',      'semantic.radius.card',                SEM['radius-card']],
    ['card-default-padding',     'semantic.space.layout.component',     SEM['space-layout-component']],
    ['card-elevated-shadow',     'semantic.shadow.card',                SEM['shadow-card']],
    ['card-flat-background',     'semantic.color.background.subtle',    SEM['color-background-subtle']],
    ['card-padding-none',        '—',                                   '0px'],
    ['card-padding-sm',          'primitive.space.3',                   ''],
    ['card-padding-lg',          'primitive.space.6',                   ''],
  ];

  const cardDemo = (variant, labelFr, labelEn, extraStyle='') =>
    `<div style="border-radius:var(--agtc-component-card-default-radius);padding:var(--agtc-component-card-default-padding);background:var(--agtc-component-card-${variant}-background);border:1px solid var(--agtc-component-card-${variant}-border);${extraStyle}">
      <strong style="display:block;margin-bottom:8px;color:var(--agtc-semantic-color-text-primary)">${variant}</strong>
      <span style="font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-secondary)"><span class="lang-fr">${labelFr}</span><span class="lang-en">${labelEn}</span></span>
    </div>`;

  const body = `
<h1>Card</h1>
<p class="page-lead">
  <span class="lang-fr">Conteneur visuel pour regrouper des informations liées. 3 variantes, 4 paddings, slots header/body/footer avec séparateurs automatiques. Non interactif par défaut.</span>
  <span class="lang-en">Visual container for grouping related information. 3 variants, 4 paddings, header/body/footer slots with automatic separators. Non-interactive by default.</span>
</p>

<h2 class="first"><span class="lang-fr">Variantes</span><span class="lang-en">Variants</span></h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Trois variantes</span><span class="lang-en">Three variants</span></span>
    <div class="demo-row" style="gap:16px;align-items:flex-start;flex-wrap:wrap">
      ${cardDemo('default', 'Bordure fine, usage général.', 'Thin border, general use.')}
      ${cardDemo('elevated', 'Ombre portée, mise en avant.', 'Drop shadow, highlighted.', 'box-shadow:var(--agtc-component-card-elevated-shadow)')}
      ${cardDemo('flat', 'Fond subtil, sections secondaires.', 'Subtle background, secondary sections.')}
    </div>
  </div>
</div>

<h2><span class="lang-fr">Slots</span><span class="lang-en">Slots</span></h2>
<table class="token-table">
  <thead><tr><th>Slot</th><th><span class="lang-fr">Comportement</span><span class="lang-en">Behavior</span></th></tr></thead>
  <tbody>
    <tr><td><code>header</code></td><td><span class="lang-fr">Séparateur bas automatique si contenu présent</span><span class="lang-en">Automatic bottom separator if content present</span></td></tr>
    <tr><td><span class="lang-fr">(défaut)</span><span class="lang-en">(default)</span></td><td><span class="lang-fr">Corps de la carte</span><span class="lang-en">Card body</span></td></tr>
    <tr><td><code>footer</code></td><td><span class="lang-fr">Séparateur haut automatique si contenu présent</span><span class="lang-en">Automatic top separator if content present</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Padding</span><span class="lang-en">Padding</span></h2>
<table class="token-table">
  <thead><tr><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Token</span><span class="lang-en">Token</span></th><th><span class="lang-fr">Usage</span><span class="lang-en">Usage</span></th></tr></thead>
  <tbody>
    <tr><td><code>none</code></td><td><code>0px</code></td><td><span class="lang-fr">Médias plein-bord, listes sans padding</span><span class="lang-en">Full-bleed media, lists without padding</span></td></tr>
    <tr><td><code>sm</code></td><td><code>primitive.space.3</code></td><td><span class="lang-fr">Espaces contraints</span><span class="lang-en">Constrained spaces</span></td></tr>
    <tr><td><code>md</code></td><td><code>semantic.space.layout.component</code></td><td><span class="lang-fr">Défaut — usage général</span><span class="lang-en">Default — general use</span></td></tr>
    <tr><td><code>lg</code></td><td><code>primitive.space.6</code></td><td><span class="lang-fr">Contenu spacieux, formulaires</span><span class="lang-en">Spacious content, forms</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr">Non interactif par défaut — sémantique neutre (<code>&lt;div&gt;</code>)</span><span class="lang-en">Non-interactive by default — neutral semantics (<code>&lt;div&gt;</code>)</span></li>
  <li><span class="lang-fr">Carte cliquable : encapsuler dans un <code>&lt;a&gt;</code> avec texte accessible</span><span class="lang-en">Clickable card: wrap in an <code>&lt;a&gt;</code> with accessible text</span></li>
  <li><span class="lang-fr"><code>overflow: hidden</code> — le contenu ne déborde jamais du rayon</span><span class="lang-en"><code>overflow: hidden</code> — content never overflows the border radius</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Défaut --&gt;
&lt;agtc-card&gt;
  &lt;p&gt;<span class="lang-fr">Contenu de la carte.</span><span class="lang-en">Card content.</span>&lt;/p&gt;
&lt;/agtc-card&gt;

&lt;!-- Elevated avec header et footer --&gt;
&lt;agtc-card variant="elevated" padding="lg"&gt;
  &lt;span slot="header"&gt;<span class="lang-fr">Titre</span><span class="lang-en">Title</span>&lt;/span&gt;
  &lt;p&gt;<span class="lang-fr">Contenu principal.</span><span class="lang-en">Main content.</span>&lt;/p&gt;
  &lt;div slot="footer"&gt;
    &lt;agtc-button variant="primary"&gt;<span class="lang-fr">Confirmer</span><span class="lang-en">Confirm</span>&lt;/agtc-button&gt;
  &lt;/div&gt;
&lt;/agtc-card&gt;

&lt;!-- Flat --&gt;
&lt;agtc-card variant="flat"&gt;
  &lt;p&gt;<span class="lang-fr">Section secondaire.</span><span class="lang-en">Secondary section.</span>&lt;/p&gt;
&lt;/agtc-card&gt;

&lt;!-- Carte cliquable --&gt;
&lt;agtc-card variant="elevated"&gt;
  &lt;a href="/detail" style="display:block;text-decoration:none"&gt;
    &lt;h3&gt;<span class="lang-fr">Titre</span><span class="lang-en">Title</span>&lt;/h3&gt;
  &lt;/a&gt;
&lt;/agtc-card&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Utiliser <code>padding="none"</code> pour les médias plein-bord</span><span class="lang-en">Use <code>padding="none"</code> for full-bleed media</span></li>
      <li><span class="lang-fr">Encapsuler dans <code>&lt;a&gt;</code> pour une carte cliquable</span><span class="lang-en">Wrap in <code>&lt;a&gt;</code> for a clickable card</span></li>
      <li><span class="lang-fr">Utiliser <code>slot="footer"</code> pour les actions</span><span class="lang-en">Use <code>slot="footer"</code> for actions</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Carte cliquable sans <code>&lt;a&gt;</code> — non accessible</span><span class="lang-en">Clickable card without <code>&lt;a&gt;</code> — inaccessible</span></li>
      <li><span class="lang-fr">Fond ou padding en dur — utiliser les attributs <code>variant</code> et <code>padding</code></span><span class="lang-en">Hardcoded background or padding — use <code>variant</code> and <code>padding</code> attributes</span></li>
      <li><span class="lang-fr">Variante inventée hors de <code>component.json</code></span><span class="lang-en">Invented variant outside <code>component.json</code></span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/card.html'), layout({
    title: 'Card', depth: 1,
    sidebar: sidebarComponents('../','card.html'),
    body: body + uxPatternsFromMd('card') + contributionBanner()
  }));
}

// ─── PAGE: CHECKBOX ──────────────────────────────────────────────────────────
function buildCheckbox() {
  // Rendu statique tokenisé d'une case (carrée). state: 'default' | 'checked' | 'indeterminate' | 'disabled' | 'disabled-checked'
  const BOX = 'width:var(--agtc-semantic-icon-size-control);height:var(--agtc-semantic-icon-size-control);border-radius:var(--agtc-semantic-radius-control);flex-shrink:0;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center';
  const GLYPH = 'width:78%;height:78%;fill:none;stroke:var(--agtc-semantic-color-text-on-action);stroke-width:3;stroke-linecap:round;stroke-linejoin:round';
  function box(state) {
    if (state === 'checked')
      return `<span style="${BOX};border:1.5px solid var(--agtc-semantic-color-action-primary);background:var(--agtc-semantic-color-action-primary)"><svg viewBox="0 0 24 24" style="${GLYPH}"><path d="M5 12.5l4 4L19 7"/></svg></span>`;
    if (state === 'indeterminate')
      return `<span style="${BOX};border:1.5px solid var(--agtc-semantic-color-action-primary);background:var(--agtc-semantic-color-action-primary)"><svg viewBox="0 0 24 24" style="${GLYPH}"><path d="M6 12h12"/></svg></span>`;
    if (state === 'disabled-checked')
      return `<span style="${BOX};border:1.5px solid var(--agtc-semantic-color-action-primary-disabled);background:var(--agtc-semantic-color-action-primary-disabled)"><svg viewBox="0 0 24 24" style="${GLYPH}"><path d="M5 12.5l4 4L19 7"/></svg></span>`;
    if (state === 'disabled')
      return `<span style="${BOX};border:1.5px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-subtle)"></span>`;
    return `<span style="${BOX};border:1.5px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-surface)"></span>`;
  }
  function row(state, label, dim) {
    return `<span${dim?' aria-disabled="true"':''} style="display:inline-flex;align-items:center;gap:var(--agtc-semantic-space-control-gap);min-height:24px${dim?';opacity:.6':''}">${box(state)}<span style="font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-${dim?'disabled':'primary'})">${label}</span></span>`;
  }

  const tokenRows = [
    ['checkbox-default-background',   'semantic.color.background.surface',   SEM['color-background-surface']],
    ['checkbox-default-border',       'semantic.color.border.default',       SEM['color-border-default']],
    ['checkbox-default-border-hover', 'semantic.color.action.primary',       SEM['color-action-primary']],
    ['checkbox-default-border-focus', 'semantic.color.border.focus',         SEM['color-border-focus']],
    ['checkbox-default-fill',         'semantic.color.action.primary',       SEM['color-action-primary']],
    ['checkbox-default-fill-hover',   'semantic.color.action.primary-hover', SEM['color-action-primary-hover']],
    ['checkbox-default-check',        'semantic.color.text.on-action',       SEM['color-text-on-action']],
    ['checkbox-default-label',        'semantic.color.text.primary',         SEM['color-text-primary']],
    ['checkbox-default-radius',       'semantic.radius.control',             SEM['radius-control']],
  ];

  const body = `
<h1>Checkbox</h1>
<p class="page-lead">
  <span class="lang-fr">Sélection binaire indépendante — cocher/décocher une option ou marquer une tâche faite. Forme <strong>carrée</strong> par convention (NN/g) : le rond signale un bouton radio. Le libellé est cliquable et la cible tactile fait ≥ 24px (WCAG 2.5.8).</span>
  <span class="lang-en">Independent binary selection — check/uncheck an option or mark a task done. <strong>Square</strong> shape by convention (NN/g): round signals a radio button. The label is clickable and the touch target is ≥ 24px (WCAG 2.5.8).</span>
</p>

<h2 class="first"><span class="lang-fr">États</span><span class="lang-en">States</span></h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Default · Checked · Indeterminate</span><span class="lang-en">Default · Checked · Indeterminate</span></span>
    <div class="demo-row demo-col">
      ${row('default', '<span class="lang-fr">Recevoir la newsletter</span><span class="lang-en">Receive the newsletter</span>')}
      ${row('checked', '<span class="lang-fr">Notifications activées</span><span class="lang-en">Notifications enabled</span>')}
      ${row('indeterminate', '<span class="lang-fr">Tout sélectionner (partiel)</span><span class="lang-en">Select all (partial)</span>')}
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Désactivé</span><span class="lang-en">Disabled</span></span>
    <div class="demo-row demo-col">
      ${row('disabled', '<span class="lang-fr">Option indisponible</span><span class="lang-en">Option unavailable</span>', true)}
      ${row('disabled-checked', '<span class="lang-fr">Option verrouillée</span><span class="lang-en">Locked option</span>', true)}
    </div>
  </div>
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Forme carrée — jamais ronde (le rond = radio, NN/g)</span><span class="lang-en">Square shape — never round (round = radio, NN/g)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Libellé cliquable (case ou texte) + cible ≥ 24px</span><span class="lang-en">Clickable label (box or text) + ≥ 24px target</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr"><code>&lt;input type="checkbox"&gt;</code> natif — rôle et clavier gérés nativement</span><span class="lang-en">Native <code>&lt;input type="checkbox"&gt;</code> — role and keyboard handled natively</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de case pré-cochée pour un consentement (dark pattern)</span><span class="lang-en">Never a pre-checked consent box (dark pattern)</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de libellé en négation (« Ne pas m'envoyer… »)</span><span class="lang-en">Never a negated label ("Don't send me…")</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence sémantique</span><span class="lang-en">Semantic reference</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr">Élément accessible : <code>&lt;input type="checkbox"&gt;</code> natif dans un <code>&lt;label&gt;</code> englobant</span><span class="lang-en">Accessible element: native <code>&lt;input type="checkbox"&gt;</code> inside a wrapping <code>&lt;label&gt;</code></span></li>
  <li><span class="lang-fr">Focus visible : <code>outline</code> sur la case via <code>:focus-visible</code></span><span class="lang-en">Visible focus: <code>outline</code> on the box via <code>:focus-visible</code></span></li>
  <li><span class="lang-fr">Indéterminé : propriété DOM <code>indeterminate</code> → <code>aria-checked="mixed"</code></span><span class="lang-en">Indeterminate: DOM <code>indeterminate</code> property → <code>aria-checked="mixed"</code></span></li>
  <li><span class="lang-fr">Cible tactile ≥ 24×24px (WCAG 2.5.8)</span><span class="lang-en">Touch target ≥ 24×24px (WCAG 2.5.8)</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Basique --&gt;
&lt;agtc-checkbox label="<span class="lang-fr">Recevoir la newsletter</span><span class="lang-en">Receive the newsletter</span>" name="newsletter"&gt;&lt;/agtc-checkbox&gt;

&lt;!-- Cochée --&gt;
&lt;agtc-checkbox label="<span class="lang-fr">Notifications activées</span><span class="lang-en">Notifications enabled</span>" checked&gt;&lt;/agtc-checkbox&gt;

&lt;!-- Parent d'un groupe « tout cocher » --&gt;
&lt;agtc-checkbox label="<span class="lang-fr">Tout sélectionner</span><span class="lang-en">Select all</span>" indeterminate&gt;&lt;/agtc-checkbox&gt;

&lt;!-- Texte en slot --&gt;
&lt;agtc-checkbox&gt;<span class="lang-fr">J'accepte les</span><span class="lang-en">I accept the</span> &lt;a href="/cgu"&gt;<span class="lang-fr">conditions</span><span class="lang-en">terms</span>&lt;/a&gt;&lt;/agtc-checkbox&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Utiliser une checkbox pour une sélection indépendante (0–N)</span><span class="lang-en">Use a checkbox for independent selection (0–N)</span></li>
      <li><span class="lang-fr">Formuler le libellé positivement</span><span class="lang-en">Phrase the label positively</span></li>
      <li><span class="lang-fr">Écouter <code>agtc-change</code> pour réagir à la bascule</span><span class="lang-en">Listen to <code>agtc-change</code> to react to toggling</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Forme ronde — confusion avec un radio</span><span class="lang-en">Round shape — confusion with a radio</span></li>
      <li><span class="lang-fr">Checkbox pour un réglage à effet immédiat — préférer un toggle</span><span class="lang-en">Checkbox for an immediate-effect setting — prefer a toggle</span></li>
      <li><span class="lang-fr">Case pré-cochée pour un consentement</span><span class="lang-en">Pre-checked consent box</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/checkbox.html'), layout({
    title: 'Checkbox', depth: 1,
    sidebar: sidebarComponents('../','checkbox.html'),
    body: body + uxPatternsFromMd('checkbox') + contributionBanner()
  }));
}

// ─── PAGE: RADIO ─────────────────────────────────────────────────────────────
function buildRadio() {
  const RING = 'width:var(--agtc-semantic-icon-size-control);height:var(--agtc-semantic-icon-size-control);border-radius:var(--agtc-semantic-radius-pill);flex-shrink:0;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center';
  function radio(state) {
    if (state === 'selected')
      return `<span style="${RING};border:1.5px solid var(--agtc-semantic-color-action-primary);background:var(--agtc-semantic-color-background-surface)"><span style="width:50%;height:50%;border-radius:var(--agtc-semantic-radius-pill);background:var(--agtc-semantic-color-action-primary)"></span></span>`;
    if (state === 'disabled')
      return `<span style="${RING};border:1.5px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-subtle)"></span>`;
    return `<span style="${RING};border:1.5px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-surface)"></span>`;
  }
  function row(state, label, dim) {
    return `<span${dim?' aria-disabled="true"':''} style="display:inline-flex;align-items:center;gap:var(--agtc-semantic-space-control-gap);min-height:24px${dim?';opacity:.6':''}">${radio(state)}<span style="font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-${dim?'disabled':'primary'})">${label}</span></span>`;
  }

  const tokenRows = [
    ['radio-default-background',   'semantic.color.background.surface',   SEM['color-background-surface']],
    ['radio-default-border',       'semantic.color.border.default',       SEM['color-border-default']],
    ['radio-default-border-hover', 'semantic.color.action.primary',       SEM['color-action-primary']],
    ['radio-default-border-focus', 'semantic.color.border.focus',         SEM['color-border-focus']],
    ['radio-default-fill',         'semantic.color.action.primary',       SEM['color-action-primary']],
    ['radio-default-label',        'semantic.color.text.primary',         SEM['color-text-primary']],
  ];

  const body = `
<h1>Radio</h1>
<p class="page-lead">
  <span class="lang-fr">Sélection mutuellement exclusive — exactement un choix. Forme <strong>ronde</strong> (NN/g) : le carré signale une checkbox. Toujours dans un <code>&lt;agtc-radio-group&gt;</code> qui gère l'exclusivité, le focus roving et la navigation aux flèches.</span>
  <span class="lang-en">Mutually exclusive selection — exactly one choice. <strong>Round</strong> shape (NN/g): square signals a checkbox. Always inside an <code>&lt;agtc-radio-group&gt;</code> handling exclusivity, roving focus, and arrow navigation.</span>
</p>

<h2 class="first"><span class="lang-fr">États</span><span class="lang-en">States</span></h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Groupe « Formule »</span><span class="lang-en">"Plan" group</span></span>
    <div class="demo-row demo-col">
      ${row('default', 'Gratuit')}
      ${row('selected', 'Pro')}
      ${row('disabled', '<span class="lang-fr">Équipe (bientôt)</span><span class="lang-en">Team (soon)</span>', true)}
    </div>
  </div>
</div>

<h2><span class="lang-fr">Navigation clavier</span><span class="lang-en">Keyboard navigation</span></h2>
<table class="token-table">
  <thead><tr><th><span class="lang-fr">Touche</span><span class="lang-en">Key</span></th><th>Action</th></tr></thead>
  <tbody>
    <tr><td><code>Tab</code></td><td><span class="lang-fr">Entre/sort du groupe (focus roving)</span><span class="lang-en">Enter/leave the group (roving focus)</span></td></tr>
    <tr><td><code>↓</code> / <code>→</code></td><td><span class="lang-fr">Option suivante (sélectionne, boucle)</span><span class="lang-en">Next option (selects, wraps)</span></td></tr>
    <tr><td><code>↑</code> / <code>←</code></td><td><span class="lang-fr">Option précédente (sélectionne, boucle)</span><span class="lang-en">Previous option (selects, wraps)</span></td></tr>
    <tr><td><code>Espace</code></td><td><span class="lang-fr">Sélectionne l'option focalisée (<code>Entrée</code> réservé à la soumission)</span><span class="lang-en">Selects the focused option (<code>Enter</code> reserved for submission)</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Forme ronde — jamais carrée (le carré = checkbox)</span><span class="lang-en">Round shape — never square (square = checkbox)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours dans un <code>&lt;agtc-radio-group&gt;</code></span><span class="lang-en">Always inside an <code>&lt;agtc-radio-group&gt;</code></span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Pré-sélectionner un défaut sensé (sauf exception éthique/légale)</span><span class="lang-en">Pre-select a sensible default (except ethical/legal cases)</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Sélection multiple attendue — utiliser des checkboxes</span><span class="lang-en">Multiple selection expected — use checkboxes</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence sémantique</span><span class="lang-en">Semantic reference</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;agtc-radio-group name="plan" value="pro" label="<span class="lang-fr">Formule</span><span class="lang-en">Plan</span>"&gt;
  &lt;agtc-radio value="free"&gt;<span class="lang-fr">Gratuit</span><span class="lang-en">Free</span>&lt;/agtc-radio&gt;
  &lt;agtc-radio value="pro"&gt;Pro&lt;/agtc-radio&gt;
  &lt;agtc-radio value="team"&gt;<span class="lang-fr">Équipe</span><span class="lang-en">Team</span>&lt;/agtc-radio&gt;
&lt;/agtc-radio-group&gt;</code></pre>
`;

  write(path.join(DIST, 'components/radio.html'), layout({
    title: 'Radio', depth: 1,
    sidebar: sidebarComponents('../','radio.html'),
    body: body + uxPatternsFromMd('radio') + contributionBanner()
  }));
}

// ─── PAGE: TOGGLE ────────────────────────────────────────────────────────────
function buildToggle() {
  function toggle(on, dim) {
    const track = on ? 'var(--agtc-component-toggle-default-track-on)' : 'var(--agtc-component-toggle-default-track-off)';
    const x = on ? '18px' : '2px';
    // Ombre du curseur en dur : reflète fidèlement le composant agtc-toggle (délimiteur WCAG 1.4.11, non tokenisé dans le contrat).
    return `<span style="position:relative;display:inline-block;width:40px;height:24px;border-radius:var(--agtc-semantic-radius-pill);background:${track};flex-shrink:0${dim?';opacity:.5':''}"><span style="position:absolute;top:2px;left:${x};width:20px;height:20px;border-radius:var(--agtc-semantic-radius-pill);background:var(--agtc-component-toggle-default-knob);box-shadow:0 1px 2px rgba(0,0,0,.25)"></span></span>`;
  }
  function row(on, label, dim) {
    return `<span${dim?' aria-disabled="true"':''} style="display:inline-flex;align-items:center;gap:var(--agtc-semantic-space-control-gap);min-height:24px">${toggle(on, dim)}<span style="font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-${dim?'disabled':'primary'})">${label}</span></span>`;
  }

  const tokenRows = [
    ['toggle-default-track-off',       'primitive.color.gray.9',              '#8d8d8d'],
    ['toggle-default-track-off-hover', 'primitive.color.gray.10',             '#838383'],
    ['toggle-default-track-on',        'semantic.color.action.primary',       SEM['color-action-primary']],
    ['toggle-default-track-on-hover',  'semantic.color.action.primary-hover', SEM['color-action-primary-hover']],
    ['toggle-default-knob',            'semantic.color.background.surface',   SEM['color-background-surface']],
    ['toggle-default-border-focus',    'semantic.color.border.focus',         SEM['color-border-focus']],
    ['toggle-default-label',           'semantic.color.text.primary',         SEM['color-text-primary']],
  ];

  const body = `
<h1>Toggle</h1>
<p class="page-lead">
  <span class="lang-fr">Interrupteur on/off à <strong>effet immédiat</strong> — le changement s'applique instantanément, sans bouton « Enregistrer ». L'état est signalé par la <strong>position du curseur</strong> (indicateur non-couleur, WCAG 1.4.1).</span>
  <span class="lang-en">Immediate-effect on/off switch — the change applies instantly, no "Save" button. State is signaled by the <strong>knob position</strong> (non-color indicator, WCAG 1.4.1).</span>
</p>

<h2 class="first"><span class="lang-fr">États</span><span class="lang-en">States</span></h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label">Off · On</span>
    <div class="demo-row demo-col">
      ${row(false, '<span class="lang-fr">Mode sombre</span><span class="lang-en">Dark mode</span>')}
      ${row(true, '<span class="lang-fr">Notifications par e-mail</span><span class="lang-en">Email notifications</span>')}
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Désactivé</span><span class="lang-en">Disabled</span></span>
    <div class="demo-row demo-col">
      ${row(false, '<span class="lang-fr">Synchronisation</span><span class="lang-en">Sync</span>', true)}
      ${row(true, '<span class="lang-fr">Sauvegarde auto</span><span class="lang-en">Auto-save</span>', true)}
    </div>
  </div>
</div>

<h2><span class="lang-fr">Checkbox ou toggle ?</span><span class="lang-en">Checkbox or toggle?</span></h2>
<table class="token-table">
  <thead><tr><th></th><th>Checkbox</th><th>Toggle</th></tr></thead>
  <tbody>
    <tr><td><span class="lang-fr">Effet</span><span class="lang-en">Effect</span></td><td><span class="lang-fr">À la soumission</span><span class="lang-en">On submit</span></td><td><span class="lang-fr"><strong>Immédiat</strong></span><span class="lang-en"><strong>Immediate</strong></span></td></tr>
    <tr><td><span class="lang-fr">Usage</span><span class="lang-en">Use</span></td><td><span class="lang-fr">Sélection 0–N dans un formulaire</span><span class="lang-en">0–N selection in a form</span></td><td><span class="lang-fr">Réglage on/off instantané</span><span class="lang-en">Instant on/off setting</span></td></tr>
    <tr><td><span class="lang-fr">Exemple</span><span class="lang-en">Example</span></td><td>« J'accepte les CGU »</td><td><span class="lang-fr">« Mode sombre »</span><span class="lang-en">"Dark mode"</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Effet immédiat — jamais dans un formulaire soumis ensemble</span><span class="lang-en">Immediate effect — never in a submitted form</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">État signalé par la position (pas la couleur seule)</span><span class="lang-en">State signaled by position (not color alone)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr"><code>role="switch"</code> natif, clavier Espace</span><span class="lang-en">Native <code>role="switch"</code>, Space key</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Libellé interrogatif — préférer un libellé concis</span><span class="lang-en">Interrogative label — prefer a concise one</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;agtc-toggle label="<span class="lang-fr">Notifications par e-mail</span><span class="lang-en">Email notifications</span>" name="email-notif"&gt;&lt;/agtc-toggle&gt;
&lt;agtc-toggle label="<span class="lang-fr">Mode sombre</span><span class="lang-en">Dark mode</span>" checked&gt;&lt;/agtc-toggle&gt;</code></pre>
`;

  write(path.join(DIST, 'components/toggle.html'), layout({
    title: 'Toggle', depth: 1,
    sidebar: sidebarComponents('../','toggle.html'),
    body: body + uxPatternsFromMd('toggle') + contributionBanner()
  }));
}

// ─── PAGE: TABLE ─────────────────────────────────────────────────────────────
function buildTable() {
  const tokenRows = [
    ['table-default-header-background', 'semantic.color.background.subtle', SEM['color-background-subtle']],
    ['table-default-header-text',       'semantic.color.text.secondary',    SEM['color-text-secondary']],
    ['table-default-cell-text',         'semantic.color.text.primary',      SEM['color-text-primary']],
    ['table-default-border',            'semantic.color.border.default',    SEM['color-border-default']],
    ['table-default-row-hover',         'semantic.color.background.hover',   SEM['color-background-hover']],
    ['table-default-stripe',            'semantic.color.background.subtle',  SEM['color-background-subtle']],
    ['table-default-caption-text',      'semantic.color.text.secondary',     SEM['color-text-secondary']],
    ['table-default-radius',            'semantic.radius.card',              SEM['radius-card']],
    ['table-default-font-size',         'semantic.typography.label.size',    SEM['typography-label-size']],
    ['table-padding-x',                 'primitive.space.3',                 '12px'],
    ['table-padding-y-compact',         'primitive.space.2',                 '8px'],
    ['table-padding-y-comfortable',     'primitive.space.3',                 '12px'],
  ];

  // Démo : vrai <table class="agtc-table"> — côté light DOM du mix, sans JS.
  const demoTable = (striped) => `
    <table class="agtc-table${striped ? ' striped' : ''}">
      <caption class="visually-hidden"><span class="lang-fr">Exemple de tokens d'espacement</span><span class="lang-en">Spacing token example</span></caption>
      <thead><tr>
        <th scope="col"><span class="lang-fr">Échelon</span><span class="lang-en">Step</span></th>
        <th scope="col"><span class="lang-fr">Rôle</span><span class="lang-en">Role</span></th>
        <th scope="col" class="num"><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th>
      </tr></thead>
      <tbody>
        <tr><td><code>space-1</code></td><td><span class="lang-fr">Espacement minimal</span><span class="lang-en">Minimal spacing</span></td><td class="num">4px</td></tr>
        <tr><td><code>space-2</code></td><td><span class="lang-fr">Contrôles denses</span><span class="lang-en">Dense controls</span></td><td class="num">8px</td></tr>
        <tr><td><code>space-3</code></td><td><span class="lang-fr">Padding standard</span><span class="lang-en">Standard padding</span></td><td class="num">12px</td></tr>
        <tr><td><code>space-4</code></td><td><span class="lang-fr">Espacement de contrôle</span><span class="lang-en">Control spacing</span></td><td class="num">16px</td></tr>
      </tbody>
    </table>`;

  const body = `
<h1>Table</h1>
<p class="page-lead">
  <span class="lang-fr">Table de données en lecture seule, lisible et accessible. Le composant le plus utilisé du système (tables de tokens). Deux formes — composant piloté par données et classe sur un <code>&lt;table&gt;</code> statique — partageant les mêmes tokens.</span>
  <span class="lang-en">Read-only, scannable, accessible data table. The system's most-used component (token tables). Two forms — data-driven component and a class on a static <code>&lt;table&gt;</code> — sharing the same tokens.</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu — séparateurs (défaut)</span><span class="lang-en">Preview — dividers (default)</span></h2>
<div class="demo-box">${demoTable(false)}</div>

<h2><span class="lang-fr">Zébrage (option)</span><span class="lang-en">Striped (option)</span></h2>
<div class="demo-box">${demoTable(true)}</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr"><code>&lt;table&gt;</code> sémantique réel — jamais des <code>&lt;div&gt;</code> en grille</span><span class="lang-en">Real semantic <code>&lt;table&gt;</code> — never grid <code>&lt;div&gt;</code>s</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr"><code>scope="col"</code> sur chaque <code>&lt;th&gt;</code> + <code>&lt;caption&gt;</code> (visible ou masqué)</span><span class="lang-en"><code>scope="col"</code> on every <code>&lt;th&gt;</code> + <code>&lt;caption&gt;</code> (visible or hidden)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Valeurs numériques alignées à droite</span><span class="lang-en">Numeric values right-aligned</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de table pour faire de la mise en page</span><span class="lang-en">Never a table for layout</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de couleur/espacement codé en dur</span><span class="lang-en">Never hardcoded color/spacing</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:46%"><col style="width:34%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr">Structure <code>&lt;table&gt;</code>/<code>&lt;thead&gt;</code>/<code>&lt;tbody&gt;</code> sémantique réelle</span><span class="lang-en">Real semantic <code>&lt;table&gt;</code>/<code>&lt;thead&gt;</code>/<code>&lt;tbody&gt;</code> structure</span></li>
  <li><span class="lang-fr"><code>scope="col"</code> — association cellule↔en-tête</span><span class="lang-en"><code>scope="col"</code> — cell↔header association</span></li>
  <li><span class="lang-fr"><code>&lt;caption&gt;</code> décrit la table (WCAG 1.3.1) — masquable via <code>caption-hidden</code></span><span class="lang-en"><code>&lt;caption&gt;</code> describes the table (WCAG 1.3.1) — hideable via <code>caption-hidden</code></span></li>
  <li><span class="lang-fr">Conteneur de scroll focalisable au clavier, indicateur d'overflow visible</span><span class="lang-en">Keyboard-focusable scroll container, visible overflow indicator</span></li>
  <li><span class="lang-fr">Contraste 4.5:1 vérifié (texte gris.12 sur blanc/gris.3)</span><span class="lang-en">4.5:1 contrast verified (gray.12 text on white/gray.3)</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Composant piloté par données --&gt;
&lt;agtc-table caption="Tokens du badge" caption-hidden&gt;&lt;/agtc-table&gt;
&lt;script&gt;
  const t = document.querySelector('agtc-table');
  t.columns = [
    { label: 'Token CSS', align: 'start', width: '46%' },
    { label: 'Référence', align: 'start' },
    { label: 'Valeur',    align: 'end' },
  ];
  t.rows = [
    ['--agtc-badge-neutral-background', 'semantic.color.background.subtle', '#f0f0f0'],
  ];
&lt;/script&gt;

&lt;!-- Classe sur un table statique (light DOM, sans JS) --&gt;
&lt;table class="agtc-table striped"&gt;
  &lt;caption class="visually-hidden"&gt;Tokens du badge&lt;/caption&gt;
  &lt;thead&gt;&lt;tr&gt;&lt;th scope="col"&gt;Token&lt;/th&gt;&lt;th scope="col" class="num"&gt;Valeur&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;
  &lt;tbody&gt;&lt;tr&gt;&lt;td&gt;&lt;code&gt;--agtc-badge-neutral-text&lt;/code&gt;&lt;/td&gt;&lt;td class="num"&gt;#646464&lt;/td&gt;&lt;/tr&gt;&lt;/tbody&gt;
&lt;/table&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Toujours une <code>&lt;caption&gt;</code> (masquée si besoin) et <code>scope</code></span><span class="lang-en">Always a <code>&lt;caption&gt;</code> (hidden if needed) and <code>scope</code></span></li>
      <li><span class="lang-fr">Aligner les valeurs numériques à droite (<code>class="num"</code>)</span><span class="lang-en">Right-align numeric values (<code>class="num"</code>)</span></li>
      <li><span class="lang-fr">1ʳᵉ colonne = identifiant lisible, colonnes ordonnées par importance</span><span class="lang-en">1st column = readable identifier, columns ordered by importance</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Des <code>&lt;div&gt;</code> simulant une table — inaccessible</span><span class="lang-en"><code>&lt;div&gt;</code>s faking a table — inaccessible</span></li>
      <li><span class="lang-fr">Une table pour disposer des éléments non tabulaires</span><span class="lang-en">A table to lay out non-tabular elements</span></li>
      <li><span class="lang-fr">Croire que la v1 trie/filtre — c'est en lecture seule (porte ouverte)</span><span class="lang-en">Expecting v1 to sort/filter — it's read-only (door open)</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/table.html'), layout({
    title: 'Table', depth: 1,
    sidebar: sidebarComponents('../','table.html'),
    body: body + uxPatternsFromMd('table') + contributionBanner()
  }));
}

// ─── PAGE: CODE BLOCK ────────────────────────────────────────────────────────
function buildCodeBlock() {
  const tokenRows = [
    ['code-block-default-background',            'primitive.color.gray.12', '#202020'],
    ['code-block-default-text',                  'primitive.color.gray.4',  '#e8e8e8'],
    ['code-block-default-meta-text',             'primitive.color.gray.8',  '#bbbbbb'],
    ['code-block-default-copy-background',       'primitive.color.gray.11', '#646464'],
    ['code-block-default-copy-text',             'primitive.color.gray.1',  '#fcfcfc'],
    ['code-block-default-border-focus',          'semantic.color.border.focus', SEM['color-border-focus']],
    ['code-block-default-font-size',             'semantic.typography.label.size', SEM['typography-label-size']],
    ['code-block-default-padding-x',             'primitive.space.5',       '20px'],
    ['code-block-default-padding-y',             'primitive.space.4',       '16px'],
  ];

  const body = `
<h1>Code Block</h1>
<p class="page-lead">
  <span class="lang-fr">Bloc de code en lecture seule, copiable, avec indicateur de langue, sur surface sombre tokenisée. Bouton copier accessible (annonce aux lecteurs d'écran). Présent sur presque chaque page du système.</span>
  <span class="lang-en">Read-only, copyable code block with a language indicator on a tokenized dark surface. Accessible copy button (announced to screen readers). Present on nearly every page of the system.</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu</span><span class="lang-en">Preview</span></h2>
<p style="color:var(--agtc-semantic-color-text-secondary)">
  <span class="lang-fr">Ce bloc ci-dessous est un <code>pre.code-block</code> réel — label de langue en haut à gauche, bouton « Copier » accessible en haut à droite.</span>
  <span class="lang-en">The block below is a real <code>pre.code-block</code> — language label top-left, accessible "Copy" button top-right.</span>
</p>
<pre class="code-block"><code class="lang-html">&lt;agtc-code-block language="html" filename="exemple.html"&gt;
  &lt;code&gt;&lt;agtc-badge variant="success"&gt;Validé&lt;/agtc-badge&gt;&lt;/code&gt;
&lt;/agtc-code-block&gt;</code></pre>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr"><code>&lt;pre&gt;&lt;code&gt;</code> sémantique réel — jamais des <code>&lt;div&gt;</code></span><span class="lang-en">Real semantic <code>&lt;pre&gt;&lt;code&gt;</code> — never <code>&lt;div&gt;</code>s</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Bouton copier = <code>&lt;button&gt;</code> réel, <code>aria-label</code>, focus visible, succès annoncé (<code>aria-live</code>)</span><span class="lang-en">Copy button = real <code>&lt;button&gt;</code>, <code>aria-label</code>, visible focus, success announced (<code>aria-live</code>)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Lignes longues : scroll horizontal — jamais de wrap qui casse le code</span><span class="lang-en">Long lines: horizontal scroll — never wrap that breaks the code</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de couleur/police codée en dur</span><span class="lang-en">Never hardcoded color/font</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:46%"><col style="width:34%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr"><code>&lt;pre&gt;&lt;code&gt;</code> sémantique, le code reste sélectionnable</span><span class="lang-en">Semantic <code>&lt;pre&gt;&lt;code&gt;</code>, code stays selectable</span></li>
  <li><span class="lang-fr">Bouton copier atteignable au clavier, <code>aria-label</code> (langue incluse), <code>:focus-visible</code></span><span class="lang-en">Copy button keyboard-reachable, <code>aria-label</code> (language included), <code>:focus-visible</code></span></li>
  <li><span class="lang-fr">Copie annoncée aux AT via <code>role="status"</code> + <code>aria-live="polite"</code></span><span class="lang-en">Copy announced to AT via <code>role="status"</code> + <code>aria-live="polite"</code></span></li>
  <li><span class="lang-fr">Contraste texte gris.4 sur gris.12 ≥ 13:1 ; bouton et langue ≥ 4.5:1</span><span class="lang-en">Contrast gray.4 on gray.12 ≥ 13:1; button and language ≥ 4.5:1</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Composant slotté --&gt;
&lt;agtc-code-block language="javascript" filename="agtc-badge.js"&gt;
  &lt;code&gt;import { LitElement } from 'lit';&lt;/code&gt;
&lt;/agtc-code-block&gt;

&lt;!-- Classe sur HTML statique (site) --&gt;
&lt;pre class="code-block"&gt;&lt;code class="lang-html"&gt;&amp;lt;agtc-badge&amp;gt;Validé&amp;lt;/agtc-badge&amp;gt;&lt;/code&gt;&lt;/pre&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Indiquer la langue (<code>language</code> ou <code>class="lang-…"</code>)</span><span class="lang-en">Indicate the language (<code>language</code> or <code>class="lang-…"</code>)</span></li>
      <li><span class="lang-fr">Laisser les lignes longues défiler horizontalement</span><span class="lang-en">Let long lines scroll horizontally</span></li>
      <li><span class="lang-fr">Garder le code échappé et sélectionnable</span><span class="lang-en">Keep code escaped and selectable</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Un bouton copier sans <code>aria-label</code> ni feedback annoncé</span><span class="lang-en">A copy button without <code>aria-label</code> or announced feedback</span></li>
      <li><span class="lang-fr">Attendre une coloration syntaxique — différée v1 (porte ouverte)</span><span class="lang-en">Expecting syntax highlighting — deferred v1 (door open)</span></li>
      <li><span class="lang-fr">Des <code>&lt;div&gt;</code> stylés en code</span><span class="lang-en"><code>&lt;div&gt;</code>s styled as code</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/code-block.html'), layout({
    title: 'Code Block', depth: 1,
    sidebar: sidebarComponents('../','code-block.html'),
    body: body + uxPatternsFromMd('code-block') + contributionBanner()
  }));
}

// ─── PAGE: BANNER ─────────────────────────────────────────────────────────────
function buildBanner() {
  const tokenRows = [
    ['banner-info-accent',    'semantic.color.feedback.info',          SEM['color-feedback-info']],
    ['banner-success-accent', 'semantic.color.feedback.success',       SEM['color-feedback-success']],
    ['banner-warning-accent', 'primitive.color.orange.11',             ''],
    ['banner-danger-accent',  'semantic.color.feedback.danger',        SEM['color-feedback-danger']],
    ['banner-brand-accent',   'semantic.color.brand.primary',          SEM['color-brand-primary']],
    ['banner-heading-text',   'semantic.color.text.primary',           SEM['color-text-primary']],
    ['banner-body-text',      'semantic.color.text.secondary',         SEM['color-text-secondary']],
    ['banner-radius',         'semantic.radius.card',                  SEM['radius-card']],
    ['banner-padding-x',      'primitive.space.5',                     '20px'],
  ];

  const bannerDemo = (variant, headFr, headEn, bodyFr, bodyEn) => `
    <agtc-banner variant="${variant}">
      <strong><span class="lang-fr">${headFr}</span><span class="lang-en">${headEn}</span></strong>
      <span><span class="lang-fr">${bodyFr}</span><span class="lang-en">${bodyEn}</span></span>
    </agtc-banner>`;

  const body = `
<h1>Banner</h1>
<p class="page-lead">
  <span class="lang-fr">Message inline contextuel (callout / alerte) dans le flux de la page : info, succès, avertissement, erreur. 6 variantes alignées sur le badge. Statique par défaut — région live en opt-in pour les messages dynamiques.</span>
  <span class="lang-en">Inline contextual message (callout / alert) in the page flow: info, success, warning, error. 6 variants aligned with badge. Static by default — opt-in live region for dynamic messages.</span>
</p>

<h2 class="first"><span class="lang-fr">Variantes</span><span class="lang-en">Variants</span></h2>
<div class="demo-box" style="display:flex;flex-direction:column;gap:4px;background:none;border:none;padding:0">
  ${bannerDemo('neutral', 'Neutre', 'Neutral', 'Message neutre informatif.', 'Neutral informational message.')}
  ${bannerDemo('brand', 'Agentica', 'Agentica', 'Highlight de marque ou contribution.', 'Brand highlight or contribution.')}
  ${bannerDemo('info', 'Information', 'Information', 'Ce composant est en lecture seule.', 'This component is read-only.')}
  ${bannerDemo('success', 'Enregistré', 'Saved', 'Vos modifications ont été sauvegardées.', 'Your changes have been saved.')}
  ${bannerDemo('warning', 'Attention', 'Warning', 'Cette action affectera 3 fichiers liés.', 'This action will affect 3 linked files.')}
  ${bannerDemo('danger', 'Erreur', 'Error', 'Impossible de contacter le serveur.', 'Could not reach the server.')}
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Sévérité jamais par la couleur seule — icône + texte de sévérité pour les AT</span><span class="lang-en">Severity never by color alone — icon + severity text for AT</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Banner statique : <strong>aucune</strong> région live ; dynamique : <code>live="polite|assertive"</code></span><span class="lang-en">Static banner: <strong>no</strong> live region; dynamic: <code>live="polite|assertive"</code></span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Bouton fermer = <code>&lt;button&gt;</code> réel, <code>aria-label</code>, focus visible</span><span class="lang-en">Close button = real <code>&lt;button&gt;</code>, <code>aria-label</code>, visible focus</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais pour une notification flottante (utiliser un toast)</span><span class="lang-en">Never for a floating notification (use a toast)</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais d'auto-dismiss d'une erreur</span><span class="lang-en">Never auto-dismiss an error</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:42%"><col style="width:36%"><col style="width:22%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr">Préfixe de sévérité masqué (« Erreur : ») — l'icône est décorative</span><span class="lang-en">Hidden severity prefix ("Error: ") — the icon is decorative</span></li>
  <li><span class="lang-fr">Statique : pas de <code>role</code> live ; dynamique : <code>role="status"</code> ou <code>role="alert"</code></span><span class="lang-en">Static: no live <code>role</code>; dynamic: <code>role="status"</code> or <code>role="alert"</code></span></li>
  <li><span class="lang-fr">Le banner ne capture jamais le focus</span><span class="lang-en">The banner never captures focus</span></li>
  <li><span class="lang-fr">Contraste texte ≥ 4.5:1 sur fond subtil</span><span class="lang-en">Text contrast ≥ 4.5:1 on subtle background</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;agtc-banner variant="warning" heading="Attention"&gt;
  <span class="lang-fr">Cette action affectera 3 fichiers liés.</span><span class="lang-en">This action will affect 3 linked files.</span>
&lt;/agtc-banner&gt;

&lt;!-- Avec actions + dismissible --&gt;
&lt;agtc-banner variant="brand" heading="Contribuer" dismissible&gt;
  <span class="lang-fr">Ce système est ouvert aux contributions.</span><span class="lang-en">This system welcomes contributions.</span>
  &lt;span slot="actions"&gt;&lt;a href="…"&gt;<span class="lang-fr">Voir sur GitHub →</span><span class="lang-en">View on GitHub →</span>&lt;/a&gt;&lt;/span&gt;
&lt;/agtc-banner&gt;

&lt;!-- Notification dynamique (insérée par JS) --&gt;
&lt;agtc-banner variant="danger" live="assertive" heading="Erreur"&gt;…&lt;/agtc-banner&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Choisir la variante par sévérité (success/warning/danger)</span><span class="lang-en">Choose variant by severity (success/warning/danger)</span></li>
      <li><span class="lang-fr">Garder les erreurs persistantes (pas d'auto-dismiss)</span><span class="lang-en">Keep errors persistent (no auto-dismiss)</span></li>
      <li><span class="lang-fr">Mettre <code>live</code> uniquement sur les messages insérés dynamiquement</span><span class="lang-en">Set <code>live</code> only on dynamically inserted messages</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr"><code>role="alert"</code> sur un banner statique de page</span><span class="lang-en"><code>role="alert"</code> on a static page banner</span></li>
      <li><span class="lang-fr">Un banner pour ce qui devrait être un toast ou une modale</span><span class="lang-en">A banner for what should be a toast or modal</span></li>
      <li><span class="lang-fr">La sévérité par la couleur seule</span><span class="lang-en">Severity by color alone</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/banner.html'), layout({
    title: 'Banner', depth: 1,
    sidebar: sidebarComponents('../','banner.html'),
    body: body + uxPatternsFromMd('banner') + contributionBanner()
  }));
}

// ─── PAGE: LINK ───────────────────────────────────────────────────────────────
function buildLink() {
  const tokenRows = [
    ['link-default-text',         'semantic.color.action.primary',       SEM['color-action-primary']],
    ['link-default-text-hover',   'semantic.color.action.primary-hover', SEM['color-action-primary-hover']],
    ['link-default-border-focus', 'semantic.color.border.focus',         SEM['color-border-focus']],
  ];

  // Démo : vrais <agtc-link> — shadow DOM, external gère l'icône et le visually-hidden automatiquement.

  const body = `
<h1>Link</h1>
<p class="page-lead">
  <span class="lang-fr">Lien de navigation textuel — interne ou externe, inline ou nav. Souligné par défaut (WCAG 1.4.1), focus visible, liens externes sécurisés (<code>noopener</code>) et annoncés aux lecteurs d'écran.</span>
  <span class="lang-en">Textual navigation link — internal or external, inline or nav. Underlined by default (WCAG 1.4.1), visible focus, secure external links (<code>noopener</code>) announced to screen readers.</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu</span><span class="lang-en">Preview</span></h2>
<div class="demo-box" style="display:flex;flex-direction:column;gap:14px;align-items:flex-start">
  <p style="margin:0;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Consulter la </span><span class="lang-en">See the </span><agtc-link href="#guideline"><span class="lang-fr">guideline du composant</span><span class="lang-en">component guideline</span></agtc-link><span class="lang-fr"> pour les détails.</span><span class="lang-en"> for details.</span></p>
  <p style="margin:0;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Lien externe : </span><span class="lang-en">External link: </span><agtc-link href="https://www.nngroup.com/articles/guidelines-for-visualizing-links/" external>NN/g — Visualizing Links</agtc-link></p>
  <div style="display:flex;gap:18px"><agtc-link href="#a" underline="hover"><span class="lang-fr">Accueil</span><span class="lang-en">Home</span></agtc-link><agtc-link href="#b" underline="hover"><span class="lang-fr">Composants</span><span class="lang-en">Components</span></agtc-link><agtc-link href="#c" underline="hover">Tokens</agtc-link></div>
</div>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Souligné en texte courant — jamais distinguable par la couleur seule (WCAG 1.4.1)</span><span class="lang-en">Underlined in body text — never distinguishable by color alone (WCAG 1.4.1)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Lien externe : <code>rel="noopener noreferrer"</code> + icône + texte masqué « nouvel onglet »</span><span class="lang-en">External link: <code>rel="noopener noreferrer"</code> + icon + hidden "new tab" text</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Texte descriptif, lisible hors contexte</span><span class="lang-en">Descriptive text, readable out of context</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais un lien pour une action — utiliser <code>&lt;agtc-button&gt;</code></span><span class="lang-en">Never a link for an action — use <code>&lt;agtc-button&gt;</code></span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais « cliquez ici »</span><span class="lang-en">Never "click here"</span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:42%"><col style="width:36%"><col style="width:22%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr">Soulignement permanent par défaut (au-delà de la couleur) — WCAG 1.4.1</span><span class="lang-en">Permanent underline by default (beyond color) — WCAG 1.4.1</span></li>
  <li><span class="lang-fr"><code>:focus-visible</code> tokenisé — WCAG 2.4.7</span><span class="lang-en">Tokenized <code>:focus-visible</code> — WCAG 2.4.7</span></li>
  <li><span class="lang-fr">Externe : icône <strong>+ texte masqué</strong> (l'icône seule ne suffit pas — WCAG H83)</span><span class="lang-en">External: icon <strong>+ hidden text</strong> (icon alone is not enough — WCAG H83)</span></li>
  <li><span class="lang-fr">Texte de lien descriptif — WCAG 2.4.4</span><span class="lang-en">Descriptive link text — WCAG 2.4.4</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;!-- Inline (souligné par défaut) --&gt;
&lt;agtc-link href="/guidelines/link"&gt;<span class="lang-fr">guideline</span><span class="lang-en">guideline</span>&lt;/agtc-link&gt;

&lt;!-- Externe (nouvel onglet, sécurisé, annoncé) --&gt;
&lt;agtc-link href="https://lucide.dev" external&gt;Lucide&lt;/agtc-link&gt;

&lt;!-- Nav (soulignement au survol) --&gt;
&lt;agtc-link href="/components" underline="hover"&gt;<span class="lang-fr">Composants</span><span class="lang-en">Components</span>&lt;/agtc-link&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Souligner en texte courant ; <code>hover</code> seulement en nav</span><span class="lang-en">Underline in body text; <code>hover</code> only in nav</span></li>
      <li><span class="lang-fr">Marquer les liens externes (icône + texte AT)</span><span class="lang-en">Mark external links (icon + AT text)</span></li>
      <li><span class="lang-fr">Écrire un libellé qui décrit la destination</span><span class="lang-en">Write a label that describes the destination</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Un lien pour déclencher une action JS — utiliser un bouton</span><span class="lang-en">A link to trigger a JS action — use a button</span></li>
      <li><span class="lang-fr"><code>target="_blank"</code> sans <code>rel="noopener"</code></span><span class="lang-en"><code>target="_blank"</code> without <code>rel="noopener"</code></span></li>
      <li><span class="lang-fr">« cliquez ici » / « en savoir plus » seul</span><span class="lang-en">"click here" / "read more" alone</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/link.html'), layout({
    title: 'Link', depth: 1,
    sidebar: sidebarComponents('../','link.html'),
    body: body + uxPatternsFromMd('link') + contributionBanner()
  }));
}

// ─── PAGE: SEGMENTED ──────────────────────────────────────────────────────────
function buildSegmented() {
  const tokenRows = [
    ['segmented-default-track-background',   'semantic.color.background.subtle', SEM['color-background-subtle']],
    ['segmented-default-text',               'semantic.color.text.secondary',    SEM['color-text-secondary']],
    ['segmented-default-selected-background','semantic.color.action.primary',    SEM['color-action-primary']],
    ['segmented-default-selected-text',      'semantic.color.text.on-action',    SEM['color-text-on-action']],
    ['segmented-default-border-focus',       'semantic.color.border.focus',      SEM['color-border-focus']],
    ['segmented-default-radius',             'semantic.radius.control',          SEM['radius-control']],
  ];

  // Démo : vrais <agtc-segmented> — options via attribut JSON (Lit Array converter).
  const seg = (label, opts, val) => {
    const options = JSON.stringify(opts.map(l => ({ value: l.toLowerCase(), label: l })));
    return `<agtc-segmented label="${label}" options='${options}' value="${val}"></agtc-segmented>`;
  };

  const body = `
<h1>Segmented</h1>
<p class="page-lead">
  <span class="lang-fr">Contrôle segmenté mono-sélection à effet immédiat (2–5 options courtes) : bascule de langue, densité, vue liste/grille. Groupe de boutons natifs + <code>aria-current</code> — distinct du groupe radio (formulaire) et des onglets (panneaux).</span>
  <span class="lang-en">Single-select segmented control with immediate effect (2–5 short options): language toggle, density, list/grid view. Native button group + <code>aria-current</code> — distinct from radio group (forms) and tabs (panels).</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu</span><span class="lang-en">Preview</span></h2>
<div class="demo-box" style="display:flex;gap:24px;flex-wrap:wrap;align-items:center">
  ${seg('Langue', ['FR', 'EN'], 'fr')}
  ${seg('Densité', ['Compact', 'Normal', 'Confort'], 'normal')}
</div>

<h2><span class="lang-fr">Quand l'utiliser</span><span class="lang-en">When to use</span></h2>
<table class="token-table"><colgroup><col style="width:34%"><col style="width:66%"></colgroup>
  <thead><tr><th><span class="lang-fr">Composant</span><span class="lang-en">Component</span></th><th><span class="lang-fr">Usage</span><span class="lang-en">Usage</span></th></tr></thead>
  <tbody>
    <tr class="token-row"><td><code>agtc-segmented</code></td><td><span class="lang-fr">Réglage à <strong>effet immédiat</strong> (langue, densité, vue) — Tab + aria-current</span><span class="lang-en"><strong>Immediate-effect</strong> setting (language, density, view) — Tab + aria-current</span></td></tr>
    <tr class="token-row"><td><code>agtc-radio-group</code></td><td><span class="lang-fr">Choix de <strong>formulaire</strong> soumis — radiogroup + flèches</span><span class="lang-en">Submitted <strong>form</strong> choice — radiogroup + arrows</span></td></tr>
    <tr class="token-row"><td><code>agtc-toggle</code></td><td><span class="lang-fr">Réglage binaire on/off</span><span class="lang-en">Binary on/off setting</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours exactement un segment actif (<code>aria-current="true"</code>)</span><span class="lang-en">Always exactly one active segment (<code>aria-current="true"</code>)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">2 à 5 options, libellés courts ; au-delà → <code>select</code></span><span class="lang-en">2 to 5 options, short labels; beyond → <code>select</code></span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">État sélectionné = fond plein + poids 700 (pas la couleur seule)</span><span class="lang-en">Selected state = solid fill + weight 700 (not color alone)</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais <code>role="radiogroup"</code> ni <code>tablist</code> pour un effet immédiat</span><span class="lang-en">Never <code>role="radiogroup"</code> or <code>tablist</code> for immediate effect</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais sans <code>aria-label</code> de groupe</span><span class="lang-en">Never without a group <code>aria-label</code></span></li>
</ul>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:46%"><col style="width:34%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr"><code>role="group"</code> + <code>aria-label</code> sur le rail</span><span class="lang-en"><code>role="group"</code> + <code>aria-label</code> on the track</span></li>
  <li><span class="lang-fr">Segment actif : <code>aria-current="true"</code> ; boutons natifs (Tab, Entrée/Espace)</span><span class="lang-en">Active segment: <code>aria-current="true"</code>; native buttons (Tab, Enter/Space)</span></li>
  <li><span class="lang-fr"><code>:focus-visible</code> tokenisé par segment</span><span class="lang-en">Tokenized <code>:focus-visible</code> per segment</span></li>
  <li><span class="lang-fr">Contraste sélectionné (blanc sur teal) ≥ 4.5:1</span><span class="lang-en">Selected contrast (white on teal) ≥ 4.5:1</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;agtc-segmented label="Langue" value="fr"&gt;&lt;/agtc-segmented&gt;
&lt;script&gt;
  const s = document.querySelector('agtc-segmented');
  s.options = [{ value: 'fr', label: 'FR' }, { value: 'en', label: 'EN' }];
  s.addEventListener('change', (e) =&gt; setLanguage(e.detail.value));
&lt;/script&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Réserver aux réglages à effet immédiat (≤ 5 options)</span><span class="lang-en">Reserve for immediate-effect settings (≤ 5 options)</span></li>
      <li><span class="lang-fr">Nommer le groupe avec <code>label</code></span><span class="lang-en">Name the group with <code>label</code></span></li>
      <li><span class="lang-fr">Garder des libellés courts</span><span class="lang-en">Keep labels short</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">L'utiliser pour un choix de formulaire soumis (→ <code>agtc-radio-group</code>)</span><span class="lang-en">Use it for a submitted form choice (→ <code>agtc-radio-group</code>)</span></li>
      <li><span class="lang-fr">L'utiliser pour changer un panneau de contenu (→ onglets)</span><span class="lang-en">Use it to switch a content panel (→ tabs)</span></li>
      <li><span class="lang-fr">Plus de 5 options ou des libellés longs</span><span class="lang-en">More than 5 options or long labels</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/segmented.html'), layout({
    title: 'Segmented', depth: 1,
    sidebar: sidebarComponents('../','segmented.html'),
    body: body + uxPatternsFromMd('segmented') + contributionBanner()
  }));
}

// ─── PAGE: TABS ─────────────────────────────────────────────────────────────
function buildTabs() {
  const tokenRows = [
    ['tabs-default-tab-text',        'semantic.color.text.secondary',  SEM['color-text-secondary']],
    ['tabs-default-tab-text-hover',  'semantic.color.text.primary',    SEM['color-text-primary']],
    ['tabs-default-tab-text-active', 'semantic.color.action.primary',  SEM['color-action-primary']],
    ['tabs-default-indicator',       'semantic.color.action.primary',  SEM['color-action-primary']],
    ['tabs-default-border',          'semantic.color.border.default',  SEM['color-border-default']],
    ['tabs-default-border-focus',    'semantic.color.border.focus',    SEM['color-border-focus']],
    ['tabs-default-padding-x',       'semantic.space.control.padding-x', SEM['space-control-padding-x']],
    ['tabs-default-padding-y',       'semantic.space.control.padding-y', SEM['space-control-padding-y']],
  ];

  // Démo statique : tablist HTML pur (sans Web Component)
  const demoTab = (label, active) =>
    `<button role="tab" class="demo-tab${active ? ' demo-tab--active' : ''}" aria-selected="${active ? 'true' : 'false'}" type="button">${label}</button>`;

  const body = `
<h1>Tabs</h1>
<p class="page-lead">
  <span class="lang-fr">Onglets horizontaux in-page — chaque onglet affiche un panneau de contenu associé. Pattern ARIA <code>tablist/tab/tabpanel</code> conforme W3C APG, activation automatique au focus.</span>
  <span class="lang-en">Horizontal in-page tabs — each tab reveals an associated content panel. W3C APG-compliant <code>tablist/tab/tabpanel</code> ARIA pattern, automatic activation on focus.</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu</span><span class="lang-en">Preview</span></h2>
<div class="demo-box">
  <style>
    .demo-tablist { display:flex; border-bottom:1px solid var(--agtc-component-tabs-default-border); margin-bottom:16px; }
    .demo-tab { display:inline-flex; align-items:center; padding:var(--agtc-component-tabs-default-padding-y) var(--agtc-component-tabs-default-padding-x); background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-1px; color:var(--agtc-component-tabs-default-tab-text); font-family:inherit; font-size:var(--agtc-semantic-typography-label-size); font-weight:var(--agtc-semantic-typography-label-weight); cursor:pointer; }
    .demo-tab--active { color:var(--agtc-component-tabs-default-tab-text-active); font-weight:var(--agtc-semantic-fontWeight-bold); border-bottom-color:var(--agtc-component-tabs-default-indicator); }
    .demo-tab:focus-visible { outline:2px solid var(--agtc-component-tabs-default-border-focus); outline-offset:2px; border-radius:2px; }
  </style>
  <div role="tablist" aria-label="Documentation" class="demo-tablist">
    ${demoTab('Aperçu', true)}
    ${demoTab('Tokens', false)}
    ${demoTab('Accessibilité', false)}
  </div>
  <p style="margin:0;color:var(--agtc-semantic-color-text-secondary);font-size:14px"><span class="lang-fr">Contenu du panneau « Aperçu ».</span><span class="lang-en">Panel content for "Overview".</span></p>
</div>

<h2><span class="lang-fr">Quand l'utiliser</span><span class="lang-en">When to use</span></h2>
<table class="token-table"><colgroup><col style="width:34%"><col style="width:66%"></colgroup>
  <thead><tr><th><span class="lang-fr">Composant</span><span class="lang-en">Component</span></th><th><span class="lang-fr">Usage</span><span class="lang-en">Usage</span></th></tr></thead>
  <tbody>
    <tr class="token-row"><td><code>agtc-tabs</code></td><td><span class="lang-fr">Navigation in-page avec <strong>panneau</strong> — tablist/tab/tabpanel (ARIA)</span><span class="lang-en">In-page navigation with <strong>panel</strong> — tablist/tab/tabpanel (ARIA)</span></td></tr>
    <tr class="token-row"><td><code>agtc-segmented</code></td><td><span class="lang-fr">Réglage à <strong>effet immédiat</strong> sans panneau (langue, densité, vue)</span><span class="lang-en"><strong>Immediate-effect</strong> setting without panel (language, density, view)</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Règles absolues</span><span class="lang-en">Absolute rules</span></h2>
<ul>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours un <code>label</code> sur le tablist (pour les AT)</span><span class="lang-en">Always a <code>label</code> on the tablist (for AT)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Minimum 2 onglets — un seul onglet = pas de tabs</span><span class="lang-en">Minimum 2 tabs — a single tab is not tabs</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Tablist positionné <strong>au-dessus</strong> du panneau (jamais à droite)</span><span class="lang-en">Tablist positioned <strong>above</strong> the panel (never to the right)</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Labels en casse naturelle (jamais ALL-CAPS)</span><span class="lang-en">Labels in natural case (never ALL-CAPS)</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais pour un réglage sans panneau (→ <code>agtc-segmented</code>)</span><span class="lang-en">Never for a setting without panel (→ <code>agtc-segmented</code>)</span></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Jamais de valeur en dur — toujours via <code>var(--agtc-…)</code></span><span class="lang-en">Never hardcoded values — always via <code>var(--agtc-…)</code></span></li>
</ul>

<h2><span class="lang-fr">Clavier</span><span class="lang-en">Keyboard</span></h2>
<table class="token-table"><colgroup><col style="width:22%"><col style="width:78%"></colgroup>
  <thead><tr><th><span class="lang-fr">Touche</span><span class="lang-en">Key</span></th><th><span class="lang-fr">Effet</span><span class="lang-en">Effect</span></th></tr></thead>
  <tbody>
    <tr class="token-row"><td><kbd>←</kbd> <kbd>→</kbd></td><td><span class="lang-fr">Focus + activation onglet précédent/suivant (circulaire) — mode <code>auto</code></span><span class="lang-en">Focus + activate previous/next tab (circular) — <code>auto</code> mode</span></td></tr>
    <tr class="token-row"><td><kbd>Home</kbd> <kbd>End</kbd></td><td><span class="lang-fr">Focus premier / dernier onglet</span><span class="lang-en">Focus first / last tab</span></td></tr>
    <tr class="token-row"><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td><span class="lang-fr">Active l'onglet focusé (toujours, y compris mode <code>manual</code>)</span><span class="lang-en">Activate focused tab (always, including <code>manual</code> mode)</span></td></tr>
    <tr class="token-row"><td><kbd>Tab</kbd></td><td><span class="lang-fr">Sort du groupe vers le panneau actif</span><span class="lang-en">Exits group to the active panel</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<table class="token-table"><colgroup><col style="width:46%"><col style="width:34%"><col style="width:20%"></colgroup>
  <thead><tr><th>Token CSS</th><th><span class="lang-fr">Référence</span><span class="lang-en">Reference</span></th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td class="mono-sm">${v||'—'}</td></tr>`).join('')}</tbody>
</table>

<h2><span class="lang-fr">Accessibilité</span><span class="lang-en">Accessibility</span></h2>
<ul>
  <li><span class="lang-fr"><code>role="tablist"</code> + <code>aria-label</code> sur le conteneur</span><span class="lang-en"><code>role="tablist"</code> + <code>aria-label</code> on the container</span></li>
  <li><span class="lang-fr"><code>role="tab"</code> + <code>aria-selected</code> + <code>aria-controls</code> sur chaque onglet</span><span class="lang-en"><code>role="tab"</code> + <code>aria-selected</code> + <code>aria-controls</code> on each tab</span></li>
  <li><span class="lang-fr"><code>role="tabpanel"</code> + <code>aria-labelledby</code> sur chaque panneau</span><span class="lang-en"><code>role="tabpanel"</code> + <code>aria-labelledby</code> on each panel</span></li>
  <li><span class="lang-fr">Roving tabindex : onglet actif <code>tabindex="0"</code>, les autres <code>-1</code></span><span class="lang-en">Roving tabindex: active tab <code>tabindex="0"</code>, others <code>-1</code></span></li>
  <li><span class="lang-fr"><code>:focus-visible</code> tokenisé · <code>:visited</code> neutralisé (ADR-047)</span><span class="lang-en">Tokenized <code>:focus-visible</code> · neutralized <code>:visited</code> (ADR-047)</span></li>
  <li><span class="lang-fr">Contraste texte actif (teal sur blanc) : 5.14:1 ✅ WCAG AA</span><span class="lang-en">Active text contrast (teal on white): 5.14:1 ✅ WCAG AA</span></li>
</ul>

<h2><span class="lang-fr">Implémentation</span><span class="lang-en">Implementation</span></h2>
<pre class="code-block"><code class="lang-html">&lt;agtc-tabs label="Documentation Button" selected="overview"&gt;
  &lt;div slot="overview"&gt;Contenu Aperçu&lt;/div&gt;
  &lt;div slot="tokens"&gt;Contenu Tokens&lt;/div&gt;
&lt;/agtc-tabs&gt;
&lt;script type="module" src="../components/agtc-tabs.js"&gt;&lt;/script&gt;
&lt;script&gt;
  document.querySelector('agtc-tabs').tabs = [
    { value: 'overview', label: 'Aperçu' },
    { value: 'tokens',   label: 'Tokens' },
  ];
&lt;/script&gt;</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire</span><span class="lang-en">Do</span></h3>
    <ul>
      <li><span class="lang-fr">Nommer le tablist avec <code>label="…"</code></span><span class="lang-en">Name the tablist with <code>label="…"</code></span></li>
      <li><span class="lang-fr">Positionner le tablist au-dessus du panneau</span><span class="lang-en">Position the tablist above the panel</span></li>
      <li><span class="lang-fr">Labels concis en casse naturelle</span><span class="lang-en">Concise labels in natural case</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Utiliser pour un réglage sans panneau (→ <code>agtc-segmented</code>)</span><span class="lang-en">Use for a setting without panel (→ <code>agtc-segmented</code>)</span></li>
      <li><span class="lang-fr">Libellés en MAJUSCULES</span><span class="lang-en">ALL-CAPS labels</span></li>
      <li><span class="lang-fr">Un seul onglet (pas de tabs)</span><span class="lang-en">A single tab (not tabs)</span></li>
    </ul>
  </div>
</div>
`;

  write(path.join(DIST, 'components/tabs.html'), layout({
    title: 'Tabs', depth: 1,
    sidebar: sidebarComponents('../','tabs.html'),
    body: body + uxPatternsFromMd('tabs') + contributionBanner()
  }));
}

// ─── PAGE: TOKEN EXPLORER ───────────────────────────────────────────────────
function buildTokens() {
  const scaleSteps = Object.values(COLOR_SCALES).reduce((a,s) => a + Object.keys(s).length, 0);
  const semCount   = Object.keys(SEM).length;
  const compCount  = Object.keys(COMP).length;

  // Resolve component token to its actual value by looking up the semantic token
  function resolveCompValue(varRef) {
    const m = varRef.match(/var\(--agtc-semantic-(.+)\)/);
    if (!m) return varRef;
    return SEM[m[1]] || varRef;
  }

  const primRows = Object.entries(COLOR_SCALES).flatMap(([scale, steps]) =>
    Object.entries(steps).map(([step, { value, desc }]) =>
      `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:10px"><span style="width:40px;height:40px;border-radius:var(--agtc-semantic-radius-control);background:${value};border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0" aria-hidden="true"></span><code>--agtc-primitive-color-${scale}-${step}</code></div></td><td class="mono-sm">${value}</td><td>${desc}</td></tr>`
    )
  ).join('');

  // Build a full semantic map with alias info
  const semRows = Object.entries(SEM).map(([k, v]) => {
    const isColor = k.startsWith('color-');
    const swatch = isColor ? `<span style="width:40px;height:40px;border-radius:var(--agtc-semantic-radius-control);background:${v};border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0;display:inline-block" aria-hidden="true"></span>` : '';
    const aliasNode = getSemanticAlias(k);
    const aliasCell = aliasNode ? `<td style="font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)">${aliasNode}</td>` : '<td>—</td>';
    return `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:10px">${swatch}<code>--agtc-semantic-${k}</code></div></td>${aliasCell}<td class="mono-sm">${v}</td></tr>`;
  }).join('');

  const compRows = Object.entries(COMP).map(([k, v]) => {
    const resolved = resolveCompValue(v);
    const isColor = k.includes('background') || k.includes('text') || k.includes('border');
    const swatch = isColor && resolved.startsWith('#') ? `<span style="width:20px;height:20px;border-radius:3px;background:${resolved};border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0;display:inline-block;margin-right:6px" aria-hidden="true"></span>` : '';
    return `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td style="font-family:var(--agtc-font-mono);font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)">${v}</td><td><div style="display:flex;align-items:center">${swatch}<span class="mono-sm">${resolved}</span></div></td></tr>`;
  }).join('');

  const body = `
<h1><span class="lang-fr">Explorateur de tokens</span><span class="lang-en">Token explorer</span></h1>
<p class="page-lead">
  <span class="lang-fr">Trois niveaux de tokens — navigables, filtrables, directement applicables via CSS Custom Properties.</span>
  <span class="lang-en">Three token levels — browsable, filterable, directly applicable via CSS Custom Properties.</span>
</p>

<div class="token-tiles">
  <div class="token-tile">
    <span class="token-tile-count">${scaleSteps}</span>
    <span class="token-tile-label"><span class="lang-fr">Tokens primitifs (couleurs)</span><span class="lang-en">Primitive tokens (colors)</span></span>
  </div>
  <div class="token-tile">
    <span class="token-tile-count">${semCount}</span>
    <span class="token-tile-label"><span class="lang-fr">Tokens sémantiques</span><span class="lang-en">Semantic tokens</span></span>
  </div>
  <div class="token-tile">
    <span class="token-tile-count">${compCount}</span>
    <span class="token-tile-label"><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></span>
  </div>
</div>

<input class="explorer-search" type="search" id="token-search" placeholder="Filtrer les tokens (ex: button, color, action…)" aria-label="Rechercher des tokens" autocomplete="off" spellcheck="false">
<p class="token-search-status" id="token-search-status" aria-live="polite" aria-atomic="true"></p>

<div class="token-section" id="section-primitifs">
<h2 id="primitifs" class="first"><span class="lang-fr">Tokens primitifs</span><span class="lang-en">Primitive tokens</span></h2>
<p>
  <span class="lang-fr">Valeurs physiques issues de Radix UI. <strong>Jamais utilisées directement dans les composants.</strong></span>
  <span class="lang-en">Physical values from Radix UI. <strong>Never used directly in components.</strong></span>
</p>
<table class="token-table"><colgroup><col style="width:52%"><col style="width:16%"><col style="width:32%"></colgroup><thead><tr><th>Token CSS</th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Description</span><span class="lang-en">Description</span></th></tr></thead><tbody>${primRows}</tbody></table>
</div>

<div class="token-section" id="section-semantiques">
<h2 id="semantiques"><span class="lang-fr">Tokens sémantiques</span><span class="lang-en">Semantic tokens</span></h2>
<p>
  <span class="lang-fr">Intentions UX — ce que les agents doivent utiliser pour comprendre la fonction, pas la valeur brute.</span>
  <span class="lang-en">UX intentions — what agents must use to understand function, not raw values.</span>
</p>
<table class="token-table"><colgroup><col style="width:48%"><col style="width:32%"><col style="width:20%"></colgroup><thead><tr><th>Token CSS</th><th><span class="lang-fr">Alias (référence)</span><span class="lang-en">Alias (reference)</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead><tbody>${semRows}</tbody></table>
</div>

<div class="token-section" id="section-composants">
<h2 id="composants"><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<p>
  <span class="lang-fr">Contrats institutionnels. Toute modification requiert une approbation formelle.</span>
  <span class="lang-en">Institutional contracts. Any change requires formal approval.</span>
</p>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup><thead><tr><th>Token CSS</th><th><span class="lang-fr">Alias sémantique</span><span class="lang-en">Semantic alias</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead><tbody>${compRows}</tbody></table>
</div>
`;

  write(path.join(DIST, 'tokens/index.html'), layout({
    title: 'Tokens', depth: 1,
    sidebar: null,
    body: body + contributionBanner()
  }));
}

// ─── PAGE: CONTEXTES ────────────────────────────────────────────────────────
function buildContextes() {
  const marketingTokens = [
    ['marketing-typography-display-size',       'semantic.marketing.typography.display.size',       SEM['marketing-typography-display-size'],       '<span class="lang-fr">Titre d\'accroche — hero marketing (60px)</span><span class="lang-en">Display headline — marketing hero (60px)</span>'],
    ['marketing-typography-display-weight',     'semantic.marketing.typography.display.weight',     SEM['marketing-typography-display-weight'],     '<span class="lang-fr">Graisse du titre display</span><span class="lang-en">Display title weight</span>'],
    ['marketing-typography-display-line-height','semantic.marketing.typography.display.line-height',SEM['marketing-typography-display-line-height'],'<span class="lang-fr">Interligne display (ratio)</span><span class="lang-en">Display line height (ratio)</span>'],
    ['marketing-typography-eyebrow-size',       'semantic.marketing.typography.eyebrow.size',       SEM['marketing-typography-eyebrow-size'],       '<span class="lang-fr">Étiquette eyebrow (12px)</span><span class="lang-en">Eyebrow label (12px)</span>'],
    ['marketing-typography-eyebrow-weight',     'semantic.marketing.typography.eyebrow.weight',     SEM['marketing-typography-eyebrow-weight'],     '<span class="lang-fr">Graisse eyebrow</span><span class="lang-en">Eyebrow weight</span>'],
    ['marketing-space-section-breathing',       'semantic.marketing.space.section-breathing',       SEM['marketing-space-section-breathing'],       '<span class="lang-fr">Respiration entre sections (96px)</span><span class="lang-en">Section breathing room (96px)</span>'],
    ['marketing-space-hero-gap',                'semantic.marketing.space.hero-gap',                SEM['marketing-space-hero-gap'],                '<span class="lang-fr">Espace vertical hero (120px)</span><span class="lang-en">Hero vertical gap (120px)</span>'],
  ];
  const tokenRows = marketingTokens.map(([k, name, val, desc]) =>
    `<tr><td><code>--agtc-semantic-${k}</code></td><td>${desc}</td><td><code>${val||'—'}</code></td></tr>`
  ).join('');

  const body = `
<h1 class="first"><span class="lang-fr">Contextes d'utilisation</span><span class="lang-en">Usage Contexts</span></h1>
<p class="page-lead">
  <span class="lang-fr">Le système distingue deux modes éditoriaux : <strong>Mode Produit</strong> pour les pages qui permettent d'agir, et <strong>Mode Marketing</strong> pour les pages qui communiquent une vision.</span>
  <span class="lang-en">The system defines two editorial modes: <strong>Product Mode</strong> for pages that enable action, and <strong>Marketing Mode</strong> for pages that communicate a vision.</span>
</p>

<h2><span class="lang-fr">Comparaison des modes</span><span class="lang-en">Mode comparison</span></h2>
<table>
  <thead><tr>
    <th><span class="lang-fr">Dimension</span><span class="lang-en">Dimension</span></th>
    <th><span class="lang-fr">Mode Produit (SaaS)</span><span class="lang-en">Product Mode (SaaS)</span></th>
    <th><span class="lang-fr">Mode Marketing (Narratif)</span><span class="lang-en">Marketing Mode (Narrative)</span></th>
  </tr></thead>
  <tbody>
    <tr><td><span class="lang-fr">Objectif</span><span class="lang-en">Goal</span></td><td><span class="lang-fr">Permettre d'agir</span><span class="lang-en">Enable action</span></td><td><span class="lang-fr">Communiquer une vision</span><span class="lang-en">Communicate a vision</span></td></tr>
    <tr><td><span class="lang-fr">Lecteur</span><span class="lang-en">Reader</span></td><td><span class="lang-fr">Utilisateur qui travaille</span><span class="lang-en">User working</span></td><td><span class="lang-fr">Visiteur qui évalue</span><span class="lang-en">Visitor evaluating</span></td></tr>
    <tr><td><span class="lang-fr">Espacement sections</span><span class="lang-en">Section spacing</span></td><td><code>semantic.space.layout.section</code> (48px)</td><td><code>semantic.marketing.space.section-breathing</code> (96px)</td></tr>
    <tr><td><span class="lang-fr">Typographie max</span><span class="lang-en">Max typography</span></td><td><code>typography.heading.1</code> (40px)</td><td><code>marketing.typography.display</code> (60px)</td></tr>
    <tr><td><span class="lang-fr">Mise en page</span><span class="lang-en">Layout</span></td><td><span class="lang-fr">Grille régulière</span><span class="lang-en">Regular grid</span></td><td><span class="lang-fr">Asymétrie contrôlée</span><span class="lang-en">Controlled asymmetry</span></td></tr>
    <tr><td><span class="lang-fr">Attribut HTML</span><span class="lang-en">HTML attribute</span></td><td><em><span class="lang-fr">absent</span><span class="lang-en">absent</span></em></td><td><code>data-context="marketing"</code></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Arbre de décision</span><span class="lang-en">Decision tree</span></h2>
<table>
  <thead><tr>
    <th><span class="lang-fr">Question</span><span class="lang-en">Question</span></th>
    <th><span class="lang-fr">Réponse</span><span class="lang-en">Answer</span></th>
    <th><span class="lang-fr">Mode</span><span class="lang-en">Mode</span></th>
  </tr></thead>
  <tbody>
    <tr><td><span class="lang-fr">La page convainc ou onboarde un visiteur ?</span><span class="lang-en">Does the page convince or onboard a visitor?</span></td><td><span class="lang-fr">Oui</span><span class="lang-en">Yes</span></td><td><strong>Marketing</strong></td></tr>
    <tr><td><span class="lang-fr">La page documente un composant ou un token ?</span><span class="lang-en">Does the page document a component or token?</span></td><td><span class="lang-fr">Oui</span><span class="lang-en">Yes</span></td><td><strong>Produit</strong></td></tr>
    <tr><td><span class="lang-fr">Doute ?</span><span class="lang-en">Unsure?</span></td><td><span class="lang-fr">—</span><span class="lang-en">—</span></td><td><strong>Produit</strong> (<span class="lang-fr">défaut</span><span class="lang-en">default</span>)</td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Mapping des pages</span><span class="lang-en">Page mapping</span></h2>
<table>
  <thead><tr>
    <th><span class="lang-fr">Page</span><span class="lang-en">Page</span></th>
    <th><span class="lang-fr">Mode</span><span class="lang-en">Mode</span></th>
    <th><span class="lang-fr">Justification</span><span class="lang-en">Rationale</span></th>
  </tr></thead>
  <tbody>
    <tr><td><code>index.html</code></td><td>Marketing</td><td><span class="lang-fr">Présente la vision, onboarde</span><span class="lang-en">Presents the vision, onboards</span></td></tr>
    <tr><td><code>get-started.html</code></td><td>Marketing</td><td><span class="lang-fr">Convainc et guide l'adoption</span><span class="lang-en">Convinces and guides adoption</span></td></tr>
    <tr><td><code>agents/index.html</code></td><td>Marketing</td><td><span class="lang-fr">Explique le système agentique</span><span class="lang-en">Explains the agentic system</span></td></tr>
    <tr><td><code>foundations/*</code></td><td><span class="lang-fr">Produit</span><span class="lang-en">Product</span></td><td><span class="lang-fr">Documentation des fondations</span><span class="lang-en">Foundation documentation</span></td></tr>
    <tr><td><code>components/*</code></td><td><span class="lang-fr">Produit</span><span class="lang-en">Product</span></td><td><span class="lang-fr">Contrats de composants</span><span class="lang-en">Component contracts</span></td></tr>
    <tr><td><code>decisions/*</code></td><td><span class="lang-fr">Produit</span><span class="lang-en">Product</span></td><td><span class="lang-fr">Archive des ADRs</span><span class="lang-en">ADR archive</span></td></tr>
  </tbody>
</table>

<h2><span class="lang-fr">Tokens Marketing</span><span class="lang-en">Marketing tokens</span></h2>
<p>
  <span class="lang-fr">Ces tokens sont réservés au Mode Marketing. Ne pas utiliser dans les composants ou pages Produit.</span>
  <span class="lang-en">These tokens are reserved for Marketing Mode. Do not use in components or Product pages.</span>
</p>
<table class="token-table">
  <colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup>
  <thead><tr>
    <th>Token CSS</th>
    <th><span class="lang-fr">Description</span><span class="lang-en">Description</span></th>
    <th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th>
  </tr></thead>
  <tbody>${tokenRows}</tbody>
</table>

<h2><span class="lang-fr">Implémentation CSS</span><span class="lang-en">CSS implementation</span></h2>
<pre class="code-block"><code class="lang-css">/* Activation du Mode Marketing */
[data-context="marketing"] .hero-eyebrow {
  font-size: var(--agtc-semantic-marketing-typography-eyebrow-size);   /* 12px */
  font-weight: var(--agtc-semantic-marketing-typography-eyebrow-weight);
  letter-spacing: .12em;
  text-transform: uppercase;
}
[data-context="marketing"] .hero-title {
  font-size: var(--agtc-semantic-marketing-typography-display-size);   /* 60px */
  font-weight: var(--agtc-semantic-marketing-typography-display-weight);
  line-height: var(--agtc-semantic-marketing-typography-display-line-height);
}
[data-context="marketing"] .marketing-section {
  padding-block: var(--agtc-semantic-marketing-space-section-breathing); /* 96px */
}
[data-context="marketing"] .marketing-hero {
  padding-block: var(--agtc-semantic-marketing-space-hero-gap); /* 120px */
}</code></pre>

<h2><span class="lang-fr">DOs et DON'Ts</span><span class="lang-en">DOs and DON'Ts</span></h2>
<div class="dos-donts">
  <div class="do-section">
    <h3>${icon('circle-check',16)} <span class="lang-fr">À faire (Mode Marketing)</span><span class="lang-en">Do (Marketing Mode)</span></h3>
    <ul>
      <li><span class="lang-fr">Utiliser <code>semantic.marketing.*</code> pour la typographie et l'espacement hero</span><span class="lang-en">Use <code>semantic.marketing.*</code> for hero typography and spacing</span></li>
      <li><span class="lang-fr">Déclarer <code>data-context="marketing"</code> sur <code>&lt;body&gt;</code></span><span class="lang-en">Declare <code>data-context="marketing"</code> on <code>&lt;body&gt;</code></span></li>
      <li><span class="lang-fr">Headlines = assertions, pas des teasers : "Design tokens that work."</span><span class="lang-en">Headlines = statements, not teasers: "Design tokens that work."</span></li>
      <li><span class="lang-fr">Hero image = UI réelle ou artefact réel (ou texte seul)</span><span class="lang-en">Hero image = real UI or real artifact (or text-only)</span></li>
    </ul>
  </div>
  <div class="dont-section">
    <h3>${icon('circle-x',16)} <span class="lang-fr">À éviter</span><span class="lang-en">Don't</span></h3>
    <ul>
      <li><span class="lang-fr">Appliquer <code>data-context="marketing"</code> à une page de documentation</span><span class="lang-en">Apply <code>data-context="marketing"</code> to a documentation page</span></li>
      <li><span class="lang-fr">Utiliser des valeurs en dur (96px, 120px) — toujours via les tokens</span><span class="lang-en">Use hard-coded values (96px, 120px) — always via tokens</span></li>
      <li><span class="lang-fr">Plus d'un gradient par page, gradient sur les boutons, glassmorphism</span><span class="lang-en">More than one gradient per page, gradient on buttons, glassmorphism</span></li>
      <li><span class="lang-fr">Buzzwords : "revolutionize", "seamless", "game-changer", "unlock"</span><span class="lang-en">Buzzwords: "revolutionize", "seamless", "game-changer", "unlock"</span></li>
    </ul>
  </div>
</div>

<p><small><span class="lang-fr">Voir aussi :</span><span class="lang-en">See also:</span> <a href="../decisions/adr-057-deux-contextes-utilisation.html">ADR-057</a></small></p>
`;

  write(path.join(DIST, 'foundations/contextes.html'), layout({
    title: 'Contextes',
    depth: 1,
    sidebar: sidebarFoundations('../', 'contextes.html'),
    body: body + contributionBanner()
  }));
}

// Helper: returns the raw alias string for a semantic token key by walking semanticData
function getSemanticAlias(flatKey) {
  const parts = flatKey.split('-');
  let node = semanticData.semantic;
  for (const part of parts) {
    if (!node || typeof node !== 'object') return null;
    node = node[part];
  }
  if (node && 'value' in node && typeof node.value === 'string' && node.value.includes('{')) {
    return node.value;
  }
  return null;
}

// ─── PAGE: DECISIONS INDEX ──────────────────────────────────────────────────
function buildDecisionsIndex(adrs) {
  const rows = adrs.map(a => `
<tr>
  <td class="adr-num" style="white-space:nowrap">ADR-${String(a.num).padStart(3,'0')}</td>
  <td class="adr-title"><a href="${a.slug}.html">${esc(a.title)}</a></td>
  <td><agtc-badge variant="success" size="sm"><span class="lang-fr">Actif</span><span class="lang-en">Active</span></agtc-badge></td>
  <td style="white-space:nowrap">${a.date}</td>
</tr>`).join('');

  const body = `
<h1><span class="lang-fr">Décisions architecturales</span><span class="lang-en">Architecture Decision Records</span></h1>
<p class="page-lead">
  <span class="lang-fr">Un design system accumule des décisions invisibles : pourquoi ce token est nommé ainsi, pourquoi cette variante a été rejetée, pourquoi cette règle de gouvernance est là. Ce registre rend ces décisions traçables et auditables.</span>
  <span class="lang-en">A design system accumulates invisible decisions: why this token is named this way, why this variant was rejected, why this governance rule exists. This registry makes those decisions traceable and auditable.</span>
</p>

<blockquote><p>
  <span class="lang-fr">Le système de design est devenu un dataset, pas un deliverable. — The Design System Guide, 2026</span>
  <span class="lang-en">The design system has become a dataset, not a deliverable. — The Design System Guide, 2026</span>
</p></blockquote>

<h2 class="first"><span class="lang-fr">Index des ADRs</span><span class="lang-en">ADR index</span></h2>
<p>
  <span class="lang-fr">${adrs.length} décisions actives. Un ADR ne se supprime jamais — on le marque <em>remplacé</em> ou <em>déprécié</em>.</span>
  <span class="lang-en">${adrs.length} active decisions. An ADR is never deleted — it is marked <em>superseded</em> or <em>deprecated</em>.</span>
</p>
<table>
  <thead><tr><th>ADR</th><th><span class="lang-fr">Titre</span><span class="lang-en">Title</span></th><th><span class="lang-fr">Statut</span><span class="lang-en">Status</span></th><th><span class="lang-fr">Date</span><span class="lang-en">Date</span></th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2><span class="lang-fr">Règles du registre</span><span class="lang-en">Registry rules</span></h2>
<ul>
  <li><span class="lang-fr">Un ADR ne se supprime jamais — on le marque <code>remplacé</code> ou <code>déprécié</code></span><span class="lang-en">An ADR is never deleted — it is marked <code>superseded</code> or <code>deprecated</code></span></li>
  <li><span class="lang-fr">Un ADR est immutable une fois <code>actif</code> — toute modification crée un nouvel ADR</span><span class="lang-en">An ADR is immutable once <code>active</code> — any modification creates a new ADR</span></li>
  <li><span class="lang-fr">Les agents lisent ce dossier pour comprendre les <em>pourquoi</em>, pas les <em>quoi</em></span><span class="lang-en">Agents read this folder to understand the <em>why</em>, not just the <em>what</em></span></li>
  <li><span class="lang-fr">Tout TCR (Token Change Request) majeur doit référencer ou créer un ADR</span><span class="lang-en">Every major TCR (Token Change Request) must reference or create an ADR</span></li>
</ul>
`;

  write(path.join(DIST, 'decisions/index.html'), layout({
    title: 'Décisions (ADRs)', depth: 1,
    sidebar: sidebarDecisionsLocal(adrs),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: INDIVIDUAL ADR ───────────────────────────────────────────────────
function buildADR(adr, adrs) {
  // Strip the leading H1 and frontmatter blockquote — already rendered in .adr-header
  const lines = adr.content.split('\n');
  let start = 0;
  if (lines[start]?.startsWith('# ')) start++;
  while (start < lines.length && lines[start].trim() === '') start++;
  while (start < lines.length && lines[start].startsWith('> ')) start++;
  while (start < lines.length && (lines[start].trim() === '' || /^-{3,}$/.test(lines[start].trim()))) start++;
  const content = parseMd(lines.slice(start).join('\n'));

  const statusBadge = `<agtc-badge variant="success" size="sm"><span class="lang-fr">Actif</span><span class="lang-en">Active</span></agtc-badge>`;
  const typeBadge = adr.type ? `<span class="adr-type">${esc(adr.type)}</span>` : '';
  const meta = `
<div class="adr-header">
  <div class="adr-header-eyebrow">
    <code class="adr-number">ADR-${String(adr.num).padStart(3,'0')}</code>
    ${statusBadge}
    ${typeBadge}
  </div>
  <h1 class="adr-page-title">${esc(adr.title)}</h1>
  <dl class="adr-meta">
    <div class="adr-meta-item">
      <dt><span class="lang-fr">Date</span><span class="lang-en">Date</span></dt>
      <dd>${esc(adr.date)}</dd>
    </div>
    ${adr.deciders ? `<div class="adr-meta-item">
      <dt><span class="lang-fr">Décideurs</span><span class="lang-en">Decision makers</span></dt>
      <dd>${esc(adr.deciders)}</dd>
    </div>` : ''}
  </dl>
</div>`;

  const prev = adrs.find(a => a.num === adr.num - 1);
  const next = adrs.find(a => a.num === adr.num + 1);
  const nav = `<div style="display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid var(--agtc-semantic-color-border-default)">
    ${prev ? `<a href="${prev.slug}.html" class="agtc-button secondary">← ADR-${String(prev.num).padStart(3,'0')}</a>` : '<span></span>'}
    ${next ? `<a href="${next.slug}.html" class="agtc-button secondary">ADR-${String(next.num).padStart(3,'0')} →</a>` : '<span></span>'}
  </div>`;

  const body = meta + content + nav;
  write(path.join(DIST, `decisions/${adr.slug}.html`), layout({
    title: adr.title, depth: 1,
    sidebar: sidebarDecisionsLocal(adrs),
    body
  }));
}

// ─── PAGE: AGENTS ───────────────────────────────────────────────────────────
function buildAgents() {
  const agentTypes = [
    ['Designer Agent','Figma','<span class="lang-fr">Détecte les dérives dans Figma : instances détachées, descriptions manquantes, espacements et tokens incohérents.</span><span class="lang-en">Detects drift in Figma: detached instances, missing descriptions, inconsistent spacing and tokens.</span>'],
    ['Developer Agent','Code','<span class="lang-fr">Détecte les mauvais usages de tokens dans le code, génère les Web Components, ouvre des PRs de correction.</span><span class="lang-en">Detects bad token usage in code, generates Web Components, opens fix PRs.</span>'],
    ['QA Agent','Tests','<span class="lang-fr">Exécute les tests d\'accessibilité, de régression visuelle, de conformité des tokens avant tout merge.</span><span class="lang-en">Runs accessibility, visual regression, and token compliance tests before every merge.</span>'],
    ['Documentation Agent','Docs','<span class="lang-fr">Génère des changelogs, guides de migration, notes d\'accessibilité, mises à jour des guidelines.</span><span class="lang-en">Generates changelogs, migration guides, accessibility notes, and guideline updates.</span>'],
  ];

  const readingOrder = [
    ['AGENTS.md','<span class="lang-fr">Routeur d\'agents — première lecture obligatoire</span><span class="lang-en">Agent router — mandatory first read</span>'],
    ['DESIGN.md','<span class="lang-fr">Contrat de marque portable</span><span class="lang-en">Portable brand contract</span>'],
    ['.claude/rules/project-overview.md','<span class="lang-fr">Contexte général</span><span class="lang-en">General context</span>'],
    ['.claude/rules/tokens-system.md','<span class="lang-fr">Règles des tokens</span><span class="lang-en">Token rules</span>'],
    ['.claude/rules/development.md','<span class="lang-fr">Règles de développement</span><span class="lang-en">Development rules</span>'],
    ['guidelines/components/button.md','<span class="lang-fr">Contrat du composant concerné</span><span class="lang-en">Contract for the relevant component</span>'],
    ['.claude/instructions/session-spec.md','<span class="lang-fr">Quick reference pour la session</span><span class="lang-en">Session quick reference</span>'],
  ];

  const agentIcons = [icon('pen-tool',24), icon('code-2',24), icon('shield-check',24), icon('book-open',24)];

  const body = `
<h1><span class="lang-fr">Pour les agents IA</span><span class="lang-en">For AI agents</span></h1>
<p class="page-lead">
  <span class="lang-fr">Ce système de design est conçu pour être compris et utilisé par des agents IA. Les agents observent, analysent, proposent. Les humains approuvent, décident, déploient.</span>
  <span class="lang-en">This design system is built to be understood and used by AI agents. Agents observe, analyze, propose. Humans approve, decide, deploy.</span>
</p>

<blockquote><p>
  <span class="lang-fr">Le dernier mot est toujours humain.</span>
  <span class="lang-en">The final decision is always human.</span>
</p></blockquote>

<h2 class="first" id="types"><span class="lang-fr">Types d'agents</span><span class="lang-en">Agent types</span></h2>
<p>
  <span class="lang-fr">Quatre rôles dans l'ordre du pipeline de production — de la conception au déploiement.</span>
  <span class="lang-en">Four roles in production pipeline order — from design to deployment.</span>
</p>
<div class="agent-grid">
${agentTypes.map(([name, type, desc], i) => `
<div class="agent-card card-surface">
  <div style="color:var(--agtc-semantic-color-action-primary);margin-bottom:10px">${agentIcons[i]}</div>
  <div class="agent-type">Agent ${type}</div>
  <div class="agent-name">${name}</div>
  <div class="agent-desc">${desc}</div>
</div>`).join('')}
</div>

<h2 id="actions"><span class="lang-fr">Ce que les agents peuvent faire</span><span class="lang-en">What agents can do</span></h2>
<div class="rules-split">
  <div class="rule-can">
    <h3><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Autorisé</span><span class="lang-en">Allowed</span></h3>
    <ul>
      <li><span class="lang-fr">Lire tous les fichiers du dépôt</span><span class="lang-en">Read all files in the repository</span></li>
      <li><span class="lang-fr">Générer du code respectant les contrats</span><span class="lang-en">Generate code following the contracts</span></li>
      <li><span class="lang-fr">Détecter les dérives de tokens</span><span class="lang-en">Detect token drift</span></li>
      <li><span class="lang-fr">Proposer des corrections</span><span class="lang-en">Propose fixes</span></li>
      <li><span class="lang-fr">Créer une branche <code>fix/</code> ou <code>docs/</code></span><span class="lang-en">Create a <code>fix/</code> or <code>docs/</code> branch</span></li>
      <li><span class="lang-fr">Faire des commits sur une branche feature</span><span class="lang-en">Commit on a feature branch</span></li>
      <li><span class="lang-fr">Ouvrir une PR avec description complète</span><span class="lang-en">Open a PR with full description</span></li>
    </ul>
  </div>
  <div class="rule-cannot">
    <h3><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Interdit</span><span class="lang-en">Forbidden</span></h3>
    <ul>
      <li><span class="lang-fr">Merger une PR sans approbation humaine</span><span class="lang-en">Merge a PR without human approval</span></li>
      <li><span class="lang-fr">Pusher directement sur <code>main</code> ou <code>develop</code></span><span class="lang-en">Push directly to <code>main</code> or <code>develop</code></span></li>
      <li><span class="lang-fr">Modifier <code>tokens/component.json</code> sans approbation explicite</span><span class="lang-en">Modify <code>tokens/component.json</code> without explicit approval</span></li>
      <li><span class="lang-fr">Inventer des variantes ou tokens non définis</span><span class="lang-en">Invent undefined variants or tokens</span></li>
      <li><span class="lang-fr">Utiliser des valeurs en dur (hex, px, etc.)</span><span class="lang-en">Use hardcoded values (hex, px, etc.)</span></li>
      <li><span class="lang-fr">Ignorer les règles d'accessibilité</span><span class="lang-en">Ignore accessibility rules</span></li>
    </ul>
  </div>
</div>

<h2 id="lecture"><span class="lang-fr">Ordre de lecture obligatoire</span><span class="lang-en">Mandatory reading order</span></h2>
<p>
  <span class="lang-fr">Avant toute action dans ce dépôt, un agent doit lire dans cet ordre :</span>
  <span class="lang-en">Before any action in this repository, an agent must read in this order:</span>
</p>
<table>
  <thead><tr><th><span class="lang-fr">Fichier</span><span class="lang-en">File</span></th><th><span class="lang-fr">Rôle</span><span class="lang-en">Role</span></th></tr></thead>
  <tbody>${readingOrder.map(([f,r]) => `<tr><td><code>${f}</code></td><td>${r}</td></tr>`).join('')}</tbody>
</table>

<h2 id="escalade"><span class="lang-fr">Règle d'escalade</span><span class="lang-en">Escalation rule</span></h2>
<p>
  <span class="lang-fr">Toute modification touchant les tokens sémantiques ou de composant déclenche une escalade automatique vers un humain. Les agents ne peuvent pas approuver leurs propres modifications sur ces tokens.</span>
  <span class="lang-en">Any change to semantic or component tokens triggers automatic escalation to a human. Agents cannot approve their own modifications to these tokens.</span>
</p>

<h2><span class="lang-fr">Règle de nommage — rappel</span><span class="lang-en">Naming rule — reminder</span></h2>
<pre class="code-block"><code class="lang-css">/* ✅ Correct — intention lisible par un agent / intent readable by an agent */
color: var(--agtc-component-button-primary-background);

/* ❌ Interdit — valeur brute, aucune intention / raw value, no intent */
color: #0d74ce;

/* ❌ Interdit — token primitif utilisé directement / primitive token used directly */
color: var(--agtc-primitive-color-blue-11);</code></pre>

<h2 id="skills"><span class="lang-fr">Compétences (Skills)</span><span class="lang-en">Skills</span></h2>
<table>
  <thead><tr><th>Skill</th><th><span class="lang-fr">Rôle</span><span class="lang-en">Role</span></th></tr></thead>
  <tbody>
    <tr><td><code>.claude/skills/ai-ds-composer.md</code></td><td><span class="lang-fr">Compose des interfaces depuis du langage naturel en respectant les contrats</span><span class="lang-en">Composes interfaces from natural language following the contracts</span></td></tr>
    <tr><td><code>.claude/skills/ai-component-metadata.md</code></td><td><span class="lang-fr">Génère les métadonnées de composant</span><span class="lang-en">Generates component metadata</span></td></tr>
    <tr><td><code>.claude/skills/codebase-index.md</code></td><td><span class="lang-fr">Index du dépôt pour navigation rapide</span><span class="lang-en">Repository index for fast navigation</span></td></tr>
  </tbody>
</table>
`;

  write(path.join(DIST, 'agents/index.html'), layout({
    title: 'Pour les agents IA', depth: 1,
    sidebar: null,
    context: 'marketing',
    body: body + contributionBanner()
  }));
}

// ─── PAGE: PIPELINES (index) ─────────────────────────────────────────────────
function buildPipelinesIndex() {
  const activePipelines   = PIPELINES.filter(p => p.status === 'active').sort((a,b) => a.order - b.order);
  const plannedPipelines  = PIPELINES.filter(p => p.status === 'planned').sort((a,b) => a.order - b.order);
  const orchestrator      = PIPELINES.find(p  => p.status === 'orchestrator');

  function pipelineCard(p) {
    const badgeVariant = p.status === 'active' ? 'success' : p.status === 'planned' ? 'warning' : 'info';
    const badgeFr = p.status === 'active' ? 'Actif' : p.status === 'planned' ? 'Planifié' : 'Orchestrateur';
    const badgeEn = p.status === 'active' ? 'Active' : p.status === 'planned' ? 'Planned' : 'Orchestrator';
    const blockingBadge = p.status === 'active' && !p.blocking
      ? `<agtc-badge variant="neutral" size="sm" style="margin-left:4px"><span class="lang-fr">Transition bloquant</span><span class="lang-en">Transitioning to blocking</span></agtc-badge>`
      : p.status === 'planned'
        ? `<agtc-badge variant="neutral" size="sm" style="margin-left:4px"><span class="lang-fr">Non bloquant</span><span class="lang-en">Non-blocking</span></agtc-badge>`
        : '';
    return `<a href="pipelines/${p.id}.html" class="nav-card card-surface card-hover">
  <span class="nav-card-icon">${icon(p.icon, 24)}</span>
  <div style="margin-bottom:8px"><agtc-badge variant="${badgeVariant}" size="sm"><span class="lang-fr">${badgeFr}</span><span class="lang-en">${badgeEn}</span></agtc-badge>${blockingBadge}</div>
  <div class="nav-card-title"><span class="lang-fr">${p.title_fr}</span><span class="lang-en">${p.title_en}</span></div>
  <div class="nav-card-desc"><span class="lang-fr">${p.desc_short_fr}</span><span class="lang-en">${p.desc_short_en}</span></div>
  <div style="margin-top:10px;font-size:var(--agtc-font-size-detail);color:var(--agtc-semantic-color-text-secondary)"><span class="lang-fr">Déclencheur : ${esc(p.trigger_fr)}</span><span class="lang-en">Trigger: ${esc(p.trigger_en)}</span></div>
</a>`;
  }

  const body = `
<h1><span class="lang-fr">Pipelines &amp; Workflows</span><span class="lang-en">Pipelines &amp; Workflows</span></h1>
<p class="page-lead"><span class="lang-fr">Avant chaque commit, l'orchestrateur évalue automatiquement chaque changement contre les gates de qualité actifs. Tokens, accessibilité, régressions visuelles, commits — rien n'atteint le dépôt sans contrôle.</span><span class="lang-en">Before every commit, the orchestrator automatically evaluates each change against the active quality gates. Tokens, accessibility, visual regressions, commits — nothing reaches the repository without inspection.</span></p>

<blockquote><p><span class="lang-fr">La qualité n'est pas une étape finale. C'est une garantie structurelle, intégrée à chaque commit.</span><span class="lang-en">Quality is not a final step. It is a structural guarantee, built into every commit.</span></p></blockquote>

<div class="stat-band" role="region" aria-label="Statistiques des pipelines">
  <div class="stat-item"><span class="stat-num">10</span><span class="stat-text"><span class="lang-fr">Pipelines actifs</span><span class="lang-en">Active pipelines</span></span></div>
  <div class="stat-item"><span class="stat-num">3</span><span class="stat-text"><span class="lang-fr">En préparation</span><span class="lang-en">In progress</span></span></div>
  <div class="stat-item"><span class="stat-num">${PIPELINES.length}</span><span class="stat-text"><span class="lang-fr">Pipelines au total</span><span class="lang-en">Total pipelines</span></span></div>
</div>

<h2 class="first"><span class="lang-fr">Pipelines actifs — bloquants</span><span class="lang-en">Active pipelines — blocking</span></h2>
<p><span class="lang-fr">Ces 10 pipelines bloquent le commit s'ils détectent une violation. Ils s'exécutent dans l'ordre défini par l'orchestrateur <code>quality-gate</code>.</span><span class="lang-en">These 10 pipelines block the commit if they detect a violation. They run in the order defined by the <code>quality-gate</code> orchestrator.</span></p>
<div class="nav-grid">
  ${activePipelines.map(pipelineCard).join('')}
</div>

<h2><span class="lang-fr">Pipelines planifiés</span><span class="lang-en">Planned pipelines</span></h2>
<p><span class="lang-fr">Ces 3 pipelines sont définis et documentés. Ils ne bloquent pas encore les commits — activation prévue au prochain jalon.</span><span class="lang-en">These 3 pipelines are defined and documented. They do not yet block commits — activation planned for the next milestone.</span></p>
<div class="nav-grid">
  ${plannedPipelines.map(pipelineCard).join('')}
</div>

<h2><span class="lang-fr">Orchestrateur</span><span class="lang-en">Orchestrator</span></h2>
<p><span class="lang-fr">Le <strong>quality-gate</strong> coordonne l'exécution de tous les pipelines, génère le rapport d'impact et attend l'approbation humaine avant tout commit.</span><span class="lang-en">The <strong>quality-gate</strong> coordinates the execution of all pipelines, generates the impact report, and awaits human approval before any commit.</span></p>
<div class="nav-grid" style="max-width:420px">
  ${orchestrator ? pipelineCard(orchestrator) : ''}
</div>
`;
  write(path.join(DIST, 'pipelines/index.html'), layout({
    title: 'Pipelines & Workflows', depth: 1,
    sidebar: sidebarPipelines('../', 'index.html'),
    body: body + contributionBanner(),
  }));
}

// ─── PAGE: PIPELINE DETAIL ───────────────────────────────────────────────────
function buildPipelinePage(p) {
  const badgeVariant = p.status === 'active' ? 'success' : p.status === 'planned' ? 'warning' : 'info';
  const badgeFr = p.status === 'active' ? 'Actif' : p.status === 'planned' ? 'Planifié' : 'Orchestrateur';
  const badgeEn = p.status === 'active' ? 'Active' : p.status === 'planned' ? 'Planned' : 'Orchestrator';
  const blockBadge = p.blocking
    ? `<agtc-badge variant="danger" size="sm"><span class="lang-fr">Bloquant</span><span class="lang-en">Blocking</span></agtc-badge>`
    : `<agtc-badge variant="neutral" size="sm"><span class="lang-fr">Non bloquant</span><span class="lang-en">Non-blocking</span></agtc-badge>`;

  const illustration = `<div class="pipeline" role="region" aria-label="Pipeline : ${esc(p.title_en)}">
${p.steps.map(s => `  <div class="pipeline-step">
    <div class="pipeline-tag"><span class="lang-fr">${esc(s.role_fr)}</span><span class="lang-en">${esc(s.role_en)}</span></div>
    <div class="pipeline-title"><span class="lang-fr">${esc(s.title_fr)}</span><span class="lang-en">${esc(s.title_en)}</span></div>
    <div class="pipeline-desc"><span class="lang-fr">${esc(s.desc_fr)}</span><span class="lang-en">${esc(s.desc_en)}</span></div>
  </div>`).join('\n')}
</div>`;

  const triggerTable = p.trigger_table_fr && p.trigger_table_fr.length ? `
<h2><span class="lang-fr">Matrice de déclenchement</span><span class="lang-en">Trigger matrix</span></h2>
<div class="table-wrap" tabindex="0"><table>
  <thead><tr><th><span class="lang-fr">Fichier modifié</span><span class="lang-en">Changed file</span></th><th><span class="lang-fr">Action</span><span class="lang-en">Action</span></th></tr></thead>
  <tbody>
${p.trigger_table_fr.map((row, i) => `    <tr><td><code>${esc(row[0])}</code></td><td><span class="lang-fr">${esc(row[1])}</span><span class="lang-en">${esc(p.trigger_table_en[i][1])}</span></td></tr>`).join('\n')}
  </tbody>
</table></div>` : '';

  const checksList = p.checks_fr && p.checks_fr.length ? `
<h2><span class="lang-fr">Contrôles</span><span class="lang-en">Checks</span></h2>
<ol>
${p.checks_fr.map((c, i) => `  <li><span class="lang-fr">${esc(c)}</span><span class="lang-en">${esc(p.checks_en[i])}</span></li>`).join('\n')}
</ol>` : '';

  const commandBlock = p.command ? `
<h2><span class="lang-fr">Commande</span><span class="lang-en">Command</span></h2>
<pre class="code-block"><code class="lang-bash">${esc(p.command)}</code></pre>` : '';

  const body = `
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--agtc-space-4)">
  <agtc-badge variant="${badgeVariant}" size="sm"><span class="lang-fr">${badgeFr}</span><span class="lang-en">${badgeEn}</span></agtc-badge>
  ${blockBadge}
</div>

<h1><span class="lang-fr">${esc(p.title_fr)}</span><span class="lang-en">${esc(p.title_en)}</span></h1>
<p class="page-lead"><span class="lang-fr">${esc(p.objective_fr)}</span><span class="lang-en">${esc(p.objective_en)}</span></p>

<h2 class="first"><span class="lang-fr">Flux du pipeline</span><span class="lang-en">Pipeline flow</span></h2>
${illustration}

<h2><span class="lang-fr">Valeur métier</span><span class="lang-en">Business value</span></h2>
<p><span class="lang-fr">${esc(p.marketing_fr)}</span><span class="lang-en">${esc(p.marketing_en)}</span></p>
${triggerTable}
${checksList}
${commandBlock}
`;

  write(path.join(DIST, `pipelines/${p.id}.html`), layout({
    title: p.title_fr, depth: 1,
    sidebar: sidebarPipelines('../', p.id + '.html'),
    body: body + contributionBanner(),
  }));
}

// ─── ROBOTS.TXT + SITEMAP.XML ────────────────────────────────────────────────
function buildRobotsAndSitemap(adrs) {
  // robots.txt
  write(path.join(DIST, 'robots.txt'), [
    'User-agent: *',
    'Allow: /',
    '',
    '# Pages internes — non indexées',
    'Disallow: /audit.html',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n'));

  // sitemap.xml — toutes les pages publiques
  const today = new Date().toISOString().split('T')[0];

  // Pages statiques (fréquence + priorité)
  const staticPages = [
    ['',                          'weekly',  '1.0'],
    ['get-started.html',          'monthly', '0.9'],
    ['foundations/index.html',    'monthly', '0.8'],
    ['foundations/color.html',    'monthly', '0.8'],
    ['foundations/spacing.html',  'monthly', '0.8'],
    ['foundations/typography.html','monthly','0.8'],
    ['foundations/icons.html',    'monthly', '0.7'],
    ['foundations/contextes.html','monthly', '0.7'],
    ['components/index.html',     'monthly', '0.9'],
    ['components/button.html',    'monthly', '0.7'],
    ['components/input.html',     'monthly', '0.7'],
    ['components/badge.html',     'monthly', '0.7'],
    ['components/card.html',      'monthly', '0.7'],
    ['components/checkbox.html',  'monthly', '0.7'],
    ['components/radio.html',     'monthly', '0.7'],
    ['components/toggle.html',    'monthly', '0.7'],
    ['components/table.html',     'monthly', '0.7'],
    ['components/code-block.html','monthly', '0.7'],
    ['components/banner.html',    'monthly', '0.7'],
    ['components/link.html',      'monthly', '0.7'],
    ['components/segmented.html', 'monthly', '0.7'],
    ['components/tabs.html',      'monthly', '0.7'],
    ['components/icon.html',      'monthly', '0.7'],
    ['tokens/index.html',         'monthly', '0.8'],
    ['decisions/index.html',      'monthly', '0.8'],
    ['agents/index.html',         'monthly', '0.8'],
    ['pipelines/index.html',      'monthly', '0.8'],
    ['changelog.html',            'monthly', '0.6'],
  ];

  // Pages ADR
  const adrPages = adrs.map(a => [`decisions/${a.slug}.html`, 'monthly', '0.5']);

  // Pages pipeline
  const pipelinePages = PIPELINES.map(p => [`pipelines/${p.id}.html`, 'monthly', '0.6']);

  const allPages = [...staticPages, ...adrPages, ...pipelinePages];

  const urls = allPages.map(([path, freq, prio]) => {
    const url = path ? `${SITE_URL}/${path}` : SITE_URL;
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`;
  }).join('\n');

  write(path.join(DIST, 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n'));
}

// ─── LOAD ADRS ──────────────────────────────────────────────────────────────
function loadADRs() {
  const files = fs.readdirSync(DEC_DIR).filter(f => f.match(/^ADR-\d+.*\.md$/i) && f !== 'README.md');
  return files.map(f => {
    const content = read(path.join(DEC_DIR, f));
    const numMatch = f.match(/^ADR-(\d+)/i);
    const num = numMatch ? parseInt(numMatch[1], 10) : 0;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace(/^ADR-\d+\s*—?\s*/,'').trim() : f;
    const dateMatch = content.match(/\*\*Date\s*:\*\*\s*(.+)/);
    const decidersMatch = content.match(/\*\*Décideurs\s*:\*\*\s*(.+)/);
    const typeMatch = content.match(/\*\*Type\s*:\*\*\s*(.+)/);
    const slug = `adr-${String(num).padStart(3,'0')}`;
    return { num, title, date: dateMatch ? dateMatch[1].trim() : '2026-05-28', deciders: decidersMatch ? decidersMatch[1].trim() : '', type: typeMatch ? typeMatch[1].trim() : '', slug, content, file: f };
  }).sort((a,b) => a.num - b.num);
}

// ─── PAGE: DÉMARRER (Get started) ───────────────────────────────────────────
// Sert les 3 objectifs du site : promouvoir (chemin d'adoption), documenter
// (comment consommer les tokens/composants), exemple vivant (bâtie 100 % avec
// les composants dogfoodés : agtc-banner, code-block, info-card, tables, button).
function buildGetStarted() {
  const REPO = 'https://github.com/gnegreiros-ux/agentic-design-system';

  const cloneCode = esc(`# Aujourd'hui — via le dépôt
git clone ${REPO}.git

# Les tokens compilés vivent dans dist/tokens/ :
#   css/  js/  tailwind/  angular/  ios/  android/`);

  const cssCode = esc(`<!-- Importer les variables CSS générées -->
<link rel="stylesheet" href="dist/tokens/css/all.css">`);

  const cssUseCode = esc(`/* Consommer par INTENTION — jamais de valeur en dur */
.cta {
  background: var(--agtc-semantic-color-action-primary);
  color:      var(--agtc-semantic-color-text-on-action);
  padding:    var(--agtc-semantic-space-control-padding-y)
              var(--agtc-semantic-space-control-padding-x);
  border-radius: var(--agtc-semantic-radius-control);
}`);

  const wcCode = esc(`<!-- Mode composant : Web Components (Lit) -->
<script type="module" src="components/agtc-button.js"></script>

<agtc-button variant="primary">Enregistrer</agtc-button>
<agtc-button variant="critical">Supprimer le dossier</agtc-button>`);

  // logo : nom de fichier dans integrations/ (couleur de marque)
  const platforms = [
    ['css',     'dist/tokens/css/',     'Variables CSS (custom properties)',      'CSS custom properties', '<img class="vendor-logo" src="integrations/css.svg" alt="CSS" width="20" height="20" loading="lazy">'],
    ['js',      'dist/tokens/js/',      'Exports ES6',                            'ES6 exports',            '<img class="vendor-logo" src="integrations/javascript.svg" alt="JavaScript" width="20" height="20" loading="lazy">'],
    ['tailwind','dist/tokens/tailwind/','Extension de configuration',             'Config extension',       '<img class="vendor-logo" src="integrations/tailwind.svg" alt="Tailwind CSS" width="20" height="20" loading="lazy">'],
    ['angular', 'dist/tokens/angular/', 'SCSS Material M3',                       'Material M3 SCSS',       '<img class="vendor-logo" src="integrations/angular.svg" alt="Angular" width="20" height="20" loading="lazy">'],
    ['ios',     'dist/tokens/ios/',     'Swift',                                  'Swift',                  '<img class="vendor-logo" src="integrations/swift.svg" alt="Swift (iOS)" width="20" height="20" loading="lazy">'],
    ['android', 'dist/tokens/android/', 'XML (couleurs + dimensions)',           'XML (colors + dimensions)','<img class="vendor-logo" src="integrations/android.svg" alt="Android" width="20" height="20" loading="lazy">'],
  ];
  const platformRows = platforms.map(([p, file, fr, en, logo]) =>
    `<tr><td><span class="platform-cell">${logo}<code>${p}</code></span></td><td><code>${file}</code></td><td><span class="lang-fr">${fr}</span><span class="lang-en">${en}</span></td></tr>`
  ).join('');

  const body = `
<h1><span class="lang-fr">Démarrer</span><span class="lang-en">Get started</span></h1>
<p class="page-lead">
  <span class="lang-fr">Adopter Agentica, c'est consommer des décisions — pas des valeurs. Trois niveaux de tokens, 14 composants, six plateformes de sortie, le tout auditable WCAG 2.2. Voici comment l'intégrer en quelques minutes.</span>
  <span class="lang-en">Adopting Agentica means consuming decisions — not values. Three token levels, 14 components, six output platforms, all WCAG 2.2 auditable. Here is how to integrate it in minutes.</span>
</p>

<agtc-banner variant="info">
  <strong><span class="lang-fr">Pré-version (v0.x)</span><span class="lang-en">Pre-release (v0.x)</span></strong>
  <span>
    <span class="lang-fr">Aujourd'hui, Agentica se consomme directement depuis le dépôt (tokens compilés + Web Components). La publication sur <strong>npm est à venir</strong> — les commandes <code>npm</code> ci-dessous décrivent la trajectoire cible.</span>
    <span class="lang-en">Today, Agentica is consumed directly from the repository (compiled tokens + Web Components). Publishing to <strong>npm is coming</strong> — the <code>npm</code> commands below describe the target path.</span>
  </span>
</agtc-banner>

<h2 class="first"><span class="lang-fr">Ce que vous obtenez</span><span class="lang-en">What you get</span></h2>
<div class="grid-3">
  <div class="info-card">
    <div class="info-card-icon">${icon('layers', 20)}</div>
    <div class="info-card-title"><span class="lang-fr">Tokens à 3 niveaux</span><span class="lang-en">3-level tokens</span></div>
    <div class="info-card-body"><span class="lang-fr">Primitif → sémantique → composant. Les valeurs sont séparées des intentions — lisibles par les humains et les agents.</span><span class="lang-en">Primitive → semantic → component. Values are separated from intentions — readable by humans and agents.</span></div>
  </div>
  <div class="info-card">
    <div class="info-card-icon">${icon('component', 20)}</div>
    <div class="info-card-title"><span class="lang-fr">14 composants</span><span class="lang-en">14 components</span></div>
    <div class="info-card-body"><span class="lang-fr">Web Components framework-agnostic (Lit), ou classes CSS. Chaque composant est un contrat, pas une suggestion.</span><span class="lang-en">Framework-agnostic Web Components (Lit), or CSS classes. Each component is a contract, not a suggestion.</span></div>
  </div>
  <div class="info-card">
    <div class="info-card-icon">${icon('share-2', 20)}</div>
    <div class="info-card-title"><span class="lang-fr">6 plateformes</span><span class="lang-en">6 platforms</span></div>
    <div class="info-card-body"><span class="lang-fr">CSS, JS, Tailwind, Angular, iOS, Android — une seule source de vérité, compilée partout.</span><span class="lang-en">CSS, JS, Tailwind, Angular, iOS, Android — one source of truth, compiled everywhere.</span></div>
  </div>
</div>

<h2><span class="lang-fr">Trois étapes</span><span class="lang-en">Three steps</span></h2>

<h3><span class="lang-fr">1. Récupérer les tokens</span><span class="lang-en">1. Get the tokens</span></h3>
<p>
  <span class="lang-fr">Clonez le dépôt. Les tokens sont déjà compilés pour chaque plateforme dans <code>dist/tokens/</code>.</span>
  <span class="lang-en">Clone the repository. Tokens are pre-compiled for every platform in <code>dist/tokens/</code>.</span>
</p>
<pre class="code-block"><code class="lang-bash">${cloneCode}</code></pre>

<h3><span class="lang-fr">2. Importer et consommer les variables CSS</span><span class="lang-en">2. Import and consume the CSS variables</span></h3>
<p>
  <span class="lang-fr">Liez la feuille de tokens, puis référencez les variables sémantiques par leur <strong>intention</strong>. C'est l'approche que ce site lui-même utilise.</span>
  <span class="lang-en">Link the token sheet, then reference semantic variables by their <strong>intent</strong>. This is the approach this very site uses.</span>
</p>
<pre class="code-block"><code class="lang-html">${cssCode}</code></pre>
<pre class="code-block"><code class="lang-css">${cssUseCode}</code></pre>

<h3><span class="lang-fr">3. Utiliser les Web Components</span><span class="lang-en">3. Use the Web Components</span></h3>
<p>
  <span class="lang-fr">Pour une intégration applicative, montez les Web Components <code>agtc-*</code> (Lit en dépendance pair). Ils portent les contrats comportementaux — par exemple, <code>critical</code> exige une confirmation.</span>
  <span class="lang-en">For app integration, mount the <code>agtc-*</code> Web Components (Lit as a peer dependency). They carry behavioural contracts — e.g. <code>critical</code> requires confirmation.</span>
</p>
<pre class="code-block"><code class="lang-html">${wcCode}</code></pre>

<agtc-banner variant="brand" icon="shield-check">
  <strong><span class="lang-fr">La règle d'or</span><span class="lang-en">The golden rule</span></strong>
  <span>
    <span class="lang-fr">Jamais de valeur en dur. Toujours via un token sémantique. Cette indirection est ce qui rend vos décisions applicables par des agents IA — sans interprétation. <a href="tokens/index.html">Voir les trois niveaux →</a></span>
    <span class="lang-en">Never a hardcoded value. Always through a semantic token. This indirection is what makes your decisions applicable by AI agents — without interpretation. <a href="tokens/index.html">See the three levels →</a></span>
  </span>
</agtc-banner>

<h2><span class="lang-fr">Plateformes de sortie</span><span class="lang-en">Output platforms</span></h2>
<p>
  <span class="lang-fr">Une source JSON, compilée par Style Dictionary vers six cibles. Importez celle de votre stack.</span>
  <span class="lang-en">One JSON source, compiled by Style Dictionary to six targets. Import the one for your stack.</span>
</p>
<table>
  <thead><tr>
    <th><span class="lang-fr">Plateforme</span><span class="lang-en">Platform</span></th>
    <th><span class="lang-fr">Dossier</span><span class="lang-en">Folder</span></th>
    <th><span class="lang-fr">Format</span><span class="lang-en">Format</span></th>
  </tr></thead>
  <tbody>${platformRows}</tbody>
</table>

<h2><span class="lang-fr">Pour les agents IA</span><span class="lang-en">For AI agents</span></h2>
<p>
  <span class="lang-fr">Agentica n'est pas qu'une bibliothèque visuelle : c'est un jeu de règles lisibles par machine. Un agent lit les contrats de composants, les règles de gouvernance et les ADRs pour appliquer vos décisions sans improviser — et escalade vers un humain quand c'est requis.</span>
  <span class="lang-en">Agentica is more than a visual library: it is a machine-readable rule set. An agent reads component contracts, governance rules and ADRs to apply your decisions without improvising — and escalates to a human when required.</span>
</p>
<div class="hero-actions">
  <a href="agents/index.html" class="agtc-button primary">
    <span class="lang-fr">Documentation agents →</span><span class="lang-en">Agent documentation →</span>
  </a>
  <a href="components/index.html" class="agtc-button secondary">
    <span class="lang-fr">Explorer les composants</span><span class="lang-en">Explore components</span>
  </a>
  <a href="${REPO}" target="_blank" rel="noopener noreferrer" class="agtc-button ghost">
    ${icon('github', 16)} <span class="lang-fr">Code source</span><span class="lang-en">Source code</span>
  </a>
</div>`;

  write(path.join(DIST, 'get-started.html'), layout({
    title: 'Démarrer',
    pageTitle: 'Démarrer avec Agentica',
    depth: 0,
    sidebar: null,
    fullWidth: false,
    context: 'marketing',
    body,
  }));
}

// ─── PAGE: CHANGELOG ────────────────────────────────────────────────────────
function buildChangelog() {
  // Chaque version : [id, version, date, badge?, sections:[{titleFr,titleEn,items:[{fr,en}]}]]
  const versions = [
    {
      id: 'v0-1-0', ver: 'v0.1.0', date: '2026', badge: {fr:'Non lancée',en:'Unreleased'},
      sections: [
        { fr:'Fondations', en:'Foundations', items:[
          {fr:'Architecture de tokens 3 niveaux : primitifs → sémantiques → composant (DTCG-conforme)',en:'3-layer token architecture: primitives → semantic → component (DTCG-compliant)'},
          {fr:'Palette de couleurs Radix UI (échelles 12 niveaux), espacement grille 4px, typographie Atkinson Hyperlegible',en:'Radix UI color palette (12-step scales), 4px spacing grid, Atkinson Hyperlegible typography'},
          {fr:'Bibliothèque d\'icônes Lucide — 1 500+ icônes, 3 tailles, contrats d\'accessibilité WCAG 1.1.1',en:'Lucide icon library — 1,500+ icons, 3 sizes, WCAG 1.1.1 accessibility contracts'},
        ]},
        { fr:'Composants', en:'Components', items:[
          {fr:'14 Web Components (Lit) : Button, Input, Badge, Card, Checkbox, Radio, Toggle, Table, Code Block, Banner, Link, Icon, Segmented',en:'14 Web Components (Lit): Button, Input, Badge, Card, Checkbox, Radio, Toggle, Table, Code Block, Banner, Link, Icon, Segmented'},
          {fr:'Variantes Button : primary, secondary, ghost, critical — confirmation obligatoire pour les actions irréversibles',en:'Button variants: primary, secondary, ghost, critical — required confirmation for irreversible actions'},
          {fr:'Tokens de composant institutionnels dans <code>tokens/component.json</code>',en:'Institutional component tokens in <code>tokens/component.json</code>'},
        ]},
        { fr:'Gouvernance & Agents', en:'Governance & Agents', items:[
          {fr:'55 ADRs (Architecture Decision Records) — toutes les décisions tracées et justifiées',en:'55 ADRs (Architecture Decision Records) — all decisions traced and justified'},
          {fr:'4 types d\'agents IA : Designer, Developer, QA, Documentation',en:'4 AI agent types: Designer, Developer, QA, Documentation'},
          {fr:'Conformité WCAG 2.1 AA — audit intégré, 0 violation critique',en:'WCAG 2.1 AA compliance — built-in audit, 0 critical violations'},
          {fr:'Pipeline qualité complet : tokens-audit, WCAG, UX patterns, ADR, docs, site rebuild',en:'Full quality pipeline: tokens-audit, WCAG, UX patterns, ADR, docs, site rebuild'},
        ]},
        { fr:'Site & Documentation', en:'Site & Documentation', items:[
          {fr:'Générateur de site statique sur-mesure (Node.js), bilingue FR/EN',en:'Custom static site generator (Node.js), bilingual FR/EN'},
          {fr:'Storybook publié sur Chromatic — canvas interactif, previews, specs',en:'Storybook published on Chromatic — interactive canvas, previews, specs'},
          {fr:'Sync Figma ↔ JSON via Tokens Studio',en:'Figma ↔ JSON sync via Tokens Studio'},
        ]},
      ]
    },
  ];

  const renderVersion = (v, isLatest) => {
    const sectionsHtml = v.sections.map(s => `
      <h2><span class="lang-fr">${s.fr}</span><span class="lang-en">${s.en}</span></h2>
      <ul>${s.items.map(i => `<li><span class="lang-fr">${i.fr}</span><span class="lang-en">${i.en}</span></li>`).join('')}</ul>`).join('');
    const header = `
      <span class="changelog-version">${v.ver}</span>
      ${v.badge ? `<span class="changelog-badge"><span class="lang-fr">${v.badge.fr}</span><span class="lang-en">${v.badge.en}</span></span>` : ''}
      ${!isLatest ? `<span class="changelog-chevron">${icon('chevron-down',16)}</span>` : ''}`;
    const accordion = isLatest
      ? `<div class="changelog-accordion"><div class="changelog-summary">${header}</div><div class="changelog-body">${sectionsHtml}</div></div>`
      : `<details class="changelog-accordion"><summary class="changelog-summary">${header}</summary><div class="changelog-body">${sectionsHtml}</div></details>`;
    return `
<div class="changelog-item${isLatest ? ' latest' : ''}" id="${v.id}">
  <div class="changelog-item-date">${v.date}</div>
  <div class="changelog-item-content">${accordion}</div>
</div>`;
  };

  const tocLinks = versions.map(v => {
    const badge = v.badge ? ` <span style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)" class="lang-fr">${v.badge.fr}</span><span style="font-size:var(--agtc-semantic-typography-detail-size);color:var(--agtc-semantic-color-text-secondary)" class="lang-en">${v.badge.en}</span>` : '';
    return `<a href="#${v.id}">${v.ver}${badge}</a>`;
  }).join('');
  const tocContent = `<span class="toc-title"><span class="lang-fr">Versions</span><span class="lang-en">Versions</span></span>${tocLinks}`;
  const tocScript = '<script>document.addEventListener(\'DOMContentLoaded\',function(){var t=document.getElementById(\'page-toc\');if(t)t.innerHTML=' + JSON.stringify(tocContent) + ';});<\/script>';

  const body = `
${tocScript}
<h1>Changelog</h1>
<p class="page-lead">
  <span class="lang-fr">Historique des versions d'Agentica — chaque entrée décrit les changements, décisions et améliorations apportées au système.</span>
  <span class="lang-en">Agentica version history — each entry describes the changes, decisions, and improvements made to the system.</span>
</p>
<div class="changelog-timeline" style="position:relative">
  <div class="changelog-timeline-track" aria-hidden="true"></div>
  ${versions.map((v, i) => renderVersion(v, i === 0)).join('\n')}
</div>
${contributionBanner()}
`;

  write(path.join(DIST, 'changelog.html'), layout({
    title: 'Changelog', depth: 0,
    sidebar: null,
    body
  }));
}

// ─── PAGE: AUDIT ────────────────────────────────────────────────────────────
function buildAudit() {
  const auditFile = path.join(DIST, 'audit.html');
  // On exclut audit.html lui-même de l'analyse (il n'existe pas encore à ce stade)
  const r = runAudit({ excludeFile: auditFile });

  const dateStr = r.timestamp.toLocaleDateString('fr-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Toronto'
  });
  const dateStrEn = r.timestamp.toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Toronto'
  });

  const passing = r.totalViolations === 0;
  const badgeCls = passing ? 'pass' : 'fail';
  const badgeIconName = passing ? 'shield-check' : 'shield-alert';

  // ── Cartes résumé ──────────────────────────────────────────────────────────
  const cards = `
<div class="audit-cards">
  <div class="audit-card">
    <span class="audit-number">${r.pageCount}</span>
    <span class="lang-fr">Pages analysées</span>
    <span class="lang-en">Pages audited</span>
  </div>
  <div class="audit-card audit-card--pass">
    <span class="audit-number" style="color:var(--agtc-semantic-color-action-primary)">${r.totalPassed}</span>
    <span class="lang-fr">Vérifications réussies</span>
    <span class="lang-en">Checks passed</span>
  </div>
  <div class="audit-card ${r.totalWarnings > 0 ? 'audit-card--warn' : ''}">
    <span class="audit-number">${r.totalWarnings}</span>
    <span class="lang-fr">Avertissements</span>
    <span class="lang-en">Warnings</span>
  </div>
  <div class="audit-card ${r.totalViolations > 0 ? 'audit-card--fail' : 'audit-card--pass'}">
    <span class="audit-number">${r.totalViolations}</span>
    <span class="lang-fr">Violation${r.totalViolations !== 1 ? 's' : ''}</span>
    <span class="lang-en">Violation${r.totalViolations !== 1 ? 's' : ''}</span>
  </div>
</div>`;

  // ── Tableau de contraste ──────────────────────────────────────────────────
  const contrastRows = r.contrastResults.map(c => {
    const ratio = c.ratio;
    const ok    = c.pass;
    const cls   = ok ? 'audit-contrast-pass' : 'audit-contrast-fail';
    const statusIcon = ok ? icon('check', 14) : icon('x', 14);
    return `<tr>
      <td><span class="audit-swatch" style="background:${c.fg}"></span><code>${c.fg}</code></td>
      <td><span class="audit-swatch" style="background:${c.bg}"></span><code>${c.bg}</code></td>
      <td class="${cls}">${statusIcon} ${ratio}:1</td>
      <td style="color:var(--agtc-semantic-color-text-secondary);font-size:var(--agtc-semantic-typography-detail-size)">≥ ${c.required}:1</td>
      <td style="font-size:var(--agtc-semantic-typography-detail-size)">${c.label}</td>
    </tr>`;
  }).join('');

  const contrastTable = `
<table class="audit-contrast-table" aria-label="Résultats des ratios de contraste WCAG">
  <colgroup>
    <col style="width:110px">
    <col style="width:110px">
    <col style="width:100px">
    <col style="width:80px">
    <col>
  </colgroup>
  <thead>
    <tr>
      <th><span class="lang-fr">Avant-plan</span><span class="lang-en">Foreground</span></th>
      <th><span class="lang-fr">Arrière-plan</span><span class="lang-en">Background</span></th>
      <th><span class="lang-fr">Ratio</span><span class="lang-en">Ratio</span></th>
      <th><span class="lang-fr">Requis</span><span class="lang-en">Required</span></th>
      <th><span class="lang-fr">Contexte</span><span class="lang-en">Context</span></th>
    </tr>
  </thead>
  <tbody>${contrastRows}</tbody>
</table>`;

  // ── Violations (si présentes) ─────────────────────────────────────────────
  let violationsSection = '';
  if (r.allViolations.length > 0) {
    // escMsg : les guillemets des messages (ex: id="x") → &quot; pour éviter les faux positifs dans audit-lib
    const escMsg = s => esc(s).replace(/"/g, '&quot;');
    const rows = r.allViolations.map(v =>
      `<li style="padding:8px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default);font-size:0.85rem">
        <strong>SC ${v.criterion}</strong> — ${escMsg(v.msg)}
        <span style="color:var(--agtc-semantic-color-text-secondary);margin-left:8px;font-size:var(--agtc-semantic-typography-detail-size)">${v.file}</span>
      </li>`
    ).join('');
    violationsSection = `
<div class="audit-section">
  <h2>${icon('alert-circle', 16)} <span class="lang-fr">Violations</span><span class="lang-en">Violations</span></h2>
  <ul style="list-style:none;padding:0;margin:0">${rows}</ul>
</div>`;
  }

  // ── Liste des vérifications manuelles ─────────────────────────────────────
  const manualItems = MANUAL_CHECKS.map(({ criterion, titleFr, titleEn, descFr, descEn }) => `
  <li class="audit-manual-item">
    <span class="audit-manual-crit">SC ${criterion}</span>
    <div class="audit-manual-body">
      <strong><span class="lang-fr">${titleFr}</span><span class="lang-en">${titleEn}</span></strong>
      <span><span class="lang-fr">${descFr}</span><span class="lang-en">${descEn}</span></span>
    </div>
  </li>`).join('');

  const body = `
<h1>
  <span class="lang-fr">Rapport d'accessibilité WCAG 2.2</span>
  <span class="lang-en">WCAG 2.2 Accessibility Report</span>
</h1>

<div class="audit-hero">
  <div class="audit-badge ${badgeCls}">
    ${icon(badgeIconName, 20)}
    <span class="lang-fr">${passing ? 'Conforme WCAG 2.2 AA' : `${r.totalViolations} violation${r.totalViolations > 1 ? 's' : ''} détectée${r.totalViolations > 1 ? 's' : ''}`}</span>
    <span class="lang-en">${passing ? 'WCAG 2.2 AA Compliant' : `${r.totalViolations} violation${r.totalViolations > 1 ? 's' : ''} detected`}</span>
  </div>
  <p class="audit-date">
    <span class="lang-fr">Généré le ${dateStr} (heure de Montréal)</span>
    <span class="lang-en">Generated on ${dateStrEn} (Montréal time)</span>
  </p>
</div>

${cards}

${violationsSection}

<div class="audit-section">
  <h2>${icon('droplets', 16)} <span class="lang-fr">Ratios de contraste — SC 1.4.3 / 1.4.11</span><span class="lang-en">Contrast ratios — SC 1.4.3 / 1.4.11</span></h2>
  ${contrastTable}
</div>

<div class="audit-section">
  <h2>${icon('clipboard-list', 16)} <span class="lang-fr">Vérifications manuelles requises</span><span class="lang-en">Required manual checks</span></h2>
  <p style="font-size:0.85rem;color:var(--agtc-semantic-color-text-secondary);margin-bottom:16px">
    <span class="lang-fr">Ces critères ne peuvent pas être vérifiés automatiquement. Une revue manuelle périodique est recommandée.</span>
    <span class="lang-en">These criteria cannot be automatically verified. Periodic manual review is recommended.</span>
  </p>
  <ul class="audit-manual-list">${manualItems}</ul>
</div>

<div class="audit-section">
  <h2>${icon('info', 16)} <span class="lang-fr">Méthode d'audit</span><span class="lang-en">Audit method</span></h2>
  <div class="audit-method">
    <span class="lang-fr">Cet audit est une <strong>analyse statique automatisée</strong> du HTML généré. Il vérifie la structure sémantique, les noms accessibles, la hiérarchie des titres, les ratios de contraste des tokens, et les critères WCAG 2.2 détectables sans navigateur. Il ne remplace pas un audit avec lecteur d'écran, ni une vérification de la navigation clavier en conditions réelles. Les critères marqués « vérification manuelle » doivent être testés par un humain.</span>
    <span class="lang-en">This audit is an <strong>automated static analysis</strong> of generated HTML. It checks semantic structure, accessible names, heading hierarchy, token contrast ratios, and WCAG 2.2 criteria detectable without a browser. It does not replace a screen reader audit or real-world keyboard navigation testing. Criteria marked "manual check" must be tested by a human.</span>
  </div>
</div>
`;

  write(auditFile, layout({
    title: 'Audit WCAG',
    pageTitle: 'Audit WCAG 2.2',
    depth: 0,
    sidebar: null,
    fullWidth: false,
    body,
  }));
}

// ─── MAIN BUILD ─────────────────────────────────────────────────────────────
// ─── VALIDATION : variables CSS fantômes ─────────────────────────────────────
// Garde-fou anti-régression. Toute `var(--agtc-…)` référencée dans le CSS/HTML
// généré DOIT avoir une définition (`--agtc-…:`) quelque part dans la sortie.
// Une référence orpheline échoue SILENCIEUSEMENT en CSS (la propriété est
// ignorée) — c'est exactement le bug du padding nul des badges (2026-06-02,
// `--agtc-primitive-space-3` jamais émis). Ce check fait échouer le build.
function validateCssVars() {
  const cssFiles = [], htmlFiles = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) walk(fp);
      else if (e.name.endsWith('.css')) cssFiles.push(fp);
      else if (e.name.endsWith('.html')) htmlFiles.push(fp);
    }
  })(DIST);

  // Définitions : uniquement dans les .css (tokens.css, site.css) — c'est là que
  // vivent toutes les `--agtc-…: …`.
  const defined = new Set();
  const defRe = /(--agtc-[a-z0-9-]+)\s*:/gi;
  for (const fp of cssFiles) {
    let m; const css = fs.readFileSync(fp, 'utf8');
    while ((m = defRe.exec(css))) defined.add(m[1]);
  }

  // Références SANS fallback uniquement : `var(--x)` fermé directement par `)`.
  // `var(--x, …)` ne panne pas silencieusement (fallback), on l'ignore.
  const referenced = new Map(); // nom -> fichier exemple
  const refRe = /var\(\s*(--agtc-[a-z0-9-]+)\s*\)/gi;
  const collectRefs = (text, fp) => {
    let m;
    while ((m = refRe.exec(text))) if (!referenced.has(m[1])) referenced.set(m[1], path.relative(DIST, fp));
  };
  for (const fp of cssFiles) collectRefs(fs.readFileSync(fp, 'utf8'), fp);
  for (const fp of htmlFiles) {
    // Exclure les exemples de code affichés (<pre>/<code>) — ce n'est pas du style
    // appliqué mais de la documentation montrant les vrais noms de tokens.
    const html = fs.readFileSync(fp, 'utf8')
      .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
      .replace(/<code\b[\s\S]*?<\/code>/gi, '');
    collectRefs(html, fp);
  }

  const dangling = [...referenced].filter(([name]) => !defined.has(name));
  if (dangling.length) {
    console.error(`\n✗ ${dangling.length} variable(s) CSS fantôme(s) — référencées mais jamais définies :`);
    for (const [name, file] of dangling) console.error(`    ${name}   (ex: ${file})`);
    console.error('  → Définir ces tokens (souvent dans tokensCSS()) ou corriger la référence.\n');
    process.exit(1);
  }
  console.log(`✓ Variables CSS : ${defined.size} définies · ${referenced.size} référencées · 0 fantôme`);
}

function build() {
  console.log('\nAgentica — build\n');
  ensureDir(DIST);
  ensureDir(path.join(DIST, 'foundations'));
  ensureDir(path.join(DIST, 'components'));
  ensureDir(path.join(DIST, 'tokens'));
  ensureDir(path.join(DIST, 'decisions'));
  ensureDir(path.join(DIST, 'agents'));
  ensureDir(path.join(DIST, 'pipelines'));

  write(path.join(DIST, 'tokens.css'), tokensCSS());
  write(path.join(DIST, 'site.css'), siteCSS());
  write(path.join(DIST, 'site.js'), siteJS());
  bundleComponents();

  // Copie de l'image sociale (OG image)
  const socialSrc = path.join(__dirname, '..', 'Brand', 'agentica-social-image.png');
  const socialDst = path.join(DIST, 'social.png');
  if (fs.existsSync(socialSrc)) fs.copyFileSync(socialSrc, socialDst);

  // Favicons depuis Brand/Favicon/
  const brandFaviconDir = path.join(__dirname, '..', 'Brand', 'Favicon');
  ['favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','android-chrome-192x192.png','android-chrome-512x512.png'].forEach(f => {
    const src = path.join(brandFaviconDir, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, f));
  });
  write(path.join(DIST, 'site.webmanifest'), JSON.stringify({
    name: 'Agentica',
    short_name: 'Agentica',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: '#12A594',
    background_color: '#ffffff',
    display: 'standalone'
  }, null, 2));

  // Logo SVG depuis Brand/logo/
  const logoSrc = path.join(__dirname, '..', 'Brand', 'logo', 'Logo Agentica - teal.svg');
  if (fs.existsSync(logoSrc)) fs.copyFileSync(logoSrc, path.join(DIST, 'logo.svg'));

  // Illustrations SVG — copiées dans dist/img/ et chargées lazily (P1 perf)
  ensureDir(path.join(DIST, 'img'));
  ['pipeline-tokens.svg', 'human-last-word.svg', 'multi-platform.svg'].forEach(f => {
    const src = path.join(ROOT, 'illustrations', f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, 'img', f));
  });

  // Illustrations PNG (redesign narratif) — source : Brand/illustrations/
  const illusSrc = path.join(__dirname, '..', 'Brand', 'illustrations');
  if (fs.existsSync(illusSrc)) {
    fs.readdirSync(illusSrc)
      .filter(f => f.endsWith('.png'))
      .forEach(f => fs.copyFileSync(path.join(illusSrc, f), path.join(DIST, 'img', f)));
  }

  // Logos d'intégration (frameworks / plateformes / outils) depuis Brand/integrations/
  // Affichés dans leurs couleurs de marque officielles → copiés tels quels, servis via <img>.
  const integrationsSrc = path.join(__dirname, '..', 'Brand', 'integrations');
  if (fs.existsSync(integrationsSrc)) {
    const integrationsDst = path.join(DIST, 'integrations');
    ensureDir(integrationsDst);
    fs.readdirSync(integrationsSrc)
      .filter(f => f.endsWith('.svg'))
      .forEach(f => fs.copyFileSync(path.join(integrationsSrc, f), path.join(integrationsDst, f)));
  }

  const adrs = loadADRs();
  buildHome(adrs);
  buildGetStarted();
  buildChangelog();
  buildFoundationsIndex();
  buildColor();
  buildSpacing();
  buildTypography();
  buildIconsFoundation();
  buildContextes();
  buildComponentsIndex();
  buildButton();
  buildIcon();
  buildInput();
  buildBadge();
  buildCard();
  buildCheckbox();
  buildRadio();
  buildToggle();
  buildTable();
  buildCodeBlock();
  buildBanner();
  buildLink();
  buildSegmented();
  buildTabs();
  buildTokens();
  buildDecisionsIndex(adrs);
  adrs.forEach(adr => buildADR(adr, adrs));
  buildAgents();
  buildPipelinesIndex();
  PIPELINES.forEach(p => buildPipelinePage(p));
  buildRobotsAndSitemap(adrs);
  buildAudit();  // doit être appelé en dernier — analyse les pages déjà générées

  validateCssVars();  // garde-fou : aucune var(--agtc-…) orpheline dans la sortie

  const total = 18 + adrs.length + 1 + PIPELINES.length;
  console.log(`\n✓ ${total} fichiers générés dans site/dist/\n`);
}

// ─── WATCH MODE ─────────────────────────────────────────────────────────────
if (process.argv.includes('--watch')) {
  build();
  try {
    const chokidar = require('chokidar');
    const watched = [
      path.join(ROOT, 'tokens'),
      path.join(ROOT, 'decisions'),
      path.join(ROOT, 'guidelines'),
    ];
    console.log('Watching for changes… (Ctrl+C to stop)\n');
    chokidar.watch(watched, { ignoreInitial: true }).on('change', (fp) => {
      console.log(`Changed: ${path.relative(ROOT, fp)}`);
      build();
    });
  } catch {
    console.log('chokidar not found — run npm install to enable watch mode');
  }
} else {
  build();
}
