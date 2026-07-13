# ADR-049 — Ombre de carte au repos tokenisée : `semantic.shadow.card`

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Principal Designer (jeton de composant) · Design System Lead (jeton sémantique)
> **Type:** contract
> **Chemin logique:** decisions/ADR-049-card-shadow-token.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/component.json, decisions/ADR-046-inverse-surfaces-shadows-tokens.md, site/build.js

> **English summary:** Tokenizes the last remaining raw shadow value in the system — the card's
> resting elevation — as a new `semantic.shadow.card` token, with `component.card.elevated.shadow`
> repointed to reference it. Pure indirection refactor; the resolved visual value is unchanged.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

L'ADR-046 a tokenisé toutes les ombres du système (`shadow.header`, `shadow.raised`,
`shadow.card-hover`) **sauf une** : `component.card.elevated.shadow` portait encore une valeur
`rgba` **brute** (`0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)`). C'était le **résidu
assumé** d'ADR-046 — la dernière ombre du système non adossée à une couche sémantique nommée.

Son niveau d'élévation (ombre **au repos**, fine : 1–3px) n'est couvert par aucun des trois jetons
d'ombre existants (`header` = en-tête fixe, `raised` = menus/popovers à 4/16px, `card-hover` = lift
teinté marque au survol). Il lui fallait donc son propre jeton sémantique.

---

## Décision

1. **Ajout du jeton sémantique** `shadow.card` :

   | Jeton | Valeur | Rôle |
   |-------|--------|------|
   | `semantic.shadow.card` | `0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)` | Ombre de carte au repos — élévation légère |

2. **Re-pointage du jeton de composant** `component.card.elevated.shadow` :
   la valeur brute devient une **référence** `{semantic.shadow.card}`.

> **Changement de valeur résolue = AUCUN.** La valeur finale est strictement identique
> (`var(--agtc-component-card-elevated-shadow)` → `var(--agtc-semantic-shadow-card)` → même `rgba`).
> Refactoring d'indirection pur — **zéro changement visuel**.

---

## Périmètre

| Inclus | Exclu |
|--------|-------|
| `semantic.shadow.card` (nouveau) ; `component.card.elevated.shadow` → référence sémantique | Toute autre ombre (déjà tokenisée par ADR-046) |
| Miroir COMP + ligne d'affichage de la doc carte dans `site/build.js` | Modification de la valeur d'ombre (inchangée) |

---

## Alternatives rejetées

- **Réutiliser `shadow.raised` pour la carte au repos** : `raised` (4/16px) est une élévation plus
  forte (menus, popovers) — sémantiquement et visuellement distincte de l'ombre de carte au repos
  (1–3px). Réutiliser fausserait l'intention et changerait le visuel — rejeté.
- **Laisser la valeur brute dans le composant** : reconduit le résidu d'ADR-046 ; contraire à la
  règle « jamais de valeur brute, toujours via un sémantique » — rejeté.

---

## Conséquences

- **Plus aucune ombre brute** dans le système : la famille d'ombres d'ADR-046 est complète et
  cohérente (header, raised, card-hover, card). Build : **663 défini · 178 référencé · 0 fantôme**.
- `component.card.elevated` consomme désormais une intention nommée, conformément à l'architecture à
  trois niveaux (primitif → sémantique → composant).
- Gouvernance : 1 jeton sémantique ajouté (Design System Lead) + 1 jeton de composant re-pointé
  (Principal Designer). Aucun primitif modifié. Valeur résolue inchangée.
