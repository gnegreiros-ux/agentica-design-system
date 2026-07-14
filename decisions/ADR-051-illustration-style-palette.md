# ADR-051 — Illustration style "Tactile Tech" + semantic palette `color.illustration`

> **Date:** 2026-06-06
> **Status:** ✅ Active
> **Decision-makers:** Human (style approval) · Design System Lead (semantic tokens)
> **Type:** contract
> **Logical path:** decisions/ADR-051-illustration-style-palette.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/foundations/illustration.md, tokens/semantic.json,
> .claude/rules/ux-patterns-sources.md

---

## Context

The site redesign (2026-06-06 brief) calls for illustrations to visually explain the system's
concepts (hero, "For every role" section, Pipelines & Workflows showcase). We needed **a single
coherent, tokenized visual language**, rather than illustrations improvised case by case, and
compliant with the "never a hardcoded color" rule.

Two sources framed the decision:
- The article *SaaS illustration styles that convert* — style #1 **"Tactile Tech: Humanizing
  Complexity"** (https://getillustrations.com/blog/saas-illustration-styles-that-convert/).
- The prototype's `inspiration/` folder: `color-pattern.jpg` (flat-shape geometry) and
  `brand-colors.jpg` (palette).

---

## Decision

1. **Style chosen: "Tactile Tech."** Precise geometric vector shapes (overlapping angular flat
   fills) + grain/stipple/brush texture. Shows the **business outcome**, never UI screenshots.
   Full spec: `guidelines/foundations/illustration.md` (approved by the human).
   Product rationale: the tactile imperfection serves the narrative *"the last word is human."*

2. **Addition of the `color.illustration` semantic group** (5 tokens, all backed by existing
   primitives — no raw value, no primitive modified):

   | Token | Primitive reference | Illustration role |
   |-------|---------------------|-------------------|
   | `color.illustration.ink`     | `{primitive.color.mauve.12}`   | dark masses, anchoring |
   | `color.illustration.accent`  | `{primitive.color.crimson.9}`  | warm focal point, energy |
   | `color.illustration.brand`   | `{primitive.color.teal.9}`     | brand throughline (= `brand.primary`) |
   | `color.illustration.neutral` | `{primitive.color.slate.9}`    | secondary masses, depth |
   | `color.illustration.surface` | `{primitive.color.slate.3}`    | breathing room, light negative space |

   The inspiration palette (`brand-colors.jpg`) was mapped to the closest primitive step, teal
   already being common to the brand.

---

## Scope

| Included | Excluded |
|--------|--------|
| Style decision + `guidelines/foundations/illustration.md` | Production of the final illustrations (pipeline steps 3-4) |
| 5 `semantic.color.illustration.*` tokens | Dark-mode remapping of the tokens (upcoming dual-theme project) |
| — | Raster texture tool (grain/brush) — decision still to be made |

---

## Rejected alternatives

- **Introducing raw colors from the inspiration JPG**: contrary to `tokens-system.md` (never a
  raw value). Mapping onto existing primitives preserves auditability — rejected.
- **Reusing `viz` (data-viz)**: `viz` targets information-bearing data visualization; illustration
  is narrative/decorative. Mixing the two would blur intent — rejected.
- **Another style from the article** (e.g. 3D, isometric): colder/more generic, less aligned with
  the system's "human" narrative — rejected.

---

## Consequences

- Every future illustration consumes `color.illustration.*` — consistency guaranteed across all
  surfaces (site + pipelines showcase, merged Phase E/F).
- Governance: 5 semantic tokens added (Design System Lead). No primitive modified.
- **To follow up:** (1) remapping the tokens in dark mode during the dual-theme project; (2)
  decision on the raster texture tool; (3) every illustration produced goes through the axe-core
  gate (meaning-bearing elements ≥ 3:1) and remains subject to human approval.

<!-- FR -->

# ADR-051 — Style d'illustration « Tactile Tech » + palette sémantique `color.illustration`

> **Date :** 2026-06-06
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation du style) · Design System Lead (jetons sémantiques)
> **Type:** contract
> **Chemin logique:** decisions/ADR-051-illustration-style-palette.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/foundations/illustration.md, tokens/semantic.json,
> .claude/rules/ux-patterns-sources.md

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
