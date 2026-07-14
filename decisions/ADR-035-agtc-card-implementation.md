# ADR-035 — `agtc-card` implementation

> **Date:** 2026-05-31
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-035-agtc-card-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-034-agtc-badge-implementation.md, tokens/component.json

---

## Reference UX patterns applied

> Added on 2026-06-01 via the `ux-pattern-review` workflow (ADR-036).
> Decision: **C1, C3, C4 approved; C2 revised** (anti-nesting clickability rule).
> Details and links: `guidelines/components/card.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| Clustering of related content | Dashboard — grouped layout |
| Clickable card — C2 revised (1 destination = enclosing link; distinct actions = `::after` overlay or non-interactive container; never nested interactive elements) | Smashing — clickable cards · NN/g |
| Hierarchy via elevation/shadow, not color alone | Dashboard — composition |
| Detail-on-demand (the card summarizes) | Dashboard — screenspace |

---

## Context

`agtc-card` is a visual container for grouping related information.
It's one of the most-used components in interfaces — it structures
dashboards, result lists, and grouped forms.

Two questions guided the decisions:

1. **Interactivity** — a card can be clickable (link to a detail view) or
   purely a container. Should this behavior be encoded into the component?

2. **Sections** — header, body, footer are recurring patterns.
   Should they be structurally enforced or left free via slots?

---

## Decisions

### Decision 1 — No native interactivity in v1

A clickable card is a complex accessibility pattern: the interactive
element must be `<a>` or `<button>`, not a `<div>` with `onclick`.

**Decision:** `agtc-card` is non-interactive. For a clickable card,
the consumer places an `<a>` or `<agtc-button>` inside. An `agtc-card-link`
component could be added in v2 if the need recurs.

**Rejected alternative:** adding a `clickable` attribute with `tabindex="0"`
and `role="button"` — rejected because a `<div role="button">` with no native
`<button>` is a WCAG 4.1.2 anti-pattern (interactive elements must use
semantic HTML elements).

---

### Decision 2 — Named `header` / `footer` slots with automatic separators

The `header` and `footer` slots are detected via `slotchange` +
`assignedNodes()`. Separators (border) only appear if the slot
is actually used — avoiding an orphaned border on a card with no header.

Padding on the header/body/footer sections is uniform (same value as
the `padding` attribute) so the spacing stays visually consistent.

**Exception:** `has-header` and `has-footer` remove the body's padding-top
when a header is present, and its padding-bottom when a footer is present —
avoiding double spacing at the joints.

---

### Decision 3 — 3 variants: default / elevated / flat

| Variant | Usage | Visual signal |
|----------|-------|---------------|
| `default` | Standard card | Subtle gray border |
| `elevated` | Highlighted, hierarchy | Soft drop shadow |
| `flat` | Grouped background, integrated section | Subtle gray background, no border |

The `elevated` shadow (`0 1px 3px rgba(0,0,0,0.10)`) is encoded as a
component token, `card.elevated.shadow`. There isn't yet a semantic
elevation token — this token is a proxy until a dedicated elevation
system is created.

---

### Decision 4 — 4 padding levels: none / sm / md / lg

`none` is indispensable for cards with full-width images.
`sm` (12px) for compact cards (tables, dense lists).
`md` (20px, default) for most cases.
`lg` (24px) for cards with heavy text content.

---

## v1 scope

| Included | Excluded (v2) |
|--------|------------|
| 3 variants | `agtc-card-link` (clickable card) |
| 4 padding levels | Skeleton loading state |
| header / body / footer slots | Card grid layout helper |
| Automatic separators | `outlined-accent` variant |

---

## Tokens added to `component.json`

| Token | Value |
|-------|--------|
| `--agtc-card-elevated-shadow` | `0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)` |
| `--agtc-card-elevated-border` | `transparent` |
| `--agtc-card-flat-background` | gray-3 (#f0f0f0) |
| `--agtc-card-flat-border` | `transparent` |
| `--agtc-card-padding-none` | `0px` |
| `--agtc-card-padding-sm` | `12px` |
| `--agtc-card-padding-lg` | `24px` |

<!-- FR -->

# ADR-035 — Implémentation de `agtc-card`

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-035-agtc-card-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-034-agtc-badge-implementation.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036).
> Décision : **C1, C3, C4 approuvés ; C2 révisé** (règle de cliquabilité anti-imbrication).
> Détail et liens : `guidelines/components/card.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Clustering du contenu lié | Dashboard — grouped layout |
| Carte cliquable — C2 révisé (1 destination = lien englobant ; actions distinctes = overlay `::after` ou conteneur non interactif ; jamais d'interactif imbriqué) | Smashing — clickable cards · NN/g |
| Hiérarchie via élévation/ombre, pas couleur seule | Dashboard — composition |
| Détail-on-demand (la carte résume) | Dashboard — screenspace |

---

## Contexte

`agtc-card` est un conteneur visuel pour regrouper des informations liées.
C'est l'un des composants les plus utilisés dans les interfaces — il structure
les tableaux de bord, les listes de résultats, les formulaires groupés.

Deux questions ont guidé les décisions :

1. **Interactivité** — une carte peut être cliquable (lien vers un détail) ou
   purement contenante. Faut-il encoder ce comportement dans le composant ?

2. **Sections** — header, body, footer sont des patterns récurrents.
   Faut-il les imposer structurellement ou les laisser libres via slots ?

---

## Décisions

### Décision 1 — Pas d'interactivité native dans v1

Une carte cliquable est un pattern d'accessibilité complexe : l'élément
interactif doit être `<a>` ou `<button>`, pas un `<div>` avec `onclick`.

**Décision :** `agtc-card` est non interactif. Pour une carte cliquable,
le consommateur place un `<a>` ou `<agtc-button>` à l'intérieur. Un composant
`agtc-card-link` pourrait être ajouté en v2 si le besoin est récurrent.

**Alternative rejetée :** ajouter un attribut `clickable` avec `tabindex="0"`
et `role="button"` — rejeté car un `<div role="button">` sans `<button>` natif
est un anti-pattern WCAG 4.1.2 (les éléments interactifs doivent utiliser des
éléments HTML sémantiques).

---

### Décision 2 — Slots nommés `header` / `footer` avec séparateurs automatiques

Les slots `header` et `footer` sont détectés via `slotchange` +
`assignedNodes()`. Les séparateurs (border) n'apparaissent que si le slot
est réellement utilisé — évite un border orphelin sur une card sans header.

Le padding des sections header/body/footer est uniforme (même valeur que
l'attribut `padding`) pour que l'espacement soit cohérent visuellement.

**Exception :** `has-header` et `has-footer` suppriment le padding-top du body
quand un header est présent, et le padding-bottom quand un footer est présent —
évite le double espacement aux jointures.

---

### Décision 3 — 3 variantes : default / elevated / flat

| Variante | Usage | Signal visuel |
|----------|-------|---------------|
| `default` | Carte standard | Bord gris subtil |
| `elevated` | Mise en avant, hiérarchie | Ombre portée douce |
| `flat` | Fond groupé, section intégrée | Fond gris subtil, pas de bord |

La shadow de `elevated` (`0 1px 3px rgba(0,0,0,0.10)`) est encodée comme token
composant `card.elevated.shadow`. Il n'existe pas encore de token sémantique
d'élévation — ce token est un proxy jusqu'à la création d'un système
d'élévation dédié.

---

### Décision 4 — 4 niveaux de padding : none / sm / md / lg

`none` est indispensable pour les cartes avec images pleine largeur.
`sm` (12px) pour les cartes compactes (tableaux, listes denses).
`md` (20px, défaut) pour la majorité des cas.
`lg` (24px) pour les cartes à fort contenu textuel.

---

## Périmètre v1

| Inclus | Exclu (v2) |
|--------|------------|
| 3 variantes | `agtc-card-link` (carte cliquable) |
| 4 niveaux de padding | Skeleton loading state |
| Slots header / body / footer | Card grid layout helper |
| Séparateurs automatiques | Variante `outlined-accent` |

---

## Tokens ajoutés dans `component.json`

| Token | Valeur |
|-------|--------|
| `--agtc-card-elevated-shadow` | `0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)` |
| `--agtc-card-elevated-border` | `transparent` |
| `--agtc-card-flat-background` | gray-3 (#f0f0f0) |
| `--agtc-card-flat-border` | `transparent` |
| `--agtc-card-padding-none` | `0px` |
| `--agtc-card-padding-sm` | `12px` |
| `--agtc-card-padding-lg` | `24px` |
