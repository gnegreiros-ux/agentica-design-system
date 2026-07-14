# ADR-009 — Choosing Storybook for component documentation

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Tech Lead
> **Type:** contract
> **Logical path:** decisions/ADR-009-storybook.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-002-lit-web-components.md
> **Relations:** .claude/rules/development.md, decisions/ADR-002-lit-web-components.md, decisions/ADR-006-chromatic-tests-visuels.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Context

A design system with no isolated preview environment has two structural
problems: components can only be tested by integrating them into a real
application, and documentation is separate from the component it describes.

For an agentic system, a third problem is added: agents need a structured
catalog of components with their variants, states, and properties, accessible
in a standardized form. Narrative documentation in a wiki isn't machine-analyzable.

The question was:

> **How do we simultaneously provide an isolated development environment,
> living documentation synchronized with the code, and a structured catalog
> accessible to agents?**

---

## Decision

Adopt **Storybook** as the documentation platform and development canvas.

Every component is documented via **stories** — `.stories.js` files that
describe each variant and state of the component in isolation:

```javascript
// button.stories.js
export default { title: 'Components/Button', component: 'agtc-button' };
export const Primary = { args: { variant: 'primary', label: 'Submit' } };
export const Critical = { args: { variant: 'critical', label: 'Permanently delete' } };
```

Storybook serves three simultaneous roles in the system:

1. **Development canvas** — every component is developed and tested in
   isolation, with no dependency on a host application
2. **Living documentation** — stories are the source of truth for components'
   actual behavior, always synchronized with the code
3. **Bridge to Chromatic** — Storybook is the entry point for the Chromatic
   pipeline (ADR-006): every story is automatically captured for visual
   regression testing

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Static documentation (Markdown + MDX only)** | Describes the component without showing it. A developer has to integrate the component into their project to see whether it behaves as documented. No link between documentation and executable code. |
| **Styleguidist** | Similar to Storybook but less adopted, fewer integrations (no native Chromatic, no axe-core addon). The Storybook ecosystem is significantly richer for Web Components. |
| **Figma as the only preview source** | Figma shows the design, not the real component. A component can be visually compliant in Figma and dysfunctional in code. Storybook runs the real component in a browser. |
| **Internal demo page** | An HTML page listing the components. Not maintainable at scale, no structure for variants and states, no CI/CD integration, no accessibility addon. |
| **No interactive documentation** | Explicitly rejected: a design system with no preview canvas forces consuming teams to integrate components blindly. The integration error rate is directly tied to the quality of the interactive documentation. |

---

## Consequences

**For developers:**
- Every new component or variant requires a corresponding story — this is a PR
  rule (`.claude/rules/development.md`)
- Development happens in Storybook first, then integration into the application
- Storybook's hot reload immediately reflects CSS token changes

**For AI agents:**
- The story structure is machine-readable: an agent can list every documented
  variant of a component by reading the `.stories.js` file
- Story args (`variant`, `disabled`, `loading`) map directly to the properties
  declared in the Web Component (`static properties`) — guaranteed consistency
- An agent can verify a story exists for every variant defined in
  `component.json` — a missing story = a component that isn't agent-ready (see
  the `ai-component-metadata` skill)

**For Chromatic (ADR-006):**
- Storybook is Chromatic's mandatory entry point — no story, no visual capture
- The `@storybook/addon-a11y` addon (axe-core) audits every story in real time
  during development, before the commit

**For consuming teams:**
- The published Storybook is the system's official documentation
- Teams can see and interact with every variant without installing dependencies

**Accepted cost:**
- Every component requires a `.stories.js` file to maintain — debt accrues if
  stories aren't updated alongside the component
- Storybook build added to the CI pipeline (a few extra minutes)

---

## Incidents or triggers

Foundational decision. Storybook is the de facto standard for component-based
design systems (GitHub, Shopify, Atlassian, IBM all use it). Native integration
with Chromatic, axe-core, and Web Components confirmed the choice.

<!-- FR -->

# ADR-009 — Choix de Storybook pour la documentation des composants

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-009-storybook.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-002-lit-web-components.md
> **Relations:** .claude/rules/development.md, decisions/ADR-002-lit-web-components.md, decisions/ADR-006-chromatic-tests-visuels.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Contexte

Un système de design sans environnement de prévisualisation isolé a deux problèmes
structurels : les composants ne peuvent être testés qu'en les intégrant dans une
application réelle, et la documentation est séparée du composant qu'elle décrit.

