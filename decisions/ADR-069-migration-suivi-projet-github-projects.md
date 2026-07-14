# ADR-069 — Migrating project tracking to GitHub Projects

> **Date:** 2026-07-09
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-069-migration-suivi-projet-github-projects.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md, decisions/ADR-016-journal-construction.md
> **Relations:** decisions/ADR-016-journal-construction.md (replaced), .claude/rules/project-overview.md, .claude/settings.json, .claude/rules/git-workflow.md

---

## Context

`log/kit-construction.md` (ADR-016, 2026-05-28) automatically logged, via a
`PostToolUse` hook, every modification to the kit's construction files (`.claude/`,
`decisions/`, `AGENTS.md`, `DESIGN.md`). After six weeks of use, the file had grown to
464 lines and ~440 entries.

This format (an append-only chronological table) served its role as a log well, but
didn't allow for real project management: no status other than "done," no backlog
distinct from history, no view by domain, no dependency tracking between initiatives.
Re-reading the file to answer "what's left to do?" required reparsing the entire history
in search of informal mentions ("door left open," "out of scope," "to do").

The question was:

> **How do we get a real project management tool (statuses, backlog, dependencies)
> without duplicating the logging effort already provided by git and the ADRs?**

---

## Decision

Agentica's project tracking is migrated to **GitHub Projects (v2)**
— Project #1 "Agentica — Project Management" → https://github.com/users/gnegreiros-ux/projects/1.

- **Custom fields**: `Status` (Backlog, In Progress, Waiting, Done, Abandoned),
  `Domain` (Figma, Tokens, Site, Components, Tests, Governance, Presentation),
  `Dependency` (free text, e.g. `#12`), `ADR` (free text, e.g. `ADR-059`), `Date`.
- **Views**: Board (by Status, daily use), "By domain" table (group by Domain),
  "History" table (filter `Status:Done`, sorted by descending Date — replaces the
  chronological log function of the old file).
- **Population**: the ~440 raw entries from `log/kit-construction.md` were condensed
  into 100 items (91 historical initiatives + 1 pending initiative + 8 backlog tickets
  identified from "to do"/"door open" mentions found in the history and in session
  memory), all migrated with their real status.
- The `PostToolUse` hook (`.claude/hooks/log-kit-construction.sh`) and the
  `log/kit-construction.md` file are removed from the repository.

The **public changelog** (`site/dist/changelog.html`, shipped release notes) stays in
the repository — it is distinct from internal project management and is not affected by
this migration.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Keep the file + add a management layer on top** | Duplicates the entry effort (file + tool) and creates a risk of desynchronization between the two sources. |
| **GitHub Issues + Milestones alone** | No free-text field to cross-reference Domain/ADR/Dependency without repurposing labels and milestones away from their intended use; Projects v2 offers custom fields natively. |
| **External tool (Linear, Jira…)** | Adds a paid dependency and a system outside the GitHub ecosystem already used for code and CI; contrary to the digital-sovereignty principle (`project-overview.md`). |
| **Keep the automatic log for history, GitHub Projects for the future only** | Would have left two active history registers in parallel (repo + Project) — contrary to the goal of a single source of truth. |

---

## Consequences

**For AI agents:**
- A question like "what's been done on X?" or "what's left to do?" is answered via
  `gh project item-list 1 --owner gnegreiros-ux` or the "History"/Board view, no longer
  via reading `log/kit-construction.md`.
- The `PostToolUse` hook that automatically logged every `Write`/`Edit` on `.claude/`,
  `decisions/`, `AGENTS.md`, `DESIGN.md` is removed — these modifications remain traced by
  git and by the ADRs themselves, not by a separate log.
- Any proposal for a new initiative (Backlog) must be created in GitHub Projects after
  explicit human validation — never directly, per `project-overview.md` ("the human
  always has the final word").

**For humans:**
- The Board provides a daily-piloting view impossible with a flat file.
- The "By domain" and "History" views respectively replace the need for manual
  filtering and the chronological log function of the old file.

**Accepted cost:**
- History loses the minute-level timestamp granularity of the old hook (migrated
  entries carry a date, not a time) — judged not significant for project management use
  rather than session debugging.
- GitHub Projects is a service external to the git repository itself (but stays within
  the GitHub ecosystem already used for code, Issues, and CI).

---

## Incidents or triggers

Explicit user request on 2026-07-09: "need a project management tool to better run
Agentica." The `kit-construction.md` log format (designed by ADR-016 as observability
for kit construction, not as a piloting tool) no longer met this need once the volume of
accumulated history grew.

<!-- FR -->

# ADR-069 — Migration du suivi de projet vers GitHub Projects

> **Date :** 2026-07-09
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-069-migration-suivi-projet-github-projects.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md, decisions/ADR-016-journal-construction.md
> **Relations:** decisions/ADR-016-journal-construction.md (remplacé), .claude/rules/project-overview.md, .claude/settings.json, .claude/rules/git-workflow.md

---

## Contexte

