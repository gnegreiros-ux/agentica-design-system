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
