# ADR-044 — Implementation of `agtc-segmented`

> **Date:** 2026-06-04
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-044-agtc-segmented-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, decisions/ADR-038-agtc-radio-implementation.md, decisions/ADR-039-agtc-toggle-implementation.md, guidelines/components/segmented.md, tokens/component.json

---

## Applied reference UX patterns

> Added on 2026-06-04 via the `ux-pattern-review` workflow (ADR-036). Decision: **SG1–SG8 all approved**.
> Detail and links: `guidelines/components/segmented.md` § UX Patterns Reference.

| # | Pattern | Source |
|---|---------|--------|
| SG1 | Single selection, always one active | Primer |
| SG2 | `<button>` group + `aria-current` + immediate effect (≠ radiogroup/tablist) | Primer |
| SG3 | 2–5 options, short labels | NN/g |
| SG4 | Selection never conveyed by color alone | WCAG 1.4.1 |
| SG5 | Immediate effect | Primer |
| SG6 | Per-segment `:focus-visible`, native Tab | Primer |
| SG7 | Equal width, icon + label | NN/g |
| SG8 | `value` API + `change` event | Primer |

---

## Context

The site uses an FR/EN toggle (~114 `lang-btn` usages): a `role="group"` containing two
`<button aria-pressed>` elements, with immediate effect. `agtc-segmented` formalizes this
single-selection segmented control. It's the **5th and last component in category B** of the
2026-06-03 gap analysis, after table, code-block, banner, and link.

---

## Decisions

### Decision 1 — ARIA pattern: button group + `aria-current`, NOT a radiogroup (SG2)

This is the structuring decision. Three patterns were candidates:
- **radiogroup** (like `agtc-radio-group`, ADR-038): arrow keys + roving tabindex, "form choice"
  semantics implying a submission;
- **tablist**: changes a content panel;
- **`<button>` group + `aria-current`**: immediate effect, native Tab between segments.

Primer (GitHub) explicitly advises against radiogroup and tablist for a segmented control with an
**immediate effect**. We therefore adopt the **native button group**: each segment is a
`<button>` (native Tab/Enter/Space), the active segment carries `aria-current="true"`, the
selection applies immediately. This is a **deliberate departure** from `agtc-radio-group`
(radiogroup + arrow keys), justified by the difference in usage (instant setting vs. submitted
form choice).

### Decision 2 — Tokenized "rail" (track) style

Rail with a subtle background (`background.subtle`), the selected segment shown as a solid pill
(`action.primary` + `on-action` text). The selected state combines **solid fill + weight 700** —
never color alone (WCAG 1.4.1).

### Decision 3 — Data-driven with immediate effect

`options` (`{value,label,icon?}`) + `value`; each selection emits `change` (`detail:{value}`).
No "apply" button (SG5). `label` required to name the group (console warning otherwise).

### Decision 4 — "Mix" architecture (consistent with ADR-040→043)

`<agtc-segmented>` component (shadow DOM, data-driven) **+** `.agtc-segmented` class for static
HTML. Both consume `component.segmented.*`. The site's language toggle will be migrated to this
contract during *dogfooding* (category A).

---

## v1 Scope

| Included | Excluded (future evolution) |
|--------|--------------------------|
| Single selection, immediate effect, `aria-current` | Multi-selection |
| `options` (value/label/icon), `value`, `change` | Content tabs (→ future `tabs`) |
| `equal-width`, icons | Scrollable overflow |
| Tokenized rail, focus-visible | Multiple sizes (sm/lg) |

---

## Rejected alternatives

- **radiogroup pattern** (consistency with `agtc-radio-group`): unsuited to immediate effect (Primer) — rejected in favor of the button group.
- **`role="tablist"`**: reserved for content-panel changes.
- **"Separate bordered buttons" style** (like the current `lang-btn`): replaced by the pill rail, more readable and modern.
- **`aria-pressed` per segment**: `aria-current="true"` better expresses "the current option" of a single selection.

---

## Consequences

- The site's FR/EN toggle will be able to migrate to `.agtc-segmented` during *dogfooding* (category A).
- **Closes category B** of the gap analysis (table, code-block, banner, link, segmented).
- A future `tabs` component (content-panel change) remains distinct (its own ADR).

---

## Tokens added — `component.segmented.default.*`

| Token | Reference |
|-------|-----------|
| `track-background` | `semantic.color.background.subtle` |
| `text` | `semantic.color.text.secondary` |
| `text-hover` | `semantic.color.text.primary` |
| `selected-background` | `semantic.color.action.primary` |
| `selected-text` | `semantic.color.text.on-action` |
| `border-focus` | `semantic.color.border.focus` |
| `radius` | `semantic.radius.control` |

<!-- FR -->

# ADR-044 — Implémentation de `agtc-segmented`

