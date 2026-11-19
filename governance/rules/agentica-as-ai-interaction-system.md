---
paths:
  - "AGENTS.md"
  - "governance/**"
---

# Rule: agentica-as-ai-interaction-system

> Maps Agentica's own agent/human governance model (defined in AGENTS.md) onto the
> AI Interaction Atlas's 6 system dimensions, to make the agent/human responsibility
> boundaries legible and auditable — not a UI pattern reference, a governance
> self-audit lens.
> **Type:** rule
> **Logical path:** governance/rules/agentica-as-ai-interaction-system.md
> **Read before:** (consulted when reviewing or extending AGENTS.md's agent roles)
> **Relations:** AGENTS.md, governance/rules/project-overview.md, governance/rules/ux-patterns-sources.md

---

## Why this document exists

AGENTS.md defines 4 agents (Designer, Developer, Documentation, QA) in prose, each with
a `Can` / `Cannot` / `Produces` list, plus one escalation rule ("any change touching a
semantic token or a component contract is automatically escalated"). This is already
the right shape of governance, but prose boundaries drift silently as agents gain new
tools or skills.

The [AI Interaction Atlas](https://ai-interaction.com/) (added as source 6 in
[ux-patterns-sources.md](ux-patterns-sources.md)) externalizes exactly this kind of
system into 6 explicit dimensions: AI Patterns, Human Actions, System Operations, Data
Modalities, Constraints, Touchpoints. Applying it to Agentica itself — not to a
component's UI, but to the **governance system that builds Agentica** — gives a
sharper, auditable version of the same "human always has final word" principle already
stated in [project-overview.md](project-overview.md).

> This is a review lens, not a new rule engine. It does not change what any agent is
> allowed to do — it is a map to re-check that AGENTS.md's boundaries are still correct
> whenever an agent gains a new skill or tool.

---

## The map

### AI Patterns (probabilistic capability — a guess, not a guarantee)

| Agent | Pattern |
|---|---|
| Designer Agent | **Detect** — detached instances, missing descriptions, inconsistent spacing |
| Developer Agent | **Classify** — hardcoded colors, deprecated tokens, duplicated components |
| Documentation Agent | **Generate** — changelogs, migration guides, accessibility notes |
| QA Agent | **Classify / Detect** — accessibility violations, visual regressions, token non-conformance |

All four outputs are probabilistic by nature (pattern-matching over code/Figma state) —
none of them is ground truth until a human or a deterministic check confirms it. This is
why every agent's `Produces` column in AGENTS.md is a *report* or *draft*, never a
merged/applied change.

### Human Actions (where agency and accountability live)

| Action | Who | Where |
|---|---|---|
| Approve a drift report | Human | Designer Agent output |
| Review a correction PR | Human | Developer Agent output |
| Validate a documentation draft | Human | Documentation Agent output |
| Approve a merge | Human | QA Agent output (QA cannot approve its own gate) |
| Approve a TCR (token change request) | Human | Any semantic-token change |

Every row in this table already exists in AGENTS.md's `Cannot` column (agents cannot
merge, cannot modify Figma directly, cannot publish, cannot approve). The Atlas framing
makes it explicit that these are not incidental restrictions — they are *where the
system places responsibility*, which is the one thing that must never become implicit.

### System Operations (deterministic — same input, same output, no judgment)

- Lint rules (hardcoded value detection)
- `scripts/check-tool-parity.js` (CI gate on `governance/tool-parity/*.md` completeness)
- Token conformance scripts, WCAG contrast checks
- `post-change-pipeline` / `quality-gate` skill orchestration
- `site/build.js` regeneration

These are intentionally **not** agent judgment calls — they are infrastructure that
agents (and humans) can both trust without re-verifying, which is why the escalation
rule for semantic tokens exists: it routes exactly the decisions that are *not*
deterministic to a human.

### Constraints (what cannot be violated, regardless of agent or human preference)

- WCAG accessibility thresholds
- ADR-102 token annotation schema (no new `$`-prefixed key outside `$description` /
  `$extensions`)
- The escalation rule itself (semantic token or component contract → always escalated)
- `governance/tool-parity/*.md` sign-off requirement before a non-Claude tool is
  considered wired up

### Data Modalities (what flows between agents and humans)

- Figma file state (nodes, variables, components)
- Repository code (`components/`, `tokens/`)
- Markdown reports (drift reports, conformance reports, migration guides)
- GitHub Projects items (status, domain — per ADR-069)

### Touchpoints (where the system becomes visible to a human)

- Pull requests (correction PRs, documentation drafts)
- GitHub Projects board
- CI check annotations (tool-parity, gate-coverage, site-freshness)
- ADRs in `decisions/`

---

## How to use this map

Re-check it, rather than AGENTS.md's prose alone, whenever:

- A new agent role or skill is proposed — does it add an **AI Pattern** without a
  corresponding **Human Action** gate?
- An existing agent gains a new tool — does that tool quietly cross from **System
  Operations** (deterministic) into **AI Patterns** (judgment), without a human gate
  being added to match?
- A **Constraint** is reworded — confirm it still blocks the same set of **AI Patterns**
  it did before.

```
✅ Use this map to re-verify an agent/human boundary before extending AGENTS.md
✅ Treat any agent output as an AI Pattern (probabilistic) until a human/deterministic
   check confirms it
❌ Let a new agent capability ship without an explicit Human Action counterpart
❌ Use this document as a UI pattern reference — see ux-patterns-sources.md for that
```

> **The human always has the final word** — this map exists to keep that true as the
> system grows, not to replace it.
