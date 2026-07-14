# ADR-021 — Atkinson Hyperlegible as the primary typeface

> **Date:** 2026-05-29
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-021-atkinson-hyperlegible.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, site/build.js, guidelines/foundations/typography.md

---

## Context

The system used Inter (Google Fonts) as its default font — a common choice but with no documented accessibility rationale. The font was not tokenized: the value was hardcoded in `site/build.js` and was not part of the token system.

Two problems needed solving:
1. No accessibility rationale existed for the typographic choice
2. Since the font was not a token, agents could not trace it or enforce it

---

## Decision

### Font: Atkinson Hyperlegible

Designed by **Applied Design Works** for the **Braille Institute of America** (2019, royalty-free — Open Font License). Clinically validated to improve legibility for people with low vision.

**Technical differentiators:**

| Ambiguous pair | Inter | Atkinson Hyperlegible |
|--------------|-------|----------------------|
| `l` / `1` / `I` | Similar | Deliberately distinct |
| `O` / `0` | Similar | Deliberately distinct |
| `b` / `d` / `p` / `q` | Mirrored | Intentional asymmetries |
| `n` / `u` / `m` | Similar | Accentuated counter-forms |

**Available weights:** Regular (400) and Bold (700) only.

> ⚠️ The `primitive.fontWeight.medium` (500) token has no equivalent in Atkinson Hyperlegible. Browsers round it down to 400 (Regular). This behavior is acceptable and documented — labels and controls remain legible at 400.

### Tokenization

The font is now a primitive token (`primitive.fontFamily.base`) referenced by a semantic token (`semantic.typography.fontFamily`). It is no longer hardcoded in the build.

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

### Resolution chain in the build

```
semantic.typography.fontFamily
  → {primitive.fontFamily.base}
  → 'Atkinson Hyperlegible', system-ui, sans-serif
  → --agtc-semantic-typography-fontFamily in tokens.css
```

### Google Fonts import

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

---

## WCAG rationale

WCAG 2.x does not prescribe a specific font, but success criterion **1.4.8 (Visual Presentation, AAA)** recommends that text be readable without effort. Atkinson Hyperlegible is the most direct response to this principle at the AA+ level.

Braille Institute clinical study (2019): a measured improvement in reading accuracy for users with reduced visual acuity, with no degradation for sighted users.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **Inter** | Common choice with no documented accessibility rationale. Ambiguous pairs left unaddressed. |
| **Lexie Readable** | Less widespread, less maintained, not available on Google Fonts. |
| **OpenDyslexic** | Aesthetic too distinctive for a general-purpose design system. Effectiveness studies are contested. |
| **System font stack** | Cross-platform inconsistency. No control over character differentiation. |
| **Atkinson Hyperlegible Next** | 2024+ version, still experimental. To be reconsidered in v2. |

---

## Consequences

**For the token system:**
- `primitive.fontFamily.base` and `semantic.typography.fontFamily` added
- Any future change to the font goes through these tokens (traceable, auditable)

**For AI agents:**
- The font is now an intent (`semantic.typography.fontFamily`) rather than a hardcoded value
- Agents can reference and enforce the token in components

**For users:**
- Better legibility for people with low vision
- No degradation for anyone else — Atkinson Hyperlegible is a complete workhorse typeface

**Documented limitation:**
- No 500 weight — `fontWeight.medium` rounds down to 400 in browsers

<!-- FR -->

# ADR-021 — Atkinson Hyperlegible comme police principale

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-021-atkinson-hyperlegible.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, site/build.js, guidelines/foundations/typography.md

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
