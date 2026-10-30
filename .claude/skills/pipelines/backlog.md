# Pipeline: backlog

> Reconcile GitHub Projects against what a PR actually shipped.
> **Status:** ✅ Active
> **Trigger:** at PR completion — before requesting merge, not per-commit
> **Relations:** governance/rules/project-overview.md (ADR-069), governance/rules/git-workflow.md,
> `.claude/skills/document/SKILL.md`

---

## Why this is separate from `docs.md`'s GitHub Projects row

`pipelines/docs.md` already lists "GitHub Projects" as a documentation surface
triggered by "any chantier completed, started, or newly identified" — checked
per-change, same cadence as every other row in that table. This pipeline is
narrower and runs at a different moment: **once, at the end of a PR**, across
every commit the PR introduced, not after each individual commit. A PR can span
several commits and several sessions; running a full backlog reconciliation
after every single commit is wasted effort, and checking only the commit you
happen to be looking at misses tickets a *different* commit in the same PR
already resolved. This pipeline is the PR-level pass that catches what the
per-change cadence structurally can't.

Origin: a 2026-09-12 session comparing the live board against `git log` found
22 tickets across `Backlog`/`En cours`/`En attente` that commits had already <!-- lang-audit-ignore: verbatim GitHub Projects Status option values -->
resolved — some going back weeks — plus 7 tickets whose `Dépendance` text had <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
gone stale (`"Bloque : …"` a target already `Terminé`). Not a new decision — <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
an operational gap under the already-active ADR-069/ADR-029 framework.

---

## What "verify / validate / complete" means here

### 1. Verify
Read back (`gh project item-list` / `item-view`) every GitHub Projects ticket
whose title, domain, or dependency text plausibly matches the PR's diff. For
each one, confirm its `Status` still matches reality:
- A ticket describing something this PR's commits actually shipped, still sitting
  in `Backlog` or `En cours` → move it to `Terminé`. <!-- lang-audit-ignore: verbatim GitHub Projects Status option values -->
- A ticket already `Terminé` that this PR's diff contradicts (reopened a bug, <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
  reverted a fix) → move it back, don't leave stale state.
- Do not infer completion from a plausible-sounding title alone — check the
  actual diff/commit body confirms the specific thing the ticket describes,
  the way the comparison earlier in this session did before touching any
  status field.

### 2. Validate
Check the `Dépendance` field of every ticket touched in step 1, plus any ticket <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
that names one of them, for now-broken references:
- A ticket that "Bloque" (blocks) a target now marked `Terminé` while the <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
  blocking ticket itself is still open is a contradiction — rewrite its
  `Dépendance` text to state the real relationship (e.g. "Post-publication — <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
  shipped without this, follow-up for a later update") rather than leave a
  blocking claim against a ticket that's already done.
- A `Sous-tâche de:` reference whose parent status no longer matches (parent <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
  done, sub-task still open, or vice versa) gets the same treatment.

### 3. Complete
- Work the PR's diff reveals but that has no matching ticket anywhere on the
  board → create one, with `Status`, `Domaine`, and `Date` set per ADR-069 —
  never left implicit in a commit message only.
- A ticket that finished a multi-session chantier gets one closing status
  change, not a duplicate new ticket for the same chantier (same rule as
  `docs.md`).

---

## Scope discipline

- ❌ Do not re-audit the entire board on every PR — scope the read to tickets
  plausibly related to *this* PR's diff (domain, component names, ADR numbers
  it touches).
- ❌ Do not mark a ticket `Terminé` on title match alone — confirm against the <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
  actual diff/commit content first.
- ❌ Never recreate backlog tracking in a local versioned file — GitHub Projects
  stays the only source of truth (ADR-069).

---

## Partial report (example)

```
### Backlog (end-of-PR check)
- [x] #142 "fix(input): contrast ratio" → Terminé (shipped in a3f9c21) <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
- [x] #150 dependency text corrected — no longer blocks a ticket already Terminé <!-- lang-audit-ignore: verbatim GitHub Projects field/status names -->
- [x] New ticket created: "agtc-tooltip — missing focus trap" (Backlog, Composants,
      discovered while fixing #142, not previously tracked)
- [x] Read-back via `gh project item-list` confirms all 3 field values saved
```
