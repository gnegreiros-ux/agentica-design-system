# ADR-029 — Modular pre-commit quality gate

> **Date:** 2026-05-30
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-029-quality-gate-pre-commit.md
> **Read before:** AGENTS.md, .claude/rules/post-change-pipeline.md
> **Relations:** .claude/skills/quality-gate.md, .claude/skills/pipelines/, ADR-027-pipeline-impact-pre-commit.md

---

## Context

ADR-027 introduced the concept of a pre-commit impact pipeline. However, the corresponding skill was too generic: it asked to "analyze impact" without precisely defining what that means.

**Triggering incident:** ADR-028 (Atkinson Hyperlegible Mono) was forgotten when the monospace font was added. The architectural decision was implemented without being documented — a direct violation of the system's governance principles.

**Root cause:** a vague checklist ("check for missing ADRs") with no explicit trigger matrix. An agent — or a human — can conscientiously go through a vague list and still miss a non-obvious item.

---

## Decision

Replace the monolithic pipeline with a **modular quality gate**:

```
.claude/skills/quality-gate.md          ← orchestrator
.claude/skills/pipelines/
├── tokens-audit.md                      ← ✅ active
├── wcag.md                              ← ✅ active
├── adr-conformity.md                    ← ✅ active
├── adr-triggers.md                      ← ✅ active (trigger matrix)
├── docs.md                              ← ✅ active
├── site.md                              ← ✅ active
├── commit.md                            ← ✅ active
├── style-dictionary.md                  ← 🔜 planned
├── storybook.md                         ← 🔜 planned
├── chromatic.md                         ← 🔜 planned
├── axe-core.md                          ← 🔜 planned
└── playwright.md                        ← 🔜 planned
```

### Design principle

**Each pipeline is independent and has a standard interface:**
- Explicit triggers (which files activate it)
- Verifiable checks (no vague intent)
- Clear status (`✅ Active` or `🔜 Planned`)
- Execution command (when available)

**Adding a pipeline = creating a file.** No modification of the orchestrator required.

### Anti-omission ADR rule (the core issue)

The `adr-triggers.md` pipeline contains an explicit **trigger matrix**:
> New font → typography ADR required.
> New component → component ADR required.
> etc.

This matrix makes forgetting an ADR structurally impossible if the pipeline is followed.

---

## Rationale

### Why modular?

1. **Extensibility**: Style Dictionary, Storybook, Chromatic, axe-core, Playwright will be added progressively. A monolithic architecture would have required rewriting the pipeline on every addition.

2. **Traceability**: Each pipeline has its own file, versioned separately. If a rule changes (e.g. WCAG 2.2 → 2.3), only one file is modified.

3. **Clarity for agents**: An agent reads `adr-triggers.md` and knows exactly when to create an ADR — no room for interpretation.

### Why stubs for inactive pipelines?

Anticipation of the project's evolution. The stubs:
- Document the intent (what will be done)
- Allow immediate activation (the commands are already prepared)
- Clearly signal that these pipelines are not yet blocking

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| **A single checklist in one file** | Not extensible. Every added pipeline bloats the main file and creates merge conflicts. |
| **Automated bash script only** | Human approval is non-negotiable (ADR-004). A script can automate checks but not the decision. |
| **No structured pipeline** | Proven insufficient — the ADR-028 incident is direct proof. |

---

## Consequences

**For AI agents:**
- Systematic reference to `quality-gate.md` before any commit
- The `adr-triggers.md` matrix makes a missing ADR detectable

**For the team:**
- Adding a new pipeline = creating a file in `.claude/skills/pipelines/` + a line in `quality-gate.md`
- No modification of existing pipelines required

**For governance:**
- Each pipeline is independently auditable
- Stubs explicitly signal what is not yet covered

<!-- FR -->

# ADR-029 — Quality Gate pré-commit modulaire

> **Date :** 2026-05-30
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Chemin logique:** decisions/ADR-029-quality-gate-pre-commit.md
> **Lecture avant:** AGENTS.md, .claude/rules/post-change-pipeline.md
> **Relations:** .claude/skills/quality-gate.md, .claude/skills/pipelines/, ADR-027-pipeline-impact-pre-commit.md

