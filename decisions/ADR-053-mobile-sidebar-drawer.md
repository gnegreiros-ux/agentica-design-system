# ADR-053 — Mobile navigation: sidebar as a sliding drawer and contextual button in the content

> **Date:** 2026-06-10
> **Status:** ✅ Active
> **Decision-makers:** Human (approval) · Design System Lead (navigation)
> **Type:** pattern
> **Logical path:** decisions/ADR-053-mobile-sidebar-drawer.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/no-visited-nav.md

---

## Context

On mobile (≤768px), the secondary navigation sidebar (Foundations, Components, Decisions)
rendered in the normal page flow — **before the content** — because it precedes `<main>` in the
DOM and the layout switches to `flex-direction: column`. The first visible element was therefore
the navigation list, not the page title.

Additionally, on pages without a sidebar (home, Tokens, Agents), the drawer-access button was
present in the header even though it had no effect — it was contextual but positioned globally.

---

## Decision

### 1. Sidebar turned into a sliding drawer (mobile only)

At `max-width: 768px`, the sidebar is repositioned to `position: fixed` (out of flow), sliding in
from the left via `transform: translateX(-100%)` → `translateX(0)`. It no longer interferes with
the content's reading order.

Drawer behavior:
- Opens via the toggle button (see point 2)
- Closes via: the toggle button, clicking the overlay, the `Escape` key, clicking a navigation link
- A semi-transparent overlay (`rgba(0,0,0,.40)` + `backdrop-filter: blur(2px)`) covers the content
- `document.body.overflow: hidden` while open (prevents background scrolling)
- ARIA: `aria-expanded` on the button, `aria-hidden` on the overlay

### 2. Drawer-access button placed in the content, before the `<h1>`

The `sidebar-toggle` button is rendered **inside `<main>`**, right before the page title — only
on pages that have a sidebar. It is never present in the header, nor on pages without a sidebar.

Rationale:
- **Contextual**: visible only where it's useful
- **Readability**: the header stays identical on every page
- **Logical sequence**: the user sees the navigation button before the title, and can access it
  immediately before reading

Button style: `background-subtle` background + border + `panel-left` icon + "Navigation" label
(FR/EN) — reads as an action, not just an opaque icon.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| Button in the header (always visible) | Present on pages without a sidebar — misleading and useless |
| Sidebar above the content (initial behavior) | The user reads the navigation before the page — unnecessary cognitive load |
| Dropdown menu integrated into the mobile top-nav | Confuses primary and secondary navigation |

---

## Consequences

- On desktop (> 768px): no change — the sidebar stays in flow, the button is hidden via
  `display: none`
- The drawer JS must be present on every page with a sidebar (injected via `layout()`)
- Any new page with a sidebar automatically inherits this behavior (conditional rendering in
  `layout()`)
- **To watch:** if a page accumulates many sidebar links, consider a per-group accordion (future
  ADR)

<!-- FR -->

# ADR-053 — Navigation mobile : sidebar en drawer coulissant et bouton contextuel dans le contenu

> **Date :** 2026-06-10
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead (navigation)
> **Type:** pattern
> **Chemin logique:** decisions/ADR-053-mobile-sidebar-drawer.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/no-visited-nav.md

---

## Contexte

Sur mobile (≤ 768 px), la sidebar de navigation secondaire (Fondations, Composants, Décisions)
s'affichait dans le flux normal de la page — **avant le contenu** — car elle précède `<main>` dans
le DOM et le layout passe en `flex-direction: column`. Le premier élément visible était donc la
liste de navigation, non le titre de page.

Par ailleurs, sur les pages sans sidebar (accueil, Tokens, Agents), le bouton d'accès au drawer
était présent dans le header alors qu'il n'avait aucun effet — il était contextuel mais positionné
de manière globale.

---

## Décision

### 1. Sidebar transformée en drawer coulissant (mobile uniquement)

Sur `max-width: 768px`, la sidebar est repositionnée en `position: fixed` (hors flux), glissant
depuis la gauche via `transform: translateX(-100%)` → `translateX(0)`. Elle n'interfère plus avec
l'ordre de lecture du contenu.

Comportement du drawer :
- Ouverture via bouton toggle (voir point 2)
- Fermeture via : bouton toggle, clic sur l'overlay, touche `Escape`, clic sur un lien de navigation
- Overlay semi-transparent (`rgba(0,0,0,.40)` + `backdrop-filter: blur(2px)`) recouvre le contenu
- `document.body.overflow: hidden` pendant l'ouverture (empêche le scroll en arrière-plan)
- ARIA : `aria-expanded` sur le bouton, `aria-hidden` sur l'overlay

### 2. Bouton d'accès au drawer placé dans le contenu, avant le `<h1>`

Le bouton `sidebar-toggle` est rendu **dans `<main>`**, juste avant le titre de page — uniquement
sur les pages possédant une sidebar. Il n'est jamais présent dans le header ni sur les pages sans
sidebar.

Justification :
- **Contextuel** : visible uniquement là où il est utile
- **Lisibilité** : le header reste identique sur toutes les pages
- **Séquence logique** : l'utilisateur voit le bouton navigation avant le titre, peut y accéder
  immédiatement avant de lire

Style du bouton : fond `background-subtle` + bordure + icône `panel-left` + label "Navigation"
(FR/EN) — lisible comme action, pas juste une icône opaque.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Bouton dans le header (toujours visible) | Présent sur pages sans sidebar — trompeur et inutile |
| Sidebar au-dessus du contenu (comportement initial) | L'utilisateur lit la navigation avant la page — charge cognitive inutile |
| Menu déroulant intégré au top-nav mobile | Confond navigation principale et secondaire |

---

## Conséquences

- Sur desktop (> 768 px) : aucun changement — la sidebar reste dans le flux, le bouton est masqué
  via `display: none`
- Le JS du drawer doit être présent sur toutes les pages avec sidebar (injecté via `layout()`)
- Toute nouvelle page avec sidebar hérite automatiquement du comportement (rendu conditionnel dans
  `layout()`)
- **À surveiller :** si une page accumule beaucoup de liens sidebar, envisager un accordéon par
  groupe (ADR futur)
