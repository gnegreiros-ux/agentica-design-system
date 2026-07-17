# @agentica-ds/components

Agentica's Lit Web Components — `agtc-*` elements, one ESM entry point per component
(for tree-shaking) plus a barrel export.

Architecture decided in [ADR-072](https://github.com/gnegreiros-ux/agentic-design-system/blob/main/decisions/ADR-072-npm-package-architecture.md)
(npm scope corrected in [ADR-073](https://github.com/gnegreiros-ux/agentic-design-system/blob/main/decisions/ADR-073-npm-scope-correction.md)).

## Install

```bash
npm install @agentica-ds/components
```

`lit` is a peer dependency — install it alongside if your project doesn't already
depend on it:

```bash
npm install lit
```

Load [`@agentica-ds/tokens`](https://www.npmjs.com/package/@agentica-ds/tokens)'s
compiled CSS before mounting these components — they consume `--agtc-*` custom
properties by DOM inheritance, not by JS import.

## Usage

### Everything at once (barrel)

```js
import '@agentica-ds/components';
```

Registers every `agtc-*` custom element as a side effect.

### One component at a time (tree-shaking)

```js
import '@agentica-ds/components/agtc-button.js';
```

```html
<agtc-button variant="primary">Save</agtc-button>
```

## Components

| Element | | Element |
|---|---|---|
| `agtc-badge` | | `agtc-radio` |
| `agtc-banner` | | `agtc-radio-group` |
| `agtc-button` | | `agtc-segmented` |
| `agtc-card` | | `agtc-table` |
| `agtc-checkbox` | | `agtc-tabs` |
| `agtc-code-block` | | `agtc-toggle` |
| `agtc-feature-card` | | `agtc-top-nav` |
| `agtc-icon` | | |
| `agtc-input` | | |
| `agtc-link` | | |

Full component contracts (variants, states, accessibility rules) live in each
component's guideline document in the source repository's `guidelines/components/`.

## License

MIT
