#!/usr/bin/env node
'use strict';

// ─── SETUP ─────────────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const DIST       = path.join(__dirname, 'dist');
const TOKENS_DIR = path.join(ROOT, 'tokens');
const DEC_DIR    = path.join(ROOT, 'decisions');

const { runAudit, MANUAL_CHECKS } = require('./audit-lib');

const ensureDir = (d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
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
      const pr = (r,t) => r.split('|').filter(c=>c.trim()).map(c=>`<${t}>${inl(c.trim())}</${t}>`).join('');
      out.push(`<div class="table-wrap"><table><thead><tr>${pr(rows[0],'th')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${pr(r,'td')}</tr>`).join('')}</tbody></table></div>`);
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
  'card-padding-sm':                    'var(--agtc-primitive-space-3)',
  'card-padding-lg':                    'var(--agtc-primitive-space-6)',
  'badge-neutral-background':           'var(--agtc-semantic-color-background-subtle)',
  'badge-neutral-text':                 'var(--agtc-semantic-color-text-secondary)',
  'badge-neutral-border':               'var(--agtc-semantic-color-border-default)',
  'badge-brand-background':             'var(--agtc-semantic-color-brand-primary-subtle)',
  'badge-brand-text':                   'var(--agtc-primitive-color-teal-12)',
  'badge-brand-border':                 'transparent',
  'badge-success-background':           'var(--agtc-primitive-color-green-3)',
  'badge-success-text':                 'var(--agtc-semantic-color-feedback-success)',
  'badge-success-border':               'transparent',
  'badge-warning-background':           'var(--agtc-primitive-color-orange-3)',
  'badge-warning-text':                 'var(--agtc-primitive-color-orange-12)',
  'badge-warning-border':               'transparent',
  'badge-danger-background':            'var(--agtc-semantic-color-feedback-danger-subtle)',
  'badge-danger-text':                  'var(--agtc-semantic-color-feedback-danger)',
  'badge-danger-border':                'transparent',
  'badge-info-background':              'var(--agtc-primitive-color-blue-3)',
  'badge-info-text':                    'var(--agtc-primitive-color-blue-12)',
  'badge-info-border':                  'transparent',
  'badge-md-radius':                    '9999px',
  'badge-md-padding-x':                 'var(--agtc-primitive-space-3)',
  'badge-md-padding-y':                 'var(--agtc-primitive-space-1)',
  'badge-md-font-size':                 'var(--agtc-semantic-typography-label-size)',
  'badge-sm-radius':                    '9999px',
  'badge-sm-padding-x':                 'var(--agtc-primitive-space-2)',
  'badge-sm-padding-y':                 '2px',
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
  'table-padding-x':                    'var(--agtc-primitive-space-3)',
  'table-padding-y-compact':            'var(--agtc-primitive-space-2)',
  'table-padding-y-comfortable':        'var(--agtc-primitive-space-3)',
  'code-block-default-background':            'var(--agtc-primitive-color-gray-12)',
  'code-block-default-text':                  'var(--agtc-primitive-color-gray-4)',
  'code-block-default-meta-text':             'var(--agtc-primitive-color-gray-8)',
  'code-block-default-copy-background':       'var(--agtc-primitive-color-gray-11)',
  'code-block-default-copy-background-hover': 'var(--agtc-primitive-color-gray-10)',
  'code-block-default-copy-text':             'var(--agtc-primitive-color-gray-1)',
  'code-block-default-border-focus':          'var(--agtc-semantic-color-border-focus)',
  'code-block-default-radius':                'var(--agtc-semantic-radius-card)',
  'code-block-default-font-size':             'var(--agtc-semantic-typography-label-size)',
  'code-block-default-padding-x':             'var(--agtc-primitive-space-5)',
  'code-block-default-padding-y':             'var(--agtc-primitive-space-4)',
  'banner-neutral-background':          'var(--agtc-semantic-color-background-subtle)',
  'banner-neutral-accent':              'var(--agtc-semantic-color-text-secondary)',
  'banner-brand-background':            'var(--agtc-semantic-color-brand-primary-subtle)',
  'banner-brand-accent':                'var(--agtc-semantic-color-brand-primary)',
  'banner-info-background':             'var(--agtc-primitive-color-blue-3)',
  'banner-info-accent':                 'var(--agtc-semantic-color-feedback-info)',
  'banner-success-background':          'var(--agtc-primitive-color-green-3)',
  'banner-success-accent':              'var(--agtc-semantic-color-feedback-success)',
  'banner-warning-background':          'var(--agtc-primitive-color-orange-3)',
  'banner-warning-accent':              'var(--agtc-primitive-color-orange-11)',
  'banner-danger-background':           'var(--agtc-semantic-color-feedback-danger-subtle)',
  'banner-danger-accent':               'var(--agtc-semantic-color-feedback-danger)',
  'banner-heading-text':                'var(--agtc-semantic-color-text-primary)',
  'banner-body-text':                   'var(--agtc-semantic-color-text-secondary)',
  'banner-close-color':                 'var(--agtc-semantic-color-text-secondary)',
  'banner-close-hover':                 'var(--agtc-semantic-color-text-primary)',
  'banner-border-focus':                'var(--agtc-semantic-color-border-focus)',
  'banner-radius':                      'var(--agtc-semantic-radius-card)',
  'banner-padding-x':                   'var(--agtc-primitive-space-5)',
  'banner-padding-y':                   'var(--agtc-primitive-space-4)',
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
  'toggle-default-track-off':           'var(--agtc-primitive-color-gray-9)',
  'toggle-default-track-off-hover':     'var(--agtc-primitive-color-gray-10)',
  'toggle-default-track-on':            'var(--agtc-semantic-color-action-primary)',
  'toggle-default-track-on-hover':      'var(--agtc-semantic-color-action-primary-hover)',
  'toggle-default-knob':                'var(--agtc-semantic-color-background-surface)',
  'toggle-default-border-focus':        'var(--agtc-semantic-color-border-focus)',
  'toggle-default-label':               'var(--agtc-semantic-color-text-primary)',
};

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
  return lines.join('\n');
}

function siteCSS() { return `
/* Agentica — site.css (uses design system tokens) */
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
:root{--agtc-font-mono:var(--agtc-semantic-typography-mono-family)}

/* SC 2.4.11 — Focus Not Obscured : compense le header fixe de 60px */
html { scroll-padding-top: 72px; }

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
  position:fixed;top:0;left:0;right:0;height:60px;z-index:100;
  background:var(--agtc-semantic-color-background-surface);
  border-top:3px solid var(--agtc-semantic-color-action-primary);
  border-bottom:1px solid var(--agtc-semantic-color-border-default);
  box-shadow:var(--agtc-semantic-shadow-header);
  display:flex;align-items:center;padding:0 24px;gap:20px;
}
.logo{display:flex;align-items:center;gap:9px;text-decoration:none;flex-shrink:0}
.logo-mark{height:26px;width:26px;flex-shrink:0;display:block}
.logo-name{font-size:1.05rem;font-weight:800;letter-spacing:-.02em;color:var(--agtc-semantic-color-brand-primary);line-height:1}
.logo-version{font-size:11px;color:var(--agtc-semantic-color-text-secondary);background:var(--agtc-semantic-color-background-subtle);padding:2px 8px;border-radius:20px;font-weight:500}
.top-nav{display:flex;gap:2px;margin-left:auto}
.top-nav a{
  text-decoration:none;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;
  padding:6px 12px;border-radius:var(--agtc-semantic-radius-control);font-weight:500;
  transition:background .12s,color .12s;
}
/* ── Règle système : no-visited-nav ──────────────────────────────────────
   Les éléments de navigation ne portent jamais d'état :visited distinct
   (la navigation n'est pas du contenu « lu / non lu »). La couleur visitée
   est réalignée sur l'état non-visité. Voir .claude/rules/no-visited-nav.md.
   Déclaré AVANT les règles :hover/.active — spécificité égale, le sélecteur
   plus tardif (hover/actif) gagne donc sur un lien visité ET survolé. */
.top-nav a:visited,
.sidebar a:visited,
.toc a:visited,
.nav-card:visited,
.github-btn:visited,
.storybook-btn:visited     {color:#646464;color:var(--agtc-semantic-color-text-secondary)}
.top-nav a.nav-cta:visited {color:#ffffff;color:var(--agtc-semantic-color-text-on-action)}
.footer-links a:visited    {color:rgba(255,255,255,0.75);color:var(--agtc-semantic-color-text-on-inverse-secondary)}
.audit-footer-link:visited {color:rgba(255,255,255,0.52);color:var(--agtc-semantic-color-text-on-inverse-muted)}
.top-nav a:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.top-nav a.active{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-action-primary)}
/* DÉMARRER = CTA d'adoption : rempli action-primary, prioritaire même en état actif */
.top-nav a.nav-cta,.top-nav a.nav-cta.active{background:var(--agtc-semantic-color-action-primary);color:var(--agtc-semantic-color-text-on-action);font-weight:600}
.top-nav a.nav-cta:hover,.top-nav a.nav-cta.active:hover{background:var(--agtc-semantic-color-action-primary-hover);color:var(--agtc-semantic-color-text-on-action)}
.github-btn,.storybook-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--agtc-semantic-radius-control);color:var(--agtc-semantic-color-text-secondary);text-decoration:none;transition:color .12s,background .12s;flex-shrink:0}
.github-btn:hover,.storybook-btn:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}

/* ── LAYOUT ─────────────────────────────────────────────── */
.layout{display:flex;margin-top:60px;min-height:calc(100vh - 60px)}
.sidebar{
  width:236px;flex-shrink:0;
  border-right:1px solid var(--agtc-semantic-color-border-default);
  background:var(--agtc-semantic-color-background-surface);
  position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;
  padding:20px 0;
}
.sidebar-group{margin-bottom:8px}
.sidebar-label{
  font-size:11px;font-weight:700;
  color:var(--agtc-semantic-color-text-secondary);padding:8px 20px 4px;display:block;
}
.sidebar a{
  display:block;padding:6px 20px;text-decoration:none;font-size:0.875rem;
  color:var(--agtc-semantic-color-text-secondary);border-radius:0;
  transition:background .1s,color .1s;border-left:2px solid transparent;
}
.sidebar a:hover,.sidebar a:focus-visible{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary);outline:none}
.sidebar a.active{
  background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-action-primary);
  border-left-color:var(--agtc-semantic-color-action-primary);border-left-width:3px;font-weight:600;
}
.content{flex:1;padding:52px 64px;max-width:960px}

/* ── HOME HERO ──────────────────────────────────────────── */
.home-layout{margin-top:60px}
.hero{padding:80px 72px 56px;max-width:1100px;margin:0 auto}
.hero-badge{
  display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:400;
  text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-on-action);
  background:var(--agtc-semantic-color-action-primary);padding:4px 14px;border-radius:20px;margin-bottom:24px;
}
.hero-name{font-size:4rem;font-weight:800;line-height:1;letter-spacing:-.04em;color:var(--agtc-semantic-color-brand-primary);margin-bottom:16px}
.hero h1{font-size:2.75rem;font-weight:800;line-height:1.1;letter-spacing:-.03em;margin-bottom:20px;color:var(--agtc-semantic-color-text-primary)}
.hero h1 .verb{color:var(--agtc-semantic-color-action-primary);font-style:normal}
.hero-tagline{font-size:1.25rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.6;max-width:580px;margin-bottom:40px}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}

.stat-band{
  background:var(--agtc-semantic-color-background-inverse);
  display:flex;flex-wrap:wrap;
}
.stat-item{
  flex:1;min-width:150px;padding:28px 32px;text-align:center;
  border-right:1px solid var(--agtc-semantic-color-border-on-inverse);
}
.stat-item:last-child{border-right:none}
.stat-num{font-size:2.5rem;font-weight:800;color:var(--agtc-semantic-color-action-primary);display:block;letter-spacing:-.02em}
.stat-text{font-size:0.875rem;color:var(--agtc-semantic-color-text-on-inverse-muted);margin-top:4px;display:block}

.home-section{padding:64px 72px;max-width:1100px;margin:0 auto}
.home-section h2{font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin-bottom:8px}
.home-section > p{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);margin-bottom:32px;line-height:1.7}

/* ── NAV CARDS ───────────────────────────────────────────── */
.nav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
/* Cartes-grilles : surface (fond/bordure/rayon) via le contrat du composant card
   (component.card.* — ADR-035). Layout interne et hover restent propres au site. */
.nav-card{
  background:var(--agtc-component-card-default-background);
  border:1px solid var(--agtc-component-card-default-border);
  border-radius:var(--agtc-component-card-default-radius);
  padding:24px;text-decoration:none;color:inherit;
  transition:border-color .15s,box-shadow .15s,transform .1s;display:block;
}
.nav-card:hover,.nav-card:focus-visible{border-color:var(--agtc-semantic-color-action-primary);box-shadow:var(--agtc-semantic-shadow-card-hover);transform:translateY(-1px);outline:none}
.nav-card-icon{width:32px;height:32px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:var(--agtc-semantic-color-action-primary)}.nav-card-icon svg{width:32px;height:32px}
.nav-card-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:6px}
.nav-card-desc{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.55}
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
.pipeline-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.pipeline-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:6px}
.pipeline-desc{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);line-height:1.5}
.pipeline-example{font-family:var(--agtc-font-mono);font-size:11.5px;color:var(--agtc-semantic-color-action-primary);margin-top:10px;background:var(--agtc-semantic-color-background-surface);padding:6px 10px;border-radius:4px;border:1px solid var(--agtc-semantic-color-border-default)}

/* ── ILLUSTRATIONS ───────────────────────────────────────── */
.illus-block{margin:32px 0 24px;border-radius:12px;overflow:hidden;line-height:0}
.illus-block svg{display:block;width:100%;height:auto}

