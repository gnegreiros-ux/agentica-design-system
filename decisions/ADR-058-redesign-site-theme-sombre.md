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
|-----------|----------|---------------|
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
