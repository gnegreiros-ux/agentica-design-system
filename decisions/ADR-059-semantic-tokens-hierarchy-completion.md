# ADR-059 — Closing the 3-level hierarchy: intermediate semantic tokens

> **Date:** 2026-06-15
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-059-semantic-tokens-hierarchy-completion.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** tokens/semantic.json, site/build.js (COMP object), decisions/ADR-045-feedback-color-family-completion.md, decisions/ADR-046-inverse-surfaces-shadows-tokens.md

---

## Context

ADR-001 sets out the fundamental rule:

```
Primitive tokens → Semantic tokens → Component tokens
```

A systematic audit of the COMP object in `site/build.js` revealed that **~20 component tokens**
referenced primitives directly, skipping the semantic level:

| Component token | Referenced primitive (violation) |
|--------------------|-------------------------------|
| `badge-brand-text` | `primitive.color.teal.12` |
| `badge-success-background` | `primitive.color.green.3` |
| `badge-warning-background` | `primitive.color.orange.3` |
| `badge-warning-text` | `primitive.color.orange.12` |
| `badge-info-background` | `primitive.color.blue.3` |
| `badge-info-text` | `primitive.color.blue.12` |
| `banner-info-background` | `primitive.color.blue.3` |
| `banner-success-background` | `primitive.color.green.3` |
| `banner-warning-background` | `primitive.color.orange.3` |
| `banner-warning-accent` | `primitive.color.orange.11` |
| `code-block-default-background` | `primitive.color.gray.12` |
| `code-block-default-text` | `primitive.color.gray.4` |
| `code-block-default-meta-text` | `primitive.color.gray.8` |
| `code-block-default-copy-background` | `primitive.color.gray.11` |
| `code-block-default-copy-background-hover` | `primitive.color.gray.10` |
| `code-block-default-copy-text` | `primitive.color.gray.1` |
| `toggle-default-track-off` | `primitive.color.gray.9` |
| `toggle-default-track-off-hover` | `primitive.color.gray.10` |
| `card-padding-sm` | `primitive.space.3` |
| `card-padding-lg` | `primitive.space.6` |
| `badge-md-padding-x`, `table-padding-x` | `primitive.space.3` |
| `badge-md-padding-y` | `primitive.space.1` |
| `badge-sm-padding-x` | `primitive.space.2` |
| `badge-sm-padding-y` | `"2px"` (hardcoded) |
| `code-block-default-padding-x`, `banner-padding-x` | `primitive.space.5` |
| `code-block-default-padding-y`, `banner-padding-y` | `primitive.space.4` |

Consequence: changing the "dark code background" color required searching for every occurrence
of `gray.12` in COMP, instead of modifying a single `background.code` semantic token that
propagated everywhere. The intent ("code background") was invisible.

The audit also identified **3 immediate CSS violations** unrelated to tokens:
- Hex fallbacks inside `var(,fallback)` (e.g. `var(--agtc-...,#646464)`) in `[data-theme="light"]`
- `font-size:0.85rem` outside a token on `.audit-contrast-table`
- `filter:drop-shadow(rgba...)` outside a token on `.platform-logo-item img`

> **Post-incident note, 2026-06-15:** the audit initially classified the `color:#hex;color:var(...)`
> pairs in the `:visited` rules as "obsolete IE11 fallbacks" — that was a mistake. These literal
> values are a Safari compatibility necessity: WebKit blocks `var()` resolution inside `:visited`
> to prevent history sniffing. They were removed and then restored the same day. See
> `no-visited-nav.md` §Safari exception and ADR-047.

---

## Decision

### Part 1 — 18 new semantic tokens

Create the missing intermediate tokens in `tokens/semantic.json`, grouped by family:

#### Brand color
| Semantic token | Primitive | Intent |
|-----------------|----------|-----------|
| `color.brand.primary-text` | `teal.12` | Brand text on a light subtle background (brand badge) — 12:1 on white |

#### Feedback color (text on subtle background)
| Semantic token | Primitive | Intent |
|-----------------|----------|-----------|
| `color.feedback.info-text` | `blue.12` | Information text on subtle background (info badge/banner) |
| `color.feedback.warning-text` | `orange.12` | Warning text on subtle background (warning badge/banner) |

> `feedback.success-subtle`, `feedback.warning-subtle`, `feedback.warning`, `feedback.info-subtle`
> already existed (ADR-045) — COMP wasn't using them.

