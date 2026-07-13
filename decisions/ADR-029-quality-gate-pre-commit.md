# ADR-029 — Quality Gate pré-commit modulaire

> **Date :** 2026-05-30
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Chemin logique:** decisions/ADR-029-quality-gate-pre-commit.md
> **Lecture avant:** AGENTS.md, .claude/rules/post-change-pipeline.md
> **Relations:** .claude/skills/quality-gate.md, .claude/skills/pipelines/, ADR-027-pipeline-impact-pre-commit.md

> **English summary:** Replaces the monolithic ADR-027 pipeline with a modular quality gate — one independent file per check under `.claude/skills/pipelines/`, each with explicit triggers and verifiable checks — after ADR-028 (a new font) was implemented without a corresponding ADR being created. The new `adr-triggers.md` trigger matrix makes such omissions structurally harder to miss.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
