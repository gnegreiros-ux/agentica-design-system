# ADR-028 — Atkinson Hyperlegible Mono as the monospace typeface

> **Date:** 2026-05-30
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-028-atkinson-hyperlegible-mono.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** ADR-021-atkinson-hyperlegible.md, tokens/primitives.json, tokens/semantic.json, site/build.js, guidelines/foundations/typography.md

---

## Context

Since ADR-021, the primary font has been Atkinson Hyperlegible (sans-serif). The system used the generic `monospace` value as the fallback font for code elements (`<code>`, token labels, ADR numbers).

Problems to solve:
1. `font-family: monospace` is uncontrollable — every OS and browser renders a different result (Courier New, Menlo, Consolas, DejaVu Sans Mono)
2. No accessibility consistency between the body font and the code font
3. The choice was neither tokenized nor documented — invisible to agents

---

## Decision

### Font: Atkinson Hyperlegible Mono

Designed by **Applied Design Works** for the **Braille Institute of America** — the official monospace companion to Atkinson Hyperlegible. Same design philosophy: maximum differentiation of ambiguous characters, optimized for low vision.

**Technical differentiators:**

| Ambiguous pair | System monospace | Atkinson Hyperlegible Mono |
|--------------|-------------------|---------------------------|
| `l` / `1` / `I` | Often identical | Deliberately distinct |
| `O` / `0` | Often identical | Deliberately distinct |
| `b` / `d` / `p` / `q` | Mirrored | Intentional asymmetries |
| `{` / `(` / `[` | Similar | Distinct shape and opening |

**Available weights:** Regular (400) and Bold (700), in roman and italic.

### Tokenization

The font is exposed via a CSS custom property in the build:

```css
/* :root in site.css */
--agtc-font-mono: 'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'Cascadia Code', monospace;
```

The fallback chain guarantees an acceptable result even with no internet connection:
- `JetBrains Mono` — developer-focused, highly legible
- `Cascadia Code` — Windows/VS Code, modern
- `monospace` — last-resort system fallback

### Google Fonts import

Loaded in the same `@import` as Atkinson Hyperlegible (a single network request):

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

### Elements using `--agtc-font-mono`

| Element | Context |
|---------|----------|
| `code` | All pages — token names, code examples |
| `.adr-num` | Decision pages — the `ADR-0XX` number |
| `.space-label` | Spacing page — scale labels |
| `.color-name`, `.color-value` | Color page — hex, token name |
| `.adr-num`, `.density-card-math` | Decision pages — math token formulas |
| Inline `style="font-family:var(--agtc-font-mono)"` | Value cells in token tables |

---

## Rationale

Typographic consistency between the body font (Atkinson Hyperlegible) and the code font (Atkinson Hyperlegible Mono) is a quality criterion for a design system. Using a shared family guarantees:

- The same accessibility DNA (ambiguous characters handled the same way)
- The same visual rhythm (similar x-height, compatible letter spacing)
- A single provider (Google Fonts) for both variants

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **`monospace` (system)** | Uncontrollable cross-platform. No accessibility guarantee. |
| **JetBrains Mono** | An excellent choice, but a stylistic break from Atkinson Hyperlegible. |
| **Source Code Pro** | Same issue — no link to the primary body font. |
| **Fira Code** | Ligatures potentially problematic for agents reading code. |
| **Atkinson Hyperlegible Next Mono** | Not yet available on Google Fonts as of 2026-05. To be reconsidered in v2. |

---

## Consequences

**For the token system:**
- `--agtc-font-mono` becomes the mandatory reference for every monospace element
- Hardcoded `font-family: monospace` is forbidden (detectable via ESLint audit)

**For AI agents:**
- The monospace font is a traceable decision, not a system default
- Agents can verify that a component uses `var(--agtc-font-mono)` rather than a hardcoded value

**For users:**
- Better legibility of token names and code for people with low vision
- Reinforced visual consistency between body text and code elements

<!-- FR -->

# ADR-028 — Atkinson Hyperlegible Mono comme police monospace

> **Date :** 2026-05-30
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-028-atkinson-hyperlegible-mono.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** ADR-021-atkinson-hyperlegible.md, tokens/primitives.json, tokens/semantic.json, site/build.js, guidelines/foundations/typography.md

