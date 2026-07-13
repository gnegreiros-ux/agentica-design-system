# ADR-062 — Bundle unique `agtc.js` + dogfooding Web Components Phase 1

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** architecture
> **Chemin logique:** decisions/ADR-062-bundle-unique-wc-dogfooding-phase1.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md
> **Relations:** components/index.js, site/build.js, decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-042-agtc-banner-implementation.md, decisions/ADR-034-agtc-badge-implementation.md, decisions/ADR-043-agtc-link-implementation.md, decisions/ADR-044-agtc-segmented-implementation.md

> **English summary:** Following the per-component bundling introduced for `agtc-top-nav` (ADR-061), this ADR completes Phase 1 of the site's Web Components rollout: a single `components/index.js` entry point bundles all 16 components into one `agtc.js` file (one `<script defer>` instead of many), and the documentation pages replace their CSS-simulated `.agtc-button`/`.agtc-banner`/`.agtc-badge`/`.agtc-link`/`.agtc-segmented` markup with the real Web Components — enforcing the "the site must consume the design system" principle, with two deliberate exceptions (button-styled links, and the language-switch segmented control) kept as-is for now.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

ADR-061 a introduit le bundling esbuild IIFE pour `agtc-top-nav` dans un fichier individuel.
L'étape suivante (Phase 1 du plan "Web Components / Styles / Spacing") était :

1. **Bundle unique** — remplacer les N fichiers individuels par un seul `agtc.js` regroupant
   les 16 composants. Réduire la surface d'entrée de `<head>` (un seul `<script defer>`).

2. **Dogfooding Phase 1** — les pages de documentation utilisaient des `<button class="agtc-button">`,
   `<div class="agtc-banner">`, `<span class="agtc-badge">`, `<a class="agtc-link">` et
   `<div class="agtc-segmented">` simulés en CSS. Elles devaient consommer les vrais WC.

Principe directeur : « Le site DOIT consommer le design system — en cas d'écart, le composant fait foi. »

---

## Décision

### 1. `components/index.js` — point d'entrée unique

Création d'un fichier `components/index.js` important tous les composants en ordre de
dépendance (`agtc-icon` en premier, dépendance de tous les autres).

esbuild bundle ce point d'entrée en IIFE : `components/index.js` → `site/dist/components/agtc.js`.

**Raison :** un seul `<script defer src="${base}components/agtc.js">` dans `<head>`,
tous les Custom Elements enregistrés d'un coup, aucun risque de chargement partiel.

### 2. Remplacement des simulations CSS par les vrais WC

| Page de doc | Élément remplacé | WC utilisé |
|------------|-----------------|------------|
| `button.html` | `<button class="agtc-button">` (12 occurrences) | `<agtc-button variant="...">` |
| `banner.html` | `<div class="agtc-banner">` (demo) | `<agtc-banner variant="...">` |
| `badge.html` | `<span>` inline style (demo) | `<agtc-badge variant="..." size="...">` |
| `link.html` | `<a class="agtc-link">` (3 demo) | `<agtc-link href="..." [external\|underline]>` |
| `segmented.html` | `<div class="agtc-segmented">` (demo) | `<agtc-segmented label="..." options='...' value="...">` |
| Toutes pages | `contributionBanner()` | `<agtc-banner variant="brand" icon="github">` |
| `get-started.html` | 2 × `<div class="agtc-banner">` | `<agtc-banner variant="info/brand">` |
| `decisions/index.html` | `<span class="agtc-badge success sm">` (61 lignes) | `<agtc-badge variant="success" size="sm" icon="circle-check">` |
| ADR individuels | `statusBadge` class-based | `<agtc-badge variant="success" size="sm" icon="circle-check">` |

### 3. Exception maintenue — liens stylistiquement primaires

Les `<a class="agtc-button primary" href="...">` dans les sections hero et navigation
restent intentionnellement en classe CSS : `agtc-button` rend un `<button>`, pas un `<a>`.
Ce pattern est sémantiquement correct (ADR-031, confirmé en ADR-061).

### 4. Exception maintenue — lang-switch

`<div class="agtc-segmented lang-switch">` dans `layout()` : JS personnalisé couplé
(`data-lang` sur `<html>`, `localStorage`). Migration vers `<agtc-segmented>` à prévoir
en Phase 2 avec adaptation du JS de toggle de langue.

---

## Techniques retenues

**`agtc-segmented` avec options JSON en attribut :**
Lit v3 convertit `{ type: Array }` via `JSON.parse()` depuis l'attribut HTML.
```html
<agtc-segmented label="Langue"
  options='[{"value":"fr","label":"FR"},{"value":"en","label":"EN"}]'
  value="fr">
</agtc-segmented>
```

**`agtc-link external` pour les liens externes :**
L'attribut `external` sur `<agtc-link>` ajoute automatiquement l'icône arrow-up-right
et le `<span class="visually-hidden"> (ouvre dans un nouvel onglet)</span>`.
La variable `extIcon` manuelle est supprimée.

**`agtc-banner` avec `<slot>` pour bilinguisme :**
Le `heading` attribute est une chaîne — pour les têtes bilingues, on passe `<strong>` dans
le slot par défaut plutôt que d'utiliser l'attribut `heading`.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **N fichiers individuels** (`agtc-button.js`, `agtc-banner.js`…) | N requêtes HTTP, N `<script defer>` dans `<head>`, risque de race condition entre chargements |
| **CDN pour Lit** + modules natifs | Contre ADR-004 (souveraineté numérique) et ADR-061 |
| **Garder les simulations CSS** pour les démos | Contre le principe de dogfooding — la page composant doit montrer le vrai composant |

---

## Conséquences

**Pour le site :**
- `site/dist/components/agtc.js` (~526kb, tous composants Lit bundlés)
- Un seul `<script defer>` dans chaque page (simplifie `<head>`)
- Les pages de documentation montrent maintenant les vrais WC interactifs (critical avec confirmation, segmented interactif, etc.)

**Pour le design system :**
- `components/index.js` devient le point d'entrée officiel pour les consommateurs sans bundler
- `bundleComponents()` dans `site/build.js` simplifié (1 bundle au lieu de N)

**Pour les agents :**
- Ajouter un composant = ajouter `import './agtc-<nom>.js'` dans `components/index.js`
- Pas de changement dans la séquence de build

---

## Incidents ou déclencheurs

Suite directe de ADR-061 (bundle individuel agtc-top-nav) + directive utilisateur
"Web components / Styles / Spacing" définissant les trois phases de refactoring du site (2026-06-15).
