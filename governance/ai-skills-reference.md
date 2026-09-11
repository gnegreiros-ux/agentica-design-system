# AI skills reference

> What `.claude/skills/` automates in Claude Code, and what an equivalent behavior
> looks like in another AI coding tool. Read this if you use Copilot, Cursor, Codex,
> Windsurf, Amp, Devin, or any tool other than Claude Code, and want to reproduce
> the same guardrails with your own tool's rules, custom prompts, or hooks.
> **Type:** reference
> **Logical path:** governance/ai-skills-reference.md
> **Read before:** AGENTS.md
> **Relations:** AGENTS.md, .claude/skills/, .agents/skills/, .gemini/settings.json,
> governance/rules/post-change-pipeline.md

---

## Why this file exists

`.claude/skills/` is Claude Code's native mechanism for packaging repeatable,
invokable capabilities (slash commands, pre-commit orchestration, reusable review
checklists). It is Claude Code-specific implementation and does not move as part of
the `governance/` migration — see AGENTS.md.

As of 2026-09-11, two of Agentica's skills-delivery mechanisms are real, working
cross-tool ports, not just described behavior to reproduce by hand:

- **`.agents/skills/<name>/SKILL.md`** — the 7 core skills below (everything except
  the pipeline checklists) ported to the open Agent Skills format
  ([agentskills.io](https://agentskills.io), Linux Foundation AAIF-governed since
  May 2026). Codex CLI and GitHub Copilot CLI (Agent Skills support added December
  2025) both auto-load skills from this directory with no install step — clone the
  repo, they're there.
- **`.gemini/settings.json` + `.gemini/hooks/*.js`** — Gemini CLI has a real hooks
  system (unlike Codex/Copilot), so Agentica's two reminder-style behaviors
  (ADR-trigger, UX-pattern-review nudge) were rebuilt natively for it rather than
  only described. See `governance/tool-parity/gemini.md` for exactly what's covered,
  what isn't, and which parts are a best-evidenced guess pending verification
  against a live Gemini CLI session (no access to one from this environment).
  Gemini's own skills/extension format was deliberately **not** used — unlike
  `.agents/skills/`, a Gemini extension requires an explicit
  `gemini extensions install <url>` step and isn't auto-discovered from a cloned
  repo, so it wouldn't travel with this repo the way the rest of this does.

Everything else in this file is still descriptive, not a working port: **what each
skill does and why it exists in Agentica**, so a team using a tool without a real
port yet knows what behavior to reproduce with whatever mechanism their tool offers
(a custom rule, a system prompt, a pre-commit hook, a saved prompt template).

---

## Core skills

| Skill | Claude Code file | Codex / Copilot port | Trigger |
|-------|-------------------|------------------------|---------|
| ai-component-metadata | `.claude/skills/ai-component-metadata.md` | `.agents/skills/ai-component-metadata/SKILL.md` | Verifying a component is "agent-ready" |
| ai-ds-composer | `.claude/skills/ai-ds-composer.md` | `.agents/skills/ai-ds-composer/SKILL.md` | Composing an interface from a natural-language request |
| codebase-index | `.claude/skills/codebase-index.md` | `.agents/skills/codebase-index/SKILL.md` | Needing an up-to-date map of the system's components/tokens/dependencies |
| post-change-pipeline | `.claude/skills/post-change-pipeline.md` | `.agents/skills/post-change-pipeline/SKILL.md` | After every modification, before every commit — mandatory, no exceptions |
| quality-gate | `.claude/skills/quality-gate.md` | `.agents/skills/quality-gate/SKILL.md` | Pre-commit — orchestrates every active pipeline below |
| ux-pattern-review | `.claude/skills/ux-pattern-review.md` | `.agents/skills/ux-pattern-review/SKILL.md` | Before publishing a new component, or a UX-relevant change to an existing one |
| document (`/document`) | `.claude/skills/document/SKILL.md` | `.agents/skills/document/SKILL.md` | Invoked manually at the end of a work session |

### ai-component-metadata
Audits and enriches a component's structured metadata (props, states, token bindings,
ARIA contract) so an agent can reliably analyze, validate, and reuse it later without
re-reading the implementation from scratch.
**Reproduce with:** a custom rule that treats a component as incomplete until it ships
machine-readable metadata describing its props, states, and token bindings.

### ai-ds-composer
Translates a natural-language interface request into a valid assembly of *existing*
system components, refusing to invent new markup or styles outside the token/contract
system.
**Reproduce with:** a custom rule that forces any UI-generation request to route through
the existing component library and design tokens rather than generating bespoke markup.

### codebase-index
Maintains a live index of which components exist, their dependencies, and which tokens
they consume — a fast-navigation map loaded as context instead of re-scanning the repo.
**Reproduce with:** a generated index or manifest file (components → dependencies →
tokens) kept current and loaded as context before starting work.

### post-change-pipeline
Analyzes the impact of a change immediately after it's made and produces a report for
human approval — runs on every modification, however small, with no skip path.
**Reproduce with:** a pre-commit hook or rule that blocks the commit until an impact
report exists and a human has reviewed it.

### quality-gate
The pre-commit orchestrator: runs every active pipeline (see below) in a fixed order,
compiles the results into one report, and blocks the commit until a human explicitly
approves it.
**Reproduce with:** a single ordered pre-commit checklist or script chaining all your
quality gates (schema/lint, accessibility, i18n, doc-sync, build) that requires explicit
human sign-off before a commit is allowed to proceed.

