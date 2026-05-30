# ADR-026 — Stratégie de synchronisation Figma pour les palettes de marque custom

> **Date :** 2026-05-29
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-026-sync-figma-palettes-custom.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** decisions/ADR-011-tokens-studio.md, decisions/ADR-024-brand-palette-teal-accent-secondary.md, tokens/primitives.json, tokens/semantic.json

---

## Contexte

ADR-024 a introduit deux palettes de marque custom (`accent` rose-corail et `secondary` bordeaux) dans `tokens/primitives.json`. Contrairement aux palettes Radix UI déjà présentes (Teal, Blue, Red, etc.), ces palettes :

1. **Ne sont pas dans Figma Community** — Tokens Studio ne peut pas les importer depuis un fichier partagé officiel
2. **N'ont pas de documentation de référence externe** — les utilisateurs doivent comprendre chaque step depuis le JSON seul
3. **Peuvent évoluer** — les valeurs hex sont décisions de design, pas des constantes issues d'un système tiers

La question soulevée dans la dette d'ADR-024 :

> Comment les palettes custom sont-elles synchronisées avec Figma de manière fiable, gouvernée, et sans créer une seconde source de vérité ?

---

## Décision

### Principe : même pipeline que les palettes Radix

Les palettes custom (`accent`, `secondary`) sont traitées **exactement comme les palettes Radix** dans le pipeline de sync. Il n'existe pas de processus spécial pour elles.

```
tokens/primitives.json
  ↓ (Tokens Studio lit ce fichier)
Variables Figma — Collection "Primitives"
  ↓ (les designers utilisent via semantic tokens)
Variables Figma — Collection "Semantic" + "Component"
```

Tokens Studio ne fait pas de distinction entre une palette Radix et une palette custom — il lit le JSON et mappe les tokens à des Variables Figma selon la structure du fichier.

---

### Configuration Tokens Studio

**Collection Figma cible** : `Primitives` (même collection que `primitive.color.teal`, `primitive.color.blue`, etc.)

**Nommage automatique dans Figma** :
- `primitive/color/accent/1` → variable Figma `accent/1`
- `primitive/color/accent/9` → variable Figma `accent/9`
- `primitive/color/secondary/9` → variable Figma `secondary/9`
- etc.

Les tokens `_readme` (type `other`) sont ignorés par Tokens Studio à l'import — ils ne génèrent pas de variables Figma. Ils servent exclusivement à la documentation du JSON pour les agents et développeurs.

**Import order** (inchangé depuis ADR-011) :
1. `primitives.json` → Collection `Primitives`
2. `semantic.json` → Collection `Semantic`
3. `component.json` → Collection `Component`

---

### Quand les valeurs custom changent

Toute modification des valeurs hex d'une palette custom suit le processus standard :

1. Ouvrir une PR de type `token(primitives)` sur une branche `token/brand-palette-update`
2. Modifier les valeurs dans `tokens/primitives.json`
3. Approbation obligatoire du **Principal Designer** (règle gouvernance ADR-001, ADR-004)
4. Merge → le pipeline de sync Tokens Studio détecte le changement au prochain pull depuis Figma

Les designers **ne modifient pas** les valeurs directement dans Figma. Si une teinte ne convient pas, ils ouvrent une issue / soumettent une PR — pas une modification locale de variable Figma.

---

### Documentation des steps dans Figma

Les descriptions des variables Figma (champ `description` dans Tokens Studio) sont renseignées depuis le champ `$description` de chaque token JSON. Les designers voient directement dans le panneau Figma :

| Variable Figma | Description automatique |
|---------------|------------------------|
| `accent/9`    | Solid background — brand accent / CTA secondaire |
| `accent/11`   | Texte accent — 7.1:1 sur blanc (WCAG AA+AAA) |
| `secondary/9` | Solid dark background — 12.2:1 avec texte blanc |
| `secondary/12`| High-contrast text — 13.8:1 sur blanc (WCAG AAA) |

