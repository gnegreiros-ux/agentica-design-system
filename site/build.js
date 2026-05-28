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

// ─── TOKEN DATA ────────────────────────────────────────────────────────────
const primitives = readJson(path.join(TOKENS_DIR, 'primitives.json'));

function extractColorScales(prim) {
  const scales = {};
  const colors = prim?.primitive?.color || {};
  for (const [name, steps] of Object.entries(colors)) {
    if (name === '_readme') continue;
    scales[name] = {};
    for (const [step, data] of Object.entries(steps)) {
      if (data?.$value) scales[name][step] = { value: data.$value, desc: data.$description || '' };
    }
  }
  return scales;
}

const COLOR_SCALES = extractColorScales(primitives);

// Resolved values — semantic references use {color.blue.700} (Tailwind-like notation)
// mapped here to actual Radix values from primitives.json
const SEM = {
  'color-action-primary':          '#0d74ce',
  'color-action-primary-hover':    '#113264',
  'color-action-primary-disabled': '#d9d9d9',
  'color-feedback-danger':         '#ce2c31',
  'color-feedback-danger-subtle':  '#feebec',
  'color-feedback-success':        '#18794e',
  'color-feedback-info':           '#0d74ce',
  'color-background-page':         '#fcfcfc',
  'color-background-surface':      '#ffffff',
  'color-background-subtle':       '#f0f0f0',
  'color-text-primary':            '#202020',
  'color-text-secondary':          '#646464',
  'color-text-disabled':           '#d9d9d9',
  'color-text-on-action':          '#ffffff',
  'color-text-on-danger':          '#ffffff',
  'color-border-default':          '#e8e8e8',
  'color-border-focus':            '#0d74ce',
  'color-border-danger':           '#ce2c31',
  'space-control-padding-x':       '16px',
  'space-control-padding-y':       '8px',
  'space-control-gap':             '8px',
  'space-layout-section':          '32px',
  'space-layout-component':        '20px',
  'radius-control':                '6px',
  'radius-card':                   '10px',
  'typography-body-size':          '16px',
  'typography-body-weight':        '400',
  'typography-body-line-height':   '1.5',
  'typography-label-size':         '14px',
  'typography-label-weight':       '500',
  'typography-label-line-height':  '1.25',
  'typography-heading-size':       '24px',
  'typography-heading-weight':     '700',
  'typography-heading-line-height':'1.25',
};

const COMP = {
  'button-primary-background':          'var(--ds-semantic-color-action-primary)',
  'button-primary-background-hover':    'var(--ds-semantic-color-action-primary-hover)',
  'button-primary-background-disabled': 'var(--ds-semantic-color-action-primary-disabled)',
  'button-primary-text':                'var(--ds-semantic-color-text-on-action)',
  'button-primary-padding-x':           'var(--ds-semantic-space-control-padding-x)',
  'button-primary-padding-y':           'var(--ds-semantic-space-control-padding-y)',
  'button-primary-radius':              'var(--ds-semantic-radius-control)',
  'button-critical-background':         'var(--ds-semantic-color-feedback-danger)',
  'button-critical-background-hover':   'var(--ds-semantic-color-feedback-danger-subtle)',
  'button-critical-text':               'var(--ds-semantic-color-text-on-danger)',
  'button-critical-border':             'var(--ds-semantic-color-feedback-danger)',
  'button-secondary-background':        'transparent',
  'button-secondary-background-hover':  'var(--ds-semantic-color-background-subtle)',
  'button-secondary-text':              'var(--ds-semantic-color-action-primary)',
  'button-secondary-border':            'var(--ds-semantic-color-action-primary)',
  'button-ghost-background':            'transparent',
  'button-ghost-background-hover':      'var(--ds-semantic-color-background-subtle)',
  'button-ghost-text':                  'var(--ds-semantic-color-action-primary)',
  'button-ghost-border':                'transparent',
  'input-default-background':           'var(--ds-semantic-color-background-surface)',
  'input-default-border':               'var(--ds-semantic-color-border-default)',
  'input-default-border-focus':         'var(--ds-semantic-color-border-focus)',
  'input-default-border-error':         'var(--ds-semantic-color-border-danger)',
  'input-default-text':                 'var(--ds-semantic-color-text-primary)',
  'input-default-placeholder':          'var(--ds-semantic-color-text-secondary)',
  'input-default-radius':               'var(--ds-semantic-radius-control)',
  'input-default-padding-x':            'var(--ds-semantic-space-control-padding-x)',
  'input-default-padding-y':            'var(--ds-semantic-space-control-padding-y)',
  'card-default-background':            'var(--ds-semantic-color-background-surface)',
  'card-default-border':                'var(--ds-semantic-color-border-default)',
  'card-default-radius':                'var(--ds-semantic-radius-card)',
  'card-default-padding':               'var(--ds-semantic-space-layout-component)',
};

// ─── CSS ───────────────────────────────────────────────────────────────────
function tokensCSS() {
  const lines = [':root {', '  /* ── Primitive colors — Radix UI ── */'];
  for (const [scale, steps] of Object.entries(COLOR_SCALES))
    for (const [step, { value }] of Object.entries(steps))
      lines.push(`  --ds-primitive-color-${scale}-${step}: ${value};`);
  lines.push('\n  /* ── Semantic tokens — UX intentions ── */');
  for (const [k, v] of Object.entries(SEM)) lines.push(`  --ds-semantic-${k}: ${v};`);
  lines.push('\n  /* ── Component tokens — UI contracts ── */');
  for (const [k, v] of Object.entries(COMP)) lines.push(`  --ds-component-${k}: ${v};`);
  lines.push('}');
  return lines.join('\n');
}

