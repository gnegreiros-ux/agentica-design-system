# decisions/

> Registre des décisions architecturales du système de design (ADRs).
> **Type:** instruction
> **Chemin logique:** decisions/README.md
> **Lecture avant:** AGENTS.md, DESIGN.md
> **Relations:** .claude/instructions/session-spec.md, tokens/semantic.json, guidelines/components/

---

## Pourquoi ce dossier existe

Un design system accumule des décisions invisibles : pourquoi ce token est nommé ainsi,
pourquoi cette variante a été rejetée, pourquoi cette règle de gouvernance est là.
Sans ce registre, les agents répètent les erreurs passées et les équipes redébattent
des décisions déjà tranchées.

> « Le système de design est devenu un dataset, pas un deliverable. »
> — The Design System Guide, 2026

---

## Format d'un ADR

```markdown
# ADR-[NNN] — [Titre court]

> **Date :** AAAA-MM-JJ
> **Statut :** [proposé | actif | remplacé par ADR-NNN | déprécié]
> **Décideurs :** [noms ou rôles]

## Contexte

[Quel problème ou besoin a déclenché cette décision ?]

## Décision

[Quelle décision a été prise, en une phrase directe.]

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| [option A]  | [pourquoi non]  |

## Conséquences

[Qu'est-ce que cette décision implique concrètement pour les agents, les développeurs, les designers ?]

## Incidents ou déclencheurs

[Si cette décision a été provoquée par un incident réel, le noter ici.]
```

---

## Index des ADRs

