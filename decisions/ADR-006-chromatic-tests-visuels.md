# ADR-006 — Choosing Chromatic for visual regression testing

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Tech Lead
> **Type:** contract
> **Logical path:** decisions/ADR-006-chromatic-tests-visuels.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** .claude/rules/development.md, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md

---

## Context

A design system ships visual contracts. A modified token, a poorly encapsulated
Shadow DOM style, or an overridden CSS property can introduce a silent visual
regression — the code compiles, unit tests pass, but the component no longer
looks like it should.

This risk is amplified in an agentic system: an agent that modifies code can
introduce visual drift without any functional test detecting it.

Three questions guided the choice:

**1. How do we capture the visual reference state of every component?**
Unit tests verify behavior. Accessibility tests verify attributes. Neither
captures what the user actually sees.

**2. How do we integrate visual review into the existing PR workflow?**
A tool that produces captures outside the git workflow will be ignored. Visual
review must block the merge if a regression is detected, the same way a failing
unit test does.

**3. How do we make visual regressions auditable?**
ADR-004 establishes that every decision must be traceable. An approved visual
regression (intentional change) must be distinguished from an unapproved one
(bug). This distinction must be versioned.

---

## Decision

Adopt **Chromatic** as the visual regression testing platform, integrated
directly with Storybook and the CI/CD pipeline.

Chromatic works in three stages:

1. **Capture** — on every PR, Chromatic renders each Storybook story in a real
   browser and takes a pixel-perfect capture of every variant and state
2. **Comparison** — captures are compared against the approved baseline (the
   last merge to `main`)
3. **Decision** — any pixel deviation triggers a mandatory human review in the
   Chromatic interface before the CI check passes

The baseline is stored in the Chromatic cloud, versioned by commit. Approving a
visual change is an explicit, traceable human action.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Percy (BrowserStack)** | Functionally similar to Chromatic but with no native Storybook integration. Requires configuring a separate runner to capture stories. Chromatic is built by the Storybook team — the integration is native and frictionless. |
| **Playwright visual comparisons** (`toHaveScreenshot`) | An excellent general-purpose tool, but geared toward full user journeys. Capturing every story in every variant and state requires writing a test per combination. Chromatic does this automatically from existing stories, with no extra code. |
| **Jest + jest-image-snapshot** | Local comparison only. Baselines live in the repo (large PNG files in git). No review interface — a developer must compare two images manually. Not suited to a collaborative PR workflow. |
| **Loki** | Open source, based on Storybook. Requires self-hosting a comparison infrastructure. Digital sovereignty is a project principle (ADR-004), but Chromatic is acceptable here: captures are CI artifacts, not brand or governance data. |
| **Manual visual review** | Doesn't scale. With 4 variants × 6 states = 24 combinations for `button` alone, an exhaustive manual review per PR is unrealistic. It will be systematically shortened under delivery pressure. |
| **No visual testing** | Explicitly accepted as a risk in certain phases. Rejected here because the system ships visual contracts to other teams. An undetected regression in `agtc-button` impacts every consuming application simultaneously. |

---

## Consequences

**For the PR workflow:**
- Every PR automatically triggers a Chromatic capture of every story
- A visual deviation blocks the merge until explicit human approval in Chromatic
- Intentional visual changes (a new variant, a spacing adjustment) are approved
  and become the new baseline — an action traced by commit

**For AI agents:**
- An agent that modifies code knows every visual output will be captured and compared
- This constraint improves the quality of agent-generated PRs: the expected
  visual change must be described in the PR description so the reviewer knows
  what to approve in Chromatic
- Agents cannot approve Chromatic captures themselves — that is a human action
  (see ADR-004: agent autonomy boundaries)

**For auditability:**
- The Chromatic baseline history forms a visual log of the system: one can see
  exactly at which commit `agtc-button` changed appearance, and why
- This log complements the ADRs (textual decisions) with a visual trace

**For consuming teams:**
- Visual regressions are caught before merge, not after deployment
- Consuming teams can review Chromatic captures in PRs to assess the visual
  impact of an update before adopting it

