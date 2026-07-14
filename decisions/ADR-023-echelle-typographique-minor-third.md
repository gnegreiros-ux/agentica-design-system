# ADR-023 — Typographic scale: rem Minor Third + line-height rules

> **Date:** 2026-05-29
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-023-echelle-typographique-minor-third.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/typography.md

---

## Context

The previous typographic scale had 3 sizes (sm/md/xl in px) with no formalized scale logic, no line-height management by context, and no distinction between the needs of marketing, e-commerce, and SaaS contexts. The goal is an accessible, coherent scale, adapted to usage profiles.

### Situation before

```json
"fontSize": {
  "sm": "14px",
  "md": "16px",
  "xl": "24px"
},
"lineHeight": {
  "tight": "1.25",
  "normal": "1.5"
}
```

Three sizes in px, two line-heights with no assignment rules.

---

## Decision

### Unit: rem (relative to the browser base)

All font sizes are expressed in `rem` (reference = 1rem = 16px). This convention:
- Respects user zoom preferences (WCAG accessibility)
- Allows low-vision users to enlarge text without breaking relative layouts
- Remains compatible with the 4px grid (the equivalent px values are multiples of 4)

### Scale: Minor Third (ratio 1.2)

The scale for large sizes (headings) follows the Minor Third musical scale (ratio 1.2), rounded to the nearest multiple of 4px to respect the grid.

```
16px × 1.200¹ = 19.2  → 20px  (lg)
16px × 1.200² = 23.0  → 24px  (xl)
16px × 1.200³ = 27.6  → 28px  (2xl)
16px × 1.200⁴ = 33.2  → 32px  (3xl)
16px × 1.200⁵ = 39.8  → 40px  (4xl)
```

| Token | rem | px | Line-height | Role |
|-------|-----|----|-------------|------|
| `fontSize.xs`   | 0.75rem  | 12px | 1.6 | Details, annotations, captions |
| `fontSize.sm`   | 0.875rem | 14px | 1.6 | Labels, metadata, helper text |
| `fontSize.base` | 1rem     | 16px | 1.6 | Main body text |
| `fontSize.lg`   | 1.25rem  | 20px | 1.1 | Heading 5, subtitles |
| `fontSize.xl`   | 1.5rem   | 24px | 1.1 | Heading 4 |
| `fontSize.2xl`  | 1.75rem  | 28px | 1.1 | Heading 3 |
| `fontSize.3xl`  | 2rem     | 32px | 1.0 | Heading 2 |
| `fontSize.4xl`  | 2.5rem   | 40px | 1.0 | Heading 1 |
| `fontSize.5xl`  | 3rem     | 48px | 1.0 | Hero display |

### Line-height rules

Only three values, assigned by context:

| Token | Value | Assignment rule |
|-------|--------|---------------------|
| `lineHeight.reading` | 1.6 | Any text of size ≤ base (xs, sm, base) |
| `lineHeight.heading` | 1.1 | Mid-size headings (lg, xl, 2xl) |
| `lineHeight.display` | 1.0 | Large headings (3xl, 4xl, 5xl) |

**Rationale:**
- 1.6 on small sizes → maximum legibility, WCAG 1.4.12 compliance
- 1.0–1.1 on large headings → visual impact, consistency between marketing and SaaS sites

---

## Rationale

### Why Minor Third?

The Minor Third (1.200) is the scale best suited to hybrid interfaces (marketing + SaaS):
- Expressive enough for marketing pages (visually hierarchical headings)
- Restrained enough for SaaS (no gigantic gaps between levels)
- Values rounded to 4px remain all memorable

### Why rem and not px?

Browser accessibility preferences (text zoom, base font size) use rem as their lever. A px-based system ignores these preferences. WCAG recommends relative units for text (Success Criterion 1.4.4).

### Why line-height 1.6 for common text?

WCAG 2.1 Success Criterion 1.4.12 (Text Spacing) requires that content remain readable with a line-height of 1.5×. A default value of 1.6 covers this criterion automatically with no override needed.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **Major Second (1.125)** | Too little differentiation between heading levels |
| **Perfect Fourth (1.333)** | Too dramatic for high information-density SaaS interfaces |
| **Fixed scale (8, 12, 16, 20, 24, 32, 40)** | No mathematical ratio — hard to extend coherently |
| **Keep px** | Incompatible with browser zoom preferences (WCAG 1.4.4) |
| **Single 1.5 line-height** | Too compressed on small text, too airy on very large text |

---

## Consequences

**For tokens:**
- `primitive.fontSize` goes from 3 to 9 values (xs → 5xl)
- `primitive.lineHeight` goes from 2 to 3 values (reading, heading, display)
- `semantic.typography` expands from 3 styles (body, label, heading) to 9 (detail, label, body, h5→h1, hero)

**For AI agents:**
- An agent can choose the correct typographic level by intent (body vs heading vs hero) without improvising sizes

**For teams:**
- Simple rule: if it's body text → base (1rem); if it's a heading → choose among lg→4xl; if it's hero decoration → 5xl
- No hardcoded intermediate value allowed

<!-- FR -->

# ADR-023 — Échelle typographique : Minor Third rem + règles de line-height

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-023-echelle-typographique-minor-third.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/typography.md

---

## Contexte

