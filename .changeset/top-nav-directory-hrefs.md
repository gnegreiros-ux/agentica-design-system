---
"@agentica-ds/components": patch
---

`agtc-top-nav`: directory-style hrefs (`'../tokens/'`, `'/tokens/'` — the form the component
guideline documents) are now marked active (`aria-current="page"` + indicator) on their section's
pages. Previously the last segment was read as a file name, so no link was ever active with that
form. Hrefs ending in `section/index.html` behave as before; a non-section `dir/index.html` href is
now active only on that directory instead of on any `index.html` page.
