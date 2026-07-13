# ADR-055 — Focus visible systématique et i18n des éléments interactifs

> **Date :** 2026-06-10
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead (accessibilité)
> **Type:** contract
> **Chemin logique:** decisions/ADR-055-focus-visible-i18n-interactive.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/development.md

> **English summary:** A WCAG 2.1 AA audit found several gaps: missing `:focus-visible` on sidebar links, tabs, TOC links, nav cards, and toggle buttons; an insufficient focus indicator on the search input; a copy button label that never updated when switching FR/EN; and an ambiguous "21 WCAG 2.1 AA" stat label. This ADR adds `:focus-visible` (via semantic tokens) across all interactive elements, makes the copy button's label reactive to the active language, and clarifies the stat label to "21 WCAG 2.1 AA criteria covered."
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

Un audit WCAG 2.1 AA du site a identifié plusieurs lacunes sur les éléments interactifs :

1. **`:focus-visible` absent** sur plusieurs composants UI du site : liens sidebar, onglets
   de l'explorateur de tokens, liens du TOC, cartes de navigation (`nav-card`), boutons
   `menu-toggle` et `sidebar-toggle`. Seuls les boutons `back-to-top` et `code-copy` en
   avaient un.

2. **Input de recherche** : `outline: none` seul sans compensation visuelle suffisante — le
   changement de `border-color` à la prise de focus était subtil et non conforme WCAG 2.4.7.

3. **Bouton "Copier"** : libellé statique en français uniquement, non mis à jour lors du
   changement de langue FR ↔ EN — incohérence avec le reste du site bilingue.

4. **Stat "21 WCAG 2.1 AA"** : label ambigu, interprétable comme un score ou un nombre de
   violations — ne communiquait pas clairement ce qu'il mesurait.

---

## Décisions

### 1. `:focus-visible` sur tous les éléments interactifs

Règle étendue à : `.sidebar a`, `.nav-card`, `.exp-tab`, `.toc a`, `.menu-toggle`,
`.sidebar-toggle`, `.explorer-search`.

Pattern appliqué uniformément :
```css
/* Liens de navigation */
.sidebar a:focus-visible {
  outline: none;
  background: var(--agtc-semantic-color-background-subtle);
  color: var(--agtc-semantic-color-text-primary);
}

/* Boutons */
.menu-toggle:focus-visible,
.sidebar-toggle:focus-visible {
  outline: 2px solid var(--agtc-semantic-color-border-focus);
  outline-offset: 2px;
}

/* Input */
.explorer-search:focus-visible {
  outline: none;
  border-color: var(--agtc-semantic-color-border-focus);
  box-shadow: 0 0 0 3px var(--agtc-semantic-color-action-focus-ring);
}
```

Tous les styles passent par des **tokens sémantiques** — aucune valeur en dur (règle
`tokens-system.md`).

### 2. i18n du bouton "Copier"

Le texte du bouton est calculé dynamiquement depuis `document.documentElement.getAttribute('data-lang')`
à deux moments :
- **À l'initialisation** (DOMContentLoaded) : affiche "Copier" ou "Copy" selon la langue active
- **Au changement de langue** : tous les boutons `.code-copy` non en état "Copié !" sont mis à
  jour en temps réel

État après clic : "Copié !" (FR) / "Copied!" (EN) — reset après 1,6 s.

### 3. Clarification du label stat WCAG

"21 WCAG 2.1 AA" → "21 critères WCAG 2.1 AA couverts" (FR) / "21 WCAG 2.1 AA criteria covered"
(EN) — mesure explicite, sans ambiguïté.

---

## Référence normative

| Critère WCAG | Intitulé | Décision couverte |
|---|---|---|
| 2.4.7 (AA) | Focus visible | `:focus-visible` sur tous les interactifs |
| 2.4.11 (AA, 2.2) | Focus apparence | `outline` 2px + offset 2px |
| 3.1.2 (AA) | Langue des parties | Labels FR/EN synchronisés |

---

## Conséquences

- Tout nouvel élément interactif ajouté au site **doit** définir un style `:focus-visible`
  avant merge — vérifiable via l'audit axe-core (pipeline `wcag.md`)
- Le pattern `outline: 2px solid var(--agtc-semantic-color-border-focus); outline-offset: 2px`
  est le défaut canonique pour les boutons
- Les liens de navigation utilisent le pattern "background change" (sans outline) pour éviter le
  conflit visuel avec la `border-left` d'état actif
- Tout nouvel élément interactif avec du texte visible doit être bilingue si le site est bilingue