/* ── DARK ILLUSTRATION SECTIONS ──────────────────────────── */
.home-section-ink{background:var(--agtc-semantic-color-illustration-ink,#211f26);overflow-x:hidden}
.home-section-ink .home-section h2{
  color:var(--agtc-semantic-color-text-on-inverse,#eff1f3);
  border-top:none;margin-top:0;padding-top:0;
}
.home-section-ink .home-section>p{color:rgba(255,255,255,0.78);color:var(--agtc-semantic-color-text-on-inverse-secondary,rgba(255,255,255,0.75))}
.home-section-ink .illus-block{border-radius:0;margin-left:-72px;margin-right:-72px;margin-top:64px;margin-bottom:0}
/* Principle cards : verre sombre sur fond ink */
.home-section-ink .principle-card{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.10)}
.home-section-ink .principle-title{color:var(--agtc-semantic-color-text-on-inverse,#eff1f3)}
.home-section-ink .principle-desc{color:rgba(255,255,255,0.75);color:var(--agtc-semantic-color-text-on-inverse-secondary,rgba(255,255,255,0.75))}

/* ── THÈME LIGHT [data-theme="light"] ────────────────────── */
/* Les sections .home-section-ink restent toujours sombres (illustration-ink).
   Seules les principle-cards s'adaptent au thème light. */
[data-theme="light"] .home-section-ink .principle-card{background:var(--agtc-component-card-default-background,#fff);border-color:var(--agtc-component-card-default-border)}
[data-theme="light"] .home-section-ink .principle-title{color:var(--agtc-semantic-color-text-primary,#1a1820)}
[data-theme="light"] .home-section-ink .principle-desc{color:var(--agtc-semantic-color-text-secondary,#646464)}

/* ── PRINCIPLE CARDS ─────────────────────────────────────── */
.principle-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin:24px 0}
.principle-card{background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:22px}
.principle-num{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-action-primary);margin-bottom:8px}
.principle-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:6px}
.principle-desc{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);line-height:1.55}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
h1:not(.hero h1){font-size:2rem;font-weight:800;line-height:1.0;letter-spacing:-.025em;margin-bottom:10px}
.page-lead{font-size:1.25rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.65;margin-bottom:48px;max-width:580px}
h2{font-size:1.25rem;font-weight:700;letter-spacing:-.015em;margin-top:56px;margin-bottom:16px;padding-top:48px;border-top:1px solid var(--agtc-semantic-color-border-default)}
h2.first{margin-top:32px;padding-top:0;border-top:none}
h3{font-size:1rem;font-weight:700;margin-top:32px;margin-bottom:12px}
p{color:var(--agtc-semantic-color-text-secondary);margin-bottom:16px;line-height:1.7}

code{font-family:var(--agtc-font-mono);font-size:.85em;background:var(--agtc-semantic-color-background-subtle);padding:2px 5px;border-radius:4px;color:var(--agtc-semantic-color-text-primary)}
pre.code-block{background:var(--agtc-component-code-block-default-background);border-radius:var(--agtc-component-code-block-default-radius);padding:var(--agtc-component-code-block-default-padding-y) var(--agtc-component-code-block-default-padding-x);overflow-x:auto;margin:18px 0;position:relative}
pre.code-block code{background:none;color:var(--agtc-component-code-block-default-text);font-family:var(--agtc-semantic-typography-mono-family);font-size:var(--agtc-component-code-block-default-font-size);padding:0;border-radius:0}
pre.code-block .code-lang{position:absolute;top:12px;left:18px;color:var(--agtc-component-code-block-default-meta-text);font-size:var(--agtc-semantic-typography-detail-size);text-transform:uppercase;letter-spacing:.06em;font-weight:600;font-family:var(--agtc-semantic-typography-mono-family)}
pre.code-block.has-lang{padding-top:38px}
.code-copy{position:absolute;top:10px;right:10px;display:inline-flex;align-items:center;gap:6px;background:var(--agtc-component-code-block-default-copy-background);color:var(--agtc-component-code-block-default-copy-text);border:none;border-radius:4px;padding:4px 10px;font-size:var(--agtc-semantic-typography-detail-size);font-family:inherit;cursor:pointer}
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
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:16px 0 28px}
table{width:100%;border-collapse:collapse;margin:0;font-size:0.875rem;table-layout:auto;min-width:420px}
th{text-align:left;padding:10px 16px;background:var(--agtc-component-table-default-header-background);color:var(--agtc-component-table-default-header-text);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--agtc-component-table-default-border);white-space:nowrap}
td{padding:12px 16px;border-bottom:1px solid var(--agtc-component-table-default-border);color:var(--agtc-component-table-default-cell-text);vertical-align:top;word-break:break-word;overflow-wrap:anywhere}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--agtc-component-table-default-row-hover)}
td code{color:var(--agtc-semantic-color-action-primary);word-break:break-all}

/* ── COLOR SYSTEM ───────────────────────────────────────── */
.semantic-colors{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:24px 0}
.color-token{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:16px;display:flex;align-items:center;gap:14px}
.color-swatch{width:44px;height:44px;display:inline-block;border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0}
.color-info{}
.color-name{font-family:var(--agtc-font-mono);font-size:12px;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:3px}
.color-value{font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary)}
.color-intent{font-size:11.5px;color:var(--agtc-semantic-color-text-secondary);margin-top:4px}

.palette-section{margin:40px 0}
.palette-scale-name{font-size:0.875rem;font-weight:700;text-transform:capitalize;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.palette-steps{display:grid;grid-template-columns:repeat(12,1fr);gap:4px}
.palette-step{height:48px;border-radius:4px;cursor:default;position:relative}
.palette-step:hover::after{content:attr(title);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--agtc-semantic-color-background-inverse-raised);color:var(--agtc-semantic-color-text-on-inverse);font-size:10px;padding:4px 8px;border-radius:4px;white-space:nowrap;z-index:10;font-family:var(--agtc-font-mono);pointer-events:none}

/* ── SPACING ────────────────────────────────────────────── */
.space-demo{display:flex;flex-direction:column;gap:6px;margin:28px 0}
.space-item{display:flex;align-items:center;gap:12px}
.space-bar{background:var(--agtc-semantic-color-viz-scale-bar);border-radius:3px;height:20px;min-width:4px;flex-shrink:0}
.space-label{font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary);min-width:72px}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
.type-specimen{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:24px;margin:12px 0}
.type-spec-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:12px}

/* ── COMPONENT DEMOS ────────────────────────────────────── */
.demo-box{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:40px;margin:24px 0}
.demo-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.demo-group{margin-bottom:28px}
.demo-group:last-child{margin-bottom:0}
.demo-group-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:12px;display:block}

.agtc-button{
  display:inline-flex;align-items:center;gap:6px;
  padding:var(--agtc-component-button-primary-padding-y) var(--agtc-component-button-primary-padding-x);
  border-radius:var(--agtc-component-button-primary-radius);
  font-size:0.875rem;font-weight:500;font-family:inherit;cursor:pointer;
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

.variant-tag{display:inline-flex;align-items:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:4px;background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-secondary)}

/* ── TOKEN EXPLORER ─────────────────────────────────────── */
.token-search-status{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);min-height:1.2em;margin:-8px 0 8px}
.explorer-search{
  width:100%;max-width:480px;padding:10px 14px;
  border:1.5px solid var(--agtc-semantic-color-border-default);
  border-radius:var(--agtc-semantic-radius-control);
  font-size:0.875rem;background:var(--agtc-semantic-color-background-surface);
  color:var(--agtc-semantic-color-text-primary);font-family:inherit;margin-bottom:20px;
}
.explorer-search:focus,.explorer-search:focus-visible{outline:none;border-color:var(--agtc-semantic-color-border-focus);box-shadow:0 0 0 3px var(--agtc-semantic-color-action-focus-ring,rgba(59,130,246,.25))}
.explorer-tabs{display:flex;gap:2px;border-bottom:2px solid var(--agtc-semantic-color-border-default);margin-bottom:20px}
.exp-tab{
  padding:8px 20px;font-size:0.875rem;font-weight:600;color:var(--agtc-semantic-color-text-secondary);
  border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;
  margin-bottom:-2px;font-family:inherit;transition:color .1s;
}
.exp-tab.active{color:var(--agtc-semantic-color-action-primary);border-bottom-color:var(--agtc-semantic-color-action-primary)}
.exp-tab:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px;border-radius:4px}
.exp-panel{display:none}
.exp-panel.active{display:block}
.token-row td:first-child code{color:var(--agtc-semantic-color-action-primary)}
.token-table{table-layout:fixed}
.token-table td{overflow-wrap:break-word;word-break:break-word}
/* En-têtes : jamais de coupure au milieu d'un mot — retour à la ligne aux espaces seulement */
.token-table th{overflow-wrap:normal;word-break:normal;hyphens:none}

/* ── UTILITY CLASSES ─────────────────────────────────────── */
.mono-sm{font-family:var(--agtc-font-mono);font-size:12px}
.demo-col{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.prop-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px;color:var(--agtc-semantic-color-text-secondary)}

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
.agtc-segmented button[aria-current="true"]{background:var(--agtc-component-segmented-default-selected-background);color:var(--agtc-component-segmented-default-selected-text);font-weight:700}
.agtc-segmented button:focus-visible{outline:2px solid var(--agtc-component-segmented-default-border-focus);outline-offset:2px}

/* ── DECISIONS ──────────────────────────────────────────── */
.adr-num{font-family:var(--agtc-font-mono);font-size:12px;color:var(--agtc-semantic-color-text-secondary)}
.adr-title a{color:var(--agtc-semantic-color-action-primary);text-decoration:none;font-weight:600}
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
.adr-meta{background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-card);padding:16px 20px;margin-bottom:36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px 24px;font-size:0.875rem}
.adr-meta-item{display:flex;flex-direction:column;gap:2px}
.adr-meta-item strong{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--agtc-semantic-color-text-secondary)}

/* ── AGENTS ──────────────────────────────────────────────── */
.agent-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.agent-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.agent-type{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.agent-name{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.agent-desc{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);line-height:1.5}
.rules-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
.rule-can,.rule-cannot{padding:20px;border-radius:var(--agtc-semantic-radius-card);border:1px solid}
.rule-can{background:var(--agtc-semantic-color-feedback-success-subtle);border-color:var(--agtc-semantic-color-feedback-success-border)}
.rule-cannot{background:var(--agtc-semantic-color-feedback-danger-subtle);border-color:var(--agtc-semantic-color-feedback-danger-border)}
.rule-can h3{color:var(--agtc-semantic-color-feedback-success);margin-top:0;font-size:0.875rem}
.rule-cannot h3{color:var(--agtc-semantic-color-feedback-danger);margin-top:0;font-size:0.875rem}
.rule-can li{color:var(--agtc-semantic-color-feedback-success);font-size:0.875rem}
.rule-cannot li{color:var(--agtc-semantic-color-feedback-danger);font-size:0.875rem}

/* ── SIDEBAR DRAWER (mobile) ─────────────────────────────── */
.sidebar-toggle{display:none;align-items:center;gap:6px;background:var(--agtc-semantic-color-background-subtle);border:1px solid var(--agtc-semantic-color-border-default);cursor:pointer;padding:6px 12px;color:var(--agtc-semantic-color-text-secondary);border-radius:var(--agtc-semantic-radius-control);font-size:0.8125rem;font-weight:500;font-family:inherit;margin-bottom:20px}
.sidebar-toggle-label{font-size:0.8125rem}
.sidebar-toggle:hover,.sidebar-toggle:focus-visible{background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-primary);border-color:var(--agtc-semantic-color-border-focus);outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.sidebar-overlay{display:none;position:fixed;inset:0;top:60px;background:rgba(0,0,0,.40);z-index:89;backdrop-filter:blur(2px)}
.sidebar-overlay.active{display:block}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media(max-width:768px){
  .layout{flex-direction:column}
  .sidebar{
    position:fixed;top:60px;left:0;bottom:0;z-index:90;
    width:280px;max-width:85vw;
    transform:translateX(-100%);
    transition:transform .28s cubic-bezier(.4,0,.2,1);
    border-right:1px solid var(--agtc-semantic-color-border-default);
    box-shadow:var(--agtc-semantic-shadow-raised);
    overflow-y:auto;
    height:calc(100vh - 60px);
  }
  .sidebar.open{transform:translateX(0)}
  .sidebar-toggle{display:flex}
  .content{padding:28px 20px}
  .hero{padding:40px 20px 32px}
  .hero h1{font-size:2rem}
  .home-section{padding:40px 20px}
  .home-section-ink .illus-block{margin-left:-20px;margin-right:-20px;margin-top:64px;margin-bottom:0}
  .pipeline{flex-direction:column}
  .pipeline-step+.pipeline-step{border-left:none;border-top:1px solid var(--agtc-semantic-color-border-default)}
  .rules-split{grid-template-columns:1fr}
  .top-nav{display:none}
  .site-header{padding:0 12px;gap:8px;overflow:hidden}
  .logo-version{display:none}
  .storybook-btn{display:none}
  .github-btn{display:none}
  .lang-switch{margin-left:auto !important}
  .menu-toggle{flex-shrink:0}
}

/* ── ACCESSIBILITY ───────────────────────────────────────── */
*:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
/* Liens de contenu : consomment le contrat du composant link (component.link.* — ADR-043). */
a{color:var(--agtc-component-link-default-text)}
a:hover{color:var(--agtc-component-link-default-text-hover)}
.skip-link{position:absolute;top:-40px;left:8px;background:var(--agtc-semantic-color-action-primary);color:var(--agtc-semantic-color-text-on-action);padding:8px 16px;border-radius:4px;font-size:0.875rem;font-weight:600;text-decoration:none;z-index:1000}
.skip-link:focus{top:8px}

/* ── LANG TOGGLE (consomme .agtc-segmented — ADR-044, dogfooding cat. A) ──── */
/* Override compact pour le header (le composant n'a pas encore de taille sm). */
.lang-switch button{padding:3px 9px;font-size:11.5px;letter-spacing:.04em}
html[data-lang="fr"] .lang-en{display:none}
html[data-lang="en"] .lang-fr{display:none}

/* ── MOBILE MENU ─────────────────────────────────────────── */
.menu-toggle{display:none;background:none;border:none;cursor:pointer;padding:4px;color:var(--agtc-semantic-color-text-primary);border-radius:4px}
.menu-toggle:hover,.menu-toggle:focus-visible{background:var(--agtc-semantic-color-background-subtle);outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}

/* ── TOC ─────────────────────────────────────────────────── */
.toc{width:208px;flex-shrink:0;padding:20px 16px;position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;border-left:1px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-surface)}
.toc:empty{display:none;width:0;padding:0;border:none}
.toc-title{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:10px;display:block}
.toc a{display:block;font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);text-decoration:none;padding:4px 0 4px 10px;border-left:2px solid transparent;margin-left:-2px;line-height:1.4;transition:color .1s,border-color .1s}
.toc a:hover,.toc a.active,.toc a:focus-visible{color:var(--agtc-semantic-color-action-primary);border-left-color:var(--agtc-semantic-color-action-primary);outline:none}
.toc a:focus-visible{box-shadow:0 0 0 2px var(--agtc-semantic-color-border-focus)}

/* ── DO / DON'T ──────────────────────────────────────────── */
.dos-donts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.do-section,.dont-section{padding:20px;border-radius:var(--agtc-semantic-radius-card);border:1px solid}
.do-section{background:var(--agtc-semantic-color-feedback-success-subtle);border-color:var(--agtc-semantic-color-feedback-success-border)}
.dont-section{background:var(--agtc-semantic-color-feedback-danger-subtle);border-color:var(--agtc-semantic-color-feedback-danger-border)}
.do-section h3{color:var(--agtc-semantic-color-feedback-success);margin-top:0;font-size:0.875rem}
.dont-section h3{color:var(--agtc-semantic-color-feedback-danger);margin-top:0;font-size:0.875rem}
.do-section li{color:var(--agtc-semantic-color-feedback-success);font-size:0.875rem}
.dont-section li{color:var(--agtc-semantic-color-feedback-danger);font-size:0.875rem}

