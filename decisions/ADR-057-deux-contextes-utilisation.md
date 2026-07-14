# ADR-057 — Two usage contexts: Product (SaaS) and Marketing (Narrative)

**Date:** 2026-06-12
**Status:** Accepted
**Author:** Guilherme Negreiros
**Relations:** ADR-025 (density), ADR-051 (illustration), ADR-052 (DTCG), `.claude/rules/contexts-utilisation.md`, `tokens/semantic.json`, `guidelines/foundations/contextes.md`

---

## Context

The Agentica site produced homogeneous pages: marketing pages (home, get-started, agents) used
the same spacing and typography patterns as documentation pages (components, foundations).
Result: no difference in "tone" between convincing a visitor and documenting a component.

The `Redesign/deux-contextes.md` file mandates formalizing two distinct modes. Some foundations
already exist implicitly (`comfortable` density via ADR-025, the `typography.hero` token at
48px, the illustration palette via ADR-051), but no explicit contract links them to usage
contexts.

---

## Decision

Formalize two usage contexts declared via a `data-context` attribute on `<body>`:

| Attribute | Context | Intent |
|----------|----------|-----------|
| *(absent)* or `data-context="product"` | Product Mode (SaaS) | Enable action — clarity, density, repeatability |
| `data-context="marketing"` | Marketing Mode (Narrative) | Communicate a vision — breathing room, editorial hierarchy |

### Tokens added

**Primitives** (`tokens/primitives.json`):
- `primitive.fontSize.6xl` — 60px (marketing display title)
- `primitive.space.24` — 96px (section breathing room)
- `primitive.space.30` — 120px (hero gap)

**Semantic** (`tokens/semantic.json`) — `semantic.marketing.*` group:
- `marketing.typography.display.{size, weight, line-height}`
- `marketing.typography.eyebrow.{size, weight}`
- `marketing.space.section-breathing` → `primitive.space.24` (96px)
- `marketing.space.hero-gap` → `primitive.space.30` (120px)

### CSS mode-switching

A CSS block activated by `[data-context="marketing"]` replaces the spacing and hero typography
tokens for the pages concerned, without touching components or component tokens.

### Pages declared as marketing

- `index.html` (home) — introduces the vision
- `get-started.html` — onboarding, convinces
- `agents/index.html` — explains the agentic system

---

## Alternatives considered

| Alternative | Rejected because |
|-------------|-------------------|
| Per-page JSON config file | Over-engineering for 3 pages; an HTML attribute is readable by both agents and CSS |
| Two separate CSS files (product.css / marketing.css) | Duplication; an attribute is enough to override the variables |
| CSS class on `<body>` | A `data-` attribute is more semantically correct for a page state (not an interaction state) |
| Separate component tokens per mode | Would violate the approval rule (tokens/component.json) with no real benefit |

---

## Consequences

- **Machine-readable rule**: `.claude/rules/contexts-utilisation.md` — loaded every session.
- **Guideline**: `guidelines/foundations/contextes.md` — human + agent reference.
- **DESIGN.md**: section 7 added.
- **Site**: `foundations/contextes.html` added to the sidebar.
- **Governance**: `semantic.marketing.*` tokens follow the semantic-token TCR rule (Design
  System Lead approval).

---

## Conformance

- Tokens in DTCG format (ADR-052) ✅
- No hardcoded value in the CSS — only `var(--agtc-*)` references ✅
- The `tokens-system.md` rule is respected (primitive → semantic, never primitive inside
  component) ✅
- `data-context` attribute: decorative for agents, functional for CSS ✅

<!-- FR -->

# ADR-057 — Deux contextes d'utilisation : Produit (SaaS) et Marketing (Narratif)

**Date :** 2026-06-12
**Statut :** Accepté
**Auteur :** Guilherme Negreiros
**Relations :** ADR-025 (densité), ADR-051 (illustration), ADR-052 (DTCG), `.claude/rules/contexts-utilisation.md`, `tokens/semantic.json`, `guidelines/foundations/contextes.md`

---

## Contexte

Le site Agentica produit des pages homogènes : les pages marketing (home, get-started, agents) utilisent
les mêmes patterns d'espacement et de typographie que les pages documentation (composants, fondations).
Résultat : aucune différence de "ton" entre convaincre un visiteur et documenter un composant.

Le fichier `Redesign/deux-contextes.md` mandate la formalisation de deux modes distincts. Des fondations
existent déjà implicitement (densité `comfortable` via ADR-025, token `typography.hero` 48px, palette
d'illustration via ADR-051) mais aucun contrat explicite ne les relie à des contextes d'utilisation.

---

## Décision

Formaliser deux contextes d'utilisation déclarés par un attribut `data-context` sur `<body>` :

| Attribut | Contexte | Intention |
|----------|----------|-----------|
| *(absent)* ou `data-context="product"` | Mode Produit (SaaS) | Permettre d'agir — clarté, densité, répétabilité |
| `data-context="marketing"` | Mode Marketing (Narratif) | Communiquer une vision — respiration, hiérarchie éditoriale |

### Tokens ajoutés

**Primitifs** (`tokens/primitives.json`) :
- `primitive.fontSize.6xl` — 60px (titre display marketing)
- `primitive.space.24` — 96px (respiration section)
- `primitive.space.30` — 120px (gap hero)

**Sémantiques** (`tokens/semantic.json`) — groupe `semantic.marketing.*` :
- `marketing.typography.display.{size, weight, line-height}`
- `marketing.typography.eyebrow.{size, weight}`
- `marketing.space.section-breathing` → `primitive.space.24` (96px)
- `marketing.space.hero-gap` → `primitive.space.30` (120px)

### CSS mode-switching

Un bloc CSS activé par `[data-context="marketing"]` remplace les tokens d'espacement et de typographie
hero pour les pages concernées, sans toucher aux composants ni aux tokens de composant.

### Pages déclarées marketing

- `index.html` (home) — introduit la vision
- `get-started.html` — onboarding, convainc
- `agents/index.html` — explique le système agentique

---

## Alternatives considérées

| Alternative | Rejetée parce que |
|-------------|-------------------|
| Fichier de config JSON par page | Sur-ingénierie pour 3 pages ; attribut HTML lisible par les agents et les CSS |
| Deux CSS séparés (product.css / marketing.css) | Duplication ; un attribut suffit pour surcharger les variables |
| Classe CSS sur `<body>` | Attribut `data-` plus sémantique pour un état de page (pas un état d'interaction) |
| Tokens de composant séparés par mode | Violerait la règle d'approbation (tokens/component.json) sans gain réel |

---

## Conséquences

- **Règle machine-readable** : `.claude/rules/contexts-utilisation.md` — chargée à chaque session.
- **Guideline** : `guidelines/foundations/contextes.md` — référence humain + agent.
- **DESIGN.md** : section 7 ajoutée.
- **Site** : `foundations/contextes.html` ajoutée à la sidebar.
- **Gouvernance** : les tokens `semantic.marketing.*` suivent la règle TCR des tokens sémantiques
  (approbation Design System Lead).

---

## Conformité

- Tokens au format DTCG (ADR-052) ✅
- Aucune valeur en dur dans le CSS — uniquement des références `var(--agtc-*)` ✅
- La règle `tokens-system.md` est respectée (primitif → sémantique, jamais primitif dans composant) ✅
- Attribut `data-context` : décoratif pour les agents, fonctionnel pour le CSS ✅
