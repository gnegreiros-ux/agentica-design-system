# ADR-061 — `agtc-top-nav` v1.1: bilingualism, mobile shadow DOM, site integration

> **Date:** 2026-06-15
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** component
> **Logical path:** decisions/ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md
> **Read before:** AGENTS.md, DESIGN.md, decisions/ADR-060-agtc-top-nav-implementation.md
> **Relations:** components/agtc-top-nav.js, site/build.js, decisions/ADR-060-agtc-top-nav-implementation.md

---

## Context

ADR-060 defined the `agtc-top-nav` component (formalization). The next step was its
actual integration into the site — the first real validation of the component contract.

Three obstacles identified before integration:

1. **Bilingualism** — the component used `label` (language-neutral), but the site has two
   languages (FR/EN) switched via `data-lang` on `<html>`. The component needed to
   automatically render in the right language.

2. **Mobile shadow DOM** — the mobile styles (`.top-nav{display:none}`, `.top-nav.open`,
   responsive `.top-nav a`) lived in `site.css`. They don't penetrate the shadow DOM.
   They needed to be moved into the component's CSS.

3. **Bundling** — the component uses `import { LitElement, ... } from 'lit'`. The site
   generates static HTML with no bundler. An IIFE bundle usable without a module system
   was needed.

Guiding principle: "If the system is missing something needed to power the site, let's
build it in the system first."

---

## Decision

### 1. Bilingualism via `MutationObserver`

Added a reactive (internal) `_lang` property to the component.
In `connectedCallback()`, the component:
- reads `document.documentElement.dataset.lang` to initialize `_lang`
- installs a `MutationObserver` on `<html>` filtered on `data-lang`
- updates `_lang` and triggers an automatic re-render on every change

Extended item structure: `{ label?, labelFr?, labelEn?, href, cta? }`
- `labelFr` shown when `data-lang="fr"` (priority)
- `labelEn` shown when `data-lang="en"` (priority)
- `label`: language-neutral fallback

**Reason:** the component handles the language itself — the consumer simply passes both
variants. No re-binding needed on the site side.

### 2. Mobile CSS in shadow DOM

The mobile CSS was moved **entirely into `agtc-top-nav.js`** via `@media (max-width: 768px)`.
The component exposes its open state via `:host(.open) nav` (CSS class on the host).

The site JS controls the opening: `topNav.classList.toggle('open')`.
`aria-controls="site-top-nav"` on the hamburger button points to `<agtc-top-nav id="site-top-nav">`.

**Reason:** the shadow DOM encapsulates the responsive behavior — the component is now
self-contained (no dependency on `site.css` for its internal states).

### 3. Bundling via esbuild IIFE

Added a `bundleComponents()` function in `site/build.js` (CJS) using
`child_process.execSync` to call the esbuild binary available via the root
`node_modules` (a transitive dependency of Vite/Storybook).

Format: `--format=iife --bundle --minify` → self-executing bundle, no import map required.
Loading: `<script src="${base}components/agtc-top-nav.js" defer></script>` in `<head>`.

Deferred initialization: inline script using
`customElements.whenDefined('agtc-top-nav').then(init)` to guarantee the element is
defined before assigning `.items` and `.current`.

**Reason:** a self-contained solution with no new dependency or external CDN —
consistent with the digital sovereignty principle (ADR-004).

---

## Reference UX patterns

All patterns from ADR-060 apply. No new UX pattern — only technical implementation
decisions (i18n, bundling, responsive shadow DOM).

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **Import map + CDN for Lit** | External CDN dependency — against ADR-004 (digital sovereignty) |
| **CSS parts (`::part(nav)`)** | The `host.class::part()` syntax doesn't cover the child elements of the parts |
| **`open` as an HTML attribute (reflect)** | `classList.toggle` is simpler — `:host(.open)` is identical to `:host([open])` for this use case |
| **Handle language on the site side (re-binding)** | Fragile — would require listening for the language toggle on every page |
| **Vanilla component (without Lit)** | Two implementations of the same component — impossible to maintain |

---

## Consequences

**For the site:**
- No more `.top-nav` CSS in `site.css` — the component manages its own CSS
- The JS active-link selection `document.querySelectorAll('.top-nav a')` is removed
- The mobile menu JS now targets `document.querySelector('agtc-top-nav')`
- `aria-controls="site-top-nav"` (formerly `main-nav`) on the hamburger button
- Build output: `site/dist/components/agtc-top-nav.js` (~21kb, bundled IIFE)

**For the design system:**
- `components/agtc-top-nav.js` v1.1 — backward compatible (the `label` API still works)
- `bundleComponents()` in `site/build.js` — extensible to other components

**For agents:**
- Bilingual items preferred: `{ labelFr, labelEn, href }` — not `{ label }`
- Mobile handled by the component — do not add `.top-nav*` CSS in `site.css`

---

## Incidents or triggers

Direct follow-up to ADR-060: component formalization → site integration.
The three obstacles (bilingualism, shadow DOM, bundling) were identified during the
first integration attempt (2026-06-15).

<!-- FR -->

# ADR-061 — `agtc-top-nav` v1.1 : bilinguisme, mobile shadow DOM, intégration site

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** component
> **Chemin logique:** decisions/ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md
> **Lecture avant:** AGENTS.md, DESIGN.md, decisions/ADR-060-agtc-top-nav-implementation.md
> **Relations:** components/agtc-top-nav.js, site/build.js, decisions/ADR-060-agtc-top-nav-implementation.md

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