function siteCSS() { return `
/* Agentic Design System — site.css (uses design system tokens) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* SC 2.4.11 — Focus Not Obscured : compense le header fixe de 60px */
html { scroll-padding-top: 72px; }

*,*::before,*::after{box-sizing:border-box}
*{margin:0;padding:0}

body{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  background:var(--ds-semantic-color-background-page);
  color:var(--ds-semantic-color-text-primary);
  font-size:var(--ds-semantic-typography-body-size);
  font-weight:var(--ds-semantic-typography-body-weight);
  line-height:var(--ds-semantic-typography-body-line-height);
}

/* ── HEADER ─────────────────────────────────────────────── */
.site-header{
  position:fixed;top:0;left:0;right:0;height:60px;z-index:100;
  background:var(--ds-semantic-color-background-surface);
  border-bottom:1px solid var(--ds-semantic-color-border-default);
  display:flex;align-items:center;padding:0 24px;gap:20px;
}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex-shrink:0}
.logo-mark{
  width:32px;height:32px;border-radius:var(--ds-semantic-radius-control);
  background:var(--ds-semantic-color-action-primary);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;letter-spacing:.06em;flex-shrink:0;
}
.logo-name{font-size:15px;font-weight:700;color:var(--ds-semantic-color-text-primary)}
.logo-version{font-size:11px;color:var(--ds-semantic-color-text-secondary);background:var(--ds-semantic-color-background-subtle);padding:2px 8px;border-radius:20px;font-weight:500}
.top-nav{display:flex;gap:2px;margin-left:auto}
.top-nav a{
  text-decoration:none;color:var(--ds-semantic-color-text-secondary);font-size:13.5px;
  padding:6px 12px;border-radius:var(--ds-semantic-radius-control);font-weight:500;
  transition:background .12s,color .12s;
}
.top-nav a:hover,.top-nav a.active{background:var(--ds-semantic-color-background-subtle);color:var(--ds-semantic-color-text-primary)}
.top-nav a.active{color:var(--ds-semantic-color-action-primary)}

/* ── LAYOUT ─────────────────────────────────────────────── */
.layout{display:flex;margin-top:60px;min-height:calc(100vh - 60px)}
.sidebar{
  width:236px;flex-shrink:0;
  border-right:1px solid var(--ds-semantic-color-border-default);
  background:var(--ds-semantic-color-background-surface);
  position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;
  padding:20px 0;
}
.sidebar-group{margin-bottom:8px}
.sidebar-label{
  font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  color:var(--ds-semantic-color-text-disabled);padding:8px 20px 4px;display:block;
}
.sidebar a{
  display:block;padding:6px 20px;text-decoration:none;font-size:13.5px;
  color:var(--ds-semantic-color-text-secondary);border-radius:0;
  transition:background .1s,color .1s;border-left:2px solid transparent;
}
.sidebar a:hover{background:var(--ds-semantic-color-background-subtle);color:var(--ds-semantic-color-text-primary)}
.sidebar a.active{
  background:#eff6ff;color:var(--ds-semantic-color-action-primary);
  border-left-color:var(--ds-semantic-color-action-primary);font-weight:600;
}
.content{flex:1;padding:52px 64px;max-width:960px}

/* ── HOME HERO ──────────────────────────────────────────── */
.home-layout{margin-top:60px}
.hero{padding:80px 72px 56px;max-width:1100px;margin:0 auto}
.hero-badge{
  display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;
  text-transform:uppercase;letter-spacing:.1em;color:var(--ds-semantic-color-action-primary);
  background:#eff6ff;padding:4px 14px;border-radius:20px;margin-bottom:24px;
}
.hero h1{font-size:52px;font-weight:800;line-height:1.08;letter-spacing:-.035em;margin-bottom:20px}
.hero h1 span{color:var(--ds-semantic-color-action-primary)}
.hero-tagline{font-size:19px;color:var(--ds-semantic-color-text-secondary);line-height:1.6;max-width:580px;margin-bottom:40px}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}

.stat-band{
  background:var(--ds-semantic-color-background-surface);
  border-top:1px solid var(--ds-semantic-color-border-default);
  border-bottom:1px solid var(--ds-semantic-color-border-default);
  display:flex;flex-wrap:wrap;
}
.stat-item{
  flex:1;min-width:150px;padding:28px 32px;text-align:center;
  border-right:1px solid var(--ds-semantic-color-border-default);
}
.stat-item:last-child{border-right:none}
.stat-num{font-size:32px;font-weight:800;color:var(--ds-semantic-color-action-primary);display:block;letter-spacing:-.02em}
.stat-text{font-size:13px;color:var(--ds-semantic-color-text-secondary);margin-top:4px;display:block}

.home-section{padding:64px 72px;max-width:1100px;margin:0 auto}
.home-section h2{font-size:28px;font-weight:700;letter-spacing:-.02em;margin-bottom:8px}
.home-section > p{font-size:15px;color:var(--ds-semantic-color-text-secondary);margin-bottom:32px;line-height:1.7}

/* ── NAV CARDS ───────────────────────────────────────────── */
.nav-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
.nav-card{
  background:var(--ds-semantic-color-background-surface);
  border:1px solid var(--ds-semantic-color-border-default);
  border-radius:var(--ds-semantic-radius-card);
  padding:24px;text-decoration:none;color:inherit;
  transition:border-color .15s,box-shadow .15s,transform .1s;display:block;
}
.nav-card:hover{border-color:var(--ds-semantic-color-action-primary);box-shadow:0 4px 16px rgba(13,116,206,.1);transform:translateY(-1px)}
.nav-card-icon{font-size:28px;margin-bottom:12px;display:block}
.nav-card-title{font-size:15px;font-weight:700;color:var(--ds-semantic-color-text-primary);margin-bottom:6px}
.nav-card-desc{font-size:13px;color:var(--ds-semantic-color-text-secondary);line-height:1.55}

/* ── TOKEN PIPELINE ─────────────────────────────────────── */
.pipeline{display:flex;align-items:stretch;margin:32px 0;gap:0;border:1px solid var(--ds-semantic-color-border-default);border-radius:var(--ds-semantic-radius-card);overflow:hidden}
.pipeline-step{flex:1;padding:24px;background:var(--ds-semantic-color-background-surface)}
.pipeline-step+.pipeline-step{border-left:1px solid var(--ds-semantic-color-border-default)}
.pipeline-step:first-child{background:var(--ds-semantic-color-background-subtle)}
.pipeline-step:last-child{background:#eff6ff}
.pipeline-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ds-semantic-color-text-disabled);margin-bottom:6px}
.pipeline-title{font-size:15px;font-weight:700;color:var(--ds-semantic-color-text-primary);margin-bottom:6px}
.pipeline-desc{font-size:12.5px;color:var(--ds-semantic-color-text-secondary);line-height:1.5}
.pipeline-example{font-family:monospace;font-size:11.5px;color:var(--ds-semantic-color-action-primary);margin-top:10px;background:#fff;padding:6px 10px;border-radius:4px;border:1px solid var(--ds-semantic-color-border-default)}

/* ── PRINCIPLE CARDS ─────────────────────────────────────── */
.principle-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin:24px 0}
.principle-card{background:var(--ds-semantic-color-background-surface);border:1px solid var(--ds-semantic-color-border-default);border-radius:var(--ds-semantic-radius-card);padding:22px}
.principle-num{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ds-semantic-color-action-primary);margin-bottom:8px}
.principle-title{font-size:14px;font-weight:700;color:var(--ds-semantic-color-text-primary);margin-bottom:6px}
.principle-desc{font-size:12.5px;color:var(--ds-semantic-color-text-secondary);line-height:1.55}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
h1:not(.hero h1){font-size:30px;font-weight:800;line-height:1.15;letter-spacing:-.025em;margin-bottom:10px}
.page-lead{font-size:17px;color:var(--ds-semantic-color-text-secondary);line-height:1.65;margin-bottom:48px;max-width:580px}
h2{font-size:20px;font-weight:700;letter-spacing:-.015em;margin-top:56px;margin-bottom:16px;padding-top:48px;border-top:1px solid var(--ds-semantic-color-border-default)}
h2.first{margin-top:32px;padding-top:0;border-top:none}
h3{font-size:16px;font-weight:700;margin-top:32px;margin-bottom:12px}
p{color:var(--ds-semantic-color-text-secondary);margin-bottom:16px;line-height:1.7}

code{font-family:'JetBrains Mono','Cascadia Code','Fira Code',monospace;font-size:.85em;background:var(--ds-semantic-color-background-subtle);padding:2px 5px;border-radius:4px;color:var(--ds-semantic-color-text-primary)}
pre.code-block{background:#1a1e24;border-radius:var(--ds-semantic-radius-card);padding:22px 26px;overflow-x:auto;margin:18px 0;position:relative}
pre.code-block code{background:none;color:#c9d1d9;font-size:13px;padding:0;border-radius:0}

blockquote{border-left:3px solid var(--ds-semantic-color-action-primary);padding:14px 20px;margin:20px 0;background:var(--ds-semantic-color-background-subtle);border-radius:0 var(--ds-semantic-radius-control) var(--ds-semantic-radius-control) 0}
blockquote p{margin:0;font-style:italic;color:var(--ds-semantic-color-text-primary)}

hr{border:none;border-top:1px solid var(--ds-semantic-color-border-default);margin:32px 0}

ul,ol{padding-left:22px;margin:12px 0}
li{margin-bottom:6px;color:var(--ds-semantic-color-text-secondary);line-height:1.65}
li code{font-size:.8em}

/* ── TABLES ─────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:13.5px}
th{text-align:left;padding:10px 16px;background:var(--ds-semantic-color-background-subtle);color:var(--ds-semantic-color-text-secondary);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--ds-semantic-color-border-default)}
td{padding:12px 16px;border-bottom:1px solid var(--ds-semantic-color-border-default);color:var(--ds-semantic-color-text-secondary);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--ds-semantic-color-background-subtle)}
td code{color:var(--ds-semantic-color-action-primary)}

/* ── COLOR SYSTEM ───────────────────────────────────────── */
.semantic-colors{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:24px 0}
.color-token{background:var(--ds-semantic-color-background-surface);border:1px solid var(--ds-semantic-color-border-default);border-radius:var(--ds-semantic-radius-card);padding:16px;display:flex;align-items:center;gap:14px}
.color-swatch{width:44px;height:44px;border-radius:var(--ds-semantic-radius-control);border:1px solid rgba(0,0,0,.08);flex-shrink:0}
.color-info{}
.color-name{font-family:monospace;font-size:12px;font-weight:700;color:var(--ds-semantic-color-text-primary);margin-bottom:3px}
.color-value{font-family:monospace;font-size:11px;color:var(--ds-semantic-color-text-secondary)}
.color-intent{font-size:11.5px;color:var(--ds-semantic-color-text-secondary);margin-top:4px}

.palette-section{margin:40px 0}
.palette-scale-name{font-size:13px;font-weight:700;text-transform:capitalize;color:var(--ds-semantic-color-text-primary);margin-bottom:8px}
.palette-steps{display:grid;grid-template-columns:repeat(12,1fr);gap:4px}
.palette-step{height:48px;border-radius:4px;cursor:default;position:relative}
.palette-step:hover::after{content:attr(title);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#1a1e24;color:#fff;font-size:10px;padding:4px 8px;border-radius:4px;white-space:nowrap;z-index:10;font-family:monospace;pointer-events:none}

/* ── SPACING ────────────────────────────────────────────── */
.space-demo{display:flex;align-items:flex-end;gap:24px;margin:28px 0;flex-wrap:wrap}
.space-item{display:flex;flex-direction:column;align-items:center;gap:8px}
.space-bar{background:var(--ds-semantic-color-action-primary);opacity:.75;border-radius:3px;min-width:8px;height:24px}
.space-label{font-family:monospace;font-size:11px;color:var(--ds-semantic-color-text-secondary);text-align:center}

/* ── TYPOGRAPHY ─────────────────────────────────────────── */
.type-specimen{background:var(--ds-semantic-color-background-surface);border:1px solid var(--ds-semantic-color-border-default);border-radius:var(--ds-semantic-radius-card);padding:24px;margin:12px 0}
.type-spec-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ds-semantic-color-text-secondary);margin-bottom:12px}

/* ── COMPONENT DEMOS ────────────────────────────────────── */
.demo-box{background:var(--ds-semantic-color-background-surface);border:1px solid var(--ds-semantic-color-border-default);border-radius:var(--ds-semantic-radius-card);padding:40px;margin:24px 0}
.demo-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.demo-group{margin-bottom:28px}
.demo-group:last-child{margin-bottom:0}
.demo-group-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ds-semantic-color-text-secondary);margin-bottom:12px;display:block}

.ds-btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:var(--ds-component-button-primary-padding-y) var(--ds-component-button-primary-padding-x);
  border-radius:var(--ds-component-button-primary-radius);
  font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;
  border:1.5px solid transparent;transition:background .12s,color .12s,border-color .12s;line-height:1.4;
}
.ds-btn:focus-visible{outline:2px solid var(--ds-semantic-color-border-focus);outline-offset:2px}
.ds-btn:disabled{cursor:not-allowed;opacity:.45}
.ds-btn.primary{background:var(--ds-component-button-primary-background);color:var(--ds-component-button-primary-text);border-color:var(--ds-component-button-primary-background)}
.ds-btn.primary:hover:not(:disabled){background:var(--ds-component-button-primary-background-hover);border-color:var(--ds-component-button-primary-background-hover)}
.ds-btn.secondary{background:var(--ds-component-button-secondary-background);color:var(--ds-component-button-secondary-text);border-color:var(--ds-component-button-secondary-border)}
.ds-btn.secondary:hover:not(:disabled){background:var(--ds-component-button-secondary-background-hover)}
.ds-btn.ghost{background:var(--ds-component-button-ghost-background);color:var(--ds-component-button-ghost-text);border-color:transparent}
.ds-btn.ghost:hover:not(:disabled){background:var(--ds-component-button-ghost-background-hover)}
.ds-btn.critical{background:var(--ds-component-button-critical-background);color:var(--ds-component-button-critical-text);border-color:var(--ds-component-button-critical-border)}
.ds-btn.critical:hover:not(:disabled){background:var(--ds-component-button-critical-background-hover);color:var(--ds-component-button-critical-border)}

.variant-tag{display:inline-flex;align-items:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:4px;background:var(--ds-semantic-color-background-subtle);color:var(--ds-semantic-color-text-secondary)}

/* ── TOKEN EXPLORER ─────────────────────────────────────── */
.explorer-search{
  width:100%;max-width:480px;padding:10px 14px;
  border:1.5px solid var(--ds-semantic-color-border-default);
  border-radius:var(--ds-semantic-radius-control);
  font-size:14px;background:var(--ds-semantic-color-background-surface);
  color:var(--ds-semantic-color-text-primary);font-family:inherit;margin-bottom:20px;
}
.explorer-search:focus{outline:none;border-color:var(--ds-semantic-color-border-focus)}
.explorer-tabs{display:flex;gap:2px;border-bottom:2px solid var(--ds-semantic-color-border-default);margin-bottom:20px}
.exp-tab{
  padding:8px 20px;font-size:13.5px;font-weight:600;color:var(--ds-semantic-color-text-secondary);
  border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;
  margin-bottom:-2px;font-family:inherit;transition:color .1s;
}
.exp-tab.active{color:var(--ds-semantic-color-action-primary);border-bottom-color:var(--ds-semantic-color-action-primary)}
.exp-panel{display:none}
.exp-panel.active{display:block}
.token-row td:first-child code{color:var(--ds-semantic-color-action-primary)}

/* ── DECISIONS ──────────────────────────────────────────── */
.adr-num{font-family:monospace;font-size:12px;color:var(--ds-semantic-color-text-secondary)}
.adr-title a{color:var(--ds-semantic-color-action-primary);text-decoration:none;font-weight:600}
.adr-title a:hover{text-decoration:underline}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;padding:2px 10px;border-radius:20px}
.badge-active{background:#ecfdf5;color:#18794e}
.adr-meta{background:var(--ds-semantic-color-background-subtle);border-radius:var(--ds-semantic-radius-card);padding:16px 20px;margin-bottom:36px;display:flex;gap:24px;flex-wrap:wrap;font-size:13px}
.adr-meta strong{color:var(--ds-semantic-color-text-primary)}

/* ── AGENTS ──────────────────────────────────────────────── */
.agent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin:24px 0}
.agent-card{background:var(--ds-semantic-color-background-surface);border:1px solid var(--ds-semantic-color-border-default);border-radius:var(--ds-semantic-radius-card);padding:20px}
.agent-type{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--ds-semantic-color-text-secondary);margin-bottom:6px}
.agent-name{font-size:15px;font-weight:700;color:var(--ds-semantic-color-text-primary);margin-bottom:8px}
.agent-desc{font-size:12.5px;color:var(--ds-semantic-color-text-secondary);line-height:1.5}
.rules-split{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
.rule-can,.rule-cannot{padding:20px;border-radius:var(--ds-semantic-radius-card);border:1px solid}
.rule-can{background:#ecfdf5;border-color:#bbf7d0}
.rule-cannot{background:#fef2f2;border-color:#fecaca}
.rule-can h3{color:#15803d;margin-top:0;font-size:14px}
.rule-cannot h3{color:#b91c1c;margin-top:0;font-size:14px}
.rule-can li{color:#166534;font-size:13px}
.rule-cannot li{color:#991b1b;font-size:13px}

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media(max-width:768px){
  .layout{flex-direction:column}
  .sidebar{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid var(--ds-semantic-color-border-default)}
  .content{padding:28px 20px}
  .hero{padding:40px 20px 32px}
  .hero h1{font-size:34px}
  .home-section{padding:40px 20px}
  .pipeline{flex-direction:column}
  .pipeline-step+.pipeline-step{border-left:none;border-top:1px solid var(--ds-semantic-color-border-default)}
  .rules-split{grid-template-columns:1fr}
  .top-nav{display:none}
}

/* ── ACCESSIBILITY ───────────────────────────────────────── */
*:focus-visible{outline:2px solid var(--ds-semantic-color-border-focus);outline-offset:2px}
a{color:var(--ds-semantic-color-action-primary)}
.skip-link{position:absolute;top:-40px;left:8px;background:var(--ds-semantic-color-action-primary);color:#fff;padding:8px 16px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;z-index:1000}
.skip-link:focus{top:8px}
`; }

