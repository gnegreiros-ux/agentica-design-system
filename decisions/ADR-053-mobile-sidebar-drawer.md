# ADR-053 — Navigation mobile : sidebar en drawer coulissant et bouton contextuel dans le contenu

> **Date :** 2026-06-10
> **Statut :** ✅ Actif
> **Décideurs :** Humain (approbation) · Design System Lead (navigation)
> **Type:** pattern
> **Chemin logique:** decisions/ADR-053-mobile-sidebar-drawer.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** site/build.js, .claude/rules/no-visited-nav.md

> **English summary:** On mobile (≤768px), the secondary sidebar rendered above the page content because it preceded `<main>` in the DOM. This ADR turns the sidebar into a sliding drawer (fixed position, off-canvas, overlay + Escape/click-outside to close) and moves its toggle button into the content, right before the page's `<h1>`, appearing only on pages that actually have a sidebar.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
