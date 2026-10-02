# ADR-102 — Token annotation schema: `$description` plus two vendor namespaces in `$extensions`

> **Date:** 2026-09-27
> **Status:** ✅ Active — migration of existing files pending (issue #203)
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** contract
> **Logical path:** decisions/ADR-102-token-annotation-schema.md
> **Read before:** AGENTS.md, DESIGN.md, governance/rules/tokens-system.md, decisions/ADR-052-dtcg-standard-conformance.md
> **Relations:** ADR-052 (DTCG conformance — this ADR closes its open gaps), ADR-086 (relationships registry — consumes these fields), issue #187 (HM-01 hygiene report), issue #188 (HM-02), issue #203 (HM-02b migration), issue #177 (component `api` field), issue #198 (HM-08), `tokens/*.json`, `scripts/lib/contracts.js`, `scripts/validate-contracts.js`, `scripts/extract-relationships.js`, `style-dictionary/build.cjs`

---

## Context

The HM-01 hygiene report (issue #187, 2026-09-27) measured how well tokens are annotated for
agents. It found an annotation scheme already in place, but never formalised and partly
non-conformant with the standard ADR-052 binds us to:

1. **`$extensions["com.agentica.usage"]`** — `role`, `use[]`, `doNotUse`, `components[]`,
   `decision` — was introduced on 2026-06-19 (commit `34471f79`) on 31 semantic tokens and is
   read by `scripts/lib/contracts.js` and `scripts/extract-relationships.js` (ADR-086). The
   `$metadata._extensions-convention` note of `semantic.json` and `component.json` points to
   ADR-052 for its definition, but ADR-052 never defines it.
2. **`$intent`** carries most of the human-readable meaning (87 % of semantic tokens, 100 % of
   dark-mode tokens, 18 % of component tokens), while `$description` — the only description field
   the standard defines — covers 18 % of semantic tokens and 0 % of component tokens.
3. **`$metadata`** sits at the root of 6 token files (`level`, `description`, `version`, `rule`,
   `_extensions-convention`, `tokenSetOrder`) and on 18 groups of `component.json` (`intent`,
   `owner`, `contract`, and `button.critical`'s confirmation rules), where
   `scripts/validate-contracts.js` and `scripts/extract-relationships.js` read it.
4. **5 pseudo-tokens `_readme`** (`$type: "other"`) store group documentation as tokens;
   `style-dictionary/build.cjs` filters them out with `isReadme`.

Checked against the *Design Tokens Format Module 2025.10* (draft of 2026-09-08) and its official
JSON Schema (`https://www.designtokens.org/schemas/2025.10/format.json`):

- §5.1.1 reserves the `$` prefix for properties defined by the format, current and future.
- §5.2 lists the properties a token may carry beyond `$value`: `$description`, `$type`,
  `$extensions`, `$deprecated`.
- §5.2.3 makes `$extensions` the place for proprietary, team- or vendor-specific data, under a
  vendor-specific key; tools MUST preserve extension data they do not understand.
- The schema's `token.json` allows only `$value`, `$type`, `$ref`, `$description`, `$extensions`,
  `$deprecated`, and `group.json` only `$type`, `$description`, `$extensions`, `$extends`,
  `$deprecated`, `$root` plus child names — both with `additionalProperties: false`.

So a token carrying `$intent`, or a file or group carrying `$metadata`, fails the official schema,
and no conformant tool has to keep those fields. The raw `tokens/*.json` files also ship inside
`@agentica-ds/tokens`, so this is not only an internal concern.

## Decision

### 1. `$description` is the single human-readable description

- Every token and group description lives in `$description`. **`$intent` is retired** and folded
  into `$description`. When both exist, they become one text with no loss of information
  (contrast ratios, pitfalls, ADR references).
- A group's `$intent` or `$metadata.intent` / `$metadata.description` becomes that group's
  `$description` (the schema allows it on groups and on the file root).
- `_readme` pseudo-tokens become the `$description` of their parent group.

### 2. `$extensions["com.agentica.usage"]` — how to use a token (token level)

| Field | Type | Required | Content |
|---|---|---|---|
| `role` | string | **yes** | Semantic role in one or two words (e.g. `danger`, `primary-action`) |
| `use` | string[] | **yes** | Allowed usages, as component selectors: `Button[variant=critical]` |
| `doNotUse` | string | **yes** | Explicit contraindications, in prose |
| `alternative` | string[] | no — expected whenever `doNotUse` names a better token | Full token paths to use instead: `semantic.color.brand.accent` |
| `decision` | string \| string[] | **yes when an ADR justifies the token** | `ADR-XXX` identifiers only |
| `components` | string[] | no | Consuming components, same selector syntax as `use`; derivable from code |

`alternative` is new. `doNotUse` stays prose for humans; `alternative` gives agents a
machine-readable target, which HM-08 (issue #198) needs to test that an agent refuses a
contraindicated token and proposes the documented one, and which lets `extract-relationships.js`
stop parsing token paths out of prose.

A token is **agent-ready** when it has a `$description` and a `com.agentica.usage` block that
satisfies the required fields above. This is the definition the hygiene score (HM-07, issue #192)
measures.

### 3. `$extensions["com.agentica.governance"]` — the contract of a file or a component (root and group level)

Everything `$metadata` held besides descriptive text moves here, unchanged in content:
`level`, `version`, `rule` (file roots); `owner`, `contract`, and behavioural rules such as
`requires-confirmation`, `prevents-double-click`, `audit-log`, `min-contrast` (component groups).
The two namespaces stay separate on purpose: `usage` describes how to use one token,
`governance` describes who owns a file or component and what contract binds it.

`_extensions-convention` is dropped: this ADR is the reference. `tokenSetOrder` in
`primitives*.json` is removed unless Tokens Studio is shown to read it there (it normally reads
`tokens/$metadata.json`). `tokens/$metadata.json` itself is a Tokens Studio configuration file,
not a token file: it stays as is and is excluded from DTCG validation.

### 4. Dark mode inherits annotations

Annotations live in `semantic.json` only. `semantic.dark.json` carries value deltas; it holds a
`$description` only for information specific to the dark theme (for example its own contrast
ratios), never a copy of the light-mode text.

### 5. Shared vocabulary with the component `api` field (#177)

When a component prop refers to a token in the `api` metadata of issue #177, it uses the token's
**full path** (`component.button.primary.background`), and variants use the same selector syntax as
`use` (`Button[variant=critical]`). One notation for token paths and one for component variants,
across token annotations and component metadata.

### 6. Rule for agents

Every new or modified token entry follows this schema. No new `$`-prefixed key outside those the
DTCG schema allows; team-specific data goes under one of the two `com.agentica.*` namespaces.

## Rejected alternatives

- **Keep `$intent` as a documented exception** — ADR-052 says the standard prevails; the
  official schema rejects the key, and no tool is required to preserve it. Rejected.
- **Move `$intent` into `$extensions["com.agentica.usage"].intent`** — conformant, but keeps two
  descriptions per token where the standard provides one, and hides the main description from
  every generic DTCG tool (documentation generators, Tokens Studio). Rejected in favour of
  `$description`.
- **One namespace for everything (`com.agentica.usage`)** — mixes a token's usage with a
  component's ownership and contract, which different people read and approve. Rejected.
- **Duplicate annotations into `semantic.dark.json`** — two copies drift; the intent of a token
  does not change with the theme. Rejected.

## Consequences

- **Build output is unaffected.** Verified on 2026-09-27 in a sandbox copy of `tokens/`: the full
  migration (`$intent` → `$description`, `$metadata` → `$description` + `com.agentica.governance`,
  `_readme` → group `$description`) was applied to every file, and Style Dictionary 3.9.2 produced
  the 11 files of `dist/tokens/**` byte-for-byte identical to the current build, with no warning.
  After that migration no token file contains a key outside the DTCG 2025.10 schema.
- **Migration is a separate change** (issue #203, HM-02b): one PR that migrates the existing files
  and adapts `scripts/lib/contracts.js`, `scripts/validate-contracts.js`,
  `scripts/extract-relationships.js`, `style-dictionary/build.cjs` and one mention in
  `site/build.js`. It touches component contracts, so it requires human escalation and a TCR.
  Until it merges, existing files keep the legacy keys; new entries already follow this ADR.
- **Annotation work** (HM-04 #190, HM-05 #191) writes content only, on this schema.
- **Remaining non-conformance — value formats (out of scope).** Structure aside, token *values*
  still follow an older DTCG draft: colours are hex strings (the 2025.10 schema requires a
  `{colorSpace, components}` object), dimensions are strings like `"16px"` (it requires
  `{value, unit}`), some numbers are strings, and `$type: "other"` is not a DTCG type. This affects
  about 670 literal values (595 colours, 67 dimensions, 11 numbers — mostly in `primitives*.json`;
  aliases are not affected) and the Style Dictionary 3 pipeline. It needs its own decision; the
  schema check added by #203 is therefore scoped to keys, not values.
- ADR-052's "to follow up" item (DTCG schema validation) is partly addressed by #203 (structure).

## Implementation

| Date | Event |
|------|-------|
| 2026-09-27 | Decision adopted (issue #188); sandbox Style Dictionary check passed; migration ticket #203 opened |
