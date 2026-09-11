---
name: quality-gate
description: Pre-commit orchestrator for the Agentica repository — runs every active quality pipeline (tokens, WCAG, UX patterns, ADR compliance, docs, site rebuild, commit format) in order, generates one impact report, and waits for explicit human approval before any commit. Use before every commit, however small — this is the full gate; the lighter post-change-pipeline skill covers only impact analysis.
---

# Skill: quality-gate

> Cross-tool port of `.claude/skills/quality-gate.md` (Claude Code's native
> implementation) — see `governance/ai-skills-reference.md` for the full picture of
> what Agentica's skills automate, including which of these pipelines are now
> tool-agnostic CI gates rather than something this skill needs to run itself. This
> file follows the open Agent Skills format (agentskills.io) so Codex CLI and GitHub
> Copilot CLI load it automatically from `.agents/skills/`.

## Absolute rule

> **No commit until all mandatory blocks have been run and approved by the human.**

## Trigger

Run this quality gate **after every modification**, regardless of size:
- Modification of a token (primitive, semantic, component)
- Modification of a component or a site page
- Addition or modification of a rule, an ADR, a guideline
- Configuration change (build, Style Dictionary, etc.)

## Available pipelines

Four of these already run as tool-agnostic CI on every push/PR — this skill's job
for them is to run the same script locally *before* proposing a commit, so the CI
result is a confirmation, not a surprise. The rest have no script; this skill is
the only thing enforcing them, and only if actually invoked.

| Pipeline | CI-enforced (always runs)? | Run locally with | Mandatory |
|----------|------------------------------|-------------------|-----------|
| Token consistency | ✅ `tokens-audit.yml` | `node scripts/audit-tokens.js --ci` | Yes |
| Language (English-only) | ✅ `lang-audit.yml` (required check) | `node scripts/audit-language.js --ci` | Yes |
| Site rebuild | ✅ `site-freshness.yml` | `node site/build.js` (diff `site/dist/` against commit, ignore `audit.html`) | Yes |
| Commit format | ✅ `commit-lint.yml` (PR only) | `node scripts/check-commit-messages.js <base> <head>` | Yes |
| WCAG 2.2 | — | manual checklist (see below) | Yes |
| UX pattern review | — | see the `ux-pattern-review` skill | Yes, for a new component or relevant UX change |
| Rule / ADR compliance | — | manual review against `decisions/` | Yes |
| Missing ADRs | — | manual — does this change need a new ADR? | Yes |
| Documentation | — | see the `document` skill | Yes |
| Chromatic (visual regression) | ⚠️ workflow exists, manual-only (free-tier limit) | `npm run chromatic` | If change touches `components/`, `tokens/`, `.storybook/` |
| axe-core | ⚠️ report mode, non-blocking | `npm run axe:all` | Recommended |

## Execution sequence

```
1. git diff --name-only                    → identify modified files
2. Filter triggered pipelines              → per the matrix above
3. Run each active pipeline                → generate report items
4. Present the full report                 → checklist format below
5. Wait for explicit approval               → "Yes, go ahead" or requested changes
6. Execute the approved tasks              → in order: tokens → site → docs → commit
7. Commit in a single coherent commit      → conventional commits, no --no-verify
```

## Report format

```markdown
## Quality Gate — approval required

### Modified files
- [list of files from git diff]

### 1. Token consistency
- [ ] No hardcoded value (hex, px, hardcoded font-family)
- [ ] All referenced tokens exist
- [ ] No orphaned token created

### 2. WCAG 2.2
- [ ] Normal text contrast ≥ 4.5:1
- [ ] Large text contrast ≥ 3:1
- [ ] Focus visible on all interactive elements
- [ ] Touch targets ≥ 24×24px (WCAG 2.5.8)
- [ ] No animation without prefers-reduced-motion

### 2b. UX pattern review (if a component was created/modified — otherwise "N/A")
- [ ] Suggested patterns presented to the human with direct links
- [ ] Human decision recorded (✅/❌ per pattern)
- [ ] 6 surfaces documented: guideline, code, story, site, ADR, GitHub Projects
- or: N/A — no component created and no relevant UX modification

### 3. Rule / ADR compliance
- [ ] Active ADR #XX respected: [specific rule]
- [ ] ...

### 4. Missing ADRs
- [ ] [Decision X] → ADR-0XX to create: [proposed title]
- or: No new ADR required

### 5. Documentation
- [ ] guidelines/[section].md updated
- [ ] Work reflected in GitHub Projects (status, domain) — see ADR-069
- [ ] decisions/README.md updated (if new ADR)
- [ ] FR/EN bilingual parity verified
- [ ] Site rebuild: node site/build.js

### 6. Planned pipelines (non-blocking)
- ⏳ Style Dictionary: not yet active
- ⏳ Storybook: not yet active
- ⏳ Playwright as a PR gate: not yet active

### 7. Commit
- [ ] Format: type(scope): short description
- [ ] A single coherent commit
- [ ] No /Users/... path in committed files

### Points of attention
- [escalations, special Principal Designer approvals]
```
