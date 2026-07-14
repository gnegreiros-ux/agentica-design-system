# ADR-016 — Automatic kit construction log

> **Date:** 2026-05-28
> **Status:** ⚠️ Superseded by [ADR-069](ADR-069-migration-suivi-projet-github-projects.md) (2026-07-09)
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-016-journal-construction.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** log/kit-construction.md (removed), .claude/hooks/log-kit-construction.sh (removed), .claude/settings.json, decisions/ADR-015-hook-rappel-adr.md, decisions/ADR-014-conventional-commits.md, decisions/ADR-069-migration-suivi-projet-github-projects.md

> **Deprecation note (2026-07-09):** the mechanism described below (file +
> `PostToolUse` hook) has been removed. Kit construction tracking now lives
> in GitHub Projects — see ADR-069. This document remains as the historical
> record of the original decision, in keeping with the rule "an ADR is never
> deleted."

---

## Context

An agentic design system accumulates two distinct categories of decisions:

1. **Design decisions** — which colors, which spacing, which variants.
   These decisions are tracked in `tokens/`, `guidelines/`, `components/`, and in the ADRs.

2. **Kit construction decisions** — how the system works as a tool: the rules
   for agents (`.claude/`), automation hooks, governance contracts
   (`decisions/`), root files (`AGENTS.md`, `DESIGN.md`).

The second category was invisible. Git commits capture the _what_, but not the
timeline of actions — when a hook was added, when a rule was modified, in what
order the kit was assembled. For an agent picking up work mid-construction,
this lack of a log makes reconstructing the context difficult.

The question was:

> **How do we make the construction of the kit itself observable, without
> depending on session memory or an exhaustive reading of the git history?**

---

## Decision

Set up an automatic construction log:

- **File**: `log/kit-construction.md` — a timestamped chronological table
- **Script**: `.claude/hooks/log-kit-construction.sh` — runs after every `Write` or `Edit`
- **Trigger**: files in `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md`
- **Mode**: asynchronous (`async: true`) — doesn't block the workflow

Entry format:

```
| 2026-05-28 16:34 | Created  | `decisions/ADR-015-hook-rappel-adr.md` |
| 2026-05-28 16:35 | Modified | `.claude/settings.json` |
```

The `Created` / `Modified` distinction is inferred from the tool called: `Write` = Created, `Edit` = Modified.

---

## Scope — what is logged and what isn't

| Area | Logged | Reason |
|------|--------|--------|
| `.claude/` | ✅ | Configuration, rules, hooks — kit construction |
| `decisions/` | ✅ | ADRs — architectural decisions about the kit |
| `AGENTS.md`, `DESIGN.md` | ✅ | Founding contracts of the kit |
| `tokens/` | ❌ | Design system content — out of scope |
| `guidelines/` | ❌ | Design system content — out of scope |
| `components/` | ❌ | Design system content — out of scope |
| `log/` | ❌ | The log doesn't log itself |

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Git log as the log** | `git log` lists commits, not individual actions. A session can produce dozens of edits between two commits. The log captures intra-commit granularity. |
| **Manual log** | Depends on human or agent discipline. A hook is structurally reliable — it runs regardless of who makes the modification. |
| **Log in a `.claude/` file (unversioned)** | An unversioned log isn't shareable and disappears if the folder is recreated. `log/kit-construction.md` is committed with the rest of the kit. |
| **Blocking (synchronous) hook** | Writing to a log file shouldn't slow down the workflow. `async: true` guarantees Claude doesn't wait for the script to finish. |
| **Rich entries (reason for change, author)** | A hook can't infer the intent behind a modification. Only observable facts (file, timestamp, tool) are recorded. The _why_ belongs to the ADRs and commit messages. |

---

## Consequences

**For AI agents:**
- An agent picking up a session can read `log/kit-construction.md` to
  understand what was recently done, without reconstructing the git history
- The log distinguishes kit construction (this file) from content modifications
  (tokens, guidelines) — two separate registers for two distinct types of activity

**For humans:**
- Immediate observability: `cat log/kit-construction.md` gives a readable timeline
- Retroactivity is possible: entries prior to the hook can be added manually or
  by an initialization agent

**Relation to ADR-015:**
- ADR-015 (ADR reminder hook) watches `tokens/`, `guidelines/`, `components/` — the content
- ADR-016 (this log) watches `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md` — the kit
- Both hooks coexist on the same `PostToolUse Write|Edit` event, without interference

**Accepted cost:**
- The project's absolute path is encoded in the script — must be adapted if the
  repo is moved
- The log grows indefinitely; annual or major-version rotation is worth
  considering

---

## Incidents or triggers

Observed while assembling the kit: after several work sessions, it was
difficult to answer "what was set up today?" without rereading the entire git
history. The automatic log makes this question trivial.

<!-- FR -->

# ADR-016 — Journal de construction automatique du kit

> **Date :** 2026-05-28
> **Statut :** ⚠️ Remplacé par [ADR-069](ADR-069-migration-suivi-projet-github-projects.md) (2026-07-09)
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-016-journal-construction.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** log/kit-construction.md (retiré), .claude/hooks/log-kit-construction.sh (retiré), .claude/settings.json, decisions/ADR-015-hook-rappel-adr.md, decisions/ADR-014-conventional-commits.md, decisions/ADR-069-migration-suivi-projet-github-projects.md

