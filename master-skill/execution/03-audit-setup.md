# Phase 03 — Audit setup

> Depends on Phase 02 (token architecture confirmed and in place).

## What to do

1. Set up an accessibility audit with **axe-core as the default engine**, wired behind a replaceable interface/adapter — so a team can later swap the engine without touching anything else in the audit setup.
2. Set up static lint checks for:
   - Hard-coded style values in the core (Rule 3).
   - Direct primitive-token consumption in the core (Rule 4).
3. Configure all of the above to run **on every build**, regardless of any personalization configuration in the target project. This is not optional and is not something a team can disable through configuration.
4. The public compliance badge (displaying WCAG / hard-coded-style / primitive-token conformance on a generated site) stays **optional** and lives only in the personalization/governance layer. Do not enable it by default — only add it if the human explicitly asks for it.
5. At this point in the flow, `core/` does not exist yet — no component has been scaffolded. Every audit entry point (the accessibility runner, the lint runner) must handle this by exiting cleanly (exit 0, a clear "nothing to check yet" message) — never by crashing. An audit that throws an unhandled error before a single component exists is not a passable state to hand off, even though the underlying rule genuinely has nothing to verify yet.
6. Before presenting the configuration at the stop point below, **actually run it** — install the declared dependencies and execute every script this phase adds (the audit entry points, `npm run build` if Phase 02 already wired one). A proposal that has never been executed can look complete in review while crashing on the very next real command; this phase is where that gap was found (see `decisions/` — a Master Skill dry run produced audit scripts that crashed on missing `core/` until fixed after the fact, outside this phase's own flow).
7. Produce or update the target project's `.gitignore` to exclude `node_modules/` and any directory this phase's tooling generates output into (e.g. a build/preview directory the accessibility runner audits). This phase is normally the first to introduce real devDependencies and generated output — leaving them untracked is this phase's responsibility, not an afterthought.

## 🛑 Stop point

Present the audit configuration (engine, adapter interface, lint rules, and where they run) to the human before integrating it into the target project's CI pipeline. Wait for explicit confirmation. Do not proceed to Phase 04 until the configuration is confirmed and integrated.
