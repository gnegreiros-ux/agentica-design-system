#!/usr/bin/env node
'use strict';

// ─── SETUP ─────────────────────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const DIST       = path.join(__dirname, 'dist');
const TOKENS_DIR = path.join(ROOT, 'tokens');
const DEC_DIR    = path.join(ROOT, 'decisions');

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
    .replace(/`([^`]+)`/g,'<code>$1</code>')
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
      out.push(`<table><thead><tr>${pr(rows[0],'th')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${pr(r,'td')}</tr>`).join('')}</tbody></table>`);
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
    if (node && typeof node === 'object' && 'value' in node) {
      result[k] = resolveValue(node.value, data);
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
};

// ─── CSS ───────────────────────────────────────────────────────────────────
function tokensCSS() {
  const lines = [':root {', '  /* ── Primitive colors — Radix UI ── */'];
  for (const [scale, steps] of Object.entries(COLOR_SCALES))
    for (const [step, { value }] of Object.entries(steps))
      lines.push(`  --agtc-primitive-color-${scale}-${step}: ${value};`);
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
:root{--agtc-font-mono:'Atkinson Hyperlegible Mono','JetBrains Mono','Cascadia Code',monospace}

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
  box-shadow:0 2px 24px rgba(0,0,0,.12);
  display:flex;align-items:center;padding:0 24px;gap:20px;
}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex-shrink:0}
.logo-img{height:28px;width:auto;flex-shrink:0;display:block}
.logo-version{font-size:11px;color:var(--agtc-semantic-color-text-secondary);background:var(--agtc-semantic-color-background-subtle);padding:2px 8px;border-radius:20px;font-weight:500}
.top-nav{display:flex;gap:2px;margin-left:auto}
.top-nav a{
  text-decoration:none;color:var(--agtc-semantic-color-text-secondary);font-size:0.875rem;
  padding:6px 12px;border-radius:var(--agtc-semantic-radius-control);font-weight:500;
  transition:background .12s,color .12s;
}
.top-nav a:hover,.top-nav a.active{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.top-nav a.active{color:var(--agtc-semantic-color-action-primary)}

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
  font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  color:var(--agtc-semantic-color-text-secondary);padding:8px 20px 4px;display:block;
}
.sidebar a{
  display:block;padding:6px 20px;text-decoration:none;font-size:0.875rem;
  color:var(--agtc-semantic-color-text-secondary);border-radius:0;
  transition:background .1s,color .1s;border-left:2px solid transparent;
}
.sidebar a:hover{background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-primary)}
.sidebar a.active{
  background:var(--agtc-semantic-color-background-surface);color:var(--agtc-semantic-color-action-primary);
  border-left-color:var(--agtc-semantic-color-action-primary);border-left-width:3px;font-weight:600;
}
.content{flex:1;padding:52px 64px;max-width:960px}

/* ── HOME HERO ──────────────────────────────────────────── */
.home-layout{margin-top:60px}
.hero{padding:80px 72px 56px;max-width:1100px;margin:0 auto}
.hero-badge{
  display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;
  text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-on-action);
  background:var(--agtc-semantic-color-action-primary);padding:4px 14px;border-radius:20px;margin-bottom:24px;
}
.hero h1{font-size:3rem;font-weight:800;line-height:1.08;letter-spacing:-.035em;margin-bottom:20px}
.hero h1 span{color:var(--agtc-semantic-color-action-primary)}
.hero-tagline{font-size:1.25rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.6;max-width:580px;margin-bottom:40px}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}

.stat-band{
  background:#0f1117;
  display:flex;flex-wrap:wrap;
}
.stat-item{
  flex:1;min-width:150px;padding:28px 32px;text-align:center;
  border-right:1px solid rgba(255,255,255,.08);
}
.stat-item:last-child{border-right:none}
.stat-num{font-size:2.5rem;font-weight:800;color:var(--agtc-semantic-color-action-primary);display:block;letter-spacing:-.02em}
.stat-text{font-size:0.875rem;color:rgba(255,255,255,.5);margin-top:4px;display:block}

.home-section{padding:64px 72px;max-width:1100px;margin:0 auto}
.home-section h2{font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin-bottom:8px}
.home-section > p{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);margin-bottom:32px;line-height:1.7}

