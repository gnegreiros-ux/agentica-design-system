---
name: document
description: Post-work documentation orchestrator for the Agentica repository. Given what was just done in the session, checks every documentation surface (guidelines, ADRs, git-workflow rules, site changelog, GitHub Projects, npm/starter-kit READMEs, component stories), writes the relevant ones, verifies the build/tests, and proposes — never executes — a commit and push. Use after a chunk of work is functionally done, to catch up documentation surfaces that are easy to forget.
---

# Skill: document

> Cross-tool port of `.claude/skills/document/SKILL.md` (Claude Code's native
> implementation, invoked there as `/document`) — see `governance/ai-skills-reference.md`
> for the full picture of what Agentica's skills automate. This file follows the
> open Agent Skills format (agentskills.io) so Codex CLI and GitHub Copilot CLI load
> it automatically from `.agents/skills/` when the task looks like "document what
> we did" / "catch up the docs" / "what still needs updating" — there's no `/document`
> slash command outside Claude Code, so rely on the description above for automatic
> matching, or invoke it explicitly if your tool supports that.

## Absolute rule

> **No commit or push happens automatically. This skill always ends in a proposal,
> never in an executed commit.** Same governance boundary as `quality-gate` and
> `governance/rules/git-workflow.md` — the human always has the final word.

## Relationship to quality-gate

`quality-gate` is the full pre-commit gate: token consistency, WCAG, UX pattern
review, ADR compliance, missing-ADR triggers, documentation, site rebuild, commit —
run for every change, however small. This skill is narrower and lighter: it only
walks the documentation surfaces (via `.claude/skills/pipelines/docs.md` — plain
Markdown, readable regardless of which tool you're using) and verifies the
build/tests don't break. Reach for this after a chunk of work is functionally done
and already committed-worthy, specifically to catch up documentation surfaces that
are easy to forget because they live outside the file(s) actually changed — GitHub
Projects and the site changelog above all. It does not replace `quality-gate` for
changes that also touch tokens, components, or site pages directly — run both when
in doubt.

## Trigger

Invoked when asked to document recent work, optionally with a short description of
what to document (e.g. "document the npm publication chantier"). With no specific
scope given, the scope is "everything done in this session that isn't reflected in
documentation yet" — reconstructed from conversation context and `git log`/`git diff`
against the last pushed commit on the current branch.

## Process

### Step 1 — Establish what was actually done

Build a factual list of the session's changes before touching any documentation:
- `git log --oneline` since the branch diverged from `main` (or since the last push)
- `git diff --stat` for anything still uncommitted
- Conversation context for intent/rationale a diff alone won't show (why a decision
  was made, what was explicitly rejected, what the user asked for)

Do not document something that didn't actually happen, and do not infer scope
beyond what the diff and conversation actually support.

### Step 2 — Check every place against the docs pipeline

Read the full trigger matrix in `.claude/skills/pipelines/docs.md` — the canonical,
single-source-of-truth list of every documentation surface in this repository (a
plain Markdown file, readable regardless of which AI tool you're using — it isn't
Claude-specific content, just historically filed under `.claude/`). For each row,
decide relevant/not relevant against Step 1's list, and say so explicitly (a place
that's genuinely not applicable is reported as "N/A", never silently skipped).

Two surfaces are the most commonly missed because they live outside the changed
files entirely — always check them explicitly, even for small changes:
- **GitHub Projects (Backlog/board)** — was a chantier completed, started, or
  newly identified?
- **Site changelog** (`buildChangelog()` in `site/build.js`) — was anything
  user-visible shipped (feature, fix, decision)?

Also check `.claude/skills/pipelines/adr-triggers.md` explicitly — governance
changes (new CI/CD pipeline, new governance rule) require a new ADR even when no
token, component, or site file changed. An ADR that reverses or amends a still-`Active`
ADR is a **new** ADR referencing the one it amends — ADRs are immutable once active,
never edited in place (see `decisions/README.md`'s registry rules).

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
- `node scripts/audit-language.js --ci` — required if any bilingual site content
  was added or a non-site file with English-only requirements was touched. Run it
  **after** `git add` on any new file, not before: the script scans tracked files
  only, so a new untracked file passes a pre-add local run clean and only fails
  once CI sees it as tracked
- Structural HTML validation on any page whose template changed (balanced tags,
  no orphaned wrapper divs)
- Bilingual FR/EN parity check (`lang-fr` / `lang-en` span counts) on any site
  page edited
- A GitHub Projects item, once created or edited, is read back
  (`gh project item-list`/`item-view`) to confirm the field values actually saved —
  the API has silently rejected malformed field updates before

### Step 5 — Report and propose

Present a report in the format below, then stop and wait for explicit approval
before staging, committing, or pushing anything — exactly like `quality-gate`.

If branch protection currently forbids direct pushes to the target branch
(`enforce_admins: true`, see ADR-077), the proposed action is a `feature/`/`docs/`
branch + PR + merge, not a direct push — say so explicitly in the proposal rather
than defaulting to `git push`.

## Report format

```markdown
## Documentation report

### What this covers
[1-2 sentences: the chunk of work being documented, with commit range or PR references]

### Documentation surfaces checked
- [x] Site changelog — added 3 bullets under "npm publication" (Unreleased)
- [x] GitHub Projects — ticket #NNN created/updated, status → Terminé <!-- lang-audit-ignore: literal GitHub Projects Status field value, which is French in this project -->
- [ ] guidelines/components/*.md — N/A, no component behavior changed
- [ ] decisions/ADR-0XX.md — N/A, no new architectural decision
- [x] packages/tokens/README.md — N/A, already up to date
- ...(every row of pipelines/docs.md gets a line, including the N/A ones)

### Verification
- [x] node site/build.js — 109 files generated, 0 orphaned CSS variable
- [x] Bilingual parity — 132/132
- [x] GitHub Projects fields confirmed via item-list read-back

### Proposed commit
[branch name, commit message following governance/rules/git-workflow.md conventions]

Proceed with commit and push?
```

## What this skill does NOT do

```
❌ Commit or push without explicit approval — reports and proposes only
❌ Invent facts, PR numbers, or outcomes not actually verifiable from the diff/conversation
❌ Skip a row in pipelines/docs.md without stating why it's N/A
❌ Create a duplicate GitHub Projects ticket for work already tracked elsewhere
❌ Run the full quality-gate pipelines (tokens/WCAG/UX/ADR compliance) — use
   quality-gate directly when those are actually in scope
```
