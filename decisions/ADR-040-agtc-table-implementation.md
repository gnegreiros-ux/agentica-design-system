# ADR-040 — Implementing `agtc-table`

> **Date:** 2026-06-03
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-040-agtc-table-implementation.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, guidelines/components/table.md, tokens/component.json

---

## Reference UX patterns applied

> Added 2026-06-03 via the `ux-pattern-review` workflow (ADR-036). Decision: **T1–T10 all approved**.
> Detail and links: `guidelines/components/table.md` § REFERENCE UX PATTERNS.

| # | Pattern | Source |
|---|---------|--------|
| T1 | Semantic HTML + `scope="col"` | Smashing — Table Patterns |
| T2 | `<caption>` (hideable) | Smashing |
| T3 | Text left-aligned, numeric right-aligned | NN/g — Data Tables |
| T4 | Row separators (optional zebra striping) | NN/g |
| T5 | Row hover | NN/g |
| T6 | Sticky header (optional) | NN/g · Smashing |
| T7 | Horizontal scroll + overflow indicator | Smashing |
| T8 | 1st column = readable identifier | NN/g |
| T9 | `compact` density by default | Dashboard Design Patterns |
| T10 | Sort/filter/pagination — **door left open, out of v1** | NN/g |

---

## Context

`agtc-table` is the **most used component on the generated site**: 692 occurrences of
`token-row`/`token-table` (token tables: CSS token → reference → value → intent), plus
comparison tables and DOs/DON'Ts tables. The gap analysis of 2026-06-03 identified it as
the first component to build from the site's actual needs.

Observation at creation time: the site's original HTML has **neither `scope` on `<th>`
nor `<caption>`** — an accessibility gap this component fills.

The table is **read-only**: documentation tables don't need editing, sorting, or
pagination. We avoid speculative design while keeping the door open.

---

## Decisions

### Decision 1 — "Mix" architecture: data-driven component **+** light-DOM class

Two forms consuming the **same** `component.table.*` tokens:

1. **`<agtc-table>`** (Lit, shadow DOM) — driven by `.columns`/`.rows`. For apps, JS
   contexts, and Storybook. Consistent with other components (shadow DOM + `static styles`).
2. **`.agtc-table`** (CSS class) — applied to a real, hand-written `<table>`. For the
   **static site**, which must remain resilient: displaying a table must **not** depend
   on JS.

Why not a single mechanism?
- An all-shadow-DOM data-driven approach would make the site **JS-dependent** to display
  its tables — a resilience regression (the site is currently pure static HTML).