**Accepted cost:**
- Dependency on a paid cloud service (Chromatic is freemium with a snapshot limit)
- Captures are hosted by Chromatic, not in the repo — acceptable since they are
  CI artifacts, not sources of truth
- Initial setup: connect Chromatic to the repo, configure the CI token, define
  stories as the entry point

---

## Incidents or triggers

Decision made upstream, motivated by a recurring pattern in design systems
without visual testing: a global semantic token change (`color.action.primary`)
passes every functional test but changes the appearance of 12 components
simultaneously. Without Chromatic, this kind of regression is only discovered in
production or during a random manual review.

---

## Implementation

| Date | Event |
|------|-------|
| 2026-05-28 | Decision adopted (ADR-006) |
| 2026-06-01 | **Activation** — `chromatic.md` pipeline → Active, `.github/workflows/chromatic.yml` CI workflow added |

**Token management.** `CHROMATIC_PROJECT_TOKEN` lives exclusively in GitHub
secrets — never in clear text in the repo (not in `package.json`, not in a
workflow). The initial token had been committed in clear text (commit `ba30858`);
it was **regenerated** on chromatic.com during activation, revoking the value
exposed in the git history. Any future rotation follows the same protocol:
regenerate on chromatic.com, then update the GitHub secret.

<!-- FR -->

# ADR-006 — Choix de Chromatic pour les tests de régression visuelle

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-006-chromatic-tests-visuels.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** .claude/rules/development.md, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md

---

## Contexte

Un système de design livre des contrats visuels. Un token modifié, un style
Shadow DOM mal encapsulé, ou une propriété CSS surchargée peuvent introduire
une régression visuelle silencieuse — le code compile, les tests unitaires
passent, mais le composant ne ressemble plus à ce qu'il devrait.

Ce risque est amplifié dans un système agentique : un agent qui modifie du code
peut introduire une dérive visuelle sans qu'aucun test fonctionnel ne la détecte.

Trois questions ont guidé le choix :

**1. Comment capturer l'état visuel de référence de chaque composant ?**
Les tests unitaires vérifient le comportement. Les tests d'accessibilité vérifient
les attributs. Aucun des deux ne capture ce que voit réellement l'utilisateur.

**2. Comment intégrer la revue visuelle dans le workflow de PR existant ?**
Un outil qui produit des captures hors du workflow git sera ignoré. La revue
visuelle doit bloquer le merge si une régression est détectée, au même titre
qu'un test unitaire qui échoue.

**3. Comment rendre les régressions visuelles auditables ?**
L'ADR-004 établit que toute décision doit être traçable. Une régression visuelle
approuvée (changement intentionnel) doit être distinguée d'une régression non
approuvée (bug). Cette distinction doit être versionnée.

---

## Décision

Adoption de **Chromatic** comme plateforme de tests de régression visuelle,
intégrée directement à Storybook et au pipeline CI/CD.

Chromatic fonctionne en trois temps :

1. **Capture** — à chaque PR, Chromatic rend chaque story Storybook dans un
   navigateur réel et prend une capture pixel-perfect de chaque variante et état
2. **Comparaison** — les captures sont comparées à la baseline approuvée (dernier merge sur `main`)
3. **Décision** — tout écart pixel déclenche une revue humaine obligatoire dans
   l'interface Chromatic avant que le check CI ne passe

