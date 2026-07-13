# ADR-036 — Revue des patterns UX de référence avant publication d'un composant

> **Date :** 2026-05-31
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-036-ux-pattern-review-pre-composant.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/ux-patterns-sources.md
> **Relations:** .claude/rules/ux-patterns-sources.md, .claude/skills/ux-pattern-review.md, .claude/skills/pipelines/ux-patterns.md, .claude/skills/quality-gate.md, .claude/settings.json, decisions/ADR-015-hook-rappel-adr.md, decisions/ADR-029-quality-gate-pre-commit.md

> **English summary:** Before publishing any new or meaningfully UX-changed component, an agent
> must present UX patterns from 5 recognized sources (with links) for human approval, then
> document the decision across 6 surfaces (guideline, code, story, site, ADR, log).
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
