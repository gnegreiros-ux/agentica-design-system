# ADR-002 — Choosing Lit for Web Components

> **Date:** 2026-05-28
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead, Tech Lead
> **Type:** contract
> **Logical path:** decisions/ADR-002-lit-web-components.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/development.md
> **Relations:** .claude/rules/development.md, guidelines/components/, decisions/ADR-001-trois-niveaux-tokens.md

---

## Context

The design system must serve multiple teams using different frameworks (React,
Angular, Vue, vanilla JS). The question was:

> **How do we ship UI components that work everywhere without imposing a framework?**

Two non-negotiable constraints guided the choice:

1. **Universal portability** — an `agtc-button` component must work identically in a
   React app, an Angular app, or a static HTML page, with no adaptation.
2. **Machine-readable contract** — components must expose their properties (`variant`,
   `disabled`, `loading`) in a structured way so AI agents can inspect and generate
   them correctly.

Native Web Components (a W3C standard) satisfy constraint 1 natively. But writing
them in vanilla JS is verbose and doesn't handle reactivity elegantly. A low-level
tool was needed to cut the boilerplate without adding a heavy dependency.

---

## Decision

Adopt **Lit** (Google) as a lightweight abstraction layer over native Web Components.

Lit is not a framework — it's a minimal library (~5 kb gzipped) that adds:
- Reactive property declaration (`static properties`)
- Declarative templates via the `html` tagged literal
- Encapsulated styles via Shadow DOM with the `css` tagged literal
- A simplified lifecycle (`connectedCallback`, `updated`, etc.)

Compiled components are real W3C Custom Elements — Lit disappears at runtime from
the consumer's point of view.

---

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Vanilla Web Components (no Lit)** | Excessive verbosity: manual Shadow DOM handling, observed attributes, reactivity. High maintenance cost per component. |
| **React (exported components)** | Framework coupling. A React component can't be used in Angular without a wrapper. Contradicts the universal-portability principle. |
| **Stencil.js** | More complex build pipeline, framework-specific code generation. Adds a compilation step Lit doesn't require. |
| **Angular Elements** | Angular dependency baked into the bundles. Too large for multi-framework use. |
| **Vue web components** | Same problem as Angular Elements — the Vue runtime is embedded. |
| **An existing component library (MUI, Radix, etc.)** | These libraries are implementations, not token systems. They impose their own visual conventions and break the design system's sovereignty. |

---

## Consequences

**For consuming developers:**
- Universal import: `<agtc-button variant="primary">` works in any HTML context
- Optional framework wrappers (React, Angular) can be auto-generated
- No peer dependency to install — the Custom Element is self-contained

**For AI agents:**
- Properties declared in `static properties` are inspectable and documentable
- The `variant: { type: String }` pattern is machine-readable — an agent can list
  allowed variants without parsing CSS or JSX
- A Lit component's structure is standardized: an agent can generate a new
  component by following the template in `.claude/rules/development.md`

**For token governance:**
- Shadow DOM encapsulates styles — no global style can override a component
  except through CSS Custom Properties (`var(--ds-[token])`)
- This encapsulation forces token usage: it's impossible to style `agtc-button`
  from the outside other than by changing a CSS Custom Property defined in the system

**Accepted cost:**
- A learning curve on the Lit API for developers unfamiliar with it
- Shadow DOM complicates some test patterns (querySelector from the outside)
- Dependency on a Google project — the deprioritization risk is mitigated by Lit
  following W3C standards and components remaining functional without Lit

---

## Incidents or triggers

No production incident. Decision made upstream during architecture design.
Reference: a Web Components + Lit presentation at the AI Design Systems Conference
2026 (Into Design Systems) — external validation of the pattern for agentic systems.

<!-- FR -->

# ADR-002 — Choix de Lit pour les Web Components

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-002-lit-web-components.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md
> **Relations:** .claude/rules/development.md, guidelines/components/, decisions/ADR-001-trois-niveaux-tokens.md

---

## Contexte

Le système de design doit servir plusieurs équipes utilisant des frameworks différents
(React, Angular, Vue, vanilla JS). La question posée était :

