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
| 2026-05-30 — | Créé | `Prototype redesign site web système de design/` — prototype de redesign du site (index.html, color.html, site.css, site.js, tokens.css, images d'inspiration) |
| 2026-05-30 — | Modifié | `site/build.js`, `site/dist/foundations/typography.html` — échelle Minor Third (9 échelons xs→5xl, rem, line-height, poids), spécimens visuels, 3 modes lineHeight (reading/heading/display) |
| 2026-05-30 — | Modifié | `site/build.js`, `site/dist/foundations/spacing.html` — section densité math tokens (compact ×0.75, normal ×1.0, comfortable ×1.25), formule floor/ceil, ADR-025 |
| 2026-05-30 — | Modifié | `site/dist/` — rebuild complet, synchronisation ADR-023→026, tokens.css, couleur, index |
| 2026-05-30 10:54 | Créé | `.claude/skills/post-change-pipeline.md` |
| 2026-05-30 10:54 | Créé | `.claude/rules/post-change-pipeline.md` |
| 2026-05-30 10:56 | Créé | `decisions/ADR-027-pipeline-impact-pre-commit.md` |
| 2026-05-30 10:59 | Modifié | `decisions/README.md` |
| 2026-05-30 — | Modifié | `site/dist/` — rebuild, page ADR-027 générée (36 fichiers total)
| 2026-05-30 11:37 | Modifié | `DESIGN.md` |
| 2026-05-30 — | Modifié | `site/build.js`, `README.md`, `DESIGN.md` — changement de marque : "Système de design agentique" → **Agentica**, URL → designsystem.gnegreiros.com, hero + logo + meta mis à jour |
| 2026-05-30 — | Modifié | `site/dist/` — rebuild complet (36 fichiers), toutes les pages avec nouvelle identité Agentica
| 2026-05-30 — | Créé    | `Brand/` — dossier brand : logo SVG/PNG (5 variantes + symbole), favicons (ico, 16/32px, apple-touch, android-chrome), palette, color-pattern, image sociale |
| 2026-05-30 — | Modifié | `site/build.js`, `site/dist/` — logo SVG teal en header, favicons réels (Brand/Favicon/), webmanifest Agentica, métadonnées OG/Twitter optimisées (title 54 car, description 142 car, twitter:domain/url ajoutés) |
| 2026-05-30 17:58 | Créé | `decisions/ADR-028-atkinson-hyperlegible-mono.md` |
| 2026-05-30 17:58 | Modifié | `decisions/README.md` |
| 2026-05-30 18:12 | Créé | `.claude/skills/quality-gate.md` |
| 2026-05-30 18:12 | Créé | `.claude/skills/pipelines/tokens-audit.md` |
| 2026-05-30 18:13 | Créé | `.claude/skills/pipelines/wcag.md` |
| 2026-05-30 18:13 | Créé | `.claude/skills/pipelines/adr-conformity.md` |
| 2026-05-30 18:13 | Créé | `.claude/skills/pipelines/adr-triggers.md` |
| 2026-05-30 18:14 | Créé | `.claude/skills/pipelines/docs.md` |
| 2026-05-30 18:14 | Créé | `.claude/skills/pipelines/site.md` |
| 2026-05-30 18:14 | Créé | `.claude/skills/pipelines/commit.md` |
| 2026-05-30 18:14 | Créé | `.claude/skills/pipelines/style-dictionary.md` |
| 2026-05-30 18:15 | Créé | `.claude/skills/pipelines/storybook.md` |
| 2026-05-30 18:15 | Créé | `.claude/skills/pipelines/chromatic.md` |
| 2026-05-30 18:15 | Créé | `.claude/skills/pipelines/axe-core.md` |
| 2026-05-30 18:15 | Créé | `.claude/skills/pipelines/playwright.md` |
| 2026-05-30 18:15 | Créé | `decisions/ADR-029-quality-gate-pre-commit.md` |
| 2026-05-30 18:16 | Modifié | `decisions/README.md` |
| 2026-05-30 18:16 | Créé | `.claude/rules/post-change-pipeline.md` |
| 2026-05-30 — | Modifié | Tous les fichiers source — renommage sigle `sda` → `agtc`, préfixe CSS `--sda-` → `--agtc-`, balises WC `sda-icon/sda-button` → `agtc-icon/agtc-button`, localStorage `sda-lang` → `agtc-lang` |
| 2026-05-30 — | Créé | `package.json` — racine du monorepo, script `npm run tokens` |
| 2026-05-30 — | Créé | `.gitignore` — exclut `node_modules/`, `.tokens-build-tmp/` |
| 2026-05-30 — | Créé | `style-dictionary/build.js` — build SD avec parseur DTCG, transform `attribute/level`, formats custom Tailwind + M3 Angular |
| 2026-05-30 — | Modifié | `style-dictionary/config.json` — préfixe `sda` → `agtc`, ajout plateformes tailwind / angular / ios / android |
| 2026-05-30 — | Généré | `dist/tokens/css/` — primitives.css / semantic.css / components.css / all.css (--agtc- prefix, outputReferences) |
| 2026-05-30 — | Généré | `dist/tokens/js/tokens.js` — exports ES6 |
| 2026-05-30 — | Généré | `dist/tokens/tailwind/tokens.js` — extension theme.extend Tailwind |
| 2026-05-30 — | Généré | `dist/tokens/angular/_m3-theme.scss` — palettes M3 + alias SCSS |
| 2026-05-30 — | Généré | `dist/tokens/ios/AgenticaTokens.swift` — classe Swift |
| 2026-05-30 — | Généré | `dist/tokens/android/` — XML couleurs + dimensions |
| 2026-05-30 — | Créé | `decisions/ADR-030-style-dictionary-build-multi-platform.md` |
| 2026-05-30 — | Modifié | `decisions/README.md` — ajout ADR-030 |
| 2026-05-30 — | Créé | `components/agtc-button.js` — Web Component Lit, 4 variantes, confirmation critical 2-clics, loading width-stable |
| 2026-05-30 — | Modifié | `package.json` — ajout Lit (devDependency + peerDependency) |
| 2026-05-30 21:02 | Créé | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-05-30 21:02 | Modifié | `decisions/README.md` |
| 2026-05-30 21:09 | Modifié | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-05-30 21:09 | Modifié | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-05-30 21:09 | Modifié | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-05-30 21:19 | Modifié | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-05-30 21:19 | Modifié | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-05-30 — | Modifié | `components/agtc-button.js` — propriétés `icon` + `icon-suffix`, fallback slot, approche hybride |
| 2026-05-30 — | Modifié | `decisions/ADR-031-agtc-button-implementation.md` — décisions 10/11/12 : hybride, compat frameworks, icon-only |
| 2026-05-30 — | Modifié | `site/build.js` — démo icônes, tableau compat frameworks, CSS icon-only, rebuild 40 fichiers |
| 2026-05-30 22:39 | Créé | `decisions/ADR-032-storybook-stories-convention.md` |
| 2026-05-30 — | Phase 3 | **Storybook + Chromatic** — installation et configuration |
| 2026-05-30 — | Installé | `@storybook/web-components-vite` v10, `@storybook/addon-a11y`, `@chromatic-com/storybook` |
| 2026-05-30 — | Créé | `.storybook/main.js` — framework web-components-vite, stories colocalisées dans `components/` |
| 2026-05-30 — | Créé | `.storybook/preview.js` — tokens CSS Agentica injectés, addon-a11y en mode error |
| 2026-05-30 — | Créé | `components/agtc-button.stories.js` — 4 variantes × états + flux critical + icônes + AllVariants |
| 2026-05-30 — | Modifié | `package.json` — ajout `"type":"module"`, scripts `chromatic`, dépendance `lucide` |
| 2026-05-30 — | Créé | `vitest.config.js` — intégration Storybook + Vitest (via addon-vitest) |
| 2026-05-30 — | Mis à jour | `decisions/ADR-032-storybook-stories-convention.md` — convention stories complète |