La règle d'usage par step (héritée de la convention Radix — steps 1-2 fonds, 9-10 solides, 11-12 texte) s'applique aux palettes custom. Elle est documentée dans le champ `_readme` de chaque palette dans `primitives.json`.

---

### Validation après sync

Après chaque mise à jour de palette custom dans Figma, le Principal Designer valide :

- [ ] Les 12 steps de chaque palette apparaissent dans la collection `Primitives`
- [ ] Les tokens sémantiques `semantic/color/brand/*` résolvent correctement les alias
- [ ] Aucune variable Figma orpheline (alias cassé) dans les collections `Semantic` ou `Component`
- [ ] Les descriptions de variables correspondent aux `$description` du JSON

---

### Ce qu'un agent peut faire

```
✅ Modifier les valeurs hex dans tokens/primitives.json via PR
✅ Ajouter un nouveau step intermédiaire (ex: accent/9-5) si justifié
✅ Mettre à jour les $description pour améliorer la documentation Figma
❌ Modifier les variables Figma directement (jamais — direction JSON → Figma)
❌ Créer une nouvelle palette sans ADR et sans approbation Principal Designer
```

---

## Argumentaire

### Pourquoi ne pas créer une collection Figma séparée pour les palettes custom ?

Une collection `Brand` séparée des `Primitives` :
- Introduit une asymétrie dans la structure Figma vs la structure JSON (où tout est dans `primitives.json`)
- Complique les règles d'import Tokens Studio (ordre, résolution des alias)
- Ne bénéficie pas aux agents — qui travaillent sur le JSON, pas sur Figma

Garder tout dans la collection `Primitives` préserve la cohérence entre JSON et Figma.

### Pourquoi les `_readme` ne créent-ils pas de variables Figma ?

Tokens Studio ignore les tokens de type `other` à l'import des variables (ils ne sont pas des valeurs de design — pas de `$value` utile). Ce comportement est documenté et intentionnel. Les `_readme` sont un pattern de documentation interne au JSON.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Créer les palettes custom manuellement dans Figma** | Crée une seconde source de vérité hors du repo. Dérive garantie à la prochaine mise à jour. |
| **Héberger les palettes custom dans un fichier JSON séparé** | Fragmente `primitives.json` sans bénéfice — Tokens Studio peut gérer un seul fichier pour tous les primitifs. |
| **Utiliser des Figma Styles (pas des Variables)** | Les Figma Styles ne supportent pas les alias/références — les tokens sémantiques ne pourraient pas pointer vers les primitifs. Variables Figma est le bon mécanisme. |
| **Attendre un fork Radix** | Les couleurs custom ne correspondent à aucune palette Radix existante. Attendre une hypothétique palette Radix similaire n'est pas actionnable. |

---

## Conséquences

**Immédiates :**
- Les palettes `accent` et `secondary` sont disponibles dans Figma au prochain pull Tokens Studio depuis le repo
- Aucune configuration supplémentaire requise — elles apparaissent automatiquement dans la collection `Primitives`

**Pour les designers :**
- Même workflow que pour les palettes Radix — rien à apprendre de nouveau
- Les descriptions de step sont visibles directement dans le panneau Variables Figma
- Toute demande de modification de teinte passe par une PR, pas par une modification Figma locale

**Pour les agents IA :**
- Les agents continuent de travailler exclusivement sur les fichiers JSON
- La sync Figma est transparente pour les agents — elle ne change pas les règles d'usage des tokens

**Pour la gouvernance :**
- Une palette custom sans ADR = dérive — l'audit-tokens.js peut détecter des tokens sans documentation associée
- Toute nouvelle palette custom déclenche la création d'un ADR + approbation Principal Designer

**Dette soldée :**
- La dette documentée dans ADR-024 ("un ADR séparé devra documenter la stratégie de sync Figma pour les palettes custom") est soldée par cet ADR.