`log/kit-construction.md` (ADR-016, 2026-05-28) journalisait automatiquement, via un hook
`PostToolUse`, chaque modification des fichiers de construction du kit (`.claude/`,
`decisions/`, `AGENTS.md`, `DESIGN.md`). Après six semaines d'usage, le fichier comptait
464 lignes et ~440 entrées.

Ce format (tableau chronologique append-only) remplissait bien son rôle de journal, mais
ne permettait pas de gérer un projet : pas de statut autre que « fait », pas de backlog
distinct de l'historique, pas de vue par domaine, pas de suivi de dépendances entre
chantiers. Relire le fichier pour répondre à « qu'est-ce qui reste à faire ? » demandait
de reparser tout l'historique à la recherche de mentions informelles (« porte laissée
ouverte », « hors scope », « à faire »).

La question posée était :

> **Comment obtenir un vrai outil de gestion de projet (statuts, backlog, dépendances)
> sans dupliquer l'effort de journalisation déjà fourni par git et les ADR ?**

---

## Décision

Le suivi de projet d'Agentica est migré vers **GitHub Projects (v2)**
— Project #1 « Agentica — Gestion de projet »> https://github.com/users/gnegreiros-ux/projects/1.

- **Champs personnalisés** : `Status` (Backlog, En cours, En attente, Terminé, Abandonné),
  `Domaine` (Figma, Tokens, Site, Composants, Tests, Gouvernance, Présentation),
  `Dépendance` (texte libre, ex. `#12`), `ADR` (texte libre, ex. `ADR-059`), `Date`.
- **Vues** : Board (par Status, usage quotidien), Table « Par domaine » (group by Domaine),
  Table « Historique » (filtre `Status:Terminé`, tri par Date décroissant — remplace la
  fonction de journal chronologique de l'ancien fichier).
- **Peuplement** : les ~440 entrées brutes de `log/kit-construction.md` ont été condensées
  en 100 items (91 chantiers historiques + 1 chantier en attente + 8 tickets de backlog
  identifiés à partir des mentions « à faire »/« porte ouverte » retrouvées dans
  l'historique et en mémoire de session), tous migrés avec leur statut réel.
- Le hook `PostToolUse` (`.claude/hooks/log-kit-construction.sh`) et le fichier
  `log/kit-construction.md` sont retirés du dépôt.

Le **changelog public** (`site/dist/changelog.html`, notes de version livrées) reste
dans le dépôt — il est distinct de la gestion de projet interne et n'est pas concerné
par cette migration.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Garder le fichier + ajouter une couche de gestion par-dessus** | Duplique l'effort de saisie (fichier + outil) et crée un risque de désynchronisation entre les deux sources. |
| **GitHub Issues + Milestones seuls** | Pas de champ libre pour croiser Domaine/ADR/Dépendance sans détourner labels et milestones de leur usage prévu ; Projects v2 offre des champs personnalisés nativement. |
| **Outil externe (Linear, Jira…)** | Ajoute une dépendance payante et un système hors de l'écosystème GitHub déjà utilisé pour le code et la CI ; contraire au principe de souveraineté numérique (`project-overview.md`). |
| **Journal automatique conservé pour l'historique, GitHub Projects pour le futur seulement** | Aurait laissé deux registres d'historique actifs en parallèle (dépôt + Project) — contraire à l'objectif d'une source unique de vérité. |

---

## Conséquences

**Pour les agents IA :**
- Une question du type « qu'est-ce qui a été fait sur X ? » ou « qu'est-ce qui reste à
  faire ? » se répond via `gh project item-list 1 --owner gnegreiros-ux` ou la vue
  « Historique »/Board, plus via lecture de `log/kit-construction.md`.
- Le hook `PostToolUse` qui journalisait automatiquement chaque `Write`/`Edit` sur
  `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md` est retiré — ces modifications
  restent tracées par git et par les ADR eux-mêmes, pas par un journal séparé.
- Toute proposition de nouveau chantier (Backlog) doit être créée dans GitHub Projects
  après validation humaine explicite — jamais directement, conformément à
  `project-overview.md` (« le dernier mot est toujours humain »).

**Pour les humains :**
- Le Board donne une vue de pilotage quotidien impossible avec un fichier plat.
- Les vues « Par domaine » et « Historique » remplacent respectivement le besoin de
  filtrage manuel et la fonction de journal chronologique de l'ancien fichier.

**Coût accepté :**
- L'historique perd la granularité horodatée à la minute près de l'ancien hook (les
  entrées migrées portent une date, pas une heure) — jugé non significatif pour un usage
  de gestion de projet plutôt que de débogage de session.
- GitHub Projects est un service externe au dépôt git lui-même (mais reste dans
  l'écosystème GitHub déjà utilisé pour le code, les Issues et la CI).

---

## Incidents ou déclencheurs

Demande explicite de l'utilisateur le 2026-07-09 : « besoin d'un outil de gestion de
projet pour mieux mener Agentica ». Le format journal de `kit-construction.md`
(conçu par ADR-016 comme observabilité de la construction du kit, pas comme outil de
pilotage) ne répondait plus à ce besoin une fois le volume d'historique accumulé.
