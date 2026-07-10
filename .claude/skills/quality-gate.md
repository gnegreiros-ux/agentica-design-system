# Skill: quality-gate

> Pre-commit orchestrator. Runs all active pipelines in order, generates an impact report, waits for human approval before any commit.
> **Type:** skill
> **Logical path:** .claude/skills/quality-gate.md
> **Read before:** AGENTS.md, .claude/rules/post-change-pipeline.md
> **Relations:** .claude/skills/pipelines/, decisions/ADR-029-quality-gate-pre-commit.md

---

## Absolute rule

> **No commit until all mandatory blocks have been run and approved by the human.**

---

## Trigger

Run this quality gate **after every modification**, regardless of size:
- Modification of a token (primitive, semantic, component)
- Modification of a component or a site page
- Addition or modification of a rule, an ADR, a guideline
- Configuration change (build, Style Dictionary, etc.)

---

## Available pipelines

| Pipeline | File | Status | Mandatory |
|----------|---------|--------|-------------|
| Token consistency | `pipelines/tokens-audit.md` | ✅ Active | Yes |
| WCAG 2.2 | `pipelines/wcag.md` | ✅ Active | Yes |
| UX pattern review | `pipelines/ux-patterns.md` | ✅ Active | Yes (new component + relevant UX change) |
| Rule / ADR compliance | `pipelines/adr-conformity.md` | ✅ Active | Yes |
| Missing ADRs | `pipelines/adr-triggers.md` | ✅ Active | Yes |
| Documentation | `pipelines/docs.md` | ✅ Active | Yes |
| Site rebuild | `pipelines/site.md` | ✅ Active | Yes |
| Commit | `pipelines/commit.md` | ✅ Active | Yes |
| Style Dictionary | `pipelines/style-dictionary.md` | 🔜 Planned | Once active |
| Storybook | `pipelines/storybook.md` | 🔜 Planned | Once active |
| Chromatic | `pipelines/chromatic.md` | ✅ Active | Yes (change to `components/`, `tokens/`, `.storybook/`) |
| axe-core | `pipelines/axe-core.md` | 🔜 Planned | Once active |
| Playwright | `pipelines/playwright.md` | 🔜 Planned | Once active |

---

## Execution sequence

```
1. git diff --name-only                    → identify modified files
2. Filter triggered pipelines              → per the matrix in each pipeline
3. Run each active pipeline                → generate report items
4. Present the full report                 → checklist format below
5. Wait for explicit approval               → "Yes, go ahead" or requested changes
6. Execute the approved tasks              → in order: tokens → site → docs → commit
7. Commit in a single coherent commit      → conventional commits, no --no-verify
```

---

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
- [ ] 6 surfaces documented: guideline, code, story, site, ADR, log
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

### 7. Commit
- [ ] Format: type(scope): short description
- [ ] A single coherent commit
- [ ] No /Users/... path in committed files

### Points of attention
- [escalations, special Principal Designer approvals]
```

---

## Adding a new pipeline

1. Create `.claude/skills/pipelines/[name].md` with the standard format (see `pipelines/style-dictionary.md` as a stub example)
2. Add a line to the "Available pipelines" table above
3. Set the status to `✅ Active` once the pipeline is operational
4. Create an ADR if the pipeline represents a significant architectural decision