function siteJS() { return `
document.addEventListener('DOMContentLoaded', () => {

  // Active nav links
  const p = window.location.pathname;
  document.querySelectorAll('.top-nav a').forEach(a => {
    const h = a.getAttribute('href') || '';
    if (h !== 'index.html' && p.includes(h.split('/').pop().replace('.html',''))) a.classList.add('active');
    if (p.endsWith('index.html') && h === 'index.html') a.classList.add('active');
  });
  document.querySelectorAll('.sidebar a').forEach(a => {
    if (p.endsWith(a.getAttribute('href')?.split('/').pop() || '')) a.classList.add('active');
  });

  // Token explorer tabs
  document.querySelectorAll('.exp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.exp-panel').forEach(pn => pn.classList.remove('active'));
      tab.classList.add('active');
      const el = document.getElementById(tab.dataset.target);
      if (el) el.classList.add('active');
    });
  });

  // Token search
  const search = document.getElementById('token-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('.token-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // Copy buttons on code blocks
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
function layout({ title, depth = 0, section = '', sidebar = null, body, fullWidth = false }) {
  const base = depth > 0 ? '../' : '';
  const navLinks = [
    { href: `${base}index.html`,            label: 'Accueil' },
    { href: `${base}foundations/color.html`,label: 'Fondations' },
    { href: `${base}components/button.html`,label: 'Composants' },
    { href: `${base}tokens/index.html`,     label: 'Tokens' },
    { href: `${base}decisions/index.html`,  label: 'Décisions' },
    { href: `${base}agents/index.html`,     label: 'Agents' },
  ];
  const nav = navLinks.map(n => `<a href="${n.href}">${n.label}</a>`).join('');
  const sidebarHtml = sidebar ? `<aside class="sidebar" role="navigation" aria-label="Navigation secondaire">${sidebar}</aside>` : '';
  const mainClass = fullWidth ? 'home-layout' : 'layout';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Documentation officielle de l'Agentic Design System — tokens, composants, décisions et règles de gouvernance.">
<title>${title} — Agentic Design System</title>
<link rel="stylesheet" href="${base}tokens.css">
<link rel="stylesheet" href="${base}site.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230d74ce'/><text y='22' x='5' font-family='sans-serif' font-size='14' font-weight='800' fill='white'>ADS</text></svg>">
</head>
<body>
<a class="skip-link" href="#main-content">Aller au contenu</a>
<header class="site-header" role="banner">
  <a class="logo" href="${base}index.html" aria-label="Agentic Design System — Accueil">
    <span class="logo-mark" aria-hidden="true">ADS</span>
    <span class="logo-name">Agentic Design System</span>
  </a>
  <span class="logo-version">v1.0.0</span>
  <nav class="top-nav" aria-label="Navigation principale">${nav}</nav>
</header>
<div class="${mainClass}" id="main-content">
  ${sidebarHtml}
  <main class="${fullWidth ? '' : 'content'}" role="main">${body}</main>
</div>
<script src="${base}site.js"></script>
</body>
</html>`;
}