> **Date :** 2026-06-04
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-044-agtc-segmented-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, decisions/ADR-038-agtc-radio-implementation.md, decisions/ADR-039-agtc-toggle-implementation.md, guidelines/components/segmented.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-04 via le workflow `ux-pattern-review` (ADR-036). Décision : **SG1–SG8 tous approuvés**.
> Détail et liens : `guidelines/components/segmented.md` § UX Patterns Reference.

| # | Pattern | Source |
|---|---------|--------|
| SG1 | Mono-sélection, toujours un actif | Primer |
| SG2 | Groupe de `<button>` + `aria-current` + effet immédiat (≠ radiogroup/tablist) | Primer |
| SG3 | 2–5 options, libellés courts | NN/g |
| SG4 | Sélectionné pas par la couleur seule | WCAG 1.4.1 |
| SG5 | Effet immédiat | Primer |
| SG6 | `:focus-visible` par segment, Tab natif | Primer |
| SG7 | Largeur égale, icône + libellé | NN/g |
| SG8 | API `value` + événement `change` | Primer |

---

## Contexte

Le site utilise une bascule FR/EN (~114 usages `lang-btn`) : un `role="group"` contenant deux
`<button aria-pressed>`, à effet immédiat. `agtc-segmented` formalise ce contrôle segmenté
mono-sélection. C'est le **5ᵉ et dernier composant de la catégorie B** de la gap-analysis du
2026-06-03, après table, code-block, banner et link.

---

## Décisions

### Décision 1 — Pattern ARIA : groupe de boutons + `aria-current`, PAS un radiogroup (SG2)

C'est la décision structurante. Trois patterns étaient candidats :
- **radiogroup** (comme `agtc-radio-group`, ADR-038) : flèches + roving tabindex, sémantique « choix
  de formulaire » impliquant une soumission ;
- **tablist** : change un panneau de contenu ;
- **groupe de `<button>` + `aria-current`** : effet immédiat, Tab natif entre segments.

Primer (GitHub) déconseille explicitement radiogroup et tablist pour un contrôle segmenté à **effet
immédiat**. On retient donc le **groupe de boutons natifs** : chaque segment est un `<button>`
(Tab/Entrée/Espace natifs), le segment actif porte `aria-current="true"`, la sélection s'applique
immédiatement. C'est un **écart assumé** vis-à-vis de `agtc-radio-group` (radiogroup + flèches),
justifié par la différence d'usage (réglage instantané vs choix de formulaire soumis).

### Décision 2 — Style « rail » (track) tokenisé

Rail à fond subtil (`background.subtle`), segment sélectionné en pastille pleine
(`action.primary` + texte `on-action`). L'état sélectionné combine **fond plein + poids 700** —
jamais la couleur seule (WCAG 1.4.1).

### Décision 3 — Piloté par données + effet immédiat

`options` (`{value,label,icon?}`) + `value` ; chaque sélection émet `change` (`detail:{value}`).
Pas de bouton « appliquer » (SG5). `label` requis pour nommer le groupe (avertissement console sinon).

### Décision 4 — Architecture « mix » (cohérente avec ADR-040→043)

Composant `<agtc-segmented>` (shadow DOM, piloté par données) **+** classe `.agtc-segmented` pour le
HTML statique. Les deux consomment `component.segmented.*`. La bascule de langue du site sera migrée
vers ce contrat au *dogfooding* (catégorie A).

---

## Périmètre v1

| Inclus | Exclu (évolution future) |
|--------|--------------------------|
| Mono-sélection, effet immédiat, `aria-current` | Multi-sélection |
| `options` (value/label/icon), `value`, `change` | Onglets de contenu (→ futur `tabs`) |
| `equal-width`, icônes | Débordement / overflow scrollable |
| Rail tokenisé, focus-visible | Tailles multiples (sm/lg) |

---

## Alternatives rejetées

- **Pattern radiogroup** (cohérence avec `agtc-radio-group`) : inadapté à l'effet immédiat (Primer) — rejeté au profit du groupe de boutons.
- **`role="tablist"`** : réservé au changement de panneau de contenu.
- **Style « boutons bordés séparés »** (comme l'actuel `lang-btn`) : remplacé par le rail à pastille, plus lisible et moderne.
- **`aria-pressed` par segment** : `aria-current="true"` exprime mieux « l'option courante » d'une mono-sélection.

---

## Conséquences

- La bascule FR/EN du site pourra migrer vers `.agtc-segmented` au *dogfooding* (catégorie A).
- **Clôt la catégorie B** de la gap-analysis (table, code-block, banner, link, segmented).
- Un futur composant `tabs` (changement de panneau) reste distinct (son propre ADR).

---

## Tokens ajoutés — `component.segmented.default.*`

| Token | Référence |
|-------|-----------|
| `track-background` | `semantic.color.background.subtle` |
| `text` | `semantic.color.text.secondary` |
| `text-hover` | `semantic.color.text.primary` |
| `selected-background` | `semantic.color.action.primary` |
| `selected-text` | `semantic.color.text.on-action` |
| `border-focus` | `semantic.color.border.focus` |
| `radius` | `semantic.radius.control` |
