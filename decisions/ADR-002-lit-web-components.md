# ADR-002 — Choix de Lit pour les Web Components

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-002-lit-web-components.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md
> **Relations:** .claude/rules/development.md, guidelines/components/, decisions/ADR-001-trois-niveaux-tokens.md

> **English summary:** Adopts Lit as a lightweight abstraction over native Web Components so components work identically across React, Angular, Vue, and vanilla HTML without imposing a framework. Lit's declarative properties make component contracts machine-readable, letting agents inspect and generate components from a standardized template.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
