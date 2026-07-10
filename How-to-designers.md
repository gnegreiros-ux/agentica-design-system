# How-to — Designers (design system team)

> This guide is for the team that **maintains** the system, not product teams.
> The human always has the final word. Agents propose, you approve.
> **Type:** instruction
> **Logical path:** How-to-designers.md
> **Author:** Guilherme Negreiros
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** tokens/semantic.json, tokens/component.json, guidelines/components/, DESIGN.md, How-to-sans-agents.md (fallback if agents are unavailable)

---

## 1. Initial setup

### Tokens Studio (Figma)
1. Install the **Tokens Studio for Figma** plugin
2. Connect to the repo: Settings → Sync → GitHub → point to `tokens/`
3. Import in this order: `primitives.json` → `semantic.json` → `component.json`
4. **Never edit tokens directly in Figma** — always edit the JSON and sync

### Native Figma Variables
1. In the system's Figma file: open the **Variables** panel
2. Collections map to the three layers:
   - `Primitives` → `tokens/primitives.json`
   - `Semantic` → `tokens/semantic.json`
   - `Components` → `tokens/component.json`
3. Any local variable created in a product file = debt — flag it to the team

---

## 2. Daily workflow

### Modifying an existing token

**Rule:** any change to a semantic or component token = TCR.

```
1. Identify the layer: primitive / semantic / component
2. Edit the JSON file (not directly in Figma)
3. Submit a TCR with justification and impact
4. After approval: push to the repo → sync Tokens Studio or Figma Variables
5. Communicate to consuming teams
```

### Adding a component

```
1. Write the contract: guidelines/components/[name].md
   — Intent, variants, tokens, accessibility, anti-patterns
2. Create the tokens in tokens/component.json
3. Build the Figma component using ONLY semantic/component tokens
4. Document in Storybook (with the developer)
5. Update guidelines/components/overview.md
```

### Detecting drift (audit)
Signals to watch for in product teams' Figma files:
- Detached instances (locally modified components)
- Local variables created outside the system
- Colors or spacing without a token reference
- Duplicated components that reproduce an existing one

When drift is detected: document it → open a ticket → propose the fix (never fix it without notifying the product team).

### Approving a visual regression (Playwright)

Since 2026-07-02, visual regressions are detected by Playwright (replaces Chromatic, ADR-066).
The merged HTML report (Chromium + Firefox + WebKit) is automatically published to **GitHub Pages** after every push to `main`.

**Accessing the report:**

```
https://designsystem.gnegreiros.com/playwright-report/
```

> Fallback if the report isn't published yet: Actions → download the
> `playwright-report-chromium` artifact and open `index.html` locally.

**Review process:**

```
1. Open the Pages report (URL above) — or the artifact if Pages isn't enabled
2. Go to the failed tests tab
3. Compare the "actual" vs "expected" screenshot
4. If the change is intentional:
   → ask a developer to run update_snapshots via workflow_dispatch
   → approve the new PNGs in the PR
5. If it's a real regression → open a ticket (do not approve)
```

**Automatic reminder issue:**
When files in `components/` are changed on `main`, a GitHub issue labeled `visual-review`
is created automatically (workflow `playwright-reminder.yml`). It contains a direct link to the
report and the review guide — designers don't need to go hunting for the artifact.

> The Playwright HTML report plays the same role as the Chromatic interface — without sending
> screenshots outside the team's infrastructure.

---

## 3. Files to know

| File | Role | When to change it |
|---------|------|-------------------|
| `tokens/semantic.json` | UX intentions — name with meaning | Via TCR only |
| `tokens/component.json` | Visual decisions per component | Via TCR + approval |
| `guidelines/components/[name].md` | Component contract | On every rule change |
| `.claude/rules/` | What AI agents read on startup | After every major TCR or new rule |
| `DESIGN.md` | Principles and governance | Quarterly review |

---

## 4. Non-negotiable rules

- ❌ Never a local variable in system files
- ❌ Never a primitive token applied directly to a component
- ❌ Never a token change without a TCR
- ✅ Name tokens by **intent**, not value (`color.feedback.danger`, not `color.red`)
- ✅ Every component has a `.md` contract before shipping
- ✅ Up-to-date `.claude/rules/` = reliable AI agents for the whole team