---

## Contexte

ADR-027 a introduit le concept de pipeline d'impact pré-commit. Cependant, la skill correspondante était trop générique : elle demandait d'"analyser l'impact" sans définir précisément ce que cela signifie.

**Incident déclencheur :** ADR-028 (Atkinson Hyperlegible Mono) a été oublié lors de l'ajout de la police monospace. La décision architecturale a été implémentée sans être documentée — violation directe des principes de gouvernance du système.

**Cause racine :** une checklist floue ("vérifier les ADRs manquants") sans matrice de déclenchement explicite. Un agent — ou un humain — peut consciencieusement parcourir une liste vague et manquer quand même un élément non évident.

---

## Décision

Remplacer le pipeline monolithique par un **quality gate modulaire** :

```
.claude/skills/quality-gate.md          ← orchestrateur
.claude/skills/pipelines/
├── tokens-audit.md                      ← ✅ actif
├── wcag.md                              ← ✅ actif
├── adr-conformity.md                    ← ✅ actif
├── adr-triggers.md                      ← ✅ actif (matrice de déclenchement)
├── docs.md                              ← ✅ actif
├── site.md                              ← ✅ actif
├── commit.md                            ← ✅ actif
├── style-dictionary.md                  ← 🔜 planifié
├── storybook.md                         ← 🔜 planifié
├── chromatic.md                         ← 🔜 planifié
├── axe-core.md                          ← 🔜 planifié
└── playwright.md                        ← 🔜 planifié
```

### Principe de conception

**Chaque pipeline est indépendant et a une interface standard :**
- Déclencheurs explicites (quels fichiers l'activent)
- Checks vérifiables (pas d'intention floue)
- Statut clair (`✅ Actif` ou `🔜 Planifié`)
- Commande d'exécution (quand disponible)

**Ajouter un pipeline = créer un fichier.** Pas de modification de l'orchestrateur nécessaire.

### Règle anti-oubli ADR (issue principale)

Le pipeline `adr-triggers.md` contient une **matrice de déclenchement** explicite :
> Nouvelle police → ADR typo requis.
> Nouveau composant → ADR composant requis.
> etc.

Cette matrice rend l'oubli d'ADR structurellement impossible si le pipeline est suivi.

---

## Argumentaire

### Pourquoi modulaire ?

1. **Extensibilité** : Style Dictionary, Storybook, Chromatic, axe-core, Playwright seront ajoutés progressivement. Une architecture monolithique aurait nécessité de réécrire le pipeline à chaque ajout.

2. **Traçabilité** : Chaque pipeline a son propre fichier, versionné séparément. Si une règle change (ex: WCAG 2.2 → 2.3), un seul fichier est modifié.

3. **Clarté pour les agents** : Un agent lit `adr-triggers.md` et sait exactement quand créer un ADR — pas de place pour l'interprétation.

### Pourquoi des stubs pour les pipelines non actifs ?

Prévision de l'évolution du projet. Les stubs :
- Documentent l'intention (ce qui sera fait)
- Permettent l'activation immédiate (les commandes sont déjà préparées)
- Signalent clairement que ces pipelines ne bloquent pas encore

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Checklist unique dans un fichier** | Non extensible. Chaque ajout de pipeline alourdit le fichier principal et crée des conflits de merge. |
| **Script bash automatisé uniquement** | L'approbation humaine est non négociable (ADR-004). Un script peut automatiser les vérifications mais pas la décision. |
| **Pas de pipeline structuré** | Prouvé insuffisant — incident ADR-028 est la démonstration directe. |

---

## Conséquences

**Pour les agents IA :**
- Référence systématique à `quality-gate.md` avant tout commit
- La matrice `adr-triggers.md` rend l'oubli d'ADR détectable

**Pour l'équipe :**
- Ajouter un nouveau pipeline = créer un fichier dans `.claude/skills/pipelines/` + une ligne dans `quality-gate.md`
- Aucune modification des pipelines existants requise

**Pour la gouvernance :**
- Chaque pipeline est auditable indépendamment
- Les stubs signalent explicitement ce qui n'est pas encore couvert
