# ADR-064 — V2 light mode: implementation and dark/light decoupling fix

**Date:** 2026-06-25
**Status:** Active
**Author:** Guilherme Negreiros
**Relations:** ADR-058 (dark theme — amended), `site/build.js`, `tokens/semantic.json`

---

## Context

ADR-058 (2026-06-12) defined the dark-theme system via `data-theme` on `<html>`.
The 2026-06-25 session adopted the complete V2 redesign (`class="v2-page"`) across all pages.

Three problems were discovered during the audit:

1. **Hardcoded `color-scheme:dark`** on `body.v2-page` — the browser's color scheme (form
   controls, scrollbars) stayed dark even when `data-theme="light"` was active.
2. **`background:var(--agtc-semantic-color-background-inverse)`** on body, header, docs panel,
   footer — always dark (`#120c0f`/`#0f1117`) regardless of the theme.
3. **Non-adaptive `--v2-*` variables**: `--v2-text` = `text-on-inverse` (white),
   `--v2-muted` = `text-on-inverse-muted`, `--v2-line` = `surface-glass-border` (`rgba(255,255,255,.10)`)
   — all hardcoded for a dark background.

Consequence: the theme toggle button existed but had no real visual effect on the V2
pages. The pages were de-facto dark-only despite the token system.

---

## Decision

### 1. Removal of `color-scheme:dark` from `body.v2-page`

Removed. The `color-scheme` property is already correctly handled by `tokens.css`:
- `:root { color-scheme: light; }` (default)
- `:root[data-theme="dark"] { color-scheme: dark; }`

No duplication in `site.css`.

### 2. Adaptive backgrounds — `background-inverse` → `background-page`

`background-page` resolves differently depending on the theme:
| Theme | Resolved value |
|-------|---------------|
| dark | `#0a0c11` |
| light | `#fcfcfc` |

Replacements: `body.v2-page`, `.v2-header`, `.v2-docs-panel > div`,
`.v2-footer`, mobile `.v2-nav.is-open`.

### 3. `--v2-*` variables: dark default, `[data-theme="light"]` override

The variables remain defined for dark in `:root` (since all pages have
`data-theme="dark"` by default). A `[data-theme="light"]` block reassigns them:

| Variable | Dark (`:root`) | Light (`[data-theme="light"]`) |
|----------|---------------|-------------------------------|
| `--v2-text` | `text-on-inverse` | `text-primary` |
| `--v2-muted` | `text-on-inverse-muted` | `text-secondary` |
| `--v2-faint` | `text-on-inverse-muted` | `text-disabled` |
| `--v2-surface` | `color-mix(background-surface 74%)` | `background-subtle` |
| `--v2-surface-strong` | `color-mix(background-inverse 86%)` | `background-surface` |
| `--v2-line` | `surface-glass-border` | `border-default` |

### 4. V2 components — light mode overrides

Elements requiring an explicit override (hardcoded dark rgba values):

| Component | Dark | Light |
|-----------|------|-------|
| `.v2-role-card` | `rgba(12,15,25,.78)` | `background-surface` + `shadow-card` |
| `.v2-signal-stack span` | `rgba(255,255,255,.055)` | `background-subtle` |
| `.v2-quality` | `rgba(255,255,255,.03)` | `rgba(0,0,0,.015)` |
| `.v2-button-secondary` | white glass rgba | `background-surface` + `border-default` |
| `.v2-button-ghost` | white glass rgba | `text-secondary` |
| `.v2-docs-panel` | aurora + glass | `background-surface` + `shadow-raised` |
| Aurora body | 3 radials (teal 26%, rose 20%, brown 40%) | 2 radials (teal 7%, rose 6%) |
| `.v2-kicker` | `color-mix(v2-teal 72%, white)` | `action-primary` direct |

Visited links: double hex/`var()` declaration per ADR-047/ADR-059 (Safari `:visited`).

### 5. Amendment to ADR-058 — page default

