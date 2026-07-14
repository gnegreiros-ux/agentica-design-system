# ADR-027 — Pre-commit impact pipeline with human approval

> **Date:** 2026-05-30
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-027-pipeline-impact-pre-commit.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/post-change-pipeline.md, .claude/skills/post-change-pipeline.md, .claude/rules/git-workflow.md, log/kit-construction.md

---

## Context

During the earliest work sessions with AI agents on this repository, a problematic pattern was observed: agents were committing changes without proposing the necessary collateral updates (kit log, site rebuild, ADR). The human had to systematically request these updates afterward, creating:

- An inconsistent git history (changes and their consequences split across separate commits)
- An incomplete kit log, or one updated from memory (rather than in real time)
- Missed site rebuilds after modifying `build.js` or the tokens
- Weakened governance: the human did not know what they were implicitly approving

This project rests on a foundational principle: **the human always has the final word**. This principle requires an operational mechanism — not merely a stated intention.

---

## Decision

### Mandatory pre-commit pipeline

Any agent working on this repository must, after every modification and before any commit, execute the following pipeline:

**Step 1 — Impact analysis**
Identify the modified files via `git diff --name-only` and apply the impact matrix defined in `.claude/skills/post-change-pipeline.md`.

**Step 2 — Structured report**
Present the human with a report of proposed updates as a checklist, spelling out the reasoning for each item.

**Step 3 — Wait for approval**
Execute nothing before an explicit response from the human. Absence of a response is not approval.

**Step 4 — Ordered execution**
Execute only the approved tasks, in order: tokens → site rebuild → log → ADRs → commit.

### Impact matrix

| Modified files | Updates evaluated |
|---|---|
| `tokens/primitives.json` | Site rebuild, log, ADR if a new token |
| `tokens/semantic.json` | Site rebuild, log, `tokens.css` |
| `tokens/component.json` | Site rebuild, log, **Principal Designer approval** |
| `site/build.js` | Site rebuild |
| `guidelines/`, `components/` | Site rebuild, log |
| `decisions/ADR-*.md` | Site rebuild (ADR page), log |
| `.claude/rules/`, `.claude/skills/` | Log, ADR if an architectural decision |
| Any change | Kit log (always) |

### Intelligent detection

The pipeline proposes only the relevant updates based on the files actually modified — not a systematic exhaustive checklist. The goal is to minimize friction while guaranteeing completeness.

---

## Rationale

### Why an explicit pipeline rather than a git hook?

A pre-commit hook runs with no human context — it can reject a commit but cannot propose alternative updates or wait for approval. The agent-human pipeline is intentionally conversational: it submits a report, waits for a decision, then executes.

### Why detect impact from modified files?

A static checklist (always check everything) creates decision fatigue. Detection via `git diff` proposes only what is actually relevant, making every impact report meaningful and actionable.

### Why is the execution order prescribed?

The tokens → site → log → ADR → commit order guarantees that each artifact is produced before being referenced in the next. A log updated before the rebuild would contain a state that does not yet exist on disk.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **Automatic pre-commit hook** | No human feedback loop — violates the "the human has the final word" principle |
| **Exhaustive checklist on every commit** | Decision fatigue, items irrelevant to the actual changes |
| **Trust the agent to decide alone** | Inconsistent git history observed in practice during the earliest sessions |
| **Update the log after the commit** | Log decoupled from the change — unreliable history |

---

## Consequences

**For agents:**
- Read `.claude/rules/post-change-pipeline.md` before any commit
- Execute `.claude/skills/post-change-pipeline.md` after every modification
- Never commit without an approved report

**For the human:**
- Receive a structured report before every commit
- Approve or amend the list of proposed updates
- Retain control over what enters the git history

**For the project:**
- Consistent git history: every commit is complete and self-sufficient
- Kit log faithful to the actual state of the repository
- Operational governance, not merely declarative

<!-- FR -->

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
