# ADR-066 — Playwright testing strategy: two distinct scopes

**Date:** 2026-07-02
**Status:** Active
**Author:** Guilherme Negreiros
**Relations:** ADR-006 (Chromatic), ADR-007 (axe-core), ADR-009 (Storybook), ADR-004 (human governance)

---

## Context

The Chromatic free monthly snapshot limit was reached on 2026-07-01 (period
2026-06-30 → 2026-07-31). The next paid plan costs ~149 USD/month (~205 CAD) and would
require a formal RFP process in the targeted government context (RAMQ).

In addition, Chromatic sends screenshots to Chromatic Inc.'s infrastructure (outside
Quebec), which raises data-sovereignty constraints for government teams.

While exploring a replacement, two distinct use cases were identified — with different
needs, owners, and repositories — that call for an explicit architecture decision rather
than a simple tool substitution.

---

## The two testing scopes

### Scope 1 — DS team (this repository)

The team that maintains the design system tests its own deliverables:

| Dimension | Detail |
|-----------|--------|
| **Repository** | `agentic-design-system` (this repository) |
| **Trigger** | Commit on `tokens/`, `components/`, `site/` |
| **What constitutes a failure** | A DS component has visually or functionally regressed |
| **Visual source of truth** | The components as defined by the DS |
| **Who approves diffs** | DS Lead (Guilherme Negreiros) |
| **Scope** | `site/dist/` pages, `agtc-*` components, foundations |

### Scope 2 — Consuming product teams

Teams that use the DS in their own product test their own product:

| Dimension | Detail |
|-----------|--------|
| **Repository** | Each team's product repositories (outside this repository) |
| **Trigger** | Product commit, or a DS version bump in their `package.json` |
| **What constitutes a failure** | The product UI is broken after use or a DS upgrade |
| **Visual source of truth** | The product UI as approved by their designer |
| **Who approves diffs** | The product team itself |
| **Scope** | Their application, their pages, their user journeys |

> **Principle:** the DS cannot and must not test the products that consume it.
> That would create an inverted coupling — the DS depending on product decisions —
> and would be impossible to maintain. The DS provides tools, not tests.

---

## Decision

### 1. Playwright replaces Chromatic for the DS scope

**Tool:** Playwright `^1.60.0` (already in `devDependencies`).

**Advantages vs Chromatic:**

| Criterion | Chromatic | Playwright |
|---------|-----------|------------|
| Cost | ~205 CAD/month | 0 CAD |
| Data | Sent to Chromatic Inc. | Stays within internal CI infra |
| Browsers | Chromium only | Chromium + Firefox + WebKit |
| Quotas | 35,000 snapshots/month (free) | Unlimited |
| RAMQ RFP | Required at ~149 USD/month | Not required |
| Approval interface | Chromatic web UI | Local HTML report (`playwright-report/`) |

The only advantage lost: Chromatic's web-based approval interface (a dedicated UI for
designers). Replaced by the Playwright HTML report — less visual, acceptable for the
current phase.

**DS test architecture:**

```
tests/
  visual/
    snapshots/              ← reference PNGs committed to the repo
    home.spec.js            ← home page regressions (light/dark, desktop/mobile)
    documentation.spec.js   ← doc pages + foundations regressions
    components/
      button.spec.js        ← button component page regression
  functional/
    nav.spec.js             ← mega menu, mobile menu, theme toggle
    sidebar.spec.js         ← docs sidebar, TOC, active state
playwright.config.js
```

**Key configuration:**

- `baseURL: http://localhost:8080` — site served via `npx serve site/dist`
- Browsers: Chromium, Firefox, WebKit
- Microsoft Docker image (`mcr.microsoft.com/playwright`) in CI — guarantees
  deterministic diffs between Linux CI and local macOS (avoids false-positive
  typographic diffs)
- `reducedMotion: 'reduce'` — disables animations during captures
- `update_snapshots`: **never automatic** — explicit human approval required (ADR-004)

**CI workflow (`.github/workflows/playwright.yml`):**

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      update_snapshots:
        type: boolean
        default: false
        description: "Regenerate reference snapshots (human approval required)"
