# Pipeline: storybook

> Validation of component stories and consistency with the token system.
> **Status:** 🔜 Planned — non-blocking until activated
> **Trigger:** any change in `components/`

---

## Objective

Once activated, this pipeline:
1. Verifies that every component has a matching Storybook story
2. Runs the Storybook build to catch compilation errors
3. Validates that args/controls mirror the variants defined in `tokens/component.json`

---

## Commands (future)

```bash
# Build
npx storybook build

# Tests
npx storybook test
```

## Checks to implement

- [ ] Every `components/ds-[name].js` has a `stories/ds-[name].stories.js`
- [ ] Variants in the story match the variants in `component.json`
- [ ] Storybook build exit 0 (no errors)
- [ ] No hardcoded value imported in the stories

## Activation

1. Install: `npx storybook@latest init`
2. Configure for Web Components (Lit)
3. Change the status to `✅ Active`
4. ADR-009 is already planned — verify and activate
