# ADR-041 — Implementation of `agtc-code-block`

> **Date:** 2026-06-03
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-041-agtc-code-block-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, decisions/ADR-028-atkinson-hyperlegible-mono.md, decisions/ADR-040-agtc-table-implementation.md, guidelines/components/code-block.md, tokens/component.json

---

## Applied reference UX patterns

> Added on 2026-06-03 via the `ux-pattern-review` workflow (ADR-036). Decision: **CD1–CD9 all approved**.
> Detail and links: `guidelines/components/code-block.md` § UX Patterns Reference.

| # | Pattern | Source |
|---|---------|--------|
| CD1 | Semantic `<pre><code>` + language class | DEV — copy code button |
| CD2 | Copy button + text feedback | roboleary |
| CD3 | Accessible copy button (aria-label, focus-visible) | Sara Soueidan |
| CD4 | Success announced to AT (`role="status"` / `aria-live`) | Sara Soueidan |
| CD5 | Language indicator | DEV |
| CD6 | Horizontal scroll for long lines | NN/g |
| CD7 | Syntax highlighting — **deferred in v1, door left open** | NN/g |
| CD8 | Optional header (file name) | DEV |
| CD9 | Line numbers — **out of v1 scope** | NN/g |

---

## Context

The site uses `pre.code-block` on almost every component and ADR page (71 usages), with a
copy button hand-rolled in JS (`site.js`): **FR-only, no `aria-label`, no visible focus,
no announcement to AT**, and **no language indicator**. Colors are hardcoded (`#1a1e24` / `#c9d1d9`).

`agtc-code-block` formalizes this need: a **read-only**, copyable, accessible code block, with a
language indicator, on a tokenized dark surface. It's the 2nd component from the 2026-06-03
gap analysis (category B), after `agtc-table`.

---

## Decisions

### Decision 1 — "Mix" architecture (consistent with ADR-040)

1. **`<agtc-code-block>`** (Lit, shadow DOM) — code via `<slot>`, built-in language + copy button.
   For apps, JS contexts, and Storybook.
2. **`.code-block` class** on a static `<pre>` — for the site, which stays resilient HTML;
   the copy button is added by `site.js` (upgraded for accessibility).

Both consume `component.code-block.*` and `semantic.typography.mono`.

### Decision 2 — Tokenized dark surface (theme retained)