```

The `update_snapshots` flag can only be enabled manually via `workflow_dispatch`.
Enabling this flag automatically on push would destroy the test's value (always green =
detects nothing). This rule is aligned with the "the human always has the final word"
principle (ADR-004).

**Update reminder mechanism:**

Three layered mechanisms:
1. **pre-push git hook** (`.githooks/pre-push`) — console message when `components/` or `tokens/` changed
2. **CI log message** — a step displayed when a diff is detected
3. *(Optional)* **Automatic GitHub issue** — a `visual-review` issue for teams with non-dev designers

### 2. The DS provides a test kit for consuming teams

The DS **does not test consumer products** — it provides them with tools to test
themselves. This kit is delivered as documentation and sample code in this repository.

**Kit contents (to be implemented in phase 2):**

| Deliverable | Location | Description |
|----------|-------------|-------------|
| Playwright fixtures | `tests/consumer-kit/fixtures.js` | `withDSTheme(page, 'dark')`, `waitForDSReady(page)` |
| Setup example | `tests/consumer-kit/example.spec.js` | Minimal test showing how to test a DS component in a product context |
| Documentation | `guidelines/foundations/testing.md` | "Testing your product with the DS" guide |

**Kit principle:** product teams copy or import the fixtures into their own
repository. The DS doesn't know their product — it provides test primitives, not tests.

### 3. axe-core integration into Playwright (phase 2)

The existing `axe.yml` workflow already uses Playwright internally (Chromium). It will
be merged into the Playwright workflow in phase 2 via `@axe-core/playwright` (already
in `devDependencies`), resulting in a single CI workflow instead of two.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------|
| Keep Chromatic (paid plan) | ~205 CAD/month → RAMQ RFP; data outside Quebec |
| Percy / Applitools | Same problem: external SaaS, cost, data outside infra |
| Storybook Visual Tests (Chromatic addon) | Depends on Chromatic; same limit |
| BackstopJS | Less maintained, no native multi-browser support, DX inferior to Playwright |
| Test consuming products from this repository | Inverted coupling (DS depends on products); impossible to maintain; each team owns its own tests |
| A single "merged" DS + product scope | Confusion of responsibilities; a product failure would block the DS CI |

---

## Consequences

### For the DS team

- The reference PNG snapshots are committed to `tests/visual/snapshots/` — they are
  part of the repository and visible via `git diff` like any other file.
- Any intentional visual change (redesign, new token) requires a manually triggered
  `--update-snapshots`, followed by a snapshot-update commit.
- The Microsoft Docker image guarantees that detected diffs are real regressions, not
  rendering artifacts between OSes.

### For product teams

- They are responsible for their own visual tests in their own repositories.
- The DS provides them a kit (fixtures + example) to get started quickly.
- The component guidelines document the expected, testable behaviors.

### For agents

- `tests/visual/snapshots/` contains binary PNG files — never modify these files
  manually, only via `--update-snapshots`.
- Do not add tests that test hypothetical consumer products in this repository.
- The `playwright.yml` workflow must always build the site before the tests:
  `node site/build.js` → `npx playwright test`.

### Files affected / created

| File | Status | Description |
|---------|--------|-------------|
| `playwright.config.js` | Created | Playwright configuration (multi-browser, baseURL, Docker) |
| `tests/visual/home.spec.js` | Created | Home page regressions |
| `tests/visual/documentation.spec.js` | Created | Doc pages + foundations regressions |
| `tests/visual/components/button.spec.js` | Created | Button page regression |
| `tests/functional/nav.spec.js` | To create | Navigation functional tests |
| `tests/functional/sidebar.spec.js` | To create | Sidebar functional tests |
| `.github/workflows/playwright.yml` | To create | Playwright CI workflow |
| `.githooks/pre-push` | To create | Local reminder hook |
| `.github/workflows/chromatic.yml` | Modified | Push disabled (2026-07-01) |

---

## Expected outcome

| Metric | Chromatic (before) | Playwright (target) |
|----------|------------------|-------------------|
| Monthly cost | ~205 CAD | 0 CAD |
| Data | Chromatic Inc. (external) | Internal CI only |
| Browsers covered | 1 (Chromium) | 3 (Chromium + Firefox + WebKit) |
| Quotas | 35,000 snapshots/month | Unlimited |
| Themes tested | light + dark (modes) | light + dark (per spec) |
| Breakpoints | Desktop only | Desktop + Tablet + Mobile |
| Diff approval | Chromatic web interface | `workflow_dispatch` + commit |

<!-- FR -->

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
