# Component: Tabs — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-12
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/tabs.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-056-agtc-tabs-implementation.md, guidelines/components/segmented.md, DESIGN.md

---

## Intent

**Why this component exists:**
Display several content sections in the same space, accessible via horizontal tabs.
Each tab is associated with a content panel — the user chooses which section to read.

**This component is not:**
- An immediate-effect setting (`agtc-segmented`) — no panel, 2-5 short options
- A form radio group (`agtc-radio-group`)
- A dropdown menu

---

## Distinction from `agtc-segmented`

| | `agtc-tabs` | `agtc-segmented` |
|---|-------------|------------------|
| Effect | Displays a **content panel** | **Immediate setting** (language, density…) |
| ARIA | `role="tablist"` + `tabpanel` | `role="group"` + `aria-current` |
| Keyboard | **Arrows** + roving tabindex | Native **Tab** between segments |
| Usage | Doc-chrome navigation, sections | Language switch, list/grid view |

---

## Properties

| Attribute / Property | Type | Default | Description |
|----------------------|------|--------|-------------|
| `.tabs` | Array | `[]` | `[{ value, label, href? }]` — list of tabs |
| `selected` | String | First without href | Value of the active tab |
| `label` | String | — | **aria-label of the tablist (required for AT)** |
| `activation` | String | `"auto"` | `"auto"` (arrows activate) or `"manual"` (Enter required) |

Emits **`change`** (`detail: { value }`) on in-page tab change.

**Slots:** one named slot per in-page tab value (without `href`).

```html
<agtc-tabs label="Button Documentation" selected="overview">
  <div slot="overview">Overview content</div>
  <div slot="tokens">Tokens content</div>
</agtc-tabs>
<script>
  document.querySelector('agtc-tabs').tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'tokens',   label: 'Tokens' },
  ];
</script>
```

**Tab with an external link (`href`):**
```js
{ value: 'storybook', label: 'Storybook ↗', href: 'https://…' }
```
→ Rendered as `<a role="tab">`, no associated slot.

---

## States

| State | Behavior |
|------|-------------|
| Default | Inactive tab — `color.text.secondary` |
| Hover | `color.text.primary` |
| Active (selected) | `color.action.primary` · 2px bottom indicator · `font-weight: 700` |
| Focus | 2px offset `border.focus` ring |
| Visited | Identical to Default — ADR-047 (no-visited-nav) |

---

## Keyboard

| Key | Effect |
|--------|-------|
| `ArrowRight` | Focus next tab (circular). Activates if `activation="auto"` |
| `ArrowLeft` | Focus previous tab (circular). Activates if `activation="auto"` |
| `Home` | Focus first tab |
| `End` | Focus last tab |
| `Enter` / `Space` | Activates the focused tab (always) |
| `Tab` | Exits the tab group to the active panel |

---

## Accessibility

- `role="tablist"` + `aria-label` on the container
- `role="tab"` + `aria-selected` + `aria-controls` on each tab
- `role="tabpanel"` + `aria-labelledby` on each panel
- Roving tabindex: active tab `tabindex="0"`, others `tabindex="-1"`
- Tokenized `:focus-visible` (`border-focus`)
- `:visited` neutralized (ADR-047)
- Active text contrast (teal on white): 5.14:1 ✅ WCAG AA

---

## Absolute rules

```
✅ Always a label on the tablist (label="…" attribute)
✅ Minimum 2 tabs — a single tab is not a tabs component
✅ Labels in natural case (never ALL-CAPS)
✅ The tablist is positioned ABOVE the panel
✅ :visited neutralized (no-visited-nav rule ADR-047)
❌ Never use tabs for an immediate-effect setting without a panel (→ agtc-segmented)
❌ Never a hardcoded value (always via token)
```

---

## Component tokens

| CSS token | Semantic reference |
|-----------|---------------------|
| `--agtc-component-tabs-default-tab-text` | `semantic.color.text.secondary` |
| `--agtc-component-tabs-default-tab-text-hover` | `semantic.color.text.primary` |
| `--agtc-component-tabs-default-tab-text-active` | `semantic.color.action.primary` |
| `--agtc-component-tabs-default-indicator` | `semantic.color.action.primary` |
| `--agtc-component-tabs-default-border` | `semantic.color.border.default` |
| `--agtc-component-tabs-default-border-focus` | `semantic.color.border.focus` |
| `--agtc-component-tabs-default-padding-x` | `semantic.space.control.padding-x` |
| `--agtc-component-tabs-default-padding-y` | `semantic.space.control.padding-y` |

---

## UX Patterns Reference

| Pattern | Source (link) | Applied | Justification |
|---------|---------------|----------|---------------|
| Tablist above the panel | [NN/g — Tabs Used Right](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Maximum content discoverability |
| In-page tabs (instant change) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Keeps the user in place |
| Automatic activation on focus | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Preloaded content — APG recommends auto |
| ARIA tablist/tab/tabpanel | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Standard accessibility pattern |
| Arrows + Home/End + roving tabindex | [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | ✅ | Compliant keyboard navigation |
| Labels in natural case | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Readability — never ALL-CAPS |
| `:visited` neutralized | [ADR-047](decisions/ADR-047-no-visited-nav.md) | ✅ | System rule — navigation |
| Optional `href` (navigation tabs) | [NN/g](https://www.nngroup.com/articles/tabs-used-right/) | ✅ | Mixed in-page + external link tabs |