> **Note de dépréciation (2026-07-09) :** le mécanisme décrit ci-dessous (fichier +
> hook `PostToolUse`) a été retiré. Le suivi de la construction du kit vit désormais
> dans GitHub Projects — voir ADR-069. Ce document reste comme registre historique
> de la décision d'origine, conformément à la règle « un ADR ne se supprime jamais ».

---

## Contexte

Un système de design agentique accumule deux catégories de décisions distinctes :

1. **Les décisions de design** — quelles couleurs, quels espacements, quelles variantes.
   Ces décisions sont tracées dans `tokens/`, `guidelines/`, `components/`, et dans les ADR.

2. **Les décisions de construction du kit** — comment le système fonctionne en tant qu'outil :
   les règles pour les agents (`.claude/`), les hooks d'automatisation, les contrats
   de gouvernance (`decisions/`), les fichiers racines (`AGENTS.md`, `DESIGN.md`).

La seconde catégorie était invisible. Les commits git capturent le _quoi_, mais pas
la chronologie des actions — quand un hook a été ajouté, quand une règle a été modifiée,
dans quel ordre le kit a été assemblé. Pour un agent qui reprend le travail en milieu de
construction, cette absence de journal rend la reconstruction du contexte difficile.

La question posée était :

> **Comment rendre la construction du kit elle-même observable, sans dépendre
> de la mémoire de session ou de la lecture exhaustive de l'historique git ?**

---

## Décision

Mise en place d'un journal de construction automatique :

- **Fichier** : `log/kit-construction.md` — tableau chronologique horodaté
- **Script** : `.claude/hooks/log-kit-construction.sh` — s'exécute après chaque `Write` ou `Edit`
- **Déclenchement** : fichiers dans `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md`
- **Mode** : asynchrone (`async: true`) — ne bloque pas le flux de travail

Format d'une entrée :

```
| 2026-05-28 16:34 | Créé    | `decisions/ADR-015-hook-rappel-adr.md` |
| 2026-05-28 16:35 | Modifié | `.claude/settings.json` |
```

La distinction `Créé` / `Modifié` est inférée du tool appelé : `Write` = Créé, `Edit` = Modifié.

---

## Périmètre — ce qui est loggué et ce qui ne l'est pas

| Zone | Loggué | Raison |
|------|--------|--------|
| `.claude/` | ✅ | Configuration, règles, hooks — construction du kit |
| `decisions/` | ✅ | ADR — décisions architecturales du kit |
| `AGENTS.md`, `DESIGN.md` | ✅ | Contrats fondateurs du kit |
| `tokens/` | ❌ | Contenu du système de design — hors scope |
| `guidelines/` | ❌ | Contenu du système de design — hors scope |
| `components/` | ❌ | Contenu du système de design — hors scope |
| `log/` | ❌ | Le journal ne se logue pas lui-même |

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Git log comme journal** | `git log` liste les commits, pas les actions individuelles. Une session peut produire plusieurs dizaines d'éditions entre deux commits. Le journal capture la granularité intra-commit. |
| **Journal manuel** | Dépend de la discipline humaine ou de l'agent. Un hook est structurellement fiable — il s'exécute indépendamment de qui fait la modification. |
| **Log dans un fichier `.claude/` (non versionné)** | Un journal non versionné n'est pas partageable et disparaît si le dossier est recréé. `log/kit-construction.md` est commité avec le reste du kit. |
| **Hook bloquant (synchrone)** | L'écriture dans un fichier log ne doit pas ralentir le flux de travail. `async: true` garantit que Claude n'attend pas la fin du script. |
| **Entrées riches (motif du changement, auteur)** | Un hook ne peut pas inférer l'intention derrière une modification. Seuls les faits observables (fichier, timestamp, tool) sont consignés. Le _pourquoi_ appartient aux ADR et aux messages de commit. |

---

## Conséquences

**Pour les agents IA :**
- Un agent qui reprend une session peut lire `log/kit-construction.md` pour comprendre
  ce qui a été fait récemment, sans reconstituer l'historique git
- Le journal distingue la construction du kit (ce fichier) des modifications de contenu
  (tokens, guidelines) — deux registres séparés pour deux types d'activité distincts

**Pour les humains :**
- Observabilité immédiate : `cat log/kit-construction.md` donne une chronologie lisible
- Rétroactivité possible : les entrées antérieures au hook peuvent être ajoutées manuellement
  ou par un agent d'initialisation

**Relation avec ADR-015 :**
- ADR-015 (hook rappel ADR) surveille `tokens/`, `guidelines/`, `components/` — le contenu
- ADR-016 (ce journal) surveille `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md` — le kit
- Les deux hooks coexistent sur le même event `PostToolUse Write|Edit`, sans interférence

**Coût accepté :**
- Le chemin absolu du projet est encodé dans le script — à adapter si le dépôt est déplacé
- Le journal grossit indéfiniment ; une rotation annuelle ou par version majeure est envisageable

---

## Incidents ou déclencheurs

Constat lors de l'assemblage du kit : après plusieurs sessions de travail,
il était difficile de répondre à « qu'est-ce qui a été mis en place aujourd'hui ? »
sans relire l'intégralité de l'historique git. Le journal automatique rend
cette question triviale.
