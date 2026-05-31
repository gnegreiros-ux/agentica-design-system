# ADR-035 — Implémentation de `agtc-card`

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-035-agtc-card-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-034-agtc-badge-implementation.md, tokens/component.json

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