#### Code surface
| Semantic token | Primitive | Intent |
|-----------------|----------|-----------|
| `color.background.code` | `gray.12` | Code block background — dark surface dedicated to source code |
| `color.background.code-raised` | `gray.11` | Raised background on code surface (copy button at rest) |
| `color.background.code-raised-hover` | `gray.10` | Raised background on code surface, hovered |

#### Text on code surface
| Semantic token | Primitive | Intent |
|-----------------|----------|-----------|
| `color.text.on-code` | `gray.4` | Source code body on dark surface |
| `color.text.on-code-muted` | `gray.8` | Metadata on code surface (language, line number) |
| `color.text.on-code-strong` | `gray.1` | Copy button — maximum contrast on code surface |

#### Toggle control
| Semantic token | Primitive | Intent |
|-----------------|----------|-----------|
| `color.control.track-off` | `gray.9` | Toggle track in the off state |
| `color.control.track-off-hover` | `gray.10` | Inactive toggle track, hovered |

#### Component spacing (2px → 24px scale)
| Semantic token | Primitive | Value | Consumers |
|-----------------|----------|--------|---------------|
| `space.component.padding-2xs` | `space.0` | 2px | `badge.sm` vertical padding |
| `space.component.padding-xs` | `space.1` | 4px | `badge.md` vertical padding |
| `space.component.padding-sm` | `space.2` | 8px | `badge.sm` horizontal padding, compact table cells |
| `space.component.padding-md` | `space.3` | 12px | `badge.md` horizontal padding, table cells, compact `card` |
| `space.component.padding-lg` | `space.4` | 16px | vertical padding for code blocks/banners |
| `space.component.padding-xl` | `space.5` | 20px | horizontal padding for code blocks/banners |
| `space.component.padding-2xl` | `space.6` | 24px | `card-padding-lg` |

### Part 2 — 4 CSS fixes

| Location | Violation | Fix |
|-------|-----------|------------|
| `[data-theme="light"]` (3 rules) | `var(--agtc-...,#646464)` — fallback inside var() | Hex fallback removed |
| `.audit-contrast-table` | `font-size:0.85rem` outside a token | `var(--agtc-semantic-typography-label-size)` |
| `.platform-logo-item img` | `filter:drop-shadow(rgba...)` outside a token | New `--agtc-drop-shadow-sm` in `:root` |

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **Keep primitives in COMP** | Violates ADR-001 (non-negotiable hierarchy) — agents don't see the intent |
| **Create direct aliases in COMP with no semantic layer** (`code-bg: primitive.gray.12`) | Intent stays hidden; a second component consuming the same background has no shared token |
| **Reuse `background.inverse`** for the code background | `background.inverse` = `neutral.950` (generic dark surfaces: stats, footer). `background.code` = `gray.12` (surface dedicated to code) — close values but different intent |
| **Name the spacings by value** (`padding-12`, `padding-16`) | Names the value, not the function. `space.component.padding-md` expresses relative density, not the absolute value |
| **Fix only the most visible violations** | The audit was systematic; fixing selectively would have left invisible debt in COMP |

---

## Consequences

**For agents:** every component token is now traceable back to a semantic intent. To change the
color of every code background, it's enough to change `background.code` in `semantic.json`. To
adjust components' compact spacing, `space.component.padding-md`.

**For the system:** the COMP object in `site/build.js` no longer contains any direct reference
to `--agtc-primitive-*`. Validated by grep: 0 occurrences after the fix.

**Build metrics:**

| Before | After |
|-------|-------|
| 756 tokens defined | 774 tokens defined (+18) |
| ~20 hierarchy violations | 0 hierarchy violations |
| 4 CSS violations | 0 CSS violations |
| 0 ghosts | 0 ghosts |

**Governance:** adding semantic tokens → **Design System Lead** approval, per
`tokens-system.md`. No primitive or component token modified (component tokens now point to the
new semantic tokens, but their resolved values are identical — 0 visual change).

---

## Incidents or triggers

Systematic audit triggered by the `tokens-system.md` rule:
> *"Level 1 — Primitives: Never used directly in components. Always through a semantic token."*

The violation had been known since the COMP object was built (comment in `tokensCSS()`:
*"Primitive spacings — referenced by certain component tokens"*) but no intermediate semantic
token had yet been created for these concepts.

<!-- FR -->

# ADR-059 — Fermeture de la hiérarchie 3 niveaux : tokens sémantiques intermédiaires

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** governance
> **Chemin logique:** decisions/ADR-059-semantic-tokens-hierarchy-completion.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** tokens/semantic.json, site/build.js (COMP object), decisions/ADR-045-feedback-color-family-completion.md, decisions/ADR-046-inverse-surfaces-shadows-tokens.md

---

