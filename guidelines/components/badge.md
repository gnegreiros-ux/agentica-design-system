# Composant : Badge — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-05-31
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/badge.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Afficher un statut, une catégorie ou un compteur de manière compacte et non interactive.

**Ce composant n'est pas :**
- Un bouton (utiliser `<agtc-button>`)
- Une alerte contextuelle (utiliser `<agtc-alert>`)
- Un tag cliquable (encapsuler dans un `<button>`)

---

## VARIANTES

| Variante | Sémantique | Usage typique |
|----------|-----------|---------------|
| `neutral` | Neutre, informatif | Statut par défaut, labels génériques |
| `brand` | Identité produit | Fonctionnalités nouvelles, highlights |
| `success` | Succès, validé | Statut "Actif", "Approuvé", "Complété" |
| `warning` | Attention requise | Statut "En attente", "À revoir" |
| `danger` | Erreur, critique | Statut "Rejeté", "Expiré", "Erreur" |
| `info` | Information neutre | Statut "En cours", "Brouillon" |

---

## TAILLES

| Taille | Usage |
|--------|-------|
| `md` | Défaut — usage général dans les listes et tableaux |
| `sm` | Espaces contraints — tableaux denses, en-têtes |

---

## PROPRIÉTÉS

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `variant` | String | `neutral` | Variante sémantique |
| `size` | String | `md` | Taille : `md` ou `sm` |
| `icon` | String | — | Icône Lucide en prefix |
| `icon-only` | Boolean | `false` | Affiche uniquement l'icône |
| `label` | String | — | **Obligatoire si `icon-only`** — WCAG 1.1.1 |

---

## TOKENS UTILISÉS

| Variante | Token background | Token text | Token border |
|----------|-----------------|-----------|--------------|
| neutral | `component.badge.neutral.background` | `component.badge.neutral.text` | `component.badge.neutral.border` |
| brand | `component.badge.brand.background` | `component.badge.brand.text` | — |
| success | `component.badge.success.background` | `component.badge.success.text` | — |
| warning | `component.badge.warning.background` | `component.badge.warning.text` | — |
| danger | `component.badge.danger.background` | `component.badge.danger.text` | — |
| info | `component.badge.info.background` | `component.badge.info.text` | — |

| Propriété | Token |
|-----------|-------|
| Rayon md | `component.badge.md.radius` (pill — 9999px) |
| Padding X md | `component.badge.md.padding-x` |
| Padding Y md | `component.badge.md.padding-y` |
| Font size md | `component.badge.md.font-size` |
| Rayon sm | `component.badge.sm.radius` (pill — 9999px) |
| Padding X sm | `component.badge.sm.padding-x` |
| Padding Y sm | `component.badge.sm.padding-y` |
| Font size sm | `component.badge.sm.font-size` |

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Rôle sémantique | `role="status"` — annonce les changements aux lecteurs d'écran |
| Badge icon-only | `aria-label` obligatoire (WCAG 1.1.1) |
| Badge icon-only sans label | `aria-hidden="true"` — purement décoratif |
| Contraste texte/fond | 4.5:1 minimum sur fond blanc (WCAG AA) |
| Non interactif | Pas de `tabindex` — si cliquable, encapsuler dans un `<button>` |

---

## COMPORTEMENTS

Le badge est **non interactif** par défaut.

- `user-select: none` — le texte n'est pas sélectionnable
- `white-space: nowrap` — jamais de retour à la ligne
- Icon-only : `aspect-ratio: 1` — forme carrée parfaite

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| Badge cliquable sans encapsulation | Non accessible, pas de focus |
| `icon-only` sans `label` | Inaccessible (WCAG 1.1.1) |
| Variante inventée hors de `component.json` | Escalader au design system team |
| Couleur codée en dur | Contourne les tokens sémantiques |
| Badge pour une action | Utiliser `<agtc-button>` à la place |

---

## PATTERNS UX DE RÉFÉRENCE

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036). Décision : **tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Statut pas encodé uniquement par la couleur | [NN/g — indicators](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | **Recommandé** : pour les statuts critiques (`danger`/`warning`), ajouter une icône ou un libellé distinctif (non imposé, mais bonne pratique) |
| `role="status"` pour annoncer les changements aux AT | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Déjà en place |
| Mapping sémantique cohérent (traffic-light) | [Dashboard — color/semantic](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Variantes success/warning/danger |
| Badge non interactif — encapsuler si cliquable | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Anti-pattern existant |

---

## IMPLÉMENTATION

### Web Component (Lit)
```html
<!-- Badge texte basique -->
<agtc-badge>Nouveau</agtc-badge>
<agtc-badge variant="success">Actif</agtc-badge>
<agtc-badge variant="warning">En attente</agtc-badge>
<agtc-badge variant="danger">Rejeté</agtc-badge>
<agtc-badge variant="info">En cours</agtc-badge>
<agtc-badge variant="brand">Beta</agtc-badge>

<!-- Avec icône -->
<agtc-badge variant="success" icon="check">Approuvé</agtc-badge>
<agtc-badge variant="danger" icon="x">Expiré</agtc-badge>

<!-- Taille sm -->
<agtc-badge size="sm" variant="neutral">Draft</agtc-badge>

<!-- Icon-only — label obligatoire -->
<agtc-badge icon-only icon="check" label="Approuvé" variant="success"></agtc-badge>
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une variante | Principal Designer + Tech Lead |
| Modification d'un token | Principal Designer |
| Changement de taille | Design system team |
| Correction bug accessibilité | Review design system team |
