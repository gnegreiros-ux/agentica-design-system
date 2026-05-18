# AGENTS.md — Routeur d'agents

> Ce fichier est le point d'entrée pour tout agent IA travaillant dans ce dépôt.
> Lis ce fichier en premier. Il te dit quoi lire, quoi faire, et quand escalader.

---

## Règle fondamentale

**Tu proposes. L'humain décide.**

Aucune modification de token, de contrat de composant ou de règle de gouvernance
ne peut être appliquée sans approbation humaine explicite.

---

## Architecture du contexte — Ce que tu dois lire

### Toujours lire en premier (always-read)
```
DESIGN.md                          ← principes, règles, contraintes globales
.claude/rules/project-overview.md  ← contexte du projet
.claude/rules/tokens-system.md     ← règles des tokens
guidelines/overview.md             ← entrée point du système
guidelines/components/overview.md  ← catalogue des composants
```

### Lire selon la tâche (on-demand)
```
.claude/rules/development.md       ← si tu génères du code
.claude/rules/code-style.md        ← si tu génères du code
.claude/rules/git-workflow.md      ← si tu crées une PR
.claude/rules/components/button.md ← si tu travailles sur Button
guidelines/foundations/color.md    ← si tu travailles sur les couleurs
guidelines/foundations/typography.md ← si tu travailles sur la typo
guidelines/components/button.md    ← contrat complet Button
```

### Capacités disponibles (skills)
```
.claude/skills/ai-component-metadata.md  ← auditer les métadonnées
.claude/skills/ai-ds-composer.md         ← assembler des patterns d'interface
.claude/skills/codebase-index.md         ← indexer et cartographier le système
```

---

## Les six agents et leurs rôles

| Agent | Rôle | Niveau d'autonomie |
|-------|------|--------------------|
| **Observer** | Surveille les dérives dans Figma et le code. Ne modifie rien. | Niveau 1 |
| **Orchestrator** | Coordonne les autres agents. Décide quoi automatiser et quand escalader. | Superviseur |
| **Auditor** | Évalue la santé du système. Génère des rapports de conformité. | Niveau 1–2 |
| **Guardian** | Protège l'intégrité des tokens. Ouvre des PRs de correction. | Niveau 2 |
| **Documenter** | Maintient la documentation synchronisée avec le système réel. | Niveau 3 |
| **Composer** | Assemble des patterns d'interface à partir du langage naturel. | Niveau 2–3 |

---

## Niveaux d'autonomie — ce que tu peux faire sans demander

| Niveau | Tu peux | Tu ne peux pas |
|--------|---------|----------------|
| **0** | Lire, analyser | Rien |
| **1** | Produire un rapport, signaler une dérive | Modifier quoi que ce soit |
| **2** | Ouvrir une PR, suggérer une correction | Merger sans approbation humaine |
| **3** | Mettre à jour la documentation | Modifier tokens ou contrats |
| **4** | — | Tout changement de token/contrat = approbation Principal Designer |

---

## Quand escalader — règles absolues

Escalade **immédiatement** à un humain si :
- Tu détectes un token de composant utilisé différemment de son contrat
- Une action demandée modifierait un token sémantique ou de composant
- Tu ne trouves pas de règle applicable pour une situation
- Le résultat attendu affecte l'accessibilité (WCAG 2.1)
- La demande concerne des données personnelles ou des systèmes critiques

---

## Dérives à détecter automatiquement (audit)

```
❌ Couleurs codées en dur    → ex: color: #3B82F6
❌ Tokens dépréciés          → ex: color.primary.old
❌ Composants sans intent    → métadonnées incomplètes
❌ Instances détachées Figma → composant surchargé localement
❌ Contraste insuffisant     → ratio < 4.5:1 pour le texte
❌ Focus absent              → composant interactif sans :focus-visible
```

---

## Structure des fichiers — carte complète

```
agentic-design-system/
├── DESIGN.md                    ← tu es ici si tu lis AGENTS.md
├── AGENTS.md                    ← ce fichier
│
├── tokens/
│   ├── primitives.json          ← valeurs brutes (ne jamais utiliser directement)
│   ├── semantic.json            ← intention UX
│   └── component.json           ← contrats institutionnels
│
├── style-dictionary/
│   └── config.json              ← compilation vers CSS, Tailwind, Angular Material
│
├── .claude/
│   ├── rules/                   ← contraintes et décisions du projet
│   ├── instructions/            ← méthodologie d'orchestration
│   └── skills/                  ← capacités exécutables réutilisables
│
└── guidelines/
    ├── overview.md
    ├── foundations/             ← couleur, typo, espacement
    └── components/              ← contrats de composants
```
