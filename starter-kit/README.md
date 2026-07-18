# Agentica — starter kit

Minimal, working example showing how to consume `@agentica-ds/tokens` and
`@agentica-ds/components` in a fresh project, with nothing else from this repository.
Copy this folder as-is as a starting point for a new application.

## Contents

| File | Role |
|---|---|
| `package.json` | Real dependencies published on npm (`@agentica-ds/*`, `lit`) |
| `index.html` | HTML page with a few `agtc-*` components |
| `main.js` | Imports the tokens (light + dark CSS) and the components barrel |
| `style.css` | Demo layout, entirely via tokens (`var(--agtc-semantic-*)`) |

## Getting started

```bash
cd starter-kit
npm install
npm run dev
```

Open `http://localhost:5173`. The button in the top right toggles between light
and dark themes (`data-theme` on `<html>`), to verify both token sets load correctly.

## What the demo shows

- **Tokens**: `style.css` only uses `var(--agtc-semantic-*)` — never a hardcoded
  value (color, spacing) — following the design system's rule
  ([`tokens-system.md`](../.claude/rules/tokens-system.md)).
- **Components**: `agtc-button`, `agtc-card`, `agtc-input`, `agtc-badge` loaded via
  the `@agentica-ds/components` barrel — no bundling or custom build required.
- **Dark theme**: loading `@agentica-ds/tokens/css/dark` on top of the base set,
  toggled simply by setting `data-theme="dark"` on `<html>`.

## Going further

- Per-component import (tree-shaking) instead of the barrel:
  `import '@agentica-ds/components/agtc-button.js'`
- Full list of components and their contract (variants, states, accessibility):
  `guidelines/components/` in the main repository.
- Version updates and visual regression management:
  `guidelines/foundations/testing.md`.

## Why Vite?

Agentica packages are published in ESM with "bare" imports
(`import '@agentica-ds/components'`). A browser can't resolve this kind of
specifier without a bundler or import map. Vite is the simplest choice for this —
no configuration needed, and replaceable with any other bundler (Webpack,
esbuild, Rollup…) on the product team's side.
