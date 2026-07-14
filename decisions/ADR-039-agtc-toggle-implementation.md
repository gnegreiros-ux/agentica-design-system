# ADR-039 — Implementing `agtc-toggle`

> **Date:** 2026-06-01
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-039-agtc-toggle-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-037-agtc-checkbox-implementation.md, guidelines/components/toggle.md, tokens/component.json

---

## Reference UX patterns applied

> Added 2026-06-01 via the `ux-pattern-review` workflow (ADR-036).
> Decision: **T1–T7 approved**, state indicated by **knob position alone**.
> Detail and links: `guidelines/components/toggle.md` § REFERENCE UX PATTERNS.

| Pattern | Source |
|---------|--------|
| `role="switch"` + `aria-checked` | NN/g — toggle switch |
| Immediate effect (no submit) | NN/g |
| State via knob position (not color alone) | NN/g · WCAG 1.4.1 |
| Clearly bounded knob, contrast ≥ 3:1 | NN/g · WCAG 1.4.11 |
| Concise, front-loaded label describing the "on" state | NN/g |
| Touch target ≥ 24px | IxDF · WCAG 2.5.8 |
| Binary only | NN/g |

---

## Context

The toggle complements checkbox/radio: it's the control for **immediate-effect**
settings. Three questions guided the decisions:

1. **Semantics** — `role="switch"` vs. a plain checkbox.
2. **State indicator** — position alone vs. adding on/off (I/O) labels.
3. **"Off" track color** — no neutral-medium semantic token exists.

---

## Decisions

### Decision 1 — Hidden native `<input type="checkbox" role="switch">`

The accessible element is a native checkbox promoted to a `switch` via `role`. It
provides the role, checked state, keyboard handling (Space), and accessible name (via
the enclosing `<label>`). The styled track and knob are **decorative** (`aria-hidden`).

**Rejected alternative:** `<div role="switch">` with manual keyboard handling — fragile
and unnecessary since the native element provides everything (WCAG 4.1.2 anti-pattern).

---

### Decision 2 — State signaled by knob position (non-color indicator)

The knob slides left (off) / right (on). **Position** is an indicator independent of
color (WCAG 1.4.1); track color (gray → teal) only reinforces it.

**Rejected alternative:** I/O labels within the track. Discarded to stay clean (the
iOS/Android standard); position alone is sufficient as a non-color indicator.

The knob is **white with a drop shadow**, guaranteeing a contrast ≥ 3:1 against the track
in both states (WCAG 1.4.11).

---

### Decision 3 — `track-off` = proxy to `primitive.color.gray.9`

