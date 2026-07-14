# ADR-034 — `agtc-badge` implementation

> **Date:** 2026-05-31
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-034-agtc-badge-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-033-agtc-input-implementation.md, tokens/component.json

---

## Reference UX patterns applied

> Added on 2026-06-01 via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**.
> Details and links: `guidelines/components/badge.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| Status not encoded by color alone (icon/label recommended for danger/warning) | NN/g — indicators |
| `role="status"` to announce changes to AT | NN/g |
| Consistent semantic mapping (traffic-light) | Dashboard — color/semantic |
| Non-interactive badge — wrap it if clickable | NN/g |

---

## Context

`agtc-badge` is a non-interactive label that encodes status, category, or
count information. It's used in cards, tables, lists, and component
headers.

Three questions guided the decisions:

1. **How many semantic variants?** — Badges carry intent
   (success, danger, info) that must be readable by agents as well as by
   humans. A palette of 6 covers common cases without overloading the system.

2. **Pill or rectangle shape?** — The pill (radius 9999px) is the
   dominant convention for status badges. It visually differentiates the badge
   from buttons and inputs (radius 6px).

3. **ARIA role?** — A static badge doesn't need a `role`. A
   dynamic badge (updated counter) benefits from `role="status"`. We adopt
   `role="status"` by default to cover both cases.

---

## Decisions

### Decision 1 — 6 semantic variants, no `solid` variant

The 6 variants (`neutral`, `brand`, `success`, `warning`, `danger`, `info`)
cover every state of an interface: neutral state, brand identity,
positive feedback, warning, error, information.

Version 1 doesn't include a `solid` style (solid background + white text).
Reason: the subtle style (light background + dark text) offers better WCAG
contrast in most contexts. The `solid` style will be added if a
concrete need emerges (avoiding speculative design).

### Decision 2 — Badge tokens in `component.json` with a flat structure

Colors are encoded by variant (`badge.neutral.*`, `badge.brand.*`…)
and dimensions by size (`badge.md.*`, `badge.sm.*`).

This separation makes it possible to change a variant's color without affecting
dimensions, and vice versa — consistent with the three-level principle
(ADR-001).

### Decision 3 — Pill radius (9999px) encoded as a component token

`9999px` is an intentionally exaggerated value used to get a pill shape
regardless of the component's height. This value is a component token
(`badge.md.radius` and `badge.sm.radius`) — not a hardcoded value in the CSS.

There is no `radius.pill` semantic token because the pill shape is a decision
specific to the badge, not a contract shared across components.

### Decision 4 — `role="status"` by default

`role="status"` lets screen readers announce content
changes (e.g. a counter going from 3 to 4). For a purely static badge,
this role is harmless. For a dynamic badge, it's necessary.

The slot's content is announced via the text content — no extra `aria-live`
is needed since `role="status"` implies `aria-live="polite"`.

### Decision 5 — No interactivity

`agtc-badge` is a non-interactive `<span>`. If a badge needs to trigger an
action (e.g. an "×" badge to remove a tag), use `agtc-button variant="ghost"`
with a custom badge via slot, or create a dedicated `agtc-tag` component.

### Decision 6 — Token script fix (CJS → `.cjs`)

Adding `"type": "module"` to `package.json` (Phase 3 — Storybook) broke
the Style Dictionary script, which used CommonJS `require()`. Resolved by
renaming `style-dictionary/build.js` → `style-dictionary/build.cjs` and
updating the `package.json` scripts. The script's logic is unchanged.

---

## v1 scope

| Included | Excluded (future version) |
|--------|------------------------|
| 6 subtle variants | `solid` style (solid background) |
| 2 sizes sm / md | `lg` size |
| Prefix icon | Removable "×" badge (→ `agtc-tag`) |
| Icon-only + WCAG label | Animated counter |

---

## Tokens added to `component.json`

| Token | Resolved value |
|-------|----------------|
| `--agtc-badge-neutral-background` | gray-3 (#f0f0f0) |
| `--agtc-badge-neutral-text` | gray-11 (#646464) |
| `--agtc-badge-brand-background` | teal-3 (#e0f8f3) |
| `--agtc-badge-brand-text` | teal-11 (#008573) |
| `--agtc-badge-success-background` | green-3 (#e6f6eb) |
| `--agtc-badge-success-text` | green-11 (#18794e) |
| `--agtc-badge-warning-background` | orange-3 (#ffefd6) |
| `--agtc-badge-warning-text` | orange-11 (#cc4e00) |
| `--agtc-badge-danger-background` | red-3 (feedback-danger-subtle) |
| `--agtc-badge-danger-text` | red-11 (feedback-danger) |
| `--agtc-badge-info-background` | blue-3 (#e6f4fe) |
| `--agtc-badge-info-text` | blue-11 (#0d74ce) |
| `--agtc-badge-md-radius` | 9999px |
| `--agtc-badge-sm-radius` | 9999px |

<!-- FR -->

# ADR-034 — Implémentation de `agtc-badge`

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-034-agtc-badge-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-031-agtc-button-implementation.md, decisions/ADR-033-agtc-input-implementation.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.
> Détail et liens : `guidelines/components/badge.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Statut pas encodé uniquement par la couleur (recommandé icône/libellé pour danger/warning) | NN/g — indicators |
| `role="status"` pour annoncer les changements aux AT | NN/g |
| Mapping sémantique cohérent (traffic-light) | Dashboard — color/semantic |
| Badge non interactif — encapsuler si cliquable | NN/g |

