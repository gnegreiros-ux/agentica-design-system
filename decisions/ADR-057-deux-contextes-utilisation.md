# ADR-057 — Deux contextes d'utilisation : Produit (SaaS) et Marketing (Narratif)

**Date :** 2026-06-12
**Statut :** Accepté
**Auteur :** Guilherme Negreiros
**Relations :** ADR-025 (densité), ADR-051 (illustration), ADR-052 (DTCG), `.claude/rules/contexts-utilisation.md`, `tokens/semantic.json`, `guidelines/foundations/contextes.md`

> **English summary:** The Agentica site treated marketing pages (home, get-started, agents) and documentation pages identically, with no tonal distinction between "convincing a visitor" and "documenting a component." This ADR formalizes two usage contexts via a `data-context` attribute on `<body>`: the default Product (SaaS) mode, and an opt-in Marketing (Narrative) mode with its own `semantic.marketing.*` tokens (display typography, section-breathing spacing, hero gap) that override spacing/typography on marketing pages only, without touching shared components.
>
> *The original French version follows below — preserved unaltered as the historical record.*

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
