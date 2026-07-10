# Checklist — Site update

> Run in order before every commit touching `site/`, `tokens/`, `guidelines/`, or `decisions/`.
> **Type:** instruction
> **Logical path:** .claude/instructions/site-checklist.md
> **Author:** Guilherme Negreiros
> **Relations:** site/build.js, .claude/instructions/session-spec.md, decisions/ADR-069-migration-suivi-projet-github-projects.md

---

## 1. Tokens

- [ ] Every new primitive value has `$value`, `$type`, `$description`
- [ ] Semantic tokens reference primitives via `{primitive.X.Y}` — never a hardcoded value
- [ ] No `--ds-` prefix — only `--agtc-`
- [ ] An ADR created if the decision is architectural (new font, new library, new system)

---

## 2. Site build

```bash
cd site && node build.js
```

- [ ] The build completes without error
- [ ] The file counter in the console output is consistent (`N + adrs.length`)
- [ ] Verify the actual count: `find site/dist -name "*.html" | wc -l`
- [ ] If there is a discrepancy, update `const total = N + adrs.length` in `build()`

---

## 3. New pages or sections

For every new foundation or component page:

- [ ] `buildXxx()` function created in `build.js`
- [ ] Called in `build()` at the right place
- [ ] Added to `sidebarFoundations()` or `sidebarComponents()`
- [ ] The sidebar's `base` is `'../'` for any page in a subdirectory (`depth: 1`)
- [ ] `layout({ depth: 1, ... })` used for pages in `foundations/`, `components/`, `decisions/`

---

## 4. Content

- [ ] No UI emoji — only Lucide icons via `icon('name', size)`
- [ ] No mention of "Inter" — the font is Atkinson Hyperlegible
- [ ] Values in tables are resolved from `SEM['key']`, not hardcoded
- [ ] ✅/❌ rules use `icon('circle-check', 16)` / `icon('circle-x', 16)` with `.icon-ok` / `.icon-no` classes

---

## 5. Links

Test at least one page per depth level:

- [ ] Root page (`index.html`) — links without `../`
- [ ] Foundation page (`foundations/*.html`) — sidebar links with `../`
- [ ] Component page (`components/*.html`) — sidebar links with `../`
- [ ] Decision page (`decisions/*.html`) — local sidebar links

Sign of broken links: a doubled path like `foundations/foundations/color.html`.

---

## 6. Project tracking

- [ ] Undertaking reflected in GitHub Projects (status, domain) — see ADR-069, no log file in the repo

---

## 7. session-spec.md

Update if any of the following has changed:

- [ ] New semantic token → add to "Semantic tokens — quick reference"
- [ ] New component → add to "Component inventory"
- [ ] New ADR → add to "Active architectural decisions"
- [ ] Stack change → update "System identity"

---

## 8. Commit

```bash
git status          # check staged files
git add <files>
git commit -m "type(scope): description"
git push origin main
```

- [ ] Conventional Commits convention respected (`feat`, `fix`, `token`, `docs`, `ci`, `chore`...)
- [ ] No files from outside the repo accidentally included

---

## 9. CI

```bash
# Check via the GitHub API
curl -s "https://api.github.com/repos/gnegreiros-ux/agentic-design-system/actions/runs?per_page=1" \
  | python3 -c "import json,sys; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['head_sha'][:7], r['status'], r['conclusion'] or 'in progress')"
```

- [ ] CI `completed success` on the right SHA
- [ ] If failed: check that `npm ci` is present in the workflow, check build errors

---

## 10. Deployed site

Check at least these URLs after deployment:

- [ ] `https://gnegreiros-ux.github.io/agentic-design-system/` — home page
- [ ] `https://gnegreiros-ux.github.io/agentic-design-system/foundations/color.html` — foundation
- [ ] `https://gnegreiros-ux.github.io/agentic-design-system/components/button.html` — component
- [ ] Any new page added in this session

Sign of success: sidebar shows 4 foundations, 3 components, no doubled-path links.