---

## Contexte

`agtc-badge` est un label non interactif qui encode une information de statut,
de catégorie ou de compteur. Il est utilisé dans les cartes, les tableaux,
les listes et les en-têtes de composants.

Trois questions ont guidé les décisions :

1. **Combien de variantes sémantiques ?** — Les badges portent une intention
   (succès, danger, info) qui doit être lisible par les agents comme par les
   humains. Une palette de 6 couvre les cas courants sans surcharger le système.

2. **Forme pill ou rectangle ?** — Le pill (radius 9999px) est la convention
   dominante pour les badges d'état. Il différencie visuellement le badge
   des boutons et des inputs (radius 6px).

3. **Rôle ARIA ?** — Un badge statique n'a pas besoin de `role`. Un badge
   dynamique (compteur mis à jour) bénéficie de `role="status"`. On adopte
   `role="status"` par défaut pour couvrir les deux cas.

---

## Décisions

### Décision 1 — 6 variantes sémantiques, pas de variante `solid`

Les 6 variantes (`neutral`, `brand`, `success`, `warning`, `danger`, `info`)
couvrent tous les états d'une interface : état neutre, identité de marque,
retour positif, avertissement, erreur, information.

La version 1 n'inclut pas de style `solid` (fond plein + texte blanc).
Raison : le style subtil (fond clair + texte foncé) offre un meilleur contraste
WCAG dans la majorité des contextes. Le style `solid` sera ajouté si un besoin
concret émerge (éviter la conception spéculative).

### Décision 2 — Tokens badge dans `component.json` avec structure plate

Les couleurs sont encodées par variante (`badge.neutral.*`, `badge.brand.*`…)
et les dimensions par taille (`badge.md.*`, `badge.sm.*`).

Cette séparation permet de changer la couleur d'une variante sans affecter
les dimensions, et vice versa — conformément au principe des trois niveaux
(ADR-001).

### Décision 3 — Radius pill (9999px) encodé comme token composant

`9999px` est une valeur intentionnellement exagérée pour obtenir une forme pill
indépendamment de la hauteur du composant. Cette valeur est un token composant
(`badge.md.radius` et `badge.sm.radius`) — pas une valeur en dur dans le CSS.

Il n'existe pas de token sémantique `radius.pill` car le pill est une décision
spécifique au badge, pas un contrat partagé entre composants.

### Décision 4 — `role="status"` par défaut

`role="status"` permet aux lecteurs d'écran d'annoncer les changements de
contenu (ex : compteur qui passe de 3 à 4). Pour un badge purement statique,
ce rôle est inoffensif. Pour un badge dynamique, il est nécessaire.

Le contenu du slot est annoncé via le contenu textuel — pas besoin d'`aria-live`
supplémentaire car `role="status"` implique `aria-live="polite"`.

### Décision 5 — Pas d'interactivité

`agtc-badge` est un `<span>` non interactif. Si un badge doit déclencher une
action (ex : badge "×" pour supprimer un tag), utiliser `agtc-button variant="ghost"`
avec un badge custom via slot, ou créer un composant `agtc-tag` dédié.

### Décision 6 — Correction du script tokens (CJS → `.cjs`)

L'ajout de `"type": "module"` dans `package.json` (Phase 3 — Storybook) a cassé
le script Style Dictionary qui utilisait `require()` CommonJS. Résolu en
renommant `style-dictionary/build.js` → `style-dictionary/build.cjs` et en
mettant à jour les scripts `package.json`. La logique du script est inchangée.

---

## Périmètre v1

| Inclus | Exclu (version future) |
|--------|------------------------|
| 6 variantes subtil | Style `solid` (fond plein) |
| 2 tailles sm / md | Taille `lg` |
| Icône prefix | Badge "×" removable (→ `agtc-tag`) |
| Icon-only + label WCAG | Compteur animé |

---

## Tokens ajoutés dans `component.json`

| Token | Valeur résolue |
|-------|----------------|
| `--agtc-badge-neutral-background` | gray-3 (#f0f0f0) |
| `--agtc-badge-neutral-text` | gray-11 (#646464) |
| `--agtc-badge-brand-background` | teal-3 (#e0f8f3) |
| `--agtc-badge-brand-text` | teal-11 (#008573) |
| `--agtc-badge-success-background` | green-3 (#e6f6eb) |
| `--agtc-badge-success-text` | green-11 (#18794e) |
| `--agtc-badge-warning-background` | orange-3 (#ffefd6) |
| `--agtc-badge-warning-text` | orange-11 (#cc4e00) |
| `--agtc-badge-danger-background` | red-3 (feedback-danger-subtle) |
| `--agtc-badge-danger-text` | red-11 (feedback-danger) |
| `--agtc-badge-info-background` | blue-3 (#e6f4fe) |
| `--agtc-badge-info-text` | blue-11 (#0d74ce) |
| `--agtc-badge-md-radius` | 9999px |
| `--agtc-badge-sm-radius` | 9999px |
