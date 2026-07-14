# ADR-036 — Review of reference UX patterns before publishing a component

> **Date:** 2026-05-31
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-036-ux-pattern-review-pre-composant.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/ux-patterns-sources.md
> **Relations:** .claude/rules/ux-patterns-sources.md, .claude/skills/ux-pattern-review.md, .claude/skills/pipelines/ux-patterns.md, .claude/skills/quality-gate.md, .claude/settings.json, decisions/ADR-015-hook-rappel-adr.md, decisions/ADR-029-quality-gate-pre-commit.md

---

## Context

Every component encodes UX decisions — how to display an error state, where to place help
text, when to validate an entry, how to flag a required field. Without a reference framework,
these decisions were improvised during construction, with no way for the human to arbitrate
between recognized patterns, and no record of why a given pattern had been chosen.

The expressed need:

> **Before publishing each component, present the human with the UX patterns suggested by
> recognized sources — with links — so they can judge and approve which ones to apply; then
> document that decision everywhere.**

Five reference sources were selected: IF Data Patterns Catalogue, Nielsen Norman Group,
Dashboard Design Patterns, Interaction Design Foundation, Smashing Magazine
(detailed in `.claude/rules/ux-patterns-sources.md`).

---

## Decision

Every **new component** — and every **UX-relevant modification** to an existing component —
goes through a **UX pattern review**: the agent presents candidate patterns from the
5 sources (with direct links), the human approves which ones to apply, and the decision is
**documented across 6 surfaces** before publication.

The workflow is encoded in four artifacts:

| Artifact | Role |
|----------|------|
| `.claude/rules/ux-patterns-sources.md` | Registry of the 5 sources + review checklist + type→sources matrix + 6 surfaces |
| `.claude/skills/ux-pattern-review.md` | Executable skill: present → approve → document |
| `.claude/skills/pipelines/ux-patterns.md` | Blocking quality-gate pipeline (verifies review + approval + 6 surfaces) |
| `PostToolUse` hook (`.claude/settings.json`) | Reminder when a component or guideline file is created/modified |

Source consultation is **hybrid**: a versioned registry as the base + targeted WebFetch on the
priority source(s) at review time.

### The 6 propagation surfaces

Guideline (`guidelines/components/<comp>.md`), code (`components/agtc-<comp>.js`),
Storybook (`<comp>.stories.js`), site (rebuild), component implementation ADR,
construction log.

### Triggers

- Creating a component → full review mandatory.
- Relevant modification: new variant/state, validation logic, error/help display,
  interaction, new type.
- **Not triggered**: contrast/WCAG fix, typo, rename, refactor with no behavior change (same
  "decision vs. adjustment" distinction as the ADR-015 amendment).

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Versioned registry alone (no fetch)** | Sources evolve; a frozen registry goes stale. The hybrid approach keeps an auditable base while refreshing as needed. |
| **Live WebFetch alone at every review** | Slower, network-dependent, and with no auditable record of what was presented. |
| **No pipeline (manual skill only)** | Without a blocking safeguard in the quality-gate, the review would be forgotten — exactly the problem ADR-015 solves for ADRs. |
| **Hook on `Write` only** | The user also wants triggering on **relevant modification** of a component; the matcher therefore covers `Write|Edit`, asking the agent to judge relevance. |
| **Agent decides patterns alone** | Violates the "the human always has the final word" principle. The agent proposes, the human decides. |

---

## Consequences

**For AI agents:**
- When creating/modifying a component, systematically present the patterns (with links) and
  wait for approval before building.
