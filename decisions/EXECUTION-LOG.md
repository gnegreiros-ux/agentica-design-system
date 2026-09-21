# decisions/EXECUTION-LOG.md

> Log of method and scope decisions taken while executing work in this repository —
> decisions about *how* a piece of work is done, or how far it goes, not about what the
> system is.
> **Type:** instruction
> **Logical path:** decisions/EXECUTION-LOG.md
> **Read before:** decisions/README.md
> **Relations:** decisions/README.md, decisions/CHANGELOG-structure.md

---

## Why this file exists

Three places already exist for neighbouring content, and none of them fits:

- an **ADR** records an architecture decision and stays immutable;
- `decisions/CHANGELOG-structure.md` records mechanical file moves and renames;
- a **GitHub issue** records a finding, with no decision attached.

What is left is a decision about *method or scope* made in the middle of a piece of
work — "we stop at this scope", "we fix it this way and not that way", "we track this
and not that". Without a home it lives in a chat transcript or a local scratch file and
is gone when the session ends. This file is that home.

## What belongs here

An entry is logged when it records an engaging **method or scope** decision. It is not
logged when it is:

- an architecture decision → an ADR;
- a mechanical file move or rename → `decisions/CHANGELOG-structure.md`;
- a bare finding with no decision attached → a GitHub issue.

## Format and rules

- One section per entry: `## EXEC-NNN — YYYY-MM-DD — title`, with the fields
  `Status`, `Decision`, `Why`, `Related` and `Logged by`. Not a table: `Why` and
  `Decision` are first-class fields and do not fit a notes column.
- IDs follow **creation order** and are never reused or renumbered. Entries are
  **displayed newest first**.
- A reversal is a **new** entry that references the old one. The old entry's `Decision`
  and `Why` are never edited; only its `Status` line changes, to
  `Superseded by EXEC-NNN` — the same immutability convention as an ADR.
- EXEC-001 to EXEC-006 were migrated from the execution journal of a local, untracked
  test-plan file (not part of this repository) and translated into English
  (ADR-071). Their meaning is unchanged; the original French text stays in that local
  file.

---

## EXEC-013 — 2026-09-21 — Merge protocol and proof for the two follow-up PRs (#140, #142)

**Status:** Active

**Decision:** Both PRs were merged with merge commits, one at a time, and only when
every check was green on the *current* head. #140 was behind `main`, so its branch was
updated with `gh pr update-branch` (merge commit, no rebase, no force-push) and its
checks were re-verified on the new head before merging; #142 was updated the same way
once #140 had landed. The proof for each PR was taken from the `push` run it produced
on `main`, not from its PR checks:

- #140 (merge `9df94260`): `site-freshness` green on `main`, so the committed `dist/`
  and `sitemap.xml` match a fresh rebuild (runs 35617322708 and 35618230186).
