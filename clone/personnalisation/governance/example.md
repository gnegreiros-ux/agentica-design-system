# Governance — example

## Compliance badge

Whether to show the public compliance badge on the generated documentation site. The audit itself always runs, badge or not (see `GOVERNANCE.md`'s *Audit governance* section). The badge never shows this flag as a verdict: it displays the last recorded audit result, or "not verified" when none is recorded (ADR-100) — a stub or skeleton audit never records one.

```md
badgeEnabled: false
```

## Audit adapter

Declare an alternative to axe-core here, if the team uses one — it must respect the interface defined by `core/`.

```md
auditEngine: axe-core   # default; replace only via the core's adapter interface
```

## DTCG conformance

Confirm every token file in the project (primitive, semantic, component) follows the W3C Design Tokens Community Group (DTCG) format.

## Audit cadence

Define how often scheduled audits run (e.g. weekly), and who or what is responsible for them (a scheduled agent, CI, manual review).

## Language policy

Pick a single official language for the repo's content (documentation, ADRs, commit messages). Mixing languages becomes unreadable for an agent as much as for a human.

## Branch protection

Match the number of required approvals on `main`/`develop` to the team's actual size — a solo maintainer doesn't need the same constraints as a ten-person team.

## Pre-commit pipeline

A human-approved pre-commit pipeline for impactful changes (e.g. a component-token change) — beyond the automatic lint.

## UX pattern review sources

Which reliable sources the team consults before considering a component ready to publish (e.g. NN/g, Brad Frost, Into Design Systems, or the team's own sources).

## Publishing (if applicable)

If the team publishes or open-sources its instance: code license, license for separately published design resources (e.g. a Figma file), and publishing strategy (package scope, CI automation). Skip this subsection otherwise.
