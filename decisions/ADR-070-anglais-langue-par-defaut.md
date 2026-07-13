# ADR-070 — Anglais comme langue par défaut du dépôt (traduction communautaire)

> **Date :** 2026-07-10
> **Statut :** ✅ Actif
> **Décideurs :** Guilherme Negreiros (Design System Lead)
> **Type:** contract
> **Chemin logique:** decisions/ADR-070-anglais-langue-par-defaut.md
> **Lecture avant:** AGENTS.md, DESIGN.md, README.md
> **Relations:** .claude/rules/project-overview.md, README.md, AGENTS.md, DESIGN.md, How-to-designers.md, How-to-devs.md, How-to-sans-agents.md

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