- #142 (merge `e56ba52c`), run 35618230451: Build site green on chromium, firefox and
  webkit; chromium ends at 304 passed and 1 failed (302 passed and 3 failed before),
  so the two icon visual tests no longer fail. The single remaining failure is C2-05
  (#117), known and unrelated. That the icon tests pass is established by exclusion
  and by count — the job's reporter does not list passing tests by name.

**Why:** with strict branch protection a PR whose checks are all green can still be
unmergeable, and a PR check only proves the PR head — only the `push` run proves what
`main` actually does. Merging one PR while the other was unresolved was ruled out by
the maintainer.

**Related:** #140, #142, EXEC-010, EXEC-012.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-012 — 2026-09-21 — Icon visual diff classified as intentional; baselines refreshed from CI images; upload gap tracked in #141

**Status:** Active

**Decision:**

1. Investigate before opening a ticket. The two failing `icon` visual tests (light and
   dark) were traced to `dc010685` (2026-09-12 17:05), which replaced the ✅ emoji in
   the props table of the icon page with an `agtc-icon` — after the baselines were last
   regenerated (`e1755c64`, 13:24). Confirmed by a pixel diff — one 17×17 px square
   (x 882–899, y 2223–2240), 260 px per theme, nothing else on the page — and by a
   visual crop. Verdict: an intentional component change and a stale baseline, not a
   bug; no bug ticket.
2. Regenerate only through `workflow_dispatch` with `update_snapshots=true` on `main`,
   never locally (macOS and Linux render differently, ADR-066), with a stop rule: if
   the regeneration touches anything other than the two icon PNGs, stop and show it
   before committing anything.
3. The regeneration run (35606880672) rewrote exactly those two files, confirmed by its
   log, but its snapshot upload step was skipped because an unrelated test failed. The
   two "actual" images were therefore taken from the report of the earlier failing run
   35597833026 — same commit `8a9aff25`, same pinned Docker image, CI-rendered — and
   the missing `always()` on the upload step was opened as #141, as a ticket only, with
   no fix PR for now.

**Why:** a stale baseline and a real visual regression look identical in CI; only the
source diff tells them apart, so the diff is read before a ticket is opened. The icon
tests had been red on `main` since the merge of #107 (`9b7cc4a1`, 2026-09-12 21:10),
whose PR changed the icon page without updating the baselines — the full visual suite
only runs on push to `main` (ADR-076), so nothing flagged it before the merge — and
they were hidden from 2026-09-13 01:38 by the Build site failure (EXEC-009). The bytes
taken from the earlier run are very probably, but not provably, those the normal
mechanism would have delivered; that was accepted because the first `push` run on
`main` after merging is the proof (see EXEC-013). Fixing the workflow in the same
change was rejected to keep the baseline PR limited to two PNGs.

**Related:** #141, #142, `dc010685`, `e1755c64`, runs 35597833026 and 35606880672,
ADR-066.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-011 — 2026-09-21 — Board ticket created for the C3 tests and the invocable skills

**Status:** Active

**Decision:** One minimal GitHub Projects item is created for the C3 tests and the
invocable skills (#122), linking #122, #124, #125 and the three C3 specs. Its Status is
"En cours" (the board's verbatim value) <!-- lang-audit-ignore: verbatim GitHub Projects status value --> because #122's second workstream and the deferred C3 tests are
still open; Domain "Gouvernance" <!-- lang-audit-ignore: verbatim GitHub Projects domain value -->; ADR field ADR-097. The Date field is `2026-09-17/21` — the dates of
the work, as on the reference decoupling ticket — not the ticket's creation date
(2026-09-21). This reverses EXEC-006 for the C3 and skills scope only; nothing was
decided for C1, C2 and C5, which stay untracked on the board.

**Why:** the backlog pipeline (`pipelines/backlog.md`), applied when the changelog PR
was completed, found new work with no matching board ticket, and the maintainer chose
to create one, kept minimal.

**Related:** EXEC-006, #122, #124, #125.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-010 — 2026-09-21 — Changelog block shipped as its own PR, quality gate run for real (#140)

**Status:** Active

**Decision:** The uncommitted `## Unreleased` changelog block (`site/build.js` plus the
regenerated `dist/`) was committed on a dedicated branch cut from `origin/main`
(`docs/changelog-unreleased-c3-adr097`) and shipped as its own PR, not added to the
unrelated Chromatic branch (#135) it had been carried across. The branch was created
with no stash and no destructive checkout. The quality gate was run pipeline by
pipeline — invocable since #125 — reported individually, and approved before the
commit. `sitemap.xml` was folded into the same unpushed commit with an amend, because
its `lastmod` derives from `git log -- site/build.js` and would otherwise have failed
`site-freshness`.

**Why:** orthogonal changes get separate PRs; the block had been sitting uncommitted
across several branch switches, at risk of being lost; the sitemap dependency is
invisible until CI rebuilds.

**Related:** #140, #124, #125, ADR-097, EXEC-011.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-009 — 2026-09-19 — `playwright.yml` red on `main`: fixed with `safe.directory`, not `fetch-depth: 0` (#137, #138)

**Status:** Active

**Decision:** Ticket #137 was opened first, then PR #138 added a
`git config --global --add safe.directory "$GITHUB_WORKSPACE"` step to the containerized
`playwright` job. The fix first approved — `fetch-depth: 0`, based on a diagnosis of a
truncated git history — was dropped once the logs contradicted that diagnosis. The fix
could not be verified before merging, because that job is skipped on `pull_request` and
no Docker was available locally; the proof was the `push` run after the merge (run
35597833026): Build site green on chromium, firefox and webkit, and the report
publication job green again. One related weakness was left out of scope and listed in
#137: `gitLastCommitISO` in `site/build.js` swallows git errors in an empty `catch`,
which is what turned a permissions error into a misleading "no git history" message.

**Why:** the failing job's log shows `fatal: detected dubious ownership` inside the
container during Build site. The non-container governance job builds the same site
from the same shallow checkout and passes, which rules out checkout depth as the cause.

The workflow had been red for **13 consecutive push runs** on `main` (from 2026-09-12
21:10), with two successive causes. The first four failed on the two icon visual tests
(see EXEC-012). From the merge of #114 (`081a77c6`, 2026-09-13 01:38 UTC), the next
nine failed at Build site, before any test ran — which hid the icon failures until this
fix. The text of #137 as first written ("8 consecutive runs", "since 2026-09-12"
attributed to this one cause) was inaccurate on both counts and is corrected in a
comment on #137.

**Related:** #137, #138, #114, run 35597833026.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-008 — 2026-09-19 — PR gate failure on #124 investigated: gate kept as a documented non-required check; gate-guard test scope widened

**Status:** Active

**Decision:** The failure of "Governance & accessibility fixtures (PR gate)" on #124,
which was merged red, was investigated before any C5 work. It was a true positive, not
a false negative: the single failing test is C2-05, the known red of #117, and the 63
other tests — including every C3 test — passed. The merge was allowed because branch
protection requires only `lang-audit`, `tool-parity`, `tokens-audit`, `site-freshness`
and `commit-lint`, and `playwright.yml` documents the gate as deliberately not required
("out of scope for this lot"). No merge-policy change was made. Scope decision: the
planned gate-guard test (`tests/governance/playwright-workflow-gate-coverage.spec.js`)
is widened to also assert that the gate job is among the required checks of `main`'s
branch protection, not only that it runs. That test is not written yet. The same
investigation found `playwright.yml` red on the 13 most recent consecutive push runs
on `main`, since 2026-09-12 (see EXEC-009).

**Why:** a permanently red, non-blocking gate becomes background noise — the failure
mode this whole workstream is chasing. C5 has to test what the gate enforces, not only
what it executes.

**Related:** #124, #117, #137, `.github/workflows/playwright.yml`, EXEC-009.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-007 — 2026-09-17 — style-dictionary timestamp reclassified from cosmetic to a real gap (#123)

**Status:** Active

**Decision:** Issue #123 was opened for the non-deterministic `Generated on <date>`
header that style-dictionary stamps into the `@agentica-ds/tokens` build output. The
exclusion in the C3-09 test stays, but it now carries a noisy comment naming #123
instead of being a silent normalization. This supersedes only the timestamp part of
EXEC-003 ("cosmetic", no separate issue); the `core/` part of EXEC-003 (#121) stands.

**Why:** the test's own name promises build determinism, so a genuine violation of that
property gets an issue and a named comment at the exact workaround. It is not cosmetic:
two builds of the same commit differ byte for byte, so a published tarball cannot be
verified against its source commit after the fact.

**Related:** #123, EXEC-003, commit `10904c04`,
`tests/governance/packages-published-build-determinism.spec.js`.

**Logged by:** Claude (decided by gnegreiros-ux)

---

## EXEC-006 — 2026-09-18 — No retroactive board ticket for the test workstream

**Status:** Superseded by EXEC-011

**Decision:** No retroactive GitHub Projects ticket for the v0.4.0 test workstream
(C1–C5). A separate issue (attached to #127) was opened for an automatable guard: CI
knows which PRs are merged, the changelog is a file, and a missing entry is detectable
without human intervention.

**Why:** found by comparing the real content of the nine active mandatory
`quality-gate` pipelines (read in full) against the diff of #124 and #125: no
`site/build.js` → `buildChangelog()` entry (fixed the same day, `## Unreleased`
block), and no GitHub Projects ticket for the test workstream — the only existing
ticket ("Découplage Agentica v0.4.0") <!-- lang-audit-ignore: verbatim GitHub Projects ticket title --> covers the build, PRs #108 to #113 and #116,
and was closed `Terminé` <!-- lang-audit-ignore: verbatim GitHub Projects status value --> before the test workstream started. Internal tracking whose only
reader is gnegreiros-ux, and this journal already serves that purpose.

**Related:** #124, #125, #127, EXEC-011.

**Logged by:** gnegreiros-ux

---

## EXEC-005 — 2026-09-18 — C2-05 and the #128 test: characterization test instead of `test.fail()`

**Status:** Active

**Decision:** `test.fail()` was considered and rejected by gnegreiros-ux for C2-05 and
for the new C5-04 / #128 test. It is replaced by a characterization test: an explicit
assertion of the current, wrong behaviour (severity `warning` plus exit 0 for C2-05;
exit 0 plus the wrong value present in the produced HTML for #128), which references
the issue in the test name or in the assertion — never in a comment — and turns red the
day #117 or #128 is fixed. This reversal is logged here, plus a note in the header of
the test file itself, and not in `decisions/CHANGELOG-structure.md`, whose declared
scope is moves, renames and format migrations, not a test-method decision.

**Why:** that Playwright mechanism goes green as soon as the test fails, for any reason
at all (a broken fixture path, a renamed CLI, a syntax error). It can hide its own
uselessness — exactly the failure mode this campaign is hunting.

**Related:** C2-05, C5-04, #117, #128.

**Logged by:** Claude

---

## EXEC-004 — 2026-09-18 — C5 inventory validated before any test was written

**Status:** Active

**Decision:** The gaps between the plan and the real `doc-generator/` code were agreed
with gnegreiros-ux:

1. C5-04 ("wrong type") behaves differently per field. `governance` and `site` (really
   read) crash with an opaque message and never produce partial output (#129, message
   quality only). `tokens.*`, `components` and `audit.engine` (never read, only echoed
   into the HTML) are not type-checked and produce a wrong output with exit 0 (#128,
   handled as a characterization test). Only `audit.badgeEnabled` is really
   type-checked.
2. C5-07: no audit is ever run inside `doc-generator`; the compliance badge is an
   unconditional echo of two declarative manifest fields (#130).
3. #123 (non-deterministic timestamp) was verified **not reproduced** in
   `doc-generator`, with two proofs: two consecutive runs are identical, and a run from
   a different working directory with a different `outDir` name is still bit-identical.
4. C5-05 is replaced by a real, testable invariant — the generator never writes outside
   `outDir` — because fixture hygiene proved nothing about the product.

Issues opened: #126 (orphaned token `button.ghost.border`, known since ADR-012, 089 and
096 but never tracked), #127 (the underlying finding: three occurrences of the same
pattern — a shipped artifact never exercised on a real case, invisible to a batch test
campaign), #128, #129 and #130 (above).

**Why:** inventory of C5 against the real `doc-generator/` code, before writing any
test: `design-system.manifest.json` exists nowhere in the repository (never
dogfooded).

**Related:** campaign C5 (inventory), #123, #126, #127, #128, #129, #130.

**Logged by:** Claude

---

## EXEC-003 — 2026-09-14 — C3 closed at reduced scope; direct `core/` tampering undetectable (#121); style-dictionary timestamp handled by exclusion

**Status:** Superseded by EXEC-007

**Decision:** Campaign C3 closed (result at the time: done, except C3-03, 04, 05, 06
and 07 deferred and C3-08, a human test). Issue #121 opened: no mechanism detects a
direct modification of `core/` (C3-02, reduced scope). A separate finding during
C3-09: a non-deterministic timestamp comment injected by style-dictionary into the
generated CSS and JS files (same category as the `sitemap.xml` bug), handled by an
exclusion in the test, with no separate issue. C3-06 found deferred:
`agentica.config.js` exists nowhere in the repository.

**Why:** the timestamp finding was judged cosmetic and outside the scope of
`GOVERNANCE.md`.

**Related:** campaign C3, #121, EXEC-007.

**Logged by:** Claude

---

## EXEC-002 — 2026-09-13 — Issue #118: `process.exit(1)` can truncate stdout under I/O load

**Status:** Active

**Decision:** Issue #118 opened — low priority, distinct from #117. Result at the time:
in progress.

**Why:** `process.exit(1)` in `audit-tokens.js` can truncate stdout under I/O load (a
known Node.js bug), without affecting the exit verdict.

**Related:** campaign C2, #117, #118.

**Logged by:** Claude

---

## EXEC-001 — 2026-09-13 — Issue #117: severity `warning` on `primitive-direct` stops Rule 4 from biting in CI

**Status:** Active

**Decision:** Issue #117 opened. Result at the time: in progress.

**Why:** severity `warning` on `primitive-direct` in `audit-tokens.js` prevents Rule 4
from biting in CI (finding C2-05).

**Related:** campaign C2, C2-05, #117.

**Logged by:** gnegreiros-ux
