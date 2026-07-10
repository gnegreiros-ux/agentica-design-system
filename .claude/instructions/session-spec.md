# Instruction: session-spec

> Condensed spec reloaded at every AI session — fast source of truth.
> **Type:** instruction
> **Logical path:** .claude/instructions/session-spec.md
> **Read before:** AGENTS.md, DESIGN.md
> **Relations:** tokens/semantic.json, tokens/component.json, guidelines/components/, decisions/

---

## System identity

| Field | Value |
|-------|-------|
| Name | Agentic design system |
| Acronym | sda |
| Author | Guilherme Negreiros |
| Version | 1.0.0 |
| CSS prefix | `--agtc-` |
| Governance | The human always has the final word |
| Stack | Lit (Web Components), Style Dictionary, axe-core, Storybook, Lucide Icons |

---

## Component inventory

| Component | Variants | Contract | Tokens | Status |
|-----------|-----------|---------|--------|--------|
| `ds-button` | primary, secondary, ghost, critical | `guidelines/components/button.md` | `component.json#button` | ✅ agent-ready |
| `ds-icon` | size: inline, control, nav | `guidelines/components/icon.md` | `semantic.json#icon` | ✅ agent-ready |

> Update this table with every new component.

---

## Semantic tokens — quick reference

| Intent | Token | Level |
|-----------|-------|--------|
| Primary action | `color.action.primary` | semantic |
| Action hover | `color.action.primary-hover` | semantic |
| Danger / destructive | `color.feedback.danger` | semantic |
| Text on action | `color.text.on-action` | semantic |
| Primary text | `color.text.primary` | semantic |
| Page background | `color.background.page` | semantic |
| Focus border | `color.border.focus` | semantic |
| Control horizontal padding | `space.control.padding-x` | semantic |
| Control vertical padding | `space.control.padding-y` | semantic |
| Control internal gap | `space.control.gap` | semantic |
| Spacing between sections | `space.layout.section` | semantic |
| Spacing between components | `space.layout.component` | semantic |
| Control radius | `radius.control` | semantic |
| Primary font | `typography.fontFamily` | semantic |
| Inline icon size | `icon.size.inline` | semantic |
| Control icon size | `icon.size.control` | semantic |
| Navigation icon size | `icon.size.nav` | semantic |

> Complete source of truth: `tokens/semantic.json`

---

## Dimensional grid — 4px scale

| Primitive token | Value | Usage |
|----------------|--------|-------|
| `primitive.space.1` | 4px | Micro — separator |
| `primitive.space.2` | 8px | Small — vertical padding |
| `primitive.space.3` | 12px | Intermediate |
| `primitive.space.4` | 16px | Standard — horizontal padding |
| `primitive.space.5` | 20px | Medium |
| `primitive.space.6` | 24px | Large intermediate |
| `primitive.space.8` | 32px | Large |
| `primitive.space.10` | 40px | Very large |
| `primitive.space.12` | 48px | Macro |
| `primitive.space.16` | 64px | Macro — sections |

> Every spacing value must be a multiple of 4px. Never a value outside the scale.

---

## Critical rules — agent cheat sheet

```
❌ Never a hardcoded value (hex, raw px, rem)
❌ Never a primitive token inside a component
❌ Never an invented variant (outside component.json)
❌ Never a merge without human approval
❌ Never a semantic icon without a label or decorative flag
✅ Always via var(--agtc-[token])
✅ Always visible :focus-visible
✅ Always appropriate aria-*
✅ Escalate if in doubt about an action's impact
```

---

## Allowed variants per component

### ds-button
`primary` | `secondary` | `ghost` | `critical`

> ⚠️ `critical` requires `requiresConfirmation: true` in the token + a confirmation pattern in the interface.

### ds-icon
`size="inline"` (16px) | `size="control"` (20px) | `size="nav"` (24px)

> ⚠️ If the icon is the only visible information, `label` is required. If it accompanies text, use `decorative`.

---

## Governance — approval levels

| Action | Who | Approval |
|--------|-----|-------------|
| Modify primitive token | Dev / agent | Principal Designer |
| Add semantic token | Dev / agent (PR) | Design System Lead |
| Modify component token | Human only | Principal Designer |
| Delete token | Human only | Principal Designer + impact audit |
| Add component | Dev / agent (PR) | Design System Lead + Principal Designer |

---

## Active architectural decisions

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | 3-level token architecture (primitive → semantic → component) | ✅ Active |
| ADR-002 | Choice of Lit for Web Components | ✅ Active |
| ADR-003 | Choice of Style Dictionary for token compilation | ✅ Active |
| ADR-004 | Human governance: the human always has the final word | ✅ Active |
| ADR-005 | Replacement of the `danger` variant with `critical` | ✅ Active |
| ADR-006 | Choice of Chromatic for visual regression testing | ✅ Active |
| ADR-007 | Choice of axe-core for accessibility testing | ✅ Active |
| ADR-008 | Choice of Radix UI Colors for the primitive palette | ✅ Active |
| ADR-009 | Choice of Storybook for component documentation | ✅ Active |
| ADR-010 | Choice of Playwright for E2E and accessibility testing | ✅ Active |
| ADR-011 | Choice of Tokens Studio for Figma ↔ JSON sync | ✅ Active |
| ADR-012 | Drift detection via audit script (audit-tokens.js) | ✅ Active |
| ADR-013 | DESIGN.md as a portable contract versioned with the code | ✅ Active |
| ADR-014 | Choice of Conventional Commits for commit messages | ✅ Active |
| ADR-015 | ADR reminder hook in AI sessions | ✅ Active |
| ADR-016 | Build log (log/kit-construction.md) | ⚠️ Replaced by ADR-069 |
| ADR-017 | text.disabled contrast fix (4.54:1 WCAG AA) | ✅ Active |
| ADR-018 | Migration of primitive references to Radix notation | ✅ Active |
| ADR-019 | Dynamic token resolution in the build | ✅ Active |
| ADR-020 | 4px grid as the systemic dimensional scale | ✅ Active |
| ADR-021 | Atkinson Hyperlegible as the primary font | ✅ Active |
| ADR-022 | Lucide Icons as the icon library | ✅ Active |

> Full folder: `decisions/`

---

## Deprecated tokens

No deprecated tokens as of this writing.

> Keep this table up to date at every TCR. See `tokens/deprecated.md` once that file exists.

---

## Last updated

Date: 2026-05-29
Modified by: Guilherme Negreiros
Reason: Added fontFamily, iconSize, extended space tokens (4px grid) — ADR-020/021/022. Updated prefix --ds- → --agtc-. Added ds-icon to the component inventory. Completed ADRs 015-022.
