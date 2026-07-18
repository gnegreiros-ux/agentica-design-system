# ADR-070 — English as the repository's default language (community translation)

> **Date:** 2026-07-10
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros (Design System Lead)
> **Type:** contract
> **Logical path:** decisions/ADR-070-anglais-langue-par-defaut.md
> **Read before:** AGENTS.md, DESIGN.md, README.md
> **Relations:** .claude/rules/project-overview.md, README.md, AGENTS.md, DESIGN.md, How-to-designers.md, How-to-devs.md, How-to-without-agents.md

---

## Context

The Agentica repository was written entirely in French — root documentation (README,
AGENTS.md, DESIGN.md, How-to guides), guidelines, `.claude/` rules, architectural
decisions (`decisions/`). The stated goal is to share the project with the international
design systems community (Storybook, Figma Community, publications like Design Systems
Collective) — an overwhelmingly English-speaking readership.

The public site (`site/`) already has a working bilingual FR/EN system (`lang-fr`/`lang-en`
spans, toggled via `.lang-btn`) from an earlier effort (2026-05-29). This system only
covers the generated site, not the repository's own markdown files — which are what an
external contributor reads first on GitHub.

---

## Decision

English becomes the repository's default language. Migration is split into 6 initiatives
in GitHub Projects (Domain Governance/Site/Components, all linked to the parent ticket
"Full translation of the repository to English"):

| # | Scope | Strategy | Priority |
|---|-----------|-----------|----------|
| 1 | Root documentation (README, How-to-*, AGENTS.md, DESIGN.md) | English **replaces** French — no FR version kept in these files | P1 |
| 2 | Public site (`site/contenu.md`, `site/build.js`) | Switch the existing bilingual system's default to EN — FR remains available via the selector | P1 |
| 3 | `guidelines/` (24 files) | English **replaces** French — same strategy as initiative 1, no FR version kept | P2 |
| 4 | `.claude/` (rules, instructions, skills — 38 agent-facing files) | English **replaces** French — same strategy as initiatives 1 and 3, no FR version kept | P2 |
| 5 | `decisions/` (70 ADRs, historical log) | A lightweight strategy was initially considered (an EN summary up top) rather than a full retroactive translation — to be validated | P3 |
| 6 | Component code comments (`agtc-*.js`, `*.stories.js`) | Full translation — comments, CONTRACT blocks, `console.warn` warnings, **and** Storybook `description` strings (user-facing); the `agtc-top-nav` component's `labelFr`/`labelEn` pairs are kept as-is (a real bilingual site feature, not residual content) | P3 |

This initiative 1 (root documentation) is the first delivered by this decision — a full
replacement of French with English, with no French version kept in parallel (an explicit
decision: avoid the double-maintenance debt of two complete copies).

File paths (`.claude/rules/contexts-utilisation.md`, etc.) are **not** renamed during
this translation — only the content changes, not the file names, so as not to break
cross-references throughout the repository.

> **Note (ADR-071, 2026-07-13):** initiative 5's lightweight strategy (an EN summary up
> top, French body preserved) was implemented first, then superseded by a full retroactive
> translation of all 70 ADRs — see ADR-071, which establishes English as the sole
> language for all future content while extending full bilingual treatment to every
> already-existing ADR.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Bilingual FR+EN on every root file** (`.md` + `.fr.md`) | Doubles the maintenance load of every future governance change; the site already keeps genuine bilingualism where it matters most (visited public content), root docs can afford a clean-cut choice. |
| **Translate only the site, keep governance docs in French** | An external contributor opening the repo on GitHub reads `README.md`/`AGENTS.md` before even reaching the site — leaving these files in French breaks the community-sharing goal from the very first impression. |
| **Translate everything in a single monolithic initiative** | 860+ lines for root docs alone, ~2000 lines for `.claude/`, 70 ADRs — a single initiative would be unmanageable and unverifiable; splitting into 6 prioritized sub-initiatives (external visibility first) is already recorded in GitHub Projects. |

---

## Consequences

**For AI agents:**
- `AGENTS.md`, `DESIGN.md`, and the `How-to-*.md` guides are now in English — any future
  modification to these files is done in English, unless explicitly decided otherwise.
- `.claude/rules/*.md` files remain in French until initiative #4 — an agent will
  therefore read a mix of EN (router, contract) / FR (detailed rules) during the
  transition. No functional ambiguity: file names and paths don't change.
- The user's global conversation preferences (responding in French in conversation) are
  independent of the language of the content versioned in the repository — no contradiction.

**For humans:**
- The repository becomes readable by an external, non-French-speaking contributor as
  soon as they open the README.
- Loss of the French version of these 6 files in the repository (recoverable via git
  history if needed — no separate archive created, unlike the `Redesign/` folder, which
  contained non-recreatable binary assets).

