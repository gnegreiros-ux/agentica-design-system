# Composant : Table — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-03
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/table.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-040-agtc-table-implementation.md, DESIGN.md

---

## Intention

**Pourquoi ce composant existe :**
Présenter des données tabulaires de façon lisible, scannable et accessible, en **lecture seule**.
C'est le composant le plus utilisé du site (tables de tokens : token → référence → valeur → intention).

**Ce composant n'est pas :**
- Un tableau interactif éditable (édition en ligne → futur, hors v1)
- Une grille de données avec tri/filtre/pagination (porte ouverte, non implémentée — voir ADR-040)
- Une mise en page (ne pas utiliser une table pour disposer des éléments non tabulaires)

---

## Architecture — le « mix » (ADR-040)

Deux formes consommant **les mêmes tokens** `component.table.*` :

| Forme | Usage | Rendu |
|-------|-------|-------|
| **Composant** `<agtc-table>` (piloté par données) | Apps, contextes JS, Storybook | `<table>` sémantique en shadow DOM, depuis `.columns`/`.rows` |
| **Classe** `.agtc-table` sur un `<table>` réel | Site statique (HTML sans JS) | Stylage d'un `<table>` light DOM écrit à la main |

> Le site reste du HTML statique résilient (pas de dépendance JS pour afficher une table) ;
> les apps bénéficient d'une API par données. Source de tokens unique.

---

## Propriétés (composant `<agtc-table>`)

| Attribut / Propriété | Type | Défaut | Description |
|----------------------|------|--------|-------------|
| `.columns` | Array | `[]` | `[{ label, align?, width?, key? } \| "Label"]` — `align` : `start` (défaut) / `end` / `center` |
| `.rows` | Array | `[]` | `[["a","b"], …]` (positionnel) ou `[{ key: valeur }, …]` |
| `caption` | String | — | **Recommandé** — légende accessible (WCAG 1.3.1) |
| `caption-hidden` | Boolean | `false` | Masque la légende visuellement, la garde pour les AT |
| `striped` | Boolean | `false` | Zébrage (sinon : séparateurs de lignes) |
| `sticky-header` | Boolean | `false` | En-tête figé au défilement vertical |
| `density` | String | `compact` | `compact` ou `comfortable` |

---

## Tokens utilisés

| Rôle | Token |
|------|-------|
| Fond d'en-tête | `component.table.default.header-background` |
| Texte d'en-tête | `component.table.default.header-text` |
| Texte de cellule | `component.table.default.cell-text` |
| Bordure / séparateurs | `component.table.default.border` |
| Survol de ligne | `component.table.default.row-hover` |
| Zébrage | `component.table.default.stripe` |
| Texte de légende | `component.table.default.caption-text` |
| Rayon (conteneur) | `component.table.default.radius` |
| Taille de police | `component.table.default.font-size` |
| Padding horizontal | `component.table.padding-x` |
| Padding vertical compact | `component.table.padding-y-compact` |
| Padding vertical confortable | `component.table.padding-y-comfortable` |

---

## Accessibilité — non négociable

| Règle | Valeur |
|-------|--------|
| Structure sémantique | `<table>` / `<thead>` / `<tbody>` réels — jamais de `<div>` simulant une table |
| Association cellule↔en-tête | `scope="col"` sur chaque `<th>` |
| Description de la table | `<caption>` (visible ou masqué via `caption-hidden`) — WCAG 1.3.1 |
| Alignement numérique | Colonnes de valeurs alignées à droite (`align="end"`) — scan vertical |
| Contraste texte/fond | 4.5:1 minimum (WCAG AA) — texte gris.12 sur blanc/gris.3 |
| Scroll horizontal | Conteneur focalisable au clavier, indicateur d'overflow visible |

---

## Comportements

- **Lecture seule** — aucune interaction de cellule par défaut.
- **Survol** de ligne (`row-hover`) pour garder sa ligne à l'œil sur des tables larges.
- **Séparateurs** de lignes par défaut ; **zébrage** en option (`striped`).
- **Overflow** : conteneur `overflow-x:auto` avec ombres de bord signalant le contenu masqué.

---

## Anti-patterns

| À éviter | Raison |
|----------|--------|
| `<div>` stylés en grille pour des données tabulaires | Inaccessible aux lecteurs d'écran |
| `<th>` sans `scope` | Association cellule↔en-tête perdue |
| Table sans `caption` ni `aria-label` | Contexte absent pour les AT (WCAG 1.3.1) |
| Valeurs numériques alignées à gauche | Comparaison verticale plus difficile |
| Table pour faire de la mise en page | Détourne la sémantique |
| Couleur/espacement codé en dur | Contourne les tokens |

---

## Patterns UX de référence

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036/040). Décision : **T1–T10 tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| HTML sémantique + `scope="col"` | [Smashing — Table Patterns](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Association cellule↔en-tête (absente du HTML d'origine du site) |
| `<caption>` décrivant la table | [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Masquable via `caption-hidden` (WCAG 1.3.1) |
| Alignement texte/gauche, numérique/droite | [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/) | ✅ | `align` par colonne, défaut `start` |
| Séparateurs de lignes (zébrage en option) | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ | Séparateurs par défaut, `striped` optionnel — choix utilisateur |
| Survol de ligne | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ | `row-hover` |
| En-tête figé | [NN/g](https://www.nngroup.com/articles/data-tables/) · [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Optionnel via `sticky-header` |
| Scroll horizontal + indicateur d'overflow | [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Conteneur `overflow-x` + ombres de bord (noms de tokens longs) |
| 1ʳᵉ colonne = identifiant lisible, ordre = importance | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ | Convention des tables de tokens |
| Densité `compact` par défaut | [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | `density="comfortable"` disponible |
| Tri / filtrage / pagination | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ (porte ouverte) | **Hors v1** : tables de doc statiques ; API `columns`/`rows` conçue pour les accueillir sans rupture (futur `column.sortable` + `@sort`) |

---

## Implémentation

### Composant (Lit, piloté par données)
```html
<agtc-table caption="Tokens du composant badge" caption-hidden></agtc-table>
<script>
  const t = document.querySelector('agtc-table');
  t.columns = [
    { label: 'Token CSS', align: 'start', width: '46%' },
    { label: 'Référence', align: 'start' },
    { label: 'Valeur',    align: 'end' },
  ];
  t.rows = [
    ['--agtc-badge-neutral-background', 'semantic.color.background.subtle', '#f0f0f0'],
    ['--agtc-badge-neutral-text',       'semantic.color.text.secondary',    '#646464'],
  ];
</script>
```

### Classe (HTML statique, light DOM)
```html
<table class="agtc-table">
  <caption class="visually-hidden">Tokens du composant badge</caption>
  <thead>
    <tr><th scope="col">Token CSS</th><th scope="col">Référence</th><th scope="col" class="num">Valeur</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--agtc-badge-neutral-background</code></td><td>semantic.color.background.subtle</td><td class="num">#f0f0f0</td></tr>
  </tbody>
</table>
```

---

## Gouvernance

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une fonctionnalité (tri, filtre, pagination) | Principal Designer + Tech Lead + nouvel ADR |
| Modification d'un token | Principal Designer |
| Changement de densité par défaut | Design system team |
| Correction bug accessibilité | Review design system team |
