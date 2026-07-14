# ADR-020 — 4px grid as the systemic dimensional scale

> **Date:** 2026-05-29
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-020-grille-4px.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/spacing.md

---

## Context

The project had used 4 primitive spacing values from the outset (8, 16, 20, 32 px) —
all multiples of 4 — without this decision being formally documented or the full
scale defined. This ADR formalizes the implicit decision and completes the scale.

### Situation before

```json
"space": {
  "2": "8px",
  "4": "16px",
  "5": "20px",
  "8": "32px"
}
```

Only four values, named by their multiplier without the base module (4px) being
explicitly declared. Any new spacing value required an ad hoc decision with no
normative reference.

---

## Decision

### Base module: 4px

Every dimensional value in the system is a multiple of 4px. This module is the
smallest allowed increment.

```
1 unit = 4px
```

### Full spacing primitive scale

| Token | Value | Multiplier | Typical usage |
|-------|--------|----------------|-----------|
| `primitive.space.1`  | 4px  | 4 × 1  | Micro — separator, minimal internal gap |
| `primitive.space.2`  | 8px  | 4 × 2  | Small — vertical control padding |
| `primitive.space.3`  | 12px | 4 × 3  | Intermediate |
| `primitive.space.4`  | 16px | 4 × 4  | Standard — horizontal control padding |
| `primitive.space.5`  | 20px | 4 × 5  | Medium |
| `primitive.space.6`  | 24px | 4 × 6  | Large intermediate |
| `primitive.space.8`  | 32px | 4 × 8  | Large — separation between components |
| `primitive.space.10` | 40px | 4 × 10 | Very large |
| `primitive.space.12` | 48px | 4 × 12 | Macro |
| `primitive.space.16` | 64px | 4 × 16 | Macro — separation between page sections |

The 4 existing values (2, 4, 5, 8) remain unchanged — full backward compatibility.

### Extension rule

If a new spacing value is required, it must be a multiple of 4. If the value
doesn't exist in the primitive scale, create the missing token rather than use
an arbitrary value.

---

## Rationale

### Why 4px?

**Industry convergence:** Material Design (Google), Polaris (Shopify), Atlassian
Design System, Carbon (IBM), Spectrum (Adobe) — all use a 4px or 8px grid (8px
being simply a subset of 4px at double spacing).

**Natural alignment:** High-density screens (2×, 3×) divide whole pixels into
sub-pixels. A 4px grid guarantees that every value stays a whole number at every
display density.

**Decision consistency:** With a 4px grid, designers and agents don't have to
arbitrate between close values (14px vs 16px). The grid decides: it's 12px or
16px, not 14px.

**Automated audit:** audit-tokens.js can detect any spacing value that isn't a
multiple of 4 and flag it as drift.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **8px grid** | Too coarse for micro-spacing (a badge's internal gap, a tag's padding). 4px offers more flexibility without chaos. |
| **Fibonacci scale (4, 8, 12, 20, 32...)** | Memorization complexity with no demonstrable visual benefit for this project. |
| **T-shirt scale (xs/sm/md/lg/xl)** | Opaque to agents — `space.4` (16px, 4×4) is more traceable than `space.md` (an arbitrary value). |
| **Keep the 4 existing values** | Insufficient: teams create ad hoc values outside the grid as soon as a step is missing. |

---

## Consequences

**For tokens:**
- `primitive.space` goes from 4 to 10 values
- All existing semantic references remain valid (no path changes)
- 6 new primitives available for future semantic tokens

**For AI agents:**
- Any spacing request can be resolved by referencing the scale
- Drift (hardcoded px, off-grid values) is detectable by audit

**For teams:**
- Memorable rule: "if it's not in the table, it's not in the system"
- Spacing decisions are reduced to picking a step, not a value

**Debt cleared:**
- The implicit decision to use a 4px grid is now formalized and traceable

<!-- FR -->

# ADR-020 — Grille 4px comme échelle dimensionnelle systémique

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-020-grille-4px.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/spacing.md

---

## Contexte

Le projet utilisait depuis l'origine 4 valeurs d'espacement primitives (8, 16, 20, 32 px) — toutes des multiples de 4 — sans que cette décision soit formellement documentée ni l'échelle complète définie. Cette ADR formalise la décision implicite et complète l'échelle.