## Contexte

L'ADR-001 pose la règle fondamentale :

```
Tokens primitifs → Tokens sémantiques → Tokens de composant
```

Un audit systématique du COMP object dans `site/build.js` a révélé que **~20 tokens de
composant** référençaient directement des primitifs, sautant le niveau sémantique :

| Token de composant | Primitif référencé (violation) |
|--------------------|-------------------------------|
| `badge-brand-text` | `primitive.color.teal.12` |
| `badge-success-background` | `primitive.color.green.3` |
| `badge-warning-background` | `primitive.color.orange.3` |
| `badge-warning-text` | `primitive.color.orange.12` |
| `badge-info-background` | `primitive.color.blue.3` |
| `badge-info-text` | `primitive.color.blue.12` |
| `banner-info-background` | `primitive.color.blue.3` |
| `banner-success-background` | `primitive.color.green.3` |
| `banner-warning-background` | `primitive.color.orange.3` |
| `banner-warning-accent` | `primitive.color.orange.11` |
| `code-block-default-background` | `primitive.color.gray.12` |
| `code-block-default-text` | `primitive.color.gray.4` |
| `code-block-default-meta-text` | `primitive.color.gray.8` |
| `code-block-default-copy-background` | `primitive.color.gray.11` |
| `code-block-default-copy-background-hover` | `primitive.color.gray.10` |
| `code-block-default-copy-text` | `primitive.color.gray.1` |
| `toggle-default-track-off` | `primitive.color.gray.9` |
| `toggle-default-track-off-hover` | `primitive.color.gray.10` |
| `card-padding-sm` | `primitive.space.3` |
| `card-padding-lg` | `primitive.space.6` |
| `badge-md-padding-x`, `table-padding-x` | `primitive.space.3` |
| `badge-md-padding-y` | `primitive.space.1` |
| `badge-sm-padding-x` | `primitive.space.2` |
| `badge-sm-padding-y` | `"2px"` (en dur) |
| `code-block-default-padding-x`, `banner-padding-x` | `primitive.space.5` |
| `code-block-default-padding-y`, `banner-padding-y` | `primitive.space.4` |

Conséquence : changer la couleur de « fond code sombre » nécessitait de chercher toutes les
occurrences de `gray.12` dans le COMP, au lieu de modifier un seul token sémantique
`background.code` qui se propagait partout. L'intention (`fond de code`) était invisible.

L'audit a également identifié **3 violations CSS immédiates** non liées aux tokens :
- Hex fallbacks dans des `var(,fallback)` (ex. `var(--agtc-...,#646464)`) dans `[data-theme="light"]`
- `font-size:0.85rem` hors token sur `.audit-contrast-table`
- `filter:drop-shadow(rgba...)` hors token sur `.platform-logo-item img`

> **Note post-incident 2026-06-15 :** l'audit avait initialement classé les `color:#hex;color:var(...)` 
> dans les règles `:visited` comme "fallbacks IE11 obsolètes" — c'était une erreur. Ces valeurs 
> littérales sont une nécessité de compatibilité Safari : WebKit bloque la résolution de `var()` 
> dans `:visited` pour prévenir le history sniffing. Elles ont été supprimées puis restaurées le 
> même jour. Voir `no-visited-nav.md` §Exception Safari et ADR-047.

---

## Décision

### Partie 1 — 18 nouveaux tokens sémantiques

Créer les tokens intermédiaires manquants dans `tokens/semantic.json`, regroupés par famille :

#### Couleur marque
| Token sémantique | Primitif | Intention |
|-----------------|----------|-----------|
| `color.brand.primary-text` | `teal.12` | Texte marque sur fond subtil clair (badge brand) — 12:1 sur fond blanc |

#### Couleur feedback (texte sur fond subtil)
| Token sémantique | Primitif | Intention |
|-----------------|----------|-----------|
| `color.feedback.info-text` | `blue.12` | Texte information sur fond subtil (badge/banner info) |
| `color.feedback.warning-text` | `orange.12` | Texte avertissement sur fond subtil (badge/banner warning) |

> `feedback.success-subtle`, `feedback.warning-subtle`, `feedback.warning`, `feedback.info-subtle`
> existaient déjà (ADR-045) — le COMP ne les utilisait pas.

#### Surface code
| Token sémantique | Primitif | Intention |
|-----------------|----------|-----------|
| `color.background.code` | `gray.12` | Fond de bloc de code — surface sombre dédiée au code source |
| `color.background.code-raised` | `gray.11` | Fond surélevé sur surface code (bouton copier au repos) |
| `color.background.code-raised-hover` | `gray.10` | Fond surélevé sur surface code au survol |

