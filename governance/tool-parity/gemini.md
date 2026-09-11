<!--
Drafted by Claude Sonnet 5 on 2026-09-11, pending Guilherme's review and sign-off.
Decisions below are grounded in what was actually built this session
(.gemini/settings.json, .gemini/hooks/adr-reminder.js, .gemini/hooks/ux-pattern-reminder.js)
and in Gemini CLI's own docs (geminicli.com/docs/hooks/) — not a guess about intent,
though the exact hook payload field names ARE a best-evidenced guess, flagged below
and in the hook files themselves. Confirmed by no one yet — that's the point of the
empty "Confirmed by"/"Date" cells: I can draft the technical call, but whether the
hooks actually fire correctly in a real Gemini CLI session is unverified from this
environment (no Gemini CLI access here), and deciding "Replaced" vs "Accepted absence"
is the human call this gate exists to force either way.
-->

# Tool parity attestation — Gemini CLI

> **Tool config detected at:** `.gemini/settings.json`
> **Type:** attestation
> **Logical path:** governance/tool-parity/gemini.md
> **Relations:** governance/ai-skills-reference.md, AGENTS.md, .claude/skills/quality-gate.md,
> .gemini/settings.json, .gemini/hooks/adr-reminder.js, .gemini/hooks/ux-pattern-reminder.js

| Control | Reference (Claude Code) | Decision | Confirmed by | Date |
|---|---|---|---|---|
| wcag | `.claude/skills/pipelines/wcag.md` | Accepted absence: no Gemini-native mechanism built for this — it's a manual checklist (contrast, focus-visible, touch targets), not a single file-write event a hook could reasonably react to. |  |  |
| ux-patterns | `.claude/skills/pipelines/ux-patterns.md` | Replaced: `.gemini/hooks/ux-pattern-reminder.js`, wired via `.gemini/settings.json`'s `AfterTool` hook on `write_file`/`replace` matching `components/agtc-*.js` or `guidelines/components/*.md`. Same caveat as adr-triggers below: fires an `additionalContext` reminder pointing at `.agents/skills/ux-pattern-review/SKILL.md`, doesn't verify the review actually happened, and the `tool_input.file_path` field name is unverified against a live session — see the hook file's own header comment. |  |  |
| adr-conformity | `.claude/skills/pipelines/adr-conformity.md` | Accepted absence: no hook or mechanism checks broad ADR conformity; this needs judgment across the whole diff, not a single file-write event. |  |  |
| adr-triggers | `.claude/skills/pipelines/adr-triggers.md` | Replaced: `.gemini/hooks/adr-reminder.js`, wired via `.gemini/settings.json`'s `AfterTool` hook on `write_file` matching a path under `tokens/`, `guidelines/`, or `components/`. Ported from `.claude/settings.json`'s equivalent `PostToolUse` hook. Caveat: the exact `AfterTool` stdin JSON shape (specifically the `tool_input.file_path` field name and the `write_file` tool name) isn't documented with a verbatim example at geminicli.com as of 2026-09-11 — built from the closest evidence available and tested locally against a simulated payload piped into `.gemini/hooks/adr-reminder.js`, not against a real Gemini CLI session. If it never fires in practice, log `tool_input` to stderr (see the hook file) to find the real field/tool names. |  |  |
| docs | `.claude/skills/pipelines/docs.md` | Accepted absence: no hook reminds about the documentation-surface checklist; `.agents/skills/document/SKILL.md` exists for Codex/Copilot's skill-loading mechanism, but Gemini's own skills format lives inside a formally-installed Extension (`.gemini/extensions/<name>/`), not auto-discovered from the repo the way `.agents/skills/` is — not built here, see `governance/ai-skills-reference.md`'s "Tool parity gate" section for why. |  |  |
| chromatic | `.claude/skills/pipelines/chromatic.md` (currently manual-only for every tool — free-tier snapshot limit) | Accepted absence: manual-only for every tool right now, not Gemini-specific. |  |  |
| axe-core | `.claude/skills/pipelines/axe-core.md` (report mode, non-blocking even for Claude Code today) | Accepted absence: report-mode/non-blocking for every tool right now, not Gemini-specific. |  |  |