/* ── TOKEN TILES ─────────────────────────────────────────── */
.token-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
.token-tile{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:24px;text-align:center}
.token-tile-count{font-size:2.5rem;font-weight:800;color:var(--agtc-semantic-color-action-primary);letter-spacing:-.02em;display:block}
.token-tile-label{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);margin-top:6px;display:block}

/* ── FOOTER ──────────────────────────────────────────────── */
.site-footer{background:var(--agtc-semantic-color-background-inverse);color:var(--agtc-semantic-color-text-on-inverse-muted);padding:40px 32px;font-size:0.875rem;margin-top:auto}
.footer-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;align-items:start}
.footer-col{display:flex;flex-direction:column;gap:10px}
.footer-col-right{align-items:flex-end;text-align:right}
.footer-logo{display:inline-flex;align-items:center;gap:8px;text-decoration:none;margin-bottom:4px}
.footer-logo-name{font-size:1rem;font-weight:700;color:var(--agtc-semantic-color-text-on-inverse)}
.footer-name{font-size:0.8125rem;color:var(--agtc-semantic-color-text-on-inverse-secondary)}
.footer-copy{color:var(--agtc-semantic-color-text-on-inverse-muted);font-size:0.8125rem}
.footer-links{display:flex;flex-direction:column;gap:8px}
.footer-links a,.footer-link{color:var(--agtc-semantic-color-text-on-inverse-secondary);text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:color .12s;font-size:0.8125rem}
.footer-links a:hover,.footer-link:hover{color:var(--agtc-semantic-color-text-on-inverse)}
.footer-credit{font-size:0.75rem;color:var(--agtc-semantic-color-text-on-inverse-muted);display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}

/* ── INFO CARDS ──────────────────────────────────────────── */
.info-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.info-card-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:8px}

/* ── AUDIT PAGE ──────────────────────────────────────────── */
.audit-hero{text-align:center;padding:48px 0 32px;border-bottom:1px solid var(--agtc-semantic-color-border-default);margin-bottom:40px}
.audit-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;font-weight:700;font-size:1rem;margin-bottom:16px}
.audit-badge.pass{background:var(--agtc-semantic-color-feedback-success-subtle);color:var(--agtc-semantic-color-feedback-success)}
.audit-badge.fail{background:var(--agtc-semantic-color-feedback-danger-subtle);color:var(--agtc-semantic-color-feedback-danger)}
.audit-meta{color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;margin-bottom:6px}
.audit-date{color:var(--agtc-semantic-color-text-secondary);font-size:0.8rem}
.audit-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:48px}
.audit-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px;text-align:center}
.audit-card--pass{border-color:var(--agtc-semantic-color-feedback-success-border)}
.audit-card--warn{border-color:var(--agtc-semantic-color-feedback-warning-border)}
.audit-card--fail{border-color:var(--agtc-semantic-color-feedback-danger-border)}
.audit-number{display:block;font-size:2rem;font-weight:800;letter-spacing:-.03em;line-height:1;margin-bottom:6px}
.audit-card--pass .audit-number{color:var(--agtc-semantic-color-feedback-success)}
.audit-card--warn .audit-number{color:var(--agtc-semantic-color-feedback-warning)}
.audit-card--fail .audit-number{color:var(--agtc-semantic-color-feedback-danger)}
.audit-section{margin-bottom:48px}
.audit-section h2{font-size:1.1rem;font-weight:700;margin:0 0 16px;padding-bottom:8px;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
.audit-contrast-table{width:100%;border-collapse:collapse;font-size:0.85rem}
.audit-contrast-table th{text-align:left;padding:8px 10px;background:var(--agtc-semantic-color-background-subtle);border-bottom:2px solid var(--agtc-semantic-color-border-default);font-weight:600;font-size:0.8rem;text-transform:uppercase;letter-spacing:.04em}
.audit-contrast-table td{padding:8px 10px;border-bottom:1px solid var(--agtc-semantic-color-border-default);vertical-align:middle}
.audit-contrast-table tr:last-child td{border-bottom:none}
.audit-contrast-pass{color:var(--agtc-semantic-color-feedback-success);font-weight:600}
.audit-contrast-fail{color:var(--agtc-semantic-color-feedback-danger);font-weight:600}
.audit-swatch{width:14px;height:14px;border-radius:3px;display:inline-block;vertical-align:middle;border:1px solid var(--agtc-semantic-color-border-swatch);margin-right:4px}
.audit-manual-list{list-style:none;padding:0;margin:0}
.audit-manual-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
.audit-manual-item:last-child{border-bottom:none}
.audit-manual-crit{font-size:0.75rem;font-weight:700;color:var(--agtc-semantic-color-text-secondary);font-family:var(--agtc-semantic-typography-mono-family,monospace);flex-shrink:0;width:52px;padding-top:1px}
.audit-manual-body strong{display:block;font-size:0.875rem;margin-bottom:3px}
.audit-manual-body span{font-size:0.8rem;color:var(--agtc-semantic-color-text-secondary)}
.audit-method{background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-card);padding:20px 24px;font-size:0.825rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.6}
.audit-footer-link{color:var(--agtc-semantic-color-text-on-inverse-muted);text-decoration:none;font-size:0.75rem;display:inline-flex;align-items:center;gap:4px;transition:color .12s}
.audit-footer-link:hover{color:var(--agtc-semantic-color-text-on-inverse-secondary)}
@media(max-width:640px){.audit-cards{grid-template-columns:1fr 1fr}}
.info-card-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:4px}
.info-card-body{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary)}
/* ── INFOBOX (callout informationnel de doc — consomme feedback.info-*) ───── */
.infobox{display:flex;gap:12px;align-items:flex-start;padding:16px 20px;margin:24px 0;border-radius:var(--agtc-semantic-radius-card);background:var(--agtc-semantic-color-feedback-info-subtle);border:1px solid var(--agtc-semantic-color-feedback-info-border)}
.infobox-icon{color:var(--agtc-semantic-color-feedback-info);flex-shrink:0;line-height:0;margin-top:1px}
.infobox-body{font-size:0.875rem;line-height:1.6;color:var(--agtc-semantic-color-text-primary)}
.infobox-body a{color:var(--agtc-semantic-color-text-primary);text-decoration:underline;font-weight:600}

/* ── TOOL CARDS ──────────────────────────────────────────── */
.tool-card{background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:16px;display:flex;gap:12px;align-items:flex-start}
.tool-card-icon{color:var(--agtc-semantic-color-action-primary);flex-shrink:0;margin-top:2px}
.tool-card-name{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary)}
.tool-card-role{font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);font-weight:400}
.tool-card-desc{font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin-top:3px}

/* ── STANDARDS BAND ──────────────────────────────────────── */
.standards-band{display:flex;gap:20px;align-items:center;background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:24px}
.standards-logo{flex-shrink:0;display:flex;color:var(--agtc-semantic-color-text-primary);text-decoration:none}
.standards-logo svg{display:block;height:56px;width:56px}
.standards-title{font-size:0.95rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:4px}
.standards-band p{margin:0;font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary)}
@media (max-width:560px){.standards-band{flex-direction:column;align-items:flex-start}}

/* ── VENDOR LOGOS (frameworks / plateformes / outils) ────── */
.vendor-logo{height:20px;width:20px;flex-shrink:0;display:inline-block;vertical-align:middle;object-fit:contain}
.platform-cell{display:flex;align-items:center;gap:8px}
.tool-card-icon .vendor-logo{height:22px;width:22px}

/* ── STEP CARDS ──────────────────────────────────────────── */
.step-card{background:var(--agtc-component-card-default-background);border:1px solid var(--agtc-component-card-default-border);border-radius:var(--agtc-component-card-default-radius);padding:16px}
.step-card-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.step-card-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:4px}
.step-card-body{font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary)}

/* ── DENSITY CARDS ───────────────────────────────────────── */
.density-grid{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px}
.density-card{flex:1;min-width:140px;padding:16px;background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-default)}
.density-card.active{border-width:2px;border-color:var(--agtc-semantic-color-action-primary)}
.density-card-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.density-card-label.active{color:var(--agtc-semantic-color-action-primary)}
.density-card-desc{font-size:0.875rem;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.density-card-formula{display:flex;gap:6px;align-items:center}
.density-card-bar{height:24px;background:var(--agtc-semantic-color-action-primary);border-radius:2px}
.density-card-math{font-size:0.75rem;font-family:var(--agtc-font-mono);color:var(--agtc-semantic-color-text-secondary)}

/* ── LINEHEIGHT DEMO CARDS ───────────────────────────────── */
.lh-demo-grid{display:flex;gap:24px;flex-wrap:wrap}
.lh-demo-card{flex:1;min-width:160px;padding:16px;background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-control);border:1px solid var(--agtc-semantic-color-border-default)}
.lh-demo-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:8px}

/* ── GENERIC GRIDS ───────────────────────────────────────── */
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
.grid-auto-220{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:24px}

/* ── BANNER responsive (le contribution-banner consomme .agtc-banner — ADR-042) ── */
@media(max-width:768px){.agtc-banner{flex-wrap:wrap}}

/* ── AUDIENCE CARDS ──────────────────────────────────────── */
.audience-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:28px 0}
.audience-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.audience-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:10px}
.audience-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:4px}
.audience-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.audience-desc{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);line-height:1.55}

/* ── KPI BAND ────────────────────────────────────────────── */
.kpi-band{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:28px 0}
.kpi-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px 22px}
.kpi-num{font-size:2rem;font-weight:800;color:var(--agtc-semantic-color-action-primary);letter-spacing:-.02em;display:block;margin-bottom:4px}
.kpi-label{font-size:0.875rem;color:var(--agtc-semantic-color-text-primary);font-weight:600;margin-bottom:6px;display:block}
.kpi-source{font-size:11px;color:var(--agtc-semantic-color-text-secondary)}
.kpi-source a{color:var(--agtc-semantic-color-action-primary);font-size:11px}

/* ── TECH STACK PIPELINE ─────────────────────────────────── */
.stack-flow{display:flex;align-items:stretch;gap:0;margin:28px 0;overflow-x:auto;border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);overflow:hidden}
.stack-node{flex:1;min-width:100px;padding:18px 14px;background:var(--agtc-semantic-color-background-surface);text-align:center;border-right:1px solid var(--agtc-semantic-color-border-default);position:relative}
.stack-node:last-child{border-right:none;background:var(--agtc-semantic-color-background-subtle)}
.stack-node-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:8px;display:flex;justify-content:center}
.stack-node-label{font-size:11.5px;font-weight:700;color:var(--agtc-semantic-color-text-primary)}
.stack-node-sub{font-size:10.5px;color:var(--agtc-semantic-color-text-secondary);margin-top:3px}

