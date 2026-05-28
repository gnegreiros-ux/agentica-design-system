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
- Les noms de tokens CSS générés (`--ds-primitive-color-blue-700`) sont dérivés mécaniquement
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
