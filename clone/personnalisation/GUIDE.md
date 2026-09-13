# Personalization Guide

This is the only directory a team modifies when adopting the Clone. `core/` (see `../core/README.md`) is never touched, by a team, an update, or an agent acting on its behalf.

Each section below covers one subfolder: what it's for, and a concrete example — the full example lives in that subfolder's `example.md`.

## branding/

Where the team declares primitive tokens specific to its own brand: colors (with roles), type scale, secondary/mono typefaces, icon library, spacing/radius/shadow scales, decorative tokens, and dark-mode values if supported. A primitive declared here stays a primitive — Rule 4 still applies. See `branding/example.md`.

## theme/

Where a core semantic token gets mapped to a branding primitive — semantic → primitive, never the other way. Also where the team extends the semantic vocabulary when a real need isn't covered by any core token, always referencing a primitive and never a hard-coded value. See `theme/example.md`.

## governance/

Where the team makes its governance choices: whether to show the public compliance badge, which audit adapter to use, DTCG conformance, audit cadence, language policy, branch protection sized to the team, the pre-commit approval pipeline, UX pattern review sources, and — if applicable — publishing/licensing decisions. See `governance/example.md`.

## agent-config/

Where the team adds project-specific agent trigger conditions, without narrowing anything already defined in `core/`. See `agent-config/example.md`.

## docs-site/

Where the team configures what the documentation generator reads at generation time. This configuration is never versioned in the generated output. See `docs-site/example.md`.

---

## What stays non-negotiable even here

Being inside the personalization zone never means everything is permitted. The following, from `GOVERNANCE.md`, apply here exactly as they apply in `core/`:

1. **WCAG 2.2 AA compliance, minimum** — every component, page, or artifact this personalization touches must still meet it.
2. **The final word always belongs to a human** — no agent applies a structural or governance change here without explicit human validation.
3. **Never hard-coded style** — every primitive declared in `branding/` still needs a name; nothing in `core/` ever consumes a raw value.
4. **Never consume a primitive token directly** — a component reaches a primitive only through a semantic token in `theme/`, never around it.

See `GOVERNANCE.md` for the full statement, rationale, and verification method for each rule.
