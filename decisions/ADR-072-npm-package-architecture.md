# ADR-072 — Package architecture for npm publication: `@agentica/tokens` + `@agentica/components`

> **Date:** 2026-07-15
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead

## Context

Agentica has so far lived entirely inside one repository, consumed only by its own
site (ADR-062: single `agtc.js` bundle, dogfooded internally). To let external product
teams install and test the system in their own projects, it needs to be published to
npm.

Two structural questions needed answering before any build tooling could be written:

1. **How many packages, and along what boundary?** The codebase already encodes a
   three-level token architecture (ADR-001: primitive → semantic → component) and a
   separate `components/` tree of 17 Lit Web Components (ADR-002). The token layer and
   the component layer change at different rates and serve different consumers (a
   product team styling a page with tokens alone vs. a team using the full components).
2. **What module format, and how does the site keep dogfooding the published
   packages** without breaking its current fast edit-and-rebuild loop
   (`node site/build.js`)?

Research was conducted into 2026 npm publishing practice for multi-package design
systems (monorepo/workspace tooling, package scoping, versioning strategy, module
format, and concrete precedents). Key findings:

- **Monorepo tooling**: npm/pnpm workspaces is the standard way to host multiple
  publishable packages plus a private consumer (the site) in one repo, with the
  `workspace:*` protocol resolving to local symlinks in development and to real semver
  ranges at publish time — this is what lets a package's own repo dogfood it without a
  publish-then-reinstall cycle on every change.
- **Precedents**: Shopify Polaris ships `@shopify/polaris` (components),
  `@shopify/polaris-tokens`, and `@shopify/polaris-icons` as independently versioned
  packages — the closest architectural sibling to a token/component split. Adobe
  Spectrum Web Components ships one package per component, which the research judged
  premature overhead for Agentica's current 17 components. Radix is consolidating
  *toward* fewer packages in 2026, a signal against over-fragmenting.
- **Module format**: ESM-only is the 2026 default for new packages (Shoelace/Web
  Awesome, the closest Lit-based precedent, ships ESM-only with no CJS build). Node.js
  can `require()` ESM natively; Agentica has no existing CJS-only consumer to support.
- **Versioning**: Changesets is the dominant tool for independently versioned
  multi-package repos in 2026 — a PR bot proposes exactly which packages/semver bumps
  ship, with developer-authored changelogs.
- **npm scope**: `@agentica` was checked directly against the npm registry on
  2026-07-15 — `@agentica/tokens` and `@agentica/components` both return 404, and no
  npm user or organization named `agentica` exists. The scope is available and should
  be claimed via an npm **organization** (not a personal user account), so publishing
  rights belong to the team, not an individual.

## Decision

Agentica publishes as **two independently versioned packages**:

- **`@agentica/tokens`** — the compiled Style Dictionary output (CSS custom
  properties, JS ES6 constants, Tailwind config extension) plus the raw three-layer
  DTCG JSON source. The raw JSON is retained for internal design-system tooling
  (Tokens Studio sync, audit scripts) but is **not** the primary interface documented
  for consuming product teams — those are pointed at the compiled CSS/JS exports.
- **`@agentica/components`** — the 17 Lit Web Components, with one entry point per
  component (for tree-shaking) plus a barrel export matching today's
  `components/index.js`. `lit` is a peer dependency. `@agentica/tokens` is **not** an
  npm dependency of this package — components consume CSS custom properties by DOM
  inheritance, not by JS import — so the relationship is documented as "load
  `@agentica/tokens/css` before using these components," not wired as a hard
  dependency edge.

Both packages ship **ESM only** — no CJS build.

The repo becomes an **npm workspaces** monorepo (`npm`, not `pnpm` — the project
already runs on plain npm; introducing a second package manager isn't justified at
this scale, and can be revisited if build/install performance becomes a real problem):

```
packages/
  tokens/        → @agentica/tokens
  components/    → @agentica/components
site/            → private, unpublished, workspace member
```

`site/package.json` depends on both packages via `"workspace:*"`, which resolves to a
local symlink during development (the existing fast edit → `node site/build.js` loop
is unaffected) and to a real semver range once packages are actually published. This
preserves the "site is the first consumer" principle (ADR-062) against the published
artifact, not just the source tree.

Versioning and releases go through **Changesets**, run independently per package —
a token-only change does not force a component version bump.

The npm scope `@agentica` is claimed as an **npm organization**, not a personal
account.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| **Single `@agentica/design-system` package** | Forces a components-only or tokens-only consumer to install the whole system, and couples every token tweak to a component-package version bump — defeats the purpose of the existing primitive→semantic→component layering. |
| **One npm package per component** (Adobe Spectrum's model) | Maximizes tree-shaking but multiplies publishing overhead 17×; the research found even large, mature systems (Radix) moving away from this granularity. Premature at Agentica's current component count. |
| **Lockstep versioning** (two packages, single shared version number) | Simpler support matrix, but re-couples tokens and components on every release — exactly the coupling the split into two packages was meant to avoid. |
| **Dual ESM/CJS build** | No existing consumer requires CJS; the closest technical precedent (Shoelace) ships ESM-only; a dual build adds real maintenance cost (two `exports` targets, twice the surface to validate) for a need that doesn't currently exist. Can be added later without breaking ESM consumers if a real need appears. |
| **pnpm workspaces** | Better disk efficiency at large monorepo scale, but introduces a second package manager into a project that runs entirely on npm today. Not justified for two publishable packages; revisit if this becomes a real constraint. |

## Consequences

**For AI agents:**
- Any future token change PR only needs a changeset entry for `@agentica/tokens`,
  not `@agentica/components`, unless the change is a breaking one at the component
  contract level.
- Generating install instructions for a consuming team means pointing at
  `@agentica/tokens/css` (or `/js`) and `@agentica/components`, never at the raw
  `tokens/*.json` source files, which stay internal-facing.

**For developers:**
- The site keeps its current edit-and-rebuild workflow unchanged during development,
  via `workspace:*` — no publish step required to see a local change reflected.
- A first-time contributor to a consuming (external) project installs
  `@agentica/tokens` and `@agentica/components` from the public npm registry like any
  other scoped package — no special access beyond what npm's public registry provides.

**For designers:**
- No change to the Figma ↔ Tokens Studio sync path (ADR-011) — it continues to read
  the same source JSON, now re-exported (not duplicated) inside `@agentica/tokens`.

**Accepted cost:**
- Two packages to version and release instead of one, coordinated through Changesets.
- The repo's build tooling (`style-dictionary/build.cjs`, `bundleComponents()` in
  `site/build.js`) needs updated output targets to also produce publishable package
  contents — tracked as a separate implementation ticket, not part of this decision.

## Incidents or triggers

No incident. Triggered by an explicit request (2026-07-15) to let external product
teams install and test Agentica, tracked as the "Publication npm" initiative in the
project's GitHub Projects board. This ADR closes the three open governance questions
raised during that initiative's research phase (npm scope availability, whether raw
token JSON is a public-facing interface, and whether a CJS fallback is required).
