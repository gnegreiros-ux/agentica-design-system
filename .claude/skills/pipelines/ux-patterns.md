# Pipeline: ux-patterns

> Blocking guardrail — any component creation and any relevant UX modification
> must go through a human-approved UX pattern review, documented across 6 surfaces.
> **Status:** ✅ Active
> **Trigger:** new component, or relevant UX modification of an existing component

---

## Principle

> No component is published without the **reference UX patterns** having been presented
> to the human (with links) and their decision **documented everywhere**.

Execution reference: `.claude/skills/ux-pattern-review.md`
Sources and checklist: `.claude/rules/ux-patterns-sources.md`

---

## Trigger matrix

| Change made | Review required? |
|--------------------|-----------------|
| New `components/agtc-*.js` | ✅ Yes — full review |
| New `guidelines/components/*.md` | ✅ Yes — full review |
| New variant or new state on a component | ✅ Yes |
| Change to validation logic (timing, rules) | ✅ Yes |
| Change to error display / help text | ✅ Yes |
| New interaction or newly supported type | ✅ Yes |
| Contrast / WCAG fix | ❌ No — covered by `pipelines/wcag.md` |
| Typo, variable rename, refactor with no behavior change | ❌ No |
| Token update with no behavioral impact | ❌ No |

> Same "decision vs. adjustment" distinction as the ADR-015 amendment: the review triggers
> when a **UX behavior is created**, not when an existing one is fixed.

---

## Pipeline checks

### 1. Did the review happen?
- [ ] Suggested patterns presented to the human (table + **direct links** to the sources)
- [ ] Review checklist covered: states, error display, help text, **validation timing**,
      required markers, progressive disclosure, dark patterns

### 2. Did the human approve?
- [ ] Explicit decision (✅/❌) recorded for each proposed pattern
- [ ] No pattern applied without approval

### 3. Are the 6 surfaces documented?
- [ ] **Guideline** — section `## UX Patterns Reference` up to date
- [ ] **Code** — header comment block "WHY" + links
- [ ] **Storybook** — `parameters.docs.description.component` (unless component has no story → note it)
- [ ] **Site** — `node site/build.js` run
- [ ] **ADR** — applied patterns listed in the component's implementation ADR
- [ ] **GitHub Projects** — project item reflected (status, domain) — see ADR-069

---

## Partial report (example)

```
### X. UX pattern review
- [x] Component: agtc-input (change: validation logic)
- [x] Patterns presented with links (NN/g, IxDF, Smashing)
- [x] Human approval: 4 patterns ✅, 1 ❌ (lazy registration — not relevant)
- [x] 6 surfaces documented (guideline, code, story, site, ADR-033, log)
- [ ] ⚠️ Verify site rebuild
```
