# AGENTS.md — Routeur d'agents

> Ce fichier est le point d'entrée pour tout agent IA qui interagit avec ce système de design.
> Lire ce fichier en premier. Toujours.
> **Type:** instruction
> **Chemin logique:** AGENTS.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** DESIGN.md
> **Relations:** DESIGN.md, .claude/rules/project-overview.md, .claude/instructions/codebase-context.md, How-to-sans-agents.md (fallback si agents indisponibles)

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
.claude/rules/ux-patterns-sources.md   ← sources + revue patterns UX (avant tout composant)
.claude/rules/figma-components.md      ← règles Figma (propriétés, auto-layout, nommage, API)
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

---

## Suivi de projet et documentation des décisions

### Gestion de projet

Le suivi de tâches (statuts, backlog, priorités, dépendances) vit exclusivement dans
[GitHub Projects](https://github.com/users/gnegreiros-ux/projects/1) — jamais dans un
fichier versionné du dépôt. Voir `.claude/rules/project-overview.md` (ADR-069).

### Décisions architecturales (ADR)

Les décisions sont documentées dans `decisions/` (pas `docs/adr/`) — un fichier par ADR,
format `ADR-XXX-titre.md`. Lire les ADR qui touchent la zone sur laquelle tu travailles
avant toute action. Voir `.claude/skills/pipelines/adr-triggers.md` pour savoir quand en
créer un nouveau.

### Contexte de domaine

Pas de `CONTEXT.md` à la racine — le contexte du domaine vit dans `DESIGN.md` (contrat de
marque portable), `guidelines/` (fondations et composants) et les règles `.claude/rules/`.
