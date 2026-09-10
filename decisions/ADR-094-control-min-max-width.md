# ADR-094 — Min/max-width for single-line controls, and a reserved ceiling for a future textarea

> **Date:** 2026-09-09
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-094-control-min-max-width.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, components/agtc-input.js,
> guidelines/components/input.md, Figma `Input` master (`↳ input`, file `uXgPVB6cMLwAPqSwoa0dGq`)

---

## Context

Building mockups in the Figma sandbox file surfaced a real question: `agtc-input`'s `.control`
had no `min-width`/`max-width` at all, so its rendered width was purely whatever its container
imposed — from 240px (the Figma master's stale fixed field, see the same session's Input
`field` FILL fix) up to 720px in one mockup card. Nothing in the token system or the component
itself expressed an intentional floor or ceiling, which is a real gap: **any** container width
becomes a "valid" input width, including implausible ones (a field stretched to 720px reads as
a mistake, not a design choice).

## Decision

Add three new semantic tokens under `semantic.size.control`:

| Token | Value | Primitive | Applies to |
|-------|-------|-----------|------------|
| `size.control.min-width` | 64px | `{primitive.space.16}` | `agtc-input` `.control` — floor only |
| `size.control.max-width` | 480px | `{primitive.space.120}` | `agtc-input` `.control` — ceiling only |
| `size.control.max-width-multiline` | 640px | `{primitive.space.160}` | **Reserved** for a future `agtc-textarea` — not consumed by any component today |

`components/agtc-input.js`'s `.control` rule now sets both:

```css
.control {
  min-width: var(--agtc-semantic-size-control-min-width);
  max-width: var(--agtc-semantic-size-control-max-width);
}
```

### Research behind the values

- **Field width is a content-length affordance, not a free variable** — Baymard Institute and
  Nielsen Norman Group: mismatched field sizes cause measurable user hesitation; a short-answer
  field (e.g. phone number) stretched to fill its container is a missed signal, not a neutral
  choice.
- **`min-width` is a squeeze-floor, not a target** — common cross-framework CSS starting points
  size a text `input` around `min-inline-size: 7ch` (~64px at body size) specifically to stop it
  collapsing to an unreadable sliver in a tight flex/grid parent. It is **not** meant to represent
  "full width on a small mobile viewport" — that width already comes for free from `FILL`/percentage
  sizing; deriving a floor from a viewport calculation (360 − 32 = 328px, the alternative
  considered and rejected below) would instead prevent the same `Input` from ever being used in
  any narrower legitimate context (a compact search box, a table-cell filter, an inline field).
- **`max-width` ceiling of 480px** — no single authoritative number exists (Carbon Design System
  explicitly declines to set one, only warning against "excessively wide fields disproportionate
  to the intended data"), but production design systems converge in practice around a few hundred
  px for a generic single-line field; 480px also happens to match this session's own 400px-wide
  login card comfortably.
- **Reserved multi-line ceiling (640px / ~70ch)** — WCAG 1.4.8 (Visual Presentation, AAA) sets a
  hard ceiling of **80 characters per line**; typography research (Baymard, UXPin) converges on a
  **45–75 character** sweet spot for readability. 640px is a px approximation of ~70 characters at
  `typography.body` (16px) for contexts that need a fixed value (Figma, or a platform without `ch`
  support) — actual code should prefer `max-width: 70ch` directly where available, since it stays
  correct across font-size and zoom changes in a way a fixed px value cannot.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| `min-width` = 328px (360px mobile viewport − 32px page padding) | Conflates "the width Input happens to reach via FILL on a small screen" with "the narrowest legitimate use of Input" — would make the component unusable in any container narrower than 328px (compact search, table-cell filter, inline field), for no accessibility or usability gain. |
| No min/max at all (Carbon's stance) | Carbon's own reasoning is "avoid excessive width," which is exactly the failure mode observed (720px in a mockup) — leaving it unenforced already produced a visible defect once, in this same session. |
| Build `agtc-textarea` now to consume the multiline ceiling | Out of scope for a width-token decision; no UX pattern review (`ux-patterns-sources.md`) has been run for a new component. The token is reserved and documented so the decision doesn't need to be re-researched later. |

## Consequences

- `agtc-input` now has an explicit, governed width contract instead of an open-ended one —
  documented in `guidelines/components/input.md`.
- The Figma `Input` master (all 15 variants, `↳ input` page) should get matching `minWidth`/
  `maxWidth` frame constraints on its `field` sub-frame, mirroring the code change, so the
  contract holds in both surfaces (tracked as part of this same session's work).
- `size.control.max-width-multiline` is intentionally unused by any component today — a future
  `agtc-textarea` build should consume it (or supersede it with `ch`-based sizing in code) rather
  than re-deriving the research from scratch; a UX pattern review is still required before that
  component ships (`ux-patterns-sources.md`).
- Governance: **adding three semantic tokens** — Design System Lead approval, per
  `tokens-system.md`. Two new primitive values were added (`primitive.space.120` = 480px,
  `primitive.space.160` = 640px), continuing the existing 4px-multiple naming convention
  (`primitive.space.16` = 4×16 = 64px, etc.) — same governance tier, same approval.
