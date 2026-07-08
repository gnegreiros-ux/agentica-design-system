# ADR-068 — Extension de l'échelle `letterSpacing` : résorption de la dette `--agtc-tracking-*` du site

> **Date :** 2026-07-08
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead (sémantique) — Principal Designer (primitive, nommage)
> **Type:** token
> **Chemin logique:** decisions/ADR-068-letter-spacing-scale-extension.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-067-letter-spacing-token-category.md
> **Relations:** tokens/primitives.json (primitive.letterSpacing), tokens/semantic.json (semantic.typography.letter-spacing), site/build.js

---

## Contexte

ADR-067 a créé la catégorie `letterSpacing` (primitif + sémantique) avec 3 valeurs
(`normal`, `wide`, `widest`) pour résorber la dette de `agtc-code-block.js`. Son entrée de
log notait une dette résiduelle **hors périmètre** : le site (`site/build.js`) définit sa
propre échelle locale de 9 variables `--agtc-tracking-*`, presque toutes en valeurs
codées en dur, consommées à **50 sites d'appel** à travers ~60 sélecteurs CSS (stats,
titres, badges de langue, tableaux, labels de propriété, overlines).

| Variable site | Valeur en dur | Usages | Recoupe une primitive existante ? |
|---|---|---|---|
| `--agtc-tracking-tighter` | `-.03em` | 8 | ❌ |
| `--agtc-tracking-tight` | `-.025em` | 1 | ❌ |
| `--agtc-tracking-snug` | `-.02em` | 6 | ❌ |
| `--agtc-tracking-heading` | `-.015em` | 3 | ❌ |
| `--agtc-tracking-wide` | `.04em` | 4 | ❌ — **collision de nom** avec `primitive.letterSpacing.wide` (0.06em, valeur différente) |
| `--agtc-tracking-wider` | `.06em` | 4 | ✅ = `primitive.letterSpacing.wide` (0.06em) |
| `--agtc-tracking-label` | `.08em` | 9 | ❌ |
| `--agtc-tracking-loose` | `.09em` | 1 | ❌ |
| `--agtc-tracking-overline` | `.1em` | 9 | ❌ |
| `--agtc-tracking-eyebrow` | *(déjà tokenisé, ADR-067)* | 5 | ✅ = `primitive.letterSpacing.widest` |

Le point bloquant : le nom local du site `wide` (0.04em) désigne une valeur **différente**
du token déjà nommé `wide` (0.06em, ADR-067). Une correction automatique aurait silencieusement
changé le rendu visuel ou créé une confusion de nommage durable — décision escaladée à l'humain
(`figma-library-governance.md` §1 : le code fait foi, mais un conflit de nommage entre deux
sources de vérité locales n'est pas un cas où l'agent tranche seul).

---

## Décision

### 1. Nommage — `relaxed` pour la valeur 0.04em du site

Approuvé par l'humain : nouvelle primitive `letterSpacing.relaxed` (0.04em), plutôt que de
renommer le token existant `wide` ou de créer une variante suffixée (`wide-sm` rejeté).
`relaxed` se lit naturellement sur l'échelle, entre `normal` (0em) et `wide` (0.06em).

### 2. Portée — primitive + alias sémantique pour chaque nouvelle valeur

Approuvé par l'humain : suivre le même patron qu'ADR-067 pour les 7 nouvelles valeurs
(pas seulement des primitives consommées directement) — chaque valeur reçoit une intention
nommée en `semantic.typography.letter-spacing.*`.

### Primitif — `tokens/primitives.json` → `primitive.letterSpacing`

| Token | Valeur | Ancien nom site |
|-------|--------|------------------|
| `letterSpacing.tighter` | `-0.03em` | `--agtc-tracking-tighter` |
| `letterSpacing.tight` | `-0.025em` | `--agtc-tracking-tight` |
| `letterSpacing.snug` | `-0.02em` | `--agtc-tracking-snug` |
| `letterSpacing.heading` | `-0.015em` | `--agtc-tracking-heading` |
| `letterSpacing.normal` | `0em` | *(ADR-067)* |
| `letterSpacing.relaxed` | `0.04em` | `--agtc-tracking-wide` (renommé) |
| `letterSpacing.wide` | `0.06em` | *(ADR-067)* — `--agtc-tracking-wider` s'y rattache |
| `letterSpacing.label` | `0.08em` | `--agtc-tracking-label` |
| `letterSpacing.loose` | `0.09em` | `--agtc-tracking-loose` |
| `letterSpacing.overline` | `0.1em` | `--agtc-tracking-overline` |
| `letterSpacing.widest` | `0.12em` | *(ADR-067)* — `--agtc-tracking-eyebrow` |

