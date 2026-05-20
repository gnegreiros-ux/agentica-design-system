# Agentic Design System — Kit de démarrage

> Un système de design structuré pour être lu par les humains **et** par les agents IA.
> Basé sur les travaux présentés à l'AI Design Systems Conference 2026 (Into Design Systems).

---

## Principe fondamental

**Le dernier mot est toujours humain.**
Les agents proposent, détectent et exécutent.
Les décisions stratégiques, les exceptions et les valeurs appartiennent aux équipes.

---

## Structure du kit

```
agentic-design-system/
│
├── README.md                          ← vous êtes ici
├── DESIGN.md                          ← contrat portable de la marque
├── AGENTS.md                          ← routeur d'agents IA
├── How-to-designers.md                ← guide équipe design system (designers)
├── How-to-devs.md                     ← guide équipe design system (développeurs)
│
├── tokens/
│   ├── primitives.json                ← couche 1 — valeurs brutes
│   ├── semantic.json                  ← couche 2 — intentions UX
│   └── component.json                 ← couche 3 — contrats UI
│
├── style-dictionary/
│   └── config.json                    ← compilation CSS, JS, iOS, Android
│
├── scripts/
│   └── audit-tokens.js                ← audit dérives : orphelins, fantômes, hardcodés
│
├── .eslintrc-ds.json                  ← lint anti-dérive IA (hex, arbitrary values)
│
├── .claude/
│   ├── rules/                         ← contraintes et conventions du projet
│   │   ├── project-overview.md
│   │   ├── tokens-system.md
│   │   ├── development.md
│   │   ├── code-style.md
│   │   ├── git-workflow.md
│   │   └── components/button.md
│   ├── instructions/
│   │   ├── codebase-context.md        ← contexte technique complet
│   │   └── session-spec.md            ← spec condensée rechargée à chaque session IA
│   └── skills/
│       ├── ai-component-metadata.md
│       ├── ai-ds-composer.md
│       └── codebase-index.md
│
└── guidelines/
    ├── overview.md
    ├── foundations/
    │   ├── color.md
    │   ├── typography.md
    │   └── spacing.md
    └── components/
        ├── overview.md
        └── button.md                  ← contrat complet (exemple de référence)
```

---

## Démarrage rapide

### 1. Personnaliser
Remplacer les placeholders dans `DESIGN.md` et `.claude/rules/project-overview.md` :
- `[NOM_DU_SYSTÈME]`
- `[NOM_ORGANISATION]`
- `[NOM_RESPONSABLE]`

### 2. Installer les dépendances
```bash
npm install style-dictionary
npm install --save-dev eslint eslint-plugin-tailwindcss
```

### 3. Compiler les tokens
```bash
npx style-dictionary build --config style-dictionary/config.json
# → dist/css/   variables CSS
# → dist/js/    ES6 modules
# → dist/ios/   Swift
# → dist/android/ XML
```

### 4. Activer le lint
```bash
# Étendre votre config ESLint existante :
# { "extends": ["./.eslintrc-ds.json"] }
```

### 5. Lancer l'audit
```bash
node scripts/audit-tokens.js              # rapport console
node scripts/audit-tokens.js --fix-report # + audit-report.json
node scripts/audit-tokens.js --ci         # mode CI/CD — exit 1 si violations
```

---

## Architecture des tokens

```
Tokens primitifs    →   Tokens sémantiques   →   Tokens de composant
(valeurs brutes)        (intention UX)            (contrats UI)
primitives.json         semantic.json             component.json
```

**Règle absolue :** les primitifs ne sont jamais utilisés directement dans les composants.
Toujours passer par la couche sémantique.

---

## Ce que ce kit n'est pas

- ❌ Une bibliothèque de composants prête à l'emploi
- ❌ Un remplacement de Figma ou Storybook
- ❌ Un outil autonome — il requiert une équipe qui maintient les contrats

## Ce que ce kit est

- ✅ Une fondation architecturale pour un système agentique
- ✅ Un gabarit de gouvernance formalisée
- ✅ Un contrat lisible par les humains et les agents IA
- ✅ Un point de départ à adapter à votre organisation

---

## Sources

- *AI Design Systems Conference 2026* — Into Design Systems
- Romina Kavcic — The Design System Guide
- Jan Six — GitHub (Tokens Studio, IDS 2026)
- Cristian Morales Achiardi — Enara Health (IDS 2026)
- George William Amalan — *Your Design System Is a Suggestion Box*, Design Systems Collective, mai 2026
