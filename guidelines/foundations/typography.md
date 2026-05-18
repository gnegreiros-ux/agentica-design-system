# Fondation : Typographie

> Familles, échelle, line-height, weight. Toujours via tokens.

---

## Rôles typographiques

| Rôle | Token | Usage |
|------|-------|-------|
| `typography.heading` | `semantic.typography.heading` | Titres de sections, H1–H3 |
| `typography.body` | `semantic.typography.body` | Corps de texte, paragraphes |
| `typography.label` | `semantic.typography.label` | Libellés de contrôles, boutons |

---

## Échelle de taille (primitifs)

| Token | Valeur | Usage typique |
|-------|--------|---------------|
| `primitive.fontSize.xs` | 12px | Légendes, mentions légales |
| `primitive.fontSize.sm` | 14px | Labels, helper text |
| `primitive.fontSize.md` | 16px | Corps de texte |
| `primitive.fontSize.lg` | 18px | Texte légèrement accentué |
| `primitive.fontSize.xl` | 20px | Sous-titres |
| `primitive.fontSize.2xl` | 24px | Titres de section |
| `primitive.fontSize.3xl` | 30px | Titres de page |
| `primitive.fontSize.4xl` | 36px | Héros, grandes accentuations |

---

## Weights

| Token | Valeur | Usage |
|-------|--------|-------|
| `primitive.fontWeight.regular` | 400 | Corps de texte |
| `primitive.fontWeight.medium` | 500 | Labels, navigation |
| `primitive.fontWeight.semibold` | 600 | Titres, emphase |
| `primitive.fontWeight.bold` | 700 | Accentuation forte |

---

## Line-height

| Token | Valeur | Usage |
|-------|--------|-------|
| `primitive.lineHeight.tight` | 1.25 | Titres, éléments courts |
| `primitive.lineHeight.normal` | 1.5 | Corps de texte |
| `primitive.lineHeight.relaxed` | 1.75 | Texte long, accessibilité |

---

## Règles d'accessibilité

- Taille minimum de corps de texte : 16px (`primitive.fontSize.md`)
- Line-height minimum pour les paragraphes : 1.5 (`primitive.lineHeight.normal`)
- Jamais de `text-transform: uppercase` sur des blocs de texte longs
- Respecter la préférence utilisateur `prefers-reduced-motion` pour les animations typographiques

---

## Ce qu'il ne faut jamais faire

```css
/* ❌ INTERDIT */
font-size: 13px;
font-weight: 600;
line-height: 1.2;

/* ✅ CORRECT */
font-size: var(--ds-semantic-typography-label-size);
font-weight: var(--ds-semantic-typography-label-weight);
line-height: var(--ds-primitive-line-height-tight);
```
