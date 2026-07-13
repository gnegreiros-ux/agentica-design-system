---
paths:
  - "site/**"
---

# Rule: performance

> Web performance standards for the Agentica site and all design system consumers.
> Sourced from the 2026-06-22 audit (home page: 1,453 KB → 65 KB, 95% reduction).
> **Type:** rule
> **Logical path:** .claude/rules/performance.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/development.md, .claude/rules/code-style.md

---

## Absolute rule

> **No page may exceed 150 KB of initial HTML (excluding lazily loaded assets).**
> Above-the-fold content must render in under 1.5s on a 4G connection (10 Mbps).

---

## Reference audit — 2026-06-22

| Metric | Before | After | Method |
|---------|-------|-------|---------|
| `index.html` | 1,453 KB | **65 KB** | SVG lazy-load |
| Home inline SVG | 1,390 KB | **0 KB** | Extraction + fetch |
| Google Fonts cascade | 3 round trips | **1 round trip** | `@import` → `<link>` |
| Illustration CLS | uncontrolled | **0** | CSS `aspect-ratio` |

---

## Standard 1 — Large SVGs: mandatory lazy-load

Any SVG illustration **> 10 KB** must be lazy-loaded — never inlined in the HTML.

> **Note (2026-07-10):** the 3 SVG diagrams (`pipeline-tokens.svg`, `human-last-word.svg`,
> `multi-platform.svg`) that illustrated this standard were replaced by the PNG illustration
> system (`Brand/illustrations/`, see `.claude/rules/illustrations-source.md`) and
> removed from the repository. The `illus-lazy`/`data-svg` pattern remains the mandatory
> standard for any future SVG > 10 KB — the example below is generic, to be adapted to
> the actual file name.

### Mandatory pattern in `site/build.js`

```js
// ❌ FORBIDDEN — inlined in the HTML template
const svgDiagram = read(path.join(ROOT, 'illustrations/illustration-name.svg'));
// → injects the SVG's full weight into every HTTP response

// ✅ REQUIRED — lazy-load placeholder
const illusDiagram = `<div class="illus-block illus-lazy" data-svg="${base}img/illustration-name.svg"></div>`;
```

### Mandatory copy in `build()`

```js
ensureDir(path.join(DIST, 'img'));
['illustration-name.svg'].forEach(f => {
  const src = path.join(ROOT, 'illustrations', f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, 'img', f));
});
```

### Mandatory loader in `siteJS()`

```js
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
```

**Why inject inline rather than an `<img>`?**
Agentica SVGs use `var(--agtc-semantic-color-*)` for dark mode. An `<img>` creates an isolated context — the parent document's CSS custom properties don't apply. Inline injection via `fetch` + `innerHTML` preserves dark mode.

### Anti-CLS placeholder CSS

```css
.illus-lazy[data-svg] {
  aspect-ratio: 800/420;
  width: 100%;
  background: var(--agtc-semantic-color-background-subtle);
  display: block;
}
```

`aspect-ratio` must match the SVG's real dimensions to prevent any Cumulative Layout Shift (CLS).

---

## Standard 2 — Web fonts: `<link>` in `<head>`, never `@import`

### ❌ FORBIDDEN — creates a cascade of 3 network round trips

```css
/* In site.css */
@import url('https://fonts.googleapis.com/css2?...');
```

Blocking sequence:
1. Download `site.css`
2. Parse → find `@import`
3. Round trip to `fonts.googleapis.com`
4. Receive CSS → find the `.woff2` URLs
5. Download the font files

### ✅ REQUIRED — in the HTML `<head>`, after the `preconnect` tags

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap">
```

**Additional rules:**
- Always include `&display=swap` — shows text in the fallback font while loading (avoids FOIT)
- Always include both `preconnect` tags — cuts DNS+TLS latency by ~150 ms
- Don't remove `preconnect` tags during CSS audits (documented ADR-059 pattern)

---

## Standard 3 — Images: lazy loading and format

### `loading="lazy"` mandatory on every below-the-fold image

```html
<!-- ✅ -->
<img src="img/schema.png" loading="lazy" width="800" height="420" alt="…">

<!-- ❌ -->
<img src="img/schema.png" alt="…">
```

### `fetchpriority="high"` on the LCP image (hero)

```html
<img src="img/hero.webp" fetchpriority="high" width="1200" height="630" alt="…">
```

### WebP format mandatory for any raster image > 100 KB

```html
<picture>
  <source srcset="img/photo.webp" type="image/webp">
  <img src="img/photo.png" loading="lazy" width="800" height="500" alt="…">
</picture>
```

Expected gain: **–75 to –80%** compared to the original PNG.

---

## Standard 4 — JavaScript: minification and scope

### The `agtc.js` bundle is already minified by esbuild (`--minify`)

```js
// site/build.js — bundleComponents()
execSync(`"${esbuildBin}" "${entry}" --bundle --format=iife --outfile="${out}" --minify`, ...);
```

Don't remove the `--minify` flag. Don't add unminified JS alongside it.

### Don't load unnecessary JS on pure-content pages

ADR pages, plain text foundation pages, and pure documentation pages don't need the demo
components (tabs, button, interactive code-block). If `agtc.js` is split up in the future,
content pages should only load the `nav` bundle (~80 KB estimated).

---

## Standard 5 — HTML: avoid excessive duplicate content

The bilingual FR/EN system doubles up visible text (`<span class="lang-fr">` +
`<span class="lang-en">`). This is acceptable for running text. However:

```
❌ FORBIDDEN: duplicating SVG blocks or entire components for each language
✅ REQUIRED: bilingual text lives in the spans, the asset (SVG, image) is unique
```

---

## Checklist quality gate — before every commit touching the site

```
✅ index.html < 150 KB (verifiable: wc -c site/dist/index.html)
✅ No SVG > 10 KB inlined in the HTML
✅ Google Fonts loaded via <link>, not @import
✅ Every image has loading="lazy" (except the hero LCP image)
✅ Every image has explicit width + height (anti-CLS)
✅ validateCssVars(): 0 phantom variables
✅ node site/build.js: 0 errors
```

---

## Rules for agents

```
✅ Always use the illus-lazy pattern for SVGs > 10 KB
✅ Always check index.html's size after modifying the home template
✅ Keep the <link rel="preconnect"> and <link rel="stylesheet"> tags for Google Fonts
❌ Never add @import in site.css
❌ Never inline an illustration SVG directly in an HTML template
❌ Never remove the --minify flag from bundleComponents()
❌ Never add an image without width, height, and loading="lazy"
```
