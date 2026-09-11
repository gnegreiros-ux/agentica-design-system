@AGENTS.md

# CLAUDE.md — Claude Code adapter

> Thin adapter on top of AGENTS.md, the single source of truth for this repository's
> governance (agent roles, escalation rules, token contracts). Claude Code doesn't read
> AGENTS.md natively, so the import above loads it into context; everything below is
> specific to Claude Code and not duplicated in AGENTS.md.
> **Type:** instruction
> **Logical path:** CLAUDE.md
> **Read before:** (Claude Code loads this automatically)
> **Relations:** AGENTS.md, governance/ai-skills-reference.md, .claude/skills/

---

## Skills (Claude Code-specific)

This repository's reusable capabilities and mandatory pipelines are implemented as
Claude Code Skills under `.claude/skills/` — they are not portable to other AI tools
as-is. If you're using a different assistant (Copilot, Cursor, Codex, Windsurf, Amp,
Devin, …), read **`governance/ai-skills-reference.md`** instead: it describes what each
skill does and how to reproduce the same guardrail with your own tool's mechanisms.

Key skills to know when working in this repo with Claude Code:

- `/document` — post-work documentation orchestrator. Run it after finishing a change
  to sweep every documentation surface (guidelines, ADRs, changelog, GitHub Projects,
  READMEs, stories) and get a proposed commit for review.
- `quality-gate` — the pre-commit orchestrator. It runs automatically per
  `governance/rules/post-change-pipeline.md` — **no commit without it having run and
  been approved by the human.**
- `ux-pattern-review` — invoke before publishing a new component or a UX-relevant
  change to an existing one.

The full list, with triggers and what each one does, is in `.claude/skills/` itself;
`governance/ai-skills-reference.md` is the human/agent-agnostic summary of the same
list for readers outside Claude Code.

## Execution notes

- Governance content (`governance/rules/`, `governance/instructions/`) is plain
  Markdown read the same way regardless of tool — no Claude-specific parsing.
- `.claude/settings.json` / `.claude/settings.local.json` hold Claude Code permission
  and tool configuration only; they carry no project governance content.
