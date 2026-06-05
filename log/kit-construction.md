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
| 2026-05-31 — | Créé | `decisions/ADR-033-agtc-input-implementation.md` |
| 2026-05-31 — | Créé | `components/agtc-input.js` — Web Component Lit, 7 types, label/helper/error, toggle password, icônes hybrides |
| 2026-05-31 — | Créé | `components/agtc-input.stories.js` — 8 états + types + icônes + AllStates |
| 2026-05-31 — | Créé | `decisions/ADR-034-agtc-badge-implementation.md` |
| 2026-05-31 — | Modifié | `tokens/component.json` — ajout tokens badge (6 variantes × 2 tailles, 26 tokens) |
| 2026-05-31 — | Rebuild | `dist/tokens/` — tokens badge compilés dans CSS + JS + Swift + Android |
| 2026-05-31 — | Fix | `style-dictionary/build.js` → `build.cjs` — CJS incompatible avec "type":"module" |
| 2026-05-31 — | Fix | `components/agtc-icon.js` — API Lucide v1.x (structure [[tag,attrs]]) |
| 2026-05-31 — | Créé | `components/agtc-badge.js` — 6 variantes, 2 tailles, icônes, icon-only |
| 2026-05-31 — | Créé | `components/agtc-badge.stories.js` — 9 stories + AllVariants |
| 2026-05-31 — | Modifié | `.storybook/preview.js` — import agtc-badge.js |
| 2026-05-31 — | Modifié | `tokens/component.json` — tokens card : elevated / flat / padding-none / sm / lg |
| 2026-05-31 — | Rebuild | `dist/tokens/` — 12 tokens card compilés |
| 2026-05-31 — | Créé | `components/agtc-card.js` — 3 variantes, 4 paddings, slots header/body/footer |
| 2026-05-31 — | Créé | `components/agtc-card.stories.js` — 8 stories + AllVariants + composition |
| 2026-05-31 — | Créé | `decisions/ADR-035-agtc-card-implementation.md` |
| 2026-05-31 — | Modifié | `.storybook/preview.js` — import agtc-card.js |
| 2026-05-31 17:02 | Créé | `decisions/ADR-035-agtc-card-implementation.md` |
| 2026-05-31 20:26 | Modifié | `.claude/settings.json` |
| 2026-05-31 20:29 | Modifié | `decisions/ADR-015-hook-rappel-adr.md` |
| 2026-05-31 20:29 | Modifié | `decisions/ADR-015-hook-rappel-adr.md` |
| 2026-05-31 22:50 | Créé | `.claude/rules/ux-patterns-sources.md` |
| 2026-05-31 22:51 | Créé | `.claude/skills/ux-pattern-review.md` |
| 2026-05-31 22:51 | Créé | `.claude/skills/pipelines/ux-patterns.md` |
| 2026-05-31 22:51 | Modifié | `.claude/skills/quality-gate.md` |
| 2026-05-31 22:51 | Modifié | `.claude/skills/quality-gate.md` |
| 2026-05-31 22:51 | Modifié | `.claude/rules/post-change-pipeline.md` |
| 2026-05-31 22:52 | Créé | `.claude/settings.json` |
| 2026-05-31 22:53 | Modifié | `.claude/settings.json` |
| 2026-05-31 22:54 | Créé | `decisions/ADR-036-ux-pattern-review-pre-composant.md` |
| 2026-05-31 22:54 | Modifié | `decisions/README.md` |
| 2026-05-31 22:54 | Modifié | `AGENTS.md` |
| 2026-06-01 08:27 | Modifié | `decisions/ADR-033-agtc-input-implementation.md` |
| 2026-06-01 08:27 | Revue UX | `input` — patterns NN/g+IxDF approuvés (tous), 6 surfaces documentées (ADR-036) |
| 2026-06-01 08:45 | Modifié | `decisions/ADR-022-lucide-icons.md` |
| 2026-06-01 08:45 | Revue UX | `icon` — patterns NN/g+IF approuvés (tous), 5 surfaces (pas de story) — ADR-036/022 |
| 2026-06-01 09:16 | Modifié | `decisions/ADR-031-agtc-button-implementation.md` |
| 2026-06-01 09:16 | Revue UX | `button` — patterns NN/g+IxDF+Smashing approuvés (tous, B4 reformulé), 6 surfaces (ADR-031/036) |
| 2026-06-01 09:22 | Modifié | `decisions/ADR-034-agtc-badge-implementation.md` |
| 2026-06-01 09:22 | Revue UX | `badge` — patterns NN/g+Dashboard approuvés (tous, BA1 = reco), 6 surfaces (ADR-034/036) |
| 2026-06-01 09:32 | Modifié | `decisions/ADR-035-agtc-card-implementation.md` |
| 2026-06-01 09:32 | Revue UX | `card` — patterns Dashboard+Smashing (C1/C3/C4 approuvés, C2 révisé anti-imbrication), 6 surfaces (ADR-035/036) |
| 2026-06-01 09:56 | Refacto | `site/build.js` — section Patterns UX lue depuis les guidelines md (source unique), fin de la duplication codée en dur |
| 2026-06-01 10:59 | Modifié | `.claude/skills/pipelines/chromatic.md` |
| 2026-06-01 10:59 | Modifié | `.claude/skills/pipelines/chromatic.md` |
| 2026-06-01 10:59 | Modifié | `.claude/skills/pipelines/chromatic.md` |
| 2026-06-01 10:59 | Modifié | `.claude/skills/quality-gate.md` |
| 2026-06-01 11:00 | Modifié | `decisions/ADR-006-chromatic-tests-visuels.md` |
| 2026-06-01 11:00 | Créé | `components/agtc-icon.stories.js` — 6ᵉ surface (Storybook) de la revue UX `icon`, complète enfin l'entrée du 08:45 |
| 2026-06-01 11:00 | Activation | Chromatic activé (ADR-006) — workflow CI `.github/workflows/chromatic.yml`, token sorti de `package.json` vers secret GitHub `CHROMATIC_PROJECT_TOKEN` (régénéré, ancien révoqué), pipeline + quality-gate → Actif |
| 2026-06-01 11:00 | Fix CI | `chromatic.yml` — `npm install` au lieu de `npm ci` (lockfile racine désync : arête `@emnapi/core` sans nœud) |
| 2026-06-01 11:00 | Maintenance | Workflows — `actions/checkout` et `actions/setup-node` v4 → v5 (Node 24, dépréciation Node 20 du 2026-06-16) |
| 2026-06-01 13:41 | Créé | `decisions/ADR-037-agtc-checkbox-implementation.md` |
| 2026-06-01 13:41 | Modifié | `decisions/README.md` |
| 2026-06-01 14:10 | Revue UX | `checkbox` — patterns NN/g+IxDF approuvés (CB1–CB7), forme **carrée** (écart assumé vs réf. ToDo ronde), `indeterminate` inclus — ADR-036/037 |
| 2026-06-01 14:10 | Composant | `agtc-checkbox` créé — 6 surfaces : tokens `component.checkbox`, code, story, guideline, ADR-037, site. WCAG 0 violation, Storybook OK. Seul composant DS manquant identifié à partir d'une réf. ToDo |
| 2026-06-01 19:19 | Créé | `decisions/ADR-038-agtc-radio-implementation.md` |
| 2026-06-01 19:19 | Créé | `decisions/ADR-039-agtc-toggle-implementation.md` |
| 2026-06-01 19:21 | Modifié | `decisions/README.md` |
| 2026-06-01 19:25 | Revue UX | `radio` — patterns NN/g+IxDF approuvés (R1–R7), forme **ronde**, architecture groupe+radio (exclusivité shadow DOM) — ADR-036/038 |
| 2026-06-01 19:25 | Composant | `agtc-radio` + `agtc-radio-group` créés — 6 surfaces : tokens `component.radio`, code (role=radiogroup, focus roving, clavier flèches), 2 stories, guideline, ADR-038, site |
| 2026-06-01 19:25 | Revue UX | `toggle` — patterns NN/g+IxDF approuvés (T1–T7), `role="switch"`, état par position seule (WCAG 1.4.1), track-off proxy gray.9 — ADR-036/039 |
| 2026-06-01 19:25 | Composant | `agtc-toggle` créé — 6 surfaces : tokens `component.toggle`, code (effet immédiat), story, guideline, ADR-039, site. WCAG 0 violation (57 pages), Storybook OK |
| 2026-06-01 20:51 | Modifié | `decisions/ADR-038-agtc-radio-implementation.md` |
| 2026-06-01 20:55 | Ajustement | `agtc-radio-group` — retrait de `Entrée` (garde `Espace` seul) pour coller au pattern WAI-ARIA strict ; 4 surfaces synchronisées (code, guideline, ADR-038, site) ; re-vérifié au navigateur |
| 2026-06-02 | Fix a11y | `agtc-checkbox` — ajout du garde `prefers-reduced-motion` (transitions `.box` désactivées) ; homogénéise les 3 contrôles de sélection (checkbox/radio/toggle) |
| 2026-06-02 | Fix site | `site/build.js` (`tokensCSS`) — émission des espacements primitifs `--agtc-primitive-space-N` manquants dans `tokens.css`. Corrige le padding nul des badges (et card sm/lg) qui référençaient ces vars indéfinies. Vérifié au navigateur (padding 4px/12px) |
| 2026-06-02 | Garde-fou | `site/build.js` (`validateCssVars`) — le build échoue désormais si une `var(--agtc-…)` sans fallback est référencée sans définition (anti-régression du bug ci-dessus). Exclut les exemples `<pre>`/`<code>`. Build : 580 définies · 95 référencées · 0 fantôme |
| 2026-06-03 19:57 | Créé | `decisions/ADR-040-agtc-table-implementation.md` |
| 2026-06-03 19:57 | Modifié | `decisions/README.md` |
| 2026-06-03 | Gap-analysis | UI du site → composants : cat. A (dogfooding : ds-btn→button, cards, badges), cat. B (manquants : table, code-block, banner, link, segmented), cat. C (chrome doc). Démarrage cat. B = `agtc-table` (692 usages `token-row`) |
| 2026-06-03 | Revue UX | `table` — patterns NN/g (Data Tables) + Smashing + Dashboard approuvés (T1–T10) ; séparateurs par défaut + `striped` option (T4) ; tri/filtre/pagination hors v1 mais **porte ouverte** (T10) — ADR-036/040 |
| 2026-06-03 | Composant | `agtc-table` créé — 6 surfaces : tokens `component.table`, code (mix : composant piloté par données shadow DOM + classe `.agtc-table` light DOM), story, guideline, ADR-040, site (page + nav + sidebar). Lecture seule, accessible (scope/caption/scroll). Vérifié au navigateur (site + shadow DOM, 0 erreur console). Build : 592 définies · 105 référencées · 0 fantôme |
| 2026-06-03 21:11 | Créé | `decisions/ADR-041-agtc-code-block-implementation.md` |
| 2026-06-03 21:11 | Modifié | `decisions/README.md` |
| 2026-06-03 | Revue UX | `code-block` — patterns DEV/whitep4nth3r + roboleary + Sara Soueidan (aria-live) + NN/g approuvés (CD1–CD9) ; coloration syntaxique (CD7) + numéros de ligne (CD9) hors v1, **porte ouverte** — ADR-036/041 |
| 2026-06-03 | Token | `primitive.fontFamily.mono` + `semantic.typography.mono.family` ajoutés (police monospace enfin tokenisée — applique ADR-028) ; `--agtc-font-mono` du site pointe désormais vers le token |
| 2026-06-03 | Composant | `agtc-code-block` créé — 6 surfaces : tokens `component.code-block` (surface sombre gray.12 tokenisée), code (mix : composant slotté shadow DOM + classe `.code-block`), story, guideline, ADR-041, site (page + nav + sidebar + `site.js` mis à niveau a11y : aria-label/focus/aria-live + label de langue). Lecture seule, copiable. Vérifié au navigateur (site + shadow DOM, copie annoncée, 0 erreur). Build : 604 définies · 125 référencées · 0 fantôme |
| 2026-06-03 21:57 | Créé | `decisions/ADR-042-agtc-banner-implementation.md` |
| 2026-06-03 21:57 | Modifié | `decisions/README.md` |
| 2026-06-03 | Revue UX | `banner` — patterns NN/g (Indicators/Notifications) + MDN (alert/status role) + A11Y Collective + Dashboard approuvés (N1–N9) ; statique par défaut (pas de live region), opt-in `live` ; sévérité jamais par la couleur seule — ADR-036/042 |
| 2026-06-03 | Composant | `agtc-banner` créé — 6 surfaces : tokens `component.banner` (6 variantes alignées badge, accent mutualisé bordure+icône), code (mix : composant slotté shadow DOM + classe `.agtc-banner`), story, guideline, ADR-042, site (page + nav + sidebar). Message inline, `dismissible` (événement `dismiss`), préfixe de sévérité masqué pour AT. Bug dismiss corrigé (masquage via `:host([hidden])`). Vérifié au navigateur (site + shadow DOM, dismiss OK). Build : 624 définies · 145 référencées · 0 fantôme |
| 2026-06-04 20:41 | Créé | `decisions/ADR-043-agtc-link-implementation.md` |
| 2026-06-04 20:41 | Modifié | `decisions/README.md` |
| 2026-06-04 | Revue UX | `link` — patterns NN/g (Visualizing Links) + WCAG H83 (nouvel onglet) approuvés (LK1–LK8) ; soulignement `always` par défaut (WCAG 1.4.1), externe = noopener + icône + texte AT, état visité hors v1 — ADR-036/043 |
| 2026-06-04 | Composant | `agtc-link` créé — 6 surfaces : tokens `component.link`, code (mix : composant shadow DOM + classe `.agtc-link`), story, guideline, ADR-043, site (page + nav + sidebar + utilitaire `.visually-hidden`). Lien de navigation, auto-détection externe, avertissement texte générique. Vérifié au navigateur (site + shadow DOM). Build : 627 définies · 148 référencées · 0 fantôme |
| 2026-06-04 21:02 | Créé | `decisions/ADR-044-agtc-segmented-implementation.md` |
| 2026-06-04 21:02 | Modifié | `decisions/README.md` |
| 2026-06-04 | Revue UX | `segmented` — patterns Primer (Segmented Control) + NN/g + WCAG 1.4.1 approuvés (SG1–SG8) ; groupe de boutons + aria-current + effet immédiat (écart assumé vs radiogroup), navigation Tab native — ADR-036/044 |
| 2026-06-04 | Composant | `agtc-segmented` créé — 6 surfaces : tokens `component.segmented`, code (mix : composant piloté par données shadow DOM + classe `.agtc-segmented`), story, guideline, ADR-044, site (page + nav + sidebar). Mono-sélection effet immédiat, émet `change`. Vérifié au navigateur (site + shadow DOM : clic → aria-current + change émis). **Clôt la catégorie B** de la gap-analysis (table, code-block, banner, link, segmented). Build : 634 définies · 155 référencées · 0 fantôme |
| 2026-06-04 | Dogfooding | Cat. A — `contributionBanner()` migré : consomme `.agtc-banner brand` + `.agtc-link` (ADR-042/043), HTML/CSS bespoke `.contribution-banner` supprimé. Fix robustesse de la classe banner (`.banner-content span` → `> span` : évite que le corps écrase la couleur du titre/lien imbriqués). Refactor (pas de nouvel ADR). Vérifié au navigateur. Build : 634 · 155 · 0 fantôme |
| 2026-06-04 | Dogfooding | Cat. A — bascule de langue du header migrée : .lang-toggle-group/.lang-btn vers .agtc-segmented .lang-switch (ADR-044) + aria-current. site.js mis a jour (selecteur .lang-switch button, exclut <html data-lang> et les demos). CSS bespoke supprime (override compact conserve, pas de taille sm). Verifie : bascule FR/EN OK, demos non affectees. Build : 634 - 0 fantome |
| 2026-06-04 | Dogfooding | Cat. A — renommage `.ds-btn` vers `.agtc-button` (CSS + ~22 usages). La classe consommait deja les tokens `--agtc-component-button-*` : pur renommage, ZERO changement visuel, elimine la dette du prefixe legacy `ds-` (reperee a la gap-analysis). Verifie au navigateur (4 variantes identiques). Build : 634 - 0 fantome |
| 2026-06-04 | Dogfooding | Cat. A — badge de statut migre : `.badge`/`.badge-active` (couleurs EN DUR #ecfdf5/#18794e) -> classe `.agtc-badge success sm` tokenisee (6 variantes, consomme `--agtc-component-badge-*`, ADR-034). Corrige une vraie dette de tokens + dogfoode le badge. 2 usages (index decisions + meta ADR). Verifie au navigateur (44 badges, green.3/green.11). Note : #ecfdf5/#18794e subsistent dans .rule-can/.audit-* (dette separee). Build : 634 - 0 fantome |
| 2026-06-04 | Dogfooding | Cat. A — tables du site : le style de base `table`/`th`/`td`/`tr:hover` route desormais ses COULEURS via `component.table.*` (ADR-040) au lieu des semantiques directes. Le site s aligne sur le contrat du composant (principe : le site consomme le DS). Seul changement visuel : corps des tables text.secondary -> text.primary (gris.12, plus lisible). 27 token-tables + toutes les autres, zero changement markup. Verifie au navigateur. Build : 634 - 0 fantome |
| 2026-06-04 | Dogfooding | Cat. A — liens de contenu : le style de base `a` route sa couleur via `component.link.*` (ADR-043) + ajout du `a:hover` du contrat composant (teal.9 -> teal.10). Le site suit le composant. Couleur de base inchangee (meme valeur), hover ajoute. Verifie au navigateur. Build : 634 - 0 fantome |
