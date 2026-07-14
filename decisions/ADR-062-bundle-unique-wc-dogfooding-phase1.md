# ADR-062 — Single `agtc.js` bundle + Web Components dogfooding Phase 1

> **Date:** 2026-06-15
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** architecture
> **Logical path:** decisions/ADR-062-bundle-unique-wc-dogfooding-phase1.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md
> **Relations:** components/index.js, site/build.js, decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-042-agtc-banner-implementation.md, decisions/ADR-034-agtc-badge-implementation.md, decisions/ADR-043-agtc-link-implementation.md, decisions/ADR-044-agtc-segmented-implementation.md

---

## Context

ADR-061 introduced esbuild IIFE bundling for `agtc-top-nav` into an individual file.
The next step (Phase 1 of the "Web Components / Styles / Spacing" plan) was:

1. **Single bundle** — replace the N individual files with a single `agtc.js` grouping
   all 16 components. Reduce the `<head>` entry-point surface (one `<script defer>`).

2. **Dogfooding Phase 1** — the documentation pages used `<button class="agtc-button">`,
   `<div class="agtc-banner">`, `<span class="agtc-badge">`, `<a class="agtc-link">` and
   `<div class="agtc-segmented">` simulated in CSS. They needed to consume the real WCs.

Guiding principle: "The site MUST consume the design system — in the event of a
discrepancy, the component is the source of truth."

---

## Decision

### 1. `components/index.js` — single entry point

Created a `components/index.js` file importing all components in dependency order
(`agtc-icon` first, a dependency of all the others).

esbuild bundles this entry point into an IIFE: `components/index.js` → `site/dist/components/agtc.js`.

**Reason:** a single `<script defer src="${base}components/agtc.js">` in `<head>`, all
Custom Elements registered at once, no risk of partial loading.

### 2. Replacing CSS simulations with real WCs

| Doc page | Element replaced | WC used |
|------------|-----------------|------------|
| `button.html` | `<button class="agtc-button">` (12 occurrences) | `<agtc-button variant="...">` |
| `banner.html` | `<div class="agtc-banner">` (demo) | `<agtc-banner variant="...">` |
| `badge.html` | `<span>` inline style (demo) | `<agtc-badge variant="..." size="...">` |
| `link.html` | `<a class="agtc-link">` (3 demo) | `<agtc-link href="..." [external\|underline]>` |
| `segmented.html` | `<div class="agtc-segmented">` (demo) | `<agtc-segmented label="..." options='...' value="...">` |
| All pages | `contributionBanner()` | `<agtc-banner variant="brand" icon="github">` |
| `get-started.html` | 2 × `<div class="agtc-banner">` | `<agtc-banner variant="info/brand">` |
| `decisions/index.html` | `<span class="agtc-badge success sm">` (61 lines) | `<agtc-badge variant="success" size="sm" icon="circle-check">` |
| Individual ADRs | class-based `statusBadge` | `<agtc-badge variant="success" size="sm" icon="circle-check">` |

### 3. Exception maintained — stylistically primary links

The `<a class="agtc-button primary" href="...">` in the hero and navigation sections
intentionally remain a CSS class: `agtc-button` renders a `<button>`, not an `<a>`.
This pattern is semantically correct (ADR-031, confirmed in ADR-061).

### 4. Exception maintained — lang-switch

`<div class="agtc-segmented lang-switch">` in `layout()`: coupled custom JS
(`data-lang` on `<html>`, `localStorage`). Migration to `<agtc-segmented>` planned
for Phase 2 with adaptation of the language-toggle JS.

---

## Techniques used

**`agtc-segmented` with JSON options as an attribute:**
Lit v3 converts `{ type: Array }` via `JSON.parse()` from the HTML attribute.
```html
<agtc-segmented label="Langue"
  options='[{"value":"fr","label":"FR"},{"value":"en","label":"EN"}]'
  value="fr">
</agtc-segmented>
```

**`agtc-link external` for external links:**
The `external` attribute on `<agtc-link>` automatically adds the arrow-up-right icon
and the `<span class="visually-hidden"> (opens in a new tab)</span>`.
The manual `extIcon` variable is removed.

**`agtc-banner` with `<slot>` for bilingualism:**
The `heading` attribute is a string — for bilingual headings, `<strong>` is passed in
the default slot rather than using the `heading` attribute.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **N individual files** (`agtc-button.js`, `agtc-banner.js`…) | N HTTP requests, N `<script defer>` in `<head>`, risk of a race condition between loads |
| **CDN for Lit** + native modules | Against ADR-004 (digital sovereignty) and ADR-061 |
| **Keep the CSS simulations** for demos | Against the dogfooding principle — the component page must show the real component |

---

## Consequences

**For the site:**
- `site/dist/components/agtc.js` (~526kb, all Lit components bundled)
- A single `<script defer>` in each page (simplifies `<head>`)
- The documentation pages now show the real, interactive WCs (critical with confirmation, interactive segmented, etc.)

**For the design system:**
- `components/index.js` becomes the official entry point for consumers without a bundler
- `bundleComponents()` in `site/build.js` simplified (1 bundle instead of N)

**For agents:**
- Adding a component = adding `import './agtc-<name>.js'` to `components/index.js`
- No change to the build sequence

---

## Incidents or triggers

Direct follow-up to ADR-061 (individual `agtc-top-nav` bundle) + user directive
"Web components / Styles / Spacing" defining the three phases of the site refactor (2026-06-15).

<!-- FR -->

# ADR-062 — Bundle unique `agtc.js` + dogfooding Web Components Phase 1

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** architecture
> **Chemin logique:** decisions/ADR-062-bundle-unique-wc-dogfooding-phase1.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md
> **Relations:** components/index.js, site/build.js, decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-042-agtc-banner-implementation.md, decisions/ADR-034-agtc-badge-implementation.md, decisions/ADR-043-agtc-link-implementation.md, decisions/ADR-044-agtc-segmented-implementation.md

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