ADR-058 §1 states "light (default)". The previous session (2026-06-24) hardcoded
`data-theme="dark"` on every `<html>` to align the initial render with the V2 design
with no flash (FOUC). The JS reads `localStorage` then `prefers-color-scheme` — the
toggle works.

**This behavior is confirmed.** Pages start dark; the system preference or the user
toggle switches to light. ADR-058 is amended on this point by the present ADR.

---

## Alternatives considered

1. **Keep the pages dark-only (remove the toggle)** — Rejected: loses accessibility for
   users who prefer light mode and future AA compliance (SC 1.4.3 on both themes).
2. **Create two sets of V2 CSS (dark.css / light.css)** — Rejected: double maintenance.
   The `--v2-*` variables with `[data-theme]` override are cheaper.
3. **Move the v2 tokens into `tokens/semantic.json`** — Deferred; the `--v2-*` are site
   variables, not system tokens. Promotion possible via TCR if the patterns stabilize
   across other projects.

---

## Consequences

- ✅ 4 working combinations confirmed: dark/light × marketing/product
- ✅ 0 WCAG 2.2 violations (111 pages · 1541 checks) — contrast ratios verified in both
  themes (measured minimum: `action-primary` / `background-page` = 4.65:1)
- ✅ `scroll-padding-top: calc(var(--agtc-header-height,64px) + 12px)` in place (SC 2.4.11)
- ✅ Safari `:visited`: hex fallback kept on all V2 navigation links
- ⚠️ The `--agtc-surface-glass*` tokens have no light counterpart in `tokens.css` —
   components that use them directly (docs panel, buttons) require an explicit
   `[data-theme="light"]` override. Debt documented; resolution via TCR if needed.

<!-- FR -->

# ADR-064 — Mode clair V2 : implémentation et correction du découplage dark/light

**Date :** 2026-06-25
**Statut :** Actif
**Auteur :** Guilherme Negreiros
**Relations :** ADR-058 (thème sombre — amendé), `site/build.js`, `tokens/semantic.json`

---

## Contexte

ADR-058 (2026-06-12) a défini le système de thème sombre via `data-theme` sur `<html>`.
La session du 2026-06-25 a adopté le redesign V2 complet (`class="v2-page"`) sur toutes les pages.

Trois problèmes ont été découverts lors de l'audit :

1. **`color-scheme:dark` hardcodé** sur `body.v2-page` — le schéma du navigateur (form controls,
   scrollbars) restait sombre même quand `data-theme="light"` était actif.
2. **`background:var(--agtc-semantic-color-background-inverse)`** sur body, header, docs panel,
   footer — toujours sombre (`#120c0f`/`#0f1117`) quel que soit le thème.
3. **Variables `--v2-*` non adaptatives** : `--v2-text` = `text-on-inverse` (blanc),
   `--v2-muted` = `text-on-inverse-muted`, `--v2-line` = `surface-glass-border` (`rgba(255,255,255,.10)`)
   — toutes hardcodées pour fond sombre.

Conséquence : le bouton de bascule de thème existait mais n'avait aucun effet visuel réel
sur les pages V2. Les pages étaient de-facto dark-only malgré le token system.

---

## Décision

### 1. Retrait de `color-scheme:dark` de `body.v2-page`

Supprimé. La propriété `color-scheme` est déjà gérée correctement par `tokens.css` :
- `:root { color-scheme: light; }` (défaut)
- `:root[data-theme="dark"] { color-scheme: dark; }`

Pas de duplication dans `site.css`.

### 2. Backgrounds adaptatifs — `background-inverse` → `background-page`

`background-page` résout différemment selon le thème :
| Thème | Valeur résolue |
|-------|---------------|
| dark | `#0a0c11` |
| light | `#fcfcfc` |

Remplacements : `body.v2-page`, `.v2-header`, `.v2-docs-panel > div`,
`.v2-footer`, mobile `.v2-nav.is-open`.

### 3. Variables `--v2-*` : défaut dark, surcharge `[data-theme="light"]`

