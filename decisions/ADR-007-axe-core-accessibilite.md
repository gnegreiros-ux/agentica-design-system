# ADR-007 — Choosing axe-core for accessibility testing

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Principal Designer, Tech Lead
> **Type:** contract
> **Logical path:** decisions/ADR-007-axe-core-accessibilite.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** .claude/rules/development.md, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-006-chromatic-tests-visuels.md

---

## Context

`DESIGN.md` establishes that accessibility is **non-negotiable**: WCAG 2.1 AA
minimum on every component, in every circumstance. This requirement isn't a
recommendation — it's a governance rule at the same level as the token rules.

Two structural problems made a tooling response necessary:

**1. Accessibility is invisible at the time code is written**
An insufficient contrast ratio, a missing `aria-label` attribute, an incorrect
`role` — none of these violations is detectable by reading the code or through a
standard functional test. They require specialized analysis.

**2. Manual review doesn't scale**
With multiple components, multiple variants, multiple states each, a full manual
audit per PR is unrealistic. Violations reach production and impact every
consumer of the system simultaneously.

The question was:

> **How do we guarantee zero critical WCAG 2.1 AA violations on every PR,
> automatically, without depending on reviewers' individual vigilance?**

---

## Decision

Adopt **axe-core** (Deque Systems) as the automated accessibility audit engine,
integrated at two complementary levels:

**Component level** — via `@axe-core/playwright` in Playwright tests: every
component in every variant and state is audited under real browser rendering
conditions. Zero critical violations = CI passing condition.

**Storybook level** — via `@storybook/addon-a11y` (based on axe-core): live audit
in the Storybook canvas during development, before a PR is even opened.

The rule is strict: **zero `critical` or `serious` level violations**. `moderate`
and `minor` violations generate a warning but don't block the merge — they are
documented and addressed in a dedicated ticket.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Lighthouse (Google)** | Designed to audit full pages, not isolated components. Its integration into a unit-test or Storybook pipeline is indirect. Relevant for page-level E2E tests, not for component-by-component validation in CI. Used as a complement, not a replacement. |
| **WAVE (WebAIM)** | Browser extension only. Not automatable in CI/CD. Indispensable for in-depth manual review, but cannot block a merge. |
| **Pa11y** | Accessible, open-source CLI. Less well integrated with the Playwright + Storybook ecosystem. Its WCAG rule set is less granular than axe-core's, and its maintenance community is significantly smaller. |
| **IBM Equal Access Checker** | Full WCAG coverage and interesting additional rules. Less adopted in the JS/Node ecosystem. Playwright and Storybook integration requires more custom configuration. Kept for occasional manual audits, not continuous CI. |
| **Manual audit by an accessibility expert** | Not substitutable for final validation and edge cases. But doesn't scale as a continuous safety net. Choosing axe-core doesn't replace human expertise — it guarantees an automatic minimum floor on every PR. |
| **ESLint + eslint-plugin-jsx-a11y** | Detects static issues in JSX (missing attributes, incorrect roles). Complementary but insufficient: it analyzes source code, not rendered output. A syntactically correct component can produce an incorrect accessibility tree at runtime (Shadow DOM, slots, dynamic states). |

---

## Consequences

**For CI/CD:**
- Any PR introducing a `critical` or `serious` violation is blocked at merge
- The axe-core report is included in the PR artifacts — visible in GitHub Actions
- The `exit 1` rule on a critical violation is aligned with `audit-tokens.js --ci`'s behavior

**For AI agents:**
- A critical accessibility violation detected by axe-core is a **mandatory
  escalation**, not an optional warning (see `.claude/rules/development.md`)
- An agent cannot approve or dismiss a critical violation — it must flag it and
  block the PR until a human fixes it
- axe-core provides a structured (JSON) report an agent can read and analyze to
  precisely identify which WCAG rule is violated, on which element, and what fix to apply

**For developers:**
- Feedback is immediate: the Storybook addon flags violations in the
  accessibility panel during development, before the commit
- The axe-core report names the violated rule, the target element, and links to
  the corresponding WCAG documentation — no need to search

**For designers:**
- Contrast violations (insufficient ratio) are detected automatically
- A component that passes axe-core in every variant and state is certified WCAG
  AA for automatically testable criteria
- Criteria that can't be tested automatically (logical reading order, relevant
  text alternatives, behavior with a real screen reader) remain a human
  responsibility — axe-core doesn't cover 100% of WCAG

