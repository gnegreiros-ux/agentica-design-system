# Skill: document

> Post-work documentation orchestrator, invoked as `/document`. Given what was just
> done in the session, checks every documentation surface the repository has,
> writes the relevant ones, verifies nothing broke, and proposes (never executes)
> a commit and push.
> **Type:** skill
> **Logical path:** .claude/skills/document.md
> **Read before:** AGENTS.md, .claude/rules/post-change-pipeline.md
> **Relations:** .claude/skills/pipelines/docs.md, .claude/skills/quality-gate.md, .claude/rules/git-workflow.md

---

## Absolute rule

> **No commit or push happens automatically. `/document` always ends in a proposal,
> never in an executed commit.** Same governance boundary as `quality-gate.md` and
> `git-workflow.md` — the human always has the final word.

---

## Relationship to quality-gate.md

`quality-gate.md` is the full pre-commit gate: token consistency, WCAG, UX pattern
review, ADR compliance, missing-ADR triggers, documentation, site rebuild, commit —
run for every change, however small. `/document` is narrower and lighter: it only
walks the documentation surfaces (via `pipelines/docs.md`) and verifies the build/tests
don't break. Reach for `/document` after a chunk of work is functionally done and
already committed-worthy, specifically to catch up documentation surfaces that are
easy to forget because they live outside the file(s) actually changed — GitHub
Projects and the site changelog above all, per this skill's own origin (created after
those two were repeatedly updated by hand, ad hoc, across several sessions). It does
not replace `quality-gate.md` for changes that also touch tokens, components, or
site pages directly — run both when in doubt.

---

## Trigger

The user types `/document`, optionally followed by a short description of what to
document (e.g. `/document the npm publication chantier`). With no argument, the scope
is "everything done in this session that isn't reflected in documentation yet" —
reconstructed from conversation context and `git log`/`git diff` against the last
pushed commit on the current branch.

---

## Process

### Step 1 — Establish what was actually done

Build a factual list of the session's changes before touching any documentation:
- `git log --oneline` since the branch diverged from `main` (or since the last push)
- `git diff --stat` for anything still uncommitted
- Conversation context for intent/rationale a diff alone won't show (why a decision
  was made, what was explicitly rejected, what the user asked for)

Do not document something that didn't actually happen, and do not infer scope beyond
what the diff and conversation actually support.

### Step 2 — Check every place against `pipelines/docs.md`

Read the full trigger matrix in `.claude/skills/pipelines/docs.md` — the canonical,
single-source-of-truth list of every documentation surface in this repository. For
each row, decide relevant/not relevant against Step 1's list, and say so explicitly
(a place that's genuinely not applicable is reported as "N/A", never silently skipped).

Two surfaces are the most commonly missed because they live outside the changed
files entirely — always check them explicitly, even for small changes:
- **GitHub Projects (Backlog/board)** — was a chantier completed, started, or
  newly identified?
- **Site changelog** (`buildChangelog()` in `site/build.js`) — was anything user-visible
  shipped (feature, fix, decision)?

### Step 3 — Document

For each relevant surface identified in Step 2:
- Follow that surface's own established conventions (tone, structure, bilingual
  FR/EN spans on the site, Conventional Commits phrasing in changelogs, the
  Status/Domaine/Date/ADR fields on GitHub Projects per ADR-069)
- Prefer updating an existing entry (a ticket, a changelog section) over creating a
  duplicate when the work is a continuation of something already tracked
- Keep entries factual and specific (file paths, PR/ADR numbers, concrete outcomes)
  over vague summaries — matches this repository's existing documentation style

### Step 4 — Verify nothing is broken

Run whatever subset of these actually applies to what was touched in Step 3:
- `node site/build.js` — required if any site page or the changelog changed;
  confirm 0 orphaned CSS variables and no build error
- `npm run lang-audit` — required if any bilingual site content was added or a
  non-site file with English-only requirements was touched
- Structural HTML validation on any page whose template changed (balanced tags,
  no orphaned wrapper divs — see the `get-started.html` table-wrap incident for why
  this matters even when the build script reports success)
- Bilingual FR/EN parity check (`lang-fr` / `lang-en` span counts) on any site page
  edited
- A GitHub Projects item, once created or edited, is read back
  (`gh project item-list`/`item-view`) to confirm the field values actually saved —
  the API has silently rejected malformed field updates before

### Step 5 — Report and propose

Present a report in the format below, then stop and wait for explicit approval
before staging, committing, or pushing anything — exactly like `quality-gate.md`.

---

## Report format

```markdown
## /document — report

### What this covers
[1-2 sentences: the chunk of work being documented, with commit range or PR references]

### Documentation surfaces checked
- [x] Site changelog — added 3 bullets under "npm publication" (Unreleased)
- [x] GitHub Projects — ticket #NNN created/updated, status → Terminé
- [ ] guidelines/components/*.md — N/A, no component behavior changed
- [ ] decisions/ADR-0XX.md — N/A, no new architectural decision
- [x] packages/tokens/README.md — N/A, already up to date
- ...(every row of pipelines/docs.md gets a line, including the N/A ones)

### Verification
- [x] node site/build.js — 109 files generated, 0 orphaned CSS variable
- [x] Bilingual parity — 132/132
- [x] GitHub Projects fields confirmed via item-list read-back

### Proposed commit
[branch name, commit message following git-workflow.md conventions]

Proceed with commit and push?
```

---

## What this skill does NOT do

```
❌ Commit or push without explicit approval — reports and proposes only
❌ Invent facts, PR numbers, or outcomes not actually verifiable from the diff/conversation
❌ Skip a row in pipelines/docs.md without stating why it's N/A
❌ Create a duplicate GitHub Projects ticket for work already tracked elsewhere
❌ Run the full quality-gate.md pipelines (tokens/WCAG/UX/ADR compliance) — use
   quality-gate.md directly when those are actually in scope
```