### Situation avant

```json
"space": {
  "2": "8px",
  "4": "16px",
  "5": "20px",
  "8": "32px"
}
```

Quatre valeurs seulement, nommées par leur multiplicateur sans que le module de base (4px) soit explicitement déclaré. Toute nouvelle valeur d'espacement nécessitait une décision ad hoc sans référence normative.

---

## Décision

### Module de base : 4px

Toute valeur dimensionnelle du système est un multiple de 4px. Ce module est le plus petit incrément autorisé.

```
1 unité = 4px
```

### Échelle complète des primitives d'espacement

| Token | Valeur | Multiplicateur | Usage type |
|-------|--------|----------------|-----------|
| `primitive.space.1`  | 4px  | 4 × 1  | Micro — séparateur, gap interne minimal |
| `primitive.space.2`  | 8px  | 4 × 2  | Petit — padding contrôle vertical |
| `primitive.space.3`  | 12px | 4 × 3  | Intermédiaire |
| `primitive.space.4`  | 16px | 4 × 4  | Standard — padding contrôle horizontal |
| `primitive.space.5`  | 20px | 4 × 5  | Moyen |
| `primitive.space.6`  | 24px | 4 × 6  | Intermédiaire large |
| `primitive.space.8`  | 32px | 4 × 8  | Grand — séparation entre composants |
| `primitive.space.10` | 40px | 4 × 10 | Très grand |
| `primitive.space.12` | 48px | 4 × 12 | Macro |
| `primitive.space.16` | 64px | 4 × 16 | Macro — séparation entre sections de page |

Les 4 valeurs existantes (2, 4, 5, 8) restent inchangées — rétrocompatibilité totale.

### Règle d'extension

Si une nouvelle valeur d'espacement est requise, elle doit être un multiple de 4. Si la valeur n'existe pas dans l'échelle primitive, créer le token manquant plutôt qu'utiliser une valeur arbitraire.

---

## Argumentaire

### Pourquoi 4px ?

**Convergence sectorielle :** Material Design (Google), Polaris (Shopify), Atlassian Design System, Carbon (IBM), Spectrum (Adobe) — tous utilisent une grille 4px ou 8px (8px étant simplement un sous-ensemble de 4px à double espacement).

**Alignement naturel :** Les écrans à haute densité (2×, 3×) divisent les pixels entiers en sous-pixels. Une grille de 4px garantit que toutes les valeurs restent des entiers à toutes les densités d'affichage.

**Cohérence décisionnelle :** Avec une grille de 4px, les designers et agents n'ont pas à arbitrer entre des valeurs proches (14px vs 16px). La grille tranche : c'est 12px ou 16px, pas 14px.

**Audit automatisé :** L'audit-tokens.js peut détecter toute valeur d'espacement qui n'est pas un multiple de 4 et la signaler comme dérive.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Grille 8px** | Trop granulaire pour les micro-espacements (gap interne d'un badge, padding de tag). 4px offre plus de flexibilité sans chaos. |
| **Échelle de Fibonacci (4, 8, 12, 20, 32...)** | Complexité mémorielle sans bénéfice visuel démontrable pour ce projet. |
| **Scale T-shirt (xs/sm/md/lg/xl)** | Opaque pour les agents — `space.4` (16px, 4×4) est plus traçable que `space.md` (valeur arbitraire). |
| **Garder les 4 valeurs existantes** | Insuffisant : les équipes créent des valeurs ad hoc hors grille dès qu'un échelon manque. |

---

## Conséquences

**Pour les tokens :**
- `primitive.space` passe de 4 à 10 valeurs
- Toutes les références sémantiques existantes restent valides (aucun chemin ne change)
- 6 nouveaux primitifs disponibles pour les futurs tokens sémantiques

**Pour les agents IA :**
- Toute demande d'espacement peut être résolue par référence à l'échelle
- Les dérives (px en dur, valeurs hors-grille) sont détectables par audit

**Pour les équipes :**
- Règle mémorisable : « si ça n'est pas dans la table, ce n'est pas dans le système »
- Les décisions d'espacement se réduisent à choisir un échelon, pas une valeur

**Dette soldée :**
- La décision implicite d'utiliser une grille 4px est maintenant formalisée et traçable
