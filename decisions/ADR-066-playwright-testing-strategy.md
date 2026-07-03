# ADR-066 — Stratégie de tests Playwright : deux périmètres distincts

**Date :** 2026-07-02
**Statut :** Actif
**Auteur :** Guilherme Negreiros
**Relations :** ADR-006 (Chromatic), ADR-007 (axe-core), ADR-009 (Storybook), ADR-004 (gouvernance humaine)

---

## Contexte

La limite mensuelle de snapshots gratuits Chromatic a été atteinte le 2026-07-01 (période
2026-06-30 → 2026-07-31). Le plan payant suivant coûte ~149 USD/mois (~205 CAD) et nécessiterait
un appel d'offres formel dans le contexte gouvernemental visé (RAMQ).

Par ailleurs, Chromatic envoie des screenshots vers l'infrastructure Chromatic Inc. (hors Québec),
ce qui pose des contraintes de souveraineté des données pour les équipes gouvernementales.

En explorant le remplacement, deux cas d'usage distincts ont été identifiés — avec des besoins,
des propriétaires et des dépôts différents — qui exigent une décision d'architecture explicite
plutôt qu'une simple substitution d'outil.

---

## Les deux périmètres de test

### Périmètre 1 — Équipe DS (ce dépôt)

L'équipe qui maintient le design system teste ses propres livrables :

| Dimension | Détail |
|-----------|--------|
| **Dépôt** | `agentic-design-system` (ce dépôt) |
| **Déclencheur** | Commit sur `tokens/`, `components/`, `site/` |
| **Ce qui constitue un échec** | Un composant DS a régressé visuellement ou fonctionnellement |
| **Source de vérité visuelle** | Les composants tels que définis par le DS |
| **Qui approuve les diffs** | DS Lead (Guilherme Negreiros) |
| **Périmètre** | Pages `site/dist/`, composants `agtc-*`, fondations |

### Périmètre 2 — Équipes produit consommatrices

Les équipes qui utilisent le DS dans leur propre produit testent leur propre produit :

| Dimension | Détail |
|-----------|--------|
| **Dépôt** | Les dépôts produit de chaque équipe (hors de ce dépôt) |
| **Déclencheur** | Commit produit, ou montée de version DS dans leur `package.json` |
| **Ce qui constitue un échec** | L'interface du produit est cassée après usage ou upgrade DS |
| **Source de vérité visuelle** | L'UI produit telle qu'approuvée par leur designer |
| **Qui approuve les diffs** | L'équipe produit elle-même |
| **Périmètre** | Leur application, leurs pages, leurs parcours utilisateur |

> **Principe :** le DS ne peut pas et ne doit pas tester les produits qui le consomment.
> Cela créerait un couplage inverse — le DS dépendant des décisions produit — et serait
> impossible à maintenir. Le DS fournit des outils, pas des tests.

---

## Décision

### 1. Playwright remplace Chromatic pour le périmètre DS

**Outil :** Playwright `^1.60.0` (déjà en `devDependencies`).

**Avantages vs Chromatic :**

| Critère | Chromatic | Playwright |
|---------|-----------|------------|
| Coût | ~205 CAD/mois | 0 CAD |
| Données | Envoyées chez Chromatic Inc. | Restent dans l'infra CI interne |
| Browsers | Chromium uniquement | Chromium + Firefox + WebKit |
| Quotas | 35 000 snapshots/mois (gratuit) | Illimité |
| Appel d'offres RAMQ | Requis à ~149 USD/mois | Non requis |
| Interface d'approbation | Web UI Chromatic | Rapport HTML local (`playwright-report/`) |

Seul avantage perdu : l'interface d'approbation web de Chromatic (UI dédiée pour les designers).
Remplacé par le rapport HTML Playwright — moins visuel, acceptable pour la phase actuelle.

**Architecture des tests DS :**

```
tests/
  visual/
    snapshots/              ← PNG de référence committés dans le repo
    home.spec.js            ← régressions page home (light/dark, desktop/mobile)
    documentation.spec.js   ← régressions pages doc + fondations
    components/
      button.spec.js        ← régression page composant button
  functional/
    nav.spec.js             ← mega menu, mobile menu, theme toggle
    sidebar.spec.js         ← sidebar docs, TOC, état actif
playwright.config.js
```

**Configuration clé :**

- `baseURL: http://localhost:8080` — site servi via `npx serve site/dist`
- Browsers : Chromium, Firefox, WebKit
- Docker Microsoft (`mcr.microsoft.com/playwright`) en CI — garantit des diffs déterministes
  entre CI Linux et macOS local (évite les faux positifs typographiques)
- `reducedMotion: 'reduce'` — désactive les animations pendant les captures
- `update_snapshots` : **jamais automatique** — approbation humaine explicite requise (ADR-004)

**Workflow CI (`.github/workflows/playwright.yml`) :**

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      update_snapshots:
        type: boolean
        default: false
        description: "Régénérer les snapshots de référence (approbation humaine requise)"
