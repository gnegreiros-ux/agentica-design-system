# @agentica-ds/tokens

Agentica's design tokens — compiled CSS custom properties, JS ES6 exports, and a
Tailwind config extension, plus the raw three-layer DTCG JSON source
(primitive → semantic → component).

Architecture decided in [ADR-072](https://github.com/gnegreiros-ux/agentic-design-system/blob/main/decisions/ADR-072-npm-package-architecture.md)
(npm scope corrected in [ADR-073](https://github.com/gnegreiros-ux/agentic-design-system/blob/main/decisions/ADR-073-npm-scope-correction.md)).

## Install

```bash
npm install @agentica-ds/tokens
```

## Usage

### CSS custom properties

```html
<link rel="stylesheet" href="node_modules/@agentica-ds/tokens/css/all.css">
<link rel="stylesheet" href="node_modules/@agentica-ds/tokens/css/dark.css">
```

`all.css` defines every primitive, semantic, and component-level token as a
`--agtc-*` custom property. `dark.css` layers dark-mode overrides under
`[data-theme="dark"]` — load it after `all.css`.

Individual layers are also available if you only need a subset:

```html
<link rel="stylesheet" href="node_modules/@agentica-ds/tokens/css/primitives.css">
<link rel="stylesheet" href="node_modules/@agentica-ds/tokens/css/semantic.css">
<link rel="stylesheet" href="node_modules/@agentica-ds/tokens/css/components.css">
```

### JavaScript (ESM)

```js
import { SemanticColorActionPrimary } from '@agentica-ds/tokens/js';
```

### Tailwind CSS

```js
// tailwind.config.js
import agtc from '@agentica-ds/tokens/tailwind';

export default { theme: { extend: agtc } };
```

Requires `@agentica-ds/tokens/css` to be loaded for the underlying `var()`
references to resolve.

### Raw token source

The raw DTCG JSON (`primitives.json`, `semantic.json`, `semantic.dark.json`,
`component.json`) ships under `tokens/` for internal tooling (Tokens Studio sync,
audit scripts). It is **not** the primary interface for consuming teams — use the
compiled CSS/JS/Tailwind exports above instead.

## Token levels

| Level | Role |
|-------|------|
| Primitive | Raw values (colors, spacing, radii, font sizes) |
| Semantic | Business intent (`color.action.primary`, `space.control.padding`) |
| Component | Institutional contracts per component |

`@agentica-ds/components` is not a dependency of this package — components consume
these CSS custom properties by DOM inheritance, not by JS import. Load
`@agentica-ds/tokens/css` before mounting `agtc-*` components.

## License

MIT
