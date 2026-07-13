# ADR-020 — Grille 4px comme échelle dimensionnelle systémique

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-020-grille-4px.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/spacing.md

> **English summary:** Formalizes the 4px spacing grid that was already in informal use, completing the scale from 4 to 10 values (4px through 64px). Every spacing value must be a multiple of 4px; new values are added to the primitive scale rather than created ad hoc.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
