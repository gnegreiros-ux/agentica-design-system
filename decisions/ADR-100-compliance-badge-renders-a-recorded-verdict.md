# ADR-100 — The compliance badge renders a recorded audit verdict, never a configuration flag

> **Date:** 2026-09-25
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-100-compliance-badge-renders-a-recorded-verdict.md
> **Read before:** AGENTS.md, GOVERNANCE.md (Rule 1, Audit governance), doc-generator/README.md
> **Relations:** GOVERNANCE.md § Audit governance, issue #130, issue #122 (part 2 — same family: a compliance claim published without proof), `doc-generator/src/manifest.mjs`, `doc-generator/src/build.mjs`, `clone/core/audit/`, `tests/governance/doc-generator-compliance-badge.spec.js`

---

## Context

`GOVERNANCE.md` makes the public compliance badge optional: the audit always runs, and the
badge is "a display, never a condition". The manifest (`design-system.manifest.json`) carries
two audit fields — `audit.engine` (a string) and `audit.badgeEnabled` (a boolean) — and
`doc-generator` renders the badge line as:

```js
Compliance badge: ${manifest.audit.badgeEnabled ? 'enabled' : 'disabled'}
```

No audit runs anywhere in `doc-generator`, and the manifest carries no verdict. A generated
site therefore shows "Compliance badge: enabled" as soon as a team *asks* for the badge —
whether or not any audit ever ran, including when `governance` points to a missing file
(proved by `tests/governance/doc-generator-compliance-badge.spec.js`, C5-07). To a reader, that
line is indistinguishable from a verified compliance claim.

A second trap sits next to it: `clone/core/audit/accessibility.mjs` is still a skeleton stub
that returns `passed: true` without scanning anything (there are no core components yet). Any
design that simply forwards "the audit step's result" to the badge would turn that stub into a
published "compliant" claim — the same defect, one layer down.

## Decision

1. **The badge renders a recorded verdict, never the configuration flag.** `audit.badgeEnabled`
   only decides *whether* the compliance line is shown. What it says comes from a new optional
   manifest field, `audit.lastResult`.

2. **`audit.lastResult` contract** (optional; validated when present):

   | Field | Type | Meaning |
   |---|---|---|
   | `passed` | boolean | Overall verdict of the audit run |
   | `violationCount` | integer ≥ 0 | Number of violations found |
   | `ranAt` | string, ISO 8601 date-time | When the audit actually ran |
   | `engine` | non-empty string | Engine that produced this verdict (e.g. `axe-core`) |

   Validation rejects, naming the field: a wrong type, a negative or non-integer
   `violationCount`, an unparseable `ranAt`, and the contradiction `passed: true` with
   `violationCount > 0`.

3. **Rendering** (`doc-generator`, still a pure renderer — it never runs an audit itself):

   | `badgeEnabled` | `lastResult` | Rendered |
   |---|---|---|
   | `false` | any | No compliance claim ("Compliance badge: disabled") |
   | `true` | absent | **"Not verified — no audit result recorded"** — never "enabled" |
   | `true` | `passed: true` | "Passed — 0 violations, audited <ranAt> with <engine>" |
   | `true` | `passed: false` | "Failed — N violation(s), audited <ranAt> with <engine>" |

4. **Who writes `lastResult`:** only an audit step that actually scanned something — run
   *before* generation, by the Clone's core audit or the Master Skill's audit phase, never by
   `doc-generator`. **A stub or skeleton audit must not write it.** Until `clone/core/audit/`
   runs a real engine, generated sites honestly show "Not verified". Wiring a real producer is
   a separate change, tracked in its own issue.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| `doc-generator` runs axe-core on its own output before writing the badge | Turns a dependency-free renderer into a tool that needs a browser and an audit engine; duplicates the audit that `GOVERNANCE.md` already assigns to the build. Also only audits the docs site, not the design system the badge speaks for. |
| Keep the flag, only reword the line ("badge requested — not verified by this tool") | Removes the false claim but leaves no way to ever show a real verdict: the badge could never become meaningful. |
| Make `lastResult` required | Every existing manifest (fixtures, Clone example, Master Skill output) would break at once, while no real producer exists yet; optional + "Not verified" gives the honest state today and the real one as soon as a producer exists. |
| Let the current stub audit write `lastResult` | Would publish "Passed" backed by a scan of nothing — the exact defect of #130, moved one layer down. |

## Consequences

- `doc-generator/src/manifest.mjs` validates `audit.lastResult` when present;
  `doc-generator/src/build.mjs` renders the four cases above. No manifest breaks: the field is
  optional.
- `tests/governance/doc-generator-compliance-badge.spec.js` (C5-07 characterization) is replaced
  by real tests of the four rendering cases and of the `lastResult` validation.
- `doc-generator/README.md` and `clone/personnalisation/governance/example.md` document
  `lastResult` and the "Not verified" state.
- `GOVERNANCE.md` § Audit governance gains **one principle sentence, tool-agnostic** (no mention
  of `doc-generator`, the manifest or `lastResult`): "When displayed, the badge shows the last
  recorded audit verdict — its result, date and engine. With no recorded verdict, it says the site
  is not verified: it never states a compliance the audit did not produce." `GOVERNANCE.md` is the
  only text shipped to Clone and Master Skill consumers (through its two generated reference
  copies), so without it the rule would bind `doc-generator` alone and any other docs renderer
  could repeat #130. Tool details stay in this ADR and `doc-generator/README.md`.
- Follow-up issue: wire a real `lastResult` producer once `clone/core/audit/` scans real
  components (the accessibility audit is a stub today).

## Implementation

| Date | Event |
|------|-------|
| 2026-09-25 | Decision adopted (issue #130) |