---

## Contexte

Depuis ADR-021, la police principale est Atkinson Hyperlegible (sans-serif). Le système utilisait la valeur générique `monospace` comme police de repli pour les éléments de code (`<code>`, labels de tokens, numéros ADR).

Problèmes à résoudre :
1. `font-family: monospace` est incontrôlable — chaque OS et navigateur rend un résultat différent (Courier New, Menlo, Consolas, DejaVu Sans Mono)
2. Aucune cohérence d'accessibilité entre la police de texte et la police de code
3. Le choix n'était pas tokenisé ni documenté — invisible pour les agents

---

## Décision

### Police : Atkinson Hyperlegible Mono

Conçue par **Applied Design Works** pour le **Braille Institute of America** — compagnon monospace officiel d'Atkinson Hyperlegible. Même philosophie de conception : différenciation maximale des caractères ambigus, optimisée pour la basse vision.

**Différenciateurs techniques :**

| Paire ambiguë | Monospace système | Atkinson Hyperlegible Mono |
|--------------|-------------------|---------------------------|
| `l` / `1` / `I` | Souvent identiques | Délibérément distincts |
| `O` / `0` | Souvent identiques | Délibérément distincts |
| `b` / `d` / `p` / `q` | Miroirs | Asymétries intentionnelles |
| `{` / `(` / `[` | Similaires | Forme et ouverture distinctes |

**Graisses disponibles :** Regular (400) et Bold (700), en romain et italique.

### Tokenisation

La police est exposée via un token CSS custom property dans le build :

```css
/* :root dans site.css */
--agtc-font-mono: 'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'Cascadia Code', monospace;
```

La chaîne de fallback garantit un résultat acceptable même sans connexion Internet :
- `JetBrains Mono` — développeur, haute lisibilité
- `Cascadia Code` — Windows/VS Code, modern
- `monospace` — dernier recours système

### Import Google Fonts

Chargé dans le même `@import` qu'Atkinson Hyperlegible (une seule requête réseau) :

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Atkinson+Hyperlegible+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

### Éléments utilisant `--agtc-font-mono`

| Élément | Contexte |
|---------|----------|
| `code` | Toutes les pages — noms de tokens, exemples de code |
| `.adr-num` | Pages décisions — numéro `ADR-0XX` |
| `.space-label` | Page espacement — labels de scale |
| `.color-name`, `.color-value` | Page couleur — hex, nom du token |
| `.adr-num`, `.density-card-math` | Pages décisions — formules math tokens |
| Inline `style="font-family:var(--agtc-font-mono)"` | Cellules de valeurs dans les tableaux de tokens |

---

## Argumentaire

La cohérence typographique entre la police de texte (Atkinson Hyperlegible) et la police de code (Atkinson Hyperlegible Mono) est un critère de qualité de design system. L'utilisation d'une famille partagée garantit :

- Même ADN d'accessibilité (caractères ambigus traités de la même façon)
- Même rhythm visuel (hauteur x similaire, espace entre-lettres compatible)
- Un seul fournisseur (Google Fonts) pour les deux variantes

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **`monospace` (système)** | Incontrôlable cross-plateforme. Aucune garantie d'accessibilité. |
| **JetBrains Mono** | Excellent choix, mais rupture stylistique avec Atkinson Hyperlegible. |
| **Source Code Pro** | Même logique — pas de lien avec la police de texte principale. |
| **Fira Code** | Ligatures potentiellement problématiques pour les agents lisant du code. |
| **Atkinson Hyperlegible Next Mono** | Pas encore disponible sur Google Fonts en 2026-05. À reconsidérer en v2. |

---

## Conséquences

**Pour le système de tokens :**
- `--agtc-font-mono` devient la référence obligatoire pour tout élément monospace
- `font-family: monospace` en dur est interdit (détectable par audit ESLint)

**Pour les agents IA :**
- La police monospace est une décision traçable, pas un défaut système
- Les agents peuvent vérifier qu'un composant utilise `var(--agtc-font-mono)` plutôt qu'une valeur hardcodée

**Pour les utilisateurs :**
- Meilleure lisibilité des noms de tokens et du code pour les personnes à basse vision
- Cohérence visuelle renforcée entre le texte courant et les éléments de code
