# Fondation — Typographie

> Fondation typographie du système de design — police, échelle, tokens et règles d'usage.
> **Type:** guideline
> **Chemin logique:** guidelines/foundations/typography.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, decisions/ADR-021-atkinson-hyperlegible.md, decisions/ADR-023-echelle-typographique-minor-third.md

---

## Police principale — Atkinson Hyperlegible

Conçue par Applied Design Works pour le Braille Institute of America (2019, Open Font License).
Objectif : différenciation maximale des caractères ambigus pour les personnes à basse vision.

**Pourquoi ce choix :**

| Paire ambiguë | Traitement |
|--------------|-----------|
| `l` / `1` / `I` | Délibérément distincts — empattements et formes uniques |
| `O` / `0` | Distincts — le zéro est barré |
| `b` / `d` / `p` / `q` | Asymétries intentionnelles — non-miroirs |
| `n` / `u` / `m` | Contre-formes accentuées |

Voir [ADR-021](../../decisions/ADR-021-atkinson-hyperlegible.md) pour l'argumentaire complet.

---

## Graisses disponibles

Atkinson Hyperlegible ne supporte que **2 graisses** :

| Token | Valeur | Graisse réelle | Usage |
|-------|--------|----------------|-------|
| `fontWeight.regular` | 400 | Regular | Corps de texte, descriptions |
| `fontWeight.medium`  | 500 | → 400 (arrondi navigateur) | Labels, contrôles — comportement documenté |
| `fontWeight.bold`    | 700 | Bold | Titres, emphase |

> ⚠️ `fontWeight.medium` (500) n'existe pas dans Atkinson Hyperlegible. Les navigateurs l'arrondissent à Regular (400). Ce compromis est acceptable et choisi délibérément.

---

## Échelle de tailles — Minor Third (ratio 1.2)

Voir [ADR-023](../../decisions/ADR-023-echelle-typographique-minor-third.md) pour l'argumentaire complet.

**Principe :** ratio 1.200 (Minor Third), arrondi au multiple de 4px le plus proche. Unité : `rem` (respecte le zoom navigateur — WCAG 1.4.4).

| Token primitif | rem | px | Contexte |
|---------------|-----|----|---------|
| `primitive.fontSize.xs`   | 0.75rem  | 12px | Détails, annotations, captions |
| `primitive.fontSize.sm`   | 0.875rem | 14px | Labels, métadonnées, helper text |
| `primitive.fontSize.base` | 1rem     | 16px | Corps de texte principal |
| `primitive.fontSize.lg`   | 1.25rem  | 20px | Heading 5, sous-titres |
| `primitive.fontSize.xl`   | 1.5rem   | 24px | Heading 4 |
| `primitive.fontSize.2xl`  | 1.75rem  | 28px | Heading 3 |
| `primitive.fontSize.3xl`  | 2rem     | 32px | Heading 2 |
| `primitive.fontSize.4xl`  | 2.5rem   | 40px | Heading 1 |
| `primitive.fontSize.5xl`  | 3rem     | 48px | Hero display |

---

## Règles de line-height

Trois valeurs seulement, assignées par contexte de taille :

| Token | Valeur | Règle |
|-------|--------|-------|
| `primitive.lineHeight.reading` | 1.6 | Tout texte ≤ base (xs, sm, base) — WCAG 1.4.12 |
| `primitive.lineHeight.heading` | 1.1 | Titres intermédiaires (lg, xl, 2xl) |
| `primitive.lineHeight.display` | 1.0 | Grands titres (3xl, 4xl, 5xl) |

---

## Règles de letter-spacing (tracking)

Onze valeurs, de resserré (grands nombres/titres display) à élargi (badges/étiquettes en
petites majuscules). Résorption de dette en deux temps : ADR-067 (catégorie + `wide`/`widest`
pour le badge de langue `agtc-code-block`), ADR-068 (extension complète — les 9 variables
`--agtc-tracking-*` du site, ~50 sites d'appel, n'ont plus aucune valeur en dur).

| Token | Valeur | Rôle |
|-------|--------|------|
| `primitive.letterSpacing.tighter` | -0.03em | Grands nombres/chiffres display (stats, KPI) |
| `primitive.letterSpacing.tight` | -0.025em | Titres h1 hors hero |
| `primitive.letterSpacing.snug` | -0.02em | Logo, nombres de stats secondaires, titres de section home |
| `primitive.letterSpacing.heading` | -0.015em | Titres h2, titres de page ADR |
| `primitive.letterSpacing.normal` | 0em | Défaut — corps de texte, labels, détails |
| `primitive.letterSpacing.relaxed` | 0.04em | Boutons de langue, en-têtes de tableau de contraste |
| `primitive.letterSpacing.wide` | 0.06em | Petites majuscules — indicateur de langue de code, tableaux |
| `primitive.letterSpacing.label` | 0.08em | Labels de propriété/métadonnée en majuscules |
| `primitive.letterSpacing.loose` | 0.09em | Étiquette d'audience en majuscules |
| `primitive.letterSpacing.overline` | 0.1em | Badges/tags contextuels en majuscules (overline) |
| `primitive.letterSpacing.widest` | 0.12em | Étiquette eyebrow marketing |

Chaque primitive a un alias `semantic.typography.letter-spacing.*` de même nom. Le site
consomme ces tokens via une échelle nommée `--agtc-tracking-*` (`site/build.js`) qui reprend
les mêmes noms sauf deux exceptions historiques préservées pour ne pas toucher aux sites
d'appel : `--agtc-tracking-wide` → `letter-spacing.relaxed` (0.04em) et
`--agtc-tracking-wider` → `letter-spacing.wide` (0.06em) — voir ADR-068 pour le détail de
cette collision de nommage.

---

## Styles sémantiques — les 9 niveaux

| Token sémantique | Taille | Graisse | Line-height | Rôle |
|-----------------|--------|---------|-------------|------|
| `semantic.typography.detail`    | xs (12px)  | 400 | 1.6 | Annotations, captions, aide contextuelle |
| `semantic.typography.label`     | sm (14px)  | 500 | 1.6 | Labels de formulaire, tags, métadonnées |
| `semantic.typography.body`      | base (16px)| 400 | 1.6 | Corps de texte principal |
| `semantic.typography.heading.5` | lg (20px)  | 500 | 1.1 | H5, sous-titres de section |
| `semantic.typography.heading.4` | xl (24px)  | 700 | 1.1 | H4 |
| `semantic.typography.heading.3` | 2xl (28px) | 700 | 1.1 | H3 |
| `semantic.typography.heading.2` | 3xl (32px) | 700 | 1.0 | H2 |
| `semantic.typography.heading.1` | 4xl (40px) | 700 | 1.0 | H1 principal |
| `semantic.typography.hero`      | 5xl (48px) | 700 | 1.0 | Titre hero, landing page |

---

## Règles d'usage

```
✅ Toujours référencer un token sémantique pour la typographie
✅ font-family toujours via var(--agtc-semantic-typography-fontFamily)
✅ Choisir le niveau par INTENTION (h1 pour titre principal, body pour paragraphe)

❌ Jamais de font-size en dur : font-size: 16px
❌ Jamais de font-family en dur : font-family: 'Atkinson Hyperlegible'
�� Jamais de token primitif directement dans un composant
❌ Jamais inventer un niveau intermédiaire (ex: 18px) — choisir l'échelon existant
```

---

## Import Google Fonts

Pour les projets web utilisant le CDN :

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

Pour les projets avec dépendance npm locale :

```bash
npm install @fontsource/atkinson-hyperlegible
```

```javascript
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
```
