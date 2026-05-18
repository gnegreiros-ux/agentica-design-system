# Skill : codebase-index

> Capacité réutilisable : indexer et cartographier le système de design.
> Permet de connaître l'état complet du système à tout moment.

---

## Objectif

Maintenir une carte à jour du système : quels composants existent,
quelles sont leurs dépendances, quels tokens ils consomment,
et où se trouvent les dérives.

---

## Index des composants

### Processus de génération

```
Pour chaque composant dans guidelines/components/ :
  1. Lire le fichier .md (contrat)
  2. Lire le token dans tokens/component.json
  3. Identifier les dépendances (tokens sémantiques utilisés)
  4. Identifier les composants qui l'utilisent (consumers)
  5. Calculer le score de complétude (voir skill ai-component-metadata)
```

### Format de l'index

```markdown
## Index des composants — [DATE]

| Composant | Variantes | Tokens | Score | Storybook |
|-----------|-----------|--------|-------|-----------|
| button    | 4         | 18     | 100%  | ✅ |
| input     | 3         | 12     | 70%   | ✅ |
| modal     | 2         | 8      | 40%   | 🟡 |
| badge     | 4         | 6      | 90%   | ✅ |
```

---

## Graphe de relations

### Dépendances descendantes (composant → tokens)

```
button.primary
  └── semantic.color.action.primary
        └── primitive.color.blue.700
  └── semantic.radius.control
        └── primitive.radius.md
  └── semantic.space.control.padding-x
        └── primitive.space.4
```

### Dépendances ascendantes (token → composants)

```
semantic.color.action.primary
  ├── component.button.primary
  ├── component.button.secondary (text)
  └── component.input.default (border-focus)
```

Ce graphe permet : si on modifie `primitive.color.blue.700`,
de savoir immédiatement quels composants sont impactés.

---

## Détection de dérives

### Tokens orphelins
Tokens définis dans `component.json` mais jamais utilisés dans le code.

### Tokens fantômes
Tokens utilisés dans le code mais non définis dans les JSON.

### Composants sans contrat
Composants dans le code sans fichier `.md` correspondant dans `guidelines/`.

### Instances détachées (Figma)
Composants Figma dont les propriétés ont été surchargées localement.

---

## Rapport d'état du système

Format de sortie pour le dashboard Observatory :

```json
{
  "generatedAt": "2026-05-18T10:00:00Z",
  "components": {
    "total": 12,
    "agentReady": 8,
    "partial": 3,
    "notReady": 1
  },
  "tokens": {
    "primitives": 45,
    "semantic": 38,
    "component": 67,
    "orphaned": 2,
    "phantom": 0
  },
  "accessibility": {
    "violations": 0,
    "warnings": 3
  },
  "drift": {
    "hardcodedValues": 4,
    "deprecatedTokens": 1,
    "detachedInstances": 7
  }
}
```

---

## Fréquence recommandée

| Type d'index | Fréquence | Déclencheur |
|-------------|-----------|-------------|
| Index complet | Hebdomadaire | Cron ou manuel |
| Détection de dérives | À chaque PR | CI/CD |
| Rapport Observatory | Quotidien | Cron |
| Graphe de relations | À chaque ajout de token | CI/CD |
