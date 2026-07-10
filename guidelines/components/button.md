# Component: Button — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: [DATE]
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/button.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, .claude/rules/components/button.md
> **Relations:** tokens/component.json, .claude/rules/components/button.md, DESIGN.md

---

## Intent

**Why this component exists:**
Allow the user to trigger an action in the interface.

**This component is not:**
- A navigation link (use `<a>` or `<ds-link>`)
- A toggle (use `<ds-toggle>`)
- A dropdown menu (use `<ds-dropdown>`)

---

## Allowed variants

| Variant | Usage | When to use |
|----------|-------|----------------|
| `primary` | Main action of the page | Only one per context |
| `secondary` | Secondary action | Lower-priority alternative |
| `ghost` | Tertiary action or navigation | Low visual hierarchy contexts |
| `critical` | Irreversible or destructive action | Deletion, permanent cancellation |

**Absolute rule:** Never use `primary` for an irreversible action. Always use `critical`.

---

## Tokens used

> The component consumes **component tokens** (`component.button.*`), never semantic
> tokens directly — see `tokens-system.md` (level 3 = institutional contract).

| Property | Component token | Semantic reference |
|-----------|-----------------|----------------------|
| Primary background | `component.button.primary.background` | `semantic.color.action.primary` |
| Primary background hover | `component.button.primary.background-hover` | `semantic.color.action.primary-hover` |
| Primary background disabled | `component.button.primary.background-disabled` | `semantic.color.action.primary-disabled` |
| Critical background | `component.button.critical.background` | `semantic.color.feedback.danger` |
| Primary text | `component.button.primary.text` | `semantic.color.text.on-action` |
| Secondary background | `component.button.secondary.background` | `transparent` |
| Secondary border | `component.button.secondary.border` | `semantic.color.action.primary` |
| Ghost background | `component.button.ghost.background` | `transparent` |
| Padding X | `component.button.primary.padding-x` | `semantic.space.control.padding-x` |
| Padding Y | `component.button.primary.padding-y` | `semantic.space.control.padding-y` |
| Radius | `component.button.primary.radius` | `semantic.radius.control` |
| Label size | `component.button.font-size` | `semantic.typography.label-bold.size` (14px) |
| Label weight | `component.button.font-weight` | `semantic.typography.label-bold.weight` (Bold — CTA emphasis, distinct from medium `label.weight`) |

States without a dedicated component token (e.g. `disabled` for secondary/critical/ghost)
fall back to generic semantic tokens — this is expected, not a bug.

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Minimum contrast | 4.5:1 (WCAG AA) |
| Keyboard navigation | Visible focus required |
| Icon-only button | `aria-label` required |
| Disabled state | `disabled` + `aria-disabled="true"` |
| Loading state | `aria-busy="true"` + alternative text |

---

## Behaviors and states

| State | Behavior |
|------|-------------|
| Default | Standard appearance |
| Hover | Darkened background via hover token |
| Focus | Visible focus ring (border.focus) |
| Active | Slight visual compression |
| Loading | Spinner + `aria-busy` + "Loading…" text |
| Disabled | Reduced opacity + not clickable |

### Special rules — `critical` variant
- **Explicit confirmation required** before execution
- **Double-click prevention** enabled automatically
- **Audit log**: every click is recorded
- **Explicit label**: describe the consequence, not just the action
  - ✅ "Permanently delete the folder"
  - ❌ "Delete"

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| Two `primary` buttons in the same context | Ambiguous hierarchy |
| `primary` button for a destructive action | Risk of confusion |
| Generic label ("OK", "Confirm") | Not accessible |
| Button without visible text and without `aria-label` | Inaccessible |
| Hardcoded color in the style | Bypasses the design system |
| Disabling a button without indicating why | The user doesn't understand why the action is blocked (see pattern B4) |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036). Decision: **all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| A single clear primary action per context | [IxDF — clear primary action](https://ixdf.org/literature/topics/ui-design-patterns) | ✅ | Readable action hierarchy |
| Explicit confirmation for destructive action (`critical`) | [NN/g — error prevention](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `requires-confirmation` |
| Width preserved during `loading` | [Smashing](https://www.smashingmagazine.com/category/design-patterns/) | ✅ | No layout jump |
| **Never disable without indicating why** (prefer a motivated `disabled` over hiding the action) | [Smashing — hidden vs disabled](https://www.smashingmagazine.com/category/design-patterns/) | ✅ | A silent `disabled` is an accessibility anti-pattern — provide help text/tooltip explaining the block |
| Label describing the consequence, not "OK" | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | Explicit label |

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a new variant | Principal Designer + Tech Lead |
| Modifying a component token | TCR + Principal Designer |
| Changing critical behavior | Principal Designer + Security |
| Accessibility bug fix | Design system team review |

---

## Implementation

### Web Component (Lit)
```html
<!-- Primary -->
<agtc-button variant="primary">Submit request</agtc-button>

<!-- Secondary -->
<agtc-button variant="secondary">Cancel</agtc-button>

<!-- Critical — confirmation required -->
<agtc-button variant="critical" requires-confirmation>
  Permanently delete the folder
</agtc-button>

<!-- Ghost -->
<agtc-button variant="ghost">Learn more</agtc-button>

<!-- Loading -->
<agtc-button variant="primary" loading>Loading…</agtc-button>

<!-- Disabled -->
<agtc-button variant="primary" disabled aria-disabled="true">
  Not available
</agtc-button>

<!-- Icon only — aria-label required -->
<agtc-button variant="ghost" aria-label="Close panel">
  <agtc-icon name="close"></agtc-icon>
</agtc-button>
```

### Angular
```html
<agtc-button variant="critical" (ds-confirm)="onDeleteConfirmed()">
  Permanently delete the folder
</agtc-button>
```

### React
```jsx
<DsButton variant="primary" onClick={handleSubmit}>
  Submit request
</DsButton>
```