/* ── RESPONSIVE (additions) ──────────────────────────────── */
@media(max-width:1200px){.toc{display:none}}
.changelog-entry{border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:28px 32px;margin-bottom:32px}
.changelog-header{display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap}
.changelog-version{font-size:1.25rem;font-weight:800;color:var(--agtc-semantic-color-text-primary);letter-spacing:-.02em}
.changelog-date{font-size:0.8125rem;color:var(--agtc-semantic-color-text-secondary)}
.changelog-badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:var(--agtc-semantic-color-feedback-warning-subtle,#fff3cd);color:var(--agtc-semantic-color-feedback-warning,#b45309)}
.changelog-entry h2{margin-top:24px;padding-top:20px;font-size:1rem}
.changelog-entry h2.first{margin-top:8px;padding-top:0;border-top:none}
.back-to-top{position:fixed;bottom:24px;right:24px;z-index:200;display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-text-secondary);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-control);font-size:12.5px;font-weight:500;cursor:pointer;box-shadow:var(--agtc-semantic-shadow-raised);transition:opacity .2s,transform .2s;opacity:0;transform:translateY(8px);pointer-events:none}
.back-to-top:not([hidden]){opacity:1;transform:translateY(0);pointer-events:auto}
.back-to-top:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary);border-color:var(--agtc-semantic-color-border-focus)}
.back-to-top:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
@media(max-width:768px){.back-to-top{bottom:16px;right:16px;padding:8px 12px}}
@media(max-width:768px){
  .menu-toggle{display:flex;align-items:center}
  .top-nav{display:none;position:fixed;top:60px;left:0;right:0;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);flex-direction:column;padding:8px 0;z-index:99;box-shadow:var(--agtc-semantic-shadow-raised)}
  .top-nav.open{display:flex}
  .top-nav a{padding:12px 24px;border-radius:0;font-size:0.875rem}
  .dos-donts{grid-template-columns:1fr}
  .token-tiles{grid-template-columns:1fr}
  .agent-grid{grid-template-columns:1fr}
  .stack-flow{flex-direction:column}
  .stack-node{border-right:none;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
  .footer-inner{grid-template-columns:1fr;gap:20px}
  .footer-col-right{align-items:flex-start;text-align:left}
}
`; }

function siteJS() { return `
document.addEventListener('DOMContentLoaded', () => {

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

  // ── Mobile menu (top-nav) ────────────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const topNav = document.querySelector('.top-nav');
  if (menuToggle && topNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = topNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
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

  // ── Active nav links ─────────────────────────────────────
  const p = window.location.pathname;
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    // Strip leading ../ to get the logical path segments
    const parts = h.split('/').filter(s => s !== '..' && s !== '.');
    const hFile = parts[parts.length - 1] || '';          // e.g. 'color.html'
    const hDir  = parts.length > 1 ? parts[parts.length - 2] : ''; // e.g. 'foundations'
    let active = false;
    if (hDir) {
      // Section link (foundations/color.html, components/index.html, …)
      // Active on any page within that section directory
      active = p.includes('/' + hDir + '/');
    } else if (hFile === 'index.html') {
      // Accueil — only on the root homepage
      active = p === '/' || p.endsWith('/index.html') && !p.includes('/foundations/') && !p.includes('/components/') && !p.includes('/tokens/') && !p.includes('/decisions/') && !p.includes('/agents/');
    } else {
      // Top-level page like get-started.html
      active = p.endsWith('/' + hFile);
    }
    if (active) a.classList.add('active');
  });
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith(a.getAttribute('href')?.split('/').pop() || '')) a.classList.add('active');
  });

  // ── Animated counters ────────────────────────────────────
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    (function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (t < 1) requestAnimationFrame(update);
    })(performance.now());
  }
  const statBand = document.querySelector('.stat-band');
  if (statBand) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statBand.querySelectorAll('.stat-num[data-count]').forEach(el => {
          animateCounter(el, parseInt(el.dataset.count), 1400);
        });
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(statBand);
  }

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

  // ── Bouton retour en haut ────────────────────────────────
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const threshold = document.documentElement.scrollHeight * 0.25;
    const onScroll = () => {
      const visible = window.scrollY > threshold;
      backToTop.hidden = !visible;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
`; }

// ─── HTML LAYOUT ───────────────────────────────────────────────────────────
// Storybook publié par Chromatic (branche main, toujours la dernière baseline).
// appId = 6a1c1e665ec5fe8fc0540983 ; permalien stable vérifié (HTTP 200).
const STORYBOOK_URL = 'https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/';

function layout({ title, pageTitle, depth = 0, section = '', sidebar = null, body, fullWidth = false }) {
  const docTitle = pageTitle || `${title} — Agentica`;
  const base = depth > 0 ? '../' : '';
  // DÉMARRER en tête + traité comme CTA (cta:true) — action primaire d'adoption,
  // cohérente avec le hero d'accueil et la page get-started.
  const navLinks = [
    { href: `${base}index.html`,            labelFr: 'Accueil',     labelEn: 'Home' },
    { href: `${base}foundations/index.html`,labelFr: 'Fondations',  labelEn: 'Foundations' },
    { href: `${base}components/index.html`, labelFr: 'Composants',  labelEn: 'Components' },
    { href: `${base}tokens/index.html`,     labelFr: 'Tokens',      labelEn: 'Tokens' },
    { href: `${base}decisions/index.html`,  labelFr: 'Décisions',   labelEn: 'Decisions' },
    { href: `${base}agents/index.html`,     labelFr: 'Agents',      labelEn: 'Agents' },
    { href: `${base}get-started.html`,      labelFr: 'Démarrer',    labelEn: 'Get started', cta: true },
  ];
  const nav = navLinks.map(n =>
    `<a href="${n.href}"${n.cta ? ' class="nav-cta"' : ''}><span class="lang-fr">${n.labelFr}</span><span class="lang-en">${n.labelEn}</span></a>`
  ).join('');

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
<html lang="fr" data-lang="fr">
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
<meta property="og:image" content="https://designsystem.gnegreiros.com/social.jpg">
<meta property="og:image:width" content="1076">
<meta property="og:image:height" content="681">
<meta property="og:url" content="https://designsystem.gnegreiros.com/">
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="designsystem.gnegreiros.com">
<meta property="twitter:url" content="https://designsystem.gnegreiros.com/">
<meta name="twitter:title" content="${docTitle}">
<meta name="twitter:description" content="Agentica — système de design conçu pour les humains qui décident et les agents IA qui exécutent. Tokens, composants, gouvernance et WCAG 2.1.">
<meta name="twitter:image" content="https://designsystem.gnegreiros.com/social.jpg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="${base}tokens.css">
<link rel="stylesheet" href="${base}site.css">
</head>
<body>
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
  <span class="logo-version">v0.1.0</span>
  <nav class="top-nav" aria-label="Navigation principale">${nav}</nav>
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
  <button class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="main-nav">
    ${icon('menu', 22)}
  </button>
</header>
${sidebar ? `<div class="sidebar-overlay" aria-hidden="true"></div>` : ''}
<div class="${mainClass}" id="main-content">
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
</html>`.replace(/(?<!table-wrap">)<table(\b[^>]*)>/g, '<div class="table-wrap"><table$1>').replace(/<\/table>(?!\s*<\/div>)/g, '</table></div>');
}

function sidebarFoundations(base, current) {
  const links = [
    ['index.html',      '<span class="lang-fr">Vue d\'ensemble</span><span class="lang-en">Overview</span>'],
    ['color.html',      '<span class="lang-fr">Couleur</span><span class="lang-en">Color</span>'],
    ['spacing.html',    '<span class="lang-fr">Espacement</span><span class="lang-en">Spacing</span>'],
    ['typography.html', '<span class="lang-fr">Typographie</span><span class="lang-en">Typography</span>'],
    ['icons.html',      '<span class="lang-fr">Icônes</span><span class="lang-en">Icons</span>'],
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
  // Dogfooding (cat. A) : consomme la classe .agtc-banner (ADR-042) + .agtc-link (ADR-043).
  return `
<div class="agtc-banner brand" style="margin-top:56px">
  <span class="banner-icon">${icon('github', 22)}</span>
  <div class="banner-content">
    <strong><span class="lang-fr">Contribuer à ce projet</span><span class="lang-en">Contribute to this project</span></strong>
    <span><span class="lang-fr">Ce système est ouvert aux contributions — tokens, composants, décisions architecturales, corrections d'accessibilité ou documentation. Toute amélioration est bienvenue.</span><span class="lang-en">This system welcomes contributions — tokens, components, architectural decisions, accessibility fixes, or documentation. Every improvement counts.</span></span>
  </div>
  <a class="agtc-link" href="https://github.com/gnegreiros-ux/agentic-design-system" target="_blank" rel="noopener noreferrer" style="white-space:nowrap;flex-shrink:0;align-self:center">
    <span class="lang-fr">Voir sur GitHub →</span><span class="lang-en">View on GitHub →</span><span class="visually-hidden"> (ouvre dans un nouvel onglet)</span>
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
  const colorCount = Object.keys(COLOR_SCALES).length;
  const scaleSteps = Object.values(COLOR_SCALES).reduce((a, s) => a + Object.keys(s).length, 0);
  const semCount   = Object.keys(SEM).length;
  const compCount  = Object.keys(COMP).length;
  const primCount  = countAllTokens(primitives.primitive || primitives);
  const totalTokens = primCount + semCount + compCount;

  const svgPipeline   = read(path.join(ROOT, 'illustrations/pipeline-tokens.svg'));
  const svgGovernance = read(path.join(ROOT, 'illustrations/human-last-word.svg'));
  const svgMultiPlat  = read(path.join(ROOT, 'illustrations/multi-platform.svg'));

  const principles = [
    [icon('shield',24),'Souveraineté numérique','Les données, décisions et outils restent sous contrôle organisationnel.','Digital sovereignty','Data, decisions and tools remain under organizational control.'],
    [icon('accessibility',24),'Accessibilité première','WCAG 2.1 AA minimum. Non contournable, non négociable.','Accessibility first','WCAG 2.1 AA minimum. Non-negotiable.'],
    [icon('git-branch',24),'Auditabilité totale','Toute décision est traçable, versionnée, justifiée.','Full auditability','Every decision is traceable, versioned, and justified.'],
    [icon('user-check',24),'Le dernier mot est humain','Les agents proposent. Les humains décident. Toujours.','Humans decide','Agents propose. Humans decide. Always.'],
  ];

  const sections = [
    ['foundations/color.html',  icon('palette',32),          'Fondations',           'Foundations',           'Couleur, espacement, typographie — les primitives et leurs intentions sémantiques.','Color, spacing, typography — primitives and their semantic intentions.'],
    ['components/index.html',   icon('puzzle',32),            'Composants',           'Components',            'Contrats UI exécutables : variantes, états, tokens, accessibilité, code.','Executable UI contracts: variants, states, tokens, accessibility, code.'],
    ['tokens/index.html',       icon('zap',32),               'Tokens',               'Tokens',                'Naviguez dans les 3 niveaux : primitif → sémantique → composant.','Navigate the 3 levels: primitive → semantic → component.'],
    ['decisions/index.html',    icon('clipboard-list',32),    'Décisions (ADRs)',      'Decisions (ADRs)',       `Pourquoi chaque décision existe — ${adrs.length} ADRs actifs avec contexte et alternatives.`,`Why each decision was made — ${adrs.length} active ADRs with context and alternatives.`],
    ['agents/index.html',       icon('bot',32),               'Pour les agents IA',   'For AI agents',         'Règles, routage et contraintes pour les agents qui travaillent avec ce système.','Rules, routing and constraints for agents working with this system.'],
    ['https://github.com/gnegreiros-ux/agentic-design-system', icon('github',32), 'Code source', 'Source code', 'Tokens JSON, scripts d\'audit, configuration Style Dictionary.','JSON tokens, audit scripts, Style Dictionary configuration.'],
  ];

  const stackNodes = [
    [icon('file-text',20),   'Décision',       'Decision',       'ADRs'],
    [icon('book-open',20),   'Documentation',  'Documentation',  'Guidelines'],
    [icon('pen-tool',20),    'Design',         'Design',         'Figma'],
    [icon('code-2',20),      'Code',           'Code',           'Web Components'],
    [icon('book-open',20),   'Storybook',      'Storybook',      'Chromatic'],
    [icon('check-circle',20),'Validation',     'Validation',     'axe-core'],
    [icon('shield-check',20),'Audit visuel',   'Visual audit',   'Chromatic'],
    [icon('rocket',20),      'Déploiement',    'Deploy',         'CI/CD'],
  ];

  const audiences = [
    [icon('briefcase',22),'Gestionnaires','Managers','Livraisons 2× plus rapides, moins de régressions visuelles, gouvernance documentée et traçable.','2× faster delivery, fewer visual regressions, documented and traceable governance.'],
    [icon('pen-tool',22),'Designers','Designers','Tokens Figma synchronisés, marque appliquée automatiquement, cohérence garantie à chaque mise à jour.','Synced Figma tokens, auto-applied brand guidelines, consistency guaranteed on every update.'],
    [icon('code-2',22),'Développeurs','Developers','Web Components framework-agnostic, variables CSS générées, zéro valeur en dur, audit accessibilité intégré.','Framework-agnostic Web Components, generated CSS variables, zero hardcoded values, built-in accessibility audit.'],
    [icon('clipboard-list',22),'Product Owners','Product Owners','Décisions architecturales traçables, conformité WCAG AA garantie, pipeline qualité automatisé.','Traceable architecture decisions, guaranteed WCAG AA compliance, automated quality pipeline.'],
  ];

  const kpis = [
    ['2×','Livraisons plus rapides','Faster delivery','Les équipes avec un design system mature livrent jusqu\'à 2× plus fréquemment — Sparkbox Design Systems Survey 2024','Teams with a mature design system ship up to 2× more frequently — Sparkbox Design Systems Survey 2024','https://sparkbox.com/foundry/2024_design_systems_survey','Sparkbox, 2024'],
    ['80%','Moins de violations a11y','Fewer a11y violations','Réduction des violations d\'accessibilité grâce aux composants WCAG AA natifs — IBM Carbon Case Study','Reduction in accessibility violations through native WCAG AA components — IBM Carbon Case Study','https://carbondesignsystem.com','IBM Carbon'],
    ['34%','Délais respectés','Deadlines met','Les équipes utilisant un design system respectent davantage leurs délais de livraison — Sparkbox DSS 2024','Teams using a design system are more likely to meet delivery deadlines — Sparkbox DSS 2024','https://sparkbox.com/foundry/2024_design_systems_survey','Sparkbox, 2024'],
    ['3 niveaux','Architecture token','Token architecture','Primitif → Sémantique → Composant : une architecture qui sépare les valeurs des intentions — compréhensible par les humains ET les agents IA.','Primitive → Semantic → Component: an architecture separating values from intentions — understandable by humans AND AI agents.','',''],
  ];

  const body = `
<div class="hero">
  <div class="hero-badge">v0.1.0</div>
  <p class="hero-name">Agentica</p>
  <h1>
    <span class="lang-fr">Les humains <em class="verb">décident</em><br><span>Les agents <em class="verb">exécutent</em><br>Le système <em class="verb">garantit</em></span></span>
    <span class="lang-en">Humans <em class="verb">decide</em><br><span>Agents <em class="verb">execute</em><br>The system <em class="verb">ensures</em></span></span>
  </h1>
  <p class="hero-tagline">
    <span class="lang-fr">Agentica transforme votre système de design en infrastructure opérationnelle. Les décisions sont encodées, les dérives détectées automatiquement, la documentation se maintient elle-même. Stack agnostique, souverain, auditable.</span>
    <span class="lang-en">Agentica turns your design system into operational infrastructure. Decisions are encoded, drift is detected automatically, documentation maintains itself. Stack agnostic, sovereign, auditable.</span>
  </p>
  <div class="hero-actions">
    <a href="get-started.html" class="agtc-button primary">
      <span class="lang-fr">Démarrer</span>
      <span class="lang-en">Get started</span>
    </a>
    <a href="components/index.html" class="agtc-button secondary">
      <span class="lang-fr">Voir les composants</span>
      <span class="lang-en">View components</span>
    </a>
    <a href="agents/index.html" class="agtc-button ghost">
      <span class="lang-fr">Documentation agents →</span>
      <span class="lang-en">Agent documentation →</span>
    </a>
  </div>
</div>

<div class="home-section">
  <h2 class="first">
    <span class="lang-fr">Pour chaque membre de l'équipe</span>
    <span class="lang-en">For every team member</span>
  </h2>
  <p>
    <span class="lang-fr">Un système de design unifié parle à tous — gestionnaires, designers, développeurs et POs — avec une valeur concrète pour chacun.</span>
    <span class="lang-en">A unified design system speaks to everyone — managers, designers, developers, and POs — with concrete value for each.</span>
  </p>
  <div class="audience-grid">
    ${audiences.map(([ico,fr,en,dFr,dEn]) => `
    <div class="audience-card">
      <div class="audience-icon">${ico}</div>
      <div class="audience-title"><span class="lang-fr">${fr}</span><span class="lang-en">${en}</span></div>
      <div class="audience-desc"><span class="lang-fr">${dFr}</span><span class="lang-en">${dEn}</span></div>
    </div>`).join('')}
  </div>
</div>

<div class="home-section" style="padding-top:0">
  <h2>
    <span class="lang-fr">Preuves & chiffres</span>
    <span class="lang-en">Evidence & numbers</span>
  </h2>
  <p>
    <span class="lang-fr">Les bénéfices des systèmes de design sont mesurables. Sources publiques et vérifiables.</span>
    <span class="lang-en">The benefits of design systems are measurable. Public and verifiable sources.</span>
  </p>
  <div class="kpi-band">
    ${kpis.map(([num,fr,en,dFr,dEn,url,src]) => `
    <div class="kpi-card">
      <span class="kpi-num">${num}</span>
      <span class="kpi-label"><span class="lang-fr">${fr}</span><span class="lang-en">${en}</span></span>
      <span class="kpi-source"><span class="lang-fr">${dFr}</span><span class="lang-en">${dEn}</span>${url ? ` <a href="${url}" target="_blank" rel="noopener">(${src})</a>` : ''}</span>
    </div>`).join('')}
  </div>
</div>

<div class="home-section">
  <h2>
    <span class="lang-fr">Standards ouverts</span>
    <span class="lang-en">Open standards</span>
  </h2>
  <div class="standards-band">
    <a class="standards-logo" href="https://www.designtokens.org/" target="_blank" rel="noopener noreferrer" aria-label="Design Tokens Community Group (W3C) — designtokens.org">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><title>DTCG</title><path fill="currentColor" d="M16.1318 0.308289C16.4297 0.327953 16.7242 0.414945 16.9922 0.568054L28.9922 7.4245C29.6152 7.78062 30 8.44422 30 9.1618V22.8395C29.9998 23.557 29.6151 24.2209 28.9922 24.5768L16.9922 31.4333C16.8359 31.5226 16.6698 31.5866 16.5 31.6306V31.6325C16.4458 31.6465 16.3909 31.6563 16.3359 31.6657C16.317 31.6689 16.2983 31.6728 16.2793 31.6755C16.2183 31.6841 16.1571 31.6891 16.0957 31.6921C16.0739 31.6931 16.0521 31.6947 16.0303 31.695C15.9703 31.6959 15.9104 31.6936 15.8506 31.6891C15.8317 31.6877 15.8128 31.6862 15.7939 31.6843C15.7324 31.6779 15.6713 31.6681 15.6104 31.6559C15.591 31.6521 15.5719 31.6477 15.5527 31.6432C15.5353 31.6392 15.5174 31.637 15.5 31.6325V31.6286C15.3723 31.5956 15.2457 31.5545 15.125 31.4958L15.0078 31.4333L3.00781 24.5768C2.38487 24.2209 2.00025 23.557 2 22.8395V9.1618C2 8.89806 2.0528 8.64153 2.14941 8.40497C2.16859 8.35795 2.18927 8.31164 2.21191 8.2663L2.23828 8.21356C2.24243 8.20585 2.24771 8.19876 2.25195 8.1911C2.28326 8.13457 2.31686 8.07933 2.35352 8.02606C2.36319 8.01201 2.37277 7.99788 2.38281 7.98407C2.42195 7.93021 2.4643 7.87865 2.50879 7.8288C2.62122 7.70279 2.74996 7.59016 2.89355 7.49481L3.00781 7.4245L15.0078 0.568054C15.2755 0.415112 15.5696 0.328077 15.8672 0.308289C15.872 0.307815 15.8769 0.306633 15.8818 0.306335H16.1182C16.1228 0.306612 16.1273 0.307859 16.1318 0.308289ZM3 22.8503L7.51465 20.2712C7.75056 20.1364 8.05052 20.2288 8.18555 20.4645C8.32035 20.7007 8.24688 21.0054 8.01074 21.1403L3.51074 23.7126L15.5 30.5622V16.2907L3 9.14813V22.8503ZM16.5 16.2907V30.5622L28.4883 23.7126L23.9873 21.1413C23.751 21.0063 23.6773 20.7007 23.8125 20.4645C23.9478 20.2287 24.2483 20.1364 24.4844 20.2712L28.999 22.8513C28.9991 22.8475 28.9999 22.8433 29 22.8395V9.1618C29 9.15738 28.9991 9.15255 28.999 9.14813L16.5 16.2907ZM8.25781 13.9821C8.33691 13.6787 8.68469 13.5476 8.95703 13.7028L14.248 16.7263C14.4037 16.8152 14.4999 16.9806 14.5 17.1599V23.2536C14.4999 23.5671 14.2138 23.804 13.9111 23.7224C10.506 22.8038 8 19.6952 8 15.9997C8.00002 15.3026 8.08983 14.6266 8.25781 13.9821ZM23.042 13.7028C23.3143 13.5476 23.662 13.6787 23.7412 13.9821C23.9095 14.6266 24 15.3025 24 15.9997C24 19.6952 21.494 22.8038 18.0889 23.7224C17.7862 23.804 17.5001 23.5671 17.5 23.2536V17.1599C17.5001 16.9806 17.5963 16.8152 17.752 16.7263L23.042 13.7028ZM16.5 6.51434C16.4995 6.78566 16.2714 7.00068 16 7.00067C15.7286 7.00066 15.5005 6.78566 15.5 6.51434V1.43817L3.51172 8.28778L16 15.4235L28.4873 8.28778L16.5 1.43817V6.51434ZM16 7.99969C18.2143 7.99969 20.2177 8.90026 21.666 10.3542C21.8875 10.5765 21.8233 10.9436 21.5508 11.0993L16.248 14.1296C16.0943 14.2174 15.9057 14.2174 15.752 14.1296L10.4482 11.0983C10.1757 10.9426 10.1115 10.5766 10.333 10.3542C11.7814 8.90007 13.7854 7.99969 16 7.99969Z" /></svg>
    </a>
    <div class="standards-text">
      <div class="standards-title">
        <span class="lang-fr">Agentica suit le standard DTCG</span>
        <span class="lang-en">Agentica follows the DTCG standard</span>
      </div>
      <p>
        <span class="lang-fr">Les tokens d'Agentica sont conformes au format <strong>Design Tokens</strong> du W3C Community Group (DTCG) — <code>$value</code>, <code>$type</code>, alias <code>{group.token}</code>. Interopérables avec Style Dictionary, Tokens Studio et tout outil compatible. <a href="https://www.designtokens.org/" target="_blank" rel="noopener noreferrer">designtokens.org →</a></span>
        <span class="lang-en">Agentica's tokens conform to the W3C Community Group <strong>Design Tokens</strong> format (DTCG) — <code>$value</code>, <code>$type</code>, <code>{group.token}</code> aliases. Interoperable with Style Dictionary, Tokens Studio and any compatible tool. <a href="https://www.designtokens.org/" target="_blank" rel="noopener noreferrer">designtokens.org →</a></span>
      </p>
    </div>
  </div>
</div>

<div class="home-section-ink">
<div class="home-section">
  <h2>
    <span class="lang-fr">Valeurs non négociables</span>
    <span class="lang-en">Non-negotiable values</span>
  </h2>
  <p>
    <span class="lang-fr">Ces quatre principes guident chaque décision du système et chaque action des agents.</span>
    <span class="lang-en">These four principles guide every system decision and every agent action.</span>
  </p>
  <div class="principle-grid">
    ${principles.map(([ico,fr,descFr,en,descEn]) => `
    <div class="principle-card">
      <div style="color:var(--agtc-semantic-color-action-primary);margin-bottom:12px">${ico}</div>
      <div class="principle-title"><span class="lang-fr">${fr}</span><span class="lang-en">${en}</span></div>
      <div class="principle-desc"><span class="lang-fr">${descFr}</span><span class="lang-en">${descEn}</span></div>
    </div>`).join('')}
  </div>
  <div class="illus-block">${svgGovernance}</div>
</div>
</div>

<div class="stat-band" role="region" aria-label="Statistiques du système">
  <div class="stat-item">
    <span class="stat-num" data-count="21">21</span>
    <span class="stat-text">
      <span class="lang-fr">critères WCAG 2.1 AA couverts</span>
      <span class="lang-en">WCAG 2.1 AA criteria covered</span>
    </span>
  </div>
  <div class="stat-item">
    <span class="stat-num" data-count="${adrs.length}">${adrs.length}</span>
    <span class="stat-text">
      <span class="lang-fr">Décisions architecturales</span>
      <span class="lang-en">Architecture decisions</span>
    </span>
  </div>
  <div class="stat-item">
    <span class="stat-num" data-count="3">3</span>
    <span class="stat-text">
      <span class="lang-fr">Niveaux de tokens</span>
      <span class="lang-en">Token levels</span>
    </span>
  </div>
  <div class="stat-item">
    <span class="stat-num" data-count="${totalTokens}">${totalTokens}</span>
    <span class="stat-text">
      <span class="lang-fr">Tokens au total</span>
      <span class="lang-en">Tokens total</span>
    </span>
  </div>
  <div class="stat-item">
    <span class="stat-num" data-count="${colorCount}">${colorCount}</span>
    <span class="stat-text">
      <span class="lang-fr">Échelles de couleur</span>
      <span class="lang-en">Color scales</span>
    </span>
  </div>
</div>

<div class="home-section-ink">
<div class="home-section">
  <h2>
    <span class="lang-fr">Pipeline de tokens</span>
    <span class="lang-en">Token pipeline</span>
  </h2>
  <p>
    <span class="lang-fr">Trois niveaux ordonnés, chacun avec un rôle précis. Les agents comprennent la fonction, pas la valeur brute.</span>
    <span class="lang-en">Three ordered levels, each with a precise role. Agents understand function, not raw values.</span>
  </p>
  <div class="illus-block">${svgPipeline}</div>
  <div class="pipeline" role="region" aria-label="Pipeline des tokens">
    <div class="pipeline-step">
      <div class="pipeline-tag">
        <span class="lang-fr">Niveau 1 — Primitif</span>
        <span class="lang-en">Level 1 — Primitive</span>
      </div>
      <div class="pipeline-title">
        <span class="lang-fr">Valeurs physiques</span>
        <span class="lang-en">Physical values</span>
      </div>
      <div class="pipeline-desc">
        <span class="lang-fr">Couleurs, espacements, rayons. Très stables. Jamais utilisées directement dans les composants.</span>
        <span class="lang-en">Colors, spacing, radii. Very stable. Never used directly in components.</span>
      </div>
      <div class="pipeline-example">primitive.color.blue.11<br>→ #0d74ce</div>
    </div>
    <div class="pipeline-step">
      <div class="pipeline-tag">
        <span class="lang-fr">Niveau 2 — Sémantique</span>
        <span class="lang-en">Level 2 — Semantic</span>
      </div>
      <div class="pipeline-title">
        <span class="lang-fr">Intentions UX</span>
        <span class="lang-en">UX intentions</span>
      </div>
      <div class="pipeline-desc">
        <span class="lang-fr">Traduit les primitives en langage métier. Ce que les agents utilisent pour comprendre l'intention.</span>
        <span class="lang-en">Translates primitives into business language. What agents use to understand intent.</span>
      </div>
      <div class="pipeline-example">color.action.primary<br>→ primitive.color.blue.11</div>
    </div>
    <div class="pipeline-step">
      <div class="pipeline-tag">
        <span class="lang-fr">Niveau 3 — Composant</span>
        <span class="lang-en">Level 3 — Component</span>
      </div>
      <div class="pipeline-title">
        <span class="lang-fr">Contrats institutionnels</span>
        <span class="lang-en">Institutional contracts</span>
      </div>
      <div class="pipeline-desc">
        <span class="lang-fr">Décisions spécifiques à chaque composant. Toute modification requiert approbation.</span>
        <span class="lang-en">Component-specific decisions. Any change requires approval.</span>
      </div>
      <div class="pipeline-example">button.primary.background<br>→ color.action.primary</div>
    </div>
  </div>
  <div class="infobox" role="note">
    <span class="infobox-icon">${icon('info', 20)}</span>
    <div class="infobox-body">
      <span class="lang-fr">Règle absolue : un composant ne référence <strong>jamais</strong> un token primitif directement — toujours via un token sémantique. C'est cette indirection qui rend les décisions lisibles par les agents IA. <a href="tokens/index.html">Explorer les trois niveaux →</a></span>
      <span class="lang-en">Absolute rule: a component <strong>never</strong> references a primitive token directly — always through a semantic token. This indirection is what makes decisions legible to AI agents. <a href="tokens/index.html">Explore the three levels →</a></span>
    </div>
  </div>
</div>
</div>

<div class="home-section">
  <h2>
    <span class="lang-fr">Explorer le système</span>
    <span class="lang-en">Explore the system</span>
  </h2>
  <p>
    <span class="lang-fr">Chaque section encode une dimension du système — accessible aux humains et lisible par les agents.</span>
    <span class="lang-en">Each section encodes a dimension of the system — human-readable and machine-parseable.</span>
  </p>
  <div class="nav-grid">
    ${sections.map(([h,ico,fr,en,dFr,dEn]) => `
    <a href="${h}" class="nav-card">
      <span class="nav-card-icon">${ico}</span>
      <div class="nav-card-title"><span class="lang-fr">${fr}</span><span class="lang-en">${en}</span></div>
      <div class="nav-card-desc"><span class="lang-fr">${dFr}</span><span class="lang-en">${dEn}</span></div>
    </a>`).join('')}
  </div>
</div>

<div class="home-section">
  <h2>
    <span class="lang-fr">Décisions architecturales (ADRs)</span>
    <span class="lang-en">Architecture Decision Records (ADRs)</span>
  </h2>
  <p>
    <span class="lang-fr">Un design system accumule des décisions invisibles : pourquoi ce token est nommé ainsi, pourquoi cette variante a été rejetée. Les ADRs rendent ces décisions visibles, traçables et auditables par les humains comme par les agents.</span>
    <span class="lang-en">A design system accumulates invisible decisions: why this token is named this way, why this variant was rejected. ADRs make these decisions visible, traceable and auditable by both humans and agents.</span>
  </p>
  <div class="grid-3">
    <div class="info-card">
      <div class="info-card-icon">${icon('file-text',20)}</div>
      <div class="info-card-title">
        <span class="lang-fr">Format Markdown</span>
        <span class="lang-en">Markdown format</span>
      </div>
      <div class="info-card-body">
        <span class="lang-fr">Chaque décision est un fichier .md versionné dans le dépôt — lisible par Git, GitHub et les agents.</span>
        <span class="lang-en">Each decision is a versioned .md file in the repo — readable by Git, GitHub and agents.</span>
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-icon">${icon('git-branch',20)}</div>
      <div class="info-card-title">
        <span class="lang-fr">Immutabilité</span>
        <span class="lang-en">Immutability</span>
      </div>
      <div class="info-card-body">
        <span class="lang-fr">Un ADR ne se supprime jamais. On le marque remplacé ou déprécié. L'historique est inaltérable.</span>
        <span class="lang-en">An ADR is never deleted. It is marked superseded or deprecated. History is immutable.</span>
      </div>
    </div>
    <div class="info-card">
      <div class="info-card-icon">${icon('bot',20)}</div>
      <div class="info-card-title">
        <span class="lang-fr">Lisible par les agents</span>
        <span class="lang-en">Agent-readable</span>
      </div>
      <div class="info-card-body">
        <span class="lang-fr">Les agents lisent les ADRs pour comprendre les <em>pourquoi</em>, pas seulement les <em>quoi</em>.</span>
        <span class="lang-en">Agents read ADRs to understand the <em>why</em>, not just the <em>what</em>.</span>
      </div>
    </div>
  </div>
  <p><a href="decisions/index.html" class="agtc-button secondary">
    <span class="lang-fr">Voir les ${adrs.length} ADRs →</span>
    <span class="lang-en">View all ${adrs.length} ADRs →</span>
  </a></p>
</div>

<div class="home-section-ink">
<div class="home-section">
  <h2>
    <span class="lang-fr">Stack technique</span>
    <span class="lang-en">Technical stack</span>
  </h2>
  <p>
    <span class="lang-fr">Chaque couche du pipeline est outillée. Les Web Components garantissent la portabilité — un même composant fonctionne dans n'importe quel framework (React, Vue, Angular, ou aucun).</span>
    <span class="lang-en">Every layer of the pipeline is tooled. Web Components guarantee portability — the same component works in any framework (React, Vue, Angular, or none).</span>
  </p>
  <div class="illus-block">${svgMultiPlat}</div>
  <div class="stack-flow" role="img" aria-label="Pipeline du système de design">
    ${stackNodes.map(([ico,fr,en,sub]) => `
    <div class="stack-node">
      <div class="stack-node-icon">${ico}</div>
      <div class="stack-node-label"><span class="lang-fr">${fr}</span><span class="lang-en">${en}</span></div>
      <div class="stack-node-sub">${sub}</div>
    </div>`).join('')}
  </div>
  <div class="grid-auto-220">
    ${[
      ['<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 160 160" aria-hidden="true"><path fill="#00ACD7" d="M80 0C35.8 0 0 35.8 0 80s35.8 80 80 80 80-35.8 80-80S124.2 0 80 0zm-.7 32.5h1.4l37.3 21.5v43l-38 21.9L42 97V55l37.3-22.5zm0 8.2L47.6 59.3v37.4l32 18.5 32-18.5V59.3L79.3 40.7zM80 55a25 25 0 1 1 0 50 25 25 0 0 1 0-50z"/></svg>','Lit (Google)','Web Components','<span class="lang-fr">Contrats UI universels, framework-agnostic</span><span class="lang-en">Universal UI contracts, framework-agnostic</span>',''],
      [icon('palette',18),'Style Dictionary','Token compilation','<span class="lang-fr">JSON → CSS, JS, Swift, Android</span><span class="lang-en">JSON → CSS, JS, Swift, Android</span>',''],
      ['<img class="vendor-logo" src="integrations/storybook.svg" alt="Storybook" width="22" height="22" loading="lazy">','Storybook','Documentation','<span class="lang-fr">Canvas + previews + specs</span><span class="lang-en">Canvas + previews + specs</span>',''],
      [icon('shield-check',18),'axe-core','Accessibility','<span class="lang-fr">Audit automatique WCAG</span><span class="lang-en">Automatic WCAG audit</span>',''],
      [icon('test-tube',18),'Playwright','E2E tests','<span class="lang-fr">Parcours complets automatisés</span><span class="lang-en">Automated end-to-end flows</span>',''],
      ['<img class="vendor-logo" src="integrations/react.svg" alt="React" width="22" height="22" loading="lazy">','React / Vue / Angular','Web Components','<span class="lang-fr">Compatible tous frameworks</span><span class="lang-en">Works with all frameworks</span>',''],
    ].map(([ico,name,role,dFr,dEn]) => `
    <div class="tool-card">
      <div class="tool-card-icon">${ico}</div>
      <div>
        <div class="tool-card-name">${name} <span class="tool-card-role">— ${role}</span></div>
        <div class="tool-card-desc">${dFr}</div>
      </div>
    </div>`).join('')}
  </div>
</div>
</div>

`;

  write(path.join(DIST, 'index.html'), layout({ title: 'Accueil', pageTitle: 'Agentica — Système de design pour humains et agents IA', depth: 0, fullWidth: true, body }));
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
    <span class="nav-card-icon">${icon('palette', 32)}</span>
    <div class="nav-card-title"><span class="lang-fr">Couleur</span><span class="lang-en">Color</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Échelles Radix 12 niveaux, tokens sémantiques, modes clair et sombre, contrastes WCAG.</span>
      <span class="lang-en">Radix 12-step scales, semantic tokens, light and dark modes, WCAG contrast.</span>
    </div>
  </a>
  <a href="spacing.html" class="nav-card">
    <span class="nav-card-icon">${icon('move-horizontal', 32)}</span>
    <div class="nav-card-title"><span class="lang-fr">Espacement</span><span class="lang-en">Spacing</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Grille de 4px, densités compact/default/spacious, tokens de contrôle et de mise en page.</span>
      <span class="lang-en">4px grid, compact/default/spacious densities, control and layout tokens.</span>
    </div>
  </a>
  <a href="typography.html" class="nav-card">
    <span class="nav-card-icon">${icon('type', 32)}</span>
    <div class="nav-card-title"><span class="lang-fr">Typographie</span><span class="lang-en">Typography</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Atkinson Hyperlegible — échelle de taille, poids, interligne, règles d'accessibilité.</span>
      <span class="lang-en">Atkinson Hyperlegible — size scale, weight, line-height, accessibility rules.</span>
    </div>
  </a>
  <a href="icons.html" class="nav-card">
    <span class="nav-card-icon">${icon('star', 32)}</span>
    <div class="nav-card-title"><span class="lang-fr">Icônes</span><span class="lang-en">Icons</span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Bibliothèque Lucide — 1 500+ icônes, 3 tailles, règles WCAG 1.1.1 et contrat d'accessibilité.</span>
      <span class="lang-en">Lucide library — 1,500+ icons, 3 sizes, WCAG 1.1.1 rules and accessibility contract.</span>
    </div>
  </a>
</div>
`;

  write(path.join(DIST, 'foundations/index.html'), layout({
    title: 'Fondations', depth: 1,
    sidebar: sidebarFoundations('../', 'index.html') + sidebarComponents('../', ''),
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
    ['color-background-page',        'color.background.page',        SEM['color-background-page'],        '<span class="lang-fr">Fond de page principale</span><span class="lang-en">Main page background</span>'],
    ['color-background-surface',     'color.background.surface',     SEM['color-background-surface'],     '<span class="lang-fr">Fond de carte, panneau, modal</span><span class="lang-en">Card, panel, modal background</span>'],
    ['color-background-subtle',      'color.background.subtle',      SEM['color-background-subtle'],      '<span class="lang-fr">Fond secondaire, survol discret</span><span class="lang-en">Secondary background, subtle hover</span>'],
    ['color-text-primary',           'color.text.primary',           SEM['color-text-primary'],           '<span class="lang-fr">Texte principal, haute lisibilité</span><span class="lang-en">Primary text, high readability</span>'],
    ['color-text-secondary',         'color.text.secondary',         SEM['color-text-secondary'],         '<span class="lang-fr">Texte secondaire, labels, métadonnées</span><span class="lang-en">Secondary text, labels, metadata</span>'],
    ['color-text-disabled',          'color.text.disabled',          SEM['color-text-disabled'],          '<span class="lang-fr">Texte désactivé</span><span class="lang-en">Disabled text</span>'],
    ['color-border-default',         'color.border.default',         SEM['color-border-default'],         '<span class="lang-fr">Bordure standard</span><span class="lang-en">Default border</span>'],
    ['color-border-focus',           'color.border.focus',           SEM['color-border-focus'],           '<span class="lang-fr">Bordure focus — accessibilité clavier</span><span class="lang-en">Focus border — keyboard accessibility</span>'],
    ['color-border-danger',          'color.border.danger',          SEM['color-border-danger'],          '<span class="lang-fr">Bordure état erreur</span><span class="lang-en">Error state border</span>'],
  ];

  const palette = Object.entries(COLOR_SCALES).map(([scale, steps]) => {
    const swatches = Object.entries(steps).map(([step, { value, desc }]) =>
      `<div class="palette-step" role="img" style="background:${value}" title="${step}: ${value} — ${desc}" aria-label="Étape ${step}: ${value}"></div>`
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

<div class="palette-section">${palette}</div>

<h2><span class="lang-fr">Tokens sémantiques</span><span class="lang-en">Semantic tokens</span></h2>
<p>
  <span class="lang-fr">Ces 16 tokens encodent les intentions UX. Chaque composant les référence — jamais les primitives directement.</span>
  <span class="lang-en">These 16 tokens encode UX intentions. Every component references them — never the primitives directly.</span>
</p>
<table class="token-table"><colgroup><col style="width:8%"><col style="width:44%"><col style="width:16%"><col style="width:32%"></colgroup>
  <thead><tr><th><span class="lang-fr">Couleur</span><span class="lang-en">Color</span></th><th>Token CSS</th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Intention</span><span class="lang-en">Intent</span></th></tr></thead>
  <tbody>${semRows}</tbody>
</table>

<blockquote><p>
  <span class="lang-fr">Les agents comprennent <code>color.action.primary</code> comme une intention. Ils ne comprennent pas <code>#0d74ce</code> comme une intention — c'est juste une valeur.</span>
  <span class="lang-en">Agents understand <code>color.action.primary</code> as an intention. They do not understand <code>#0d74ce</code> as an intention — it is just a value.</span>
</p></blockquote>
`;

  write(path.join(DIST, 'foundations/color.html'), layout({
    title: 'Couleur', depth: 1,
    sidebar: sidebarFoundations('../', 'color.html') + sidebarComponents('../', ''),
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
    `<div class="space-item"><div class="space-label"><code>space.${step}</code></div><div class="space-bar" role="img" style="width:${px}" aria-label="${px}"></div><strong style="font-family:var(--agtc-font-mono);font-size:12px;color:var(--agtc-semantic-color-text-secondary)">${px}</strong>${label ? `<span style="font-size:11px;color:var(--agtc-semantic-color-text-secondary);margin-left:4px">${label}</span>` : ''}</div>`
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
    sidebar: sidebarFoundations('../', 'spacing.html') + sidebarComponents('../', ''),
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
      <td style="font-family:var(--agtc-font-mono)">${rem} <span style="color:var(--agtc-semantic-color-text-secondary);font-size:11px">(${px})</span></td>
      <td style="font-family:var(--agtc-font-mono)">${lh}</td>
      <td style="font-family:var(--agtc-font-mono)">${weight}</td>
      <td style="color:var(--agtc-semantic-color-text-secondary)">${role}</td>
    </tr>`
  ).join('');

  const scaleSpecimens = scaleSteps.map(({ step, rem, role, lh, weight }) =>
    `<div style="display:flex;align-items:baseline;gap:16px;padding:10px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default)">
      <code style="min-width:56px;font-size:11px;color:var(--agtc-semantic-color-text-secondary);flex-shrink:0">${step}</code>
      <div style="font-size:${rem};font-weight:${weight};line-height:${lh};color:var(--agtc-semantic-color-text-primary)">${role}</div>
      <span style="font-size:11px;color:var(--agtc-semantic-color-text-secondary);margin-left:auto;flex-shrink:0">${rem} · lh ${lh}</span>
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
  <div style="font-size:28px;font-weight:700;letter-spacing:-.01em;line-height:1.3;color:var(--agtc-semantic-color-text-primary);word-break:break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
  <div style="font-size:28px;line-height:1.3;color:var(--agtc-semantic-color-text-secondary);word-break:break-all;margin-top:4px">abcdefghijklmnopqrstuvwxyz</div>
  <div style="font-size:24px;line-height:1.4;color:var(--agtc-semantic-color-text-primary);margin-top:8px;font-weight:700">0 1 2 3 4 5 6 7 8 9</div>
  <div style="font-size:18px;line-height:1.5;color:var(--agtc-semantic-color-text-secondary);margin-top:8px">! @ # $ % &amp; * ( ) [ ] { } , . ; : ' " - _ / \ ? + = &lt; &gt;</div>
  <div style="font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px">
    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px"><span class="lang-fr">Caractères ambigus — différenciation maximale</span><span class="lang-en">Ambiguous characters — maximum disambiguation</span></span>
    l 1 I &nbsp;·&nbsp; O 0 &nbsp;·&nbsp; b d p q &nbsp;·&nbsp; n u m &nbsp;·&nbsp; rn m
  </div>
  <div style="font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px">
    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px"><span class="lang-fr">Caractères accentués</span><span class="lang-en">Accented characters</span></span>
    À Â Ä Æ Ç É È Ê Ë Î Ï Ô Œ Ù Û Ü à â ä æ ç é è ê ë î ï ô œ ù û ü
  </div>
  <p style="font-size:12px;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;margin-bottom:0">
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
  <div style="font-family:var(--agtc-font-mono);font-size:22px;font-weight:700;line-height:1.3;color:var(--agtc-semantic-color-text-primary);word-break:break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
  <div style="font-family:var(--agtc-font-mono);font-size:22px;line-height:1.3;color:var(--agtc-semantic-color-text-secondary);word-break:break-all;margin-top:4px">abcdefghijklmnopqrstuvwxyz</div>
  <div style="font-family:var(--agtc-font-mono);font-size:20px;line-height:1.4;color:var(--agtc-semantic-color-text-primary);margin-top:8px;font-weight:700">0 1 2 3 4 5 6 7 8 9</div>
  <div style="font-family:var(--agtc-font-mono);font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:8px">! @ # $ % &amp; * ( ) [ ] { } , . ; : ' " - _ / \ ? + = &lt; &gt;</div>
  <div style="font-family:var(--agtc-font-mono);font-size:16px;line-height:1.6;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px">
    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px"><span class="lang-fr">Caractères ambigus — clé pour le code</span><span class="lang-en">Ambiguous characters — critical for code</span></span>
    l 1 I &nbsp;·&nbsp; O 0 &nbsp;·&nbsp; b d p q &nbsp;·&nbsp; n u m &nbsp;·&nbsp; rn m
  </div>
  <div style="font-family:var(--agtc-font-mono);font-size:13px;line-height:1.7;color:var(--agtc-semantic-color-action-primary);margin-top:12px;border-top:1px solid var(--agtc-semantic-color-border-default);padding-top:12px;word-break:break-all">
    <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:8px;color:var(--agtc-semantic-color-text-secondary)"><span class="lang-fr">Exemple — token CSS</span><span class="lang-en">Example — CSS token</span></span>
    --agtc-semantic-color-action-primary: #007a68;<br>
    --agtc-component-button-primary-background: var(--agtc-semantic-color-action-primary);
  </div>
  <p style="font-size:12px;color:var(--agtc-semantic-color-text-secondary);margin-top:12px;margin-bottom:0">
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
      <div style="font-size:0.875rem;line-height:1.6;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Texte courant, labels, captions. Conforme WCAG 1.4.12. Maximise le confort de lecture sur plusieurs lignes.</span><span class="lang-en">Body text, labels, captions. Conforms to WCAG 1.4.12. Maximises reading comfort across multiple lines.</span></div>
    </div>
    <div class="lh-demo-card">
      <div class="lh-demo-label"><code>heading</code> — 1.1</div>
      <div style="font-size:1.25rem;line-height:1.1;font-weight:700;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Titres h5 → h3. Compact sans être étouffant.</span><span class="lang-en">Headings h5 → h3. Compact without feeling cramped.</span></div>
    </div>
    <div class="lh-demo-card">
      <div class="lh-demo-label"><code>display</code> — 1.0</div>
      <div style="font-size:2rem;line-height:1.0;font-weight:700;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">h2, h1, hero.</span><span class="lang-en">h2, h1, hero.</span></div>
    </div>
  </div>
</div>

<h2><span class="lang-fr">Règles</span><span class="lang-en">Rules</span></h2>
<ul>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-size: 16px</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-primitive-fontSize-base)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-family: 'Atkinson Hyperlegible'</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-semantic-typography-fontFamily)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-weight: bold</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-primitive-fontWeight-bold)</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <span class="lang-fr">Taille hors-échelle :</span><span class="lang-en">Off-scale size:</span> <code>15px</code>, <code>18px</code>, <code>22px</code> — <span class="lang-fr">choisir l'échelon Minor Third le plus proche</span><span class="lang-en">pick the closest Minor Third step</span></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Import Google Fonts (sans-serif) :</span><span class="lang-en">Google Fonts import (sans-serif):</span> <code>family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700</code></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Import Google Fonts (mono) :</span><span class="lang-en">Google Fonts import (mono):</span> <code>family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700</code></li>
  <li><span class='icon-no'>${icon('circle-x', 16)}</span> <code>font-family: monospace</code> — <span class="lang-fr">utiliser</span><span class="lang-en">use</span> <code>var(--agtc-font-mono)</code></li>
  <li><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Toujours choisir le mode <code>lineHeight</code> selon le rôle : <code>reading</code> ≤ base, <code>heading</code> pour lg–2xl, <code>display</code> pour 3xl+</span><span class="lang-en">Always pick the <code>lineHeight</code> mode for the role: <code>reading</code> ≤ base, <code>heading</code> for lg–2xl, <code>display</code> for 3xl+</span></li>
</ul>
`;

  write(path.join(DIST, 'foundations/typography.html'), layout({
    title: 'Typographie', depth: 1,
    sidebar: sidebarFoundations('../', 'typography.html') + sidebarComponents('../', ''),
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
      <span style="font-size:11px;color:var(--agtc-semantic-color-text-secondary);font-family:var(--agtc-font-mono)">${name}</span>
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
    sidebar: sidebarFoundations('../', 'icons.html') + sidebarComponents('../', ''),
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
    <span class="nav-card-icon">${icon('mouse-pointer-click',32)}</span>
    <div class="nav-card-title">Button</div>
    <div class="nav-card-desc">
      <span class="lang-fr">4 variantes : primary, secondary, ghost, critical. Règles spéciales pour les actions irréversibles.</span>
      <span class="lang-en">4 variants: primary, secondary, ghost, critical. Special rules for irreversible actions.</span>
    </div>
  </a>
  <a href="icon.html" class="nav-card">
    <span class="nav-card-icon">${icon('star',32)}</span>
    <div class="nav-card-title">Icon</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Bibliothèque Lucide — 1 500+ icônes, 3 tailles, règles WCAG 1.1.1.</span>
      <span class="lang-en">Lucide library — 1,500+ icons, 3 sizes, WCAG 1.1.1 rules.</span>
    </div>
  </a>
  <a href="input.html" class="nav-card">
    <span class="nav-card-icon">${icon('pen-line',32)}</span>
    <div class="nav-card-title">Input</div>
    <div class="nav-card-desc">
      <span class="lang-fr">7 types, label obligatoire, toggle password, icônes hybrides, états complets.</span>
      <span class="lang-en">7 types, required label, password toggle, hybrid icons, complete states.</span>
    </div>
  </a>
  <a href="badge.html" class="nav-card">
    <span class="nav-card-icon">${icon('tag',32)}</span>
    <div class="nav-card-title">Badge</div>
    <div class="nav-card-desc">
      <span class="lang-fr">6 variantes sémantiques, 2 tailles, icônes, mode icon-only accessible.</span>
      <span class="lang-en">6 semantic variants, 2 sizes, icons, accessible icon-only mode.</span>
    </div>
  </a>
  <a href="card.html" class="nav-card">
    <span class="nav-card-icon">${icon('layout-template',32)}</span>
    <div class="nav-card-title">Card</div>
    <div class="nav-card-desc">
      <span class="lang-fr">3 variantes, 4 paddings, slots header/body/footer, composition libre.</span>
      <span class="lang-en">3 variants, 4 paddings, header/body/footer slots, free composition.</span>
    </div>
  </a>
  <a href="checkbox.html" class="nav-card">
    <span class="nav-card-icon">${icon('square-check',32)}</span>
    <div class="nav-card-title">Checkbox</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Sélection binaire, forme carrée (NN/g), états complets + indeterminate, label cliquable.</span>
      <span class="lang-en">Binary selection, square shape (NN/g), full states + indeterminate, clickable label.</span>
    </div>
  </a>
  <a href="radio.html" class="nav-card">
    <span class="nav-card-icon">${icon('circle-dot',32)}</span>
    <div class="nav-card-title">Radio</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Choix exclusif, forme ronde (NN/g), groupe ARIA radiogroup, navigation flèches.</span>
      <span class="lang-en">Exclusive choice, round shape (NN/g), ARIA radiogroup, arrow-key navigation.</span>
    </div>
  </a>
  <a href="toggle.html" class="nav-card">
    <span class="nav-card-icon">${icon('toggle-right',32)}</span>
    <div class="nav-card-title">Toggle</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Réglage on/off à effet immédiat, role=switch, état par position (WCAG 1.4.1).</span>
      <span class="lang-en">Immediate on/off setting, role=switch, state by position (WCAG 1.4.1).</span>
    </div>
  </a>
  <a href="table.html" class="nav-card">
    <span class="nav-card-icon">${icon('table',32)}</span>
    <div class="nav-card-title">Table</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Données en lecture seule, accessible (scope, caption), séparateurs/zébrage, scroll horizontal.</span>
      <span class="lang-en">Read-only data, accessible (scope, caption), dividers/striped, horizontal scroll.</span>
    </div>
  </a>
  <a href="code-block.html" class="nav-card">
    <span class="nav-card-icon">${icon('code',32)}</span>
    <div class="nav-card-title">Code Block</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Code en lecture seule, copiable (annonce AT), indicateur de langue, surface sombre tokenisée.</span>
      <span class="lang-en">Read-only code, copyable (AT announce), language indicator, tokenized dark surface.</span>
    </div>
  </a>
  <a href="banner.html" class="nav-card">
    <span class="nav-card-icon">${icon('megaphone',32)}</span>
    <div class="nav-card-title">Banner</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Message inline (callout/alerte), 6 variantes, statique par défaut, live region en opt-in.</span>
      <span class="lang-en">Inline message (callout/alert), 6 variants, static by default, opt-in live region.</span>
    </div>
  </a>
  <a href="link.html" class="nav-card">
    <span class="nav-card-icon">${icon('link',32)}</span>
    <div class="nav-card-title">Link</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Lien de navigation, souligné par défaut (WCAG 1.4.1), liens externes sécurisés et annoncés.</span>
      <span class="lang-en">Navigation link, underlined by default (WCAG 1.4.1), secure & announced external links.</span>
    </div>
  </a>
  <a href="segmented.html" class="nav-card">
    <span class="nav-card-icon">${icon('rows-3',32)}</span>
    <div class="nav-card-title">Segmented</div>
    <div class="nav-card-desc">
      <span class="lang-fr">Contrôle segmenté mono-sélection à effet immédiat (FR/EN, densité), boutons + aria-current.</span>
      <span class="lang-en">Single-select segmented control with immediate effect (FR/EN, density), buttons + aria-current.</span>
    </div>
  </a>
</div>
`;

  write(path.join(DIST, 'components/index.html'), layout({
    title: 'Composants', depth: 1,
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'index.html'),
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
      <button class="agtc-button primary"><span class="lang-fr">Enregistrer les modifications</span><span class="lang-en">Save changes</span></button>
      <button class="agtc-button primary" disabled><span class="lang-fr">Enregistrer (désactivé)</span><span class="lang-en">Save (disabled)</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Secondary — action alternative</span><span class="lang-en">Secondary — alternative action</span></span>
    <div class="demo-row">
      <button class="agtc-button secondary"><span class="lang-fr">Annuler</span><span class="lang-en">Cancel</span></button>
      <button class="agtc-button secondary" disabled><span class="lang-fr">Annuler (désactivé)</span><span class="lang-en">Cancel (disabled)</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Ghost — action tertiaire, faible emphase</span><span class="lang-en">Ghost — tertiary action, low emphasis</span></span>
    <div class="demo-row">
      <button class="agtc-button ghost"><span class="lang-fr">En savoir plus</span><span class="lang-en">Learn more</span></button>
      <button class="agtc-button ghost" disabled><span class="lang-fr">En savoir plus (désactivé)</span><span class="lang-en">Learn more (disabled)</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Critical — action irréversible (confirmation obligatoire)</span><span class="lang-en">Critical — irreversible action (confirmation required)</span></span>
    <div class="demo-row">
      <button class="agtc-button critical"><span class="lang-fr">Supprimer définitivement</span><span class="lang-en">Delete permanently</span></button>
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
      <button class="agtc-button primary">${icon('plus',16)} <span class="lang-fr">Ajouter</span><span class="lang-en">Add</span></button>
      <button class="agtc-button secondary">${icon('download',16)} <span class="lang-fr">Télécharger</span><span class="lang-en">Download</span></button>
      <button class="agtc-button ghost">${icon('settings',16)} <span class="lang-fr">Paramètres</span><span class="lang-en">Settings</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Icône après (suffix)</span><span class="lang-en">Trailing icon (suffix)</span></span>
    <div class="demo-row">
      <button class="agtc-button primary"><span class="lang-fr">Continuer</span><span class="lang-en">Continue</span> ${icon('arrow-right',16)}</button>
      <button class="agtc-button secondary"><span class="lang-fr">Exporter</span><span class="lang-en">Export</span> ${icon('external-link',16)}</button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Icon-only — <code>label</code> obligatoire (WCAG 1.1.1)</span><span class="lang-en">Icon-only — <code>label</code> required (WCAG 1.1.1)</span></span>
    <div class="demo-row">
      <button class="agtc-button primary icon-only" aria-label="Ajouter">${icon('plus',16)}</button>
      <button class="agtc-button secondary icon-only" aria-label="Modifier">${icon('pencil',16)}</button>
      <button class="agtc-button ghost icon-only" aria-label="Paramètres">${icon('settings',16)}</button>
      <button class="agtc-button critical icon-only" aria-label="Supprimer définitivement">${icon('trash-2',16)}</button>
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'button.html'),
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'icon.html'),
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'input.html'),
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
        <span style="display:inline-flex;align-items:center;padding:var(--agtc-component-badge-md-padding-y) var(--agtc-component-badge-md-padding-x);border-radius:var(--agtc-component-badge-md-radius);font-size:var(--agtc-component-badge-md-font-size);font-weight:var(--agtc-semantic-typography-label-weight);background:var(--agtc-component-badge-${variant}-background);color:var(--agtc-component-badge-${variant}-text);border:1px solid var(--agtc-component-badge-${variant}-border)"><span class="lang-fr">${labelFr}</span><span class="lang-en">${labelEn}</span></span>
        <span style="display:inline-flex;align-items:center;padding:var(--agtc-component-badge-sm-padding-y) var(--agtc-component-badge-sm-padding-x);border-radius:var(--agtc-component-badge-sm-radius);font-size:var(--agtc-component-badge-sm-font-size);font-weight:var(--agtc-semantic-typography-label-weight);background:var(--agtc-component-badge-${variant}-background);color:var(--agtc-component-badge-${variant}-text);border:1px solid var(--agtc-component-badge-${variant}-border)"><span class="lang-fr">${labelFr} (sm)</span><span class="lang-en">${labelEn} (sm)</span></span>
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'badge.html'),
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'card.html'),
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'checkbox.html'),
    body: body + uxPatternsFromMd('checkbox') + contributionBanner()
  }));
}

// ─── PAGE: RADIO ─────────────────────────────────────────────────────────────
function buildRadio() {
  const RING = 'width:var(--agtc-semantic-icon-size-control);height:var(--agtc-semantic-icon-size-control);border-radius:9999px;flex-shrink:0;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center';
  function radio(state) {
    if (state === 'selected')
      return `<span style="${RING};border:1.5px solid var(--agtc-semantic-color-action-primary);background:var(--agtc-semantic-color-background-surface)"><span style="width:50%;height:50%;border-radius:9999px;background:var(--agtc-semantic-color-action-primary)"></span></span>`;
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'radio.html'),
    body: body + uxPatternsFromMd('radio') + contributionBanner()
  }));
}

// ─── PAGE: TOGGLE ────────────────────────────────────────────────────────────
function buildToggle() {
  function toggle(on, dim) {
    const track = on ? 'var(--agtc-component-toggle-default-track-on)' : 'var(--agtc-component-toggle-default-track-off)';
    const x = on ? '18px' : '2px';
    // Ombre du curseur en dur : reflète fidèlement le composant agtc-toggle (délimiteur WCAG 1.4.11, non tokenisé dans le contrat).
    return `<span style="position:relative;display:inline-block;width:40px;height:24px;border-radius:9999px;background:${track};flex-shrink:0${dim?';opacity:.5':''}"><span style="position:absolute;top:2px;left:${x};width:20px;height:20px;border-radius:9999px;background:var(--agtc-component-toggle-default-knob);box-shadow:0 1px 2px rgba(0,0,0,.25)"></span></span>`;
  }
  function row(on, label, dim) {
    return `<span style="display:inline-flex;align-items:center;gap:var(--agtc-semantic-space-control-gap);min-height:24px">${toggle(on, dim)}<span style="font-size:var(--agtc-semantic-typography-body-size);color:var(--agtc-semantic-color-text-${dim?'disabled':'primary'})">${label}</span></span>`;
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'toggle.html'),
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'table.html'),
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'code-block.html'),
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

  const bannerDemo = (variant, iconName, headFr, headEn, bodyFr, bodyEn) => `
    <div class="agtc-banner ${variant}">
      <span class="banner-icon">${icon(iconName, 20)}</span>
      <div class="banner-content"><strong><span class="lang-fr">${headFr}</span><span class="lang-en">${headEn}</span></strong><span><span class="lang-fr">${bodyFr}</span><span class="lang-en">${bodyEn}</span></span></div>
    </div>`;

  const body = `
<h1>Banner</h1>
<p class="page-lead">
  <span class="lang-fr">Message inline contextuel (callout / alerte) dans le flux de la page : info, succès, avertissement, erreur. 6 variantes alignées sur le badge. Statique par défaut — région live en opt-in pour les messages dynamiques.</span>
  <span class="lang-en">Inline contextual message (callout / alert) in the page flow: info, success, warning, error. 6 variants aligned with badge. Static by default — opt-in live region for dynamic messages.</span>
</p>

<h2 class="first"><span class="lang-fr">Variantes</span><span class="lang-en">Variants</span></h2>
<div class="demo-box" style="display:flex;flex-direction:column;gap:4px;background:none;border:none;padding:0">
  ${bannerDemo('neutral', 'info', 'Neutre', 'Neutral', 'Message neutre informatif.', 'Neutral informational message.')}
  ${bannerDemo('brand', 'sparkles', 'Agentica', 'Agentica', 'Highlight de marque ou contribution.', 'Brand highlight or contribution.')}
  ${bannerDemo('info', 'info', 'Information', 'Information', 'Ce composant est en lecture seule.', 'This component is read-only.')}
  ${bannerDemo('success', 'circle-check', 'Enregistré', 'Saved', 'Vos modifications ont été sauvegardées.', 'Your changes have been saved.')}
  ${bannerDemo('warning', 'triangle-alert', 'Attention', 'Warning', 'Cette action affectera 3 fichiers liés.', 'This action will affect 3 linked files.')}
  ${bannerDemo('danger', 'octagon-alert', 'Erreur', 'Error', 'Impossible de contacter le serveur.', 'Could not reach the server.')}
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'banner.html'),
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

  // Démo : vrais <a class="agtc-link"> — côté light DOM du mix.
  const extIcon = `<span aria-hidden="true" style="display:inline-block;line-height:0;margin-left:2px;vertical-align:baseline">${icon('arrow-up-right', 14)}</span><span class="visually-hidden"> (ouvre dans un nouvel onglet)</span>`;

  const body = `
<h1>Link</h1>
<p class="page-lead">
  <span class="lang-fr">Lien de navigation textuel — interne ou externe, inline ou nav. Souligné par défaut (WCAG 1.4.1), focus visible, liens externes sécurisés (<code>noopener</code>) et annoncés aux lecteurs d'écran.</span>
  <span class="lang-en">Textual navigation link — internal or external, inline or nav. Underlined by default (WCAG 1.4.1), visible focus, secure external links (<code>noopener</code>) announced to screen readers.</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu</span><span class="lang-en">Preview</span></h2>
<div class="demo-box" style="display:flex;flex-direction:column;gap:14px;align-items:flex-start">
  <p style="margin:0;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Consulter la </span><span class="lang-en">See the </span><a class="agtc-link" href="#guideline"><span class="lang-fr">guideline du composant</span><span class="lang-en">component guideline</span></a><span class="lang-fr"> pour les détails.</span><span class="lang-en"> for details.</span></p>
  <p style="margin:0;color:var(--agtc-semantic-color-text-primary)"><span class="lang-fr">Lien externe : </span><span class="lang-en">External link: </span><a class="agtc-link" href="https://www.nngroup.com/articles/guidelines-for-visualizing-links/" target="_blank" rel="noopener noreferrer">NN/g — Visualizing Links${extIcon}</a></p>
  <div style="display:flex;gap:18px"><a class="agtc-link underline-hover" href="#a"><span class="lang-fr">Accueil</span><span class="lang-en">Home</span></a><a class="agtc-link underline-hover" href="#b"><span class="lang-fr">Composants</span><span class="lang-en">Components</span></a><a class="agtc-link underline-hover" href="#c">Tokens</a></div>
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'link.html'),
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

  // Démo : vrais <div class="agtc-segmented"> — visuel statique (un segment actif).
  const seg = (label, opts) => `
    <div class="agtc-segmented" role="group" aria-label="${label}">
      ${opts.map(([l, sel]) => `<button type="button" aria-current="${sel ? 'true' : 'false'}">${l}</button>`).join('')}
    </div>`;

  const body = `
<h1>Segmented</h1>
<p class="page-lead">
  <span class="lang-fr">Contrôle segmenté mono-sélection à effet immédiat (2–5 options courtes) : bascule de langue, densité, vue liste/grille. Groupe de boutons natifs + <code>aria-current</code> — distinct du groupe radio (formulaire) et des onglets (panneaux).</span>
  <span class="lang-en">Single-select segmented control with immediate effect (2–5 short options): language toggle, density, list/grid view. Native button group + <code>aria-current</code> — distinct from radio group (forms) and tabs (panels).</span>
</p>

<h2 class="first"><span class="lang-fr">Aperçu</span><span class="lang-en">Preview</span></h2>
<div class="demo-box" style="display:flex;gap:24px;flex-wrap:wrap;align-items:center">
  ${seg('Langue', [['FR', true], ['EN', false]])}
  ${seg('Densité', [['Compact', false], ['Normal', true], ['Confort', false]])}
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
    sidebar: sidebarFoundations('../', '') + sidebarComponents('../', 'segmented.html'),
    body: body + uxPatternsFromMd('segmented') + contributionBanner()
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
      `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:10px"><span style="width:40px;height:40px;border-radius:6px;background:${value};border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0" aria-hidden="true"></span><code>--agtc-primitive-color-${scale}-${step}</code></div></td><td class="mono-sm">${value}</td><td>${desc}</td></tr>`
    )
  ).join('');

  // Build a full semantic map with alias info
  const semRows = Object.entries(SEM).map(([k, v]) => {
    const isColor = k.startsWith('color-');
    const swatch = isColor ? `<span style="width:40px;height:40px;border-radius:6px;background:${v};border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0;display:inline-block" aria-hidden="true"></span>` : '';
    const aliasNode = getSemanticAlias(k);
    const aliasCell = aliasNode ? `<td style="font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary)">${aliasNode}</td>` : '<td>—</td>';
    return `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:10px">${swatch}<code>--agtc-semantic-${k}</code></div></td>${aliasCell}<td class="mono-sm">${v}</td></tr>`;
  }).join('');

  const compRows = Object.entries(COMP).map(([k, v]) => {
    const resolved = resolveCompValue(v);
    const isColor = k.includes('background') || k.includes('text') || k.includes('border');
    const swatch = isColor && resolved.startsWith('#') ? `<span style="width:20px;height:20px;border-radius:3px;background:${resolved};border:1px solid var(--agtc-semantic-color-border-swatch);flex-shrink:0;display:inline-block;margin-right:6px" aria-hidden="true"></span>` : '';
    return `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td style="font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary)">${v}</td><td><div style="display:flex;align-items:center">${swatch}<span class="mono-sm">${resolved}</span></div></td></tr>`;
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
    sidebar: sidebarFoundations('../','') + sidebarComponents('../',''),
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
  <td class="adr-num">ADR-${String(a.num).padStart(3,'0')}</td>
  <td class="adr-title"><a href="${a.slug}.html">${esc(a.title)}</a></td>
  <td><span class="agtc-badge success sm"><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Actif</span><span class="lang-en">Active</span></span></td>
  <td>${a.date}</td>
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
    sidebar: sidebarDecisionsLocal(adrs) + sidebarAgents('../'),
    body: body + contributionBanner()
  }));
}

// ─── PAGE: INDIVIDUAL ADR ───────────────────────────────────────────────────
function buildADR(adr, adrs) {
  const content = parseMd(adr.content);
  const meta = `
<div class="adr-meta">
  <div class="adr-meta-item"><strong>ADR</strong> ${String(adr.num).padStart(3,'0')}</div>
  <div class="adr-meta-item"><strong><span class="lang-fr">Statut</span><span class="lang-en">Status</span></strong> <span class="agtc-badge success sm"><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Actif</span><span class="lang-en">Active</span></span></div>
  <div class="adr-meta-item"><strong><span class="lang-fr">Date</span><span class="lang-en">Date</span></strong> ${adr.date}</div>
  ${adr.deciders ? `<div class="adr-meta-item"><strong><span class="lang-fr">Décideurs</span><span class="lang-en">Decision makers</span></strong> ${esc(adr.deciders)}</div>` : ''}
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
<div class="agent-card">
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
    body: body + contributionBanner()
  }));
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
    const slug = `adr-${String(num).padStart(3,'0')}`;
    return { num, title, date: dateMatch ? dateMatch[1].trim() : '2026-05-28', deciders: decidersMatch ? decidersMatch[1].trim() : '', slug, content, file: f };
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

  // logo : nom de fichier dans integrations/ (couleur de marque), ou icône Lucide pour CSS/JS.
  const platforms = [
    ['css',     'dist/tokens/css/',     'Variables CSS (custom properties)',      'CSS custom properties', icon('code',18)],
    ['js',      'dist/tokens/js/',      'Exports ES6',                            'ES6 exports',            icon('code',18)],
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

<div class="agtc-banner info" role="note">
  <span class="banner-icon">${icon('info', 20)}</span>
  <div class="banner-content">
    <strong><span class="lang-fr">Pré-version (v0.x)</span><span class="lang-en">Pre-release (v0.x)</span></strong>
    <span>
      <span class="lang-fr">Aujourd'hui, Agentica se consomme directement depuis le dépôt (tokens compilés + Web Components). La publication sur <strong>npm est à venir</strong> — les commandes <code>npm</code> ci-dessous décrivent la trajectoire cible.</span>
      <span class="lang-en">Today, Agentica is consumed directly from the repository (compiled tokens + Web Components). Publishing to <strong>npm is coming</strong> — the <code>npm</code> commands below describe the target path.</span>
    </span>
  </div>
</div>

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

<div class="agtc-banner brand" role="note">
  <span class="banner-icon">${icon('shield-check', 20)}</span>
  <div class="banner-content">
    <strong><span class="lang-fr">La règle d'or</span><span class="lang-en">The golden rule</span></strong>
    <span>
      <span class="lang-fr">Jamais de valeur en dur. Toujours via un token sémantique. Cette indirection est ce qui rend vos décisions applicables par des agents IA — sans interprétation. <a href="tokens/index.html">Voir les trois niveaux →</a></span>
      <span class="lang-en">Never a hardcoded value. Always through a semantic token. This indirection is what makes your decisions applicable by AI agents — without interpretation. <a href="tokens/index.html">See the three levels →</a></span>
    </span>
  </div>
</div>

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
    body,
  }));
}

// ─── PAGE: CHANGELOG ────────────────────────────────────────────────────────
function buildChangelog() {
  const body = `
<h1>Changelog</h1>
<p class="page-lead">
  <span class="lang-fr">Historique des versions d'Agentica — chaque entrée décrit les changements, décisions et améliorations apportées au système.</span>
  <span class="lang-en">Agentica version history — each entry describes the changes, decisions, and improvements made to the system.</span>
</p>

<div class="changelog-entry">
  <div class="changelog-header">
    <span class="changelog-version">v0.1.0</span>
    <span class="changelog-badge unreleased"><span class="lang-fr">Non lancée</span><span class="lang-en">Unreleased</span></span>
    <span class="changelog-date">2026</span>
  </div>
  <h2 class="first"><span class="lang-fr">Fondations</span><span class="lang-en">Foundations</span></h2>
  <ul>
    <li><span class="lang-fr">Architecture de tokens 3 niveaux : primitifs → sémantiques → composant (DTCG-conforme)</span><span class="lang-en">3-layer token architecture: primitives → semantic → component (DTCG-compliant)</span></li>
    <li><span class="lang-fr">Palette de couleurs Radix UI (échelles 12 niveaux), espacement grille 4px, typographie Atkinson Hyperlegible</span><span class="lang-en">Radix UI color palette (12-step scales), 4px spacing grid, Atkinson Hyperlegible typography</span></li>
    <li><span class="lang-fr">Bibliothèque d'icônes Lucide — 1 500+ icônes, 3 tailles, contrats d'accessibilité WCAG 1.1.1</span><span class="lang-en">Lucide icon library — 1,500+ icons, 3 sizes, WCAG 1.1.1 accessibility contracts</span></li>
  </ul>
  <h2><span class="lang-fr">Composants</span><span class="lang-en">Components</span></h2>
  <ul>
    <li><span class="lang-fr">14 Web Components (Lit) : Button, Input, Badge, Card, Checkbox, Radio, Toggle, Table, Code Block, Banner, Link, Icon, Segmented, Get Started</span><span class="lang-en">14 Web Components (Lit): Button, Input, Badge, Card, Checkbox, Radio, Toggle, Table, Code Block, Banner, Link, Icon, Segmented, Get Started</span></li>
    <li><span class="lang-fr">Variantes Button : primary, secondary, ghost, critical — avec règles de confirmation pour les actions irréversibles</span><span class="lang-en">Button variants: primary, secondary, ghost, critical — with confirmation rules for irreversible actions</span></li>
    <li><span class="lang-fr">Tokens de composant institutionnels dans <code>tokens/component.json</code></span><span class="lang-en">Institutional component tokens in <code>tokens/component.json</code></span></li>
  </ul>
  <h2><span class="lang-fr">Gouvernance & Agents</span><span class="lang-en">Governance & Agents</span></h2>
  <ul>
    <li><span class="lang-fr">52 ADRs (Architecture Decision Records) — toutes les décisions tracées et justifiées</span><span class="lang-en">52 ADRs (Architecture Decision Records) — all decisions traced and justified</span></li>
    <li><span class="lang-fr">4 types d'agents IA : Designer, Developer, QA, Documentation</span><span class="lang-en">4 AI agent types: Designer, Developer, QA, Documentation</span></li>
    <li><span class="lang-fr">Conformité WCAG 2.1 AA — audit intégré, 0 violation critique</span><span class="lang-en">WCAG 2.1 AA compliance — built-in audit, 0 critical violations</span></li>
    <li><span class="lang-fr">Pipeline qualité complet : tokens-audit, WCAG, UX patterns, ADR, docs, site rebuild</span><span class="lang-en">Full quality pipeline: tokens-audit, WCAG, UX patterns, ADR, docs, site rebuild</span></li>
  </ul>
  <h2><span class="lang-fr">Site & Documentation</span><span class="lang-en">Site & Documentation</span></h2>
  <ul>
    <li><span class="lang-fr">Générateur de site statique sur-mesure (Node.js), bilingue FR/EN</span><span class="lang-en">Custom static site generator (Node.js), bilingual FR/EN</span></li>
    <li><span class="lang-fr">Storybook publié sur Chromatic — canvas interactif, previews, specs</span><span class="lang-en">Storybook published on Chromatic — interactive canvas, previews, specs</span></li>
    <li><span class="lang-fr">Sync Figma ↔ JSON via Tokens Studio</span><span class="lang-en">Figma ↔ JSON sync via Tokens Studio</span></li>
  </ul>
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

  const dateStr = r.timestamp.toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  const dateStrEn = r.timestamp.toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
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
      <td style="color:var(--agtc-semantic-color-text-secondary);font-size:0.8rem">≥ ${c.required}:1</td>
      <td style="font-size:0.825rem">${c.label}</td>
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
    const rows = r.allViolations.map(v =>
      `<li style="padding:8px 0;border-bottom:1px solid var(--agtc-semantic-color-border-default);font-size:0.85rem">
        <strong>SC ${v.criterion}</strong> — ${esc(v.msg)}
        <span style="color:var(--agtc-semantic-color-text-secondary);margin-left:8px;font-size:0.8rem">${v.file}</span>
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
<div class="audit-hero">
  <div class="audit-badge ${badgeCls}">
    ${icon(badgeIconName, 20)}
    <span class="lang-fr">${passing ? 'Conforme WCAG 2.2 AA' : `${r.totalViolations} violation${r.totalViolations > 1 ? 's' : ''} détectée${r.totalViolations > 1 ? 's' : ''}`}</span>
    <span class="lang-en">${passing ? 'WCAG 2.2 AA Compliant' : `${r.totalViolations} violation${r.totalViolations > 1 ? 's' : ''} detected`}</span>
  </div>
  <p class="audit-meta">
    <span class="lang-fr">${r.pageCount} pages · ${r.totalPassed} vérifications réussies · analyse statique</span>
    <span class="lang-en">${r.pageCount} pages · ${r.totalPassed} checks passed · static analysis</span>
  </p>
  <p class="audit-date">
    <span class="lang-fr">Généré le ${dateStr}</span>
    <span class="lang-en">Generated on ${dateStrEn}</span>
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

  write(path.join(DIST, 'tokens.css'), tokensCSS());
  write(path.join(DIST, 'site.css'), siteCSS());
  write(path.join(DIST, 'site.js'), siteJS());

  // Copie de l'image sociale (OG image)
  const socialSrc = path.join(__dirname, '..', 'Brand', 'Agentica social image.jpg');
  const socialDst = path.join(DIST, 'social.jpg');
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
  buildTokens();
  buildDecisionsIndex(adrs);
  adrs.forEach(adr => buildADR(adr, adrs));
  buildAgents();
  buildAudit();  // doit être appelé en dernier — analyse les pages déjà générées

  validateCssVars();  // garde-fou : aucune var(--agtc-…) orpheline dans la sortie

  const total = 18 + adrs.length;
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
