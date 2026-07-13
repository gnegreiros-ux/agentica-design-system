# ADR-037 — Implémentation de `agtc-checkbox`

> **Date :** 2026-06-01
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-037-agtc-checkbox-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, guidelines/components/checkbox.md, tokens/component.json

> **English summary:** Implements agtc-checkbox as a square control (not round, to avoid radio
> confusion) using a visually-hidden native `<input type="checkbox">` for accessibility, with an
> `indeterminate` state exposed via the DOM property, a clickable label, and a ≥24px touch target.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036).
> Décision : **CB1 à CB7 approuvés**, forme **carrée** retenue, état **indeterminate inclus**.
> Détail et liens : `guidelines/components/checkbox.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| Checkbox (pas toggle) pour un item indépendant | NN/g — checkbox vs toggle |
| Forme carrée (le rond signale un radio) | NN/g — checkboxes |
| Label cliquable (case ou texte, loi de Fitts) | NN/g · IxDF |
| Cible tactile ≥ 24px | IxDF · WCAG 2.5.8 |
| États visibles complets | NN/g |
| Libellé positif (pas de négation) | NN/g |
| Pas de pré-cochage de consentement | IxDF |
| Sémantique ARIA native | NN/g |

---

## Contexte

La référence d'une ToDo app a mis en évidence le seul composant DS atomique manquant
pour ce type d'interface : la case à cocher. Card, input, button et icon existent déjà.

Trois questions ont guidé les décisions :

1. **Forme** — la maquette ToDo montre des cercles, mais NN/g recommande le carré.
2. **Élément technique** — case stylée custom vs `<input>` natif masqué.
3. **Périmètre des états** — faut-il inclure `indeterminate` dès la v1 ?

---

## Décisions

### Décision 1 — Forme carrée uniquement

NN/g est explicite : *« A checkbox should be a small square »*. Le rond signale
conventionnellement un bouton radio ; l'utiliser pour une checkbox induit en erreur.

**Décision :** forme **carrée** (rayon `semantic.radius.control`). L'apparence ronde de la
maquette de référence est **écartée** au profit de la convention d'usabilité.

**Alternative rejetée :** attribut `shape="round"`. Rejeté pour ne pas encourager un écart à
la convention dès la v1 ; pourra être rouvert via gouvernance si un besoin récurrent émerge.

---

### Décision 2 — `<input type="checkbox">` natif masqué + case stylée décorative

L'élément accessible est un vrai `<input type="checkbox">` (rôle, état coché, gestion clavier
native via Espace, nom accessible via le `<label>` implicite englobant). Il est **visuellement
masqué** mais reste dans l'arbre d'accessibilité. La case visible (`.box` + SVG) est **décorative**
(`aria-hidden`).

**Alternative rejetée :** `<div role="checkbox" tabindex="0">` avec gestion clavier manuelle —
anti-pattern WCAG 4.1.2 (réimplémenter un contrôle natif est fragile et coûteux en a11y).

---

### Décision 3 — État `indeterminate` inclus en v1

`indeterminate` anticipe le pattern « tout cocher » d'un groupe (parent partiellement coché).
Il ne s'exprime que via la **propriété DOM** `input.indeterminate` (jamais un attribut HTML),
synchronisée dans `updated()`, et expose `aria-checked="mixed"` via le natif.

Cocher ou décocher lève automatiquement l'état indéterminé.

---

### Décision 4 — Label cliquable et cible ≥ 24px

Le `<label>` englobe la case et le texte : cliquer l'un ou l'autre bascule l'état (loi de Fitts).
La zone interactive `.root` a `min-height: 24px` pour satisfaire WCAG 2.5.8 (Target Size Minimum).
La taille visuelle de la case est de 20px (`semantic.icon.size.control`).

---

## Périmètre v1

| Inclus | Exclu (v2) |
|--------|------------|
| États default/hover/focus/checked/indeterminate/disabled | Variante `shape="round"` |
| Label via attribut ou slot | `agtc-radio` (choix exclusif) |
| Événement `agtc-change` | `agtc-toggle` (effet immédiat on/off) |
| `required` + `aria-required` | Groupe `agtc-checkbox-group` (gestion select-all) |

---

## Tokens ajoutés dans `component.json`

| Token | Référence sémantique |
|-------|----------------------|
| `--agtc-checkbox-default-background` | `semantic.color.background.surface` |
| `--agtc-checkbox-default-border` | `semantic.color.border.default` |
| `--agtc-checkbox-default-border-hover` | `semantic.color.action.primary` |
| `--agtc-checkbox-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-checkbox-default-fill` | `semantic.color.action.primary` |
| `--agtc-checkbox-default-fill-hover` | `semantic.color.action.primary-hover` |
| `--agtc-checkbox-default-check` | `semantic.color.text.on-action` |
| `--agtc-checkbox-default-label` | `semantic.color.text.primary` |
| `--agtc-checkbox-default-radius` | `semantic.radius.control` |
