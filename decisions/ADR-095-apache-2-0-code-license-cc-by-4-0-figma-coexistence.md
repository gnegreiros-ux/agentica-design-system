# ADR-095 — Apache License 2.0 for the code; CC BY 4.0 remains the Figma Community File license

> **Date:** 2026-09-11
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-095-apache-2-0-code-license-cc-by-4-0-figma-coexistence.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** `LICENSE` (repo root), `NOTICE`, `CONTRIBUTING.md`, `TRADEMARK.md`,
> ADR-081 (superseded by this ADR), `.claude/rules/figma-library-governance.md`

## Context

The repository's code license changed from MIT to Apache License 2.0 (Chantier 1 —
Mise en licence). ADR-081 had chosen CC BY 4.0 for the future Figma Community File on
the stated rationale that it was "consistent with the code's permissive MIT license."
That rationale is now stale: the code is no longer MIT. Rather than rewrite ADR-081's
history (an ADR is immutable once active — any modification is a new ADR, per
`decisions/README.md`), this ADR records the updated reasoning and formally supersedes
it.

## Decision

> The code license changes to **Apache License 2.0**. The Figma Community File license
> **stays CC BY 4.0** — no change from ADR-081's outcome. The two licenses remain
> consistent with each other: both are permissive, both require only attribution, and
> neither restricts commercial reuse or modification. A different license for the
> Figma file was never required by the code's own license choice — CC BY 4.0 is the
> right license family for *design content* (a Figma file is not source code, and
> Creative Commons is the standard licensing family for design/creative assets, the
> way SPDX software licenses are for code); the code's own choice of Apache 2.0 over
> MIT does not change that reasoning.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| Re-open the Figma Community File license decision (e.g. switch to Apache-family reasoning) | Apache License 2.0 is a software license — it has no defined meaning when applied to Figma design assets. CC BY 4.0 (or another Creative Commons license) remains the correct license family for the Figma file regardless of which permissive software license the code uses. |
| Silently rewrite ADR-081's rationale in place | Violates the registry's immutability rule (`decisions/README.md`: "An ADR is immutable once active — any modification = a new ADR"). The original MIT-based reasoning is left intact as the historical record; only its `Status` field and a deprecation note were added to ADR-081. |

## Consequences

- ADR-081's `Status` field now reads "⚠️ Superseded by ADR-095", with a deprecation
  note pointing here — its Context/Decision/Rejected alternatives/Consequences sections
  are otherwise untouched.
- `.claude/rules/figma-library-governance.md` — the "Community File license — CC BY 4.0"
  section is a live rules file, not a historical registry entry, so its stale "consistent
  with the code's permissive MIT license" wording is corrected in place to reference
  Apache License 2.0, and now points to this ADR alongside ADR-081.
- `decisions/README.md`'s ADR index gets a new row for ADR-095 and the ADR-081 row's
  Status column is updated to "⚠️ Superseded by ADR-095".
- No action needed in Figma itself — same as ADR-081, the Community File publish has no
  scheduled date; this ADR only updates the paper trail ahead of that eventual publish.