- Propagate the decision across the 6 surfaces; the `ux-patterns` pipeline verifies this at the quality gate.
- The hook is a reminder of the workflow, but the agent must **judge relevance** (a hook can't do that).

**For humans:**
- An explicit decision point before every component publication — arbitration on
  recognized patterns rather than implicit choices.
- Full traceability: every component carries the list of applied patterns and their source.

**Accepted cost:**
- The hook may fire on non-UX modifications (the agent then ignores the reminder).
- The review adds a step before construction — accepted as a governance safeguard.

**Retroactive application:**
- Already-created components (button, input, badge, card, icon) go through the review and receive
  their documentation across the 6 surfaces.

---

## Incidents or triggers

Explicit request from the Design System Lead: have, before building each component,
a presentation of the UX patterns suggested by recognized sources, in order to approve the right
patterns and keep a documented trail everywhere.

<!-- FR -->

# ADR-036 — Revue des patterns UX de référence avant publication d'un composant

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-036-ux-pattern-review-pre-composant.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/ux-patterns-sources.md
> **Relations:** .claude/rules/ux-patterns-sources.md, .claude/skills/ux-pattern-review.md, .claude/skills/pipelines/ux-patterns.md, .claude/skills/quality-gate.md, .claude/settings.json, decisions/ADR-015-hook-rappel-adr.md, decisions/ADR-029-quality-gate-pre-commit.md

---

## Contexte

Chaque composant encode des décisions UX — comment afficher un état d'erreur, où placer un texte
d'aide, à quel moment valider une saisie, comment signaler un champ obligatoire. Sans référentiel,
ces décisions étaient improvisées au moment de la construction, sans que l'humain puisse arbitrer
entre des patterns reconnus, et sans trace de pourquoi tel pattern avait été retenu.

Le besoin exprimé :

> **Avant la publication de chaque composant, présenter à l'humain les patterns UX suggérés par
> des sources reconnues — avec liens — afin qu'il juge et approuve lesquels appliquer ; puis
> documenter cette décision partout.**

Cinq sources de référence ont été retenues : IF Data Patterns Catalogue, Nielsen Norman Group,
Dashboard Design Patterns, Interaction Design Foundation, Smashing Magazine
(détaillées dans `.claude/rules/ux-patterns-sources.md`).

---

## Décision

Tout **nouveau composant** — et toute **modification UX pertinente** d'un composant existant —
passe par une **revue des patterns UX** : l'agent présente les patterns candidats issus des
5 sources (avec liens directs), l'humain approuve lesquels appliquer, et la décision est
**documentée sur 6 surfaces** avant publication.

Le workflow est encodé en quatre artefacts :

| Artefact | Rôle |
|----------|------|
| `.claude/rules/ux-patterns-sources.md` | Registre des 5 sources + checklist de revue + matrice type→sources + 6 surfaces |
| `.claude/skills/ux-pattern-review.md` | Skill exécutable : présenter → approuver → documenter |
| `.claude/skills/pipelines/ux-patterns.md` | Pipeline bloquant du quality-gate (vérifie revue + approbation + 6 surfaces) |
| Hook `PostToolUse` (`.claude/settings.json`) | Rappel à la création/modif d'un fichier composant ou guideline |

Consultation des sources **hybride** : registre versionné comme base + WebFetch ciblé sur la/les
source(s) prioritaires au moment de la revue.

### Les 6 surfaces de propagation

Guideline (`guidelines/components/<comp>.md`), code (`components/agtc-<comp>.js`),
Storybook (`<comp>.stories.js`), site (rebuild), ADR d'implémentation du composant,
log de construction.

### Déclencheurs

- Création d'un composant → revue complète obligatoire.
- Modification pertinente : nouvelle variante/état, logique de validation, affichage erreur/aide,
  interaction, nouveau type.
- **Non déclenché** : correction de contraste/WCAG, typo, renommage, refactor sans changement de
  comportement (même distinction « décision vs ajustement » que l'amendement d'ADR-015).

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Registre versionné seul (pas de fetch)** | Les sources évoluent ; un registre figé se périme. L'hybride garde une base auditable tout en rafraîchissant au besoin. |
| **WebFetch live seul à chaque revue** | Plus lent, dépendant du réseau, et sans base auditable de ce qui a été présenté. |
| **Pas de pipeline (skill manuel uniquement)** | Sans garde-fou bloquant dans le quality-gate, la revue serait oubliée — exactement le problème que résout ADR-015 pour les ADR. |
| **Hook sur `Write` uniquement** | L'utilisateur veut aussi le déclenchement sur **modification** pertinente d'un composant ; le matcher couvre donc `Write|Edit`, en demandant à l'agent de juger la pertinence. |
| **Agent décide seul des patterns** | Viole le principe « le dernier mot est toujours humain ». L'agent propose, l'humain tranche. |

---

## Conséquences

**Pour les agents IA :**
- À la création/modif d'un composant, présenter systématiquement les patterns (avec liens) et
  attendre l'approbation avant de construire.
- Propager la décision sur les 6 surfaces ; le pipeline `ux-patterns` le vérifie au quality-gate.
- Le hook rappelle le workflow, mais l'agent doit **juger la pertinence** (un hook ne le peut pas).

**Pour les humains :**
- Point de décision explicite avant chaque publication de composant — arbitrage sur des patterns
  reconnus plutôt que sur des choix implicites.
- Traçabilité complète : chaque composant porte la liste des patterns appliqués et leur source.

**Coût accepté :**
- Le hook peut se déclencher sur des modifications non UX (l'agent ignore alors le rappel).
- La revue ajoute une étape avant la construction — assumée comme un garde-fou de gouvernance.

**Application rétroactive :**
- Les composants déjà créés (button, input, badge, card, icon) passent par la revue et reçoivent
  leur documentation sur les 6 surfaces.

---

## Incidents ou déclencheurs

Demande explicite du Design System Lead : disposer, avant la construction de chaque composant,
d'une présentation des patterns UX suggérés par des sources reconnues, afin d'approuver les bons
patterns et de garder une trace documentée partout.