No neutral-medium gray semantic token exists. `track-off` references
`primitive.color.gray.9` (#8d8d8d) directly, chosen to give ~3.3:1 contrast between the
white knob and the track (WCAG 1.4.11). This is a **component-level proxy** (the same
approach as `card.elevated.shadow`) until a dedicated semantic token is created —
governed by the Design System Lead.

---

## v1 scope

| Included | Excluded (v2) |
|----------|----------------|
| off/on/hover/focus/disabled states | On/off (I/O) labels in the track |
| Immediate effect (`agtc-change`) | `sm`/`lg` size |
| `role="switch"`, Space keyboard | `loading` (async) state |

---

## Tokens added to `component.json`

| Token | Reference |
|-------|-----------|
| `--agtc-toggle-default-track-off` | `primitive.color.gray.9` (proxy) |
| `--agtc-toggle-default-track-off-hover` | `primitive.color.gray.10` (proxy) |
| `--agtc-toggle-default-track-on` | `semantic.color.action.primary` |
| `--agtc-toggle-default-track-on-hover` | `semantic.color.action.primary-hover` |
| `--agtc-toggle-default-knob` | `semantic.color.background.surface` |
| `--agtc-toggle-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-toggle-default-label` | `semantic.color.text.primary` |

<!-- FR -->

# ADR-039 — Implémentation de `agtc-toggle`

> **Date :** 2026-06-01
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-039-agtc-toggle-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-037-agtc-checkbox-implementation.md, guidelines/components/toggle.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-01 via le workflow `ux-pattern-review` (ADR-036).
> Décision : **T1–T7 approuvés**, indicateur d'état par **position du curseur seule**.
> Détail et liens : `guidelines/components/toggle.md` § PATTERNS UX DE RÉFÉRENCE.

| Pattern | Source |
|---------|--------|
| `role="switch"` + `aria-checked` | NN/g — toggle switch |
| Effet immédiat (pas de submit) | NN/g |
| État par position du curseur (pas couleur seule) | NN/g · WCAG 1.4.1 |
| Curseur délimité, contraste ≥ 3:1 | NN/g · WCAG 1.4.11 |
| Label concis frontload décrivant l'état « on » | NN/g |
| Cible tactile ≥ 24px | IxDF · WCAG 2.5.8 |
| Binaire uniquement | NN/g |

---

## Contexte

Le toggle complète checkbox/radio : c'est le contrôle des réglages à **effet immédiat**.
Trois questions ont guidé les décisions :

1. **Sémantique** — `role="switch"` vs simple checkbox.
2. **Indicateur d'état** — position seule vs ajout de libellés on/off (I/O).
3. **Couleur de la piste « off »** — aucun token sémantique neutre-médium n'existe.

---

## Décisions

### Décision 1 — `<input type="checkbox" role="switch">` natif masqué

L'élément accessible est un checkbox natif promu en `switch` via `role`. Il fournit le rôle,
l'état coché, la gestion clavier (Espace) et le nom accessible (via le `<label>` englobant).
La piste et le curseur stylés sont **décoratifs** (`aria-hidden`).

**Alternative rejetée :** `<div role="switch">` avec gestion clavier manuelle — fragile et
inutile puisque le natif fournit tout (anti-pattern WCAG 4.1.2).

---

### Décision 2 — État signalé par la position du curseur (indicateur non-couleur)

Le curseur glisse à gauche (off) / à droite (on). La **position** est un indicateur indépendant
de la couleur (WCAG 1.4.1) ; la couleur de la piste (gris → teal) ne fait que renforcer.

**Alternative rejetée :** libellés I/O dans la piste. Écartés pour rester épuré (standard
iOS/Android) ; la position suffit comme indicateur non-couleur.

Le curseur est **blanc avec une ombre portée**, garantissant un contraste ≥ 3:1 avec la piste
dans les deux états (WCAG 1.4.11).

---

### Décision 3 — `track-off` = proxy vers `primitive.color.gray.9`

Aucun token sémantique de gris neutre-médium n'existe. `track-off` référence directement
`primitive.color.gray.9` (#8d8d8d), choisi pour donner ~3.3:1 entre le curseur blanc et la piste
(WCAG 1.4.11). C'est un **proxy de composant** (même approche que `card.elevated.shadow`)
jusqu'à la création d'un token sémantique dédié — gouverné par le Design System Lead.

---

## Périmètre v1

| Inclus | Exclu (v2) |
|--------|------------|
| États off/on/hover/focus/disabled | Libellés on/off (I/O) dans la piste |
| Effet immédiat (`agtc-change`) | Taille `sm`/`lg` |
| `role="switch"`, clavier Espace | État `loading` (async) |

---

## Tokens ajoutés dans `component.json`

| Token | Référence |
|-------|-----------|
| `--agtc-toggle-default-track-off` | `primitive.color.gray.9` (proxy) |
| `--agtc-toggle-default-track-off-hover` | `primitive.color.gray.10` (proxy) |
| `--agtc-toggle-default-track-on` | `semantic.color.action.primary` |
| `--agtc-toggle-default-track-on-hover` | `semantic.color.action.primary-hover` |
| `--agtc-toggle-default-knob` | `semantic.color.background.surface` |
| `--agtc-toggle-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-toggle-default-label` | `semantic.color.text.primary` |
