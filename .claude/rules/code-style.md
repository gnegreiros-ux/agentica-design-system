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

Full old→new rename table (chrome, structure, section, grid, content, CTA, custom
properties, animation): see the `refactor(css): remove v2- prefix` commit from 2026-06-30.

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
