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
