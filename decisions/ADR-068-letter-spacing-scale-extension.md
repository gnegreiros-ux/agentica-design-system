# ADR-068 — Extending the `letterSpacing` scale: resolving the site's `--agtc-tracking-*` debt

> **Date:** 2026-07-08
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead (semantic) — Principal Designer (primitive, naming)
> **Type:** token
> **Logical path:** decisions/ADR-068-letter-spacing-scale-extension.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-067-letter-spacing-token-category.md
> **Relations:** tokens/primitives.json (primitive.letterSpacing), tokens/semantic.json (semantic.typography.letter-spacing), site/build.js

---

## Context

ADR-067 created the `letterSpacing` category (primitive + semantic) with 3 values
(`normal`, `wide`, `widest`) to resolve `agtc-code-block.js`'s debt. Its log entry noted
a residual debt **out of scope**: the site (`site/build.js`) defines its own local scale
of 9 `--agtc-tracking-*` variables, almost all hardcoded values, consumed at **50 call
sites** across ~60 CSS selectors (stats, headings, language badges, tables, property
labels, overlines).

| Site variable | Hardcoded value | Usages | Overlaps an existing primitive? |
|---|---|---|---|
| `--agtc-tracking-tighter` | `-.03em` | 8 | ❌ |
| `--agtc-tracking-tight` | `-.025em` | 1 | ❌ |
| `--agtc-tracking-snug` | `-.02em` | 6 | ❌ |
| `--agtc-tracking-heading` | `-.015em` | 3 | ❌ |
| `--agtc-tracking-wide` | `.04em` | 4 | ❌ — **name collision** with `primitive.letterSpacing.wide` (0.06em, a different value) |
| `--agtc-tracking-wider` | `.06em` | 4 | ✅ = `primitive.letterSpacing.wide` (0.06em) |
| `--agtc-tracking-label` | `.08em` | 9 | ❌ |
| `--agtc-tracking-loose` | `.09em` | 1 | ❌ |
| `--agtc-tracking-overline` | `.1em` | 9 | ❌ |
| `--agtc-tracking-eyebrow` | *(already tokenized, ADR-067)* | 5 | ✅ = `primitive.letterSpacing.widest` |

The blocking point: the site's local name `wide` (0.04em) designates a **different**
value from the token already named `wide` (0.06em, ADR-067). An automatic fix would have
silently changed the visual rendering or created lasting naming confusion — a decision
escalated to the human (`figma-library-governance.md` §1: code is authoritative, but a
naming conflict between two local sources of truth isn't a case where the agent decides alone).

---

## Decision

### 1. Naming — `relaxed` for the site's 0.04em value

Human-approved: a new `letterSpacing.relaxed` primitive (0.04em), rather than renaming
the existing `wide` token or creating a suffixed variant (`wide-sm` was rejected).
`relaxed` reads naturally on the scale, between `normal` (0em) and `wide` (0.06em).

### 2. Scope — primitive + semantic alias for every new value

Human-approved: follow the same pattern as ADR-067 for the 7 new values (not just
directly-consumed primitives) — every value gets a named intent under
`semantic.typography.letter-spacing.*`.

### Primitive — `tokens/primitives.json` → `primitive.letterSpacing`

| Token | Value | Former site name |
|-------|--------|------------------|
| `letterSpacing.tighter` | `-0.03em` | `--agtc-tracking-tighter` |
| `letterSpacing.tight` | `-0.025em` | `--agtc-tracking-tight` |
| `letterSpacing.snug` | `-0.02em` | `--agtc-tracking-snug` |
| `letterSpacing.heading` | `-0.015em` | `--agtc-tracking-heading` |
| `letterSpacing.normal` | `0em` | *(ADR-067)* |
| `letterSpacing.relaxed` | `0.04em` | `--agtc-tracking-wide` (renamed) |
| `letterSpacing.wide` | `0.06em` | *(ADR-067)* — `--agtc-tracking-wider` maps here |
| `letterSpacing.label` | `0.08em` | `--agtc-tracking-label` |
| `letterSpacing.loose` | `0.09em` | `--agtc-tracking-loose` |
| `letterSpacing.overline` | `0.1em` | `--agtc-tracking-overline` |
| `letterSpacing.widest` | `0.12em` | *(ADR-067)* — `--agtc-tracking-eyebrow` |

### Semantic — `tokens/semantic.json` → `semantic.typography.letter-spacing`

A 1:1 alias to each primitive above (`tighter`, `tight`, `snug`, `heading`, `relaxed`,
`label`, `loose`, `overline` added; `normal`/`wide` already existed since ADR-067).

### Site — `site/build.js`

The 9 `--agtc-tracking-*` variables stay in place (none of the ~50 call sites is
modified), but their **definition** is repointed to tokens instead of literal values:

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
--agtc-tracking-eyebrow:var(--agtc-semantic-marketing-typography-eyebrow-letter-spacing); /* unchanged, ADR-067 */
```

0 visual change: every variable resolves to exactly the same numeric value as before.

---

## Rationale

- The site's scale wasn't a set of incidental values — 50 call sites make it a genuine,
  systemic typographic scale, justifying its full promotion to the token level rather than
  case-by-case treatment.
- Keeping the `--agtc-tracking-*` names on the site side (instead of letting them
  disappear in favor of semantic names) avoids touching the ~50 consuming CSS selectors —
  only the definition layer changes, reducing visual regression risk to 10 lines.
- The `wide` collision (site, 0.04em) vs. `wide` (token, 0.06em) is resolved via a
  targeted rename (`relaxed`) rather than breaking compatibility on either naming side.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Rename the existing `wide` token (0.06em) to free up the name for the site | Would break the reference already in production in `agtc-code-block.js` (ADR-067) for an already-shipped component |
| `wide-sm` for the 0.04em value | Rejected by the human in favor of `relaxed`, more readable on the scale |
| Primitives only, no semantic alias | Rejected by the human — consistency with the pattern already established by ADR-067 (every value carries a named intent) |
| Rename the site's 9 `--agtc-tracking-*` variables to match token names 1:1 | Would have required touching the ~50 CSS call sites for zero gain (the site names remain readable and stable) |

---

## Consequences

**For agents:** any new label/heading needing letter spacing must consume
`semantic.typography.letter-spacing.*` (or the existing `--agtc-tracking-*` site
variable if the context is already covered) — no hardcoded value remains available as an excuse.

**For the system:** `site/build.js` no longer has any hardcoded `letter-spacing` value
in its scale definition. The `letterSpacing` token debt (opened by ADR-067) is closed.

**Build:** `npm run tokens` regenerated (0 phantom); `node site/build.js` regenerated —
823 variables defined, 280 referenced, 0 phantom, 101 files.

**Governance:** extension of an existing semantic category → Design System Lead
approval; primitives (`relaxed` naming, primitive+semantic scope) → Principal Designer
approval. Both approved by the human on 2026-07-08.

**Figma:** out of scope for this ADR — `.claude/instructions/figma-components.md` §24
(Monospace presentation typography) references only `semantic.typography.mono.family`
and the `code-block` badge tokens (ADR-067), not this broader tracking scale. A future
Figma effort on the site's headings/badges will need to trace these same tokens before
creating anything — same rule: code is authoritative.

<!-- FR -->

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
