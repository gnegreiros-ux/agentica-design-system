@AGENTS.md

# GEMINI.md — Gemini CLI adapter

> Thin adapter on top of AGENTS.md, the single source of truth for this repository's
> governance (agent roles, escalation rules, token contracts). Gemini CLI doesn't read
> AGENTS.md natively — GEMINI.md is its default context filename — so the import above
> loads it into context; everything below is specific to Gemini CLI and not duplicated
> in AGENTS.md.
> **Type:** instruction
> **Logical path:** GEMINI.md
> **Read before:** (Gemini CLI loads this automatically)
> **Relations:** AGENTS.md, governance/ai-skills-reference.md, .gemini/settings.json,
> governance/tool-parity/gemini.md

---

## Hooks (Gemini CLI-specific)

`.gemini/settings.json` wires two `AfterTool` hooks (`.gemini/hooks/adr-reminder.js`,
`.gemini/hooks/ux-pattern-reminder.js`) that reproduce two of Claude Code's
`.claude/settings.json` reminder hooks: an ADR-creation nudge when writing under
`tokens/`, `guidelines/`, or `components/`, and a UX-pattern-review nudge when editing a
component file. See `governance/tool-parity/gemini.md` for exactly what these do and
don't cover, including which parts are a best-evidenced guess about Gemini CLI's hook
payload shape rather than verified against a live session.

## Skills

Gemini CLI's own skills/extension format requires an explicit `gemini extensions
install <url>` step and isn't auto-discovered from a cloned repo, so Agentica's core
skills are not packaged that way here. Read `governance/ai-skills-reference.md` for
what each skill does; `.agents/skills/<name>/SKILL.md` (Codex CLI / GitHub Copilot CLI's
format) is the closest available reference for what a Gemini-native skill would need to
cover if one gets built later.

## Execution notes

- Governance content (`governance/rules/`, `governance/instructions/`) is plain
  Markdown read the same way regardless of tool — no Gemini-specific parsing.
- `.gemini/settings.json` carries hook configuration only; it carries no project
  governance content itself.
