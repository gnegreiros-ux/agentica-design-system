# ADR-079 — Weekly scheduled cloud agent for the Figma §22 full-library audit

> **Date:** 2026-07-21
> **Status:** ✅ Active
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Relations:** `.claude/instructions/figma-components.md` §22 (audit checklist, amended), `.claude/rules/figma-library-governance.md`, GitHub Projects — "Figma gouvernance — Automatiser/planifier l'audit §22"

## Context

The §22 audit (9 categories: accessibility, page display, variables, Text
Styles, states, variants, in-page documentation, links, code↔Figma parity) has
existed since 2026-07-08, but only ever triggers on a newly created/modified
page, or on explicit human request ("audit", "check everything"). It has never
run against the *existing* library as a whole.

That gap caused a real incident: on 2026-07-09, 10 of the library's 11 Text
Styles had zero Figma Variables bound to their `fontSize`/`fontFamily`/
`fontWeight`/`lineHeight` — literal values only, invisible unless someone
opened each style and inspected its bindings. It was caught by a human
manually comparing styles by eye, not by any systematic check, because no
audit was running on pages nobody had recently touched.

## Decision

A weekly scheduled cloud agent ("routine"), created via the `schedule`
skill/`RemoteTrigger` API, runs the full §22 checklist against the *entire*
Figma library every Monday at 06:00 America/Toronto (`10:00 UTC`,
cron `0 10 * * 1`):

- **Trigger ID:** `trig_015wTFo2gJNztALS2bvFZ54d`
- **Scope:** every page and component/ComponentSet in the file
  (`uXgPVB6cMLwAPqSwoa0dGq`), not a subset — the exact gap that let the
  2026-07-09 incident go undetected
- **Environment:** the only cloud environment available on this account
  ("Portfolio web", `env_01GrYNDKPKbnLc4HE3dvaftU`) — not a deliberate choice,
  there was no alternative to pick from
- **Reporting:** silent if clean; a GitHub issue (label `figma-audit`) if any
  violation is found, grouped by the 9 categories with exact node/style names;
  a GitHub issue is also filed if the run fails outright (Figma unreachable,
  MCP error), so a failed run can never be mistaken for a clean one
- **Read-only:** the routine never modifies the repo or the Figma file — audit
  and report only, exactly like the existing `playwright-reminder.yml` pattern
  for visual regressions

## Rationale

A recurring, unattended check is the only way to catch drift on pages nobody
is actively touching — the 2026-07-09 incident's whole failure mode was that
nothing was looking at *already-shipped* library content. Weekly matches how
the library actually changes: in bursts around specific chantiers, not
continuously, so daily would be noisy and monthly would let drift sit for too
long between publications.

## Rejected alternatives

- **A GitHub Actions workflow, like `playwright.yml`.** Rejected: §22's checks
  run inside the Figma Plugin API sandbox (`use_figma`/Figma MCP tools) against
  a live Figma session — there is no headless, CI-runnable equivalent the way
  Playwright drives a browser. A cloud agent with the Figma MCP connector
  attached is the only mechanism available that can actually execute this.
- **Trigger only before each Community File publication.** Rejected (per
  discussion with the Design System Lead): no publication is currently
  scheduled (the Community File chantier is still Backlog), so a
  publication-triggered-only cadence would mean the audit effectively never
  runs until then — reintroducing the exact "ad hoc" gap this ticket exists to
  close.
- **Always report, even when clean.** Rejected: the Design System Lead chose
  issue-only-on-violation, matching `playwright-reminder.yml`'s existing
  philosophy of only surfacing actionable problems.

## Consequences

- Drift on any page, however old or untouched, surfaces within at most a week
  instead of only by chance human discovery.
- The routine's prompt is self-contained (the cloud session starts with no
  memory of this conversation) and points at `.claude/instructions/figma-components.md`
  §22 as the single source of truth for what counts as a violation — if §22's
  checklist changes, the routine's behavior changes with it automatically,
  with no separate copy to keep in sync.
- First real-world validation (does `gh issue create` actually work from this
  cloud environment, does the Figma MCP connector reliably enumerate the whole
  library) only happens at the first scheduled run (2026-07-27) — this ADR
  will need a follow-up note if that run reveals a configuration gap.

## Amendment 2026-11-16 — dedupe before filing, single source of truth for the checks

**Trigger.** Issues #224, #231, #237, #249, #273 (2026-10-05 through 2026-11-09, 5
consecutive weekly runs) repeated largely the same findings without any of them being
actioned. Triage on 2026-11-13 found that most weren't real unfixed bugs at all:
- `findOverflows()` existed as **two independently-maintained copies** —
  `scripts/figma/audit-figma-file.js` (used by day-to-day sessions) and a second copy
  embedded in `figma-components.md` §21.A (apparently what the weekly routine itself was
  pasting in) — and they had drifted apart: the doc's copy was missing a `visible === false`
  guard and had a narrower focus-ring exemption, producing two classes of false positive
  ("Button icon-suffix overflows" and "focus-ring overflows") every single week.
- One finding (Button `Variant=Ghost, State=Disabled` unbound stroke, #231) had already been
  fixed in an unrelated earlier session; the GitHub issue was simply never closed, so every
  subsequent run kept re-reporting it as open.
- One finding ("all 15 Text Styles missing bound lineHeight") was actually **enforcing a
  policy the routine itself had reversed one week earlier** (§26.1 "Amendment 2026-11-06":
  `lineHeight` must stay an unbound literal, binding it is the bug) — the routine's own
  checklist read was stale relative to its own governing document.

This ADR's original Consequences section already stated the *intent* — "no separate copy to
keep in sync" — but never enforced it, and said nothing about what the routine should do with
an issue once filed. Both gaps are closed below. See the full writeup and verification steps in
the agent memory `feedback_figma_22_audit_stale_false_positives_2026-11-13`.

**Decision.**
1. **Single source of truth, enforced, not just intended.** Every check function the routine
   runs must live in exactly one place: `scripts/figma/audit-figma-file.js`. Any copy embedded
   in a governance doc for readability must be removed or replaced with a pointer to that file
   — never a second, independently-edited body. The routine (and any human session) must
   `Read` that file fresh at the start of every run, never retype or paste a remembered version
   of a check into `use_figma`.
2. **Dedupe before filing.** Before creating a new `figma-audit`-labeled issue, the routine
   must list currently open `figma-audit` issues (`gh issue list --label figma-audit --state
   open`) and, for each finding it is about to report:
   - if an open issue already reports the same finding, do **not** file a duplicate — leave the
     existing issue as the record (optionally comment with the re-confirmed date);
   - if an open issue's finding no longer reproduces, close it with a one-line comment saying
     so, rather than leaving it open and silently re-reporting unrelated findings in a new issue
     alongside it.
3. **No silent policy staleness.** Before running the checklist, the routine must treat
   `figma-components.md` §22/§21/§26 as live documentation that may have changed since its last
   run — it must not rely on a cached or memorized understanding of what counts as a violation,
   particularly where an amendment has reversed an earlier rule (as §26.1 did for `lineHeight`).

**Consequence.** A finding that stops reproducing gets closed instead of silently
re-accumulating across weekly issues; a finding that does reproduce gets one open issue to
track, not five; and the two checks that drifted this time cannot drift again because there is
only one copy of each left to edit.
