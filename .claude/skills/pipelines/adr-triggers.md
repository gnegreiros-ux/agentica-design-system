# Pipeline: adr-triggers

> Trigger matrix — determines whether a new ADR is required after a change.
> **Status:** ✅ Active
> **Trigger:** every change (systematic check)

---

## Principle

> Any **architectural or design decision** not already covered by an existing ADR must create one.
> A change can go without an ADR only if it is an **application** of an already documented decision.

---

## Trigger matrix

| Change made | ADR required? | ADR type |
|--------------------|-------------|-----------|
| New font | ✅ Yes | Typography |
| Change to the typographic scale | ✅ Yes | Typography |
| New grid or spacing system | ✅ Yes | Spacing |
| New color palette | ✅ Yes | Color / Brand |
| New density mode | ✅ Yes | Spacing |
| New component added to the system | ✅ Yes | Component |
| Icon library change | ✅ Yes | Icons |
| New CI/CD pipeline | ✅ Yes | Infrastructure |
| Major new technical dependency | ✅ Yes | Infrastructure |
| Semantic token change (meaning / intent) | ✅ Yes | Token |
| Component token change | ✅ Yes | Token — Principal Designer approval |
| New governance rule | ✅ Yes | Governance |
| Value fix in an existing token | ❌ No | Application of an existing ADR |
| Page added to the documentation site | ❌ No | Routine documentation |
| CSS bug fix | ❌ No | Standard fix |
| Build log update | ❌ No | Routine log |
| Adding an ADR (this file) | ❌ No | Meta-documentation |

---

## Questions to ask

For every change, answer these questions:

1. **Is this a new decision?** Not already covered by an existing ADR.
2. **Does it have a cross-team impact?** Designers, developers, AI agents affected.
3. **Is it irreversible or hard to change?** The harder it is to undo, the more critical the ADR.
4. **Are there rejected alternatives?** If yes → ADR mandatory to document the why.

**If 2 or more answers are "yes" → create an ADR.**

---

## ADR format (reminder)

```markdown
# ADR-0XX — [Decision title]

> **Date:** YYYY-MM-DD
> **Status:** ✅ Active
> **Decision-makers:** [Name] — [Role]
> **Relations:** [impacted files]

## Context
## Decision
## Rationale
## Rejected alternatives
## Consequences
```

---

## Partial report (example)

```
### 4. Missing ADRs
- [x] New color token → already covered by ADR-024 (brand palettes)
- [ ] ⚠️ New mono font → ADR-028 to create: "Atkinson Hyperlegible Mono"
- [x] No other undocumented decision detected
```