```

Le flag `update_snapshots` ne peut être activé que manuellement via `workflow_dispatch`.
Activer ce flag automatiquement sur push détruirait la valeur du test (toujours vert = détecte rien).
Règle alignée avec le principe « dernier mot toujours humain » (ADR-004).

**Rappel pour les mises à jour :**

Trois mécanismes en couches :
1. **Hook git pre-push** (`.githooks/pre-push`) — message console si `components/` ou `tokens/` ont changé
2. **Message dans les logs CI** — step affiché quand un diff est détecté
3. *(Optionnel)* **Issue GitHub automatique** — issue `visual-review` pour les équipes avec designers non-devs

### 2. Le DS fournit un kit de test pour les équipes consommatrices

Le DS **ne teste pas les produits consommateurs** — il leur fournit les outils pour se tester
eux-mêmes. Ce kit est livré sous forme de documentation et de code d'exemple dans ce dépôt.

**Contenu du kit (à implémenter en phase 2) :**

| Livrable | Emplacement | Description |
|----------|-------------|-------------|
| Fixtures Playwright | `tests/consumer-kit/fixtures.js` | `withDSTheme(page, 'dark')`, `waitForDSReady(page)` |
| Exemple de setup | `tests/consumer-kit/example.spec.js` | Test minimal montrant comment tester un composant DS dans un contexte produit |
| Documentation | `guidelines/foundations/testing.md` | Guide "tester votre produit avec le DS" |

**Principe du kit :** les équipes produit copient ou importent les fixtures dans leur propre dépôt.
Le DS ne connaît pas leur produit — il fournit des primitives de test, pas des tests.

### 3. Intégration axe-core dans Playwright (phase 2)

Le workflow `axe.yml` existant utilise déjà Playwright en interne (Chromium). Il sera fusionné
dans le workflow Playwright en phase 2 via `@axe-core/playwright` (déjà en `devDependencies`),
pour un seul workflow CI au lieu de deux.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| Conserver Chromatic (plan payant) | ~205 CAD/mois → appel d'offres RAMQ ; données hors Québec |
| Percy / Applitools | Même problème : SaaS externe, coût, données hors infra |
| Storybook Visual Tests (addon Chromatic) | Dépend de Chromatic ; même limite |
| BackstopJS | Moins maintenu, pas multi-browser natif, DX inférieure à Playwright |
| Tester les produits consommateurs depuis ce dépôt | Couplage inverse (DS dépend des produits) ; impossible à maintenir ; chaque équipe possède ses tests |
| Un seul périmètre "fusionné" DS + produit | Confusion de responsabilités ; un échec produit bloquerait le CI DS |

---

## Conséquences

### Pour l'équipe DS

- Les snapshots PNG de référence sont committés dans `tests/visual/snapshots/` — ils font partie
  du dépôt et sont visibles via `git diff` comme tout autre fichier.
- Tout changement visuel intentionnel (refonte, nouveau token) nécessite un `--update-snapshots`
  déclenché manuellement, suivi d'un commit de mise à jour des snapshots.
- L'image Docker Microsoft garantit que les diffs détectés sont des vraies régressions, pas des
  artefacts de rendu entre OS.

### Pour les équipes produit

- Elles sont responsables de leurs propres tests visuels dans leurs propres dépôts.
- Le DS leur fournit un kit (fixtures + exemple) pour démarrer rapidement.
- Les guidelines composant documentent les comportements attendus testables.

### Pour les agents

- `tests/visual/snapshots/` contient des fichiers PNG binaires — ne jamais modifier ces fichiers
  manuellement, uniquement via `--update-snapshots`.
- Ne pas ajouter de tests qui testent des produits consommateurs hypothétiques dans ce dépôt.
- Le workflow `playwright.yml` doit toujours builder le site avant les tests :
  `node site/build.js` → `npx playwright test`.

### Fichiers impactés / créés

| Fichier | Statut | Description |
|---------|--------|-------------|
| `playwright.config.js` | Créé | Configuration Playwright (multi-browser, baseURL, Docker) |
| `tests/visual/home.spec.js` | Créé | Régressions page home |
| `tests/visual/documentation.spec.js` | Créé | Régressions pages doc + fondations |
| `tests/visual/components/button.spec.js` | Créé | Régression page button |
| `tests/functional/nav.spec.js` | À créer | Tests fonctionnels navigation |
| `tests/functional/sidebar.spec.js` | À créer | Tests fonctionnels sidebar |
| `.github/workflows/playwright.yml` | À créer | Workflow CI Playwright |
| `.githooks/pre-push` | À créer | Hook local de rappel |
| `.github/workflows/chromatic.yml` | Modifié | Push désactivé (2026-07-01) |

---

## Résultat attendu

| Métrique | Chromatic (avant) | Playwright (cible) |
|----------|------------------|-------------------|
| Coût mensuel | ~205 CAD | 0 CAD |
| Données | Chromatic Inc. (externe) | CI interne uniquement |
| Browsers couverts | 1 (Chromium) | 3 (Chromium + Firefox + WebKit) |
| Quotas | 35 000 snapshots/mois | Illimité |
| Thèmes testés | light + dark (modes) | light + dark (per spec) |
| Breakpoints | Desktop uniquement | Desktop + Tablet + Mobile |
| Approbation des diffs | Interface web Chromatic | `workflow_dispatch` + commit |
