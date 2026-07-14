# ADR-063 — `agtc-feature-card` component: editorial card V2

**Date:** 2026-06-25
**Status:** Accepted
**Decision-makers:** Guilherme Negreiros (Principal Designer)
**Tags:** component, v2, marketing, accessibility

---

## Context

The V2 redesign introduces a "Value by role" section on the home page and editorial blocks
on the secondary marketing pages. These elements require a reusable component with:
- A functional icon (a signal before the heading is read)
- A short heading
- A body of text
- A visual interactivity affordance (animated border-bottom on hover)

The `.v2-role-card` CSS class already existed in `site/build.js` but with no component
encapsulation. The UX review confirmed the need for a formal Web Component.

---

## Decision

Create `agtc-feature-card` (Lit) with:
- `heading` attribute (title)
- `heading-level` attribute 1-6, default 3 (P5 — hierarchical flexibility)
- `variant` attribute: `"default"` | `"marketing"` (P6 — contextual variant)
- Named `icon` slot for a 20×20 SVG (P1 — icon + title duo)
- Default slot for the body
- `prefers-reduced-motion` in the shadow CSS (P7 — priority)
- `role="heading"` + dynamic `aria-level` (P8 — SR accessibility)

---

## UX patterns applied (review 2026-06-25)

| # | Pattern | Source | Decision |
|---|---------|--------|----------|
| P1 | Icon + title duo | [NN/g — Icons & Indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ Applied |
| P2 | Controlled interactivity affordance | [IxDF — UI Patterns](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ Applied |
| P3 | Non-interactivity by default | [Smashing — Card patterns](https://www.smashingmagazine.com/category/design-patterns/) | ✅ Applied |
| P4 | Touch targets ≥ 24×24px (WCAG 2.5.8) | [IxDF — Touch Targets](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ Compliant |
| P5 | Flexible heading level | [NN/g — Visual Hierarchy](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ `heading-level` attribute |
| P6 | Contextual variant | [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ default / marketing |
| P7 | `prefers-reduced-motion` | [IxDF — Accessibility](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ Priority — border visible from the start |
| P8 | Accessible markup | [IF — Data Patterns](https://catalogue.projectsbyif.com/) | ✅ role + aria-level |

---

## Alternatives considered

**Option A — pure CSS (`.v2-role-card` class)**: rejected. No encapsulation, no attribute
contract, no guarantee of correct usage by agents or teams.

**Option B — Lit with a native `<h3>` heading**: rejected. Hardcoded heading level —
potential jump depending on the page context (P5).

**Option C — Lit with flexible `heading-level`** (chosen): `role="heading"` + dynamic
`aria-level`. Compatible with any page context.

---

## Consequences

- `agtc-feature-card` is registered in `components/index.js` and bundled into `agtc.js`
- The guideline is at `guidelines/components/feature-card.md`
- The Storybook story is at `components/agtc-feature-card.stories.js`
- The `.v2-role-card` class in `site/build.js` remains for the home page (static HTML) —
  migration to `<agtc-feature-card>` to be planned in a dedicated project
- Any modification of the variant or behavior requires a new UX review

---

## Files affected

- `components/agtc-feature-card.js` — new
- `components/agtc-feature-card.stories.js` — new
- `components/index.js` — import added
- `guidelines/components/feature-card.md` — new guideline

<!-- FR -->

# ADR-063 — Composant `agtc-feature-card` : carte éditoriale V2

**Date :** 2026-06-25
**Statut :** Accepté
**Décideurs :** Guilherme Negreiros (Principal Designer)
**Tags :** composant, v2, marketing, accessibilité

---

## Contexte

Le redesign V2 introduit une section "Valeur par rôle" sur la home et des blocs éditoriaux sur les pages secondaires marketing. Ces éléments nécessitent un composant réutilisable avec :
- Une icône fonctionnelle (signal avant la lecture du titre)
- Un heading court
- Un corps de texte
- Une affordance d'interactivité visuelle (border-bottom animé au hover)

La classe CSS `.v2-role-card` existait déjà dans `site/build.js` mais sans encapsulation composant. La revue UX a confirmé le besoin d'un Web Component formel.

---

## Décision

Créer `agtc-feature-card` (Lit) avec :
- Attribut `heading` (titre)
- Attribut `heading-level` 1-6, défaut 3 (P5 — flexibilité hiérarchique)
- Attribut `variant` : `"default"` | `"marketing"` (P6 — variante contextuelle)
- Slot `icon` nommé pour SVG 20×20 (P1 — duo icône + titre)
- Slot défaut pour le corps
- `prefers-reduced-motion` dans le shadow CSS (P7 — prioritaire)
- `role="heading"` + `aria-level` dynamique (P8 — accessibilité SR)

---

## Patterns UX appliqués (revue 2026-06-25)

| # | Pattern | Source | Décision |
|---|---------|--------|----------|
| P1 | Icône + titre en duo | [NN/g — Icons & Indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ Appliqué |
| P2 | Affordance d'interactivité contrôlée | [IxDF — UI Patterns](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ Appliqué |
| P3 | Non-interactivité par défaut | [Smashing — Card patterns](https://www.smashingmagazine.com/category/design-patterns/) | ✅ Appliqué |
| P4 | Cibles tactiles ≥ 24×24px (WCAG 2.5.8) | [IxDF — Touch Targets](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ Conforme |
| P5 | Heading niveau flexible | [NN/g — Visual Hierarchy](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ Attribut `heading-level` |
| P6 | Variante contextuelle | [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ default / marketing |
| P7 | `prefers-reduced-motion` | [IxDF — Accessibilité](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ Prioritaire — border visible dès le départ |
| P8 | Markup accessible | [IF — Data Patterns](https://catalogue.projectsbyif.com/) | ✅ role + aria-level |

---

## Alternatives considérées

**Option A — CSS pur (classe `.v2-role-card`)** : rejetée. Pas d'encapsulation, pas de contrat attribut, pas de garantie d'usage correct par les agents ou les équipes.

**Option B — Lit avec heading natif `<h3>`** : rejetée. Niveau de heading hardcodé — saut potentiel selon le contexte de la page (P5).

**Option C — Lit avec `heading-level` flexible** (choisie) : `role="heading"` + `aria-level` dynamique. Compatible avec tout contexte de page.

---

## Conséquences

- `agtc-feature-card` est enregistré dans `components/index.js` et bundlé dans `agtc.js`
- La guideline est à `guidelines/components/feature-card.md`
- La Storybook story est à `components/agtc-feature-card.stories.js`
- La classe `.v2-role-card` dans `site/build.js` reste pour la home (HTML statique) — migration vers `<agtc-feature-card>` à planifier lors d'un chantier dédié
- Toute modification de variante ou de comportement requiert une nouvelle revue UX

---

## Fichiers impactés

- `components/agtc-feature-card.js` — nouveau
- `components/agtc-feature-card.stories.js` — nouveau
- `components/index.js` — import ajouté
- `guidelines/components/feature-card.md` — nouvelle guideline
