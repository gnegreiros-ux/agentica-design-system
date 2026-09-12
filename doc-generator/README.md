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
  "audit": { "engine": "axe-core (or a declared adapter)", "badgeEnabled": true },
  "site": "path to docs-site/ config (Clone) or its Master Skill equivalent"
}
```

A missing or incomplete manifest fails with a clear error message — this tool never guesses a fallback structure.

## Output is never versioned

The generated output directory (`dist-docs/` by default) must **never be committed** to the personalized instance's repository. Add it to that project's `.gitignore`:

```
dist-docs/
```

This generator produces the site fresh on every invocation — it is not a build artifact meant to be checked in.
