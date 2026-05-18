# Agentic Design System

Système de design conçu pour être compris et opéré à la fois par des humains et par des agents IA.

Il encode les décisions d'interface sous forme de tokens structurés, de contrats de composants et de règles lisibles par machine — afin que les agents puissent appliquer correctement les décisions de l'équipe, sans improviser.

> **Le dernier mot est toujours humain.** Les agents proposent. Les humains approuvent.

---

## Principe fondamental

Ce système repose sur une séparation nette entre ce que les agents peuvent faire seuls et ce qui requiert une décision humaine. Les règles de gouvernance sont versionnées avec le code, lisibles par machine, et opposables à tout agent.

```
Si ce n'est pas un token, ce n'est pas une décision.
Toute valeur locale est une dette.
```

---

## Architecture des tokens

Trois niveaux de tokens forment le cœur du système :

```
Tokens primitifs   →   Tokens sémantiques   →   Tokens de composant
(valeurs brutes)        (intention UX)            (contrats institutionnels)
```

| Niveau | Fichier | Rôle | Exemple |
|--------|---------|------|---------|
| Primitif | `tokens/primitives.json` | Valeurs physiques brutes | `primitive.color.blue.700` |
| Sémantique | `tokens/semantic.json` | Intention UX, langage métier | `color.action.primary` |
| Composant | `tokens/component.json` | Contrats UI institutionnels | `button.critical.requiresConfirmation` |

**Règles absolues :**
- Les tokens primitifs ne sont jamais utilisés directement dans les composants
- Les tokens sémantiques encodent l'intention, pas la valeur
- Toute modification d'un token de composant requiert l'approbation du Principal Designer
- Aucune couleur ou espacement en dur dans le code

---

## Structure du dépôt

```
agentic-design-system/
│
├── DESIGN.md                    ← Contrat portable de la marque (humain + agent)
├── AGENTS.md                    ← Routeur d'agents — lire en premier
│
├── tokens/
│   ├── primitives.json          ← Valeurs brutes (ne jamais utiliser directement)
│   ├── semantic.json            ← Intention UX
│   └── component.json           ← Contrats institutionnels
│
├── style-dictionary/
│   └── config.json              ← Compilation vers CSS, JS, TypeScript, Swift, Android
│
├── guidelines/
│   ├── overview.md              ← Entrée du système de guidelines
│   ├── foundations/
│   │   ├── color.md
│   │   ├── typography.md
│   │   └── spacing.md
│   └── components/
│       ├── overview.md          ← Catalogue des composants
│       └── button.md            ← Contrat complet (Annexe I)
│
└── .claude/
    ├── rules/                   ← Contraintes et décisions du projet
    ├── instructions/            ← Méthodologie d'orchestration
    └── skills/                  ← Capacités exécutables réutilisables
```

---

## Les six agents

| Agent | Rôle | Niveau d'autonomie |
|-------|------|--------------------|
| **Observer** | Surveille les dérives dans Figma et le code. Ne modifie rien. | 1 |
| **Auditor** | Évalue la santé du système. Génère des rapports de conformité. | 1–2 |
| **Guardian** | Protège l'intégrité des tokens. Ouvre des PRs de correction. | 2 |
| **Documenter** | Maintient la documentation synchronisée avec le système réel. | 3 |
| **Composer** | Assemble des patterns d'interface depuis le langage naturel. | 2–3 |
| **Orchestrator** | Coordonne les autres agents. Décide quoi automatiser et quand escalader. | Superviseur |

### Niveaux d'autonomie

| Niveau | Autorisé | Interdit |
|--------|----------|----------|
| 0 | Lire, analyser | Tout |
| 1 | Rapports, signalements | Toute modification |
| 2 | Ouvrir une PR, suggérer une correction | Merger sans approbation |
| 3 | Mettre à jour la documentation | Modifier tokens ou contrats |
| 4 | — | Tout changement de token/contrat sans approbation Principal Designer |

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Web Components | Lit (Google) | Contrats UI universels |
| Compilation tokens | Style Dictionary 4 | JSON → CSS / JS / TypeScript / Swift / Android |
| Tests visuels | Chromatic | Régressions visuelles |
| Tests accessibilité | axe-core | Audit automatique WCAG 2.1 |
| Tests E2E | Playwright | Parcours complets |
| Documentation | Storybook | Canvas, preview, spécifications |
| Sync Figma | Tokens Studio | Figma ↔ JSON |

