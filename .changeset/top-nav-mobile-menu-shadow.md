---
"@agentica-ds/components": patch
---

`agtc-top-nav`: the mobile menu panel's shadow now uses the `semantic.shadow.raised`
token (`--agtc-semantic-shadow-raised`). It consumed `--agtc-shadow-md`, a variable
defined only by the documentation site's CSS — so in any app using the package, the
mobile menu had no shadow at all. It now renders the same shadow as other raised
menus, wherever the component is used.
