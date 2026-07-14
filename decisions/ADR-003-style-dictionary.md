# ADR-003 — Choosing Style Dictionary for token compilation

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Tech Lead
> **Type:** contract
> **Logical path:** decisions/ADR-003-style-dictionary.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** style-dictionary/config.json, tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/tokens-system.md

---

## Context

ADR-001 establishes that tokens are defined in JSON across three source files. These
JSON files aren't directly consumable by target platforms:

| Platform | Expected format |
|----------|------------------|
| Web (CSS) | `--ds-*` Custom Properties in `.css` files |
| JavaScript | Exportable ES6 constants |
| iOS | A Swift `DesignTokens` class |
| Android | `colors.xml` and `dimens.xml` XML files |

The question was:

> **How do we turn a single JSON source of truth into multi-platform outputs in a
> reproducible, versionable, CI/CD-automatable way?**

Constraints:
- A single command must generate everything (`npx style-dictionary build`)
- The config must be readable by agents so they understand the structure of `dist/`
- The tool must be actively maintained and support token standards (W3C Design Tokens)

---

## Decision

Adopt **Style Dictionary** (Amazon) as the token compilation pipeline.

The configuration in `style-dictionary/config.json` declares:
- **Sources**: `tokens/primitives.json`, `tokens/semantic.json`, `tokens/component.json`
- **Platforms**: `css`, `js`, `ios`, `android`
- **Outputs**: `dist/css/`, `dist/js/`, `dist/ios/`, `dist/android/`

Each platform has its native `transformGroup` — Style Dictionary handles naming,
value, and format transformations with no custom code.

Filtering by the `level` attribute (primitive / semantic / component) lets us
generate separate CSS files per layer, avoiding loading primitive tokens into
applications that don't need them.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Custom in-house transformation scripts** | Permanent maintenance, no handling of value transformations (px → pt for iOS, hex → rgba, etc.), no community support. Reinventing an already well-built wheel. |
| **Theo (Salesforce)** | Minimally maintained since 2022. Fewer native output formats. Significantly smaller community. |
| **Diez** | More complex architecture (token server, per-platform SDK). Overkill for a project that wants to stay close to W3C standards. Less suited to simple CI integration. |
| **Direct export from Tokens Studio (Figma)** | Couples the source of truth to Figma. Breaks digital sovereignty — the source becomes Figma, not the repo. Agents have no access to Figma. Not automatable without a paid plugin. |
| **Manual compilation at build time** | Not reproducible. Every developer could get different outputs depending on their environment. Incompatible with a reliable CI/CD. |

---

## Consequences

**For developers:**
- A single command compiles all platforms: `npx style-dictionary build --config style-dictionary/config.json`
- Outputs in `dist/` are gitignored — they regenerate on every build
- Adding a new platform (e.g. Flutter) = adding a block in `config.json`, not editing token code

**For AI agents:**
- The structure of `dist/` is predictable and documented by `config.json`
- An agent can read `config.json` to know exactly which files exist in `dist/` without reading them
- Generated CSS token names (`--agtc-primitive-color-blue-700`) are mechanically derived
  from the source JSON — an agent can predict a token's CSS name from its JSON path

**For CI/CD:**
- The `audit-tokens.js` script runs after `style-dictionary build` to detect orphaned,
  phantom, and hardcoded-value tokens
- In `--ci` mode, the command returns `exit 1` if violations are detected — blocking the merge

**For Figma / Tokens Studio:**
- Tokens Studio reads the same source JSON files — Style Dictionary and Figma share
  the same source of truth without duplication
- The update flow stays: JSON → Style Dictionary → `dist/` + Tokens Studio sync

**Accepted cost:**
- Dependency on an Amazon tool (mitigated by its wide adoption and W3C alignment)
- `style-dictionary/config.json` must be maintained as target platforms evolve
- Custom transformations (e.g. a semantic token referencing a primitive) require a
  custom `transform` if the default behavior isn't enough

---

## Incidents or triggers

No production incident. Decision made while setting up the initial architecture.
Style Dictionary is used by Salesforce, Adobe, GitHub, and Shopify for the same
need — sufficient external validation to rule out adoption risk.

<!-- FR -->

# ADR-003 — Choix de Style Dictionary pour la compilation des tokens

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-003-style-dictionary.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** style-dictionary/config.json, tokens/primitives.json, tokens/semantic.json, tokens/component.json, .claude/rules/tokens-system.md

---

## Contexte

L'ADR-001 établit que les tokens sont définis en JSON dans trois fichiers sources.
Ces fichiers JSON ne sont pas consommables directement par les plateformes cibles :

