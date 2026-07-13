# ADR-012 — Détection de dérive par script d'audit (audit-tokens.js)

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Tech Lead, Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-012-audit-tokens-script.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** scripts/audit-tokens.js, tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md

> **English summary:** Introduces `scripts/audit-tokens.js`, a dependency-free internal script that detects four types of token drift (orphaned, phantom, hardcoded values, direct primitive use) and can block CI in `--ci` mode. It was built in-house rather than adopting an external tool because it needs project-specific knowledge (the three JSON files, the `--ds-` prefix, the three levels) that a generic linter can't reproduce.
>
> *The original French version follows below — preserved unaltered as the historical record.*

---

## Contexte

L'ADR-001 interdit les valeurs en dur et les tokens primitifs dans les composants.
L'ADR-004 établit que les agents détectent les dérives, les humains corrigent.

Mais la détection des dérives ne peut pas reposer uniquement sur la vigilance humaine
lors des code reviews. Dans un système agentique, la dérive peut être introduite
à tout moment, par un humain ou par un agent, silencieusement.

Quatre types de dérive ont été identifiés comme prioritaires :

| Type | Description | Exemple |
|------|-------------|---------|
| **Token orphelin** | Défini dans `component.json`, jamais utilisé dans le code | `button.ghost.border` non référencé |
| **Token fantôme** | Utilisé dans le code, absent de `semantic.json` | `var(--agtc-semantic-color-action-secondary)` inexistant |
| **Valeur hardcodée** | Hex, RGB, px arbitraire dans le code | `color: #3B82F6` au lieu de `var(--ds-color-action-primary)` |
| **Primitif direct** | Token primitif utilisé dans un composant | `var(--agtc-primitive-color-blue-9)` dans un Web Component |

La question posée était :

> **Comment détecter ces quatre types de dérive de manière automatique,
> reproductible, et bloquante en CI — sans dépendre d'un outil externe ?**

---

## Décision

Développement d'un script d'audit interne : `scripts/audit-tokens.js`.

Le script est délibérément minimaliste — un seul fichier Node.js sans dépendances,
exécutable directement avec `node scripts/audit-tokens.js`.

Il opère en quatre audits séquentiels :

1. **Tokens orphelins** — compare `component.json` avec les usages dans le code source
2. **Tokens fantômes** — détecte les `var(--agtc-semantic-*)` sans équivalent dans `semantic.json`
3. **Valeurs hardcodées** — regex sur hex, rgb, hsl, Tailwind arbitrary values, px inline
4. **Structure des trois couches** — vérifie que les références entre couches sont résolubles

Trois modes d'exécution :
```bash
node scripts/audit-tokens.js              # rapport console
node scripts/audit-tokens.js --fix-report # + génère audit-report.json
node scripts/audit-tokens.js --ci         # exit 1 si violations critiques
```

En mode `--ci`, seules les violations `error` bloquent (tokens fantômes, valeurs hex,
références non résolues). Les `warning` (tokens orphelins, px inline) passent en CI
mais sont signalés — ils requièrent une correction dans un ticket dédié.

---

## Pourquoi un script interne plutôt qu'un outil externe

La décision de développer ce script en interne plutôt que d'adopter un outil
existant est elle-même une décision architecturale qui mérite d'être documentée.

Le script connaît exactement la structure du projet : les trois fichiers JSON,
le préfixe CSS `--ds-`, les niveaux `primitive`/`semantic`/`component`.
Un outil générique devrait être configuré pour reproduire cette connaissance,
avec un risque de desynchronisation à chaque évolution du système.

Le script est également un **contrat lisible** : un agent peut lire `audit-tokens.js`
et comprendre exactement quels patterns sont considérés comme des dérives dans ce projet.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **ESLint uniquement** | ESLint analyse le code statiquement mais ne peut pas croiser le code avec le contenu des fichiers JSON de tokens. Détecter qu'un `var(--agtc-semantic-color-action-secondary)` est fantôme nécessite de lire `semantic.json` au runtime — ce qu'ESLint ne fait pas. |
| **Outil de gouvernance tokens tiers (Token Health, Theo Validator)** | Outils peu matures ou trop couplés à un écosystème spécifique. Aucun ne couvre simultanément les quatre types de dérive du projet dans une seule commande. Dépendance externe pour une fonction critique de gouvernance. |
| **Lint dans Storybook / Chromatic** | Ces outils audient le rendu visuel et l'accessibilité. Ils ne lisent pas les fichiers JSON de tokens ni ne comparent les usages CSS avec les définitions — pas leur rôle. |
| **Revue manuelle pre-PR** | Non reproductible. Un développeur pressé oublie de vérifier. Un agent génère du code sans vérifier. Le script tourne automatiquement en CI — pas de risque d'oubli. |
| **GitHub Actions rule basées sur des grep** | Possible pour les hex en dur (`grep -r '#[0-9a-fA-F]'`), mais ne peut pas détecter les tokens fantômes ou orphelins sans logique de croisement avec les JSON. Chaque règle serait un step séparé — moins maintenable qu'un script unifié. |

---

## Conséquences

**Pour le CI/CD :**
- `audit-tokens.js --ci` est exécuté après `style-dictionary build` à chaque PR
- `exit 1` sur violation critique bloque le merge — au même niveau qu'un test unitaire
- Le rapport `audit-report.json` est sauvegardé comme artefact de CI pour traçabilité

**Pour les agents IA :**
- Un agent qui génère du code sait que la PR passera par ce script
- Les patterns de dérive détectés (`DRIFT_PATTERNS` dans le script) sont le contrat
  machine de ce qui est interdit — lisible directement dans `audit-tokens.js`
- Un agent peut exécuter le script localement avant de soumettre une PR pour
  auto-valider son output : `node scripts/audit-tokens.js --fix-report`

**Pour la gouvernance :**
- Les quatre types de dérive détectés correspondent aux interdictions de l'ADR-001
- Le script rend ces interdictions exécutables, pas seulement déclarées
- Toute dérive non détectée par le script = gap à corriger dans `DRIFT_PATTERNS`

**Coût accepté :**
- Le script doit être mis à jour si le système de nommage des tokens évolue
- Il ne détecte pas les dérives dans les fichiers Figma (hors de portée — voir ADR-011)
- La détection de tokens orphelins dépend de la couverture des fichiers source
  scannés — un composant utilisé uniquement dans une app externe ne sera pas vu

---

## Incidents ou déclencheurs

Décision fondatrice. Motivée par le constat que les règles de tokens sans
vérification automatique sont des règles mortes : elles existent dans la documentation,
les développeurs les connaissent, et elles sont quand même violées sous pression
de livraison. Le script transforme une règle déclarative en contrainte exécutable.
