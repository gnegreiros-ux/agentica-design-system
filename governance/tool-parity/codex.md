<!--
For every row below, replace the Decision cell with EXACTLY one of:
  Replaced: <what mechanism covers this control, and how — be specific
             enough that another contributor can verify it without asking you>
  Accepted absence: <why this control is knowingly not enforced for this
             tool, and who owns that risk>

A cell still containing "_TODO_", or a row with an empty "Confirmed by" or
"Date" cell, fails scripts/check-tool-parity.js (wired as a required CI
check — see .github/workflows/tool-parity.yml). This is deliberate: a human
must make and sign an explicit call for every control, not just the ones
that happen to be covered. See governance/tool-parity/TEMPLATE.md for the
full instructions this file was copied from.

See governance/ai-skills-reference.md for what each control means and does
in Agentica, and AGENTS.md for how this fits the wider governance model.
-->

# Tool parity attestation — Codex

> **Tool config detected at:** `.codex/hooks.json`
> **Type:** attestation
> **Logical path:** governance/tool-parity/codex.md
> **Relations:** governance/ai-skills-reference.md, AGENTS.md, .claude/skills/quality-gate.md, .codex/hooks.json

`.codex/hooks.json` already wires two reminder hooks (a `PostToolUse` matcher
on `Write` for files under `tokens/`, `guidelines/`, `components/`, and a
`Write|Edit` matcher for `components/agtc-*.js` / `guidelines/components/*.md`)
that surface an ADR / UX-pattern-review nudge as `additionalContext`. Its
commit history is attributed to "chore(claude)" messages even though the file
lives under `.codex/` — worth confirming whether this was deliberately built
for Codex or is a stray copy of what should be `.claude/` config, before
relying on it as the "Replaced" mechanism for any row below.

| Control | Reference (Claude Code) | Decision | Confirmed by | Date |
|---|---|---|---|---|
| tokens-audit | `.claude/skills/pipelines/tokens-audit.md` | _TODO_ | | |
| language-audit | `.claude/skills/pipelines/language-audit.md` | _TODO_ | | |
| wcag | `.claude/skills/pipelines/wcag.md` | _TODO_ | | |
| ux-patterns | `.claude/skills/pipelines/ux-patterns.md` | _TODO_ | | |
| adr-conformity | `.claude/skills/pipelines/adr-conformity.md` | _TODO_ | | |
| adr-triggers | `.claude/skills/pipelines/adr-triggers.md` | _TODO_ | | |
| docs | `.claude/skills/pipelines/docs.md` | _TODO_ | | |
| site | `.claude/skills/pipelines/site.md` | _TODO_ | | |
| commit | `.claude/skills/pipelines/commit.md` | _TODO_ | | |
| chromatic | `.claude/skills/pipelines/chromatic.md` | _TODO_ | | |
| axe-core | `.claude/skills/pipelines/axe-core.md` (report mode, non-blocking even for Claude Code today) | _TODO_ | | |