| Plateforme | Format attendu |
|------------|---------------|
| Web (CSS) | Custom Properties `--ds-*` dans des fichiers `.css` |
| JavaScript | Constantes ES6 exportables |
| iOS | Classe Swift `DesignTokens` |
| Android | Fichiers XML `colors.xml` et `dimens.xml` |

La question posée était :

> **Comment transformer une source de vérité JSON unique en sorties multi-plateformes
> de manière reproductible, versionnable et automatisable en CI/CD ?**

Contraintes :
- Une seule commande doit tout générer (`npx style-dictionary build`)
- La config doit être lisible par les agents pour qu'ils comprennent la structure de `dist/`
- L'outil doit être maintenu activement et supporter les standards de tokens (W3C Design Tokens)

---

## Décision

Adoption de **Style Dictionary** (Amazon) comme pipeline de compilation des tokens.

La configuration dans `style-dictionary/config.json` déclare :
- **Sources** : `tokens/primitives.json`, `tokens/semantic.json`, `tokens/component.json`
- **Plateformes** : `css`, `js`, `ios`, `android`
- **Sorties** : `dist/css/`, `dist/js/`, `dist/ios/`, `dist/android/`

Chaque plateforme dispose de son `transformGroup` natif — Style Dictionary gère
les transformations de nommage, de valeur et de format sans code personnalisé.

Le filtre par attribut `level` (primitive / semantic / component) permet de générer
des fichiers CSS séparés par couche, ce qui évite de charger les tokens primitifs
dans les applications qui n'en ont pas besoin.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Scripts de transformation maison** | Maintenance permanente, aucune gestion des transformations de valeur (px → pt pour iOS, hex → rgba, etc.), pas de support communautaire. Reinventer une roue déjà bien faite. |
| **Theo (Salesforce)** | Projet en maintenance minimale depuis 2022. Moins de formats de sortie natifs. Communauté significativement plus petite. |
| **Diez** | Architecture plus complexe (serveur de tokens, SDK par plateforme). Overkill pour un projet qui veut rester proche des standards W3C. Moins adapté à une intégration CI simple. |
| **Export direct depuis Tokens Studio (Figma)** | Couplage à Figma comme source de vérité. Rompt la souveraineté numérique — la source devient Figma, pas le repo. Les agents n'ont pas accès à Figma. Pas automatisable sans plugin payant. |
| **Compilation manuelle lors du build** | Non reproductible. Chaque développeur obtient des sorties potentiellement différentes selon son environnement. Incompatible avec un CI/CD fiable. |

---

## Conséquences

**Pour les développeurs :**
- Une seule commande compile toutes les plateformes : `npx style-dictionary build --config style-dictionary/config.json`
- Les sorties dans `dist/` sont gitignorées — elles se regénèrent à chaque build
- Ajouter une nouvelle plateforme (ex: Flutter) = ajouter un bloc dans `config.json`, pas modifier le code des tokens

**Pour les agents IA :**
- La structure de `dist/` est prévisible et documentée par `config.json`
- Un agent peut lire `config.json` pour savoir exactement quels fichiers existent dans `dist/` sans les lire
- Les noms de tokens CSS générés (`--agtc-primitive-color-blue-700`) sont dérivés mécaniquement
  du JSON source — un agent peut prédire le nom CSS d'un token à partir de son chemin JSON

**Pour la CI/CD :**
- Le script `audit-tokens.js` s'exécute après `style-dictionary build` pour détecter
  tokens orphelins, fantômes et valeurs en dur
- En mode `--ci`, la commande retourne `exit 1` si des violations sont détectées — bloquant le merge

**Pour Figma / Tokens Studio :**
- Tokens Studio lit les mêmes fichiers JSON source — Style Dictionary et Figma partagent
  la même source de vérité sans duplication
- Le flux de mise à jour reste : JSON → Style Dictionary → `dist/` + Tokens Studio sync

**Coût accepté :**
- Dépendance à un outil Amazon (mitigée par son adoption large et son alignement W3C)
- La config `style-dictionary/config.json` doit être maintenue si les plateformes cibles évoluent
- Les transformations personnalisées (ex: token sémantique qui référence un primitif)
  nécessitent un `transform` custom si le comportement par défaut ne suffit pas

---

## Incidents ou déclencheurs

Aucun incident en production. Décision prise lors de la mise en place de l'architecture initiale.
Style Dictionary est utilisé par Salesforce, Adobe, GitHub et Shopify pour le même besoin —
validation externe suffisante pour écarter le risque d'adoption.
