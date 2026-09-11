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

**Drafted by Claude Sonnet 5 on 2026-09-11, pending Guilherme's review and sign-off.**
Every Decision below is grounded in what actually runs today (checked directly: CI
workflow trigger configs, `.codex/hooks.json` contents, presence/absence of npm
scripts) — not a guess. Two findings worth reading before signing:

1. Most of these 11 controls are **not mechanically enforced for any tool today,
   Claude Code included** — they run only because Claude Code's `quality-gate` Skill
   is *instructed* to run them conversationally before proposing a commit, which is
   compliance-by-convention, not a hard gate. `.codex/`'s gap is therefore mostly a
   gap this whole repository has, not something specific to Codex.
2. `chromatic` (free-tier snapshot limit hit 2026-07-02) and `axe-core`
   (deprecated in favor of `playwright.yml`, which itself only runs on push to
   `main`, not on PR) are currently **manual-only for everyone** — their
   `pull_request`/`push` triggers are commented out or absent, independent of tool.

| Control | Reference (Claude Code) | Decision | Confirmed by | Date |
|---|---|---|---|---|
| tokens-audit | `.claude/skills/pipelines/tokens-audit.md` | Accepted absence: `scripts/audit-tokens.js` is tool-agnostic (plain Node, `npm run` works from any shell) but wired into no CI workflow and no `.codex/hooks.json` hook. Relies on whoever's driving choosing to run it; true for Claude Code sessions too (not CI-gated there either). |  |  |
| language-audit | `.claude/skills/pipelines/language-audit.md` | Replaced: `.github/workflows/lang-audit.yml`, a **required** branch-protection check on every `pull_request` and `push` to `main`/`develop` — runs regardless of which tool or human authored the commit. Genuine parity, already in place. |  |  |
| wcag | `.claude/skills/pipelines/wcag.md` | Accepted absence: no automated contrast/focus-visible check runs on `pull_request` for any tool today; `axe.yml` is `workflow_dispatch`-only (manual) and `playwright.yml`'s accessibility spec only runs on `push` to `main`, and isn't a required check even there. |  |  |
| ux-patterns | `.claude/skills/pipelines/ux-patterns.md` | Accepted absence: `.codex/hooks.json`'s Write/Edit hook fires an unenforced reminder (`additionalContext`) on `components/agtc-*.js` / `guidelines/components/*.md` edits, but nothing verifies the review actually happened or was documented — a nudge isn't a control. `scripts/validate-contracts.js` checks every guideline has a "UX Patterns Reference" section but isn't wired to any CI workflow. |  |  |
| adr-conformity | `.claude/skills/pipelines/adr-conformity.md` | Accepted absence: no hook or CI checks broad ADR conformity; the few mechanical sub-rules it shares with token-layering are only caught incidentally, if `tokens-audit` is run (see above — also not enforced). |  |  |
| adr-triggers | `.claude/skills/pipelines/adr-triggers.md` | Accepted absence: `.codex/hooks.json`'s `Write` hook on `tokens/`, `guidelines/`, `components/` fires an unenforced reminder ("Would you like to create an ADR?"), but nothing verifies one was actually created when warranted — a nudge isn't a control. |  |  |
| docs | `.claude/skills/pipelines/docs.md` | Accepted absence: no hook or CI reminds about the documentation-surface checklist (`.claude/skills/pipelines/docs.md`) for Codex sessions. |  |  |
| site | `.claude/skills/pipelines/site.md` | Accepted absence: `node site/build.js` is tool-agnostic and anyone can run it, but nothing requires it before a commit; `.github/workflows/deploy-site.yml` only runs it **after** merge to `main`, so a stale `site/dist/` can land in a PR undetected. |  |  |
| commit | `.claude/skills/pipelines/commit.md` | Accepted absence: no script or hook enforces the Conventional Commits format for any tool today (no commitlint equivalent exists in this repo). |  |  |
| chromatic | `.claude/skills/pipelines/chromatic.md` | Accepted absence: `chromatic.yml`'s `push`/`pull_request` triggers are currently commented out repo-wide (free-tier snapshot limit reached 2026-07-02); `workflow_dispatch`-only for everyone, not Codex-specific. |  |  |
| axe-core | `.claude/skills/pipelines/axe-core.md` (report mode, non-blocking even for Claude Code today) | Accepted absence: `axe.yml` is manual-only (deprecated in favor of `playwright.yml`), and `playwright.yml`'s accessibility spec only runs on `push` to `main`, not on `pull_request`, for any tool. |  |  |

**Rows left with an empty "Confirmed by"/"Date" are drafted, not signed — `scripts/
check-tool-parity.js` still fails on this file until a human fills those two cells
in (see governance/tool-parity/TEMPLATE.md). Edit the Decision text first if any of
it reads wrong before signing it as-is.**
