# Pipeline: site

> Rebuild and validation of the static documentation site.
> **Status:** ✅ Active — **also** CI-enforced (`.github/workflows/site-freshness.yml`
> rebuilds and diffs `site/dist/` on every push/PR, independent of tool/human)
> **Trigger:** any change in `site/build.js`, `tokens/`, `decisions/`, `guidelines/`

---

## Triggers

| Modified file | Required action |
|----------------|---------------|
| `site/build.js` | Full rebuild |
| `tokens/primitives.json` | Rebuild (tokens.css regenerated) |
| `tokens/semantic.json` | Rebuild (tokens.css regenerated) |
| `decisions/ADR-*.md` | Rebuild (new ADR page generated) |
| `guidelines/**/*.md` | Rebuild if content is injected |
| `Brand/` | Rebuild + copy assets (logo, favicons, social image) |

---

## Command

```bash
cd site && node build.js
```

> **Timing (2026-11-20, recurring `site-freshness` failures on #278/#290/#296):**
> `auditSourcesDate()` sets `sitemap.xml`'s `<lastmod>` and `audit.html`'s date from
> `git log -1` over `site`, `tokens`, `decisions`, `guidelines`, `components`, `Brand`,
> `package.json`/`package-lock.json` (excluding `site/dist` itself). If the change you're
> rebuilding for touches any of those paths — which includes `site/build.js` itself, so
> almost always — a rebuild run **before** that content is committed reads the *previous*
> commit's date and is stale the moment you commit. This isn't a flake; it reproduces every
> time, and running the build again pre-commit doesn't fix it either (same stale read).
>
> **Required sequence when this applies:**
> 1. Commit the content change first (without `site/dist/`).
> 2. Run `node site/build.js` *now that the commit exists*.
> 3. Commit `site/dist/` separately: `chore(site): rebuild dist after commit`.
> 4. Push both before opening/updating the PR.
>
> This is the one documented exception to `pipelines/commit.md`'s "never a partial
> commit" rule — both commits land in the same PR before merge, so `main` is never left
> inconsistent.
>
> Separately, `audit.html`'s date string can still fail `site-freshness` even after this —
> `toLocaleDateString`'s fr/en connector (`,` vs `à`/`at`) differs between local Node <!-- lang-audit-ignore: quoted literal output characters, not French prose -->
> builds and CI's `actions/setup-node` Node, with no known way to reproduce CI's exact
> output locally. If the diff is only that connector, read the exact expected string from
> the failing run's log (`gh run view <id> --log | grep -A12 "diff --git a/site/dist/
> audit.html"`) and hand-patch those two lines rather than rebuilding again. See memory
> `feedback_audit_html_date_icu_nondeterminism`.

---

## Post-build checks

### 1. Number of generated files
- Baseline: 37 files (update when pages are added)
- A new ADR = +1 file
- A new page = +1 file
- Verify the count increases correctly

### 2. Static assets present
```
site/dist/
├── logo.svg          ← Agentica teal logo
├── social.jpg        ← OG image
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

### 3. Metadata per page
Every HTML page must contain:
- `<title>` — non-empty, ≥ 30 characters for the home page
- `og:title`, `og:description`, `og:image` — present
- `twitter:card`, `twitter:domain` — present
- `<link rel="apple-touch-icon">` — present

### 4. Bilingual parity
- Every `<span class="lang-fr">` has a matching `<span class="lang-en">` in the same context
- Verify visually by switching FR ↔ EN on the modified pages

### 5. Token tables
- Verify that new token entries appear in the explorer
- `class="token-table"` present on every token table

---

## Partial report (example)

```
### Site rebuild
- [x] node site/build.js → ✓ 38 files generated (37 + adr-029.html)
- [x] logo.svg present in dist/
- [x] OG metadata verified on index.html
- [x] ADR-029 visible in decisions/index.html
- [x] FR/EN parity verified on typography.html
```
