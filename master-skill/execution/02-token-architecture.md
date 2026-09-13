# Phase 02 — Token architecture

> Depends on Phase 01 (`GOVERNANCE.md` written and confirmed).

## What to do

1. Establish the three-layer token structure:
   - **Primitive** — raw values (a specific color, a specific pixel size), with no meaning attached. Example shape: `color.blue.500`, `space.4`.
   - **Semantic** — an intent, mapped to a primitive. Example shape: `color.text.danger` → `color.red.600`.
   - **Component** — a component-specific reference to a semantic token, never to a primitive directly. Example shape: `button.background.default` → `color.surface.accent`.
2. Verify that this structure makes it structurally impossible for a component to reference a primitive directly — this is Rule 4 of the non-negotiable foundation, and it should be enforced by the schema itself, not only by a lint running after the fact (the lint from Phase 03 is a second line of defense, not the only one).
3. Provide the target project with a generic naming schema template — stay generic. Do not carry over specific palette names, brand values, or category lists from any prior project; the target project's actual values belong in its own personalization/configuration layer, not in this skill.

## 🛑 Stop point

Present the proposed token structure (the three layers, the naming schema, and how they connect) to the human before creating any token file in the target project. Wait for explicit confirmation. Do not proceed to Phase 03 until the structure is confirmed.
