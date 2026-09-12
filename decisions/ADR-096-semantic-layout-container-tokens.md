# ADR-096 — Semantic layout container-width tokens

> **Date:** 2026-09-11
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-096-semantic-layout-container-tokens.md
> **Read before:** AGENTS.md, DESIGN.md, governance/rules/tokens-system.md
> **Relations:** tokens/semantic.json, site/build.js, governance/rules/layout-pattern.md,
> ADR-057 (marketing context), ADR-058 (site CSS extension tokens), ADR-094 (control min/max-width)

---

## Context

This gap surfaced during a real AI-interoperability test: running GitHub Copilot against
`Agentica-Copilot`, a clone of this repo, to build a standalone `demo/` page. Copilot needed a
page container max-width and asked — correctly, per `AGENTS.md`'s escalation rule for any change
touching a semantic token — whether to reuse `semantic.size.control.max-width` (480px). That
token's contract (ADR-094) restricts it explicitly to `agtc-input`'s field wrapper; reusing it
for a page container would have been a coincidental-value reuse, not a shared intent, and was
rejected for that reason.

Investigating to give Copilot a real answer found that **no `semantic.layout` category exists at
all** — `tokens/semantic.json` has `color, shadow, space, size, radius, fontWeight, typography,
icon, marketing`, nothing for page/section container widths. What exists in `site/build.js`
instead is an inconsistent mix:

- One real CSS extension token (`--agtc-content-max: 1180px`, ADR-058) for marketing sections —
  the one part of this that was already done right, just never promoted past extension-token
  status.
- One hardcoded constant (`960px` on `.content`) for documentation pages, carrying a documented
  `audit-ignore` exception per `governance/rules/layout-pattern.md`.
- A cluster of raw, duplicated inline `max-width` values with no token at all: `600px`, `700px`,
  `720px`, `760px` (×2), `780px`, repeated across ~15 call sites in generated HTML.

Before drafting this ADR, that last cluster was audited page-by-page (not just counted) to
separate real, repeated intent from copy-paste drift — see commit `3fc935c7`
(`chore(site): remove dead .rd-cta-inner CSS, align outlier max-widths to 700px`):

- `.rd-cta-inner` (720px) was dead CSS — defined, never referenced by any generated page — from
  the `Redesign/` mockup (ADR-058). Deleted.
- `.section-heading` (760px, one live use) and a one-off `resources.html` banner (760px inline,
  no evidence of a distinct intent) were both folded into `700px` — the value already used
  identically at 7 other call sites for the same visual role (intro/hero copy block).

What's left after that cleanup is two clean, internally consistent, already-repeated patterns
(`600px` ×6, `700px` ×9) plus the two pre-existing values above (`960px` ×1, `1180px` ×7) plus
one more real, undeduplicated pattern (`1280px` ×2, wide marketing sections). Five real values,
each with a distinct, evidenced role — not five arbitrary numbers.

Breakpoints (`@media(max-width:768px)` etc.) are a separate, larger, currently fully-ungoverned
problem — out of scope here, see Consequences.

## Decision

Add a new top-level semantic category, `semantic.layout`, with five tokens under
`semantic.layout.container`:

| Token | Value | Role | Current call sites |
|-------|-------|------|---------------------|
| `layout.container.cta` | 600px | Closing CTA block, centered (`.shell.section-final`) | 6 |
| `layout.container.intro` | 700px | Hero/intro copy block (`.shell > .copy`, `.section-heading`) | 9 |
| `layout.container.docs` | 960px | Documentation page content (`.content`) | 1 |
| `layout.container.default` | 1180px | Standard marketing section (promotes `--agtc-content-max`) | 7 |
| `layout.container.wide` | 1280px | Wide/cinematic marketing sections (`.rd-inner`, `.rd-cinematic-inner`) | 2 |

### Not aliased to `primitive.space.*`

Unlike ADR-094's control-width tokens (which alias `primitive.space.120`/`.160`), these five
values are declared as **literal semantic values**, not backed by new primitives. Reaching these
numbers via the primitive space scale would require five new one-off primitives
(`space.150`, `.175`, `.240`, `.295`, `.320` — pure `value ÷ 4` labels with no relation to the
scale's existing progression). `primitive.space` represents a spacing/gap scale consumed at
component and layout-gap granularity; a page's container width is a different design concern
that only coincidentally shares a pixel unit with spacing. This follows the same precedent
already used elsewhere in `tokens/semantic.json` for values with no meaningful primitive step
(e.g. the marketing card border at 6% white opacity, documented as "a literal value not aliased
to a primitive — the white scale stops at white.12 (18%), no step exists at 6%").

### `--agtc-content-max` migration

`--agtc-content-max` (the ADR-058 extension token) is kept as a thin alias —
`--agtc-content-max: var(--agtc-semantic-layout-container-default)` — rather than rewritten at
its 7 call sites. This avoids a wide, purely-cosmetic diff across `site/build.js` for no
behavior change; new code should reference the semantic variable directly, and the alias can be
removed once no call site still references the old name.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Reuse `semantic.size.control.max-width` for the page container | The actual incident that triggered this ADR — contract violation (ADR-094 scopes it to `agtc-input`'s field wrapper only); two values that happen to be close in magnitude are not a shared intent. |
| No max-width constraint on page-level content | Not a governance-neutral choice — an unconstrained container is a real readability regression (unbounded line length), not a way to dodge the token question. |
| Alias the five values to new `primitive.space.*` entries | Conflates the spacing scale with a page-layout-container scale; the derived primitive names (150/175/240/295/320) don't correspond to any meaningful step in the existing progression, unlike ADR-094's 120/160 which at least remained in a component-sizing context. |
| Wait for a full breakpoints/grid token system before tokenizing container widths | Breakpoints are a separate, larger, currently fully-ungoverned area (raw, inconsistent `@media` values throughout `site/build.js`) — real future work, but blocking a scoped, already-deduplicated fix on it serves no one. |

## Consequences

- First new top-level `semantic` category since `marketing` (ADR-057).
- Implemented in the same session: `tokens/semantic.json` carries the 5 tokens above; all 25
  `site/build.js` call sites now reference `var(--agtc-semantic-layout-container-*)`;
  `--agtc-content-max` is a thin alias (`var(--agtc-semantic-layout-container-default, 1180px)`)
  rather than a rewrite of its 7 sites. `npm run tokens` + `npm run build` (site) verified: 148
  pages, 0 WCAG violation, 0 warning; `node scripts/audit-tokens.js` verified: no hardcoded
  values, no phantom tokens, structure consistent (the pre-existing `button.ghost.border`
  orphaned-token warning is unrelated to this change).
- Governance: adding 5 semantic tokens — Design System Lead approval (this ADR), per
  `governance/rules/tokens-system.md`. No new primitives are added, so the Principal Designer
  primitive-approval tier is not triggered.
- Breakpoints remain unaddressed and fully ungoverned — flagged here as a distinct, separate
  future decision, not folded into this one.
- Once implemented, this closes the actual gap the Copilot interoperability test surfaced: a
  page built against Agentica (by a human, or by any AI tool reading `tokens/semantic.json`) has
  a real, documented answer for "how wide should my content container be," instead of guessing
  or reusing an unrelated component token.
