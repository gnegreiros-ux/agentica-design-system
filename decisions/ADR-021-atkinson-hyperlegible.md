# ADR-021 — Atkinson Hyperlegible comme police principale

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-021-atkinson-hyperlegible.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, site/build.js, guidelines/foundations/typography.md

> **English summary:** Replaces Inter (chosen with no documented accessibility rationale) with Atkinson Hyperlegible, a font designed for the Braille Institute of America that deliberately disambiguates commonly confused characters (l/1/I, O/0, b/d/p/q) to improve legibility for low-vision users. Tokenized as `primitive.fontFamily.base`; the font has no medium (500) weight, which browsers round down to 400.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

Le système utilisait Inter (Google Fonts) comme police par défaut — choix courant mais sans justification d'accessibilité documentée. La police n'était pas tokenisée : la valeur était hardcodée dans `site/build.js` et ne faisait pas partie du système de tokens.

Deux problèmes à résoudre :
1. Aucun argumentaire d'accessibilité pour le choix typographique
2. La police n'étant pas un token, les agents ne pouvaient pas la tracer ni la faire respecter

---

## Décision

### Police : Atkinson Hyperlegible

Conçue par **Applied Design Works** pour le **Braille Institute of America** (2019, libre de droits — Open Font License). Cliniquement validée pour améliorer la lisibilité auprès des personnes à basse vision.

**Différenciateurs techniques :**

| Paire ambiguë | Inter | Atkinson Hyperlegible |
|--------------|-------|----------------------|
| `l` / `1` / `I` | Similaires | Délibérément distincts |
| `O` / `0` | Similaires | Délibérément distincts |
| `b` / `d` / `p` / `q` | Miroirs | Asymétries intentionnelles |
| `n` / `u` / `m` | Similaires | Contre-formes accentuées |

**Graisses disponibles :** Regular (400) et Bold (700) uniquement.

> ⚠️ Le token `primitive.fontWeight.medium` (500) n'a pas d'équivalent dans Atkinson Hyperlegible. Les navigateurs l'arrondissent à 400 (Regular). Ce comportement est acceptable et documenté — les labels et contrôles restent lisibles à 400.

### Tokenisation

La police est désormais un token primitif (`primitive.fontFamily.base`) référencé par un token sémantique (`semantic.typography.fontFamily`). Elle n'est plus hardcodée dans le build.

```json
// primitives.json
"fontFamily": {
  "base": { "$value": "'Atkinson Hyperlegible', system-ui, sans-serif" }
}

// semantic.json
"typography": {
  "fontFamily": { "value": "{primitive.fontFamily.base}" }
}
```

### Chaîne de résolution dans le build

```
semantic.typography.fontFamily
  → {primitive.fontFamily.base}
  → 'Atkinson Hyperlegible', system-ui, sans-serif
  → --agtc-semantic-typography-fontFamily dans tokens.css
```

### Import Google Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

---

## Argumentaire WCAG

WCAG 2.x ne prescrit pas de police spécifique mais le critère **1.4.8 (Visual Presentation, AAA)** recommande que le texte soit lisible sans effort. Atkinson Hyperlegible est la réponse la plus directe à ce principe au niveau AA+.

Étude clinique Braille Institute (2019) : amélioration mesurée de la précision de lecture pour les utilisateurs à acuité visuelle réduite, sans dégradation pour les utilisateurs normo-voyants.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Inter** | Choix courant sans justification d'accessibilité. Paires ambiguës non traitées. |
| **Lexie Readable** | Moins répandue, moins maintenue, non disponible sur Google Fonts. |
| **OpenDyslexic** | Esthétique trop marquée pour un design system généraliste. Études d'efficacité contestées. |
| **System font stack** | Incohérence cross-plateforme. Aucun contrôle sur la différenciation des caractères. |
| **Atkinson Hyperlegible Next** | Version 2024+, encore expérimentale. À reconsidérer en v2. |

---

## Conséquences

**Pour le système de tokens :**
- `primitive.fontFamily.base` et `semantic.typography.fontFamily` ajoutés
- Toute modification future de la police passe par ces tokens (traçable, auditable)

**Pour les agents IA :**
- La police est maintenant une intention (`semantic.typography.fontFamily`) et non une valeur hardcodée
- Les agents peuvent référencer et faire respecter le token dans les composants

**Pour les utilisateurs :**
- Meilleure lisibilité pour les personnes à basse vision
- Aucune dégradation pour les autres — Atkinson Hyperlegible est une police de labeur complète

**Limitation documentée :**
- Pas de graisse 500 — `fontWeight.medium` s'arrondit à 400 dans les navigateurs
