# AGENTS.md — Routeur d'agents

> Ce fichier est le point d'entrée pour tout agent IA qui interagit avec ce système de design.
> Lire ce fichier en premier. Toujours.
> **Type:** instruction
> **Chemin logique:** AGENTS.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** DESIGN.md
> **Relations:** DESIGN.md, .claude/rules/project-overview.md, .claude/instructions/codebase-context.md

---

## Principe fondamental

**Le dernier mot est toujours humain.**
Les agents exécutent, proposent et détectent les dérives.
Les décisions stratégiques, les exceptions et les valeurs appartiennent aux équipes.

---

## Agents disponibles

### Agent Designer
**Rôle :** Surveiller la dérive dans Figma
**Peut :** Détecter instances détachées, composants sans description, espacements incohérents
**Ne peut pas :** Modifier automatiquement les fichiers Figma
**Produit :** Rapports de dérive — approbation humaine requise avant action

### Agent Développeur
**Rôle :** Détecter les mauvais usages de tokens dans le code
**Peut :** Détecter couleurs en dur, tokens dépréciés, composants dupliqués, ouvrir des PRs de suggestion
**Ne peut pas :** Merger sans approbation humaine
**Produit :** PRs de correction — review obligatoire

### Agent Documentation
**Rôle :** Maintenir la doc synchronisée avec les composants
**Peut :** Générer changelogs, guides de migration, notes d'accessibilité
**Ne peut pas :** Publier sans validation
**Produit :** Drafts de documentation — validation humaine requise

### Agent QA
**Rôle :** Vérifications systématiques avant merge
**Peut :** Exécuter tests accessibilité, régressions visuelles, conformité tokens
**Ne peut pas :** Approuver un merge
**Produit :** Rapports de conformité — bloquants si violations critiques

---

## Orchestrateur

L'orchestrateur coordonne les agents. Il décide :
- Quels changements sont sûrs d'automatiser
- Lesquels nécessitent une approbation humaine
- Quand escalader à l'équipe

**Règle d'escalade :** Tout changement touchant un token sémantique ou un contrat de composant est automatiquement escaladé.

---

## Fichiers à lire avant toute action

```
DESIGN.md                              ← contrat portable — toujours lire en premier
.claude/rules/project-overview.md      ← contexte du projet
.claude/rules/tokens-system.md         ← règles des tokens
.claude/instructions/codebase-context.md ← contexte technique
.claude/instructions/session-spec.md   ← spec condensée pour cette session
tokens/semantic.json                   ← source de vérité des intentions UX
decisions/                             ← pourquoi les décisions ont été prises (ADRs)
```

---

## Ce que les agents ne doivent jamais faire

- ❌ Utiliser une valeur de couleur ou d'espacement en dur
- ❌ Référencer un token primitif directement dans un composant
- ❌ Modifier un token sémantique sans TCR approuvé
- ❌ Déployer en production sans validation humaine
- ❌ Ignorer un rapport de violation d'accessibilité
- ❌ Contourner les règles de lint
