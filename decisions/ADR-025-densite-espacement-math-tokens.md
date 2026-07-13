# ADR-025 — Densité d'espacement : floor/ceil sur grille 4px via math tokens

> **Date :** 2026-05-29
> **Statut :** ✅ Actif — v2 (correction du 2026-05-29 : technique floor/ceil)
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-025-densite-espacement-math-tokens.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, ADR-020-grille-4px.md, ADR-011-tokens-studio.md

> **English summary:** Introduces three spacing density modes (compact ×0.75, normal ×1.0, comfortable ×1.25) computed with `floor()`/`ceil()` math tokens against a 4px grid unit, guaranteeing every resulting value stays a multiple of 4px. This corrects a v1 approach that used a single swappable factor and produced off-grid values (e.g. 6px, 15px).
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

Un même composant doit s'adapter à des contextes d'usage radicalement différents :
- **Marketing / Onboarding** : interfaces aérées, visuellement généreuses
- **SaaS courant** : densité normale, équilibre entre confort et efficacité
- **SaaS data-dense** : dashboards, tableaux, workflows — chaque pixel compte

Les tokens d'espacement précédents avaient des valeurs fixes. Les équipes contournaient ce système en créant des valeurs locales, produisant de la dérive.

### Correction v2 — problème de la v1

La v1 utilisait un facteur unique swappable : `{primitive.space.4} * {semantic.space.density.factor}`. Ce pattern a un défaut structurel : avec un seul token de facteur, il est impossible d'encoder la direction d'arrondi (floor pour compact, ceil pour comfortable). Certains résultats atterrissaient hors de la grille 4px :

| Token | Compact (×0.75) | Comfortable (×1.25) |
|-------|----------------|---------------------|
| `space.2` (8px) | **6px** ✗ hors grille | **10px** ✗ hors grille |
| `space.5` (20px) | **15px** ✗ hors grille | **25px** ✗ hors grille |

Source de la correction : _Sam's fancy math equations in Tokens Studio_ (Sami Am Designs, 2024) — section « Scales that round to a (4)pixel grid ».

---

## Décision

### Trois niveaux de densité

| Mode | Facteur | Arrondi | Contexte type |
|------|---------|---------|---------------|
| `compact` | 0.75 | `floor()` | Dashboards, tableaux, outils data-dense |
| `normal` | 1.0 | aucun | Usage courant — formulaires, settings, profil |
| `comfortable` | 1.25 | `ceil()` | Marketing, onboarding, pages de lecture |

### Technique : floor/ceil + grid-unit

**Formule générale :**

```
compact    → floor(valeur × facteur / grid-unit) × grid-unit
comfortable → ceil(valeur × facteur / grid-unit) × grid-unit
```

Avec `primitive.density.grid-unit = 4`.

Cette technique, issue de _Sam's math equations_, garantit que **100% des valeurs calculées sont des multiples de 4px**, quelle que soit la valeur de base.

### Implémentation dans les tokens

**Niveau primitif** :
```json
"primitive.density.factor.normal"      = 1
"primitive.density.factor.comfortable" = 1.25
"primitive.density.factor.compact"     = 0.75
"primitive.density.grid-unit"          = 4
```

**Niveau sémantique** — trois groupes explicites :

```json
"semantic.space.control.padding-x"            = {primitive.space.4}            // 16px (normal)
"semantic.space.compact.control.padding-x"    = floor(space.4 × 0.75 / 4) × 4  // 12px
"semantic.space.comfortable.control.padding-x"= ceil(space.4 × 1.25 / 4) × 4   // 20px
```

Syntaxe Tokens Studio réelle :
```json
"value": "floor({primitive.space.4} * {semantic.space.density.factor.compact} / {primitive.density.grid-unit}) * {primitive.density.grid-unit}"
```

### Résultats par mode — toutes valeurs sur grille 4px

| Token sémantique | Base | Normal | Compact | Comfortable |
|-----------------|------|--------|---------|-------------|
| `*.control.padding-x` | space.4 (16px) | **16px** | **12px** | **20px** |
| `*.control.padding-y` | space.2 (8px) | **8px** | **4px** ¹ | **12px** ² |
| `*.control.gap` | space.2 (8px) | **8px** | **4px** | **12px** |
| `*.layout.section` | space.8 (32px) | **32px** | **24px** | **40px** |
| `*.layout.component` | space.5 (20px) | **20px** | **12px** ³ | **28px** ⁴ |

Toutes les valeurs sont des multiples de 4. Zéro exception.

