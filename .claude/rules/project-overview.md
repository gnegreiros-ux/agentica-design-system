# Rule : project-overview

> Contexte général du projet — à lire en premier pour tout agent travaillant dans ce dépôt.
> **Type:** rule
> **Chemin logique:** .claude/rules/project-overview.md
> **Lecture avant:** AGENTS.md, DESIGN.md
> **Relations:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/instructions/codebase-context.md

---

## Ce qu'est ce projet

Ce dépôt contient un **système de design agentique** : un système de design conçu pour être compris et utilisé à la fois par des humains et par des agents IA.

Il encode les décisions d'interface sous forme de tokens structurés, de contrats de composants et de règles lisibles par machine — afin que les agents puissent appliquer correctement les décisions définies par les équipes, sans improviser.

---

## Principe fondamental

> **Le dernier mot est toujours humain.**

Les agents observent, analysent, proposent. Les humains approuvent, décident, déploient.

---

## Ce que ce système n'est PAS

- ❌ Un système autonome qui s'administre lui-même
- ❌ Un système qui remplace les designers
- ❌ Un système décisionnel — les agents appliquent des règles humaines
- ❌ Un projet purement technologique — c'est avant tout de la gouvernance

---

## Éléments clés

| Élément | Rôle |
|---------|------|
| `DESIGN.md` | Contrat portable de la marque — lisible humain + agent |
| `AGENTS.md` | Routeur d'agents — première lecture obligatoire |
| `tokens/` | Trois niveaux : primitif → sémantique → composant |
| `.claude/rules/` | Contraintes et décisions du projet |
| `.claude/instructions/` | Méthodologie d'orchestration |
| `.claude/skills/` | Capacités exécutables réutilisables |
| `guidelines/` | Documentation composants et fondations |

---

## Valeurs non négociables

1. **Souveraineté numérique** — Les données, décisions et outils restent sous contrôle organisationnel.
2. **Accessibilité** — WCAG 2.1 AA minimum. Non contournable.
3. **Auditabilité** — Toute décision est traçable, versionnée, justifiée.
4. **Auto-guérison encadrée** — Les dérives sont détectées automatiquement, corrigées avec approbation humaine.

---

## Gestion de projet

Le suivi de tâches (statuts, backlog, dépendances) vit exclusivement dans
[GitHub Projects](https://github.com/users/gnegreiros-ux/projects/1) — jamais dans un
fichier versionné du dépôt. Ne pas recréer de fichier de log/journal local pour cet usage
(voir [ADR-069](../../decisions/ADR-069-migration-suivi-projet-github-projects.md), qui
remplace [ADR-016](../../decisions/ADR-016-journal-construction.md)).

Le changelog public (documentation des versions livrées, `site/dist/changelog.html`) reste
dans le dépôt et est distinct de la gestion de projet — il n'est pas concerné par cette règle.
