# Fondation : Espacement

> Unité de base, échelle et contextes d'usage. Toujours via tokens.

---

## Unité de base

L'échelle d'espacement est basée sur **4px** (unité de base).
Toutes les valeurs sont des multiples de 4px.

---

## Échelle (primitifs)

| Token | Valeur | Équivalent rem |
|-------|--------|----------------|
| `primitive.space.0` | 0px | 0 |
| `primitive.space.1` | 4px | 0.25rem |
| `primitive.space.2` | 8px | 0.5rem |
| `primitive.space.3` | 12px | 0.75rem |
| `primitive.space.4` | 16px | 1rem |
| `primitive.space.5` | 20px | 1.25rem |
| `primitive.space.6` | 24px | 1.5rem |
| `primitive.space.8` | 32px | 2rem |
| `primitive.space.10` | 40px | 2.5rem |
| `primitive.space.12` | 48px | 3rem |
| `primitive.space.16` | 64px | 4rem |

---

## Tokens sémantiques d'espacement

| Token | Valeur | Usage |
|-------|--------|-------|
| `semantic.space.control.padding-x` | 16px | Padding horizontal boutons, inputs |
| `semantic.space.control.padding-y` | 8px | Padding vertical boutons, inputs |
| `semantic.space.control.gap` | 8px | Espace icône/texte dans un contrôle |
| `semantic.space.layout.component` | 16px | Padding interne d'un composant (card) |
| `semantic.space.layout.stack` | 12px | Espace vertical entre éléments empilés |
| `semantic.space.layout.section` | 32px | Espace entre sections de page |

---

## Arbre de décision

```
Besoin d'espacer deux éléments dans un composant (icône + texte) ?
  → semantic.space.control.gap

Besoin du padding interne d'un bouton ou input ?
  → semantic.space.control.padding-x / padding-y

Besoin du padding interne d'une carte ?
  → semantic.space.layout.component

Besoin de l'espace entre deux blocs dans une page ?
  → semantic.space.layout.section
```

---

## Ce qu'il ne faut jamais faire

```css
/* ❌ INTERDIT */
padding: 16px 12px;
margin-top: 32px;
gap: 8px;

/* ✅ CORRECT */
padding: var(--ds-semantic-space-control-padding-y) var(--ds-semantic-space-control-padding-x);
margin-top: var(--ds-semantic-space-layout-section);
gap: var(--ds-semantic-space-control-gap);
```

---

## Règle d'accessibilité

- Taille minimale de zone cliquable : 44×44px (WCAG 2.1 SC 2.5.5)
- Cette contrainte est encodée dans les tokens de composant, pas à gérer manuellement.
