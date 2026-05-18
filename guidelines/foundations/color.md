# Fondation : Couleur

> Règles sémantiques des couleurs. Toujours utiliser les tokens — jamais les valeurs brutes.

---

## Principe fondamental

```
red-700 → valeur décoratie. Un agent ne sait pas à quoi ça sert.
color.feedback.danger → intention claire. Un agent sait quand l'utiliser.
```

Source : Jan Six, GitHub, IDS 2026.

---

## Les trois niveaux de tokens couleur

| Niveau | Exemple | Quand l'utiliser |
|--------|---------|-----------------|
| Primitif | `primitive.color.red.700` | **Jamais directement** — uniquement dans les tokens sémantiques |
| Sémantique | `semantic.color.feedback.danger` | Dans les tokens de composant |
| Composant | `component.button.critical.background` | Dans le code des composants |

---

## Rôles sémantiques — arbre de décision

### Actions
```
color.action.primary       → CTA principal, bouton d'action confirmé
color.action.secondary     → Support, alternative
color.action.critical      → Action irréversible (bouton critical)
color.action.disabled      → État désactivé
```

### Feedback
```
color.feedback.success     → Confirmation, succès, validation
color.feedback.warning     → Avertissement, attention requise
color.feedback.danger      → Erreur, danger, critique
color.feedback.info        → Information neutre
```

### Backgrounds
```
color.background.page      → Fond de page principal
color.background.surface   → Carte, panneau, dialogue
color.background.subtle    → Fond légèrement contrasté
color.background.overlay   → Backdrop de modal
```

### Texte
```
color.text.primary         → Corps de texte principal
color.text.secondary       → Métadonnées, helper text
color.text.disabled        → Texte inactif
color.text.inverse         → Texte sur fond sombre
color.text.onAction        → Texte sur bouton primary/critical
```

---

## Règles d'accessibilité — Non négociables

| Contexte | Ratio minimum | Standard |
|----------|--------------|----------|
| Texte normal | 4.5:1 | WCAG 2.1 AA |
| Texte large (18px+ bold, 24px+) | 3:1 | WCAG 2.1 AA |
| Composants UI (bordures, icônes) | 3:1 | WCAG 2.1 AA |
| Texte décoratif | Aucun | — |

> **Vérifier avec :** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Ce qu'il ne faut jamais faire

```css
/* ❌ INTERDIT */
color: #9E1B1B;
background: red;
border: 1px solid blue;

/* ✅ CORRECT */
color: var(--ds-semantic-color-text-primary);
background: var(--ds-component-button-critical-background);
border: 1px solid var(--ds-semantic-color-border-default);
```

---

## Mode sombre (Dark Mode)

Le système prend en charge un mode sombre via les tokens sémantiques.
Les tokens primitifs ne changent pas — seuls les tokens sémantiques sont remappés.

```css
/* Light mode (défaut) */
:root {
  --ds-semantic-color-background-page: var(--ds-primitive-color-neutral-50);
  --ds-semantic-color-text-primary: var(--ds-primitive-color-neutral-900);
}

/* Dark mode */
[data-theme="dark"] {
  --ds-semantic-color-background-page: var(--ds-primitive-color-neutral-900);
  --ds-semantic-color-text-primary: var(--ds-primitive-color-neutral-50);
}
```
