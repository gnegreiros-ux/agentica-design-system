# Getting-Started Checklist

A checklist for a team feeding decisions it has already made (palette, type scale, spacing, etc.) into its Clone instance, so nothing gets missed. See `GUIDE.md` for the narrative explanation of each item below.

## Prerequisite — component architecture

- [ ] The Web Components (default) vs. framework-specific decision is already made and documented in an ADR (from the Master Skill's `00-component-architecture.md` phase) before personalization starts — if not, stop and settle this first.

## Visual foundations

### Color
- [ ] Primitives declared with values and names, roles assigned (primary, accent, secondary, etc.)
- [ ] The `feedback` semantic family is complete (success, error, warning, info) — not only the cases already hit
- [ ] Inverted surfaces, shadows, and decorative/illustration tokens covered, if the team uses them
- [ ] Dark mode: every semantic token has both a light and a dark value, if supported

### Typography
- [ ] Size scale declared (number of steps backed by a real audit, not an arbitrary number)
- [ ] Line-height rules defined for every step
- [ ] Letter-spacing scale defined, if needed
- [ ] Secondary/mono typeface(s) declared, if used
- [ ] Legibility/accessibility of the chosen typeface considered, not just its aesthetics

### Icons
- [ ] Icon library chosen and declared

### Spacing, radius, breakpoints
- [ ] Primitives declared for every category the core actually uses

- [ ] Every core semantic token in the categories above is mapped to a primitive in `theme/` — none left orphaned

## New semantic tokens (only if a category requires it)

- [ ] Real need confirmed (no existing core token already covers the case)
- [ ] New token declared in `theme/`, referencing only a primitive — never a hard-coded value
- [ ] Naming conforms to the core's taxonomy
- [ ] Validated by a human before use in any component (🛑, Rule 2)

## Governance & compliance

- [ ] Decision made on enabling the public compliance badge
- [ ] Audit adapter confirmed (axe-core by default, or a declared alternative)
- [ ] DTCG conformance confirmed for all token files
- [ ] Scheduled audit cadence defined, owner identified
- [ ] Repo language policy settled (documentation, ADRs, commits)
- [ ] Branch protection configured to match the team's actual size (solo vs. multiple people)
- [ ] Human-approved pre-commit pipeline in place for impactful changes
- [ ] UX reference sources confirmed for component review before publishing (e.g. NN/g, Brad Frost, Into Design Systems, or the team's own sources)
- [ ] *(If applicable — publishing/open-source)* Code and design-resource licenses declared, publishing strategy defined

## Agent config

- [ ] Project-specific trigger conditions added if needed, without narrowing the scope of the core's own conditions

## Docs-site

- [ ] Configuration filled in for the documentation generator

## Traceability

- [ ] An ADR written for every structural decision in this checklist (component architecture, scales, library choices, language policy, etc.)

## Final verification

- [ ] Lint/audit runs with no errors after adding these decisions
- [ ] Human review completed before the first documentation generation
