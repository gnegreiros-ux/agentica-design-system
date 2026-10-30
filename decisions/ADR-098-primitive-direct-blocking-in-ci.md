# ADR-098 — `primitive-direct` hardened from warning to error in `audit-tokens.js`

> **Date:** 2026-09-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-098-primitive-direct-blocking-in-ci.md
> **Read before:** AGENTS.md, DESIGN.md, governance/rules/tokens-system.md
> **Relations:** ADR-012 (amended, body untouched), ADR-089, ADR-027, GOVERNANCE.md (Rule 4), scripts/audit-tokens.js, tests/governance/tokens-audit-primitive-token.spec.js, .github/workflows/tokens-audit.yml

---

## Context

Rule 4 of `GOVERNANCE.md` ("never consume a primitive token directly") is declared
non-negotiable and its verification is a static lint that fails the build. In practice,
`scripts/audit-tokens.js` declared its `primitive-direct` pattern with `severity: 'warning'`,
and `--ci` only exits non-zero on critical violations (errors, phantom tokens, structure
issues). A component consuming `var(--agtc-primitive-…)` therefore passed CI. The governance
test `tests/governance/tokens-audit-primitive-token.spec.js` encoded the requirement and was
red on purpose, as a documented gap.

ADR-012 describes exactly this split: only `error`-level violations block in `--ci`;
`warning`-level ones pass and are tracked in a ticket.

A second gap sat next to it: the `COLOR_EXCEPTION_LINE` exemption (literal-color fallback
shapes such as `var(--x, #fff)`, `:visited`, `vFill(`) was also applied to `primitive-direct`,
so a fallback literal next to a primitive reference hid the primitive.

## Decision

1. `primitive-direct` is now `severity: 'error'`: `audit-tokens.js --ci` fails on any
   `var(--agtc-primitive-…)` in scanned source.
2. `primitive-direct` is removed from the `COLOR_EXCEPTION_LINE` exemption. The exemption
   keeps covering the literal-color patterns (`hex-color`, `rgb-color`, `hsl-color`) only.
   The other escape hatches are unchanged: `audit-ignore` marker, `❌` anti-pattern lines,
   `icon('circle-x'|'x', …)` counter-examples, `PEDAGOGICAL_FUNCTIONS`, and the excluded
   generated / documentation / primitive-layer paths.
3. The one real occurrence this exposed, `--site-violet` in `site/build.js`, is kept under a
   reviewed `audit-ignore` with an explicit justification. No semantic violet token exists;
   adding one changes the semantic contract and is tracked separately (GitHub Projects).

This applies Rule 4 — it creates no new rule. It amends the behavior ADR-012 describes for
this one pattern: `primitive-direct` now blocks in `--ci`. ADR-012's body is not modified;
every other warning it lists (orphaned tokens, inline px) is unchanged.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Keep `primitive-direct` as a `warning` | Leaves a non-negotiable rule advisory; the governance test stays red or has to be weakened |
| Harden the severity but keep the `COLOR_EXCEPTION_LINE` exemption | A `var(--agtc-primitive-x, #fallback)` would still pass, so the hardening could be bypassed by adding a fallback |
| Create a semantic violet token in the same change | Changes the semantic contract (TCR, escalation per AGENTS.md); mixes a contract decision into an enforcement change |

## Consequences

- `tokens-audit.yml` (`node scripts/audit-tokens.js --ci`, every push and PR, no path filter)
  becomes the blocking gate for Rule 4. The Playwright governance test only guards the script
  against regression; it remains outside branch-protection required checks.
- Simulated on the repository before the change: 0 new failures, except `site/build.js`
  (`--site-violet`), handled by decision 3.
- Follow-ups tracked outside this ADR: a semantic violet token for the documentation site,
  and the `f.includes('dist')` substring match in the scan's path filter.