#### Texte sur surface code
| Token sémantique | Primitif | Intention |
|-----------------|----------|-----------|
| `color.text.on-code` | `gray.4` | Corps du code source sur surface sombre |
| `color.text.on-code-muted` | `gray.8` | Métadonnées sur surface code (langue, numéro de ligne) |
| `color.text.on-code-strong` | `gray.1` | Bouton copier — contraste maximal sur surface code |

#### Contrôle toggle
| Token sémantique | Primitif | Intention |
|-----------------|----------|-----------|
| `color.control.track-off` | `gray.9` | Piste de toggle à l'état inactif (off) |
| `color.control.track-off-hover` | `gray.10` | Piste de toggle inactive au survol |

#### Espacement composant (scale 2px → 24px)
| Token sémantique | Primitif | Valeur | Consommateurs |
|-----------------|----------|--------|---------------|
| `space.component.padding-2xs` | `space.0` | 2px | `badge.sm` padding vertical |
| `space.component.padding-xs` | `space.1` | 4px | `badge.md` padding vertical |
| `space.component.padding-sm` | `space.2` | 8px | `badge.sm` padding horizontal, cellules tableau compact |
| `space.component.padding-md` | `space.3` | 12px | `badge.md` padding horizontal, cellules tableau, `card` compact |
| `space.component.padding-lg` | `space.4` | 16px | padding vertical blocs code/bannières |
| `space.component.padding-xl` | `space.5` | 20px | padding horizontal blocs code/bannières |
| `space.component.padding-2xl` | `space.6` | 24px | `card-padding-lg` |

### Partie 2 — 4 corrections CSS

| Ligne | Violation | Correction |
|-------|-----------|------------|
| `[data-theme="light"]` (3 règles) | `var(--agtc-...,#646464)` — fallback dans var() | Fallback hex retiré |
| `.audit-contrast-table` | `font-size:0.85rem` hors token | `var(--agtc-semantic-typography-label-size)` |
| `.platform-logo-item img` | `filter:drop-shadow(rgba...)` hors token | Nouveau `--agtc-drop-shadow-sm` dans `:root` |

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Garder les primitives dans COMP** | Viole ADR-001 (hiérarchie non négociable) — les agents ne voient pas l'intention |
| **Créer des alias directs dans COMP sans sémantique** (`code-bg: primitive.gray.12`) | L'intention reste cachée ; un second composant consommant le même fond n'a pas de token partagé |
| **Réutiliser `background.inverse`** pour le fond code | `background.inverse` = `neutral.950` (surfaces sombres génériques : stats, footer). `background.code` = `gray.12` (surface dédiée au code) — valeurs proches mais intention différente |
| **Nommer les espaces par valeur** (`padding-12`, `padding-16`) | Nomme la valeur, pas la fonction. `space.component.padding-md` exprime la densité relative, pas la valeur absolue |
| **Corriger seulement les violations les plus visibles** | L'audit était systématique ; corriger sélectivement aurait laissé une dette invisible dans le COMP |

---

## Conséquences

**Pour les agents :** tout token de composant est désormais traçable jusqu'à une intention sémantique.
Pour modifier la couleur de tous les fonds de code, il suffit de changer `background.code` dans
`semantic.json`. Pour ajuster l'espacement compact des composants, `space.component.padding-md`.

**Pour le système :** le COMP object dans `site/build.js` ne contient plus aucune référence
directe à `--agtc-primitive-*`. Validé par grep : 0 occurrence après correction.

**Métriques build :**

| Avant | Après |
|-------|-------|
| 756 tokens définis | 774 tokens définis (+18) |
| ~20 violations hiérarchie | 0 violations hiérarchie |
| 4 violations CSS | 0 violations CSS |
| 0 fantôme | 0 fantôme |

**Gouvernance :** ajout de tokens sémantiques → approbation **Design System Lead**, conforme à
`tokens-system.md`. Aucun token primitif ni de composant modifié (les tokens de composant
pointent vers les nouveaux sémantiques, mais leurs valeurs résolues sont identiques — 0
changement visuel).

---

## Incidents ou déclencheurs

Audit systématique déclenché par la règle `tokens-system.md` :
> *« Niveau 1 — Primitifs : Jamais utilisés directement dans les composants. Toujours via un token sémantique. »*

La violation était connue depuis la construction du COMP object (commentaire dans `tokensCSS()` :
*« Espacements primitifs — référencés par certains tokens composant »*) mais aucun token
sémantique intermédiaire n'avait encore été créé pour ces concepts.