The block stays **dark** (convention: distinguishes code from prose). The hardcoded colors are
replaced with `component.code-block.*` tokens referencing primitives: background `gray.12`
(#202020), text `gray.4` (#e8e8e8, contrast ≥ 13:1), metadata `gray.8`, copy button
`gray.11`/`gray.10` + text `gray.1` (≥ 4.5:1). Consistent with the existing precedent of
component tokens referencing primitives (e.g. `badge.success.background` = `primitive.color.green.3`).

### Decision 3 — Syntax highlighting deferred (CD7), no dependency

v1 displays **light, high-contrast text** with no syntax highlighting. Reason: avoid a heavy
dependency (Prism/Shiki) and keep the human "final word" on the color palette. The API (slot +
`language`) is designed to accommodate a highlighter later without a breaking change. Line
numbers (CD9) are also out of v1.

### Decision 4 — Copy button accessibility (fixes existing debt)

Real `<button>`, explicit `aria-label` (language included), tokenized `:focus-visible`, success
announced via a `role="status"` `aria-live="polite"` region. `site.js` is upgraded to apply these
guarantees to the existing static blocks.

### Decision 5 — Addition of the monospace font token (applies ADR-028)

ADR-028 decided on Atkinson Hyperlegible Mono, but the font was **not** a token: the site
hardcoded `--agtc-font-mono`. This component needs the mono font on both the component side
**and** the site side. Addition of `primitive.fontFamily.mono` + `semantic.typography.mono.family` →
`--agtc-semantic-typography-mono-family`. This is an **application of ADR-028** (not a new
decision), so no new typography ADR is required.

---

## v1 Scope

| Included | Excluded (door left open) |
|--------|------------------------|
| Slotted component + `.code-block` class | Syntax highlighting (Prism/Shiki) |
| Accessible copy button + AT announcement | Line numbers |
| Language indicator, file name | Code editing / execution |
| Horizontal scroll | Light theme |
| Tokenized dark surface | Folding / range selection |

---

## Rejected alternatives

- **Syntax highlighting via Prism/Shiki in v1**: heavy dependency, ungoverned colors — deferred.
- **Light theme**: would break the convention and the code/prose distinction.
- **Keeping `--agtc-font-mono` hardcoded**: debt; properly tokenized (applies ADR-028).
- **Purely presentational copy button (`<div>`)**: inaccessible via keyboard and AT.

---

## Consequences

- The site can migrate its `pre.code-block` instances to the component during *dogfooding* (category A).
- The mono font is now a reusable token for any component/foundation.
- Any future syntax highlighting will require an ADR (governance).

---

## Tokens added

### `component.code-block.default.*`
| Token | Reference |
|-------|-----------|
| `background` | `primitive.color.gray.12` |
| `text` | `primitive.color.gray.4` |
| `meta-text` | `primitive.color.gray.8` |
| `copy-background` | `primitive.color.gray.11` |
| `copy-background-hover` | `primitive.color.gray.10` |
| `copy-text` | `primitive.color.gray.1` |
| `border-focus` | `semantic.color.border.focus` |
| `radius` | `semantic.radius.card` |
| `font-size` | `semantic.typography.label.size` |
| `padding-x` / `padding-y` | `primitive.space.5` / `primitive.space.4` |

### Typography (applies ADR-028)
| Token | Value |
|-------|-------|
| `primitive.fontFamily.mono` | `'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'Cascadia Code', monospace` |
| `semantic.typography.mono.family` | `{primitive.fontFamily.mono}` |

<!-- FR -->

# ADR-041 — Implémentation de `agtc-code-block`

> **Date :** 2026-06-03
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-041-agtc-code-block-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, decisions/ADR-028-atkinson-hyperlegible-mono.md, decisions/ADR-040-agtc-table-implementation.md, guidelines/components/code-block.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-03 via le workflow `ux-pattern-review` (ADR-036). Décision : **CD1–CD9 tous approuvés**.
> Détail et liens : `guidelines/components/code-block.md` § UX Patterns Reference.

| # | Pattern | Source |
|---|---------|--------|
| CD1 | `<pre><code>` sémantique + classe de langue | DEV — copy code button |
| CD2 | Bouton copier + feedback texte | roboleary |
| CD3 | Bouton copier accessible (aria-label, focus-visible) | Sara Soueidan |
| CD4 | Succès annoncé aux AT (`role="status"` / `aria-live`) | Sara Soueidan |
| CD5 | Indicateur de langue | DEV |
| CD6 | Scroll horizontal des lignes longues | NN/g |
| CD7 | Coloration syntaxique — **différée v1, porte ouverte** | NN/g |
| CD8 | En-tête (nom de fichier) optionnel | DEV |
| CD9 | Numéros de ligne — **hors v1** | NN/g |

---

## Contexte

Le site utilise `pre.code-block` sur quasiment chaque page composant et ADR (71 usages), avec un
bouton copier bricolé en JS (`site.js`) : **FR-only, sans `aria-label`, sans focus visible, sans
annonce aux AT**, et **aucun indicateur de langue**. Couleurs codées en dur (`#1a1e24` / `#c9d1d9`).

`agtc-code-block` formalise ce besoin : bloc de code en **lecture seule**, copiable, accessible,
avec langue, sur une surface sombre tokenisée. C'est le 2ᵉ composant de la gap-analysis du
2026-06-03 (catégorie B), après `agtc-table`.

---

## Décisions

### Décision 1 — Architecture « mix » (cohérente avec ADR-040)

1. **`<agtc-code-block>`** (Lit, shadow DOM) — code via `<slot>`, langue + bouton copier intégrés.
   Pour apps, contextes JS et Storybook.
2. **Classe `.code-block`** sur un `<pre>` statique — pour le site, qui reste du HTML résilient ;
   le bouton copier est ajouté par `site.js` (mis à niveau pour l'accessibilité).

Les deux consomment `component.code-block.*` et `semantic.typography.mono`.

### Décision 2 — Surface sombre tokenisée (thème conservé)

Le bloc reste **sombre** (convention : distingue le code de la prose). Les couleurs codées en dur
sont remplacées par des tokens `component.code-block.*` référençant des primitives :
fond `gray.12` (#202020), texte `gray.4` (#e8e8e8, contraste ≥ 13:1), métadonnées `gray.8`,
bouton copier `gray.11`/`gray.10` + texte `gray.1` (≥ 4.5:1). Conforme au précédent des tokens
composant référençant des primitives (ex. `badge.success.background` = `primitive.color.green.3`).

### Décision 3 — Coloration syntaxique différée (CD7), sans dépendance

La v1 affiche un **texte clair haut-contraste** sans coloration syntaxique. Raison : éviter une
dépendance lourde (Prism/Shiki) et garder le « dernier mot » humain sur la palette de couleurs.
L'API (slot + `language`) est conçue pour accueillir un highlighter plus tard sans rupture.
Numéros de ligne (CD9) également hors v1.

### Décision 4 — Accessibilité du bouton copier (corrige une dette)

`<button>` réel, `aria-label` explicite (langue incluse), `:focus-visible` tokenisé, succès
annoncé via une région `role="status"` `aria-live="polite"`. Le `site.js` est mis à niveau pour
appliquer ces garanties aux blocs statiques existants.

### Décision 5 — Ajout du token de police monospace (applique ADR-028)

ADR-028 a décidé d'Atkinson Hyperlegible Mono, mais la police n'était **pas** un token : le site
hardcodait `--agtc-font-mono`. Ce composant a besoin de la police mono côté composant **et** site.
Ajout de `primitive.fontFamily.mono` + `semantic.typography.mono.family` →
`--agtc-semantic-typography-mono-family`. C'est une **application d'ADR-028** (pas une décision
nouvelle), donc pas de nouvel ADR de typographie requis.

---

## Périmètre v1

| Inclus | Exclu (porte ouverte) |
|--------|------------------------|
| Composant slotté + classe `.code-block` | Coloration syntaxique (Prism/Shiki) |
| Bouton copier accessible + annonce AT | Numéros de ligne |
| Indicateur de langue, nom de fichier | Édition / exécution du code |
| Scroll horizontal | Thème clair |
| Surface sombre tokenisée | Pliage / sélection de plage |

---

## Alternatives rejetées

- **Coloration syntaxique via Prism/Shiki en v1** : dépendance lourde, couleurs non gouvernées — différé.
- **Thème clair** : romprait la convention et la distinction code/prose.
- **Garder `--agtc-font-mono` codé en dur** : dette ; tokenisé proprement (applique ADR-028).
- **Bouton copier purement présentationnel (`<div>`)** : inaccessible au clavier et aux AT.

---

## Conséquences

- Le site peut migrer ses `pre.code-block` vers le composant lors du *dogfooding* (catégorie A).
- La police mono est désormais un token réutilisable par tout composant/foundation.
- Toute coloration syntaxique future devra créer un ADR (gouvernance).

---

## Tokens ajoutés

### `component.code-block.default.*`
| Token | Référence |
|-------|-----------|
| `background` | `primitive.color.gray.12` |
| `text` | `primitive.color.gray.4` |
| `meta-text` | `primitive.color.gray.8` |
| `copy-background` | `primitive.color.gray.11` |
| `copy-background-hover` | `primitive.color.gray.10` |
| `copy-text` | `primitive.color.gray.1` |
| `border-focus` | `semantic.color.border.focus` |
| `radius` | `semantic.radius.card` |
| `font-size` | `semantic.typography.label.size` |
| `padding-x` / `padding-y` | `primitive.space.5` / `primitive.space.4` |

### Typographie (applique ADR-028)
| Token | Valeur |
|-------|-------|
| `primitive.fontFamily.mono` | `'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'Cascadia Code', monospace` |
| `semantic.typography.mono.family` | `{primitive.fontFamily.mono}` |
