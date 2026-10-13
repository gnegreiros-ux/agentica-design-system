# Spec — Hardcoded-styles audit engine

**Component:** `core-source/audit/hardcoded-style.mjs`
**Current status:** stub, no engine wired in
**Rule text:** see this package's shipped copy of `GOVERNANCE.md`, `core-source/references/non-negotiable-foundation.md`.
**Scope of this spec:** detect any style value written as a literal (color, spacing, typography, etc.) instead of a token reference. Distinct from the WCAG/axe-core spec and the primitive-tokens spec.

> **Correction 2026-10-07 (human review):** the original version of this spec described a non-blocking mode for this brick. `GOVERNANCE.md` Rule 3 ("Verification") is explicit: *"build fails if a hard-coded value is detected in the core"*. This spec was corrected to reflect **blocking** behavior — only the WCAG brick (`audit-wcag-axe-core.md`) stays non-blocking.

---

## 1. Framework reminder (non-negotiable, already decided)

- Foundation rule: "never a hardcoded style — core components only accept token references" (GOVERNANCE.md Rule 3).
- The audit **always** runs, whether the public compliance badge is displayed or not.
- Engine hidden behind an **adapter interface**, replaceable without touching the rest of `core-source/`.
- **Blocking mode** for this rule: a detected violation fails the build (GOVERNANCE.md Rule 3, severity always blocking, never advisory). **Human has the final word** still applies to the *content* of the report and to any documented exception (e.g. an ADR), but not to the build failure itself — no automatic fix is applied; the build fails and a human either fixes the source or documents an explicit exception.

## 2. Objective of this brick

Scan component source code to find any raw value (hex, `rgb()`, `px`, `rem`, etc.) that is not a token reference (`var(--...)` or the Lit/CSS-in-JS equivalent), and produce a normalized report.

## 3. Adapter contract (reuses the common contract)

**Expected input:**
- path(s) or list of component source files (CSS, Lit templates, inline styles)
- the list of patterns to flag (colors, spacing, typography — configurable)

**Expected output (same normalized contract as the WCAG spec):**
- a list of "findings": rule id, severity, location (file + line, instead of a DOM selector), message, reference to the internal token documentation
- an overall status (violation count per severity)

## 4. Engine — decision to confirm

Two candidates, neither picked yet:
- **Stylelint** with a custom rule forbidding raw values (color/spacing/typography) — fastest to set up, mature ecosystem, MIT license.
- **Custom AST scanner** (e.g. over Lit templates) — more control but more upfront development cost.

👉 Recommendation: start with Stylelint (zero cost, fast setup), move to a custom scanner only if Lit templates escape its coverage.

## 5. JSON output format

```json
{
  "auditType": "hardcoded-styles",
  "engine": "stylelint",
  "engineVersion": "x.y.z",
  "target": "component-or-file-name",
  "timestamp": "ISO-8601",
  "summary": {
    "violationsCount": 0,
    "bySeverity": { "critical": 0, "serious": 0, "moderate": 0, "minor": 0 }
  },
  "findings": [
    {
      "ruleId": "string",
      "severity": "critical | serious | moderate | minor",
      "location": "file:line",
      "message": "string",
      "helpUrl": "string"
    }
  ]
}
```

## 6. Blocking behavior

- Any detected violation (`violationsCount > 0`) fails the build, per GOVERNANCE.md Rule 3.
- No automatic fix is applied — the build fails, a human fixes the source or documents an explicit exception (ADR) before re-running.
- The JSON report is still produced in full even on failure, so the public badge and CI have the violation detail.

## 7. Out of scope

- WCAG audit (separate spec, non-blocking — `audit-wcag-axe-core.md`)
- Primitive-tokens audit (separate spec, blocking — `audit-primitive-tokens.md`)

## 8. Costs / licensing

- Stylelint: MIT license, open source, no cost.
- Main effort = writing the configuration/custom rule, no license purchase.

## 9. Acceptance criteria

- [ ] The module respects the adapter contract, independently of the chosen engine
- [ ] The JSON report follows the schema in section 5
- [ ] A detected violation fails the build (blocking, per GOVERNANCE.md Rule 3); no fix is applied automatically
- [ ] The Stylelint vs. custom-scanner choice is validated before implementation
