# Journal de construction — Système de design agentique Kit

> Toutes les modifications aux fichiers de configuration, règles, et décisions du kit.
> Mis à jour automatiquement par hook `PostToolUse` à chaque modification.
> **Hors scope :** modifications de contenu (`tokens/`, `guidelines/`, `components/`).

| Horodatage       | Action  | Fichier |
|------------------|---------|---------|
| 2026-05-28 00:00 | Créé    | `AGENTS.md` |
| 2026-05-28 00:00 | Créé    | `DESIGN.md` |
| 2026-05-28 00:00 | Créé    | `.claude/rules/project-overview.md` |
| 2026-05-28 00:00 | Créé    | `.claude/rules/tokens-system.md` |
| 2026-05-28 00:00 | Créé    | `.claude/rules/git-workflow.md` |
| 2026-05-28 00:00 | Créé    | `.claude/rules/development.md` |
| 2026-05-28 00:00 | Créé    | `.claude/rules/code-style.md` |
| 2026-05-28 00:00 | Créé    | `.claude/rules/components/button.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-001-trois-niveaux-tokens.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-002-lit-web-components.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-003-style-dictionary.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-004-gouvernance-humaine.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-005-variante-critical-vs-danger.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-006-chromatic-tests-visuels.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-007-axe-core-accessibilite.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-008-radix-colors.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-009-storybook.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-010-playwright.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-011-tokens-studio.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-012-audit-tokens-script.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-013-design-md-contrat-portable.md` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-014-conventional-commits.md` |
| 2026-05-28 00:00 | Créé    | `.claude/settings.json` |
| 2026-05-28 00:00 | Créé    | `decisions/ADR-015-hook-rappel-adr.md` |
| 2026-05-28 00:00 | Modifié | `decisions/README.md` |
| 2026-05-28 16:41 | Créé | `decisions/ADR-016-journal-construction.md` |
| 2026-05-28 16:41 | Modifié | `decisions/README.md` |
| 2026-05-28 23:27 | Créé | `decisions/ADR-017-correction-contraste-text-disabled.md` |
| 2026-05-28 23:55 | Créé | `decisions/ADR-018-migration-references-primitives-radix.md` |
| 2026-05-29 00:08 | Créé | `decisions/ADR-019-resolution-dynamique-tokens-build.md` |
| 2026-05-29 08:13 | Modifié | `AGENTS.md`, `DESIGN.md`, `README.md`, `How-to-designers.md`, `How-to-devs.md` |
| 2026-05-29 08:14 | Créé | `decisions/ADR-020-grille-4px.md` |
| 2026-05-29 08:16 | Créé | `decisions/ADR-021-atkinson-hyperlegible.md` |
| 2026-05-29 08:16 | Créé | `decisions/ADR-022-lucide-icons.md` |
| 2026-05-29 08:16 | Créé | `components/ds-icon.js`, `guidelines/components/icon.md` |
| 2026-05-29 09:13 | Créé | `.claude/instructions/session-spec.md` |
| 2026-05-29 09:16 | Modifié | `DESIGN.md` — nom système complet + note de réutilisation |
| 2026-05-29 09:30 | Modifié | `site/build.js`, tous fichiers sources — renommage "Agentic Design System" → "Système de design agentique" |
| 2026-05-29 09:45 | Modifié | `site/build.js`, `site/dist/` — remplacement de tous les emojis UI par des icônes Lucide SVG inline |
| 2026-05-29 09:32 | Modifié | `.claude/hooks/log-kit-construction.sh` |
| 2026-05-29 09:33 | Modifié | `.claude/hooks/log-kit-construction.sh` |
| 2026-05-29 10:13 | Créé | `.claude/instructions/site-checklist.md` |
| 2026-05-29 — | Modifié | `site/build.js`, `site/dist/` — traduction EN complète de toutes les pages internes (couleur, espacement, typo, icônes, composants, button, icon, tokens, décisions, agents, sidebars) |
| 2026-05-29 — | Modifié | `site/build.js`, `site/dist/site.js` — partage version EN via paramètre URL `?lang=en` (replaceState au clic) |
| 2026-05-29 — | Modifié | `site/build.js`, `site/dist/index.html` — correction lien GitHub : `gnegreiros/` → `gnegreiros-ux/agentic-design-system` |
| 2026-05-29 — | Modifié | `site/build.js`, `site/dist/site.css` — fix swatch couleur dans tableau tokens sémantiques : ajout `display:inline-block` |
| 2026-05-29 — | Modifié | `site/build.js`, `site/dist/site.css`, `site/dist/foundations/spacing.html` — preview espacement en liste verticale, suppression `border-top` du label |
| 2026-05-29 19:43 | Créé | `decisions/ADR-023-echelle-typographique-minor-third.md` |
| 2026-05-29 19:43 | Créé | `decisions/ADR-024-brand-palette-teal-accent-secondary.md` |
| 2026-05-29 19:44 | Créé | `decisions/ADR-025-densite-espacement-math-tokens.md` |
| 2026-05-29 19:44 | Modifié | `tokens/primitives.json` — palettes brand (accent, secondary), échelle typo Minor Third rem (xs→5xl), lineHeight (reading/heading/display), densité (normal/comfortable/compact) |
| 2026-05-29 19:44 | Modifié | `tokens/semantic.json` — action.primary → teal.9, border.focus → teal.9, nouveau groupe color.brand, typo étendue (detail/label/body/h5→h1/hero), espacement avec math tokens densité |
| 2026-05-29 19:54 | Créé | `decisions/ADR-026-sync-figma-palettes-custom.md` |
| 2026-05-29 19:54 | Modifié | `decisions/ADR-024-brand-palette-teal-accent-secondary.md` |
| 2026-05-29 20:13 | Créé | `decisions/ADR-025-densite-espacement-math-tokens.md` |
| 2026-05-29 20:33 | Modifié | `decisions/README.md` |
