# Fondation — Espacement

> Fondation espacement du système de design — grille 4px et règles d'usage.
> **Type:** guideline
> **Chemin logique:** guidelines/foundations/spacing.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, decisions/ADR-020-grille-4px.md

---

## Principe — La grille 4px

**Toute valeur dimensionnelle est un multiple de 4px.**

Ce module de base garantit la cohérence visuelle à toutes les densités d'affichage, simplifie les décisions d'espacement et permet l'audit automatique des dérives.

> « Si la valeur n'est pas dans la table, ce n'est pas une valeur du système. »

Voir [ADR-020](../../decisions/ADR-020-grille-4px.md) pour l'argumentaire complet et les alternatives rejetées.

---

## Échelle primitive complète

| Token primitif | Valeur | Multiplicateur | Usage type |
|----------------|--------|----------------|-----------|
| `primitive.space.1`  | 4px  | 4 × 1  | Micro — gap interne minimal, séparateur |
| `primitive.space.2`  | 8px  | 4 × 2  | Petit — padding vertical des contrôles |
| `primitive.space.3`  | 12px | 4 × 3  | Intermédiaire |
| `primitive.space.4`  | 16px | 4 × 4  | Standard — padding horizontal des contrôles |
| `primitive.space.5`  | 20px | 4 × 5  | Moyen |
| `primitive.space.6`  | 24px | 4 × 6  | Intermédiaire large |
| `primitive.space.8`  | 32px | 4 × 8  | Grand — séparation entre composants |
| `primitive.space.10` | 40px | 4 × 10 | Très grand |
| `primitive.space.12` | 48px | 4 × 12 | Macro |
| `primitive.space.16` | 64px | 4 × 16 | Macro — séparation entre sections de page |

Les primitifs ne sont **jamais utilisés directement** dans les composants. Toujours passer par un token sémantique.

---

## Tokens sémantiques

Les tokens sémantiques traduisent l'échelle en intentions UX :

| Token sémantique | Valeur résolue | Intention |
|-----------------|----------------|-----------|
| `semantic.space.control.padding-x` | 16px (`space.4`) | Padding horizontal des contrôles interactifs |
| `semantic.space.control.padding-y` | 8px (`space.2`)  | Padding vertical des contrôles interactifs |
| `semantic.space.control.gap`       | 8px (`space.2`)  | Écart interne (icône + label dans un bouton) |
| `semantic.space.layout.section`    | 32px (`space.8`) | Séparation entre sections de page |
| `semantic.space.layout.component`  | 20px (`space.5`) | Séparation entre composants |

En CSS :
```css
padding: var(--sda-semantic-space-control-padding-y) var(--sda-semantic-space-control-padding-x);
gap: var(--sda-semantic-space-control-gap);
margin-bottom: var(--sda-semantic-space-layout-component);
```

---

## Règles d'usage

```
✅ Toujours utiliser un token sémantique dans les composants
✅ Si aucun token sémantique ne correspond, en créer un (PR requise)
✅ Toute nouvelle valeur primitive doit être un multiple de 4

❌ Jamais de valeur px en dur : padding: 14px
❌ Jamais de Tailwind arbitrary values : p-[14px]
❌ Jamais de token primitif dans un composant : var(--sda-primitive-space-4)
```

---

## Quand utiliser quel échelon

| Contexte | Token recommandé | Valeur |
|----------|-----------------|--------|
| Gap entre icône et label | `control.gap` | 8px |
| Padding bouton / input | `control.padding-x/y` | 16px / 8px |
| Marge entre deux composants | `layout.component` | 20px |
| Marge entre sections | `layout.section` | 32px |
| Espacement micro (badge, tag) | `primitive.space.1` via nouveau token sémantique | 4px |
| Padding carte | Créer `semantic.space.card.padding` = `space.6` | 24px |
