# Rule: illustrations-source

> Single source of truth for all illustrations — Brand/illustrations/.
> **Type:** rule
> **Logical path:** .claude/rules/illustrations-source.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/performance.md
> **Relations:** site/build.js (copyImages), .claude/rules/performance.md

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

When an illustration has variants for both themes:
- The base file `IMG-[NAME].png` may coexist but isn't required
- The build uses the `-on-dark` and `-on-light` variants for the JS swap
- The swap is handled by `applyThemeImages()` in `siteJS()` (build.js)

### References declared in build.js (home page)

| Section | Dark | Light |
|---------|------|-------|
| Hero system | `IMG-HERO-SYSTEM-on-dark.png` | `IMG-HERO-SYSTEM-on-light.png` |
| Context | `IMG-CONTEXT-on-dark.png` | `IMG-CONTEXT.png` |
| Human loop | `IMG-HUMAN-LOOP.png` | `IMG-HUMAN-LOOP-on-light.png` |
| Durability | `IMG-DURABILITY.png` | *(no variant — works on both)* |

To add a theme variant to an existing image:
1. Add `IMG-[NAME]-on-dark.png` and/or `IMG-[NAME]-on-light.png` files to `Brand/illustrations/`
2. In `build.js`, add `class="img-theme-aware"` + `data-src-dark` + `data-src-light` on the `<img>`
3. `applyThemeImages()` handles the rest automatically

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