function sidebarFoundations(base, current) {
  const links = [
    ['color.html','Couleur'],
    ['spacing.html','Espacement'],
    ['typography.html','Typographie'],
  ].map(([h,l]) => `<a href="${base}foundations/${h}"${current===h?' class="active"':''}>${l}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label">Fondations</span>${links}</div>`;
}

function sidebarComponents(base, current) {
  const links = [
    ['index.html','Vue d\'ensemble'],
    ['button.html','Button'],
  ].map(([h,l]) => `<a href="${base}components/${h}"${current===h?' class="active"':''}>${l}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label">Composants</span>${links}</div>`;
}

function sidebarDecisions(base, adrs) {
  const links = adrs.slice(0,10).map(a => `<a href="${base}decisions/${a.slug}.html">ADR-${String(a.num).padStart(3,'0')}</a>`).join('');
  const more = adrs.length > 10 ? `<a href="${base}decisions/index.html">→ Tous les ADRs (${adrs.length})</a>` : '';
  return `<div class="sidebar-group"><span class="sidebar-label">Décisions</span><a href="${base}decisions/index.html">Index des ADRs</a>${links}${more}</div>`;
}

// Variante pour les pages déjà dans decisions/ — liens relatifs sans préfixe
function sidebarDecisionsLocal(adrs) {
  const links = adrs.map(a => `<a href="${a.slug}.html">ADR-${String(a.num).padStart(3,'0')}</a>`).join('');
  return `<div class="sidebar-group"><span class="sidebar-label">Décisions</span><a href="index.html">Index des ADRs</a>${links}</div>`;
}

// ─── PAGE: HOME ────────────────────────────────────────────────────────────
function buildHome(adrs) {
  const colorCount = Object.keys(COLOR_SCALES).length;
  const scaleSteps = Object.values(COLOR_SCALES).reduce((a, s) => a + Object.keys(s).length, 0);
  const principles = [
    ['01','Souveraineté numérique','Les données, décisions et outils restent sous contrôle organisationnel.'],
    ['02','Accessibilité première','WCAG 2.1 AA minimum. Non contournable, non négociable.'],
    ['03','Auditabilité totale','Toute décision est traçable, versionnée, justifiée.'],
    ['04','Le dernier mot est humain','Les agents proposent. Les humains décident. Toujours.'],
  ];
  const sections = [
    ['foundations/color.html','🎨','Fondations','Couleur, espacement, typographie — les primitives et leurs intentions sémantiques.'],
    ['components/button.html','🧩','Composants','Contrats UI exécutables : variantes, états, tokens, accessibilité, code.'],
    ['tokens/index.html','⚡','Explorateur de tokens','Naviguez dans les 3 niveaux : primitif → sémantique → composant.'],
    ['decisions/index.html','📋','Décisions (ADRs)','Pourquoi chaque décision existe — 16 ADRs actifs avec contexte et alternatives.'],
    ['agents/index.html','🤖','Pour les agents IA','Règles, routage et contraintes pour les agents qui travaillent avec ce système.'],
    ['https://github.com','⚙️','Code source','Tokens JSON, scripts d\'audit, configuration Style Dictionary.'],
  ];

  const body = `
<div class="hero">
  <div class="hero-badge">Agentic Design System · v1.0.0</div>
  <h1>Un système de design<br><span>compris par les humains<br>et les agents IA.</span></h1>
  <p class="hero-tagline">Les décisions d'interface encodées sous forme de tokens structurés, de contrats de composants et de règles lisibles par machine — pour que chaque intervenant, humain ou agent, applique correctement les décisions de l'équipe.</p>
  <div class="hero-actions">
    <a href="foundations/color.html" class="ds-btn primary">Explorer les fondations</a>
    <a href="components/button.html" class="ds-btn secondary">Voir les composants</a>
    <a href="agents/index.html" class="ds-btn ghost">Documentation agents →</a>
  </div>
</div>
<div class="stat-band" role="region" aria-label="Statistiques du système">
  <div class="stat-item"><span class="stat-num">3</span><span class="stat-text">Niveaux de tokens</span></div>
  <div class="stat-item"><span class="stat-num">${colorCount}</span><span class="stat-text">Échelles de couleur Radix</span></div>
  <div class="stat-item"><span class="stat-num">${scaleSteps}+</span><span class="stat-text">Tokens primitifs</span></div>
  <div class="stat-item"><span class="stat-num">${adrs.length}</span><span class="stat-text">Décisions architecturales</span></div>
  <div class="stat-item"><span class="stat-num">AA</span><span class="stat-text">WCAG 2.1 garanti</span></div>
</div>

<div class="home-section">
  <h2>Pipeline de tokens</h2>
  <p>Trois niveaux ordonnés, chacun avec un rôle précis. Les agents comprennent la fonction, pas la valeur brute.</p>
  <div class="pipeline" role="region" aria-label="Pipeline des tokens">
    <div class="pipeline-step">
      <div class="pipeline-tag">Niveau 1 — Primitif</div>
      <div class="pipeline-title">Valeurs physiques</div>
      <div class="pipeline-desc">Couleurs, espacements, rayons. Très stables. Jamais utilisées directement dans les composants.</div>
      <div class="pipeline-example">primitive.color.blue.11<br>→ #0d74ce</div>
    </div>
    <div class="pipeline-step">
      <div class="pipeline-tag">Niveau 2 — Sémantique</div>
      <div class="pipeline-title">Intentions UX</div>
      <div class="pipeline-desc">Traduit les primitives en langage métier. C'est ce que les agents doivent utiliser pour comprendre l'intention.</div>
      <div class="pipeline-example">color.action.primary<br>→ primitive.color.blue.11</div>
    </div>
    <div class="pipeline-step">
      <div class="pipeline-tag">Niveau 3 — Composant</div>
      <div class="pipeline-title">Contrats institutionnels</div>
      <div class="pipeline-desc">Décisions spécifiques à chaque composant. Portent les règles comportementales. Toute modification requiert approbation.</div>
      <div class="pipeline-example">button.primary.background<br>→ color.action.primary</div>
    </div>
  </div>
</div>

<div class="home-section">
  <h2>Explorer le système</h2>
  <p>Chaque section encode une dimension du système — accessible aux humains et lisible par les agents.</p>
  <div class="nav-grid">
    ${sections.map(([h,i,t,d]) => `<a href="${h}" class="nav-card"><span class="nav-card-icon">${i}</span><div class="nav-card-title">${t}</div><div class="nav-card-desc">${d}</div></a>`).join('')}
  </div>
</div>

<div class="home-section">
  <h2>Valeurs non négociables</h2>
  <p>Ces quatre principes guident chaque décision du système et chaque action des agents.</p>
  <div class="principle-grid">
    ${principles.map(([n,t,d]) => `<div class="principle-card"><div class="principle-num">Principe ${n}</div><div class="principle-title">${t}</div><div class="principle-desc">${d}</div></div>`).join('')}
  </div>
</div>
`;

  write(path.join(DIST, 'index.html'), layout({ title: 'Accueil', depth: 0, fullWidth: true, body }));
}

// ─── PAGE: COLOR ────────────────────────────────────────────────────────────
function buildColor() {
  const semanticColors = [
    ['color-action-primary',         'color.action.primary',         SEM['color-action-primary'],         'Action principale — CTA, bouton primaire'],
    ['color-action-primary-hover',   'color.action.primary-hover',   SEM['color-action-primary-hover'],   'État survol de l\'action principale'],
    ['color-action-primary-disabled','color.action.primary-disabled',SEM['color-action-primary-disabled'],'Action principale désactivée'],
    ['color-feedback-danger',        'color.feedback.danger',        SEM['color-feedback-danger'],        'Erreur, action destructrice, alerte critique'],
    ['color-feedback-danger-subtle', 'color.feedback.danger-subtle', SEM['color-feedback-danger-subtle'], 'Fond subtil pour état danger'],
    ['color-feedback-success',       'color.feedback.success',       SEM['color-feedback-success'],       'Confirmation, succès, validation'],
    ['color-feedback-info',          'color.feedback.info',          SEM['color-feedback-info'],          'Information neutre, aide contextuelle'],
    ['color-background-page',        'color.background.page',        SEM['color-background-page'],        'Fond de page principale'],
    ['color-background-surface',     'color.background.surface',     SEM['color-background-surface'],     'Fond de carte, panneau, modal'],
    ['color-background-subtle',      'color.background.subtle',      SEM['color-background-subtle'],      'Fond secondaire, survol discret'],
    ['color-text-primary',           'color.text.primary',           SEM['color-text-primary'],           'Texte principal, haute lisibilité'],
    ['color-text-secondary',         'color.text.secondary',         SEM['color-text-secondary'],         'Texte secondaire, labels, métadonnées'],
    ['color-text-disabled',          'color.text.disabled',          SEM['color-text-disabled'],          'Texte désactivé'],
    ['color-border-default',         'color.border.default',         SEM['color-border-default'],         'Bordure standard'],
    ['color-border-focus',           'color.border.focus',           SEM['color-border-focus'],           'Bordure focus — accessibilité clavier'],
    ['color-border-danger',          'color.border.danger',          SEM['color-border-danger'],          'Bordure état erreur'],
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
  <td><code>--ds-semantic-${key}</code></td>
  <td style="font-family:monospace;font-size:12px">${value}</td>
  <td>${intent}</td>
</tr>`).join('');

  const body = `
<h1>Couleur</h1>
<p class="page-lead">Système de couleur en trois niveaux : palettes primitives Radix UI → intentions sémantiques → contrats de composant. Les agents utilisent les tokens sémantiques, jamais les valeurs primitives.</p>

<h2 class="first">Tokens sémantiques</h2>
<p>Ces 16 tokens encodent les intentions UX. Chaque composant les référence — jamais les primitives directement.</p>
<table>
  <thead><tr><th>Couleur</th><th>Token CSS</th><th>Valeur</th><th>Intention</th></tr></thead>
  <tbody>${semRows}</tbody>
</table>

<h2>Palette primitive — Radix UI</h2>
<p>${Object.keys(COLOR_SCALES).length} échelles de couleur, chacune avec 12 paliers numérotés. Paliers 1-2 pour les fonds, 11-12 pour le texte haute lisibilité.</p>
<div class="palette-section">${palette}</div>

<blockquote><p>Les agents comprennent <code>color.action.primary</code> comme une intention. Ils ne comprennent pas <code>#0d74ce</code> comme une intention — c'est juste une valeur.</p></blockquote>
`;

  write(path.join(DIST, 'foundations/color.html'), layout({
    title: 'Couleur', depth: 1,
    sidebar: sidebarFoundations('', 'color.html') + sidebarComponents('', ''),
    body
  }));
}

// ─── PAGE: SPACING ──────────────────────────────────────────────────────────
function buildSpacing() {
  const tokens = [
    ['space-control-padding-x','semantic.space.control.padding-x','16px','Espacement horizontal des contrôles interactifs'],
    ['space-control-padding-y','semantic.space.control.padding-y','8px','Espacement vertical des contrôles interactifs'],
    ['space-control-gap',      'semantic.space.control.gap',      '8px','Écart interne entre éléments d\'un contrôle'],
    ['space-layout-section',   'semantic.space.layout.section',   '32px','Espacement entre sections de page'],
    ['space-layout-component', 'semantic.space.layout.component', '20px','Espacement entre composants'],
    ['radius-control',         'semantic.radius.control',         '6px','Rayon pour contrôles interactifs'],
    ['radius-card',            'semantic.radius.card',            '10px','Rayon pour conteneurs (cartes, panneaux)'],
  ];
  const spaceItems = [
    ['8px','space-2','control-gap / padding-y'],
    ['16px','space-4','control-padding-x'],
    ['20px','space-5','layout-component'],
    ['32px','space-8','layout-section'],
  ];
  const bars = spaceItems.map(([px, key, label]) =>
    `<div class="space-item"><div class="space-bar" style="width:${px}" aria-label="${px}"></div><div class="space-label">${px}<br><span style="color:var(--ds-semantic-color-text-disabled)">${label}</span></div></div>`
  ).join('');
  const rows = tokens.map(([k, name, v, i]) => `<tr class="token-row"><td><code>--ds-semantic-${k}</code></td><td><code>${name}</code></td><td style="font-family:monospace">${v}</td><td>${i}</td></tr>`).join('');

  const body = `
<h1>Espacement</h1>
<p class="page-lead">Les tokens d'espacement traduisent l'intention de layout en valeurs réutilisables. Jamais de <code>padding: 16px</code> en dur — toujours via <code>var(--ds-semantic-space-control-padding-x)</code>.</p>

<h2 class="first">Échelle visuelle</h2>
<div class="demo-box"><div class="space-demo">${bars}</div></div>

<h2>Tokens sémantiques</h2>
<table>
  <thead><tr><th>Token CSS</th><th>Référence</th><th>Valeur</th><th>Intention</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2>Règles absolues</h2>
<ul>
  <li>❌ <code>padding: 16px</code> — utiliser <code>var(--ds-semantic-space-control-padding-x)</code></li>
  <li>❌ <code>margin: 32px</code> — utiliser <code>var(--ds-semantic-space-layout-section)</code></li>
  <li>❌ <code>border-radius: 4px</code> — utiliser <code>var(--ds-semantic-radius-control)</code></li>
  <li>✅ Toujours via CSS Custom Properties référençant un token sémantique</li>
</ul>
`;

  write(path.join(DIST, 'foundations/spacing.html'), layout({
    title: 'Espacement', depth: 1,
    sidebar: sidebarFoundations('', 'spacing.html') + sidebarComponents('', ''),
    body
  }));
}

// ─── PAGE: TYPOGRAPHY ───────────────────────────────────────────────────────
function buildTypography() {
  const tokens = [
    ['typography-body-size',          '16px','Taille du texte courant'],
    ['typography-body-weight',        '400', 'Graisse du texte courant'],
    ['typography-body-line-height',   '1.5', 'Interlignage du texte courant'],
    ['typography-label-size',         '14px','Taille des labels et libellés de boutons'],
    ['typography-label-weight',       '500', 'Graisse des labels — légèrement plus fort'],
    ['typography-label-line-height',  '1.25','Interlignage compact des labels'],
    ['typography-heading-size',       '24px','Taille des titres de section'],
    ['typography-heading-weight',     '700', 'Graisse bold pour hiérarchie forte'],
    ['typography-heading-line-height','1.25','Interlignage compact des titres'],
  ];
  const rows = tokens.map(([k, v, i]) => `<tr class="token-row"><td><code>--ds-semantic-${k}</code></td><td style="font-family:monospace">${v}</td><td>${i}</td></tr>`).join('');

  const body = `
<h1>Typographie</h1>
<p class="page-lead">Trois niveaux typographiques : <strong>body</strong> pour la lecture, <strong>label</strong> pour les contrôles interactifs, <strong>heading</strong> pour la hiérarchie. Jamais de <code>font-size</code> en dur.</p>

<h2 class="first">Spécimens typographiques</h2>
<div class="type-specimen">
  <div class="type-spec-label">Heading — var(--ds-semantic-typography-heading-size) · weight 700</div>
  <div style="font-size:var(--ds-semantic-typography-heading-size);font-weight:var(--ds-semantic-typography-heading-weight);line-height:var(--ds-semantic-typography-heading-line-height);color:var(--ds-semantic-color-text-primary)">Titre de section principal</div>
</div>
<div class="type-specimen">
  <div class="type-spec-label">Body — var(--ds-semantic-typography-body-size) · weight 400</div>
  <div style="font-size:var(--ds-semantic-typography-body-size);font-weight:var(--ds-semantic-typography-body-weight);line-height:var(--ds-semantic-typography-body-line-height);color:var(--ds-semantic-color-text-secondary)">Texte courant. Ce paragraphe illustre la lisibilité du texte principal avec le token body. L'interlignage de 1.5 assure une lecture confortable sur tous les écrans et résolutions.</div>
</div>
<div class="type-specimen">
  <div class="type-spec-label">Label — var(--ds-semantic-typography-label-size) · weight 500</div>
  <div style="font-size:var(--ds-semantic-typography-label-size);font-weight:var(--ds-semantic-typography-label-weight);line-height:var(--ds-semantic-typography-label-line-height);color:var(--ds-semantic-color-text-primary)">Label de bouton · Champ de formulaire · Badge de statut</div>
</div>

<h2>Tokens sémantiques</h2>
<table>
  <thead><tr><th>Token CSS</th><th>Valeur</th><th>Intention</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2>Règles</h2>
<ul>
  <li>❌ <code>font-size: 16px</code> — utiliser <code>var(--ds-semantic-typography-body-size)</code></li>
  <li>❌ <code>font-weight: bold</code> — utiliser le token de graisse approprié</li>
  <li>✅ Police système : Inter (Google Fonts) avec fallback system-ui</li>
  <li>✅ Toujours définir <code>line-height</code> via un token</li>
</ul>
`;

  write(path.join(DIST, 'foundations/typography.html'), layout({
    title: 'Typographie', depth: 1,
    sidebar: sidebarFoundations('', 'typography.html') + sidebarComponents('', ''),
    body
  }));
}

// ─── PAGE: COMPONENTS INDEX ─────────────────────────────────────────────────
function buildComponentsIndex() {
  const body = `
<h1>Composants</h1>
<p class="page-lead">Chaque composant est un contrat — intention, variantes autorisées, tokens associés, règles d'accessibilité, cas limites, gouvernance. Les agents appliquent ces contrats sans les improviser.</p>

<h2 class="first">Catalogue</h2>
<div class="nav-grid">
  <a href="button.html" class="nav-card">
    <span class="nav-card-icon">🔘</span>
    <div class="nav-card-title">Button</div>
    <div class="nav-card-desc">4 variantes : primary, secondary, ghost, critical. Règles spéciales pour les actions irréversibles.</div>
  </a>
  <div class="nav-card" style="opacity:.5;cursor:default;pointer-events:none">
    <span class="nav-card-icon">📝</span>
    <div class="nav-card-title">Input <span class="badge" style="margin-left:6px">Bientôt</span></div>
    <div class="nav-card-desc">Saisie de données avec états : défaut, focus, erreur, désactivé.</div>
  </div>
  <div class="nav-card" style="opacity:.5;cursor:default;pointer-events:none">
    <span class="nav-card-icon">🃏</span>
    <div class="nav-card-title">Card <span class="badge" style="margin-left:6px">Bientôt</span></div>
    <div class="nav-card-desc">Conteneur visuel pour regrouper des informations liées.</div>
  </div>
</div>

<h2>Workflow de création</h2>
<ol style="color:var(--ds-semantic-color-text-secondary);padding-left:22px">
  <li>Définir l'intention du composant dans <code>guidelines/components/[nom].md</code></li>
  <li>Créer les tokens dans <code>tokens/component.json</code> en référençant les sémantiques</li>
  <li>Implémenter le Web Component (Lit) dans <code>src/components/ds-[nom].js</code></li>
  <li>Créer la Storybook story pour documentation et tests visuels</li>
  <li>Ouvrir une PR avec impact tokens documenté — approbation requise si composant modifié</li>
</ol>
`;

  write(path.join(DIST, 'components/index.html'), layout({
    title: 'Composants', depth: 1,
    sidebar: sidebarFoundations('', '') + sidebarComponents('', 'index.html'),
    body
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
<p class="page-lead">Déclenche une action utilisateur. Quatre variantes, chacune avec une hiérarchie et un usage précis. La variante <code>critical</code> porte des règles comportementales spéciales pour les actions irréversibles.</p>

<h2 class="first">Variantes</h2>
<div class="demo-box">
  <div class="demo-group">
    <span class="demo-group-label">Primary — action principale, 1 maximum par section</span>
    <div class="demo-row">
      <button class="ds-btn primary">Enregistrer les modifications</button>
      <button class="ds-btn primary" disabled>Enregistrer (désactivé)</button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label">Secondary — action alternative</span>
    <div class="demo-row">
      <button class="ds-btn secondary">Annuler</button>
      <button class="ds-btn secondary" disabled>Annuler (désactivé)</button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label">Ghost — action tertiaire, faible emphase</span>
    <div class="demo-row">
      <button class="ds-btn ghost">En savoir plus</button>
      <button class="ds-btn ghost" disabled>En savoir plus (désactivé)</button>
    </div>
  </div>
  <div class="demo-group">
    <span class="demo-group-label">Critical — action irréversible (confirmation obligatoire)</span>
    <div class="demo-row">
      <button class="ds-btn critical">Supprimer définitivement</button>
    </div>
  </div>
</div>

<h2>Règles absolues</h2>
<ul>
  <li>✅ Maximum 1 bouton <code>primary</code> par section ou formulaire</li>
  <li>✅ Toujours un libellé explicite — jamais "OK" ou "Confirmer" seul</li>
  <li>✅ Le bouton <code>critical</code> DOIT déclencher un pattern de confirmation</li>
  <li>✅ Toujours un <code>:focus-visible</code> visible — <code>outline: 2px solid var(--ds-semantic-color-border-focus)</code></li>
  <li>❌ Jamais deux boutons <code>primary</code> côte à côte</li>
  <li>❌ Jamais de couleur ou espacement en dur</li>
  <li>❌ Jamais de variante inventée hors de <code>component.json</code></li>
</ul>

<h2>Tokens de composant</h2>
<table>
  <thead><tr><th>Token CSS</th><th>Référence sémantique</th><th>Valeur résolue</th></tr></thead>
  <tbody>${tokenRows.map(([k,r,v]) => `<tr class="token-row"><td><code>--ds-component-${k}</code></td><td><code>${r}</code></td><td style="font-family:monospace;font-size:12px">${v}</td></tr>`).join('')}</tbody>
</table>

<h2>Accessibilité</h2>
<ul>
  <li>Contraste minimum 4.5:1 sur fond blanc (WCAG AA)</li>
  <li>Navigation clavier complète — Tab, Enter, Space</li>
  <li>Focus visible : <code>outline: 2px solid var(--ds-semantic-color-border-focus); outline-offset: 2px</code></li>
  <li>Pour les boutons icône seul : <code>aria-label</code> obligatoire</li>
  <li>État <code>loading</code> : <code>aria-busy="true"</code> + largeur préservée</li>
  <li>État <code>disabled</code> : <code>aria-disabled="true"</code> ou <code>disabled</code></li>
</ul>

<h2>Règles spéciales — variante critical</h2>
<p>Token <code>component.button.critical.$metadata.requires-confirmation</code> = <code>true</code>. Avant d'utiliser cette variante, vérifier :</p>
<ol style="color:var(--ds-semantic-color-text-secondary);padding-left:22px">
  <li>Le pattern de confirmation existe dans l'interface (modale, popconfirm)</li>
  <li>Le libellé décrit l'action — ex: "Supprimer définitivement le dossier"</li>
  <li>Le contraste est ≥ 4.5:1 sur fond blanc</li>
  <li>L'agent escalade à un humain si le caractère irréversible de l'action n'est pas certain</li>
</ol>

<h2>Implémentation — Lit Web Component</h2>
<pre class="code-block"><code class="lang-javascript">import { LitElement, html, css } from 'lit';

class DsButton extends LitElement {
  static properties = {
    variant: { type: String }, // 'primary' | 'secondary' | 'critical' | 'ghost'
    disabled: { type: Boolean },
    loading:  { type: Boolean },
  };

  static styles = css\`
    button {
      background: var(--ds-component-button-primary-background);
      color:      var(--ds-component-button-primary-text);
      padding:    var(--ds-component-button-primary-padding-y) var(--ds-component-button-primary-padding-x);
      border-radius: var(--ds-component-button-primary-radius);
      font-size:  var(--ds-semantic-typography-label-size);
      font-weight:var(--ds-semantic-typography-label-weight);
      border: none; cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--ds-semantic-color-border-focus);
      outline-offset: 2px;
    }
  \`;
}
customElements.define('ds-button', DsButton);</code></pre>

<h2>Anti-patterns</h2>
<table>
  <thead><tr><th>Mauvais</th><th>Pourquoi</th></tr></thead>
  <tbody>
    <tr><td><code>&lt;button style="background:red"&gt;Supprimer&lt;/button&gt;</code></td><td>Valeur en dur, variante non reconnue, pas de token</td></tr>
    <tr><td><code>&lt;ds-button variant="critical"&gt;OK&lt;/ds-button&gt;</code></td><td>Libellé non explicite pour une action critique</td></tr>
    <tr><td>Deux <code>variant="primary"</code> dans le même formulaire</td><td>Hiérarchie cassée — perte de clarté UX</td></tr>
    <tr><td><code>&lt;ds-button variant="danger"&gt;</code></td><td>Variante inexistante — escalader, demander la variante correcte</td></tr>
  </tbody>
</table>
`;

  write(path.join(DIST, 'components/button.html'), layout({
    title: 'Button', depth: 1,
    sidebar: sidebarFoundations('', '') + sidebarComponents('', 'button.html'),
    body
  }));
}

// ─── PAGE: TOKEN EXPLORER ───────────────────────────────────────────────────
function buildTokens() {
  const primRows = Object.entries(COLOR_SCALES).flatMap(([scale, steps]) =>
    Object.entries(steps).map(([step, { value, desc }]) =>
      `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:8px"><span style="width:20px;height:20px;border-radius:3px;background:${value};border:1px solid rgba(0,0,0,.1);flex-shrink:0" aria-hidden="true"></span><code>--ds-primitive-color-${scale}-${step}</code></div></td><td style="font-family:monospace;font-size:12px">${value}</td><td>${desc}</td></tr>`
    )
  ).join('');

  const semRows = Object.entries(SEM).map(([k, v]) => {
    const isColor = k.startsWith('color-');
    const swatch = isColor ? `<span style="width:20px;height:20px;border-radius:3px;background:${v};border:1px solid rgba(0,0,0,.1);flex-shrink:0;display:inline-block" aria-hidden="true"></span>` : '';
    return `<tr class="token-row"><td><div style="display:flex;align-items:center;gap:8px">${swatch}<code>--ds-semantic-${k}</code></div></td><td style="font-family:monospace;font-size:12px">${v}</td></tr>`;
  }).join('');

  const compRows = Object.entries(COMP).map(([k, v]) =>
    `<tr class="token-row"><td><code>--ds-component-${k}</code></td><td style="font-size:12px;color:var(--ds-semantic-color-text-secondary)">${v}</td></tr>`
  ).join('');

  const body = `
<h1>Explorateur de tokens</h1>
<p class="page-lead">Les ${Object.values(COLOR_SCALES).reduce((a,s)=>a+Object.keys(s).length,0)} tokens primitifs, ${Object.keys(SEM).length} tokens sémantiques et ${Object.keys(COMP).length} tokens de composant — navigables, filtrables, et directement applicables via CSS Custom Properties.</p>

<input class="explorer-search" type="search" id="token-search" placeholder="Filtrer les tokens (ex: button, color, action…)" aria-label="Rechercher des tokens">

<div class="explorer-tabs" role="tablist" aria-label="Niveaux de tokens">
  <button class="exp-tab active" data-target="prim-panel" role="tab" aria-selected="true">Primitifs</button>
  <button class="exp-tab" data-target="sem-panel" role="tab" aria-selected="false">Sémantiques</button>
  <button class="exp-tab" data-target="comp-panel" role="tab" aria-selected="false">Composant</button>
</div>

<div id="prim-panel" class="exp-panel active" role="tabpanel">
  <p style="margin-bottom:16px">Valeurs physiques issues de Radix UI. <strong>Jamais utilisées directement dans les composants.</strong></p>
  <table><thead><tr><th>Token CSS</th><th>Valeur</th><th>Usage recommandé</th></tr></thead><tbody>${primRows}</tbody></table>
</div>
<div id="sem-panel" class="exp-panel" role="tabpanel">
  <p style="margin-bottom:16px">Intentions UX. Ces tokens sont ce que les agents doivent utiliser pour comprendre la fonction, pas la valeur.</p>
  <table><thead><tr><th>Token CSS</th><th>Valeur résolue</th></tr></thead><tbody>${semRows}</tbody></table>
</div>
<div id="comp-panel" class="exp-panel" role="tabpanel">
  <p style="margin-bottom:16px">Contrats institutionnels. Toute modification requiert une approbation formelle (TCR).</p>
  <table><thead><tr><th>Token CSS</th><th>Référence sémantique</th></tr></thead><tbody>${compRows}</tbody></table>
</div>
`;

  write(path.join(DIST, 'tokens/index.html'), layout({ title: 'Tokens', depth: 1, body }));
}

// ─── PAGE: DECISIONS INDEX ──────────────────────────────────────────────────
function buildDecisionsIndex(adrs) {
  const rows = adrs.map(a => `
<tr>
  <td class="adr-num">ADR-${String(a.num).padStart(3,'0')}</td>
  <td class="adr-title"><a href="${a.slug}.html">${esc(a.title)}</a></td>
  <td><span class="badge badge-active">✅ Actif</span></td>
  <td>${a.date}</td>
</tr>`).join('');

  const body = `
<h1>Décisions architecturales</h1>
<p class="page-lead">Un design system accumule des décisions invisibles : pourquoi ce token est nommé ainsi, pourquoi cette variante a été rejetée, pourquoi cette règle de gouvernance est là. Ce registre rend ces décisions traçables et auditables.</p>

<blockquote><p>Le système de design est devenu un dataset, pas un deliverable. — The Design System Guide, 2026</p></blockquote>

<h2 class="first">Index des ADRs</h2>
<p>${adrs.length} décisions actives. Un ADR ne se supprime jamais — on le marque <em>remplacé</em> ou <em>déprécié</em>.</p>
<table>
  <thead><tr><th>ADR</th><th>Titre</th><th>Statut</th><th>Date</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2>Règles du registre</h2>
<ul>
  <li>Un ADR ne se supprime jamais — on le marque <code>remplacé</code> ou <code>déprécié</code></li>
  <li>Un ADR est immutable une fois <code>actif</code> — toute modification crée un nouvel ADR</li>
  <li>Les agents lisent ce dossier pour comprendre les <em>pourquoi</em>, pas les <em>quoi</em></li>
  <li>Tout TCR (Token Change Request) majeur doit référencer ou créer un ADR</li>
</ul>
`;

  write(path.join(DIST, 'decisions/index.html'), layout({
    title: 'Décisions (ADRs)', depth: 1,
    sidebar: sidebarDecisionsLocal(adrs),
    body
  }));
}

// ─── PAGE: INDIVIDUAL ADR ───────────────────────────────────────────────────
function buildADR(adr, adrs) {
  const content = parseMd(adr.content);
  const meta = `
<div class="adr-meta">
  <div class="adr-meta-item"><strong>ADR</strong> ${String(adr.num).padStart(3,'0')}</div>
  <div class="adr-meta-item"><strong>Statut</strong> <span class="badge badge-active">✅ Actif</span></div>
  <div class="adr-meta-item"><strong>Date</strong> ${adr.date}</div>
  ${adr.deciders ? `<div class="adr-meta-item"><strong>Décideurs</strong> ${esc(adr.deciders)}</div>` : ''}
</div>`;
  const prev = adrs.find(a => a.num === adr.num - 1);
  const next = adrs.find(a => a.num === adr.num + 1);
  const nav = `<div style="display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid var(--ds-semantic-color-border-default)">
    ${prev ? `<a href="${prev.slug}.html" class="ds-btn secondary" style="font-size:13px">← ADR-${String(prev.num).padStart(3,'0')}</a>` : '<span></span>'}
    ${next ? `<a href="${next.slug}.html" class="ds-btn secondary" style="font-size:13px">ADR-${String(next.num).padStart(3,'0')} →</a>` : '<span></span>'}
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
    ['Designer Agent','Figma','Détecte les dérives dans Figma : instances détachées, descriptions manquantes, espacements incohérents.'],
    ['Developer Agent','Code','Détecte les mauvais usages de tokens dans le code, ouvre des PRs de correction.'],
    ['Documentation Agent','Docs','Génère des changelogs, guides de migration, notes d\'accessibilité.'],
    ['QA Agent','Tests','Exécute les tests d\'accessibilité, de régression visuelle, de conformité des tokens.'],
  ];

  const readingOrder = [
    ['AGENTS.md','Routeur d\'agents — première lecture obligatoire'],
    ['DESIGN.md','Contrat de marque portable'],
    ['.claude/rules/project-overview.md','Contexte général'],
    ['.claude/rules/tokens-system.md','Règles des tokens'],
    ['.claude/rules/development.md','Règles de développement'],
    ['guidelines/components/button.md','Contrat du composant concerné'],
    ['.claude/instructions/session-spec.md','Quick reference pour la session'],
  ];

  const body = `
<h1>Pour les agents IA</h1>
<p class="page-lead">Ce système de design est conçu pour être compris et utilisé par des agents IA. Les agents observent, analysent, proposent. Les humains approuvent, décident, déploient.</p>

<blockquote><p>Le dernier mot est toujours humain.</p></blockquote>

<h2 class="first">Types d'agents</h2>
<div class="agent-grid">
${agentTypes.map(([name, type, desc]) => `
<div class="agent-card">
  <div class="agent-type">Agent ${type}</div>
  <div class="agent-name">${name}</div>
  <div class="agent-desc">${desc}</div>
</div>`).join('')}
</div>

<h2>Ce que les agents peuvent faire</h2>
<div class="rules-split">
  <div class="rule-can">
    <h3>✅ Autorisé</h3>
    <ul>
      <li>Lire tous les fichiers du dépôt</li>
      <li>Générer du code respectant les contrats</li>
      <li>Détecter les dérives de tokens</li>
      <li>Proposer des corrections</li>
      <li>Créer une branche <code>fix/</code> ou <code>docs/</code></li>
      <li>Faire des commits sur une branche feature</li>
      <li>Ouvrir une PR avec description complète</li>
    </ul>
  </div>
  <div class="rule-cannot">
    <h3>❌ Interdit</h3>
    <ul>
      <li>Merger une PR sans approbation humaine</li>
      <li>Pusher directement sur <code>main</code> ou <code>develop</code></li>
      <li>Modifier <code>tokens/component.json</code> sans approbation explicite</li>
      <li>Inventer des variantes ou tokens non définis</li>
      <li>Utiliser des valeurs en dur (hex, px, etc.)</li>
      <li>Ignorer les règles d'accessibilité</li>
    </ul>
  </div>
</div>

<h2>Ordre de lecture obligatoire</h2>
<p>Avant toute action dans ce dépôt, un agent doit lire dans cet ordre :</p>
<table>
  <thead><tr><th>Fichier</th><th>Rôle</th></tr></thead>
  <tbody>${readingOrder.map(([f,r]) => `<tr><td><code>${f}</code></td><td>${r}</td></tr>`).join('')}</tbody>
</table>

<h2>Règle d'escalade</h2>
<p>Toute modification touchant les tokens sémantiques ou de composant déclenche une escalade automatique vers un humain. Les agents ne peuvent pas approuver leurs propres modifications sur ces tokens.</p>

<h2>Règle de nommage — rappel</h2>
<pre class="code-block"><code class="lang-css">/* ✅ Correct — intention lisible par un agent */
color: var(--ds-component-button-primary-background);

/* ❌ Interdit — valeur brute, aucune intention */
color: #0d74ce;

/* ❌ Interdit — token primitif utilisé directement */
color: var(--ds-primitive-color-blue-11);</code></pre>

<h2>Compétences (Skills)</h2>
<table>
  <thead><tr><th>Skill</th><th>Rôle</th></tr></thead>
  <tbody>
    <tr><td><code>.claude/skills/ai-ds-composer.md</code></td><td>Compose des interfaces depuis du langage naturel en respectant les contrats</td></tr>
    <tr><td><code>.claude/skills/ai-component-metadata.md</code></td><td>Génère les métadonnées de composant</td></tr>
    <tr><td><code>.claude/skills/codebase-index.md</code></td><td>Index du dépôt pour navigation rapide</td></tr>
  </tbody>
</table>
`;

  write(path.join(DIST, 'agents/index.html'), layout({ title: 'Pour les agents IA', depth: 1, body }));
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
  console.log('\nAgentic Design System — build\n');
  ensureDir(DIST);
  ensureDir(path.join(DIST, 'foundations'));
  ensureDir(path.join(DIST, 'components'));
  ensureDir(path.join(DIST, 'tokens'));
  ensureDir(path.join(DIST, 'decisions'));
  ensureDir(path.join(DIST, 'agents'));

  write(path.join(DIST, 'tokens.css'), tokensCSS());
  write(path.join(DIST, 'site.css'), siteCSS());
  write(path.join(DIST, 'site.js'), siteJS());

  const adrs = loadADRs();
  buildHome(adrs);
  buildColor();
  buildSpacing();
  buildTypography();
  buildComponentsIndex();
  buildButton();
  buildTokens();
  buildDecisionsIndex(adrs);
  adrs.forEach(adr => buildADR(adr, adrs));
  buildAgents();

  const total = 7 + adrs.length;
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
