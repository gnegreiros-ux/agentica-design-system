# Pipeline: site

> Rebuild and validation of the static documentation site.
> **Status:** ✅ Active
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
