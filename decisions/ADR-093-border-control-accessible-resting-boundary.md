# ADR-093 — Accessible resting control boundary: new semantic token `border.control`

> **Date:** 2026-09-09
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-093-border-control-accessible-resting-boundary.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/semantic.json, tokens/semantic.dark.json, tokens/component.json,
> guidelines/components/checkbox.md, guidelines/components/radio.md, guidelines/components/input.md,
> `.claude/skills/pipelines/axe-core.md`, PR #73

---

## Context

Reviewing `agtc-checkbox` in Storybook (2026-09-02) surfaced a real WCAG 1.4.11 violation:
the unchecked box's border used `component.checkbox.default.border` →
`semantic.color.border.default` (`gray.4`, `#e8e8e8`), which measures **1.22:1** against the
page background (`gray.1`/white) — far under the **3:1** non-text contrast minimum required
for a UI component boundary that is the sole visual signifier of its shape at rest.
`checkbox.md`'s own accessibility table already documented "Box/check contrast ≥ 3:1
(WCAG 1.4.11)" — the implementation didn't meet its own stated contract. Confirmed via
axe-core: 1 Serious color-contrast violation on `agtc-checkbox` in both themes.

`radio` and `input` share the same structural pattern (an outlined control whose border is
the primary at-rest signifier) and the same underlying token, so the same failure applies to
all three.

`border.default` is shared by 7 component-token bindings (`input`, `badge` neutral, `card`,
`checkbox`, `radio`, `table`, `tabs`). Most of the other 4 are decorative/structural boundaries
(dividers, container outlines) where the border is not the sole means of identifying the
element, so WCAG 1.4.11 doesn't clearly require them to hit 3:1 — bumping the shared token
everywhere would have been an unjustified, wide-reaching visual change for no accessibility
gain. `border.strong` (`gray.6`, 1.41:1) was considered and rejected: it doesn't clear 3:1
either, and its own `$intent` explicitly reserves it for decorative markers (e.g. changelog
timeline dots), not control outlines. No existing token covered this case.

## Decision

Add a new semantic token, `semantic.color.border.control`:

| Mode | Value | On `background.page` | On `background.surface` |
|------|-------|----------------------|--------------------------|
| Light | `gray.9` `#8d8d8d` | 3.32:1 (page `#fcfcfc`) | — |
| Dark | `#6b7280` | 4.04:1 (page `#0a0c11`) | 3.75:1 (surface `#13161d`) |

Both ≥ 3:1 (WCAG 1.4.11 non-text minimum).

Scoped to exactly the 3 bindings that are genuinely an interactive control's primary resting
signifier — `tokens/component.json`:

- `checkbox.default.border`
- `radio.default.border`
- `input.default.border`

— all three repointed from `{semantic.color.border.default}` to `{semantic.color.border.control}`.
`badge`/`card`/`table`/`tabs` keep `border.default` unchanged; `border.default`'s own `$intent`
was updated to note the exception explicitly ("not for a resting interactive-control boundary
— use border.control instead") so a future reader doesn't reach for it in that case.

Figma: the `Checkbox` master ComponentSet's border re-pointed to a new
`semantic/color/border/control` variable (Light + Dark), cascading to every instance on the
`↳ checkbox` page. `radio` and `input`'s Figma pages were not touched in the same pass — Figma
parity for those two is tracked as a separate follow-up, not blocking this ADR or the token
addition itself (the code-side fix is complete and verified for all 3 components).

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Bump `border.default` itself to a darker gray | Shared by 4 other, purely decorative/structural bindings (card, table, tabs, badge) where the border isn't the sole means of identifying the element — would have forced an unjustified visual change on all of them to fix 3 unrelated cases. |
| Reuse `border.strong` (`gray.6`, 1.41:1) | Doesn't clear 3:1 either — solves nothing. Its `$intent` also explicitly reserves it for decorative markers (e.g. timeline dots), not control outlines — reusing it would blur that reserved role. |
| Leave unfixed, document as known debt | Contrary to the project's non-negotiable WCAG 2.1 AA baseline (`project-overview.md`) and to `checkbox.md`'s own stated accessibility contract, which the implementation was silently failing. |

## Consequences

- `agtc-checkbox`, `agtc-radio`, `agtc-input`'s resting (unchecked/unfocused) border is now
  AA-compliant against the real page and surface backgrounds in both themes — axe-core:
  0 violations on `agtc-checkbox` (previously 1, Serious), verified in both light and dark.
- `border.default` is unchanged in meaning and value — still correct for card/table/tabs/badge
  decorative boundaries — but its `$intent` now cross-references `border.control` so the
  distinction is explicit for future readers (human or agent).
- Figma parity for `radio`/`input` (repointing their master borders to the new variable, the
  way `checkbox`'s master already was) remains open — tracked outside this ADR, does not block it.
- Governance: **adding a semantic token** — Design System Lead approval, per `tokens-system.md`.
  No primitive token value changed, no component-token *contract* modified (only the alias two
  component-token bindings resolve through), no hardcoded value introduced.

## Incidents or triggers

Surfaced during a routine Storybook accessibility review of `agtc-checkbox` (2026-09-02), fixed
same day in PR #73 (`fix/border-control-contrast`). This ADR was written on 2026-09-09, at merge
time, to close a genuine governance gap flagged by `scripts/validate-contracts.js`: the token's
`$extensions.com.agentica.usage.decision` field cited a pending-review note rather than a proper
ADR reference — every other semantic-token addition in this registry carries one. No functional
change accompanies this ADR; it formalizes and backs the decision PR #73 already implemented.
