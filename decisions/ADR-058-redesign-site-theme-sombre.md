# ADR-058 — Site redesign: dark theme and CSS extension tokens

**Date:** 2026-06-12
**Status:** Accepted
**Author:** Guilherme Negreiros
**Relations:** ADR-051 (illustration), ADR-052 (DTCG), ADR-057 (two contexts), `Redesign/AI anti-patters.md`, `site/build.js`

---

## Context

The `Redesign/` folder contains a complete reference mockup (index.html, color.html, site.css,
tokens.css, site.js) prepared outside the build system. It introduces: a dark theme, a
redesigned hero with a 3D visualization of the three token levels, CSS extension tokens
(shadows, gradients, type scale) and animations.

The site had neither a dark theme nor formalized shadow/gradient tokens. The mockup also
contained animations conflicting with `Redesign/AI anti-patters.md` (scroll reveals, particles).

---

## Decision

### 1. Dark theme — `data-theme` on `<html>`

| Attribute | Theme |
|----------|-------|
| `data-theme="light"` | Light (default) |
| `data-theme="dark"` | Dark |

- Initialization: `prefers-color-scheme`, persistence via `localStorage['agtc-theme']`.
- Toggle: `.theme-toggle` button in the header (sun/moon), bilingual `aria-label`.
- The `:root[data-theme="dark"]` block overrides **only semantic tokens**
  (`--agtc-semantic-color-*`, shadows). Primitives and component tokens do not change.

### 2. CSS extension tokens (`tokensCSS()` in `site/build.js`)

Site-specific tokens, outside `tokens/*.json` (not governed by the Style Dictionary pipeline):

- Spacing scale `--agtc-space-1..10`, `--agtc-header-height`, `--agtc-content-max`
- Shadows `--agtc-shadow-{sm,md,lg,glow}` (glow **never** on buttons — anti-pattern)
- Gradients `--agtc-gradient-{brand,text,text-light,aurora}` + `--agtc-surface-grid`
- Accent (pink) and secondary (plum) palette — brand primitives
- Type scale `--agtc-font-size-{detail..display}`, line-heights

**Governance rule:** these extension tokens **never** redefine a value already present in
`tokens/semantic.json` for the light theme — the JSON tokens are authoritative. Any promotion
of an extension token to `tokens/*.json` follows the normal TCR flow.

### 3. Animations — arbitrated against the anti-patterns

| Animation | Decision | Rationale |
|-----------|----------|----------|
| `auroraDrift` (hero background) | ✅ Kept | Max 1 gradient/page, a key moment |
| `planeFloat` (3D token layers) | ✅ Kept | Represents the actual product, not decorative |
| `pulse` (hero badge) | ✅ Kept | Discreet micro-signal |
| Scroll reveals (`.reveal` + IntersectionObserver) | ❌ Removed | Scroll-triggered anti-pattern |
| Particles (`floatUp`, `.hero-particles`) | ❌ Removed | "Cosmic" decorative anti-pattern |
| Glow on primary button | ❌ Removed | Colored shadow > 4px |
| `[data-count]` counters (stat-band) | ✅ Kept | Functional, limited IntersectionObserver, fires once only |

All animations respect `prefers-reduced-motion: reduce`.

### 4. Home hero — 3D layer stack

2-column grid: unchanged copy (`contenu.md` = source of truth) + 3 3D planes showing the actual
chain `primitive.color.teal.11 → color.action.primary → button.primary.background`.
The hero buttons remain `agtc-button` (dogfooding — the site consumes the system).

---

## Alternatives considered

1. **Dark mode via JSON tokens + multi-theme Style Dictionary** — rejected for now: requires
   reworking the compilation pipeline; the semantic-override CSS block gives the same visual
   result and remains migratable to the pipeline later.
2. **Adopting the mockup as-is (with reveals and particles)** — rejected: direct conflict with
   `Redesign/AI anti-patters.md`.
3. **The mockup's `.ds-btn` classes** — rejected: the site consumes the existing `agtc-button`
   (site = first consumer principle).

---

## Consequences

- ✅ 4 working combinations: light/dark × product/marketing
- ✅ 0 CSS ghosts at build, green CI (Build, axe-core, Chromatic)
- ⚠️ The extension tokens live in `site/build.js` — accepted debt until a possible TCR
  promotion to `tokens/*.json`
