# ADR-073 — npm scope correction: `@agentica` → `@agentica-ds` (amends ADR-072)

> **Date:** 2026-07-16
> **Status:** ✅ Active
> **Decision-makers:** Design System Lead
> **Relations:** ADR-072 (npm package architecture — amended)

## Context

ADR-072 (2026-07-15) decided to publish Agentica as `@agentica/tokens` and
`@agentica/components`, based on a registry check that found `@agentica/tokens` and
`@agentica/components` both returning 404, with no npm user or organization named
`agentica` apparently existing.

That check only tested the two specific package names — it did not confirm whether the
`agentica` **scope itself** (the npm organization) was unclaimed. On 2026-07-16, while
creating the npm organization through the web UI, the "Create" action for `agentica`
failed. Querying the public registry directly confirmed why:

```
GET https://registry.npmjs.org/-/org/agentica/package
→ 200 {"@agentica/core":"write","@agentica/rpc":"write","@agentica/benchmark":"write",
       "@agentica/chat":"write","@agentica/pg-selector":"write", ...}
```

The `agentica` scope is already claimed by an unrelated, pre-existing open-source AI
agent framework, publishing under package names (`core`, `rpc`, `benchmark`, `chat`,
`pg-selector`, `openai-vector-store`, `pg-vector-selector`, `vector-selector`,
`prompt-jsx`) that happened not to collide with `tokens` or `components` — which is why
the ADR-072 check passed without detecting the conflict. A package-name-availability
check is not a scope-availability check.

## Decision

The npm scope is corrected to **`@agentica-ds`**. Packages become
`@agentica-ds/tokens` and `@agentica-ds/components`.

Verified genuinely unclaimed (not just empty) via the same registry endpoint, compared
against both the existing `agentica` org and a deliberately nonexistent scope:

| Scope | `GET /-/org/{scope}/package` |
|---|---|
| `agentica` (existing, unrelated org) | `200` — 9 packages |
| `agentica-ds` (chosen) | `200` — `{}` (org shape, zero packages) |
| a deliberately nonexistent scope | `404` — `{"error":"Scope not found"}` |

`@agentica-ds/tokens` and `@agentica-ds/components` individually also return `404`. The
npm organization `agentica-ds` was created 2026-07-16 (owner: `gnegreiros`, free
"Unlimited public packages" plan, 2FA enabled on the account).

Alternatives considered: `agentica-design` (rejected — longer, no added clarity over
`-ds`) and `agtc` (rejected — matches the existing CSS/component prefix, but reads as
opaque outside the codebase; `-ds` is a conventional, self-explanatory design-system
suffix).

Every other decision in ADR-072 is unchanged: the two-package split, ESM-only, npm
workspaces (not pnpm), Changesets, `site/` depending on both packages via
`"workspace:*"`, and the npm organization (not a personal account) owning the scope.

## Rejected alternatives

| Alternative | Reason for rejection |
|-------------|-----------------------|
| `agentica-design` | Longer than `agentica-ds` with no clarity gain; both are equally unambiguous. |
| `agtc` | Matches the existing internal prefix (`agtc-button`, `--agtc-*`) but is opaque to an external consumer browsing npm; `-ds` is a recognizable, conventional suffix. |
| Keep `@agentica` and contact the existing org's owner about the name | No contact path evidenced, no guarantee of a response, and blocks the "publication npm" initiative on a third party for no architectural benefit. |

## Consequences

**For AI agents:**
- Any install instructions, documentation, or build tooling must reference
  `@agentica-ds/tokens` and `@agentica-ds/components` — never `@agentica/*`.
- No code needed correcting as a result of this ADR: the build pipeline described in
  ADR-072 (`packages/tokens/`, `packages/components/`, workspace wiring) had not been
  implemented yet, so the scope was caught before it touched any file.

**For developers:**
- No change to the two-package split, module format, or workspace tooling decided in
  ADR-072 — only the scope string changes.

**For designers:**
- No impact — this is a publishing-infrastructure correction, not a design decision.

**Accepted cost:**
- The final published package names (`@agentica-ds/*`) diverge slightly from the
  product name (`Agentica`) and the site domain (`agentica.design`). Judged acceptable:
  the `-ds` suffix is a standard, self-explanatory disambiguator, and the alternative
  (disputing the `agentica` scope with an unrelated project) was rejected above.

## Incidents or triggers

Caught 2026-07-16 during npm organization creation: the `agentica` org creation failed
in the npm web UI. Root-caused by querying the public registry API
(`registry.npmjs.org/-/org/{scope}/package`) instead of relying on the UI error message
alone, which distinguished "scope taken by another org" from a generic loading error.
