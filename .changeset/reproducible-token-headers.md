---
"@agentica-ds/tokens": patch
---

Drop the `Generated on <date>` line from the header comment of the built CSS and JS
files (`all.css`, `components.css`, `primitives.css`, `semantic.css`, `js/tokens.js`).
It was stamped with the build clock, so two builds of the same commit produced
different tarballs; the build is now byte-for-byte reproducible. No token name or
value changes.
