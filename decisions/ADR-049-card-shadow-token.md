# ADR-049 — Tokenizing the card's resting shadow: `semantic.shadow.card`

> **Date:** 2026-06-05
> **Status:** ✅ Active
> **Decision-makers:** Principal Designer (component token) · Design System Lead (semantic token)
> **Type:** contract
> **Logical path:** decisions/ADR-049-card-shadow-token.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/component.json, decisions/ADR-046-inverse-surfaces-shadows-tokens.md, site/build.js

---

## Context

ADR-046 tokenized every shadow in the system (`shadow.header`, `shadow.raised`,
`shadow.card-hover`) **except one**: `component.card.elevated.shadow` still carried a
**raw** `rgba` value (`0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)`). This was
ADR-046's **accepted residual debt** — the last shadow in the system not backed by a
named semantic layer.

Its elevation level (a fine, **resting** shadow: 1–3px) isn't covered by any of the three
existing shadow tokens (`header` = fixed header, `raised` = menus/popovers at 4/16px,
`card-hover` = brand-tinted hover lift). It needed its own semantic token.

---

## Decision

1. **Add the semantic token** `shadow.card`:

   | Token | Value | Role |
   |-------|--------|------|
   | `semantic.shadow.card` | `0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)` | Resting card shadow — light elevation |

2. **Repoint the component token** `component.card.elevated.shadow`:
   the raw value becomes a **reference**, `{semantic.shadow.card}`.

> **Change in resolved value: NONE.** The final value is strictly identical
> (`var(--agtc-component-card-elevated-shadow)` → `var(--agtc-semantic-shadow-card)` →
> same `rgba`). A pure indirection refactor — **zero visual change**.

---

## Scope

| Included | Excluded |
|--------|-------|
| `semantic.shadow.card` (new); `component.card.elevated.shadow` → semantic reference | Any other shadow (already tokenized by ADR-046) |
| COMP mirror + the card doc's display line in `site/build.js` | Modifying the shadow value (unchanged) |

---

## Rejected alternatives

- **Reuse `shadow.raised` for the resting card**: `raised` (4/16px) is a stronger
  elevation (menus, popovers) — semantically and visually distinct from the card's resting
  shadow (1–3px). Reusing it would distort the intent and change the visual — rejected.
- **Leave the raw value in the component**: perpetuates the ADR-046 residual debt;
  contrary to the "never a raw value, always through a semantic" rule — rejected.

---

## Consequences

- **No more raw shadow** anywhere in the system: the ADR-046 shadow family is now
  complete and coherent (header, raised, card-hover, card). Build: **663 defined · 178
  referenced · 0 phantom**.
- `component.card.elevated` now consumes a named intent, consistent with the
  three-level architecture (primitive → semantic → component).
- Governance: 1 semantic token added (Design System Lead) + 1 component token repointed
  (Principal Designer). No primitive modified. Resolved value unchanged.

<!-- FR -->

# ADR-049 — Ombre de carte au repos tokenisée : `semantic.shadow.card`

> **Date :** 2026-06-05
> **Statut :** ✅ Actif
> **Décideurs :** Principal Designer (jeton de composant) · Design System Lead (jeton sémantique)
> **Type:** contract
> **Chemin logique:** decisions/ADR-049-card-shadow-token.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/component.json, decisions/ADR-046-inverse-surfaces-shadows-tokens.md, site/build.js

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