/* ── NAV CARDS ───────────────────────────────────────────── */
.nav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
.nav-card{
  background:var(--agtc-semantic-color-background-surface);
  border:1px solid var(--agtc-semantic-color-border-default);
  border-radius:var(--agtc-semantic-radius-card);
  padding:24px;text-decoration:none;color:inherit;
  transition:border-color .15s,box-shadow .15s,transform .1s;display:block;
}
.nav-card:hover{border-color:var(--agtc-semantic-color-action-primary);box-shadow:0 4px 16px rgba(13,116,206,.1);transform:translateY(-1px)}
.nav-card-icon{width:32px;height:32px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:var(--agtc-semantic-color-action-primary)}.nav-card-icon svg{width:32px;height:32px}
.nav-card-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:6px}
.nav-card-desc{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.55}
.icon-ok{color:#1a7f37;display:inline-flex;vertical-align:middle;margin-right:4px}
.icon-no{color:#ce2c31;display:inline-flex;vertical-align:middle;margin-right:4px}
.icon-ok svg,.icon-no svg{display:inline;vertical-align:middle}
.badge .icon-ok,.badge .icon-no{margin-right:3px}
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
.pipeline-example{font-family:var(--agtc-font-mono);font-size:11.5px;color:var(--agtc-semantic-color-action-primary);margin-top:10px;background:#fff;padding:6px 10px;border-radius:4px;border:1px solid var(--agtc-semantic-color-border-default)}

/* ── PRINCIPLE CARDS ─────────────────────────────────────── */
.principle-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin:24px 0}
.principle-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:22px}
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
pre.code-block{background:#1a1e24;border-radius:var(--agtc-semantic-radius-card);padding:22px 26px;overflow-x:auto;margin:18px 0;position:relative}
pre.code-block code{background:none;color:#c9d1d9;font-size:0.875rem;padding:0;border-radius:0}

blockquote{border-left:3px solid var(--agtc-semantic-color-action-primary);padding:14px 20px;margin:20px 0;background:var(--agtc-semantic-color-background-subtle);border-radius:0 var(--agtc-semantic-radius-control) var(--agtc-semantic-radius-control) 0}
blockquote p{margin:0;font-style:italic;color:var(--agtc-semantic-color-text-primary)}

hr{border:none;border-top:1px solid var(--agtc-semantic-color-border-default);margin:32px 0}

ul,ol{padding-left:22px;margin:12px 0}
li{margin-bottom:6px;color:var(--agtc-semantic-color-text-secondary);line-height:1.65}
li code{font-size:.8em}

/* ── TABLES ─────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:0.875rem}
th{text-align:left;padding:10px 16px;background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-secondary);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
td{padding:12px 16px;border-bottom:1px solid var(--agtc-semantic-color-border-default);color:var(--agtc-semantic-color-text-secondary);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--agtc-semantic-color-background-hover)}
td code{color:var(--agtc-semantic-color-action-primary)}

/* ── COLOR SYSTEM ───────────────────────────────────────── */
.semantic-colors{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:24px 0}
.color-token{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:16px;display:flex;align-items:center;gap:14px}
.color-swatch{width:44px;height:44px;display:inline-block;border-radius:var(--agtc-semantic-radius-control);border:1px solid rgba(0,0,0,.08);flex-shrink:0}
.color-info{}
.color-name{font-family:var(--agtc-font-mono);font-size:12px;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:3px}
.color-value{font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary)}
.color-intent{font-size:11.5px;color:var(--agtc-semantic-color-text-secondary);margin-top:4px}

.palette-section{margin:40px 0}
.palette-scale-name{font-size:0.875rem;font-weight:700;text-transform:capitalize;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.palette-steps{display:grid;grid-template-columns:repeat(12,1fr);gap:4px}
.palette-step{height:48px;border-radius:4px;cursor:default;position:relative}
.palette-step:hover::after{content:attr(title);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#1a1e24;color:#fff;font-size:10px;padding:4px 8px;border-radius:4px;white-space:nowrap;z-index:10;font-family:var(--agtc-font-mono);pointer-events:none}

/* ── SPACING ────────────────────────────────────────────── */
.space-demo{display:flex;flex-direction:column;gap:6px;margin:28px 0}
.space-item{display:flex;align-items:center;gap:12px}
.space-bar{background:#fca5a5;border-radius:3px;height:20px;min-width:4px;flex-shrink:0}
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

.ds-btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:var(--agtc-component-button-primary-padding-y) var(--agtc-component-button-primary-padding-x);
  border-radius:var(--agtc-component-button-primary-radius);
  font-size:0.875rem;font-weight:500;font-family:inherit;cursor:pointer;
  border:1.5px solid transparent;transition:background .12s,color .12s,border-color .12s;line-height:1.4;
}
.ds-btn:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
.ds-btn:disabled{cursor:not-allowed;opacity:.45}
.ds-btn.primary{background:var(--agtc-component-button-primary-background);color:var(--agtc-component-button-primary-text);border-color:var(--agtc-component-button-primary-background)}
.ds-btn.primary:hover:not(:disabled){background:var(--agtc-component-button-primary-background-hover);border-color:var(--agtc-component-button-primary-background-hover)}
.ds-btn.secondary{background:var(--agtc-component-button-secondary-background);color:var(--agtc-component-button-secondary-text);border-color:var(--agtc-component-button-secondary-border)}
.ds-btn.secondary:hover:not(:disabled){background:var(--agtc-component-button-secondary-background-hover)}
.ds-btn.ghost{background:var(--agtc-component-button-ghost-background);color:var(--agtc-component-button-ghost-text);border-color:transparent}
.ds-btn.ghost:hover:not(:disabled){background:var(--agtc-component-button-ghost-background-hover)}
.ds-btn.critical{background:var(--agtc-component-button-critical-background);color:var(--agtc-component-button-critical-text);border-color:var(--agtc-component-button-critical-border)}
.ds-btn.critical:hover:not(:disabled){background:var(--agtc-component-button-critical-background-hover);color:var(--agtc-component-button-critical-border)}

.variant-tag{display:inline-flex;align-items:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:4px;background:var(--agtc-semantic-color-background-subtle);color:var(--agtc-semantic-color-text-secondary)}

/* ── TOKEN EXPLORER ─────────────────────────────────────── */
.explorer-search{
  width:100%;max-width:480px;padding:10px 14px;
  border:1.5px solid var(--agtc-semantic-color-border-default);
  border-radius:var(--agtc-semantic-radius-control);
  font-size:0.875rem;background:var(--agtc-semantic-color-background-surface);
  color:var(--agtc-semantic-color-text-primary);font-family:inherit;margin-bottom:20px;
}
.explorer-search:focus{outline:none;border-color:var(--agtc-semantic-color-border-focus)}
.explorer-tabs{display:flex;gap:2px;border-bottom:2px solid var(--agtc-semantic-color-border-default);margin-bottom:20px}
.exp-tab{
  padding:8px 20px;font-size:0.875rem;font-weight:600;color:var(--agtc-semantic-color-text-secondary);
  border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;
  margin-bottom:-2px;font-family:inherit;transition:color .1s;
}
.exp-tab.active{color:var(--agtc-semantic-color-action-primary);border-bottom-color:var(--agtc-semantic-color-action-primary)}
.exp-panel{display:none}
.exp-panel.active{display:block}
.token-row td:first-child code{color:var(--agtc-semantic-color-action-primary)}
.token-table{table-layout:fixed}
.token-table td,.token-table th{overflow-wrap:break-word;word-break:break-word}

/* ── DECISIONS ──────────────────────────────────────────── */
.adr-num{font-family:var(--agtc-font-mono);font-size:12px;color:var(--agtc-semantic-color-text-secondary)}
.adr-title a{color:var(--agtc-semantic-color-action-primary);text-decoration:none;font-weight:600}
.adr-title a:hover{text-decoration:underline}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;padding:2px 10px;border-radius:20px}
.badge-active{background:#ecfdf5;color:#18794e}
.adr-meta{background:var(--agtc-semantic-color-background-subtle);border-radius:var(--agtc-semantic-radius-card);padding:16px 20px;margin-bottom:36px;display:flex;gap:24px;flex-wrap:wrap;font-size:0.875rem}
.adr-meta strong{color:var(--agtc-semantic-color-text-primary)}

/* ── AGENTS ──────────────────────────────────────────────── */
.agent-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.agent-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.agent-type{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:6px}
.agent-name{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:8px}
.agent-desc{font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);line-height:1.5}
.rules-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
.rule-can,.rule-cannot{padding:20px;border-radius:var(--agtc-semantic-radius-card);border:1px solid}
.rule-can{background:#ecfdf5;border-color:#bbf7d0}
.rule-cannot{background:#fef2f2;border-color:#fecaca}
.rule-can h3{color:var(--agtc-semantic-color-feedback-success);margin-top:0;font-size:0.875rem}
.rule-cannot h3{color:var(--agtc-semantic-color-feedback-danger);margin-top:0;font-size:0.875rem}
.rule-can li{color:var(--agtc-semantic-color-feedback-success);font-size:0.875rem}
.rule-cannot li{color:var(--agtc-semantic-color-feedback-danger);font-size:0.875rem}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media(max-width:768px){
  .layout{flex-direction:column}
  .sidebar{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
  .content{padding:28px 20px}
  .hero{padding:40px 20px 32px}
  .hero h1{font-size:2rem}
  .home-section{padding:40px 20px}
  .pipeline{flex-direction:column}
  .pipeline-step+.pipeline-step{border-left:none;border-top:1px solid var(--agtc-semantic-color-border-default)}
  .rules-split{grid-template-columns:1fr}
  .top-nav{display:none}
}

/* ── ACCESSIBILITY ───────────────────────────────────────── */
*:focus-visible{outline:2px solid var(--agtc-semantic-color-border-focus);outline-offset:2px}
a{color:var(--agtc-semantic-color-action-primary)}
.skip-link{position:absolute;top:-40px;left:8px;background:var(--agtc-semantic-color-action-primary);color:#fff;padding:8px 16px;border-radius:4px;font-size:0.875rem;font-weight:600;text-decoration:none;z-index:1000}
.skip-link:focus{top:8px}

/* ── LANG TOGGLE ─────────────────────────────────────────── */
.lang-toggle-group{display:flex;gap:2px;margin-left:8px;flex-shrink:0}
.lang-btn{padding:3px 9px;font-size:11.5px;font-weight:700;border-radius:4px;border:1.5px solid var(--agtc-semantic-color-border-default);background:none;color:var(--agtc-semantic-color-text-secondary);cursor:pointer;font-family:inherit;transition:background .12s,color .12s,border-color .12s;letter-spacing:.04em}
.lang-btn.active{background:var(--agtc-semantic-color-action-primary);color:#fff;border-color:var(--agtc-semantic-color-action-primary)}
html[data-lang="fr"] .lang-en{display:none}
html[data-lang="en"] .lang-fr{display:none}

/* ── MOBILE MENU ─────────────────────────────────────────── */
.menu-toggle{display:none;background:none;border:none;cursor:pointer;padding:4px;color:var(--agtc-semantic-color-text-primary);border-radius:4px}
.menu-toggle:hover{background:var(--agtc-semantic-color-background-subtle)}

/* ── TOC ─────────────────────────────────────────────────── */
.toc{width:208px;flex-shrink:0;padding:20px 16px;position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;border-left:1px solid var(--agtc-semantic-color-border-default);background:var(--agtc-semantic-color-background-surface)}
.toc:empty{display:none;width:0;padding:0;border:none}
.toc-title{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--agtc-semantic-color-text-secondary);margin-bottom:10px;display:block}
.toc a{display:block;font-size:12.5px;color:var(--agtc-semantic-color-text-secondary);text-decoration:none;padding:4px 0 4px 10px;border-left:2px solid transparent;margin-left:-2px;line-height:1.4;transition:color .1s,border-color .1s}
.toc a:hover,.toc a.active{color:var(--agtc-semantic-color-action-primary);border-left-color:var(--agtc-semantic-color-action-primary)}

/* ── DO / DON'T ──────────────────────────────────────────── */
.dos-donts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.do-section,.dont-section{padding:20px;border-radius:var(--agtc-semantic-radius-card);border:1px solid}
.do-section{background:#f0fdf4;border-color:#86efac}
.dont-section{background:#fef2f2;border-color:#fecaca}
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
.site-footer{background:#0f1117;color:rgba(255,255,255,.55);padding:24px 32px;font-size:0.875rem;margin-top:auto}
.footer-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-links{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
.footer-links a{color:rgba(255,255,255,.75);text-decoration:none;display:inline-flex;align-items:center;gap:5px;transition:color .12s}
.footer-links a:hover{color:#fff}
.footer-credit{font-size:0.75rem;color:rgba(255,255,255,.35);display:flex;align-items:center;gap:6px}

/* ── INFO CARDS ──────────────────────────────────────────── */
.info-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:20px}
.info-card-icon{color:var(--agtc-semantic-color-action-primary);margin-bottom:8px}
.info-card-title{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary);margin-bottom:4px}
.info-card-body{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary)}

/* ── TOOL CARDS ──────────────────────────────────────────── */
.tool-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:16px;display:flex;gap:12px;align-items:flex-start}
.tool-card-icon{color:var(--agtc-semantic-color-action-primary);flex-shrink:0;margin-top:2px}
.tool-card-name{font-size:0.875rem;font-weight:700;color:var(--agtc-semantic-color-text-primary)}
.tool-card-role{font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);font-weight:400}
.tool-card-desc{font-size:0.75rem;color:var(--agtc-semantic-color-text-secondary);margin-top:3px}

/* ── STEP CARDS ──────────────────────────────────────────── */
.step-card{background:var(--agtc-semantic-color-background-surface);border:1px solid var(--agtc-semantic-color-border-default);border-radius:var(--agtc-semantic-radius-card);padding:16px}
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

/* ── CONTRIBUTION BANNER ─────────────────────────────────── */
.contribution-banner{display:flex;align-items:center;gap:16px;background:var(--agtc-semantic-color-background-subtle);border:1px solid var(--agtc-semantic-color-border-default);border-left:3px solid var(--agtc-semantic-color-action-primary);border-radius:0 var(--agtc-semantic-radius-card) var(--agtc-semantic-radius-card) 0;padding:16px 20px;margin:56px 0 0}
.contribution-banner .contrib-icon{color:var(--agtc-semantic-color-action-primary);flex-shrink:0}
.contribution-banner .contrib-body{flex:1}
.contribution-banner .contrib-body strong{color:var(--agtc-semantic-color-text-primary);font-size:0.875rem;display:block;margin-bottom:3px}
.contribution-banner .contrib-body span{font-size:0.875rem;color:var(--agtc-semantic-color-text-secondary);line-height:1.55}
@media(max-width:768px){.contribution-banner{flex-direction:column;align-items:flex-start}}

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
@media(max-width:768px){
  .menu-toggle{display:flex;align-items:center}
  .top-nav{display:none;position:fixed;top:60px;left:0;right:0;background:var(--agtc-semantic-color-background-surface);border-bottom:1px solid var(--agtc-semantic-color-border-default);flex-direction:column;padding:8px 0;z-index:99;box-shadow:0 4px 16px rgba(0,0,0,.1)}
  .top-nav.open{display:flex}
  .top-nav a{padding:12px 24px;border-radius:0;font-size:0.875rem}
  .dos-donts{grid-template-columns:1fr}
  .token-tiles{grid-template-columns:1fr}
  .agent-grid{grid-template-columns:1fr}
  .stack-flow{flex-direction:column}
  .stack-node{border-right:none;border-bottom:1px solid var(--agtc-semantic-color-border-default)}
  .footer-inner{flex-direction:column;align-items:flex-start}
}
`; }

function siteJS() { return `
document.addEventListener('DOMContentLoaded', () => {

  // ── Language toggle ─────────────────────────────────────
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const savedLang = urlLang || localStorage.getItem('agtc-lang') || 'fr';
  document.documentElement.setAttribute('data-lang', savedLang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === savedLang) btn.classList.add('active');
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem('agtc-lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState({}, '', url.toString());
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    });
  });

  // ── Mobile menu ──────────────────────────────────────────
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

  // ── Active nav links ─────────────────────────────────────
  const p = window.location.pathname;
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    if (h !== 'index.html' && p.includes(h.split('/').pop().replace('.html',''))) a.classList.add('active');
    if (p.endsWith('index.html') && h === 'index.html') a.classList.add('active');
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
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.token-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // ── Copy buttons on code blocks ──────────────────────────
  document.querySelectorAll('pre.code-block').forEach(pre => {
    const btn = document.createElement('button');
    Object.assign(btn.style, {position:'absolute',top:'12px',right:'12px',background:'rgba(255,255,255,.1)',color:'#8b949e',border:'none',padding:'4px 10px',borderRadius:'4px',fontSize:'11px',cursor:'pointer',fontFamily:'inherit'});
    btn.textContent = 'Copier';
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
      btn.textContent = 'Copié !';
      setTimeout(() => btn.textContent = 'Copier', 1600);
    });
  });
});
`; }

// ─── HTML LAYOUT ───────────────────────────────────────────────────────────
function layout({ title, pageTitle, depth = 0, section = '', sidebar = null, body, fullWidth = false }) {
  const docTitle = pageTitle || `${title} — Agentica`;
  const base = depth > 0 ? '../' : '';
  const navLinks = [
    { href: `${base}index.html`,            labelFr: 'Accueil',     labelEn: 'Home' },
    { href: `${base}foundations/color.html`,labelFr: 'Fondations',  labelEn: 'Foundations' },
    { href: `${base}components/index.html`, labelFr: 'Composants',  labelEn: 'Components' },
    { href: `${base}tokens/index.html`,     labelFr: 'Tokens',      labelEn: 'Tokens' },
    { href: `${base}decisions/index.html`,  labelFr: 'Décisions',   labelEn: 'Decisions' },
    { href: `${base}agents/index.html`,     labelFr: 'Agents',      labelEn: 'Agents' },
  ];
  const nav = navLinks.map(n =>
    `<a href="${n.href}"><span class="lang-fr">${n.labelFr}</span><span class="lang-en">${n.labelEn}</span></a>`
  ).join('');

  const sidebarHtml = sidebar
    ? `<aside class="sidebar" role="navigation" aria-label="Navigation secondaire">${sidebar}</aside>`
    : '';
  const tocHtml = !fullWidth ? `<nav class="toc" id="page-toc" aria-label="Table des matières"></nav>` : '';
  const mainClass = fullWidth ? 'home-layout' : 'layout';

  const footer = `
<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">
    <div class="footer-links">
      <span>© ${new Date().getFullYear()}</span>
      <a href="https://gnegreiros.com" target="_blank" rel="noopener noreferrer">${icon('globe', 15)} Guilherme Negreiros</a>
      <a href="https://www.linkedin.com/in/gnegreiros/" target="_blank" rel="noopener noreferrer">${icon('linkedin', 15)} LinkedIn</a>
    </div>
    <div class="footer-credit">
      ${icon('bot', 14)}
      <span class="lang-fr">Développé avec Claude Code</span>
      <span class="lang-en">Built with Claude Code</span>
    </div>
  </div>
</footer>`;

  return `<!DOCTYPE html>
<html lang="fr" data-lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Agentica — système de design conçu pour les humains qui décident et les agents IA qui exécutent. Tokens, composants, gouvernance et WCAG 2.1.">
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
    <img src="${base}logo.svg" alt="Agentica" class="logo-img" height="28" width="125">
  </a>
  <span class="logo-version">v1.0.0</span>
  <nav class="top-nav" aria-label="Navigation principale">${nav}</nav>
  <div class="lang-toggle-group" role="group" aria-label="Language">
    <button class="lang-btn" data-lang="fr" aria-pressed="true">FR</button>
    <button class="lang-btn" data-lang="en" aria-pressed="false">EN</button>
  </div>
  <button class="menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="main-nav">
    ${icon('menu', 22)}
  </button>
</header>
<div class="${mainClass}" id="main-content">
  ${sidebarHtml}
  <main class="${fullWidth ? '' : 'content'}" role="main">${body}</main>
  ${tocHtml}
</div>
${footer}
<script src="${base}site.js"></script>
</body>
</html>`;
}

function sidebarFoundations(base, current) {
  const links = [
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

function contributionBanner() {
  return `
<div class="contribution-banner">
  <div class="contrib-icon">${icon('github', 22)}</div>
  <div class="contrib-body">
    <strong><span class="lang-fr">Contribuer à ce projet</span><span class="lang-en">Contribute to this project</span></strong>
    <span class="lang-fr">Ce système est ouvert aux contributions — tokens, composants, décisions architecturales, corrections d'accessibilité ou documentation. Toute amélioration est bienvenue.</span>
    <span class="lang-en">This system welcomes contributions — tokens, components, architectural decisions, accessibility fixes, or documentation. Every improvement counts.</span>
  </div>
  <a href="https://github.com/gnegreiros-ux/agentic-design-system" target="_blank" rel="noopener noreferrer" class="ds-btn secondary" style="font-size:12px;white-space:nowrap;flex-shrink:0">
    <span class="lang-fr">Voir sur GitHub →</span>
    <span class="lang-en">View on GitHub →</span>
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
    [icon('check-circle',20),'Validation',     'Validation',     'axe-core'],
    [icon('shield-check',20),'Audit',          'Audit',          'Chromatic'],
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
  <div class="hero-badge">Agentica · v1.0.0</div>
  <h1>
    <span class="lang-fr">Les humains décident.<br><span>Les agents exécutent.<br>Le système garantit.</span></span>
    <span class="lang-en">Humans decide.<br><span>Agents execute.<br>The system ensures.</span></span>
  </h1>
  <p class="hero-tagline">
    <span class="lang-fr">Agentica transforme votre système de design en infrastructure opérationnelle. Les décisions sont encodées, les dérives détectées automatiquement, la documentation se maintient elle-même. Stack agnostique, souverain, auditable.</span>
    <span class="lang-en">Agentica turns your design system into operational infrastructure. Decisions are encoded, drift is detected automatically, documentation maintains itself. Stack agnostic, sovereign, auditable.</span>
  </p>
  <div class="hero-actions">
    <a href="foundations/color.html" class="ds-btn primary">
      <span class="lang-fr">Explorer les fondations</span>
      <span class="lang-en">Explore foundations</span>
    </a>
    <a href="components/index.html" class="ds-btn secondary">
      <span class="lang-fr">Voir les composants</span>
      <span class="lang-en">View components</span>
    </a>
    <a href="agents/index.html" class="ds-btn ghost">
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
</div>

<div class="stat-band" role="region" aria-label="Statistiques du système">
  <div class="stat-item">
    <span class="stat-num" data-count="21">21</span>
    <span class="stat-text">WCAG 2.1 AA</span>
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

<div class="home-section">
  <h2>
    <span class="lang-fr">Pipeline de tokens</span>
    <span class="lang-en">Token pipeline</span>
  </h2>
  <p>
    <span class="lang-fr">Trois niveaux ordonnés, chacun avec un rôle précis. Les agents comprennent la fonction, pas la valeur brute.</span>
    <span class="lang-en">Three ordered levels, each with a precise role. Agents understand function, not raw values.</span>
  </p>
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
  <p><a href="decisions/index.html" class="ds-btn secondary">
    <span class="lang-fr">Voir les ${adrs.length} ADRs →</span>
    <span class="lang-en">View all ${adrs.length} ADRs →</span>
  </a></p>
</div>

<div class="home-section">
  <h2>
    <span class="lang-fr">Stack technique</span>
    <span class="lang-en">Technical stack</span>
  </h2>
  <p>
    <span class="lang-fr">Chaque couche du pipeline est outillée. Les Web Components garantissent la portabilité — un même composant fonctionne dans n'importe quel framework (React, Vue, Angular, ou aucun).</span>
    <span class="lang-en">Every layer of the pipeline is tooled. Web Components guarantee portability — the same component works in any framework (React, Vue, Angular, or none).</span>
  </p>
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
      [icon('layers',18),'Lit (Google)','Web Components','Contrats UI universels, framework-agnostic','Universal UI contracts, framework-agnostic'],
      [icon('palette',18),'Style Dictionary','Token compilation','JSON → CSS, JS, Swift, Android','JSON → CSS, JS, Swift, Android'],
      [icon('camera',18),'Chromatic','Visual testing','Régressions visuelles, PR previews','Visual regressions, PR previews'],
      [icon('accessibility',18),'axe-core','Accessibility','Audit automatique WCAG','Automatic WCAG audit'],
      [icon('test-tube',18),'Playwright','E2E tests','Parcours complets automatisés','Automated end-to-end flows'],
      [icon('book-open',18),'Storybook','Documentation','Canvas + previews + specs','Canvas + previews + specs'],
    ].map(([ico,name,role,dFr,dEn]) => `
    <div class="tool-card">
      <div class="tool-card-icon">${ico}</div>
      <div>
        <div class="tool-card-name">${name} <span class="tool-card-role">— ${role}</span></div>
        <div class="tool-card-desc"><span class="lang-fr">${dFr}</span><span class="lang-en">${dEn}</span></div>
      </div>
    </div>`).join('')}
  </div>
