# ADR-018 — Migration des références sémantiques vers la notation Radix

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** token
> **Chemin logique:** decisions/ADR-018-migration-references-primitives-radix.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/primitives.json, site/build.js, decisions/ADR-008-radix-colors.md, decisions/ADR-017-correction-contraste-text-disabled.md

---

## Contexte

ADR-017 documentait une incohérence structurelle entre `tokens/semantic.json` et
`tokens/primitives.json` comme hors scope. Cet ADR la résout.

### L'incohérence

`tokens/semantic.json` utilisait une notation Tailwind-like pour référencer les primitives :

```json
"primary": { "value": "{color.blue.700}" }
```

Mais `tokens/primitives.json` expose les couleurs sous un chemin Radix incompatible :

```
primitive.color.blue.11  (pas color.blue.700)
```

Les références dans `semantic.json` ne se résolvaient donc dans aucun token resolver
standard (Style Dictionary, Tokens Studio). `site/build.js` contournait ce problème
en hardcodant toutes les valeurs résolues dans un objet `SEM`.

### Les trois cas sans équivalent Radix

En établissant la table de correspondance, trois valeurs n'ont pas d'équivalent exact
dans l'échelle Radix gray (steps 1–12) :

| Valeur | Usage | Situation |
|--------|-------|-----------|
| `#ffffff` | Surface, texte sur action | Radix ne fournit que `rgba(255,255,255,1.00)` |
| `#fafafa` | Fond au survol | Radix gray.2 = `#f9f9f9` ≠ #fafafa |
| `#767676` | Texte désactivé | Entre gray.10 (#838383) et gray.11 (#646464) |

---

## Décision

### 1. Ajout d'une palette `neutral` dans `primitives.json`

Ajout de trois entrées sous `primitive.color.neutral` :

| Step | Valeur | Justification |
|------|--------|---------------|
| `neutral.0` | `#ffffff` | Blanc pur — plus explicite que `rgba(255,255,255,1.00)` de `white.1` |
| `neutral.50` | `#fafafa` | Tailwind neutral.50 — 1 cran plus clair que Radix gray.2 (#f9f9f9) |
| `neutral.500` | `#767676` | Texte désactivé accessible (4.54:1 sur blanc, WCAG AA) — voir ADR-017 |

Ces trois valeurs sont les seules qui ne peuvent pas être directement référencées
depuis l'échelle gray Radix existante. Toutes les autres valeurs neutres utilisées
dans `semantic.json` résolvent vers des steps gray Radix exacts.

### 2. Migration de `semantic.json` — notation `{primitive.color.X.Y}`

Toutes les références couleur de `semantic.json` migrent vers la notation Radix :

| Ancienne référence | Nouvelle référence | Valeur résolue |
|--------------------|--------------------|----------------|
| `{color.blue.700}` | `{primitive.color.blue.11}` | #0d74ce |
| `{color.blue.900}` | `{primitive.color.blue.12}` | #113264 |
| `{color.neutral.300}` | `{primitive.color.gray.6}` | #d9d9d9 |
| `{color.red.700}` | `{primitive.color.red.11}` | #ce2c31 |
| `{color.red.100}` | `{primitive.color.red.3}` | #feebec |
| `{color.green.700}` | `{primitive.color.green.11}` | #18794e |
| `{color.neutral.50}` (page) | `{primitive.color.gray.1}` | #fcfcfc |
| `{color.neutral.0}` | `{primitive.color.neutral.0}` | #ffffff |
| `{color.neutral.100}` | `{primitive.color.gray.3}` | #f0f0f0 |
| `{color.neutral.50}` (hover) | `{primitive.color.neutral.50}` | #fafafa |
| `{color.neutral.900}` | `{primitive.color.gray.12}` | #202020 |
| `{color.neutral.700}` | `{primitive.color.gray.11}` | #646464 |
| `{color.neutral.500}` | `{primitive.color.neutral.500}` | #767676 |
| `{color.neutral.200}` | `{primitive.color.gray.4}` | #e8e8e8 |

Aucune valeur résolue ne change — la migration est purement structurelle.

### 3. Correction du commentaire dans `site/build.js`

Le commentaire décrivant la notation Tailwind-like est mis à jour pour refléter
la notation Radix. Les valeurs hardcodées dans l'objet `SEM` restent inchangées
(résolution dynamique hors scope — voir section *Alternatives rejetées*).

---

## Hors scope — tokens non-couleur

`semantic.json` contient aussi des références non-couleur (`{space.4}`, `{fontSize.md}`,
`{radius.sm}`, etc.) qui ne se résolvent pas dans `primitives.json` (lequel ne contient
que des couleurs). Ces références constituent une seconde incohérence structurelle,
distincte de l'incohérence Tailwind/Radix.

Elles ne sont pas traitées dans cet ADR :
- Elles n'ont pas d'impact sur l'accessibilité ou la conformité
- Leur correction nécessite d'ajouter des primitives d'espacement, typographie et rayon
- Un ADR dédié (ADR-019) est à créer si le projet évolue vers une résolution dynamique

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Ajouter une échelle `neutral` complète (0–900) dans primitives.json** | Crée des doublons avec l'échelle gray existante pour la plupart des steps. Seuls 3 steps manquent — inutile d'en ajouter 8. |
| **Garder la notation Tailwind-like et ajouter un alias `color.X.Y` dans primitives.json** | Introduit une couche d'indirection supplémentaire. Les références Tailwind (`blue.700`) n'ont pas de sens sémantique dans un contexte Radix. |
| **Migrer build.js pour résoudre dynamiquement les tokens** | Changement de périmètre significatif — le script devrait implémenter un résolveur de références DTCG. Valeur ajoutée limitée tant que le projet n'utilise pas Style Dictionary ou Tokens Studio en production. |
| **Utiliser `{primitive.color.white.1}` (rgba) pour le blanc** | La notation rgba crée une ambiguïté de format dans les outils qui attendent du hex. `neutral.0 = #ffffff` est plus interopérable. |
| **Accepter gray.2 (#f9f9f9) pour le fond de survol à la place de #fafafa** | Introduit un changement visuel non requis (même infime). La valeur #fafafa est intentionnelle — elle correspond à Tailwind neutral.50 et différencie clairement le fond de survol du fond de page. |

---

## Conséquences

**Aucun changement visuel** — toutes les valeurs résolues restent identiques.

**Pour les token resolvers (Style Dictionary, Tokens Studio) :**
- Les références `{primitive.color.X.Y}` se résolvent maintenant correctement
- Le pipeline de compilation tokens peut être activé sans modification manuelle

**Pour les agents IA :**
- Un agent lisant `semantic.json` peut tracer chaque token jusqu'à sa valeur primitive
  via une référence non ambiguë
- Plus de dépendance à un mapping implicite Tailwind→Radix

**Dette technique restante :**
- `site/build.js` hardcode toujours les valeurs résolues dans l'objet `SEM`
- Les tokens non-couleur dans `semantic.json` référencent des primitives inexistantes
- Ces deux points sont documentés mais non bloquants pour le fonctionnement actuel du site

---

## Table de correspondance complète Tailwind→Radix

Pour référence, la table complète des équivalences utilisées dans ce projet :

| Notation Tailwind (ancienne) | Notation Radix (nouvelle) | Valeur hex |
|------------------------------|--------------------------|------------|
| `neutral.0` | `neutral.0` (custom) | #ffffff |
| `neutral.50` (page) | `gray.1` | #fcfcfc |
| `neutral.50` (hover) | `neutral.50` (custom) | #fafafa |
| `neutral.100` | `gray.3` | #f0f0f0 |
| `neutral.200` | `gray.4` | #e8e8e8 |
| `neutral.300` | `gray.6` | #d9d9d9 |
| `neutral.500` | `neutral.500` (custom) | #767676 |
| `neutral.700` | `gray.11` | #646464 |
| `neutral.900` | `gray.12` | #202020 |
| `blue.700` | `blue.11` | #0d74ce |
| `blue.900` | `blue.12` | #113264 |
| `red.100` | `red.3` | #feebec |
| `red.700` | `red.11` | #ce2c31 |
| `green.700` | `green.11` | #18794e |
