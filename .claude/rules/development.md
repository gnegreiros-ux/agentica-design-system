# Rule : development

> Règles de développement pour ce système de design.
> À lire si tu génères du code, ouvres une PR ou travailles sur des composants.

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Web Components | Lit (Google) | Contrats UI universels |
| Compilation tokens | Style Dictionary | JSON → CSS / JS / Swift / Android |
| Tests visuels | Chromatic | Régressions visuelles |
| Tests accessibilité | axe-core | Audit automatique WCAG |
| Tests E2E | Playwright | Parcours complets |
| Documentation | Storybook | Canvas + preview + spécifications |
| Sync Figma | Tokens Studio | Figma ↔ JSON |

---

## Règles de code — absolues

```
❌ Jamais de valeur en dur (couleur, espacement, radius)
❌ Jamais de styles en ligne (inline styles) sauf exception documentée
❌ Jamais de token primitif dans un composant
✅ Toujours via CSS Custom Properties : var(--ds-[token])
✅ Toujours utiliser les Web Components pour les éléments partagés
✅ Toujours des attributs ARIA appropriés
✅ Toujours un :focus-visible visible
```

---

## Structure d'un Web Component (Lit)

```javascript
import { LitElement, html, css } from 'lit';

class DsButton extends LitElement {
  static properties = {
    variant: { type: String },  // 'primary' | 'secondary' | 'critical' | 'ghost'
    disabled: { type: Boolean },
    loading: { type: Boolean }
  };

  static styles = css`
    :host {
      display: inline-block;
    }
    button {
      background: var(--ds-component-button-primary-background);
      color: var(--ds-component-button-primary-text);
      border-radius: var(--ds-component-button-primary-radius);
      padding: var(--ds-component-button-primary-padding-y) var(--ds-component-button-primary-padding-x);
      font-size: var(--ds-component-button-primary-font-size);
      font-weight: var(--ds-component-button-primary-font-weight);
      border: none;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--ds-semantic-color-border-focus);
      outline-offset: 2px;
    }
    button:disabled {
      background: var(--ds-component-button-primary-background-disabled);
      cursor: not-allowed;
    }
  `;
}
customElements.define('ds-button', DsButton);
```

---

## Règles pour les PR

Avant d'ouvrir une PR, vérifier :
- [ ] Aucune valeur de token codée en dur
- [ ] Tous les tokens référencés existent dans les JSON
- [ ] Axe-core ne retourne aucune violation critique
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Storybook story mise à jour
- [ ] `guidelines/components/[composant].md` mis à jour si le comportement change

---

## Environnements

| Env | URL | Déclenchement |
|-----|-----|---------------|
| Preview | PR Chromatic | Automatique à chaque PR |
| Staging | staging.design-system.org | Merge sur `develop` |
| Production | design-system.org | Merge sur `main` + approbation |