</div>
`;

  write(path.join(DIST, 'index.html'), layout({ title: 'Accueil', pageTitle: 'Agentica — Système de design pour humains et agents IA', depth: 0, fullWidth: true, body }));
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
      `<div class="palette-step" style="background:${value}" title="${step}: ${value} — ${desc}" aria-label="Étape ${step}: ${value}"></div>`
    ).join('');
    return `<div class="palette-section"><div class="palette-scale-name">${scale}</div><div class="palette-steps">${swatches}</div></div>`;
  }).join('');

  const semRows = semanticColors.map(([key, name, value, intent]) => `
<tr class="token-row">
  <td><div class="color-chip"><span class="color-swatch" style="background:${value};border:1px solid rgba(0,0,0,.08)" aria-hidden="true"></span></div></td>
  <td><code>--agtc-semantic-${key}</code></td>
  <td style="font-family:var(--agtc-font-mono);font-size:12px">${value}</td>
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
    `<div class="space-item"><div class="space-label"><code>space.${step}</code></div><div class="space-bar" style="width:${px}" aria-label="${px}"></div><strong style="font-family:var(--agtc-font-mono);font-size:12px;color:var(--agtc-semantic-color-text-secondary)">${px}</strong>${label ? `<span style="font-size:11px;color:var(--agtc-semantic-color-text-secondary);margin-left:4px">${label}</span>` : ''}</div>`
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
    --agtc-semantic-color-action-primary: #12A594;<br>
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
  <span class="lang-fr">Voir le contrat complet du Web Component : <a href="../components/icon.html">ds-icon →</a></span>
  <span class="lang-en">See the full Web Component contract: <a href="../components/icon.html">ds-icon →</a></span>
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
  <div class="nav-card" style="opacity:.5;cursor:default;pointer-events:none">
    <span class="nav-card-icon">${icon('pen-line',32)}</span>
    <div class="nav-card-title">Input <span class="badge" style="margin-left:6px"><span class="lang-fr">Bientôt</span><span class="lang-en">Soon</span></span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Saisie de données avec états : défaut, focus, erreur, désactivé.</span>
      <span class="lang-en">Data entry with states: default, focus, error, disabled.</span>
    </div>
  </div>
  <div class="nav-card" style="opacity:.5;cursor:default;pointer-events:none">
    <span class="nav-card-icon">${icon('layout-template',32)}</span>
    <div class="nav-card-title">Card <span class="badge" style="margin-left:6px"><span class="lang-fr">Bientôt</span><span class="lang-en">Soon</span></span></div>
    <div class="nav-card-desc">
      <span class="lang-fr">Conteneur visuel pour regrouper des informations liées.</span>
      <span class="lang-en">Visual container for grouping related information.</span>
    </div>
  </div>
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
      <button class="ds-btn primary"><span class="lang-fr">Enregistrer les modifications</span><span class="lang-en">Save changes</span></button>
      <button class="ds-btn primary" disabled><span class="lang-fr">Enregistrer (désactivé)</span><span class="lang-en">Save (disabled)</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Secondary — action alternative</span><span class="lang-en">Secondary — alternative action</span></span>
    <div class="demo-row">
      <button class="ds-btn secondary"><span class="lang-fr">Annuler</span><span class="lang-en">Cancel</span></button>
      <button class="ds-btn secondary" disabled><span class="lang-fr">Annuler (désactivé)</span><span class="lang-en">Cancel (disabled)</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Ghost — action tertiaire, faible emphase</span><span class="lang-en">Ghost — tertiary action, low emphasis</span></span>
    <div class="demo-row">
      <button class="ds-btn ghost"><span class="lang-fr">En savoir plus</span><span class="lang-en">Learn more</span></button>
      <button class="ds-btn ghost" disabled><span class="lang-fr">En savoir plus (désactivé)</span><span class="lang-en">Learn more (disabled)</span></button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label"><span class="lang-fr">Critical — action irréversible (confirmation obligatoire)</span><span class="lang-en">Critical — irreversible action (confirmation required)</span></span>
    <div class="demo-row">
      <button class="ds-btn critical"><span class="lang-fr">Supprimer définitivement</span><span class="lang-en">Delete permanently</span></button>
    </div>
  </div>
