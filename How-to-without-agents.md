# How-to — Continuity Without AI Agents

> What to do if access to AI agents disappears (outage, service cut, organizational
> decision, sovereignty constraint) — for the team that **maintains** Agentica and for
> the product teams that **consume** it.
> The human always has the final word — this guide doesn't change that principle, it only
> changes who EXECUTES the tasks normally done by an agent.
> **Type:** instruction
> **Logical path:** How-to-without-agents.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** How-to-devs.md, How-to-designers.md, .claude/rules/post-change-pipeline.md,
> .claude/rules/figma-library-governance.md, .claude/rules/tokens-system.md,
> scripts/continuity/

---

## 0. Principle — what does NOT change

- "The human always has the final word" remains true — only the **executor** changes (agent → human)
- Tokens (`tokens/*.json`), `guidelines/*.md`, and component contracts remain the
  source of truth
- No governance rule (`tokens-system.md`, `git-workflow.md`, `code-style.md`) is
  suspended while agents are unavailable

---

## 0bis. Activating the plan

| Question | Answer |
|---|---|
| Who declares the unavailability and activates this mode? | Design System Lead / Principal Designer (or designated backup) |
| Who communicates with consuming product teams? | The same person — a short message pointing to [section 2](#2-product-teams-consuming-agentica), never silence |
| How do you exit this mode? | As soon as agent access returns, normal operation resumes — this document doesn't need to be formally "closed," it's a fallback, not a new permanent state |

---

## 1.0 Resilience already in place (nothing to build under pressure)

Tokens (`tokens/*.json`), contracts (`guidelines/components/*.md`), rules
(`.claude/rules/*.md`), and component code (`components/agtc-*.js`) are already
**flat files versioned in Git** — not locked inside a tool or an AI session.
Nothing to export or back up urgently: the source of truth has always been the repo,
never a conversation history with an agent.

---

## 1. Design system team (maintaining Agentica)

### 1.1 What keeps running as-is (existing scripts, no agent needed)

**Script:** `scripts/continuity/1-1-existing-tools.sh`

| Task | Command |
|---|---|
| Compile tokens | `npm run tokens` |
| Rebuild the site | `node site/build.js` |
| Token audit | `node scripts/audit-tokens.js --ci` |
| English-only content audit | `npm run lang-audit` |
| Accessibility audit | `npm run axe` |
| Visual/E2E tests | `npx playwright test --project=chromium` |
| Chromatic tests | `npm run chromatic` |

These commands already ran without an agent being strictly necessary — an agent
ran them for convenience; a human runs them identically.

### 1.2 Manual quality gate (replaces `.claude/skills/quality-gate.md`)

**Script:** `scripts/continuity/1-2-manual-quality-gate.sh`

The 9 quality gate pipelines, translated into human steps:

1. **Token consistency** → `node scripts/audit-tokens.js --ci` + manual greps from
   `pipelines/tokens-audit.md` (hardcoded hex/px values, ghost references, 4px grid,
   Minor Third scale)
2. **English-only content (ADR-070/071/075)** → `npm run lang-audit` (repo-wide scan)
   + a manual read-through of any new bilingual site copy — the automated scan can't
   catch a French string stuck behind a `lang-fr`/`lang-en` toggle bug, only a real
   render can (see `pipelines/language-audit.md`)
3. **WCAG** → `npm run axe` + manual contrast check (WebAIM Contrast Checker)
4. **UX pattern review (ADR-036)** → consult the 5 sources in
   `ux-patterns-sources.md` yourself, document the decision across the usual 6 surfaces —
   without an agent that "proposes," the human author proposes AND decides in the same step
5. **ADR compliance** → manual greps listed in `pipelines/adr-conformity.md` (one per active ADR)
6. **Missing ADR triggers** → answer the 4 questions from `pipelines/adr-triggers.md` yourself
7. **Documentation** → the file checklist from `pipelines/docs.md` (also the source list
   behind the `/document` skill, unavailable without an agent — walk it by hand instead)
8. **Rebuild the site** → `node site/build.js`
9. **Commit** → Conventional Commits format, never `--no-verify`

Steps 4 and 6 are steps of **pure human judgment** — no script can replace them,
it can only remind that they must be done and block until they're confirmed.

### 1.3 Figma governance without Plugin API scripts

**Script:** `scripts/continuity/1-3-figma-checklist.sh`

Manual checklist derived from `figma-library-governance.md` + `figma-components.md`:

- Always read the code component + stories BEFORE touching Figma (unchanged)
- Link every fill/stroke/spacing to an **existing Figma Variable manually**
  (Inspect panel → Applied variables) — never a hardcoded value, even without a script
- Check that ComponentSet variants = code component props, one by one (no automated
  audit of the entire variable set — accept a slower, sampled audit,
  prioritizing recently modified components)
- No-delete rule unchanged: move to a `_corbeille` frame, never `.remove()`
- Staging page + 10-point report: already a checklist designed for a human, no
  adaptation needed
- Freeze large-scale Figma work (new component, redesign) while unavailable;
  limit to targeted one-off fixes

### 1.4 ADR and project tracking — unchanged

**Script:** `scripts/continuity/1-4-adr-log-reminder.sh`

Writing ADRs: already a human exercise (writing), unaffected by the absence of an agent —
just a reminder that it remains mandatory at every significant session/commit. Project
tracking (status, history, backlog) lives in GitHub Projects (ADR-069), not
in a file in the repo — nothing to log manually here.

---

## 2. Product teams (consuming Agentica)

### 2.1 What doesn't change at all

**Script:** `scripts/continuity/2-1-product-installation.sh`

- The installation flow documented in `site/dist/get-started.html` works without
  any agent: `npm install @agentica-ds/tokens @agentica-ds/components`, import
  `@agentica-ds/tokens/css` + `/css/dark`, mount the Web Components (`agtc-*`,
  Lit as a peer dependency). `starter-kit/` in the repository is a ready-to-copy
  minimal project demonstrating the whole flow.
- `guidelines/components/*.md` = human-readable contract, usable as-is
- `DESIGN.md` = brand reference, usable as-is

### 2.2 What needs a replacement checklist

**Script:** `scripts/continuity/2-2-product-checklist.sh`

- Check that a new product component doesn't hardcode a value → run
  `node scripts/audit-tokens.js --src-dir <path-to-project>` from a clone of Agentica,
  or a manual visual review against `tokens-system.md`
- Choose a UX pattern (form, error, feedback) → consult the 5
  sources in `ux-patterns-sources.md` directly (public links), skipping the "presentation"
  step normally done by the agent — the product documents its own choice
- Accessibility → WebAIM Contrast Checker + axe DevTools browser extension, replacing
  `scripts/axe-audit.js`

### 2.3 Anti-bypass safeguard

**Script:** `scripts/continuity/2-3-anti-bypass.sh`

- Risk documented in design systems literature (Spotify/Encore case study):
  without an agent to ease design system adoption, a rushed team may be tempted
  to bypass Agentica entirely (hardcode a value, ignore an existing component)
  rather than follow the manual checklist in §2.2
- Explicit reminder: the absence of an agent **does not change** the `tokens-system.md`
  rule — a hardcoded value is still forbidden, it's just checked by hand instead of by script
- If a deadline is untenable, the correct path is escalation (§2.4), never
  silent bypassing

### 2.4 Point of contact when in doubt

**Script:** `scripts/continuity/2-4-escalation-contact.sh`

Without an agent, any interpretation question ("does this token apply
here?") goes up to the human Design System Lead / Principal Designer — never
silent improvisation (consistent with `tokens-system.md`, a governance already
written for humans).

---

## 3. Out of scope

`.claude/rules/contexts-utilisation.md` and `.claude/rules/layout-pattern.md` govern
only `site/build.js` (the Agentica showcase site itself) — not relevant for an
external consumer, do not duplicate in the product section.

---

## Sources

Structure inspired by two external references (2026):
- Cyber Unit — business continuity in the face of LLM outages: dependency
  inventory, single points of failure, control of source data, activation
  procedure.
- intoDesignSystems — design systems facing AI agents: risk of gradual
  dependency and bypassing, structural trust levels per action (already
  the principle behind ADR-004 in this repo).