Les variables restent définies pour le dark dans `:root` (puisque toutes les pages
ont `data-theme="dark"` par défaut). Un bloc `[data-theme="light"]` les réassigne :

| Variable | Dark (`:root`) | Light (`[data-theme="light"]`) |
|----------|---------------|-------------------------------|
| `--v2-text` | `text-on-inverse` | `text-primary` |
| `--v2-muted` | `text-on-inverse-muted` | `text-secondary` |
| `--v2-faint` | `text-on-inverse-muted` | `text-disabled` |
| `--v2-surface` | `color-mix(background-surface 74%)` | `background-subtle` |
| `--v2-surface-strong` | `color-mix(background-inverse 86%)` | `background-surface` |
| `--v2-line` | `surface-glass-border` | `border-default` |

### 4. Composants V2 — surcharges light mode

Éléments nécessitant une surcharge explicite (valeurs rgba sombres hardcodées) :

| Composant | Dark | Light |
|-----------|------|-------|
| `.v2-role-card` | `rgba(12,15,25,.78)` | `background-surface` + `shadow-card` |
| `.v2-signal-stack span` | `rgba(255,255,255,.055)` | `background-subtle` |
| `.v2-quality` | `rgba(255,255,255,.03)` | `rgba(0,0,0,.015)` |
| `.v2-button-secondary` | glass rgba blanc | `background-surface` + `border-default` |
| `.v2-button-ghost` | glass rgba blanc | `text-secondary` |
| `.v2-docs-panel` | aurora + glass | `background-surface` + `shadow-raised` |
| Aurora body | 3 radiales (teal 26%, rose 20%, brun 40%) | 2 radiales (teal 7%, rose 6%) |
| `.v2-kicker` | `color-mix(v2-teal 72%, white)` | `action-primary` direct |

Visited links : double déclaration hex/`var()` conforme ADR-047/ADR-059 (Safari `:visited`).

### 5. Amendement ADR-058 — default des pages

ADR-058 §1 indique "light (défaut)". La session précédente (2026-06-24) a hardcodé
`data-theme="dark"` dans tous les `<html>` pour aligner le rendu initial avec le design V2
sans flash (FOUC). Le JS lit `localStorage` puis `prefers-color-scheme` — le toggle fonctionne.

**Ce comportement est confirmé.** Les pages démarrent sombres ; le system preference ou le
toggle utilisateur bascule en clair. ADR-058 est amendé sur ce point par le présent ADR.

---

## Alternatives considérées

1. **Garder les pages dark-only (supprimer le toggle)** — Rejeté : perd l'accessibilité
   utilisateurs préférant le mode clair et la conformité future AA (SC 1.4.3 sur les deux thèmes).
2. **Créer deux jeux de CSS v2 (dark.css / light.css)** — Rejeté : double maintenance.
   Les variables `--v2-*` avec surcharge `[data-theme]` sont moins coûteuses.
3. **Passer les tokens v2 dans `tokens/semantic.json`** — Reporté ; les `--v2-*` sont des
   variables de site, pas des tokens système. Promotion possible via TCR si les patterns
   se stabilisent sur d'autres projets.

---

## Conséquences

- ✅ 4 combinaisons fonctionnelles confirmées : dark/light × marketing/produit
- ✅ 0 violation WCAG 2.2 (111 pages · 1541 vérifications) — ratios contraste vérifiés
  dans les deux thèmes (minimum mesuré : `action-primary` / `background-page` = 4.65:1)
- ✅ `scroll-padding-top: calc(var(--agtc-header-height,64px) + 12px)` en place (SC 2.4.11)
- ✅ Safari `:visited` : hex fallback conservé sur tous les liens de navigation V2
- ⚠️ Les tokens `--agtc-surface-glass*` n'ont pas de pendant light dans `tokens.css` —
   les composants qui les utilisent directement (docs panel, buttons) nécessitent une surcharge
   explicite `[data-theme="light"]`. Dette documentée ; résolution via TCR si besoin.
