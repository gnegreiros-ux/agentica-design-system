# Fondation - Illustration

> Spec de style des illustrations du système Agentica — style « Tactile Tech ».
> **Statut :** ✅ Approuvé (humain, 2026-06-06) — formalisé par ADR-051. Chaque illustration
> produite reste soumise à approbation individuelle (cf. `.claude/rules/ux-patterns-sources.md`).
> **Type:** guideline
> **Chemin logique:** guidelines/foundations/illustration.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/foundations/color.md, tokens/semantic.json,
> Prototype redesign site web système de design/inspiration/

---

## Pourquoi ce style

Style retenu : **« Tactile Tech : Humanizing Complexity »**
(réf. https://getillustrations.com/blog/saas-illustration-styles-that-convert/, style #1).

Ce style « comble l'écart entre la froideur d'un produit logiciel et la chaleur » de
l'expérience humaine. L'imperfection assumée (grain, pointillé, touches de brush) signale
un **soin intentionnel** plutôt que du générique IA sur-lissé. Il sert directement le récit
du système : *« le dernier mot est toujours humain »* — la machine est précise, l'humain la
rend chaleureuse et la gouverne.

Cibles d'usage : sections hero, section « Pour chaque rôle », et la **vitrine Pipelines &
Workflows**. Un seul langage visuel partagé sur toutes ces surfaces.

---

## Caractéristiques visuelles

| Dimension | Décision |
|-----------|----------|
| **Fondation** | Formes vectorielles géométriques précises, grands aplats anguleux qui se chevauchent (réf. `inspiration/color-pattern.jpg`) |
| **Texture** | Grain + pointillé (stipple) + touches de brush par-dessus le vecteur — tension précision/imperfection |
| **Profondeur** | Légère, par superposition d'aplats et transparence ; pas d'ombres portées réalistes |
| **Niveau de détail** | Équilibré — assez raffiné pour être pro, assez texturé pour sembler « fait main » |
| **Ton** | Professionnel mais chaleureux ; technique mais humain |
| **Sujet** | Montrer le **résultat** (équipe alignée, dérive corrigée, décision tracée) — jamais des captures d'UI |

---

## Palette d'illustration

Tokenisée en `semantic.color.illustration.*` (ADR-051) — mapping de `inspiration/brand-colors.jpg`
sur le pas de primitive le plus proche, le teal étant déjà commun à la marque.

| Jeton sémantique | Primitive | Usage dans l'illustration |
|------------------|-----------|---------------------------|
| `color.illustration.ink`     | `mauve.12`   | masses sombres, ancrage |
| `color.illustration.accent`  | `crimson.9`  | point focal chaud, énergie |
| `color.illustration.brand`   | `teal.9`     | lien visuel au produit, fil conducteur |
| `color.illustration.neutral` | `slate.9`    | masses secondaires, profondeur |
| `color.illustration.surface` | `slate.3`    | respiration, négatif clair |

> Light ET dark (cf. décision thème dual) : la palette doit rester lisible sur fond clair
> **et** sombre. Prévoir une variante des aplats neutres par thème. Repasser au gate
> **axe-core** (contraste des éléments porteurs de sens ≥ 3:1).

---

## Règles de cohérence

```
✅ Toujours la même palette tokenisée (pas de couleur en dur dans le pipeline d'export)
✅ Toujours formes géométriques + grain/stipple — jamais l'un sans l'autre
✅ Toujours illustrer un RÉSULTAT métier, pas une interface
✅ Lisibilité garantie en light ET dark
❌ Pas de captures d'écran déguisées en illustration
❌ Pas de dégradés réalistes / ombres portées lourdes
❌ Pas de style hétérogène d'une section à l'autre
```

---

## Pipeline de production (proposé)

1. ✅ **Spec approuvé** (ce document) — décision humaine (2026-06-06).
2. ✅ **Palette tokenisée** (`semantic.color.illustration.*`) + ADR-051.
3. Composition vectorielle (formes géométriques) — brouillons SVG validés un par un. ← *prochaine étape*
4. Application de la texture (grain/stipple/brush) — étape raster, outil à confirmer.
5. Intégration site (light/dark), passage gate axe-core, log de construction.

> **Décision en attente :** l'étape 4 (texture raster) se fait via outil IA piloté par l'humain
> ou par un designer — à trancher. Les étapes 1-3 sont réalisables dans le dépôt.
