# Rule : no-visited-nav

> Les éléments de navigation ne portent jamais d'état `:visited` distinct.
> Règle de portée **système entière** (site, composants, applications consommatrices).
> **Type:** rule
> **Chemin logique:** .claude/rules/no-visited-nav.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/development.md, .claude/rules/code-style.md, guidelines/components/link.md

---

## Règle absolue

```
❌ INTERDIT : styliser :visited différemment sur un élément de navigation
✅ OBLIGATOIRE : la couleur :visited est réalignée sur l'état non-visité
```

> La navigation n'est pas du **contenu** « lu / non lu ». Un lien de menu, d'onglet,
> de fil d'Ariane, de sidebar, de table des matières (TOC) ou un bouton-icône d'en-tête
> doit avoir la **même apparence** qu'il ait été visité ou non. L'état `:visited` (teinte
> violette du navigateur, ou toute autre dérive) casse la cohérence et la hiérarchie.

---

## Périmètre — qu'est-ce qu'un « élément de navigation » ?

| ✅ Concerné (pas d'état visité) | ❌ Non concerné (état visité acceptable) |
|-------------------------------|------------------------------------------|
| Nav principale (header), CTA de nav | Liens de **contenu** dans la prose d'un article |
| Sidebar, table des matières (TOC), onglets | Listes de résultats / d'archives où « déjà lu » aide l'utilisateur |
| Fil d'Ariane, pagination, menus | Références bibliographiques longues |
| Boutons-icônes d'en-tête/pied (GitHub, Storybook…) | |
| Liens du pied de page de navigation | |

> En cas de doute : si l'élément sert à **se déplacer** dans le produit, c'est de la
> navigation → pas d'état visité. S'il pointe vers une **ressource à lire**, l'état
> visité peut aider → autorisé.

---

## Implémentation de référence (CSS)

```css
/* La couleur visitée = couleur non-visitée (token sémantique identique).
   Déclarer AVANT les règles :hover/.active — à spécificité égale, le sélecteur
   le plus tardif (hover/actif) doit l'emporter sur un lien visité ET survolé. */
.top-nav a:visited,
.sidebar a:visited,
.toc a:visited,
.footer-links a:visited { color: var(--agtc-semantic-color-text-secondary); }
```

### Exception Safari — valeur littérale obligatoire

Safari (et WebKit) bloquent la résolution de `var()` dans les règles `:visited` pour des raisons
de sécurité (protection contre le sniffing de l'historique de navigation). `var()` est accepté
en syntaxe mais ignoré silencieusement à l'application — la couleur reste celle du navigateur.

**Pattern correct pour le site Agentica :**
```css
/* Valeur hex résolue AVANT le var() — Safari applique le hex, Chrome/Firefox appliquent var(). */
.top-nav a:visited { color: #646464; color: var(--agtc-semantic-color-text-secondary); }

/* Thème sombre : même pattern avec la valeur résolue dark */
[data-theme="dark"] .top-nav a:visited { color: #a4abb8; color: var(--agtc-semantic-color-text-secondary); }
```

> **Ce n'est PAS une valeur en dur au sens de `tokens-system.md`** : la valeur littérale est
> identique à la valeur résolue du token sémantique. Il s'agit d'une contrainte de sécurité
> navigateur, documentée ici pour que les agents ne la suppriment pas lors d'audits.
> Référence : ADR-047 (règle), ADR-059 (incident de suppression erronée le 2026-06-15).

- Toujours passer par un **token sémantique** (jamais de valeur en dur) — cf. `tokens-system.md`.
- Exception ci-dessus : la valeur littérale est autorisée uniquement dans les règles `:visited`,
  accompagnée obligatoirement du token `var()` comme deuxième déclaration.
- Web Components (`agtc-*`) : si un composant expose un lien de navigation (ex. `agtc-link`
  en usage nav, `agtc-segmented`, futur `agtc-tabs`), il neutralise `:visited` dans son
  shadow DOM selon la même règle.

---

## Vérification (quality gate)

- [ ] Aucun élément de navigation n'affiche de couleur `:visited` distincte (visuel + audit CSS)
- [ ] La neutralisation passe par un token sémantique, pas une valeur en dur
- [ ] Les liens de **contenu** ne sont PAS affectés (la règle ne s'applique qu'à la navigation)

---

## Règle pour les agents

```
✅ Neutraliser :visited sur tout élément de navigation (site ET composants)
✅ Conserver l'état visité sur les liens de contenu/lecture si pertinent
❌ Styliser :visited d'une couleur différente sur un menu, onglet, sidebar, TOC, bouton de nav
❌ Coder la couleur en dur — toujours via un token sémantique
```
