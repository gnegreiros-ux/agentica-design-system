# ADR-028 — Atkinson Hyperlegible Mono comme police monospace

> **Date :** 2026-05-30
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-028-atkinson-hyperlegible-mono.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** ADR-021-atkinson-hyperlegible.md, tokens/primitives.json, tokens/semantic.json, site/build.js, guidelines/foundations/typography.md

> **English summary:** Adopts Atkinson Hyperlegible Mono — the monospace companion to ADR-021's Atkinson Hyperlegible — as the tokenized monospace font (`--agtc-font-mono`) for code, token names, and ADR numbers, replacing the uncontrollable generic `monospace` fallback that rendered differently across OS/browsers.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
