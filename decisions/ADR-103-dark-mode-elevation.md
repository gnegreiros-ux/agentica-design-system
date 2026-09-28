# ADR-103 — Dark-mode elevation: a dark variant for every shadow, and a raised surface

> **Date:** 2026-09-28
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-103-dark-mode-elevation.md
> **Read before:** AGENTS.md, governance/rules/tokens-system.md, decisions/ADR-046-inverse-surfaces-shadows-tokens.md, decisions/ADR-065-dark-mode-tokens-storybook-chromatic.md
> **Relations:** ADR-046 (shadow tokens), ADR-065 (dark-mode token file `semantic.dark.json`), issue #210 (research note and decision), issue #208 (site-only shadow variable), issue #212 (general light/dark parity rule), issue #213 (Figma follow-up), `tokens/semantic.json`, `tokens/semantic.dark.json`, `scripts/audit-tokens.js`

---

## Context

`semantic.shadow.*` (ADR-046) had no dark variant: `semantic.dark.json` only held colours.
A black shadow at 10–12 % opacity nearly vanishes on a dark background, so in dark mode
raised elements lost their elevation. The site compensated with its own scale outside the
tokens (`--agtc-shadow-sm/md/lg` in `site/build.js`), darker in dark mode — which
`agtc-top-nav` then consumed and shipped without (issue #208).

Human rule, 2026-09-28: **both modes must always offer the same options, adapted to each
mode.**

The research note on issue #210 compared five reference systems. All of them do two things
in dark mode:

| System | Dark-mode elevation |
|---|---|
| Atlassian | Separate `elevation.surface.*` and `elevation.shadow.*` tokens; the higher the surface, the lighter it is; *raised* and *overlay* pair a surface with a shadow in both modes |
| Apple HIG (iOS) | *Base* and *elevated* background sets; elevated backgrounds are lighter |
| Material 3 | Tonal difference first; shadows express distance, sparingly |
| Carbon | Layers lighten at each level (g100: `#161616` → `#262626` → `#393939`); shadow token `.3` → `.8` opacity |
| Radix Themes | Same shadow geometry in both modes, much stronger black alphas in dark |

## Decision

1. **Every non-deprecated `semantic.shadow.*` token has a variant in `semantic.dark.json`**
   — same geometry, opacity raised about ×4–5 (`header`, `raised`, `card` → about `.50`).
2. **New token `semantic.color.background.surface-raised`** for dropdown menus, popovers and
   mobile nav panels, paired with `shadow.raised`: the same white as `surface` in light mode,
   one step lighter than `surface` in dark mode (`#1b1f27` over `#13161d`). In dark mode the
   surface, not the shadow, carries most of the elevation.
3. **No light ring built into the shadow** (unlike Radix): raised panels already draw
   `border.default`; a ring would double it.
4. **The site's own shadow scale is removed.** Its four uses consume the tokens
   (`sm` → `shadow.header`, `md`/`lg` → `shadow.raised`); raised site panels and the
   `agtc-top-nav` mobile panel use `surface-raised`.
5. **Guardrail:** `scripts/audit-tokens.js` check 6 fails `--ci` when a non-deprecated
   `semantic.shadow.*` token has no dark variant (governance test
   `tests/governance/tokens-audit-dark-shadow-parity.spec.js`).
6. `semantic.shadow.card-hover` is marked `$deprecated` (decided in issue #206), so it gets
   no dark variant; issue #209 adds its `alternative` once ADR-102 is merged.

## Rejected alternatives

- **Darker shadows only** — every reference system also lightens raised surfaces in dark
  mode; on Agentica's near-black page a shadow alone stays barely visible (checked on
  before/after captures, issue #210).
- **Reuse `background.subtle` for raised panels** — it already means "secondary background,
  discreet hover"; mixing an elevation role into it would couple two decisions.
- **Keep the site's `--agtc-shadow-*` scale** — it looks like tokens but is not, and a
  component already shipped depending on it (issue #208).

## Consequences

- `@agentica-ds/tokens` gains one token and three dark values (minor); `agtc-top-nav`'s
  mobile panel background changes in dark mode (components patch).
- Values are a starting point, tuned on before/after captures; adjusting them is a value fix
  under this ADR, not a new decision.
- The dark values in `semantic.dark.json` are literal, like the rest of that file; aliasing
  them to dark primitives is part of issue #212.
- Figma parity (variables and effect styles) is issue #213.
- Generalising the parity rule to every theme-sensitive token is issue #212 (its own ADR).

## Implementation

| Date | Event |
|------|-------|
| 2026-09-28 | Decision adopted (issue #210); tokens, check 6, site and `agtc-top-nav` updated |