### ux-pattern-review
Before a new or UX-relevant-modified component ships, presents the human with the
reference UX patterns from Agentica's 5 source-of-truth references (with direct links),
captures their decision, and propagates it across 6 documentation surfaces.
**Reproduce with:** a rule requiring that any new or changed interactive pattern cite its
reference sources and record an explicit human decision in the docs before merge.

### document (`/document`)
A post-work documentation orchestrator invoked manually. Given what was just done in a
session, it checks every documentation surface the repo has (guidelines, ADRs, the
git-workflow rules, the site changelog, GitHub Projects, READMEs, component stories),
writes the ones that need updating, verifies the build/tests still pass, and proposes —
but never executes — a commit and push.
**Reproduce with:** a saved prompt or custom command that, at the end of a work session,
sweeps every known documentation location, drafts the needed updates, and proposes (not
executes) a commit for human review.

---

## Pipelines — quality-gate's sub-checklists

`quality-gate` runs 14 individual pipeline checklists, each documented as its own file
under `.claude/skills/pipelines/`. They are not independently invoked skills — they are
quality-gate's building blocks, run in this order:

| Pipeline | Status | Checks |
|----------|--------|--------|
| tokens-audit | ✅ Active — **CI-enforced** | Token system consistency (primitive → semantic → component) |
| language-audit | ✅ Active | English-only content policy (ADR-070/071/075) |
| wcag | ✅ Active | WCAG 2.2 AA compliance checklist |
| ux-patterns | ✅ Active | Blocking guardrail requiring `ux-pattern-review` before publishing |
| adr-conformity | ✅ Active | Change complies with every active ADR |
| adr-triggers | ✅ Active | Whether the change requires a new ADR |
| docs | ✅ Active | Canonical checklist of every documentation surface to update |
| site | ✅ Active — **CI-enforced** | Rebuild and validate the static documentation site |
| commit | ✅ Active — **CI-enforced** | Commit message format and conventions |
| chromatic | ⚠️ Active, manual-only | Visual regression tests against the approved baseline — `chromatic.yml` exists but its automatic `push`/`pull_request` triggers are currently disabled (free-tier snapshot limit); `workflow_dispatch` only |
| axe-core | 🔜 Report mode | Automated accessibility audit (non-blocking during burn-down) |
| storybook | 🔜 Planned | Story presence and consistency with the token system |
| style-dictionary | 🔜 Planned | Token compilation output validation |
| playwright | 🔜 Planned | End-to-end critical-journey tests |

**Reproduce with:** a documented, ordered set of automated and manual gates — schema/lint
checks, an i18n check, an accessibility check, a design-decision log requirement, a
doc-sync check, a build verification step, and a commit-convention check — that all run,
in order, before a commit is proposed.

---

## Tool parity gate — required, not just documented

The table above is knowledge, not enforcement: nothing stops a team from reading it and
still shipping with none of these controls wired up for their tool. Four of the eleven —
`tokens-audit`, `language-audit`, `site`, `commit` — no longer need that per-tool
enforcement at all: as of 2026-09-11 they're tool-agnostic CI (`.github/workflows/
tokens-audit.yml`, `lang-audit.yml`, `site-freshness.yml`, `commit-lint.yml`), running
identically no matter which AI or human authored the commit. That leaves 7 genuinely
tool-dependent controls (`wcag`, `ux-patterns`, `adr-conformity`, `adr-triggers`, `docs`,
`chromatic`, `axe-core`) — mostly ones that depended on Claude Code's hook-based reminders
or on Claude choosing to run a checklist conversationally.

`.github/workflows/tool-parity.yml` (`scripts/check-tool-parity.js`) closes the remaining
gap mechanically. It scans the repo for known AI-tool config paths (`.github/
copilot-instructions.md`, `.cursor/`, `.windsurf/`, `.gemini/`/`GEMINI.md`, …) and, for
each one it finds, requires a matching `governance/tool-parity/<tool-slug>.md` file where
a human has recorded, for each of the 7 remaining controls, either `Replaced: <how>` or
`Accepted absence: <why>` — signed with a name and a date. It does not judge whether the
replacement is *good*, only that someone made and recorded the call instead of the gap
going unnoticed.

What "Replaced" can realistically mean differs by tool, checked against each tool's own
docs (2026-09-11):
- **Codex CLI** and **GitHub Copilot** (CLI + coding agent) have no hook/automation
  mechanism at all — both are static-instructions-only (`AGENTS.md`, plus
  `copilot-instructions.md`/`.instructions.md` for Copilot). A real "Replaced" for a
  reminder-style control there has to be a tool-agnostic git hook or CI check, not
  something native to the tool. Codex does support `.agents/skills/<name>/SKILL.md`,
  a plausible path toward `.claude/skills/` parity specifically (separate from this
  table's per-control decisions).
- **Gemini CLI** has a real hooks system (`.gemini/settings.json`'s `hooks`, events
  including `BeforeTool`/`AfterTool`/`BeforeAgent`, returning
  `hookSpecificOutput.additionalContext`) structurally close to Claude Code's own
  `PostToolUse` hooks — the one tool where a genuinely equivalent, tool-native
  reminder mechanism is realistic to build.

See `governance/tool-parity/TEMPLATE.md` (which carries these notes in full, plus exact
sources) to add a new tool's attestation, and `governance/rules/git-workflow.md` for why
this check isn't yet required in branch protection.
