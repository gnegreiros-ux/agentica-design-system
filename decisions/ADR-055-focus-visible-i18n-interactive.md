# ADR-055 — Systematic visible focus and i18n of interactive elements

> **Date:** 2026-06-10
> **Status:** ✅ Active
> **Decision-makers:** Human (approval) · Design System Lead (accessibility)
> **Type:** contract
> **Logical path:** decisions/ADR-055-focus-visible-i18n-interactive.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/development.md

---

## Context

A WCAG 2.1 AA audit of the site identified several gaps in interactive elements:

1. **Missing `:focus-visible`** on several site UI components: sidebar links, token explorer
   tabs, TOC links, navigation cards (`nav-card`), `menu-toggle` and `sidebar-toggle` buttons.
   Only the `back-to-top` and `code-copy` buttons had one.

2. **Search input**: `outline: none` alone with no sufficient visual compensation — the
   `border-color` change on focus was subtle and did not meet WCAG 2.4.7.

3. **"Copy" button**: static label in French only, not updated when switching FR ↔ EN language —
   inconsistent with the rest of the bilingual site.

4. **"21 WCAG 2.1 AA" stat**: ambiguous label, interpretable as a score or a violation count —
   did not clearly communicate what it measured.

---

## Decisions

### 1. `:focus-visible` on every interactive element

Rule extended to: `.sidebar a`, `.nav-card`, `.exp-tab`, `.toc a`, `.menu-toggle`,
`.sidebar-toggle`, `.explorer-search`.

Pattern applied uniformly:
```css
/* Navigation links */
.sidebar a:focus-visible {
  outline: none;
  background: var(--agtc-semantic-color-background-subtle);
  color: var(--agtc-semantic-color-text-primary);
}

/* Buttons */
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

All styles go through **semantic tokens** — no hardcoded value (`tokens-system.md` rule).

### 2. i18n of the "Copy" button

The button's text is computed dynamically from
`document.documentElement.getAttribute('data-lang')` at two moments:
- **On initialization** (DOMContentLoaded): shows "Copier" or "Copy" depending on the active
  language
- **On language change**: every `.code-copy` button not in the "Copied!" state is updated in
  real time

State after click: "Copié !" (FR) / "Copied!" (EN) — resets after 1.6s. <!-- lang-audit-ignore: quoting the site's bilingual UI string -->

### 3. Clarifying the WCAG stat label

"21 WCAG 2.1 AA" → "21 critères WCAG 2.1 AA couverts" (FR) / "21 WCAG 2.1 AA criteria covered" <!-- lang-audit-ignore: quoting the site's bilingual UI string -->
(EN) — explicit, unambiguous measurement.

---

## Normative reference

| WCAG criterion | Title | Decision covered |
|---|---|---|
| 2.4.7 (AA) | Focus Visible | `:focus-visible` on all interactive elements |
| 2.4.11 (AA, 2.2) | Focus Appearance | 2px `outline` + 2px offset |
| 3.1.2 (AA) | Language of Parts | Synchronized FR/EN labels |

---

## Consequences

- Any new interactive element added to the site **must** define a `:focus-visible` style before
  merge — verifiable via the axe-core audit (`wcag.md` pipeline)
- The pattern `outline: 2px solid var(--agtc-semantic-color-border-focus); outline-offset: 2px`
  is the canonical default for buttons
- Navigation links use the "background change" pattern (no outline) to avoid a visual conflict
  with the active-state `border-left`
- Any new interactive element with visible text must be bilingual if the site is bilingual

<!-- FR -->

# ADR-055 — Focus visible systématique et i18n des éléments interactifs

> **Date :** 2026-06-10
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead (accessibilité)
> **Type:** contract
> **Chemin logique:** decisions/ADR-055-focus-visible-i18n-interactive.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/development.md

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
