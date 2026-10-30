---
paths:
  - "Brand/illustrations/**"
  - "site/**"
---

# Rule: illustrations-source

> Single source of truth for all illustrations — Brand/illustrations/.
> **Type:** rule
> **Logical path:** governance/rules/illustrations-source.md
> **Read before:** AGENTS.md, DESIGN.md, governance/rules/performance.md
> **Relations:** site/build.js (copyImages), governance/rules/performance.md

---

## Absolute rule

> **`Brand/illustrations/` is the single source of truth for all illustrations.**
> Never add, modify, or delete an illustration directly in `site/dist/img/`.

```
✅ Add an illustration → drop it into Brand/illustrations/
✅ Update → replace the file in Brand/illustrations/
✅ Delete → remove the file from Brand/illustrations/
❌ Never modify a PNG directly in site/dist/img/
❌ Never commit a PNG in site/dist/img/ that doesn't exist in Brand/illustrations/
```

---

## Naming convention

| Type | Format | Example |
|------|--------|---------|
| Site illustration | `IMG-[NAME].png` | `IMG-HERO-SYSTEM.png` |
| Dark theme variant | `IMG-[NAME]-on-dark.png` | `IMG-HERO-SYSTEM-on-dark.png` |
| Light theme variant | `IMG-[NAME]-on-light.png` | `IMG-HERO-SYSTEM-on-light.png` |
| Brand poster | `Agentica [name].png` | `Agentica Affiche.png` |
| Brand infographic | `Agentica-[name].png` | `Agentica-infographique.png` |

**Only `IMG-*.png` files are copied to `site/dist/img/` by the build.**
Brand posters and infographics (`Agentica *.png`) stay in `Brand/illustrations/`
only — they're meant for presentations and communications, not the website.

> An `IMG-*.png` file can exist in `Brand/illustrations/` **without being referenced on the site** —
> it's then meant for presentations only. It will still be copied to `site/dist/img/` by the build
> (normal behavior), but no HTML page includes it. This is not a bug.
>
> Example: `IMG-FUTURE.png` — presentation slide 16, not used on the site.

---

## Theme variants (dark / light)

**No live JS swap mechanism exists today** (removed 2026-09-11 — `applyThemeImages()` and
its `.img-theme-aware[data-src-dark][data-src-light]` selector were dead code: the home
page (`index.html`) is always dark mode, toggle hidden, so nothing ever applied that class
or those attributes to a generated `<agtc-image>`). Illustrations declared in `build.js`
today are a single hardcoded `src`, picked at authoring time for whichever theme the
surrounding section actually renders in — not swapped at runtime.

### References declared in build.js (home page, hardcoded)

| Section | File used |
|---------|-----------|
| Hero system | `IMG-HERO-SYSTEM.png` |
| Context | `IMG-CONTEXT-on-dark.png` |
| Human loop | `IMG-HUMAN-LOOP.png` |
| Durability | `IMG-DURABILITY.png` |

`IMG-HERO-SYSTEM-on-dark.png`, `IMG-HERO-SYSTEM-on-light.png`, and `IMG-HUMAN-LOOP-on-light.png`
exist in `Brand/illustrations/` but are currently unreferenced by `build.js` — see
"Unreferenced files — pending owner review" below.

To add a theme-specific illustration today: just point the `<agtc-image src="...">` at
whichever `IMG-[NAME].png` (or `-on-dark`/`-on-light` variant) fits the section's actual
background. If a genuine runtime swap is needed again in the future (e.g. a page gains a
real light/dark toggle), it needs to be rebuilt — `git log` has the removed
`applyThemeImages()` implementation for reference.

---

## Consumers of Brand/illustrations/

| Project | Usage | Source path |
|--------|-------|---------------|
| Agentica site (`site/`) | Web — `IMG-*.png` copied automatically on every build | `Brand/illustrations/IMG-*.png` |
| Presentations | Slides — all illustrations (`IMG-*.png` + `Agentica *.png`) | `Brand/illustrations/` |
| *(Future)* | Other projects | `Brand/illustrations/` |

> Every project in this repository consumes `Brand/illustrations/` as its source.
> Never duplicate files into a sub-project's local `assets/` folder.

### Presentation-only files (not referenced on the site)

These `IMG-*.png` files live in `Brand/illustrations/` for presentations.
They're copied to `site/dist/img/` by the build but no site HTML page includes them.

| File | Usage |
|------|-------|
| `IMG-FUTURE.png` | Presentation slide 16 |

### Unreferenced files — pending owner review (audited 2026-09-11)

Found by a repo-cleanup pass: these `IMG-*.png` files are in `Brand/illustrations/`,
untouched since 2026-06-26, and referenced by no site page — but nobody has confirmed
whether they're kept for a presentation (→ move to the table above) or genuinely
forgotten (→ safe to delete). Not touched by that pass; add a "Usage" row above and
remove from here, or delete the file and this row, once reviewed.

| File | Note |
|------|------|
| `IMG-ADOPTION.png` | |
| `IMG-BUILDER.png` | |
| `IMG-CONTEXT.png` | Base/light variant of Context — see Theme variants above, `-on-dark` is the one actually used |
| `IMG-DESUETUDE.png` | |
| `IMG-EXPERIMENT.png` | |
| `IMG-HERO-SYSTEM-on-dark.png` | Orphaned by the `applyThemeImages()` removal above |
| `IMG-HERO-SYSTEM-on-light.png` | Orphaned by the `applyThemeImages()` removal above |
| `IMG-HUMAN-LOOP-on-light.png` | Orphaned by the `applyThemeImages()` removal above |
| `IMG-HUMANS-AI_EN.png` | Possibly an EN-language variant of `IMG-HUMANS-AI.png` — worth checking if an EN swap was ever wired |
| `IMG-MULTIPLIER.png` | |
| `IMG-SITE.png` | |

---

## Build pipeline — automatic behavior

On every `node site/build.js` run:
1. Reads every `IMG-*.png` in `Brand/illustrations/`
2. Copies them to `site/dist/img/`
3. **Automatically deletes** any `IMG-*.png` in `dist/img/` that no longer exists in
   `Brand/illustrations/` (orphan cleanup)

No manual action required after adding/removing files in `Brand/illustrations/`.

---

## Rules for agents

```
✅ Reference new illustrations in build.js after adding them to Brand/illustrations/
✅ Use data-src-dark / data-src-light for theme variants
✅ Verify that IMG-*.png files referenced in build.js exist in Brand/illustrations/
✅ An IMG-*.png with no site reference is normal if it's meant for presentations
   → add it to the "Presentation-only files" table above
❌ Create or modify PNGs directly in site/dist/img/
❌ Use brand posters (Agentica *.png) as web page illustrations
❌ Duplicate illustrations into another project folder
❌ Delete an IMG-*.png from Brand/illustrations/ without checking if it's used in a presentation
```