**Exact coverage scope:**
axe-core automatically detects roughly 30 to 40% of WCAG 2.1 AA violations. This
figure is intentionally communicated to teams to avoid false confidence: zero
axe-core violations is not equivalent to "accessible." It's a floor, not a ceiling.

**Accepted cost:**
- Playwright tests with axe-core lengthen the CI pipeline (real browser rendering)
- False positives are rare with axe-core but do exist — every rule suppression
  must be documented in code with justification (commented `axe.disable`)
- WCAG's partial coverage must be explicitly communicated to avoid creating false
  confidence in consuming teams

---

## Relation to Chromatic (ADR-006)

axe-core and Chromatic are complementary, not redundant:

| | Chromatic | axe-core |
|--|-----------|----------|
| **Detects** | Pixel visual regressions | Semantic WCAG violations |
| **Example** | Background color that changes | Insufficient contrast ratio |
| **Example** | Spacing that shifts | Missing `aria-label` |
| **Approval** | Human (Chromatic interface) | Automatic (zero tolerance for critical) |

A component can pass Chromatic (visually stable) and fail axe-core (semantically
inaccessible), and vice versa.

---

## Incidents or triggers

Foundational decision, made before any incident.
Motivated by the observation that design systems shipping components without
automated accessibility tests generate cascading violations across every
consuming application — each team inherits the same problems and fixes them
locally, without reporting back to the source system.
axe-core at the system level guarantees the problem is solved once, for every consumer.

<!-- FR -->

# ADR-007 — Choix de axe-core pour les tests d'accessibilité

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-007-axe-core-accessibilite.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-004-gouvernance-humaine.md
> **Relations:** .claude/rules/development.md, .claude/rules/git-workflow.md, decisions/ADR-004-gouvernance-humaine.md, decisions/ADR-006-chromatic-tests-visuels.md

---

## Contexte

`DESIGN.md` établit que l'accessibilité est **non négociable** : WCAG 2.1 AA minimum
sur tous les composants, en toutes circonstances. Cette exigence n'est pas une
recommandation — c'est une règle de gouvernance au même niveau que les règles de tokens.

Deux problèmes structurels rendaient une réponse outil nécessaire :

**1. L'accessibilité est invisible au moment de l'écriture du code**
Un ratio de contraste insuffisant, un attribut `aria-label` manquant, un `role`
incorrect — aucune de ces violations n'est détectable à la lecture du code ou
lors d'un test fonctionnel standard. Elles nécessitent une analyse spécialisée.

**2. La revue manuelle ne passe pas à l'échelle**
Avec plusieurs composants, plusieurs variantes, plusieurs états chacun, un audit
manuel complet par PR est irréaliste. Les violations passent en production et
impactent tous les consommateurs du système simultanément.

La question posée était :

> **Comment garantir zéro violation WCAG 2.1 AA critique à chaque PR,
> automatiquement, sans dépendre de la vigilance individuelle des reviewers ?**

---

## Décision

Adoption de **axe-core** (Deque Systems) comme moteur d'audit d'accessibilité
automatisé, intégré à deux niveaux complémentaires :

**Niveau composant** — via `@axe-core/playwright` dans les tests Playwright :
chaque composant dans chaque variante et état est audité en conditions réelles
de rendu navigateur. Zéro violation critique = condition de passage du CI.

**Niveau Storybook** — via `@storybook/addon-a11y` (basé sur axe-core) :
audit en direct dans le canvas Storybook pendant le développement, avant même
d'ouvrir une PR.

