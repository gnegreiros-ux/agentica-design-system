# ADR-051 — Style d'illustration « Tactile Tech » + palette sémantique `color.illustration`

> **Date :** 2026-06-06
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation du style) · Design System Lead (jetons sémantiques)
> **Type:** contract
> **Chemin logique:** decisions/ADR-051-illustration-style-palette.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/foundations/illustration.md, tokens/semantic.json,
> .claude/rules/ux-patterns-sources.md

> **English summary:** Establishes "Tactile Tech" as the site's illustration style (geometric
> shapes + grain texture, showing business outcomes rather than UI screenshots) and adds a
> 5-token `semantic.color.illustration.*` group, each mapped to existing color primitives with no
> new raw values.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

Le redesign du site (brief 2026-06-06) prévoit des illustrations pour expliquer visuellement les
concepts du système (hero, section « Pour chaque rôle », vitrine Pipelines & Workflows). Il fallait
**un seul langage visuel** cohérent et **tokenisé**, plutôt que des illustrations improvisées au coup
par coup, et conforme à la règle « jamais de couleur en dur ».

Deux sources cadrent la décision :
- L'article *SaaS illustration styles that convert* — style #1 **« Tactile Tech : Humanizing
  Complexity »** (https://getillustrations.com/blog/saas-illustration-styles-that-convert/).
- Le dossier `inspiration/` du prototype : `color-pattern.jpg` (géométrie d'aplats) et
  `brand-colors.jpg` (palette).

---

## Décision

1. **Style retenu : « Tactile Tech ».** Formes vectorielles géométriques précises (aplats anguleux
   superposés) + texture grain/stipple/brush. Montre le **résultat métier**, jamais des captures
   d'UI. Spec complet : `guidelines/foundations/illustration.md` (approuvé par l'humain).
   Justification produit : l'imperfection tactile sert le récit *« le dernier mot est humain »*.

2. **Ajout du groupe sémantique `color.illustration`** (5 jetons, tous adossés à des primitives
   existantes — aucune valeur brute, aucun primitif modifié) :

   | Jeton | Référence primitive | Rôle illustration |
   |-------|---------------------|-------------------|
   | `color.illustration.ink`     | `{primitive.color.mauve.12}`   | masses sombres, ancrage |
   | `color.illustration.accent`  | `{primitive.color.crimson.9}`  | point focal chaud, énergie |
   | `color.illustration.brand`   | `{primitive.color.teal.9}`     | fil conducteur marque (= `brand.primary`) |
   | `color.illustration.neutral` | `{primitive.color.slate.9}`    | masses secondaires, profondeur |
   | `color.illustration.surface` | `{primitive.color.slate.3}`    | respiration, négatif clair |

   La palette d'inspiration (`brand-colors.jpg`) a été mappée sur le pas de primitive le plus proche,
   le teal étant déjà commun à la marque.

---

## Périmètre

| Inclus | Exclu |
|--------|-------|
| Décision de style + `guidelines/foundations/illustration.md` | Production des illustrations finales (étapes 3-4 du pipeline) |
| 5 jetons `semantic.color.illustration.*` | Remappage dark mode des jetons (chantier thème dual à venir) |
| — | Outil de texture raster (grain/brush) — décision à trancher |

---

## Alternatives rejetées

- **Introduire des couleurs brutes depuis le JPG d'inspiration** : contraire à `tokens-system.md`
  (jamais de valeur brute). Le mapping sur primitives existantes préserve l'auditabilité — rejeté.
- **Réutiliser `viz` (data-viz)** : `viz` cible la visualisation de données porteuse d'information ;
  l'illustration est narrative/décorative. Mélanger fausserait l'intention — rejeté.
- **Autre style de l'article** (ex. 3D, isométrique) : plus froid/générique, moins aligné sur le
  récit « humain » du système — rejeté.

---

## Conséquences

- Toute illustration future consomme `color.illustration.*` — cohérence garantie sur toutes les
  surfaces (site + vitrine pipelines, Phase E/F fusionnées).
- Gouvernance : 5 jetons sémantiques ajoutés (Design System Lead). Aucun primitif modifié.
- **À suivre :** (1) remappage des jetons en dark mode lors du chantier thème dual ; (2) décision
  sur l'outil de texture raster ; (3) chaque illustration produite passe au gate axe-core
  (éléments porteurs de sens ≥ 3:1) et reste soumise à approbation humaine.