| ADR | Titre | Date | Statut |
|-----|-------|------|--------|
| [ADR-001](ADR-001-trois-niveaux-tokens.md) | Architecture 3 niveaux de tokens | 2026-05-28 | ✅ Actif |
| [ADR-002](ADR-002-lit-web-components.md) | Choix de Lit pour les Web Components | 2026-05-28 | ✅ Actif |
| [ADR-003](ADR-003-style-dictionary.md) | Choix de Style Dictionary pour la compilation des tokens | 2026-05-28 | ✅ Actif |
| [ADR-004](ADR-004-gouvernance-humaine.md) | Gouvernance humaine : le dernier mot est toujours humain | 2026-05-28 | ✅ Actif |
| [ADR-005](ADR-005-variante-critical-vs-danger.md) | Remplacement de la variante `danger` par `critical` | 2026-05-28 | ✅ Actif |
| [ADR-006](ADR-006-chromatic-tests-visuels.md) | Choix de Chromatic pour les tests de régression visuelle | 2026-05-28 | ✅ Actif |
| [ADR-007](ADR-007-axe-core-accessibilite.md) | Choix de axe-core pour les tests d'accessibilité | 2026-05-28 | ✅ Actif |
| [ADR-008](ADR-008-radix-colors.md) | Choix de Radix UI Colors pour la palette primitive | 2026-05-28 | ✅ Actif |
| [ADR-009](ADR-009-storybook.md) | Choix de Storybook pour la documentation des composants | 2026-05-28 | ✅ Actif |
| [ADR-010](ADR-010-playwright.md) | Choix de Playwright pour les tests E2E et d'accessibilité | 2026-05-28 | ✅ Actif |
| [ADR-011](ADR-011-tokens-studio.md) | Choix de Tokens Studio pour la synchronisation Figma ↔ JSON | 2026-05-28 | ✅ Actif |
| [ADR-012](ADR-012-audit-tokens-script.md) | Détection de dérive par script d'audit (audit-tokens.js) | 2026-05-28 | ✅ Actif |
| [ADR-013](ADR-013-design-md-contrat-portable.md) | DESIGN.md comme contrat portable versionné avec le code | 2026-05-28 | ✅ Actif |
| [ADR-014](ADR-014-conventional-commits.md) | Choix de Conventional Commits pour les messages de commit | 2026-05-28 | ✅ Actif |
| [ADR-015](ADR-015-hook-rappel-adr.md) | Hook automatique de rappel ADR sur modifications critiques | 2026-05-28 | ✅ Actif |
| [ADR-016](ADR-016-journal-construction.md) | Journal de construction automatique du kit | 2026-05-28 | ⚠️ Remplacé par ADR-069 |
| [ADR-017](ADR-017-correction-contraste-text-disabled.md) | Correction valeur contraste texte désactivé (4.54:1) | 2026-05-28 | ✅ Actif |
| [ADR-018](ADR-018-migration-references-primitives-radix.md) | Migration des références primitives vers la convention Radix | 2026-05-28 | ✅ Actif |
| [ADR-019](ADR-019-resolution-dynamique-tokens-build.md) | Résolution dynamique des tokens au build (Site Dictionary) | 2026-05-29 | ✅ Actif |
| [ADR-020](ADR-020-grille-4px.md) | Grille 4px comme échelle dimensionnelle systémique | 2026-05-29 | ✅ Actif |
| [ADR-021](ADR-021-atkinson-hyperlegible.md) | Atkinson Hyperlegible comme police principale | 2026-05-29 | ✅ Actif |
| [ADR-022](ADR-022-lucide-icons.md) | Lucide Icons comme bibliothèque d'icônes | 2026-05-29 | ✅ Actif |
| [ADR-023](ADR-023-echelle-typographique-minor-third.md) | Échelle typographique Minor Third rem + règles de line-height | 2026-05-29 | ✅ Actif |
| [ADR-024](ADR-024-brand-palette-teal-accent-secondary.md) | Brand palette : Teal primaire, Accent rose, Secondary bordeaux | 2026-05-29 | ✅ Actif |
| [ADR-025](ADR-025-densite-espacement-math-tokens.md) | Densité d'espacement : floor/ceil sur grille 4px via math tokens | 2026-05-29 | ✅ Actif |
| [ADR-026](ADR-026-sync-figma-palettes-custom.md) | Stratégie de synchronisation Figma pour les palettes de marque custom | 2026-05-29 | ✅ Actif |
| [ADR-027](ADR-027-pipeline-impact-pre-commit.md) | Pipeline d'impact pré-commit avec approbation humaine | 2026-05-30 | ✅ Actif |
| [ADR-028](ADR-028-atkinson-hyperlegible-mono.md) | Atkinson Hyperlegible Mono comme police monospace tokenisée | 2026-05-30 | ✅ Actif |
| [ADR-029](ADR-029-quality-gate-pre-commit.md) | Quality gate pré-commit modulaire (pipelines extensibles) | 2026-05-30 | ✅ Actif |
| [ADR-030](ADR-030-style-dictionary-build-multi-platform.md) | Style Dictionary : build multi-plateforme avec formats custom | 2026-05-30 | ✅ Actif |
| [ADR-031](ADR-031-agtc-button-implementation.md) | agtc-button : pattern confirmation critical, loading, tokens partagés | 2026-05-30 | ✅ Actif |
| [ADR-032](ADR-032-storybook-stories-convention.md) | Convention des stories Storybook pour les composants Agentica | 2026-05-30 | ✅ Actif |
| [ADR-033](ADR-033-agtc-input-implementation.md) | Implémentation de `agtc-input` | 2026-05-31 | ✅ Actif |
| [ADR-034](ADR-034-agtc-badge-implementation.md) | Implémentation de `agtc-badge` | 2026-05-31 | ✅ Actif |
| [ADR-035](ADR-035-agtc-card-implementation.md) | Implémentation de `agtc-card` | 2026-05-31 | ✅ Actif |
| [ADR-036](ADR-036-ux-pattern-review-pre-composant.md) | Revue des patterns UX de référence avant publication d'un composant | 2026-05-31 | ✅ Actif |
| [ADR-037](ADR-037-agtc-checkbox-implementation.md) | Implémentation de `agtc-checkbox` | 2026-06-01 | ✅ Actif |
| [ADR-038](ADR-038-agtc-radio-implementation.md) | Implémentation de `agtc-radio` + `agtc-radio-group` | 2026-06-01 | ✅ Actif |
| [ADR-039](ADR-039-agtc-toggle-implementation.md) | Implémentation de `agtc-toggle` | 2026-06-01 | ✅ Actif |
| [ADR-040](ADR-040-agtc-table-implementation.md) | Implémentation de `agtc-table` | 2026-06-03 | ✅ Actif |
| [ADR-041](ADR-041-agtc-code-block-implementation.md) | Implémentation de `agtc-code-block` | 2026-06-03 | ✅ Actif |
| [ADR-042](ADR-042-agtc-banner-implementation.md) | Implémentation de `agtc-banner` | 2026-06-03 | ✅ Actif |
| [ADR-043](ADR-043-agtc-link-implementation.md) | Implémentation de `agtc-link` | 2026-06-04 | ✅ Actif |
| [ADR-044](ADR-044-agtc-segmented-implementation.md) | Implémentation de `agtc-segmented` | 2026-06-04 | ✅ Actif |
| [ADR-045](ADR-045-feedback-color-family-completion.md) | Complétion de la famille de couleurs sémantiques `feedback` | 2026-06-05 | ✅ Actif |
| [ADR-046](ADR-046-inverse-surfaces-shadows-tokens.md) | Surfaces inversées, ombres et jetons décoratifs | 2026-06-05 | ✅ Actif |
| [ADR-047](ADR-047-no-visited-nav-rule.md) | Règle système : pas d'état `:visited` sur la navigation | 2026-06-05 | ✅ Actif |
| [ADR-048](ADR-048-action-teal-wcag-contrast.md) | Teal interactif accessible : `action.primary` teal.9 → teal.11 (WCAG AA) | 2026-06-05 | ✅ Actif |
| [ADR-049](ADR-049-card-shadow-token.md) | Ombre de carte au repos tokenisée : `semantic.shadow.card` (solde ADR-046) | 2026-06-05 | ✅ Actif |
| [ADR-050](ADR-050-action-teal-contrast-real-surface.md) | Teal d'action accessible sur la surface réelle : primitif `teal.11` retuné (axe 76→0) | 2026-06-06 | ✅ Actif |
| [ADR-051](ADR-051-illustration-style-palette.md) | Style d'illustration « Tactile Tech » + palette sémantique `color.illustration` | 2026-06-06 | ✅ Actif |
| [ADR-052](ADR-052-dtcg-standard-conformance.md) | Conformité au standard W3C DTCG (designtokens.org) : `$schema` 3/3 fichiers + déclaration site | 2026-06-06 | ✅ Actif |
| [ADR-053](ADR-053-mobile-sidebar-drawer.md) | Navigation mobile : sidebar en drawer coulissant | 2026-06-10 | ✅ Actif |
| [ADR-054](ADR-054-tables-responsive-wrapper.md) | Tables responsives : wrapper `overflow-x:auto` | 2026-06-10 | ✅ Actif |
| [ADR-055](ADR-055-focus-visible-i18n-interactive.md) | `:focus-visible` systématique + i18n des éléments interactifs | 2026-06-10 | ✅ Actif |
| [ADR-056](ADR-056-agtc-tabs-implementation.md) | Implémentation de `agtc-tabs` | 2026-06-12 | ✅ Actif |
| [ADR-057](ADR-057-deux-contextes-utilisation.md) | Deux contextes d'utilisation : Produit (SaaS) et Marketing (Narratif) | 2026-06-12 | ✅ Actif |
| [ADR-058](ADR-058-redesign-site-theme-sombre.md) | Redesign du site : thème sombre et tokens d'extension CSS | 2026-06-12 | ✅ Actif |
| [ADR-059](ADR-059-semantic-tokens-hierarchy-completion.md) | Fermeture de la hiérarchie 3 niveaux : 18 tokens sémantiques intermédiaires | 2026-06-15 | ✅ Actif |
| [ADR-060](ADR-060-agtc-top-nav-implementation.md) | Implémentation de `agtc-top-nav` — tabs visuels full-height, nav inter-pages | 2026-06-15 | ✅ Actif |
| [ADR-061](ADR-061-agtc-top-nav-v1-1-bilinguisme-mobile-integration.md) | `agtc-top-nav` v1.1 : bilinguisme, mobile shadow DOM, intégration site | 2026-06-15 | ✅ Actif |
| [ADR-062](ADR-062-bundle-unique-wc-dogfooding-phase1.md) | Bundle unique `agtc.js` + dogfooding Web Components Phase 1 | 2026-06-15 | ✅ Actif |
| [ADR-063](ADR-063-agtc-feature-card.md) | Composant `agtc-feature-card` : architecture, variantes, revue UX | 2026-06-25 | ✅ Actif |
| [ADR-064](ADR-064-v2-light-mode-implementation.md) | Mode clair V2 : implémentation et correction du découplage dark/light (amende ADR-058) | 2026-06-25 | ✅ Actif |
| [ADR-065](ADR-065-dark-mode-tokens-storybook-chromatic.md) | Dark mode dual-mode : `semantic.dark.json` + Style Dictionary + Storybook/Chromatic | 2026-06-29 | ✅ Actif |
| [ADR-066](ADR-066-playwright-testing-strategy.md) | Stratégie de tests Playwright : deux périmètres distincts | 2026-07-02 | ✅ Actif |
| [ADR-067](ADR-067-letter-spacing-token-category.md) | Nouvelle catégorie de token `letterSpacing` — dette `agtc-code-block` | 2026-07-08 | ✅ Actif |
| [ADR-068](ADR-068-letter-spacing-scale-extension.md) | Extension de l'échelle `letterSpacing` — résorption dette `--agtc-tracking-*` du site | 2026-07-08 | ✅ Actif |
| [ADR-069](ADR-069-migration-suivi-projet-github-projects.md) | Migration du suivi de projet vers GitHub Projects (remplace ADR-016) | 2026-07-09 | ✅ Actif |

---

## Règles de ce registre

- Un ADR ne se supprime jamais — on le marque `remplacé` ou `déprécié`
- Un ADR est immutable une fois `actif` — toute modification = nouvel ADR
- Les agents lisent ce dossier pour comprendre les *pourquoi*, pas les *quoi*
- Tout TCR (Token Change Request) majeur doit référencer ou créer un ADR