La règle est stricte : **zéro violation de niveau `critical` ou `serious`**.
Les violations `moderate` et `minor` génèrent un avertissement mais ne bloquent
pas le merge — elles sont documentées et adressées dans un ticket dédié.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Lighthouse (Google)** | Conçu pour auditer des pages entières, pas des composants isolés. Son intégration dans un pipeline de tests unitaires ou Storybook est indirecte. Pertinent pour les tests E2E de pages, pas pour la validation composant par composant en CI. Utilisé en complément, pas en remplacement. |
| **WAVE (WebAIM)** | Extension navigateur uniquement. Non automatisable en CI/CD. Indispensable pour la revue manuelle approfondie, mais ne peut pas bloquer un merge. |
| **Pa11y** | CLI accessible et open source. Moins bien intégré à l'écosystème Playwright + Storybook. Le règlement de règles WCAG est moins granulaire qu'axe-core, et la communauté de maintenance est significativement plus petite. |
| **IBM Equal Access Checker** | Couverture WCAG complète et règles supplémentaires intéressantes. Moins adopté dans l'écosystème JS/Node. L'intégration Playwright et Storybook nécessite plus de configuration personnalisée. Retenu pour des audits ponctuels manuels, pas pour le CI continu. |
| **Audit manuel par un expert accessibilité** | Non substituable pour la validation finale et les cas limites. Mais ne passe pas à l'échelle comme filet de sécurité continu. Le choix d'axe-core ne remplace pas l'expertise humaine — il garantit un plancher minimal automatique à chaque PR. |
| **ESLint + eslint-plugin-jsx-a11y** | Détecte les problèmes statiques dans le JSX (attributs manquants, rôles incorrects). Complémentaire mais insuffisant : il analyse le code source, pas le rendu. Un composant syntaxiquement correct peut produire un arbre d'accessibilité incorrect à l'exécution (Shadow DOM, slots, états dynamiques). |

---

## Conséquences

**Pour le CI/CD :**
- Toute PR introduisant une violation `critical` ou `serious` est bloquée au merge
- Le rapport axe-core est inclus dans les artefacts de PR — visible dans GitHub Actions
- La règle `exit 1` sur violation critique est alignée avec le comportement de `audit-tokens.js --ci`

**Pour les agents IA :**
- Une violation d'accessibilité critique détectée par axe-core est une **escalade obligatoire**,
  pas un avertissement optionnel (voir `.claude/rules/development.md`)
- Un agent ne peut pas approuver ou ignorer une violation critique — il doit la signaler
  et bloquer la PR jusqu'à correction humaine
- axe-core fournit un rapport structuré (JSON) qu'un agent peut lire et analyser
  pour identifier précisément quelle règle WCAG est violée, sur quel élément, et
  quelle correction appliquer

**Pour les développeurs :**
- Le retour est immédiat : l'addon Storybook signale les violations dans le panneau
  d'accessibilité pendant le développement, avant le commit
- Le rapport axe-core nomme la règle violée, l'élément cible, et renvoie vers
  la documentation WCAG correspondante — pas besoin de chercher

**Pour les designers :**
- Les violations de contraste (ratio insuffisant) sont détectées automatiquement
- Un composant qui passe axe-core en toutes variantes et états est certifié WCAG AA
  pour les critères testables automatiquement
- Les critères non testables automatiquement (ordre de lecture logique, alternatives
  textuelles pertinentes, comportement avec lecteur d'écran réel) restent sous
  responsabilité humaine — axe-core ne couvre pas 100% de WCAG

**Périmètre exact de couverture :**
axe-core détecte automatiquement environ 30 à 40% des violations WCAG 2.1 AA.
Ce chiffre est intentionnellement communiqué aux équipes pour éviter une fausse
confiance : zéro violation axe-core n'est pas équivalent à "accessible".
C'est un plancher, pas un plafond.

**Coût accepté :**
- Les tests Playwright avec axe-core allongent le pipeline CI (rendu navigateur réel)
- Les faux positifs sont rares avec axe-core mais existent — chaque suppression de règle
  doit être documentée dans le code avec justification (`axe.disable` commenté)
- La couverture partielle de WCAG doit être explicitement communiquée pour ne pas
  créer de fausse confiance dans les équipes consommatrices

---

## Relation avec Chromatic (ADR-006)

axe-core et Chromatic sont complémentaires, pas redondants :

| | Chromatic | axe-core |
|--|-----------|----------|
| **Détecte** | Régressions visuelles pixel | Violations sémantiques WCAG |
| **Exemple** | Couleur de fond qui change | Ratio de contraste insuffisant |
| **Exemple** | Espacement qui se décale | `aria-label` manquant |
| **Approbation** | Humaine (interface Chromatic) | Automatique (zéro tolérance critique) |

Un composant peut passer Chromatic (visuellement stable) et échouer axe-core
(sémantiquement inaccessible), et inversement.

---

## Incidents ou déclencheurs

Décision fondatrice, prise avant incident.
Motivée par le constat que les design systems livrant des composants sans tests
d'accessibilité automatisés génèrent des violations en cascade dans toutes
les applications consommatrices — chaque équipe hérite des mêmes problèmes
et les corrige localement, sans remonter au système source.
axe-core au niveau du système garantit que le problème est résolu une fois,
pour tous les consommateurs.