</div>

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
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td><code>${r}</code></td><td style="font-family:var(--agtc-font-mono);font-size:12px">${v}</td></tr>`).join('')}</tbody>
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

<h2><span class="lang-fr">Implémentation — Lit Web Component</span><span class="lang-en">Implementation — Lit Web Component</span></h2>
<pre class="code-block"><code class="lang-javascript">import { LitElement, html, css } from 'lit';

class DsButton extends LitElement {
  static properties = {
    variant: { type: String }, // 'primary' | 'secondary' | 'critical' | 'ghost'
    disabled: { type: Boolean },
    loading:  { type: Boolean },
  };

  static styles = css\`
    button {
      background: var(--agtc-component-button-primary-background);
      color:      var(--agtc-component-button-primary-text);
      padding:    var(--agtc-component-button-primary-padding-y) var(--agtc-component-button-primary-padding-x);
      border-radius: var(--agtc-component-button-primary-radius);
      font-size:  var(--agtc-semantic-typography-label-size);
      font-weight:var(--agtc-semantic-typography-label-weight);
      border: none; cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--agtc-semantic-color-border-focus);
      outline-offset: 2px;
    }
  \`;
}
customElements.define('ds-button', DsButton);</code></pre>

<h2>DOs et DON'Ts</h2>
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
    body: body + contributionBanner()
  }));
}

// ─── PAGE: ICON ─────────────────────────────────────────────────────────────
function buildIcon() {
  const mdPath = path.join(ROOT, 'guidelines/components/icon.md');
  // Strip frontmatter meta block and fix ds-icon → agtc-icon
  let rawMd = read(mdPath)
    .replace(/\*\*Auteur:\*\*[^\n]*\n/g, '')
    .replace(/\*\*Auteur :\*\*[^\n]*\n/g, '')
    .replace(/ds-icon/g, 'agtc-icon');
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

<h2>DOs et DON'Ts</h2>
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
      `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:10px"><span style="width:40px;height:40px;border-radius:6px;background:${value};border:1px solid rgba(0,0,0,.1);flex-shrink:0" aria-hidden="true"></span><code>--agtc-primitive-color-${scale}-${step}</code></div></td><td style="font-family:var(--agtc-font-mono);font-size:12px">${value}</td><td>${desc}</td></tr>`
    )
  ).join('');

  // Build a full semantic map with alias info
  const semRows = Object.entries(SEM).map(([k, v]) => {
    const isColor = k.startsWith('color-');
    const swatch = isColor ? `<span style="width:40px;height:40px;border-radius:6px;background:${v};border:1px solid rgba(0,0,0,.1);flex-shrink:0;display:inline-block" aria-hidden="true"></span>` : '';
    const aliasNode = getSemanticAlias(k);
    const aliasCell = aliasNode ? `<td style="font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary)">${aliasNode}</td>` : '<td>—</td>';
    return `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:10px">${swatch}<code>--agtc-semantic-${k}</code></div></td>${aliasCell}<td style="font-family:var(--agtc-font-mono);font-size:12px">${v}</td></tr>`;
  }).join('');

  const compRows = Object.entries(COMP).map(([k, v]) => {
    const resolved = resolveCompValue(v);
    const isColor = k.includes('background') || k.includes('text') || k.includes('border');
    const swatch = isColor && resolved.startsWith('#') ? `<span style="width:20px;height:20px;border-radius:3px;background:${resolved};border:1px solid rgba(0,0,0,.1);flex-shrink:0;display:inline-block;margin-right:6px" aria-hidden="true"></span>` : '';
    return `<tr class="token-row"><td><code>--agtc-component-${k}</code></td><td style="font-family:var(--agtc-font-mono);font-size:11px;color:var(--agtc-semantic-color-text-secondary)">${v}</td><td><div style="display:flex;align-items:center">${swatch}<span style="font-family:var(--agtc-font-mono);font-size:12px">${resolved}</span></div></td></tr>`;
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

<input class="explorer-search" type="search" id="token-search" placeholder="Filtrer les tokens (ex: button, color, action…)" aria-label="Rechercher des tokens">

<h2 id="primitifs" class="first"><span class="lang-fr">Tokens primitifs</span><span class="lang-en">Primitive tokens</span></h2>
<p>
  <span class="lang-fr">Valeurs physiques issues de Radix UI. <strong>Jamais utilisées directement dans les composants.</strong></span>
  <span class="lang-en">Physical values from Radix UI. <strong>Never used directly in components.</strong></span>
</p>
<table class="token-table"><colgroup><col style="width:52%"><col style="width:16%"><col style="width:32%"></colgroup><thead><tr><th>Token CSS</th><th><span class="lang-fr">Valeur</span><span class="lang-en">Value</span></th><th><span class="lang-fr">Description</span><span class="lang-en">Description</span></th></tr></thead><tbody>${primRows}</tbody></table>

<h2 id="semantiques"><span class="lang-fr">Tokens sémantiques</span><span class="lang-en">Semantic tokens</span></h2>
<p>
  <span class="lang-fr">Intentions UX — ce que les agents doivent utiliser pour comprendre la fonction, pas la valeur brute.</span>
  <span class="lang-en">UX intentions — what agents must use to understand function, not raw values.</span>
</p>
<table class="token-table"><colgroup><col style="width:48%"><col style="width:32%"><col style="width:20%"></colgroup><thead><tr><th>Token CSS</th><th><span class="lang-fr">Alias (référence)</span><span class="lang-en">Alias (reference)</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead><tbody>${semRows}</tbody></table>

<h2 id="composants"><span class="lang-fr">Tokens de composant</span><span class="lang-en">Component tokens</span></h2>
<p>
  <span class="lang-fr">Contrats institutionnels. Toute modification requiert une approbation formelle.</span>
  <span class="lang-en">Institutional contracts. Any change requires formal approval.</span>
</p>
<table class="token-table"><colgroup><col style="width:45%"><col style="width:35%"><col style="width:20%"></colgroup><thead><tr><th>Token CSS</th><th><span class="lang-fr">Alias sémantique</span><span class="lang-en">Semantic alias</span></th><th><span class="lang-fr">Valeur résolue</span><span class="lang-en">Resolved value</span></th></tr></thead><tbody>${compRows}</tbody></table>
`;

  write(path.join(DIST, 'tokens/index.html'), layout({
    title: 'Tokens', depth: 1,
    sidebar: sidebarFoundations('../','') + sidebarComponents('../','') + sidebarTokens('../',''),
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
  <td><span class="badge badge-active"><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Actif</span><span class="lang-en">Active</span></span></td>
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
  <div class="adr-meta-item"><strong><span class="lang-fr">Statut</span><span class="lang-en">Status</span></strong> <span class="badge badge-active"><span class='icon-ok'>${icon('circle-check', 16)}</span> <span class="lang-fr">Actif</span><span class="lang-en">Active</span></span></div>
  <div class="adr-meta-item"><strong><span class="lang-fr">Date</span><span class="lang-en">Date</span></strong> ${adr.date}</div>
  ${adr.deciders ? `<div class="adr-meta-item"><strong><span class="lang-fr">Décideurs</span><span class="lang-en">Decision makers</span></strong> ${esc(adr.deciders)}</div>` : ''}
</div>`;
  const prev = adrs.find(a => a.num === adr.num - 1);
  const next = adrs.find(a => a.num === adr.num + 1);
  const nav = `<div style="display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid var(--agtc-semantic-color-border-default)">
    ${prev ? `<a href="${prev.slug}.html" class="ds-btn secondary">← ADR-${String(prev.num).padStart(3,'0')}</a>` : '<span></span>'}
    ${next ? `<a href="${next.slug}.html" class="ds-btn secondary">ADR-${String(next.num).padStart(3,'0')} →</a>` : '<span></span>'}
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
    sidebar: sidebarAgents('../'),
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

// ─── MAIN BUILD ─────────────────────────────────────────────────────────────
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

  const adrs = loadADRs();
  buildHome(adrs);
  buildColor();
  buildSpacing();
  buildTypography();
  buildIconsFoundation();
  buildComponentsIndex();
  buildButton();
  buildIcon();
  buildTokens();
  buildDecisionsIndex(adrs);
  adrs.forEach(adr => buildADR(adr, adrs));
  buildAgents();

  const total = 9 + adrs.length;
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
