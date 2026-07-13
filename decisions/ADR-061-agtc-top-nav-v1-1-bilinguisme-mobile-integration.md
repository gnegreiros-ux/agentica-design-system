# ADR-061 — `agtc-top-nav` v1.1 : bilinguisme, mobile shadow DOM, intégration site

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** component
> **Chemin logique:** decisions/ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-060-agtc-top-nav-implementation.md
> **Relations:** components/agtc-top-nav.js, site/build.js, decisions/ADR-060-agtc-top-nav-implementation.md

> **English summary:** Integrating the newly formalized `agtc-top-nav` component (ADR-060) into the live site surfaced three gaps: the component needed to render bilingual labels automatically, its mobile responsive styles lived in `site.css` and couldn't reach into the shadow DOM, and the site had no bundler for Lit's ES module imports. This ADR adds a `MutationObserver`-driven `_lang` property that watches `data-lang` on `<html>` and re-renders automatically, moves all mobile CSS into the component itself (exposed via a `:host(.open)` state), and introduces an esbuild IIFE bundling step (`bundleComponents()`) so the component can be dropped in with a single `<script defer>` tag, with no external CDN dependency.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

ADR-060 a défini le composant `agtc-top-nav` (formalisation). L'étape suivante était
l'intégration effective dans le site — première validation réelle du contrat composant.

Trois obstacles identifiés avant intégration :

1. **Bilinguisme** — le composant utilisait `label` (langue neutre), mais le site a deux langues
   (FR/EN) commutées via `data-lang` sur `<html>`. Il fallait que le composant gère
   automatiquement le rendu dans la bonne langue.

2. **Mobile shadow DOM** — les styles mobiles (`.top-nav{display:none}`, `.top-nav.open`,
   `.top-nav a` responsive) étaient dans `site.css`. Ils ne pénètrent pas le shadow DOM.
   Il fallait les déplacer dans le CSS du composant.

3. **Bundling** — le composant utilise `import { LitElement, ... } from 'lit'`. Le site
   génère du HTML statique sans bundler. Il fallait produire un bundle IIFE utilisable
   sans système de modules.

Principe directeur : « S'il manque quelque chose au système pour alimenter le site,
construisons le dans le système d'abord. »

---

## Décision

### 1. Bilinguisme via `MutationObserver`

Ajout d'une propriété reactive `_lang` (interne) dans le composant.
En `connectedCallback()`, le composant :
- lit `document.documentElement.dataset.lang` pour initialiser `_lang`
- installe un `MutationObserver` sur `<html>` filtré sur `data-lang`
- met à jour `_lang` et déclenche un re-render automatique à chaque changement

Structure d'item étendue : `{ label?, labelFr?, labelEn?, href, cta? }`
- `labelFr` affiché quand `data-lang="fr"` (prioritaire)
- `labelEn` affiché quand `data-lang="en"` (prioritaire)
- `label` : fallback langue neutre

**Raison :** le composant se charge lui-même de la langue — le consommateur passe
simplement les deux variantes. Aucun re-binding nécessaire côté site.

### 2. Mobile CSS dans shadow DOM

Le CSS mobile a été déplacé **entièrement dans `agtc-top-nav.js`** via `@media (max-width: 768px)`.
Le composant expose son état d'ouverture via `:host(.open) nav` (classe CSS sur l'hôte).

Le site JS contrôle l'ouverture : `topNav.classList.toggle('open')`.
`aria-controls="site-top-nav"` sur le hamburger pointe vers `<agtc-top-nav id="site-top-nav">`.

**Raison :** le shadow DOM encapsule le comportement responsive — le composant est
maintenant autonome (aucune dépendance sur `site.css` pour ses états internes).

### 3. Bundling via esbuild IIFE

Ajout d'une fonction `bundleComponents()` dans `site/build.js` (CJS) utilisant
`child_process.execSync` pour appeler le binaire esbuild disponible via les
`node_modules` racines (dépendance transitive de Vite/Storybook).

Format : `--format=iife --bundle --minify` → bundle auto-exécutable, aucun import map requis.
Chargement : `<script src="${base}components/agtc-top-nav.js" defer></script>` dans `<head>`.

Initialisation différée : script inline utilisant `customElements.whenDefined('agtc-top-nav').then(init)`
pour garantir que l'élément est défini avant d'assigner `.items` et `.current`.

**Raison :** solution autonome sans nouvelle dépendance ni CDN externe —
conforme au principe de souveraineté numérique (ADR-004).

---

## Patterns UX de référence

Tous les patterns de ADR-060 s'appliquent. Aucun nouveau pattern UX — uniquement
des décisions d'implémentation technique (i18n, bundling, shadow DOM responsive).

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Import map + CDN pour Lit** | Dépendance CDN externe — contre ADR-004 (souveraineté numérique) |
| **CSS parts (`::part(nav)`)** | La syntaxe `host.class::part()` ne couvre pas les éléments enfants des parts |
| **`open` comme attribut HTML (reflect)** | `classList.toggle` est plus simple — `:host(.open)` est identique à `:host([open])` pour ce use case |
| **Gérer la langue côté site (re-binding)** | Fragile — nécessiterait d'écouter le toggle de langue dans chaque page |
| **Composant vanilla (sans Lit)** | Deux implémentations du même composant — maintien impossible |

---

## Conséquences

**Pour le site :**
- Plus de `.top-nav` CSS dans `site.css` — le composant gère son propre CSS
- La sélection active JS `document.querySelectorAll('.top-nav a')` est supprimée
- Le menu mobile JS cible maintenant `document.querySelector('agtc-top-nav')`
- `aria-controls="site-top-nav"` (anciennement `main-nav`) sur le bouton hamburger
- Build output : `site/dist/components/agtc-top-nav.js` (~21kb, IIFE bundlé)

**Pour le design system :**
- `components/agtc-top-nav.js` v1.1 — rétrocompatible (l'API `label` fonctionne toujours)
- `bundleComponents()` dans `site/build.js` — extensible à d'autres composants

**Pour les agents :**
- Items bilinguaux préférés : `{ labelFr, labelEn, href }` — pas `{ label }`
- Mobile géré par le composant — ne pas ajouter de CSS `.top-nav*` dans `site.css`

---

## Incidents ou déclencheurs

Suite directe de ADR-060 : formalisation du composant → intégration site.
Les trois obstacles (bilinguisme, shadow DOM, bundling) ont été identifiés lors
de la première tentative d'intégration (2026-06-15).
