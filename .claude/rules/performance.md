# Rule : performance

> Standards de performance web pour le site Agentica et tous les consommateurs du design system.
> Issus de l'audit du 2026-06-22 (home page : 1 453 KB → 65 KB, réduction 95 %).
> **Type:** rule
> **Chemin logique:** .claude/rules/performance.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/development.md, .claude/rules/code-style.md

---

## Règle absolue

> **Aucune page ne doit dépasser 150 KB de HTML initial (sans les assets différés).**
> Le contenu above-the-fold doit s'afficher en moins de 1,5 s sur une connexion 4G (10 Mbps).

---

## Audit de référence — 2026-06-22

| Métrique | Avant | Après | Méthode |
|---------|-------|-------|---------|
| `index.html` | 1 453 KB | **65 KB** | SVG lazy-load |
| SVG inline home | 1 390 KB | **0 KB** | Extraction + fetch |
| Google Fonts cascade | 3 allers-retours | **1 aller-retour** | `@import` → `<link>` |
| CLS illustrations | non contrôlé | **0** | `aspect-ratio` CSS |

---

## Standard 1 — SVG volumineux : lazy-load obligatoire

Toute illustration SVG **> 10 KB** doit être chargée lazily — jamais inlinée dans le HTML.

### Pattern obligatoire dans `site/build.js`

```js
// ❌ INTERDIT — inline dans le template HTML
const svgPipeline = read(path.join(ROOT, 'illustrations/pipeline-tokens.svg'));
// → injecte 490 KB dans chaque réponse HTTP

// ✅ OBLIGATOIRE — placeholder lazy-load
const illusPipeline = `<div class="illus-block illus-lazy" data-svg="${base}img/pipeline-tokens.svg"></div>`;
```

### Copie dans `build()` obligatoire

```js
ensureDir(path.join(DIST, 'img'));
['pipeline-tokens.svg', 'human-last-word.svg', 'multi-platform.svg'].forEach(f => {
  const src = path.join(ROOT, 'illustrations', f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, 'img', f));
});
```

### Loader dans `siteJS()` obligatoire

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

**Pourquoi injecter inline plutôt qu'un `<img>` ?**
Les SVG Agentica utilisent `var(--agtc-semantic-color-*)` pour le dark mode. Un `<img>` crée un contexte isolé — les CSS custom properties du document parent ne s'appliquent pas. L'injection inline via `fetch` + `innerHTML` préserve le dark mode.

### CSS placeholder anti-CLS

```css
.illus-lazy[data-svg] {
  aspect-ratio: 800/420;
  width: 100%;
  background: var(--agtc-semantic-color-background-subtle);
  display: block;
}
```

Le `aspect-ratio` doit correspondre aux dimensions réelles du SVG pour éviter tout Cumulative Layout Shift (CLS).

---

## Standard 2 — Polices web : `<link>` dans `<head>`, jamais `@import`

### ❌ INTERDIT — génère une cascade de 3 allers-retours réseau

```css
/* Dans site.css */
@import url('https://fonts.googleapis.com/css2?...');
```

Séquence bloquante :
1. Télécharger `site.css`
2. Parser → trouver `@import`
3. Aller-retour vers `fonts.googleapis.com`
4. Recevoir CSS → trouver les URL de `.woff2`
5. Télécharger les fichiers de police

### ✅ OBLIGATOIRE — dans le `<head>` HTML, après les `preconnect`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap">
```

**Règles complémentaires :**
- Toujours inclure `&display=swap` — affiche le texte avec la police de fallback pendant le chargement (évite le FOIT)
- Toujours inclure les deux `preconnect` — réduit la latence DNS+TLS de ~150 ms
- Ne pas supprimer les `preconnect` lors d'audits CSS (erreur documentée ADR-059 pattern)

---

## Standard 3 — Images : lazy loading et format

### `loading="lazy"` obligatoire sur toute image below the fold

```html
<!-- ✅ -->
<img src="img/schema.png" loading="lazy" width="800" height="420" alt="…">

<!-- ❌ -->
<img src="img/schema.png" alt="…">
```

### `fetchpriority="high"` sur l'image LCP (hero)

```html
<img src="img/hero.webp" fetchpriority="high" width="1200" height="630" alt="…">
```

### Format WebP obligatoire pour toute image raster > 100 KB

```html
<picture>
  <source srcset="img/photo.webp" type="image/webp">
  <img src="img/photo.png" loading="lazy" width="800" height="500" alt="…">
</picture>
```

Gain attendu : **–75 à –80 %** par rapport au PNG original.

---

## Standard 4 — JavaScript : minification et scope

### Le bundle `agtc.js` est déjà minifié par esbuild (`--minify`)

```js
// site/build.js — bundleComponents()
execSync(`"${esbuildBin}" "${entry}" --bundle --format=iife --outfile="${out}" --minify`, ...);
```

Ne pas retirer le flag `--minify`. Ne pas ajouter de JS non-minifié à côté.

### Ne pas charger de JS inutile sur les pages de contenu pur

Les pages ADR, fondations textuelles, documentation pure n'ont pas besoin des composants de démo (tabs, button, code-block interactif). Si `agtc.js` est scindé à l'avenir, les pages de contenu ne doivent charger que le bundle `nav` (~80 KB estimé).

---

## Standard 5 — HTML : éviter le contenu dupliqué excessif

Le système bilingue FR/EN double le texte visible (`<span class="lang-fr">` + `<span class="lang-en">`). C'est acceptable pour le texte courant. En revanche :

```
❌ INTERDIT : dupliquer des blocs SVG ou des composants entiers pour la langue
✅ OBLIGATOIRE : le texte bilingue est dans les spans, l'asset (SVG, image) est unique
```

---

## Checklist quality gate — avant chaque commit touchant le site

```
✅ index.html < 150 KB (vérifiable : wc -c site/dist/index.html)
✅ Aucun SVG > 10 KB inline dans le HTML
✅ Google Fonts chargé via <link>, pas @import
✅ Toutes les images ont loading="lazy" (sauf hero LCP)
✅ Toutes les images ont width + height explicites (anti-CLS)
✅ validateCssVars() : 0 variable fantôme
✅ node site/build.js : 0 erreur
```

---

## Règles pour les agents

```
✅ Toujours utiliser le pattern illus-lazy pour les SVG > 10 KB
✅ Toujours vérifier la taille de index.html après modification du template home
✅ Conserver les <link rel="preconnect"> et <link rel="stylesheet"> pour Google Fonts
❌ Jamais ajouter @import dans site.css
❌ Jamais inliner un SVG d'illustration directement dans un template HTML
❌ Jamais supprimer le flag --minify du bundleComponents()
❌ Jamais ajouter une image sans width, height et loading="lazy"
```
