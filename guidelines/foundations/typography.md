# Fondation — Typographie

> Fondation typographie du système de design — police, tokens et règles d'usage.
> **Type:** guideline
> **Chemin logique:** guidelines/foundations/typography.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, decisions/ADR-021-atkinson-hyperlegible.md

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

Voir [ADR-021](../../decisions/ADR-021-atkinson-hyperlegible.md) pour l'argumentaire complet et les alternatives rejetées.

---

## Graisses disponibles

Atkinson Hyperlegible ne supporte que **2 graisses** :

| Token | Valeur | Graisse réelle | Usage |
|-------|--------|----------------|-------|
| `fontWeight.regular` | 400 | Regular | Corps de texte, descriptions |
| `fontWeight.medium`  | 500 | → 400 (arrondi navigateur) | Labels, contrôles — comportement documenté |
| `fontWeight.bold`    | 700 | Bold | Titres, emphase |

> ⚠️ `fontWeight.medium` (500) n'existe pas dans Atkinson Hyperlegible. Les navigateurs l'arrondissent à Regular (400). Les labels restent lisibles — ce compromis est acceptable et choisi délibérément.

---

## Tokens de référence

**Primitifs :**
- `primitive.fontFamily.base` → `'Atkinson Hyperlegible', system-ui, sans-serif`
- `primitive.fontSize.sm` → 14px (labels)
- `primitive.fontSize.md` → 16px (corps)
- `primitive.fontSize.xl` → 24px (titres)
- `primitive.fontWeight.regular` → 400
- `primitive.fontWeight.bold` → 700
- `primitive.lineHeight.tight` → 1.25
- `primitive.lineHeight.normal` → 1.5

**Sémantiques :**
- `semantic.typography.fontFamily` → Atkinson Hyperlegible
- `semantic.typography.body` → 16px / 400 / 1.5
- `semantic.typography.label` → 14px / 500(→400) / 1.25
- `semantic.typography.heading` → 24px / 700 / 1.25

---

## Règles d'usage

```
✅ Toujours référencer un token sémantique pour la typographie
✅ font-family toujours via var(--sda-semantic-typography-fontFamily)

❌ Jamais de font-size en dur : font-size: 16px
❌ Jamais de font-family en dur : font-family: 'Atkinson Hyperlegible'
❌ Jamais de token primitif directement dans un composant
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
