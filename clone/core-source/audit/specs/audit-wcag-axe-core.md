# Spec — WCAG audit engine (axe-core)

**Component:** `core-source/audit/accessibility.mjs`
**Current status:** stub, no engine wired in
**Rule text:** see this package's shipped copy of `GOVERNANCE.md`, `core-source/references/non-negotiable-foundation.md`.
**Scope of this spec:** the first concrete audit brick — WCAG 2.2 AA verification via axe-core (GOVERNANCE.md, Rule 1). The other two foundation categories (hardcoded styles, direct primitive token consumption) are covered by separate specs, out of scope here.

> **Correction 2026-10-07 (human review):** the original version of this spec targeted WCAG 2.1 AA. `GOVERNANCE.md` Rule 1 requires WCAG **2.2** AA minimum — this spec was corrected to align. axe-core supports the `wcag22aa` tag set.

---

## 1. Framework reminder (non-negotiable, already decided)

- The audit **always** runs, whether the public compliance badge is displayed or not.
- The engine is hidden behind an **adapter interface**: axe-core is the default engine, but must be replaceable without ever touching the rest of `core-source/`.
- **Non-blocking mode**: the audit reports, it never blocks a merge or applies an automatic fix. (GOVERNANCE.md does not make Rule 1 build-blocking — only *verification* before publication is required; see Rule 1 "Verification".)
- **Human has the final word**: no auto-applied fix. The report is informational, never an action.

## 2. Objective of this brick

Provide an audit module that:
1. Runs axe-core against a rendered component or page.
2. Returns a structured (JSON) report listing WCAG 2.2 AA violations.
3. Respects the adapter contract so it stays replaceable.

## 3. Adapter contract (common interface)

Any audit engine (axe-core or a future replacement) must expose the same input/output shape, so `clone/core-source/audit/` stays agnostic of the actual engine.

**Expected input:**
- a reference to the rendered DOM (page or component) — e.g. a Playwright/Puppeteer context, or a serialized HTML fragment
- configuration options (e.g. rules to include/exclude, target level: AA)

**Expected output (contract, engine-independent):**
- a list of normalized "findings", each with: rule id, severity, affected element (selector), explanatory message, link to the rule's documentation
- an overall status (e.g. violation count per severity)
- no axe-core-specific field may leak into this contract — the axe-core adapter translates axe-core's native format into this common format

## 4. axe-core integration (default implementation)

- axe-core runs in the context where the component/page is already rendered (consistent with the Playwright usage already in place for presentation assets — see ADR-104).
- Configuration: target level WCAG 2.2 AA (axe-core `wcag22aa` tags, keeping `wcag2aa`/`wcag21aa` cumulatively if axe-core requires them for full coverage).
- The axe-core adapter:
  - receives the render context
  - runs `axe.run()` (or the Node/Playwright equivalent)
  - translates each violation axe-core returns into the normalized "finding" format defined in section 3

## 5. JSON output format

Structure of the report produced by the audit module (after passing through the adapter):

```json
{
  "auditType": "wcag",
  "engine": "axe-core",
  "engineVersion": "x.y.z",
  "target": "component-or-page-name",
  "timestamp": "ISO-8601",
  "wcagLevel": "AA",
  "wcagVersion": "2.2",
  "summary": {
    "violationsCount": 0,
    "bySeverity": { "critical": 0, "serious": 0, "moderate": 0, "minor": 0 }
  },
  "findings": [
    {
      "ruleId": "string",
      "severity": "critical | serious | moderate | minor",
      "selector": "string",
      "message": "string",
      "helpUrl": "string"
    }
  ]
}
```

This schema stays stable even if the engine changes — only `engine` and `engineVersion` vary.

## 6. Non-blocking behavior

- The module always returns a report, even when violations are present.
- No pipeline interruption, no automatic fix.
- The report feeds: (a) the optional public badge, (b) the existing CI integration (`playwright.yml`, already path-filtered), in report-only mode.

## 7. Out of scope (future specs)

- Hardcoded-style detection (blocking — see `audit-hardcoded-styles.md`)
- Direct primitive-token-consumption detection (blocking — see `audit-primitive-tokens.md`)
- A possible blocking mode for WCAG (decision deferred — not required by GOVERNANCE.md at this stage)

## 8. Costs / licensing

- axe-core: MIT license, open source, no acquisition cost.
- No proprietary dependency introduced by this brick.

## 9. Acceptance criteria

- [ ] The module respects the adapter contract (section 3) independently of axe-core
- [ ] The JSON report follows the schema in section 5 and targets WCAG **2.2** AA
- [ ] No violation blocks or triggers an automatic fix
- [ ] The module can be invoked standalone (outside CI) for manual testing
