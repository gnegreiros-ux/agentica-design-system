# Pipeline: language-audit

> Verifies English-only content policy after any modification (ADR-070, ADR-071, ADR-075).
> **Status:** ✅ Active
> **Trigger:** any new or modified file outside `site/build.js`, `site/contenu.md`,
> `site/audit-lib.js`, and `decisions/ADR-*.md`'s French section

---

## Why this pipeline exists

ADR-070/071 made English the repository's default and sole language for new content,
but that policy was enforced by hand, once, per translation initiative — with no
repeatable check to catch new French content added afterward. ADR-075 documents the
consequence: `starter-kit/` was written entirely in French three days after ADR-071
made English mandatory, and nothing caught it until a manual pass weeks later. This
pipeline closes that gap.

---

## Triggers

| Modified file | Pipeline triggered |
|----------------|-------------------|
| Any new file (`.md`, `.js`, `.json`, `.sh`, `.yml`, `.html`, `.css`, …) | Yes |
| Any edit to an existing file outside the bilingual zones | Yes |
| Edits confined to `site/build.js`, `site/contenu.md`, `site/audit-lib.js` | No — bilingual by design |
| Edits confined to a `decisions/ADR-*.md` French section (after `<!-- FR -->`) | No — historical record, French preserved on purpose |

---

## Checks

### 1. Repo-wide French-content scan

```bash
node scripts/audit-language.js --ci
```

Scans every git-tracked file (respecting `.gitignore`) with a prose-bearing extension
for French accented characters and unambiguous French stopwords, outside the
explicitly bilingual zones. Exits 1 on any hit.

A genuine false positive (a French proper noun, a verbatim quote from a human
decision-maker, a literal string being documented) is suppressed with an inline
`<!-- lang-audit-ignore -->` / `// lang-audit-ignore` comment on the same line — never
used to silence real leftover French content.

### 2. Rendered-page check (site only)

```bash
npx playwright test tests/functional/language.spec.js --project=chromium
```

Renders every site page with `data-lang="en"` and asserts no French stopword pattern
appears in the visible text. Catches the structural class of bug the content scan
above cannot: a table cell, nav link, or label hardcoded as a single string instead of
a `lang-fr`/`lang-en` pair — content that legitimately belongs on a bilingual page but
fails to toggle (see the `ia.html` nav link and the Framework Integration table,
both fixed 2026-07-18, that a text-content scan alone would never catch since French
prose is expected on those pages).

---

## Automated audit command

```bash
npm run lang-audit
# exit 1 if French content is found outside the bilingual zones
# exit 0 if clean
```

Also wired into CI (`.github/workflows/lang-audit.yml`, push + pull_request) and into
`npm run test`.

---

## Partial report (example)

```
### Language audit
- [x] node scripts/audit-language.js --ci → clean, 559 files scanned
- [x] Playwright language.spec.js (chromium) → 0 French leftovers in EN-rendered pages
```