### Sémantique — `tokens/semantic.json` → `semantic.typography.letter-spacing`

Alias 1:1 vers chaque primitive ci-dessus (`tighter`, `tight`, `snug`, `heading`, `relaxed`,
`label`, `loose`, `overline` ajoutés ; `normal`/`wide` déjà existants depuis ADR-067).

### Site — `site/build.js`

Les 9 variables `--agtc-tracking-*` restent en place (aucun des ~50 sites d'appel n'est
modifié) mais leur **définition** est repointée vers les tokens au lieu de valeurs littérales :

```css
--agtc-tracking-tighter:var(--agtc-semantic-typography-letter-spacing-tighter);
--agtc-tracking-tight:var(--agtc-semantic-typography-letter-spacing-tight);
--agtc-tracking-snug:var(--agtc-semantic-typography-letter-spacing-snug);
--agtc-tracking-heading:var(--agtc-semantic-typography-letter-spacing-heading);
--agtc-tracking-wide:var(--agtc-semantic-typography-letter-spacing-relaxed);
--agtc-tracking-wider:var(--agtc-semantic-typography-letter-spacing-wide);
--agtc-tracking-label:var(--agtc-semantic-typography-letter-spacing-label);
--agtc-tracking-loose:var(--agtc-semantic-typography-letter-spacing-loose);
--agtc-tracking-overline:var(--agtc-semantic-typography-letter-spacing-overline);
--agtc-tracking-eyebrow:var(--agtc-semantic-marketing-typography-eyebrow-letter-spacing); /* inchangé, ADR-067 */
```

0 changement visuel : chaque variable résout exactement à la même valeur numérique qu'avant.

---

## Argumentaire

- L'échelle du site n'était pas un ensemble de valeurs incidentes — 50 sites d'appel en font
  une véritable échelle typographique systémique, justifiant sa promotion complète au niveau
  token plutôt qu'un traitement au cas par cas.
- Conserver les noms `--agtc-tracking-*` côté site (au lieu de les faire disparaître au profit
  des noms sémantiques) évite de toucher aux ~50 sélecteurs CSS consommateurs — seule la couche
  de définition change, réduisant le risque de régression visuelle à 10 lignes.
- La collision `wide` (site, 0.04em) vs `wide` (token, 0.06em) est résolue par un renommage
  ciblé (`relaxed`) plutôt qu'en cassant la compatibilité de l'un ou l'autre nommage.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Renommer le token existant `wide` (0.06em) pour libérer le nom au site | Casserait la référence déjà en production dans `agtc-code-block.js` (ADR-067) pour un composant déjà livré |
| `wide-sm` pour la valeur 0.04em | Rejeté par l'humain au profit de `relaxed`, plus lisible sur l'échelle |
| Primitives seules, sans alias sémantique | Rejeté par l'humain — cohérence avec le patron déjà établi par ADR-067 (chaque valeur porte une intention nommée) |
| Renommer les 9 variables `--agtc-tracking-*` du site pour matcher 1:1 les noms de tokens | Aurait nécessité de toucher les ~50 sites d'appel CSS pour un gain nul (les noms de site restent lisibles et stables) |

---

## Conséquences

**Pour les agents :** toute nouvelle étiquette/titre nécessitant un espacement de lettres doit
consommer `semantic.typography.letter-spacing.*` (ou la variable site `--agtc-tracking-*`
existante si le contexte est déjà couvert) — plus aucune valeur en dur disponible comme excuse.

**Pour le système :** `site/build.js` n'a plus aucune valeur `letter-spacing` codée en dur dans
sa définition d'échelle. La dette de tokens `letterSpacing` (ouverte par ADR-067) est fermée.

**Build :** `npm run tokens` régénéré (0 fantôme) ; `node site/build.js` régénéré —
823 variables définies, 280 référencées, 0 fantôme, 101 fichiers.

**Gouvernance :** extension de catégorie sémantique existante → approbation Design System Lead ;
primitives (nommage `relaxed`, portée primitive+sémantique) → approbation Principal Designer.
Les deux approuvées par l'humain le 2026-07-08.

**Figma :** hors périmètre de cet ADR — `.claude/instructions/figma-components.md` §24
(typographie de présentation Monospace) référence uniquement `semantic.typography.mono.family`
et les tokens du badge `code-block` (ADR-067), pas cette échelle de tracking plus large. Un futur
chantier Figma sur les titres/badges du site devra tracer ces mêmes tokens avant de créer quoi
que ce soit — même règle : le code fait foi.
