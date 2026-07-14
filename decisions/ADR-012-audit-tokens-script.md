# ADR-012 — Drift detection via an audit script (audit-tokens.js)

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Tech Lead, Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-012-audit-tokens-script.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** scripts/audit-tokens.js, tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md

---

## Context

ADR-001 forbids hardcoded values and primitive tokens in components.
ADR-004 establishes that agents detect drift, humans fix it.

But drift detection can't rely solely on human vigilance during code reviews.
In an agentic system, drift can be introduced at any time, by a human or by an
agent, silently.

Four types of drift were identified as priorities:

| Type | Description | Example |
|------|-------------|---------|
| **Orphaned token** | Defined in `component.json`, never used in the code | `button.ghost.border` not referenced |
| **Phantom token** | Used in the code, absent from `semantic.json` | `var(--agtc-semantic-color-action-secondary)` doesn't exist |
| **Hardcoded value** | Arbitrary hex, RGB, px in the code | `color: #3B82F6` instead of `var(--ds-color-action-primary)` |
| **Direct primitive** | Primitive token used in a component | `var(--agtc-primitive-color-blue-9)` in a Web Component |

The question was:

> **How do we detect these four types of drift automatically, reproducibly,
> and in a way that blocks CI — without depending on an external tool?**

---

## Decision

Development of an internal audit script: `scripts/audit-tokens.js`.

The script is deliberately minimal — a single dependency-free Node.js file,
directly executable with `node scripts/audit-tokens.js`.

It runs four sequential audits:

1. **Orphaned tokens** — compares `component.json` against usages in the source code
2. **Phantom tokens** — detects `var(--agtc-semantic-*)` with no equivalent in `semantic.json`
3. **Hardcoded values** — regex on hex, rgb, hsl, Tailwind arbitrary values, inline px
4. **Three-layer structure** — verifies that cross-layer references are resolvable

Three execution modes:
```bash
node scripts/audit-tokens.js              # console report
node scripts/audit-tokens.js --fix-report # + generates audit-report.json
node scripts/audit-tokens.js --ci         # exit 1 on critical violations
```

In `--ci` mode, only `error`-level violations block (phantom tokens, hex values,
unresolved references). `warning`-level violations (orphaned tokens, inline px)
pass CI but are flagged — they require a fix in a dedicated ticket.

---

## Why an internal script rather than an external tool

The decision to develop this script in-house rather than adopt an existing tool
is itself an architectural decision worth documenting.

The script knows the project's structure exactly: the three JSON files, the
`--ds-` CSS prefix, the `primitive`/`semantic`/`component` levels. A generic tool
would need to be configured to reproduce this knowledge, with a risk of
desynchronization at every evolution of the system.

The script is also a **readable contract**: an agent can read `audit-tokens.js`
and understand exactly which patterns are considered drift in this project.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **ESLint only** | ESLint analyzes code statically but can't cross-reference the code with the content of the token JSON files. Detecting that a `var(--agtc-semantic-color-action-secondary)` is a phantom requires reading `semantic.json` at runtime — which ESLint doesn't do. |
| **Third-party token governance tool (Token Health, Theo Validator)** | Tools that are immature or too tightly coupled to a specific ecosystem. None simultaneously covers the project's four types of drift in a single command. External dependency for a critical governance function. |
| **Lint in Storybook / Chromatic** | These tools audit visual rendering and accessibility. They don't read the token JSON files or compare CSS usages with definitions — not their role. |
| **Manual pre-PR review** | Not reproducible. A rushed developer forgets to check. An agent generates code without checking. The script runs automatically in CI — no risk of forgetting. |
| **GitHub Actions rules based on grep** | Possible for hardcoded hex (`grep -r '#[0-9a-fA-F]'`), but can't detect phantom or orphaned tokens without cross-referencing logic against the JSON. Each rule would be a separate step — less maintainable than a unified script. |

---

## Consequences

**For CI/CD:**
- `audit-tokens.js --ci` runs after `style-dictionary build` on every PR
- `exit 1` on a critical violation blocks the merge — at the same level as a unit test
- The `audit-report.json` report is saved as a CI artifact for traceability

**For AI agents:**
- An agent generating code knows the PR will go through this script
- The drift patterns detected (`DRIFT_PATTERNS` in the script) are the machine
  contract of what's forbidden — directly readable in `audit-tokens.js`
- An agent can run the script locally before submitting a PR to self-validate
  its output: `node scripts/audit-tokens.js --fix-report`

**For governance:**
- The four types of drift detected correspond to the prohibitions in ADR-001
- The script makes these prohibitions enforceable, not just declared
- Any drift not detected by the script = a gap to fix in `DRIFT_PATTERNS`

**Accepted cost:**
- The script must be updated if the token naming system evolves
- It doesn't detect drift in Figma files (out of scope — see ADR-011)
- Orphaned-token detection depends on the coverage of the scanned source files —
  a component used only in an external app won't be seen

---

## Incidents or triggers

Foundational decision. Motivated by the observation that token rules without
automated verification are dead rules: they exist in the documentation,
developers know them, and they still get violated under delivery pressure.
The script turns a declarative rule into an enforceable constraint.

<!-- FR -->

# ADR-012 — Détection de dérive par script d'audit (audit-tokens.js)

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Tech Lead, Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-012-audit-tokens-script.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** scripts/audit-tokens.js, tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md

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
