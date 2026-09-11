---
name: post-change-pipeline
description: Mandatory impact analysis before any commit to the Agentica repository — identifies which files changed, what downstream updates that requires (site rebuild, ADR, CSS token regeneration), presents the impact as a report, and waits for explicit human approval before executing anything. Use before every commit, however small.
---

# Skill: post-change-pipeline

> Cross-tool port of `.claude/skills/post-change-pipeline.md` (Claude Code's native
> implementation) — see `governance/ai-skills-reference.md` for the full picture of
> what Agentica's skills automate. This file follows the open Agent Skills format
> (agentskills.io) so Codex CLI and GitHub Copilot CLI load it automatically from
> `.agents/skills/`; content is identical in substance to the Claude Code version.

## Trigger

This pipeline runs **mandatorily** after every modification and **before every
commit**. It cannot be skipped, even for a minor change.

## Step 1 — Impact analysis (automatic)

Run `git diff --name-only` and `git diff --cached --name-only` to identify
modified files.

Apply the impact matrix:

| Modified files | Updates to evaluate |
|---|---|
| `tokens/primitives.json` | Site rebuild, GitHub Projects entry, ADR if new token or palette |
| `tokens/semantic.json` | Site rebuild, GitHub Projects entry, generated `tokens.css` |
| `tokens/component.json` | Site rebuild, GitHub Projects entry, **Principal Designer approval required** |
| `site/build.js` | Site rebuild only |
| `site/dist/` | GitHub Projects entry only (dist is an output) |
| `guidelines/` or `components/` | Site rebuild, GitHub Projects entry |
| `decisions/ADR-*.md` | Site rebuild (ADR page), GitHub Projects entry |
| `governance/rules/` or `.claude/skills/` / `.agents/skills/` | GitHub Projects entry |
| `AGENTS.md`, `DESIGN.md`, `README.md` | GitHub Projects entry |

Task tracking (status, domain) lives exclusively in GitHub Projects (ADR-069) — not
in a versioned file in the repo.

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

## Step 3 — Execution (only after approval)

Execute only the approved tasks, in this order:

1. Regenerate CSS tokens if `tokens/` was modified
2. Rebuild the site if approved (`node site/build.js`)
3. Create the approved ADRs
4. Stage and commit all files in a single coherent commit

## Escalation rules

- Modification of `tokens/component.json` → explicitly mention that Principal
  Designer approval is required
- New primitive or semantic token → propose an ADR
- Removal of a token → block and request a full impact audit

## Anti-patterns

```
❌ Committing without presenting the impact report
❌ Rebuilding the site without it being approved
❌ Updating GitHub Projects after the commit rather than before
❌ Proposing all updates even when not relevant (use the matrix)
❌ Waiting for the human to ask for the GitHub Projects update — always propose it
```
