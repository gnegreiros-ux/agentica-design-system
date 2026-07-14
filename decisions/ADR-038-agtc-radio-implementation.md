# ADR-038 — Implementing `agtc-radio` and `agtc-radio-group`

> **Date:** 2026-06-01
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-038-agtc-radio-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-037-agtc-checkbox-implementation.md, guidelines/components/radio.md, tokens/component.json

---

## Reference UX patterns applied

> Added 2026-06-01 via the `ux-pattern-review` workflow (ADR-036).
> Decision: **R1–R7 approved**, **round** shape, **group + radio** architecture.
> Detail and links: `guidelines/components/radio.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| Round shape (square = checkbox) | NN/g — checkboxes vs radio |
| Mutually exclusive selection | NN/g |
| Pre-selecting a sensible default | NN/g — radio default selection |
| Vertical stacking, one option per line | NN/g |
| Clickable label (Fitts) | NN/g · IxDF |
| Touch target ≥ 24px | IxDF · WCAG 2.5.8 |
| Arrow-key navigation = selection | NN/g (WAI-ARIA radiogroup) |

---

## Context

The radio is the exclusive counterpart to the checkbox. Three questions guided the decisions:

1. **Shape** — round (NN/g) vs. square. Unambiguous: round.
2. **Grouping** — how do we guarantee exclusivity across Web Components?
3. **Keyboard** — how do we reproduce native radio behavior (arrows)?

---

## Decisions

### Decision 1 — Two-component architecture: `agtc-radio-group` + `agtc-radio`

**Problem:** `<input type="radio">` elements rendered in **separate** shadow DOMs don't
form a native group — exclusivity via `name` doesn't cross shadow-root boundaries.

**Decision:** an `agtc-radio-group` container (`role="radiogroup"`) is **mandatory**. It:
- collects the child `agtc-radio` elements, applies single selection via `value`
- manages **roving focus** (only one radio has `tabindex="0"`)
- handles the keyboard (arrows select, like a native radio)
- emits `agtc-change { value, name }`

**Rejected alternative:** a standalone `agtc-radio` coordinated by `name` via the
document. Rejected for weaker accessibility (no `role="radiogroup"`, no roving arrow-key
navigation).

---

### Decision 2 — Round shape

`border-radius: 9999px`. NN/g: round is the radio convention; square signals a
checkbox. Central fill dot (teal) animated via `transform: scale`.

---

### Decision 3 — Full ARIA radiogroup pattern

The group implements the WAI-ARIA pattern: `role="radiogroup"` + `aria-label`, children
`role="radio"` + `aria-checked`, roving focus, `↓→` next / `↑←` previous (looping,
selecting), `Space` selects. `Enter` is deliberately **not** handled (reserved for form
submission, per the strict WAI-ARIA radio pattern). This faithfully reproduces the
behavior of a native group without relying on native grouping, which doesn't work across
shadow DOM.

---

## v1 scope

| Included | Excluded (v2) |
|----------|----------------|
| `agtc-radio-group` + `agtc-radio`, round | Assisted horizontal orientation |
| default/hover/focus/selected/disabled states | Per-option description/help |
| Roving focus + arrow-key keyboard | Group "required" validation |
| `agtc-change` event | — |

---

## Tokens added to `component.json`

| Token | Semantic reference |
|-------|----------------------|
| `--agtc-radio-default-background` | `semantic.color.background.surface` |
| `--agtc-radio-default-border` | `semantic.color.border.default` |
| `--agtc-radio-default-border-hover` | `semantic.color.action.primary` |
| `--agtc-radio-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-radio-default-fill` | `semantic.color.action.primary` |
| `--agtc-radio-default-fill-hover` | `semantic.color.action.primary-hover` |
| `--agtc-radio-default-label` | `semantic.color.text.primary` |

<!-- FR -->

# ADR-038 — Implémentation de `agtc-radio` et `agtc-radio-group`

> **Date :** 2026-06-01
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-038-agtc-radio-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-037-agtc-checkbox-implementation.md, guidelines/components/radio.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036).
> Décision : **R1–R7 approuvés**, forme **ronde**, architecture **groupe + radio**.
> Détail et liens : `guidelines/components/radio.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Forme ronde (le carré = checkbox) | NN/g — checkboxes vs radio |
| Sélection mutuellement exclusive | NN/g |
| Pré-sélection d'un défaut sensé | NN/g — radio default selection |
| Empilement vertical, une option par ligne | NN/g |
| Label cliquable (Fitts) | NN/g · IxDF |
| Cible tactile ≥ 24px | IxDF · WCAG 2.5.8 |
| Navigation flèches = sélection | NN/g (WAI-ARIA radiogroup) |

---

## Contexte

Le radio est le pendant exclusif de la checkbox. Trois questions ont guidé les décisions :

1. **Forme** — ronde (NN/g) vs carrée. Sans ambiguïté : ronde.
2. **Groupement** — comment garantir l'exclusivité entre Web Components ?
3. **Clavier** — comment reproduire le comportement radio natif (flèches) ?

---

## Décisions

### Décision 1 — Architecture en deux composants : `agtc-radio-group` + `agtc-radio`

**Problème :** des `<input type="radio">` rendus dans des shadow DOM **séparés** ne forment
pas un groupe natif — l'exclusivité par `name` ne traverse pas les frontières de shadow root.

**Décision :** un conteneur `agtc-radio-group` (`role="radiogroup"`) est **obligatoire**. Il :
- collecte les `agtc-radio` enfants, applique la sélection unique via `value`
- gère le **focus roving** (un seul radio `tabindex="0"`)
- gère le clavier (flèches sélectionnent, comme un radio natif)
- émet `agtc-change { value, name }`

**Alternative rejetée :** `agtc-radio` autonome coordonné par `name` via le document. Rejeté
pour l'accessibilité plus faible (pas de `role="radiogroup"`, pas de navigation flèches roving).

---

### Décision 2 — Forme ronde

`border-radius: 9999px`. NN/g : le rond est la convention du radio ; le carré signale une
checkbox. Pastille centrale `fill` (teal) animée par `transform: scale`.

---

### Décision 3 — Pattern ARIA radiogroup complet

Le groupe implémente le pattern WAI-ARIA : `role="radiogroup"` + `aria-label`, enfants
`role="radio"` + `aria-checked`, focus roving, `↓→` suivant / `↑←` précédent (boucle, sélection),
`Espace` sélectionne. `Entrée` est volontairement **non** géré (réservé à la soumission de
formulaire, pattern WAI-ARIA radio strict). Cela reproduit fidèlement le comportement d'un groupe
natif sans dépendre du groupement natif inopérant en shadow DOM.

---

## Périmètre v1

| Inclus | Exclu (v2) |
|--------|------------|
| `agtc-radio-group` + `agtc-radio`, ronde | Orientation horizontale assistée |
| États default/hover/focus/selected/disabled | Description/aide par option |
| Focus roving + clavier flèches | Validation « requis » de groupe |
| Événement `agtc-change` | — |

---

## Tokens ajoutés dans `component.json`

| Token | Référence sémantique |
|-------|----------------------|
| `--agtc-radio-default-background` | `semantic.color.background.surface` |
| `--agtc-radio-default-border` | `semantic.color.border.default` |
| `--agtc-radio-default-border-hover` | `semantic.color.action.primary` |
| `--agtc-radio-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-radio-default-fill` | `semantic.color.action.primary` |
| `--agtc-radio-default-fill-hover` | `semantic.color.action.primary-hover` |
| `--agtc-radio-default-label` | `semantic.color.text.primary` |
