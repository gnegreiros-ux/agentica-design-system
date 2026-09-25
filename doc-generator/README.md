# doc-generator

Generates a static documentation site from a `design-system.manifest.json` — the same way whether that manifest comes from a Clone instance or a Master Skill instance. This package has **no dependency on either**; it only reads the manifest contract below.

It is invoked **after** personalization, never before, and is never bundled into the Clone or the Master Skill — it stays a separate, standalone tool.

## Usage

```sh
node bin/cli.mjs [path-to-manifest] [output-dir]
```

Defaults: `design-system.manifest.json` in the current directory, output written to `dist-docs/`.

## The manifest contract

```json
{
  "governance": "path to GOVERNANCE.md or its local equivalent",
  "tokens": { "primitive": "path", "semantic": "path", "component": "path" },
  "components": "path to component metadata",
  "audit": {
    "engine": "axe-core (or a declared adapter)",
    "badgeEnabled": true,
    "lastResult": { "passed": true, "violationCount": 0, "ranAt": "2026-09-25T10:00:00Z", "engine": "axe-core" }
  },
  "site": "path to docs-site/ config (Clone) or its Master Skill equivalent"
}
```

A missing or incomplete manifest fails with a clear error message — this tool never guesses a fallback structure. Every path/label field must be a non-empty string and `audit.badgeEnabled` a boolean; a wrong type is rejected with the field name, the expected type and the type received. If `site` points to a file that isn't valid JSON, the error names the `site` field, the manifest and that file. In every rejection case, no output is written.

### Compliance badge (ADR-100)

This tool never runs an audit. `audit.badgeEnabled` only decides whether a compliance line is shown; what it says comes from the optional `audit.lastResult`, written by an audit step that actually ran **before** generation (never by a stub or skeleton audit):

| `badgeEnabled` | `lastResult` | Rendered |
|---|---|---|
| `false` | any | "Compliance badge: disabled" — no claim |
| `true` | absent | "Compliance: **not verified** — no audit result recorded" |
| `true` | `passed: true` | "Compliance: **passed** — N violations, audited <ranAt> with <engine>" |
| `true` | `passed: false` | "Compliance: **failed** — N violation(s), audited <ranAt> with <engine>" |

`lastResult` is validated when present: `passed` boolean, `violationCount` integer ≥ 0, `ranAt` ISO 8601 date-time, `engine` non-empty string, and `passed: true` with `violationCount > 0` is rejected as contradictory.

## Output is never versioned

The generated output directory (`dist-docs/` by default) must **never be committed** to the personalized instance's repository. Add it to that project's `.gitignore`:

```
dist-docs/
```

This generator produces the site fresh on every invocation — it is not a build artifact meant to be checked in.