**Accepted cost:**
- During the transition period (initiatives #3 through #6 not yet completed), the
  repository is bilingual de facto by zone rather than by file — accepted as an
  intermediate state, not an end state.

---

## Incidents or triggers

Explicit user request on 2026-07-09 as part of building a governance backlog (alongside
repository cleanup and Figma governance): "Full translation of the repository to
English. English needs to become the default language so I can share the project with
the international community."

<!-- FR -->

# ADR-070 — Anglais comme langue par défaut du dépôt (traduction communautaire)

> **Date :** 2026-07-10
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros (Design System Lead)
> **Type:** contract
> **Chemin logique:** decisions/ADR-070-anglais-langue-par-defaut.md
> **Lecture avant:** AGENTS.md, DESIGN.md, README.md
> **Relations:** .claude/rules/project-overview.md, README.md, AGENTS.md, DESIGN.md, How-to-designers.md, How-to-devs.md, How-to-without-agents.md

---

## Contexte

Le dépôt Agentica était rédigé entièrement en français — documentation racine (README,
AGENTS.md, DESIGN.md, guides How-to), guidelines, règles `.claude/`, décisions
architecturales (`decisions/`). L'objectif exprimé est de partager le projet avec la
communauté internationale des design systems (Storybook, Figma Community, publications
type Design Systems Collective) — un lectorat très majoritairement anglophone.

Le site public (`site/`) dispose déjà d'un système bilingue FR/EN fonctionnel (spans
`lang-fr`/`lang-en`, bascule via `.lang-btn`) depuis un chantier antérieur (2026-05-29).
Ce système ne couvre que le site généré, pas les fichiers markdown du dépôt lui-même —
qui sont ce qu'un contributeur externe consulte en premier sur GitHub.

---

## Décision

L'anglais devient la langue par défaut du dépôt. Migration en 6 chantiers découpés dans
GitHub Projects (Domaine Gouvernance/Site/Composants, tous rattachés au ticket parent
« Traduction complète du dépôt vers l'anglais ») :

| # | Périmètre | Stratégie | Priorité |
|---|-----------|-----------|----------|
| 1 | Documentation racine (README, How-to-*, AGENTS.md, DESIGN.md) | Anglais **remplace** le français — aucune version FR conservée dans ces fichiers | P1 |
| 2 | Site public (`site/contenu.md`, `site/build.js`) | Bascule EN par défaut sur le système bilingue existant — le FR reste disponible via le sélecteur | P1 |
| 3 | `guidelines/` (24 fichiers) | Anglais **remplace** le français — même stratégie que le chantier 1, aucune version FR conservée | P2 |
| 4 | `.claude/` (règles, instructions, skills — 38 fichiers agent-facing) | Anglais **remplace** le français — même stratégie que les chantiers 1 et 3, aucune version FR conservée | P2 |
| 5 | `decisions/` (70 ADR, journal historique) | Stratégie allégée envisagée (résumé EN en tête) plutôt que traduction intégrale rétroactive — à valider | P3 |
| 6 | Commentaires code composants (`agtc-*.js`, `*.stories.js`) | Traduction intégrale — commentaires, blocs CONTRAT, avertissements `console.warn`, **et** chaînes `description` Storybook (user-facing) ; les paires `labelFr`/`labelEn` du composant `agtc-top-nav` sont conservées telles quelles (feature bilingue réelle du site, pas du contenu résiduel) | P3 |

Ce chantier 1 (documentation racine) est le premier livré par cette décision — remplacement
intégral du français par l'anglais, sans version française conservée en parallèle (décision
explicite : éviter la dette de double maintenance de deux copies complètes).

Les chemins de fichiers (`.claude/rules/contexts-utilisation.md`, etc.) ne sont **pas**
renommés lors de cette traduction — seul le contenu change, pas les noms de fichiers, pour
ne pas casser les références croisées à travers le dépôt.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Bilingue FR+EN sur tous les fichiers racine** (`.md` + `.fr.md`) | Double la charge de maintenance de chaque future modification de gouvernance ; le site conserve déjà un vrai bilinguisme là où c'est le plus utile (contenu public visité), la doc racine peut se permettre un choix tranché. |
| **Ne traduire que le site, garder la doc de gouvernance en français** | Un contributeur externe ouvrant le dépôt sur GitHub lit `README.md`/`AGENTS.md` avant même d'atteindre le site — laisser ces fichiers en français casse l'objectif de partage communautaire dès la première impression. |
| **Tout traduire en un seul chantier monolithique** | 860+ lignes pour la seule doc racine, ~2000 lignes pour `.claude/`, 70 ADR — un chantier unique serait ingérable et invérifiable ; découpage en 6 sous-chantiers priorisés (visibilité externe d'abord) déjà acté dans GitHub Projects. |

---

## Conséquences

**Pour les agents IA :**
- `AGENTS.md`, `DESIGN.md` et les guides `How-to-*.md` sont désormais en anglais — toute
  future modification de ces fichiers se fait en anglais, sauf décision contraire explicite.
- Les fichiers `.claude/rules/*.md` restent en français jusqu'au chantier #4 — un agent
  lira donc un mélange EN (routeur, contrat) / FR (règles détaillées) pendant la transition.
  Aucune ambiguïté fonctionnelle : les noms de fichiers et chemins ne changent pas.
- Les préférences globales de l'utilisateur (réponse en français en conversation) sont
  indépendantes de la langue du contenu versionné dans le dépôt — aucune contradiction.

**Pour les humains :**
- Le dépôt devient lisible par un contributeur externe non-francophone dès l'ouverture du
  README.
- Perte de la version française de ces 6 fichiers dans le dépôt (récupérable via
  l'historique git si nécessaire — aucune archive séparée créée, contrairement au dossier
  `Redesign/` qui contenait des assets binaires non recréables).

**Coût accepté :**
- Pendant la période de transition (chantiers #3 à #6 non encore réalisés), le dépôt est
  bilingue de facto par zone plutôt que par fichier — assumé comme état intermédiaire, pas
  comme fin de chantier.

---

## Incidents ou déclencheurs

Demande explicite de l'utilisateur le 2026-07-09 dans le cadre de la constitution d'un
backlog de gouvernance (avec nettoyage du dépôt et gouvernance Figma) : « Traduction totale
du dépôt vers l'anglais. L'anglais devra passer à la langue par défaut pour que je puisse
partager le projet à la communauté internationale. »