La baseline est stockée dans le cloud Chromatic, versionnée par commit.
L'approbation d'un changement visuel est une action humaine explicite et traçable.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Percy (BrowserStack)** | Fonctionnellement similaire à Chromatic mais sans intégration native Storybook. Nécessite de configurer un runner séparé pour capturer les stories. Chromatic est développé par l'équipe Storybook — l'intégration est native et sans friction. |
| **Playwright visual comparisons** (`toHaveScreenshot`) | Excellent outil généraliste, mais orienté parcours utilisateur complets. Capturer chaque story dans chaque variante et état nécessite d'écrire un test par combinaison. Chromatic le fait automatiquement à partir des stories existantes, sans code supplémentaire. |
| **Jest + jest-image-snapshot** | Comparaison locale uniquement. Les baselines vivent dans le repo (fichiers PNG volumineux en git). Pas d'interface de revue — un développeur doit comparer manuellement deux images. Pas adapté à un workflow de PR collaboratif. |
| **Loki** | Open source, basé sur Storybook. Requiert une infrastructure de comparaison à héberger soi-même. La souveraineté numérique est un principe du projet (ADR-004), mais Chromatic est ici acceptable : les captures sont des artefacts de CI, pas des données de marque ou de gouvernance. |
| **Revue visuelle manuelle** | Ne passe pas à l'échelle. Avec 4 variantes × 6 états = 24 combinaisons pour `button` seul, une revue manuelle exhaustive par PR est irréaliste. Elle sera systématiquement abrégée sous pression de livraison. |
| **Pas de tests visuels** | Risque accepté explicitement dans certaines phases. Rejeté ici car le système livre des contrats visuels à d'autres équipes. Une régression non détectée dans `agtc-button` impacte toutes les applications consommatrices simultanement. |

---

## Conséquences

**Pour le workflow de PR :**
- Chaque PR déclenche automatiquement une capture Chromatic de toutes les stories
- Un écart visuel bloque le merge jusqu'à approbation humaine explicite dans Chromatic
- Les changements visuels intentionnels (nouvelle variante, ajustement de spacing)
  sont approuvés et deviennent la nouvelle baseline — action tracée par commit

**Pour les agents IA :**
- Un agent qui modifie du code sait que toute sortie visuelle sera capturée et comparée
- Cette contrainte améliore la qualité des PR générées par des agents : le changement
  visuel attendu doit être décrit dans la description de la PR pour que le reviewer
  sache quoi approuver dans Chromatic
- Les agents ne peuvent pas approuver des captures Chromatic — c'est une action humaine
  (voir ADR-004 : frontières d'autonomie des agents)

**Pour l'auditabilité :**
- L'historique des baselines Chromatic constitue un journal visuel du système :
  on peut voir exactement à quel commit `agtc-button` a changé d'apparence et pourquoi
- Ce journal complète les ADRs (décisions textuelles) avec une trace visuelle

**Pour les équipes consommatrices :**
- Les régressions visuelles sont détectées avant le merge, pas après déploiement
- Les équipes consommatrices peuvent consulter les captures Chromatic dans les PRs
  pour évaluer l'impact visuel d'une mise à jour avant de l'adopter

**Coût accepté :**
- Dépendance à un service cloud payant (Chromatic est freemium avec limite de snapshots)
- Les captures sont hébergées chez Chromatic, pas dans le repo — acceptable car
  ce sont des artefacts de CI, pas des sources de vérité
- Premier setup : connecter Chromatic au repo, configurer le token CI, définir
  les stories comme point d'entrée

---

## Incidents ou déclencheurs

Décision prise en amont, motivée par un pattern récurrent dans les design systems
sans tests visuels : une modification de token sémantique global (`color.action.primary`)
passe tous les tests fonctionnels mais change l'apparence de 12 composants simultanément.
Sans Chromatic, ce type de régression n'est découvert qu'en production ou lors d'une
revue manuelle aléatoire.

---

## Mise en œuvre

| Date | Événement |
|------|-----------|
| 2026-05-28 | Décision adoptée (ADR-006) |
| 2026-06-01 | **Activation** — pipeline `chromatic.md` → Actif, workflow CI `.github/workflows/chromatic.yml` ajouté |

**Gestion du token.** Le `CHROMATIC_PROJECT_TOKEN` vit exclusivement dans les secrets
GitHub — jamais en clair dans le dépôt (ni `package.json`, ni workflow). Le token initial
avait été committé en clair (commit `ba30858`) ; il a été **régénéré** sur chromatic.com lors
de l'activation, révoquant la valeur exposée dans l'historique git. Toute rotation future suit
le même protocole : régénérer sur chromatic.com puis mettre à jour le secret GitHub.
