# Rule: development

> Development rules for this design system.
> Read this if you generate code, open a PR, or work on components.
> **Type:** rule
> **Logical path:** .claude/rules/development.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/tokens-system.md, .claude/rules/git-workflow.md, .claude/rules/code-style.md

---

## Tech stack

| Layer | Technology | Role |
|--------|-------------|------|
| Web Components | Lit (Google) | Universal UI contracts |
| Token compilation | Style Dictionary | JSON → CSS / JS / Swift / Android |
| Visual testing | Chromatic | Visual regression |
| Accessibility testing | axe-core | Automated WCAG audit |
| E2E testing | Playwright | Full user flows |
| Documentation | Storybook | Canvas + preview + specs |
| Figma sync | Tokens Studio | Figma ↔ JSON |

---

## Code rules — absolute

```
❌ Never a hardcoded value (color, spacing, radius)
❌ Never inline styles unless documented as an exception
❌ Never a primitive token inside a component
✅ Always via CSS Custom Properties: var(--ds-[token])
✅ Always use Web Components for shared elements
✅ Always appropriate ARIA attributes
✅ Always a visible :focus-visible
```

---

## Web Component structure (Lit)

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
      background: var(--agtc-component-button-primary-background);
      color: var(--agtc-component-button-primary-text);
      border-radius: var(--agtc-component-button-primary-radius);
      padding: var(--agtc-component-button-primary-padding-y) var(--agtc-component-button-primary-padding-x);
      font-size: var(--agtc-component-button-primary-font-size);
      font-weight: var(--agtc-component-button-primary-font-weight);
      border: none;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--agtc-semantic-color-border-focus);
      outline-offset: 2px;
    }
    button:disabled {
      background: var(--agtc-component-button-primary-background-disabled);
      cursor: not-allowed;
    }
  `;
}
customElements.define('ds-button', DsButton);
```

---

## PR rules

Before opening a PR, verify:
- [ ] No token value hardcoded
- [ ] All referenced tokens exist in the JSON files
- [ ] axe-core returns zero critical violations
- [ ] Focus is visible on all interactive elements
- [ ] Storybook story created/updated
- [ ] `guidelines/components/[component].md` updated if behavior changes

---

## Environments

| Env | URL | Trigger |
|-----|-----|---------------|
| Preview | PR Chromatic | Automatic on every PR |
| Staging | staging.design-system.org | Merge to `develop` |
| Production | design-system.org | Merge to `main` + approval |