L'échelle typographique précédente comportait 3 tailles (sm/md/xl en px) sans logique d'échelle formalisée, sans gestion du line-height par contexte, et sans distinction entre les besoins des contextes marketing, e-commerce et SaaS. L'objectif est une échelle accessible, cohérente, et adaptée aux profils d'usage.

### Situation avant

```json
"fontSize": {
  "sm": "14px",
  "md": "16px",
  "xl": "24px"
},
"lineHeight": {
  "tight": "1.25",
  "normal": "1.5"
}
```

Trois tailles en px, deux line-heights sans règles d'assignation.

---

## Décision

### Unité : rem (relatif à la base navigateur)

Toutes les tailles de police sont exprimées en `rem` (reference = 1rem = 16px). Cette convention :
- Respecte les préférences de zoom utilisateur (accessibilité WCAG)
- Permet aux utilisateurs malvoyants d'agrandir sans casser les mises en page relatives
- Reste compatible avec la grille 4px (les px équivalents sont des multiples de 4)

### Échelle : Minor Third (ratio 1.2)

L'échelle des grandes tailles (titres) suit la gamme musicale Minor Third (ratio 1.2), arrondie au multiple de 4px le plus proche pour respecter la grille.

```
16px × 1.200¹ = 19.2  → 20px  (lg)
16px × 1.200² = 23.0  → 24px  (xl)
16px × 1.200³ = 27.6  → 28px  (2xl)
16px × 1.200⁴ = 33.2  → 32px  (3xl)
16px × 1.200⁵ = 39.8  → 40px  (4xl)
```

| Token | rem | px | Line-height | Rôle |
|-------|-----|----|-------------|------|
| `fontSize.xs`   | 0.75rem  | 12px | 1.6 | Détails, annotations, captions |
| `fontSize.sm`   | 0.875rem | 14px | 1.6 | Labels, métadonnées, helper text |
| `fontSize.base` | 1rem     | 16px | 1.6 | Corps de texte principal |
| `fontSize.lg`   | 1.25rem  | 20px | 1.1 | Heading 5, sous-titres |
| `fontSize.xl`   | 1.5rem   | 24px | 1.1 | Heading 4 |
| `fontSize.2xl`  | 1.75rem  | 28px | 1.1 | Heading 3 |
| `fontSize.3xl`  | 2rem     | 32px | 1.0 | Heading 2 |
| `fontSize.4xl`  | 2.5rem   | 40px | 1.0 | Heading 1 |
| `fontSize.5xl`  | 3rem     | 48px | 1.0 | Hero display |

### Règles de line-height

Trois valeurs seulement, assignées par contexte :

| Token | Valeur | Règle d'assignation |
|-------|--------|---------------------|
| `lineHeight.reading` | 1.6 | Tout texte de taille ≤ base (xs, sm, base) |
| `lineHeight.heading` | 1.1 | Titres intermédiaires (lg, xl, 2xl) |
| `lineHeight.display` | 1.0 | Grands titres (3xl, 4xl, 5xl) |

**Justification :**
- 1.6 sur les petites tailles → lisibilité maximale, conformité WCAG 1.4.12
- 1.0–1.1 sur les grands titres → impact visuel, cohérence entre sites marketing et SaaS

---

## Argumentaire

### Pourquoi Minor Third ?

Le Minor Third (1.200) est l'échelle la plus adaptée aux interfaces hybrides (marketing + SaaS) :
- Assez expressive pour les pages marketing (titres visuellement hiérarchisés)
- Assez sobre pour les SaaS (pas d'écarts gigantesques entre niveaux)
- Les valeurs arrondies à 4px restent toutes mémorisables

### Pourquoi rem et pas px ?

Les préférences d'accessibilité navigateur (zoom texte, taille police de base) utilisent rem comme levier. Un système en px ignore ces préférences. La WCAG recommande les unités relatives pour le texte (Success Criterion 1.4.4).

### Pourquoi line-height 1.6 pour les textes courants ?

La WCAG 2.1 Success Criterion 1.4.12 (Text Spacing) demande que le contenu reste lisible avec un line-height de 1.5×. Une valeur par défaut de 1.6 couvre d'office ce critère sans nécessiter d'override.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Major Second (1.125)** | Différenciation trop faible entre les niveaux de titre |
| **Perfect Fourth (1.333)** | Trop dramatique pour les interfaces SaaS à forte densité d'information |
| **Scale fixe (8, 12, 16, 20, 24, 32, 40)** | Pas de ratio mathématique — difficile à étendre cohéremment |
| **Garder les px** | Incompatible avec les préférences de zoom navigateur (WCAG 1.4.4) |
| **line-height unique 1.5** | Trop compressé sur les petits textes, trop aéré sur les très grands |

---

## Conséquences

**Pour les tokens :**
- `primitive.fontSize` passe de 3 à 9 valeurs (xs → 5xl)
- `primitive.lineHeight` passe de 2 à 3 valeurs (reading, heading, display)
- `semantic.typography` s'étend de 3 styles (body, label, heading) à 9 (detail, label, body, h5→h1, hero)

**Pour les agents IA :**
- Un agent peut choisir le niveau typographique correct par intention (corps vs titre vs hero) sans improviser des tailles

**Pour les équipes :**
- Règle simple : si c'est du texte courant → base (1rem) ; si c'est un titre → choisir parmi lg→4xl ; si c'est de la déco hero → 5xl
- Aucune valeur intermédiaire en dur autorisée