Pour un système agentique, un troisième problème s'ajoute : les agents ont besoin
d'un catalogue structuré de composants avec leurs variantes, états, et propriétés
accessibles sous une forme standardisée. Une documentation narrative dans un wiki
n'est pas analysable par machine.

La question posée était :

> **Comment fournir simultanément un environnement de développement isolé,
> une documentation vivante synchronisée avec le code, et un catalogue
> structuré accessible aux agents ?**

---

## Décision

Adoption de **Storybook** comme plateforme de documentation et de canvas de développement.

Chaque composant est documenté via des **stories** — des fichiers `.stories.js`
qui décrivent chaque variante et état du composant de manière isolée :

```javascript
// button.stories.js
export default { title: 'Components/Button', component: 'agtc-button' };
export const Primary = { args: { variant: 'primary', label: 'Soumettre' } };
export const Critical = { args: { variant: 'critical', label: 'Supprimer définitivement' } };
```

Storybook sert trois rôles simultanés dans le système :

1. **Canvas de développement** — chaque composant est développé et testé en isolation,
   sans dépendance à une application hôte
2. **Documentation vivante** — les stories sont la source de vérité du comportement
   réel des composants, toujours synchronisées avec le code
3. **Pont vers Chromatic** — Storybook est l'entrée du pipeline Chromatic (ADR-006) :
   chaque story est automatiquement capturée pour les tests de régression visuelle

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Documentation statique (Markdown + MDX seul)** | Décrit le composant sans le montrer. Un développeur doit intégrer le composant dans son projet pour voir s'il se comporte comme documenté. Aucun lien entre la documentation et le code exécutable. |
| **Styleguidist** | Similaire à Storybook mais moins adopté, moins d'intégrations (pas de Chromatic natif, pas d'addon axe-core). L'écosystème Storybook est significativement plus riche pour les Web Components. |
| **Figma comme seule source de prévisualisation** | Figma montre le design, pas le composant réel. Un composant peut être visuellement conforme dans Figma et dysfonctionner dans le code. Storybook exécute le composant réel dans un navigateur. |
| **Page de démo interne** | Une page HTML qui liste les composants. Non maintenable à l'échelle, pas de structure pour les variantes et états, pas d'intégration CI/CD, pas d'addon d'accessibilité. |
| **Pas de documentation interactive** | Rejeté explicitement : un système de design sans canvas de prévisualisation force les équipes consommatrices à intégrer les composants à l'aveugle. Le taux d'erreur d'intégration est directement lié à la qualité de la documentation interactive. |

---

## Conséquences

**Pour les développeurs :**
- Chaque nouveau composant ou variante requiert une story correspondante — c'est une
  règle de PR (`.claude/rules/development.md`)
- Le développement se fait dans Storybook d'abord, puis l'intégration en application
- Le hot reload de Storybook affiche immédiatement les changements de tokens CSS

**Pour les agents IA :**
- La structure des stories est lisible par machine : un agent peut lister toutes
  les variantes documentées d'un composant en lisant le fichier `.stories.js`
- Les args des stories (`variant`, `disabled`, `loading`) correspondent directement
  aux propriétés déclarées dans le Web Component (`static properties`) — cohérence garantie
- Un agent peut vérifier qu'une story existe pour chaque variante définie dans
  `component.json` — absence de story = composant non agent-ready (voir skill `ai-component-metadata`)

**Pour Chromatic (ADR-006) :**
- Storybook est l'entrée obligatoire de Chromatic — pas de story, pas de capture visuelle
- L'addon `@storybook/addon-a11y` (axe-core) audite chaque story en temps réel
  pendant le développement, avant le commit

**Pour les équipes consommatrices :**
- Storybook publié est la documentation officielle du système
- Les équipes peuvent voir et interagir avec chaque variante sans installer les dépendances

**Coût accepté :**
- Chaque composant nécessite un fichier `.stories.js` à maintenir — dette si les stories
  ne sont pas mises à jour en même temps que le composant
- Build Storybook ajouté au pipeline CI (quelques minutes supplémentaires)

---

## Incidents ou déclencheurs

Décision fondatrice. Storybook est le standard de facto pour les design systems
basés sur des composants (GitHub, Shopify, Atlassian, IBM l'utilisent tous).
L'intégration native avec Chromatic, axe-core et Web Components a confirmé le choix.
