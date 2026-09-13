# Phase 03 — Audit setup

> Depends on Phase 02 (token architecture confirmed and in place).

## What to do

1. Set up an accessibility audit with **axe-core as the default engine**, wired behind a replaceable interface/adapter — so a team can later swap the engine without touching anything else in the audit setup.
2. Set up static lint checks for:
   - Hard-coded style values in the core (Rule 3).
   - Direct primitive-token consumption in the core (Rule 4).
3. Configure all of the above to run **on every build**, regardless of any personalization configuration in the target project. This is not optional and is not something a team can disable through configuration.
4. The public compliance badge (displaying WCAG / hard-coded-style / primitive-token conformance on a generated site) stays **optional** and lives only in the personalization/governance layer. Do not enable it by default — only add it if the human explicitly asks for it.

## 🛑 Stop point

Present the audit configuration (engine, adapter interface, lint rules, and where they run) to the human before integrating it into the target project's CI pipeline. Wait for explicit confirmation. Do not proceed to Phase 04 until the configuration is confirmed and integrated.