---

## Accessibilité — Non négociable

| Règle | Standard | Seuil |
|-------|----------|-------|
| Contraste texte | WCAG 2.1 AA | 4.5:1 minimum |
| Contraste grandes interfaces | WCAG 2.1 AA | 3:1 minimum |
| Focus visible | WCAG 2.1 AA | Obligatoire sur tous les éléments interactifs |
| Navigation clavier | WCAG 2.1 | Tous les composants |

Aucun composant ne peut être mergé sans avoir passé l'audit d'accessibilité.

---

## Démarrage rapide

### Compiler les tokens

```bash
# Installation
npm install

# Compiler vers tous les formats (CSS, JS, TypeScript, Swift, Android)
npm run build

# Résultat dans dist/
# dist/css/       → primitives.css, semantic.css, component.css, all.css
# dist/js/        → tokens.js, tokens.cjs
# dist/ts/        → tokens.d.ts
# dist/json/      → tokens.json, tokens-flat.json
# dist/android/   → colors.xml, dimens.xml
# dist/ios/       → StyleDictionaryColor.swift, StyleDictionarySize.swift
```

### Utiliser les tokens dans un composant

```css
/* Toujours via CSS Custom Properties — jamais de valeur en dur */
button {
  background: var(--ds-component-button-primary-background);
  color: var(--ds-component-button-primary-text);
  padding: var(--ds-component-button-primary-padding-y)
           var(--ds-component-button-primary-padding-x);
  border-radius: var(--ds-component-button-primary-radius);
}

button:focus-visible {
  outline: 2px solid var(--ds-semantic-color-border-focus);
  outline-offset: 2px;
}
```

---

## Composants disponibles

| Composant | Statut | Variantes |
|-----------|--------|-----------|
| Button | ✅ Agent-ready | primary, secondary, critical, ghost |
| Input | Partiel | default, error, disabled |
| Modal | À documenter | default |
| Badge | Partiel | success, warning, danger, info |
| Card | Partiel | default |

**Avant de travailler sur un composant :** lire son contrat dans `guidelines/components/` et les règles dans `.claude/rules/components/`.

---

## Gouvernance

### Ce qu'un agent peut faire

- Créer une branche `fix/` ou `docs/`
- Faire des commits sur une branche feature
- Ouvrir une PR avec description complète
- Mettre à jour la documentation (niveau 3)

### Ce qu'un agent ne peut pas faire

- Merger une PR sans approbation humaine
- Pusher directement sur `main` ou `develop`
- Modifier `tokens/component.json` sans approbation explicite
- Supprimer un token sans audit d'impact

### Dérives détectées automatiquement

```
❌ Couleurs codées en dur    → color: #3B82F6
❌ Tokens dépréciés utilisés → color.primary.old
❌ Composants sans intent    → métadonnées incomplètes
❌ Contraste insuffisant     → ratio < 4.5:1
❌ Focus absent              → composant interactif sans :focus-visible
```

---

## Valeurs du projet

1. **Souveraineté numérique** — Les données, décisions et outils restent sous contrôle organisationnel.
2. **Accessibilité** — WCAG 2.1 AA minimum. Non contournable.
3. **Auditabilité** — Toute décision est traçable, versionnée, justifiée.
4. **Auto-guérison encadrée** — Les dérives sont détectées automatiquement, corrigées avec approbation humaine.

---

## Pour aller plus loin

- [`DESIGN.md`](./DESIGN.md) — Contrat portable de la marque
- [`AGENTS.md`](./AGENTS.md) — Routeur d'agents, première lecture obligatoire
- [`guidelines/overview.md`](./guidelines/overview.md) — Entrée du système de guidelines
- [Style Dictionary](https://styledictionary.com) — Documentation de compilation
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) — Standard d'accessibilité
