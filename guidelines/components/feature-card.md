# Composant : Feature Card — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-25
> **Type:** contract
> **Chemin logique:** guidelines/components/feature-card.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-063-agtc-feature-card.md

---

## Intention

**Pourquoi ce composant existe :**
Présenter une capacité, un rôle ou une fonctionnalité dans un bloc éditorial compact — icône + titre + corps — avec une affordance d'interactivité visuelle (border-bottom animé). Conçu pour les sections marketing narratives de type "Valeur par rôle".

**Ce composant n'est pas :**
- Un lien de navigation (placer un `<a>` à l'intérieur si cliquable)
- Une carte de données (`<agtc-card>` pour les surfaces de contenu générique)
- Un bouton ou une action primaire

---

## Variantes

| Variante | Border-bottom | Usage |
|----------|--------------|-------|
| `default` | Couleur principale (`--agtc-semantic-color-action-primary`) | Pages SaaS / produit |
| `marketing` | Gradient primary → accent | Pages `data-context="marketing"` |

---

## Attributs

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `heading` | `String` | `''` | Titre de la carte (2-3 mots max) |
| `heading-level` | `Number` | `3` | Niveau du heading HTML (1–6) — ajuster selon la hiérarchie de la page |
| `variant` | `String` | `'default'` | `"default"` ou `"marketing"` |

## Slots

| Slot | Contenu attendu |
|------|----------------|
| `icon` (nommé) | SVG 20×20px — icône fonctionnelle, non décorative |
| *(défaut)* | Description courte — 1 à 2 phrases |

---

## Règles d'utilisation

```
✅ Maximum 1 niveau de heading par section — ajuster heading-level selon le contexte
✅ Icône fonctionnelle seulement — représenter l'intention du bloc, pas décorer
✅ Corps court — 1 à 2 phrases, pas de listes imbriquées
✅ Utiliser variant="marketing" uniquement sur les pages data-context="marketing"
❌ Jamais de bouton primary à l'intérieur — la carte n'est pas une zone d'action primaire
❌ Jamais d'image raster à l'intérieur — utiliser uniquement des icônes SVG dans le slot icon
```

---

## PATTERNS UX DE RÉFÉRENCE

Revue approuvée le 2026-06-25 (ADR-063).

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Icône + titre en duo | [NN/g — Icons & Indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Signal fonctionnel : l'icône aide à identifier le bloc avant la lecture du titre |
| Affordance d'interactivité contrôlée | [IxDF — UI Design Patterns](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Animation `scaleX` seulement au hover/focus — pas d'animation idle distractante |
| Non-interactivité par défaut | [Smashing Magazine — Card patterns](https://www.smashingmagazine.com/category/design-patterns/) | ✅ | `:host` n'est ni `<a>` ni `<button>` — l'action se place à l'intérieur si nécessaire |
| Cibles tactiles ≥ 24×24px | [IxDF — Touch Targets](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Icône 36px, non interactive — conforme WCAG 2.5.8 |
| Heading niveau flexible | [NN/g — Visual Hierarchy](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Attribut `heading-level` (défaut 3) — évite les sauts de niveaux dans la hiérarchie de page |
| Variante contextuelle | [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | `default` / `marketing` — adapte l'emphase sans dupliquer le composant |
| `prefers-reduced-motion` | [IxDF — Accessibilité](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Border visible en permanence (`scaleX(1)`), transition désactivée |
| Markup accessible | [IF — Data Patterns Catalogue](https://catalogue.projectsbyif.com/) | ✅ | `role="heading"` + `aria-level` dans le shadow DOM — SR agnostique du tag wrapper |

---

## Accessibilité

- `role="heading"` + `aria-level="${headingLevel}"` → lecture correcte par les SR quel que soit le contexte
- `prefers-reduced-motion: reduce` → border-bottom à pleine largeur dès le départ, pas d'animation
- Slot `icon` doit contenir un SVG avec `aria-hidden="true"` — le titre est le label sémantique
- Focus visible : `:host(:focus-within)::after` assure une indication visuelle en navigation clavier

---

## Exemple d'utilisation

```html
<!-- Contexte SaaS — variant par défaut -->
<agtc-feature-card heading="Accessibilité" heading-level="3">
  <svg slot="icon" ...></svg>
  WCAG 2.1 AA automatiquement vérifié avant chaque commit.
</agtc-feature-card>

<!-- Contexte marketing -->
<agtc-feature-card heading="Designers" variant="marketing" heading-level="3">
  <svg slot="icon" ...></svg>
  Tokens sémantiques, contrats de composants et décisions documentées.
</agtc-feature-card>
```
