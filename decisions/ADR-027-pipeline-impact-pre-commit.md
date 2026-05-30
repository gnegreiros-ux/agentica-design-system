# ADR-027 — Pipeline d'impact pré-commit avec approbation humaine

> **Date :** 2026-05-30
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Chemin logique:** decisions/ADR-027-pipeline-impact-pre-commit.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/post-change-pipeline.md, .claude/skills/post-change-pipeline.md, .claude/rules/git-workflow.md, log/kit-construction.md

---

## Contexte

Lors des premières sessions de travail avec des agents IA sur ce dépôt, un pattern problématique a été observé : les agents committaient des changements sans proposer les mises à jour collatérales nécessaires (log du kit, site rebuild, ADR). L'humain devait systématiquement demander ces mises à jour après coup, créant :

- Un historique git incohérent (modifications et leurs conséquences dans des commits séparés)
- Un log du kit incomplet ou mis à jour de mémoire (plutôt qu'en temps réel)
- Des oublis de rebuild site après modification de `build.js` ou des tokens
- Une gouvernance affaiblie : l'humain ne savait pas ce qu'il approuvait implicitement

Ce projet repose sur le principe fondamental : **le dernier mot est toujours humain**. Ce principe nécessite un mécanisme opérationnel — pas seulement une intention déclarée.

---

## Décision

### Pipeline obligatoire pré-commit

Tout agent travaillant sur ce dépôt doit, après chaque modification et avant tout commit, exécuter le pipeline suivant :

**Étape 1 — Analyse d'impact**
Identifier les fichiers modifiés via `git diff --name-only` et appliquer la matrice d'impact définie dans `.claude/skills/post-change-pipeline.md`.

**Étape 2 — Rapport structuré**
Présenter à l'humain un rapport avec les mises à jour proposées sous forme de checklist, en explicitant le raisonnement pour chaque item.

**Étape 3 — Attente d'approbation**
Ne rien exécuter avant une réponse explicite de l'humain. L'absence de réponse n'est pas une approbation.

**Étape 4 — Exécution ordonnée**
Exécuter uniquement les tâches approuvées, dans l'ordre : tokens → site rebuild → log → ADRs → commit.

### Matrice d'impact

| Fichiers modifiés | Mises à jour évaluées |
|---|---|
| `tokens/primitives.json` | Site rebuild, log, ADR si nouveau token |
| `tokens/semantic.json` | Site rebuild, log, `tokens.css` |
| `tokens/component.json` | Site rebuild, log, **approbation Principal Designer** |
| `site/build.js` | Site rebuild |
| `guidelines/`, `components/` | Site rebuild, log |
| `decisions/ADR-*.md` | Site rebuild (page ADR), log |
| `.claude/rules/`, `.claude/skills/` | Log, ADR si décision architecturale |
| Tout changement | Log du kit (toujours) |

### Détection intelligente

Le pipeline ne propose que les mises à jour pertinentes selon les fichiers réellement modifiés — pas une checklist exhaustive systématique. L'objectif est de minimiser la friction tout en garantissant la complétude.

---

## Argumentaire

### Pourquoi un pipeline explicite plutôt qu'un hook git ?

Un hook pre-commit s'exécute sans contexte humain — il peut rejeter un commit mais ne peut pas proposer des mises à jour alternatives ni attendre une approbation. Le pipeline agent-humain est intentionnellement conversationnel : il soumet un rapport, attend une décision, puis exécute.

### Pourquoi la détection d'impact par fichiers modifiés ?

Une checklist statique (toujours vérifier tout) crée de la fatigue décisionnelle. La détection par `git diff` ne propose que ce qui est réellement pertinent, rendant chaque rapport d'impact significatif et actionnable.

### Pourquoi l'ordre d'exécution est-il prescrit ?

L'ordre tokens → site → log → ADR → commit garantit que chaque artefact est produit avant d'être référencé dans le suivant. Un log mis à jour avant le rebuild contiendrait un état qui n'existe pas encore sur disque.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Hook pre-commit automatique** | Pas de boucle de rétroaction humaine — viole le principe "le dernier mot est humain" |
| **Checklist exhaustive à chaque commit** | Fatigue décisionnelle, items non pertinents selon les changements |
| **Confiance à l'agent pour décider seul** | Historique git incohérent observé en pratique lors des premières sessions |
| **Mise à jour du log après le commit** | Log découplé du changement — historique peu fiable |

---

## Conséquences

**Pour les agents :**
- Lire `.claude/rules/post-change-pipeline.md` avant tout commit
- Exécuter `.claude/skills/post-change-pipeline.md` après chaque modification
- Ne jamais commiter sans rapport approuvé

**Pour l'humain :**
- Recevoir un rapport structuré avant chaque commit
- Approuver ou modifier la liste des mises à jour proposées
- Garder le contrôle sur ce qui entre dans l'historique git

**Pour le projet :**
- Historique git cohérent : chaque commit est complet et auto-suffisant
- Log du kit fidèle à l'état réel du dépôt
- Gouvernance opérationnelle, pas seulement déclarative