> **Comment livrer des composants UI qui fonctionnent partout sans imposer un framework ?**

Deux contraintes non négociables orientaient le choix :

1. **Portabilité universelle** — un composant `agtc-button` doit fonctionner identiquement
   dans une app React, Angular, ou une page HTML statique, sans adaptation.
2. **Contrat lisible par machine** — les composants doivent exposer leurs propriétés
   (`variant`, `disabled`, `loading`) de manière structurée pour que les agents IA
   puissent les inspecter et les générer correctement.

Les Web Components natifs (standard W3C) répondent à la contrainte 1 nativement.
Mais les écrire en vanilla est verbeux et ne gère pas la réactivité élégamment.
Un outil de bas niveau était nécessaire pour réduire le boilerplate sans ajouter de dépendance lourde.

---

## Décision

Adoption de **Lit** (Google) comme couche d'abstraction légère sur les Web Components natifs.

Lit n'est pas un framework — c'est une bibliothèque minimaliste (~5 kb gzippé) qui ajoute :
- Déclaration réactive des propriétés (`static properties`)
- Templates déclaratifs avec `html` tagged literal
- Styles encapsulés avec Shadow DOM via `css` tagged literal
- Cycle de vie simplifié (`connectedCallback`, `updated`, etc.)

Les composants compilés sont de vrais Custom Elements W3C — Lit disparaît à l'exécution
du point de vue des consommateurs.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Web Components vanilla (sans Lit)** | Verbosité excessive : gestion manuelle du Shadow DOM, des attributs observés, de la réactivité. Coût de maintenance élevé pour chaque composant. |
| **React (composants exportés)** | Couplage au framework. Un composant React ne s'utilise pas dans Angular sans wrapper. Contraire au principe de portabilité universelle. |
| **Stencil.js** | Pipeline de build plus complexe, génération de code spécifique par framework. Ajoute une étape de compilation que Lit n'impose pas. |
| **Angular Elements** | Dépendance à Angular dans les bundles. Taille trop importante pour un usage multi-framework. |
| **Vue web components** | Même problème que Angular Elements — le runtime Vue est embarqué. |
| **Bibliothèque de composants existante (MUI, Radix, etc.)** | Ces bibliothèques sont des implémentations, pas des systèmes de tokens. Elles imposent leurs conventions visuelles et cassent la souveraineté du système de design. |

---

## Conséquences

**Pour les développeurs consommateurs :**
- Import universel : `<agtc-button variant="primary">` fonctionne dans n'importe quel contexte HTML
- Wrappers framework optionnels (React, Angular) générables automatiquement
- Pas de peer dependency à installer — le Custom Element est autonome

**Pour les agents IA :**
- Les propriétés déclarées dans `static properties` sont inspectables et documentables
- Le pattern `variant: { type: String }` est lisible par machine — un agent peut lister
  les variantes autorisées sans parser du CSS ou du JSX
- La structure d'un composant Lit est standardisée : un agent peut générer un nouveau
  composant en suivant le template de `.claude/rules/development.md`

**Pour la gouvernance des tokens :**
- Le Shadow DOM encapsule les styles — aucun style global ne peut surcharger un composant
  sans passer par les CSS Custom Properties (`var(--ds-[token])`)
- Cette encapsulation force l'usage des tokens : impossible de styler `agtc-button` depuis
  l'extérieur autrement qu'en modifiant une CSS Custom Property définie dans le système

**Coût accepté :**
- Apprentissage de l'API Lit pour les développeurs non familiers
- Le Shadow DOM complique certains patterns de test (querySelector depuis l'extérieur)
- Dépendance à un projet Google — risque de dépriorisation mitigé par le fait que
  Lit suit les standards W3C et que les composants resteraient fonctionnels sans Lit

---

## Incidents ou déclencheurs

Aucun incident en production. Décision prise en amont lors de la conception de l'architecture.
Référence : présentation de Web Components + Lit à l'AI Design Systems Conference 2026
(Into Design Systems) — validation externe du pattern pour les systèmes agentiques.