- ⚠️ The dark theme is not applied to component Chromatic captures (out of the site's scope)

<!-- FR -->

# ADR-058 — Redesign du site : thème sombre et tokens d'extension CSS

**Date :** 2026-06-12
**Statut :** Accepté
**Auteur :** Guilherme Negreiros
**Relations :** ADR-051 (illustration), ADR-052 (DTCG), ADR-057 (deux contextes), `Redesign/AI anti-patters.md`, `site/build.js`

---

## Contexte

Le dossier `Redesign/` contient une maquette de référence complète (index.html, color.html, site.css,
tokens.css, site.js) préparée hors du système de build. Elle introduit : un thème sombre, un hero
redessiné avec visualisation 3D des trois niveaux de tokens, des tokens CSS d'extension (ombres,
gradients, échelle typographique) et des animations.

Le site n'avait ni thème sombre ni tokens d'ombre/gradient formalisés. La maquette contenait aussi
des animations en conflit avec `Redesign/AI anti-patters.md` (reveals au scroll, particules).

---

## Décision

### 1. Thème sombre — `data-theme` sur `<html>`

| Attribut | Thème |
|----------|-------|
| `data-theme="light"` | Clair (défaut) |
| `data-theme="dark"` | Sombre |

- Initialisation : `prefers-color-scheme`, persistance `localStorage['agtc-theme']`.
- Bascule : bouton `.theme-toggle` dans le header (soleil/lune), `aria-label` bilingue.
- Le bloc `:root[data-theme="dark"]` surcharge **uniquement des tokens sémantiques**
  (`--agtc-semantic-color-*`, ombres). Les primitifs et les tokens de composant ne changent pas.

### 2. Tokens d'extension CSS (`tokensCSS()` dans `site/build.js`)

Tokens propres au site, hors `tokens/*.json` (non gouvernés par le pipeline Style Dictionary) :

- Échelle d'espacement `--agtc-space-1..10`, `--agtc-header-height`, `--agtc-content-max`
- Ombres `--agtc-shadow-{sm,md,lg,glow}` (glow **jamais** sur les boutons — anti-pattern)
- Gradients `--agtc-gradient-{brand,text,text-light,aurora}` + `--agtc-surface-grid`
- Palette accent (rose) et secondary (prune) — primitifs de marque
- Échelle typographique `--agtc-font-size-{detail..display}`, line-heights

**Règle de gouvernance :** ces tokens d'extension ne redéfinissent **jamais** une valeur déjà
présente dans `tokens/semantic.json` en thème clair — les tokens JSON font foi. Toute promotion
d'un token d'extension vers `tokens/*.json` suit le flux TCR normal.

### 3. Animations — arbitrage contre les anti-patterns

| Animation | Décision | Justification |
|-----------|----------|----------------|
| `auroraDrift` (fond hero) | ✅ Conservée | 1 gradient max/page, un moment clé |
| `planeFloat` (couches de tokens 3D) | ✅ Conservée | Représente le produit réel, pas décorative |
| `pulse` (badge hero) | ✅ Conservée | Micro-signal discret |
| Reveals au scroll (`.reveal` + IntersectionObserver) | ❌ Retirée | Anti-pattern scroll-triggered |
| Particules (`floatUp`, `.hero-particles`) | ❌ Retirée | Anti-pattern décoratif "cosmique" |
| Glow sur bouton primary | ❌ Retirée | Shadow colorée > 4px |
| Compteurs `[data-count]` (stat-band) | ✅ Conservée | Fonctionnelle, IntersectionObserver limité, 1 seule fois |

Toutes les animations respectent `prefers-reduced-motion: reduce`.

### 4. Hero home — layer-stack 3D

Grille 2 colonnes : copy inchangé (contenu.md = source de vérité) + 3 plans 3D montrant la chaîne
réelle `primitive.color.teal.11 → color.action.primary → button.primary.background`.
Les boutons du hero restent des `agtc-button` (dogfooding — le site consomme le système).

---

## Alternatives considérées

1. **Dark mode via tokens JSON + Style Dictionary multi-thèmes** — rejeté pour l'instant :
   demande une refonte du pipeline de compilation ; le bloc CSS d'overrides sémantiques donne le
   même résultat visuel et reste migrable vers le pipeline plus tard.
2. **Adopter la maquette telle quelle (avec reveals et particules)** — rejeté : conflit direct
   avec `Redesign/AI anti-patters.md`.
3. **Classes `.ds-btn` de la maquette** — rejeté : le site consomme les `agtc-button` existants
   (principe site = premier consommateur).

---

## Conséquences

- ✅ 4 combinaisons fonctionnelles : light/dark × produit/marketing
- ✅ 0 fantôme CSS au build, CI verte (Build, axe-core, Chromatic)
- ⚠️ Les tokens d'extension vivent dans `site/build.js` — dette assumée jusqu'à une éventuelle
  promotion TCR vers `tokens/*.json`
- ⚠️ Le thème sombre n'est pas appliqué aux captures Chromatic des composants (hors scope site)
