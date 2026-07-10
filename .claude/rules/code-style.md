# Rule: code-style

> Style and naming conventions for this project.
> **Type:** rule
> **Logical path:** .claude/rules/code-style.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/git-workflow.md, .claude/rules/development.md

---

## File naming

| Type | Convention | Example |
|------|-----------|---------|
| Web Component | kebab-case | `ds-button.js`, `ds-input.js` |
| Token JSON | kebab-case | `primitives.json`, `semantic.json` |
| Documentation | kebab-case | `button.md`, `color.md` |
| Config | kebab-case | `config.json`, `style-dictionary.json` |

---

## CSS class naming — absolute rule (ADR-2026-06-30)

> **Zero version prefixes in CSS class names and custom properties.**
> This rule applies to the Agentica site, `agtc-*` components, and any future consumer project.

```
❌ FORBIDDEN: .v2-hero, .v2-section, .v2-button, --v2-shell, .ds-btn
✅ REQUIRED: .hero, .site-section, .cta-btn, --site-shell, .agtc-button
```

### Web Component classes

Format: `agtc-[name]` (kebab-case, no version)

```html
✅ <agtc-button>, <agtc-card>, <agtc-top-nav>
❌ <ds-button>, <v2-button>, <agtc-button-v2>
```

### Site CSS classes

Two allowed namespaces, no version prefix:

| Namespace | Prefix | Usage | Examples |
|-----------|--------|-------|---------|
| Site chrome | `site-` | Header, nav, footer — distinguishes from the HTML element | `.site-header`, `.site-nav`, `.site-footer` |
| Content/sections | *(none)* | Sections, grids, page elements | `.hero`, `.shell`, `.overlap`, `.kicker`, `.copy` |
| CTA buttons (styled links) | `cta-` | `<a>` links styled as buttons, distinct from `<agtc-button>` | `.cta-btn`, `.cta-btn-primary` |

```css
/* ✅ Semantic names — describe content or role */
.hero { … }
.shell { … }
.site-nav { … }
.overlap { … }
.kicker { … }
.cta-btn { … }

/* ❌ Names with version or position */
.v2-hero { … }
.v2-section { … }
.v2-nav { … }
.v2-btn-primary { … }
```

### Site custom properties (CSS shorthand)

Format: `--site-[role]`

```css
/* ✅ */
--site-shell: min(var(--agtc-content-max, 1180px), calc(100vw - 48px));
--site-teal: var(--agtc-semantic-color-action-primary);
--site-text: var(--agtc-semantic-color-text-on-dark);

/* ❌ */
--v2-shell: …
--v2-teal: …
```

### Full migration table (2026-06-30)

This table documents all the renames performed during the `v2-` debt migration:

| Old name | New name | Category |
|-----------|------------|-----------|
| `.v2-header` | `.site-header` | Chrome |
| `.v2-nav` | `.site-nav` | Chrome |
| `.v2-footer` | `.site-footer` | Chrome |
| `.v2-docs` | `.docs-menu` | Chrome |
| `.v2-docs-panel` | `.docs-panel` | Chrome |
| `.v2-docs-trigger` | `.docs-trigger` | Chrome |
| `.v2-nav-action` | `.nav-cta` | Chrome |
| `.v2-menu-button` | `.menu-btn` | Chrome |
| `.v2-shell` | `.shell` | Structure |
| `.v2-page` | `.page` | Structure |
| `.v2-page-content` | `.page-content` | Structure |
| `.v2-sidebar` | `.sidebar` | Structure |
| `.v2-with-sidebar` | `.with-sidebar` | Structure |
| `.v2-section` | `.site-section` | Section |
| `.v2-section-heading` | `.section-heading` | Section |
| `.v2-hero` | `.hero` | Section |
| `.v2-immersive` | `.immersive` | Section |
| `.v2-overlap` | `.overlap` | Grid |
| `.v2-split` | `.split` | Grid |
| `.v2-final` | `.section-final` | Section |
| `.v2-copy` | `.copy` | Content |
| `.v2-kicker` | `.kicker` | Content |
| `.v2-button` | `.cta-btn` | CTA |
| `.v2-button-primary` | `.cta-btn-primary` | CTA |
| `.v2-button-secondary` | `.cta-btn-secondary` | CTA |
| `--v2-shell` | `--site-shell` | Custom prop |
| `--v2-text` | `--site-text` | Custom prop |
| `--v2-teal` | `--site-teal` | Custom prop |
| `@keyframes v2-float` | `@keyframes float-illus` | Animation |

*(Full table in the `refactor(css): remove v2- prefix` commit from 2026-06-30)*

---

## CSS Custom Property naming (design system tokens)

Format: `--[prefix]-[level]-[component]-[variant]-[property]`

```css
/* Primitive */
--agtc-primitive-color-blue-700: #1D4ED8;

/* Semantic */
--agtc-semantic-color-action-primary: var(--agtc-primitive-color-blue-700);

/* Component */
--agtc-component-button-primary-background: var(--agtc-semantic-color-action-primary);
```

---

## Comments in code

```javascript
// ✅ Good comment — explains the WHY
// The critical button requires confirmation because the action is irreversible (token contract)

// ❌ Bad comment — describes the WHAT (already readable from the code)
// Sets the button's background color
```

---

## JavaScript / TypeScript

- ES6+ only
- No `var` — use `const` and `let`
- Arrow functions for callbacks
- Destructuring preferred
- Variable naming in camelCase
- Constant naming in UPPER_SNAKE_CASE

---

## JSON (tokens)

- Indentation: 2 spaces
- Keys in camelCase for compound values
- Always include `$type` for every token
- Always include `intent` for semantic tokens
- Always include `$metadata` at the root level

---

## Markdown (documentation)

- H1 headings (`#`) only for the file/component name
- H2 (`##`) for main sections
- H3 (`###`) for subsections
- Tables for comparisons and properties
- Code blocks with the language specified (` ```json `, ` ```css `, etc.)
- Never more than 100 characters per line in descriptions

---

## Git

See `.claude/rules/git-workflow.md` for commit and branch conventions.
