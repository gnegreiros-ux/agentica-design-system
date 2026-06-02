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