- *Slotting* a full `<table>` into a shadow DOM doesn't allow styling `th`/`td`
  (`::slotted` doesn't reach descendants). The light-DOM class works around this
  limitation and handles **rich cell content** (e.g., `<code>`), which the data-driven
  API (escaped text) doesn't cover.

### Decision 2 — Read-only; sort/filter/pagination out of scope, but an extensible API

v1 implements **neither sorting, filtering, nor pagination** (T10). The site's actual
need is static tables. But a future need was confirmed by the user: the `columns`/`rows`
API is chosen **precisely** to accommodate them without a breaking change (future
`column.sortable`, `@sort` event, toolbar slot). No dead property ships in v1, to avoid a
misleading API.

### Decision 3 — `table` tokens in `component.json`, `default.*` structure + paddings

Colors and radius live under `table.default.*`; paddings (horizontal, compact/comfortable
vertical) sit at the `table.*` level. This separation allows changing density without
touching colors. Compliant with the three levels (ADR-001): every token points to a
semantic token (`background.subtle`, `border.default`, `background.hover`…), no raw value.

### Decision 4 — Accessible by default: `scope`, `<caption>`, numeric alignment

`<th scope="col">` systematically; `<caption>` recommended (console warning if absent),
visually hideable via `caption-hidden`; numeric columns right-aligned (`align="end"`) for
vertical scanning. Fills the gaps in the original HTML.

### Decision 5 — Row separators by default, zebra striping optional (T4)

User decision: **row separators** by default (understated, suited to dense token
tables), **zebra striping** available via the `striped` attribute.

### Decision 6 — `compact` density by default (T9)

Token tables are dense; `compact` is the default, `comfortable` available via `density`.

---

## v1 scope

| Included | Excluded (door left open) |
|----------|------------------------|
| Data-driven component (`columns`/`rows`) | Sort / filter / pagination |
| `.agtc-table` class (light DOM, rich content) | Inline cell editing |
| `caption` + `caption-hidden`, `scope="col"` | Row selection / bulk actions |
| Per-column alignment (`start`/`end`/`center`) | Resizable / reorderable columns |
| `striped`, `sticky-header`, `density` | Multi-level header / colspan |
| Horizontal scroll + overflow indicator | Rich HTML cells via the data-driven API (→ use the class) |

---

## Rejected alternatives

- **All-shadow-DOM data-driven only**: makes the site JS-dependent for its tables (regression).
- **All-CSS-class only**: no data-driven API for apps; no clean Storybook story.
- **Slotting a `<table>` into shadow DOM**: impossible to style slotted `th`/`td`.
- **Shipping a no-op `sortable`** to "flag" T10: a misleading API; documenting extensibility preferred instead.

---

## Consequences

- The site will be able to migrate its `token-table`/`token-row` elements to
  `.agtc-table` during the *dogfooding* step (category A of the gap analysis), with no
  JS dependency.
- Any future addition of sort/filter/pagination will require a new ADR (governance).

---

## Tokens added to `component.json`

| Token | Semantic reference |
|-------|----------------------|
| `--agtc-table-default-header-background` | `semantic.color.background.subtle` |
| `--agtc-table-default-header-text` | `semantic.color.text.secondary` |
| `--agtc-table-default-cell-text` | `semantic.color.text.primary` |
| `--agtc-table-default-border` | `semantic.color.border.default` |
| `--agtc-table-default-row-hover` | `semantic.color.background.hover` |
| `--agtc-table-default-stripe` | `semantic.color.background.subtle` |
| `--agtc-table-default-caption-text` | `semantic.color.text.secondary` |
| `--agtc-table-default-radius` | `semantic.radius.card` |
| `--agtc-table-default-font-size` | `semantic.typography.label.size` |
| `--agtc-table-padding-x` | `primitive.space.3` |
| `--agtc-table-padding-y-compact` | `primitive.space.2` |
| `--agtc-table-padding-y-comfortable` | `primitive.space.3` |

<!-- FR -->

# ADR-040 — Implémentation de `agtc-table`

> **Date :** 2026-06-03
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-040-agtc-table-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-036-ux-pattern-review-pre-composant.md, guidelines/components/table.md, tokens/component.json

---

## Patterns UX de référence appliqués

> Ajouté le 2026-06-03 via le workflow `ux-pattern-review` (ADR-036). Décision : **T1–T10 tous approuvés**.
> Détail et liens : `guidelines/components/table.md` § PATTERNS UX DE RÉFÉRENCE.

| # | Pattern | Source |
|---|---------|--------|
| T1 | HTML sémantique + `scope="col"` | Smashing — Table Patterns |
| T2 | `<caption>` (masquable) | Smashing |
| T3 | Alignement texte/gauche, numérique/droite | NN/g — Data Tables |
| T4 | Séparateurs de lignes (zébrage en option) | NN/g |
| T5 | Survol de ligne | NN/g |
| T6 | En-tête figé (optionnel) | NN/g · Smashing |
| T7 | Scroll horizontal + indicateur d'overflow | Smashing |
| T8 | 1ʳᵉ colonne = identifiant lisible | NN/g |
| T9 | Densité `compact` par défaut | Dashboard Design Patterns |
| T10 | Tri/filtre/pagination — **porte ouverte, hors v1** | NN/g |

---

## Contexte

`agtc-table` est le composant **le plus utilisé du site généré** : 692 occurrences de
`token-row`/`token-table` (tables de tokens : token CSS → référence → valeur → intention),
plus les tables de comparaison et les tables DOs/DON'Ts. La gap-analysis du 2026-06-03 l'a
identifié comme premier composant à construire à partir des besoins réels du site.

Constat à la création : le HTML d'origine du site **n'a ni `scope` sur les `<th>` ni `<caption>`**
— un trou d'accessibilité que ce composant comble.

La table est **en lecture seule** : les tables documentaires n'ont pas besoin d'édition, de tri ni
de pagination. On évite la conception spéculative tout en gardant la porte ouverte.

---

## Décisions

### Décision 1 — Architecture « mix » : composant piloté par données **+** classe light DOM

Deux formes consommant les **mêmes tokens** `component.table.*` :

1. **`<agtc-table>`** (Lit, shadow DOM) — piloté par `.columns`/`.rows`. Pour les apps, les
   contextes JS et Storybook. Cohérent avec les autres composants (shadow DOM + `static styles`).
2. **`.agtc-table`** (classe CSS) — appliquée à un `<table>` réel écrit à la main. Pour le
   **site statique**, qui doit rester résilient : afficher une table ne doit **pas dépendre de JS**.

Pourquoi pas un seul mécanisme ?
- Tout-shadow-DOM piloté par données rendrait le site **JS-dépendant** pour afficher ses tables —
  régression de résilience (le site est aujourd'hui du HTML statique pur).
- Le *slotting* d'un `<table>` complet dans un shadow DOM ne permet pas de styler `th`/`td`
  (`::slotted` n'atteint pas les descendants). La classe light DOM contourne cette limite et gère
  le **contenu riche** des cellules (ex. `<code>`), que l'API par données (texte échappé) ne couvre pas.

### Décision 2 — Lecture seule ; tri/filtre/pagination hors périmètre, mais API extensible

La v1 n'implémente **ni tri, ni filtrage, ni pagination** (T10). Besoin réel du site = tables
statiques. Mais l'utilisateur a confirmé un besoin futur : l'API `columns`/`rows` est choisie
**précisément** pour les accueillir sans rupture (futur `column.sortable`, événement `@sort`,
slot de barre d'outils). Aucune propriété morte n'est livrée en v1 pour éviter une API trompeuse.

### Décision 3 — Tokens `table` dans `component.json`, structure `default.*` + paddings

Les couleurs et le rayon vivent sous `table.default.*` ; les paddings (horizontal, vertical
compact/confortable) sont au niveau `table.*`. Cette séparation permet de changer la densité
sans toucher aux couleurs. Conforme aux trois niveaux (ADR-001) : tous les tokens pointent vers
des tokens sémantiques (`background.subtle`, `border.default`, `background.hover`…), aucune valeur brute.

### Décision 4 — Accessibilité par défaut : `scope`, `<caption>`, alignement numérique

`<th scope="col">` systématique ; `<caption>` recommandé (avertissement console si absent),
masquable visuellement via `caption-hidden` ; colonnes numériques alignées à droite (`align="end"`)
pour le scan vertical. Comble les trous du HTML d'origine.

### Décision 5 — Séparateurs par défaut, zébrage en option (T4)

Décision utilisateur : **séparateurs de lignes** par défaut (sobre, adapté aux tables de tokens
denses), **zébrage** disponible via l'attribut `striped`.

### Décision 6 — Densité `compact` par défaut (T9)

Les tables de tokens sont denses ; `compact` est le défaut, `comfortable` disponible via `density`.

---

## Périmètre v1

| Inclus | Exclu (porte ouverte) |
|--------|------------------------|
| Composant piloté par données (`columns`/`rows`) | Tri / filtrage / pagination |
| Classe `.agtc-table` (light DOM, contenu riche) | Édition de cellule en ligne |
| `caption` + `caption-hidden`, `scope="col"` | Sélection de lignes / actions de masse |
| Alignement par colonne (`start`/`end`/`center`) | Colonnes redimensionnables / réordonnables |
| `striped`, `sticky-header`, `density` | En-tête multi-niveaux / colspan |
| Scroll horizontal + indicateur d'overflow | Cellules HTML riches via l'API par données (→ classe) |

---

## Alternatives rejetées

- **Tout-shadow-DOM piloté par données seul** : rend le site JS-dépendant pour ses tables (régression).
- **Tout-classe CSS seul** : pas d'API par données pour les apps ; pas de story Storybook propre.
- **Slotting d'un `<table>` dans le shadow DOM** : impossible de styler `th`/`td` slottés.
- **Livrer un `sortable` no-op** pour « marquer » T10 : API trompeuse ; préféré documenter l'extensibilité.

---

## Conséquences

- Le site pourra migrer ses `token-table`/`token-row` vers `.agtc-table` lors de l'étape de
  *dogfooding* (catégorie A de la gap-analysis), sans dépendance JS.
- Tout ajout de tri/filtre/pagination devra créer un nouvel ADR (gouvernance).

---

## Tokens ajoutés dans `component.json`

| Token | Référence sémantique |
|-------|----------------------|
| `--agtc-table-default-header-background` | `semantic.color.background.subtle` |
| `--agtc-table-default-header-text` | `semantic.color.text.secondary` |
| `--agtc-table-default-cell-text` | `semantic.color.text.primary` |
| `--agtc-table-default-border` | `semantic.color.border.default` |
| `--agtc-table-default-row-hover` | `semantic.color.background.hover` |
| `--agtc-table-default-stripe` | `semantic.color.background.subtle` |
| `--agtc-table-default-caption-text` | `semantic.color.text.secondary` |
| `--agtc-table-default-radius` | `semantic.radius.card` |
| `--agtc-table-default-font-size` | `semantic.typography.label.size` |
| `--agtc-table-padding-x` | `primitive.space.3` |
| `--agtc-table-padding-y-compact` | `primitive.space.2` |
| `--agtc-table-padding-y-comfortable` | `primitive.space.3` |
