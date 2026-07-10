# Skill: post-change-pipeline

> Mandatory pipeline before any commit — analyzes the impact of changes and submits a report for human approval.
> **Type:** skill
> **Logical path:** .claude/skills/post-change-pipeline.md
> **Read before:** AGENTS.md, .claude/rules/git-workflow.md, .claude/rules/tokens-system.md
> **Relations:** site/build.js, tokens/, decisions/, decisions/ADR-069-migration-suivi-projet-github-projects.md

---

## Trigger

This pipeline runs **mandatorily** after every modification and **before every commit**.
It cannot be skipped, even for a minor change.

---

## Step 1 — Impact analysis (automatic)

Run `git diff --name-only` and `git diff --cached --name-only` to identify modified files.

Apply the impact matrix:

| Modified files | Updates to evaluate |
|---|---|
| `tokens/primitives.json` | Site rebuild, log, ADR if new token or palette |
| `tokens/semantic.json` | Site rebuild, log, generated `tokens.css` |
| `tokens/component.json` | Site rebuild, log, **Principal Designer approval required** |
| `site/build.js` | Site rebuild only |
| `site/dist/` | Log only (dist is an output) |
| `guidelines/` or `components/` | Site rebuild, log |
| `decisions/ADR-*.md` | Site rebuild (ADR page), log |
| `.claude/rules/` or `.claude/skills/` | Log |
| `AGENTS.md`, `DESIGN.md`, `README.md` | Log |

Tracking for this work (status, domain) lives in GitHub Projects (ADR-069) — not in
a file in the repo, so there is nothing to propose on the log side for this reason.

---

## Step 2 — Impact report (present to the human)

Present a structured report **before any commit**:

```
## Change impact — approval required

### Modified files
- [list of files from git diff]

### Proposed updates
- [ ] Site rebuild (`node site/build.js`) — [reason]
- [ ] ADR-XXX to create — [proposed title] — if architectural decision
- [ ] CSS tokens to regenerate — if tokens modified
- [ ] Other: [description]

### Points of attention
- [Any component token modification → approval reminder]
- [Any new token → suggest an ADR]
```

**Do not commit before an explicit response from the human.**

---

## Step 3 — Execution (only after approval)

Execute only the approved tasks, in this order:

1. Regenerate CSS tokens if `tokens/` was modified
2. Rebuild the site if approved (`node site/build.js`)
3. Create the approved ADRs
4. Stage and commit all files in a single coherent commit

---

## Escalation rules

- Modification of `tokens/component.json` → explicitly mention that Principal Designer approval is required
- New primitive or semantic token → propose an ADR
- Removal of a token → block and request a full impact audit

---

## Anti-patterns

```
❌ Committing without presenting the impact report
❌ Rebuilding the site without it being approved
❌ Updating the log after the commit rather than before
❌ Proposing all updates even when not relevant (use the matrix)
❌ Waiting for the human to ask for the log — always propose it
```