> ¹ 8 × 0.75 = 6 → floor(6/4)×4 = **4px**
> ² 8 × 1.25 = 10 → ceil(10/4)×4 = **12px**
> ³ 20 × 0.75 = 15 → floor(15/4)×4 = **12px**
> ⁴ 20 × 1.25 = 25 → ceil(25/4)×4 = **28px**

### Groupes de tokens et compatibilité

`semantic.space.control.*` et `semantic.space.layout.*` restent les **alias normaux** (densité par défaut). `component.json` continue de les référencer sans changement.

Pour utiliser une densité différente, on référence explicitement le groupe :
- `{semantic.space.compact.control.padding-x}` → compact
- `{semantic.space.comfortable.layout.section}` → comfortable

---

## Argumentaire

### Pourquoi floor pour compact et ceil pour comfortable ?

- `floor()` arrondit **vers le bas** — adapté quand on réduit l'espace (compact) : on ne veut jamais dépasser la valeur cible par excès.
- `ceil()` arrondit **vers le haut** — adapté quand on augmente l'espace (comfortable) : on ne veut jamais tombe en-dessous de la valeur cible.
- `round()` seul (sans direction) donne des résultats imprévisibles selon la position de la valeur calculée par rapport au step de grille.

### Pourquoi des groupes explicites plutôt qu'un facteur unique swappable ?

La v1 utilisait un facteur unique. Son problème : le même token ne peut pas encoder `floor()` pour compact et `ceil()` pour comfortable — la formule doit connaître la direction d'arrondi à l'avance.

Trois groupes explicites :
- Encodent la direction dans la formule elle-même (floor ou ceil)
- Garantissent l'alignement grille sans exception
- Restent lisibles : `space.compact.control.padding-x` exprime clairement son contexte
- Sont compatibles avec les theme sets Tokens Studio (chaque groupe = un theme)

### Pourquoi les facteurs 0.75 / 1.0 / 1.25 ?

Mémorisables (−25%, ±0%, +25%), perceptuellement significatifs (Nielsen : 25% de changement = perceptible mais non perturbant), et ils produisent des multiples de 4 après floor/ceil dans tous les cas de notre échelle.

### Pourquoi des math tokens et pas des CSS variables ?

Les math tokens sont résolus à la compilation (Style Dictionary), produisant du CSS statique portable (iOS, Android, emails). Les CSS variables nécessitent un mécanisme runtime supplémentaire.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Facteur unique swappable (v1)** | Impossible d'encoder floor/ceil directionnels dans une seule formule — valeurs hors grille garanties |
| **`round()` seul sans floor/ceil** | Résultats imprévisibles selon la position sur la grille (ex: `round(6/4)*4 = 8px` ≠ réduit) |
| **CSS custom property `--density`** | Non portable (iOS/Android/email), nécessite infra CSS runtime |
| **Classes utilitaires (`density-compact`)** | Sort du système de gouvernance token |
| **Valeurs fixes pré-calculées (sans math)** | Perd la traçabilité entre base et densité — un changement de base ne se propage plus |

---

## Conséquences

**Pour les tokens :**
- `primitive.density.grid-unit = 4` ajouté (diviseur de grille)
- `primitive.density.factor.*` conservés (0.75 / 1.0 / 1.25)
- `semantic.space.control.*` et `semantic.space.layout.*` = densité normale (références directes, sans math)
- `semantic.space.compact.*` et `semantic.space.comfortable.*` ajoutés avec formules floor/ceil
- `semantic.space.density.factor.*` = aliases de documentation vers les primitifs

**Pour les agents IA :**
- Pour une interface dense : référencer `semantic.space.compact.*`
- Pour une page marketing : référencer `semantic.space.comfortable.*`
- Pour l'usage standard : `semantic.space.control.*` (défaut, inchangé)

**Pour les équipes :**
- `component.json` et le code existant ne changent pas (backward-compatible)
- Ajouter un nouveau token de spacing : définir les trois variantes (normal + compact + comfortable) en même temps

**Pour Tokens Studio :**
- `floor()` et `ceil()` sont des fonctions math natives supportées
- Chaque groupe de densité peut devenir un theme set distinct
- Référence technique : https://docs.tokens.studio/manage-tokens/token-values/math

**Risques :**
- Style Dictionary < 4.x ne supporte pas `floor()`/`ceil()` nativement — une transform custom peut être nécessaire (voir ADR-019)
- `padding-y` compact = 4px : valeur très serrée, à valider avec un test utilisateur sur les composants réels avant déploiement
