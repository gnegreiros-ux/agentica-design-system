# Component: Segmented — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-04
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/segmented.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-044-agtc-segmented-implementation.md, guidelines/components/radio.md, guidelines/components/toggle.md, DESIGN.md

---

## Intent

**Why this component exists:**
Choose **one** option among 2 to 5, with an **immediate effect**, in a compact control (connected
segments). Formalizes the site's FR/EN language switch (~114 usages).

**This component is not:**
- A form radio group (`agtc-radio-group`) — submitted with the form, arrow-key navigation
- An on/off switch (`agtc-toggle`)
- Content tabs (`tablist`) — which change a panel
- A dropdown menu (beyond 5 options → `select`)

---

## Distinction from `agtc-radio-group`

| | `agtc-segmented` | `agtc-radio-group` |
|---|------------------|--------------------|
| Effect | **Immediate** | Submitted with the form |
| ARIA | `<button>` group + `aria-current` | `role="radiogroup"` + `role="radio"` |
| Keyboard | **Tab** between segments (native) | **Arrows** + roving tabindex |
| Usage | Setting / view (density, language, list/grid) | Form choice (plan, title) |

> **Deliberate** pattern deviation (Primer): a segmented control with immediate effect must not be a radiogroup.

---

## Properties

| Attribute / Property | Type | Default | Description |
|----------------------|------|--------|-------------|
| `.options` | Array | `[]` | `[{ value, label, icon? } \| "Label"]` |
| `value` | String | — | Selected value (always exactly one) |
| `label` | String | — | **Group aria-label (required)** |
| `equal-width` | Boolean | `false` | Equal-width segments |

Emits **`change`** (`detail: { value }`) on every selection.

---

## Tokens used

| Role | Token |
|------|-------|
| Track background | `component.segmented.default.track-background` |
| Segment text | `component.segmented.default.text` |
| Hover text | `component.segmented.default.text-hover` |
| Selected segment background | `component.segmented.default.selected-background` |
| Selected segment text | `component.segmented.default.selected-text` |
| Focus ring | `component.segmented.default.border-focus` |
| Radius | `component.segmented.default.radius` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Role | `role="group"` + `aria-label` on the track |
| Selected segment | `aria-current="true"` (others `false`) |
| Keyboard | Native `<button>` — Tab between segments, Enter/Space to activate |
| Selected state | Not by color alone: solid background + `700` weight (WCAG 1.4.1) |
| Focus | Tokenized `:focus-visible` per segment (WCAG 2.4.7) |

---

## Behaviors

- **Immediate effect** — the selection applies on click/activation (emits `change`).
- **Always one active** — no empty state.
- **2 to 5 short options**; beyond that, prefer `select` or tabs.

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| `role="radiogroup"` + arrows on an immediate-effect control | Wrong pattern (implies submission) — Primer |
| `role="tablist"` if it doesn't change a content panel | Incorrect semantics |
| More than 5 options or long labels | Unreadable — use `select` |
| Selected state by color alone | WCAG 1.4.1 |
| No `label` | Unnamed group for AT |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036/044). Decision: **SG1–SG8 all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Single selection, always one active | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | No empty state |
| `<button>` group + `aria-current` + immediate effect | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Deliberate deviation from radiogroup |
| 2–5 options, short labels | NN/g | ✅ | Documented guidance |
| Selected not by color alone | [WCAG 1.4.1](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | ✅ | Solid background + weight 700 |
| Immediate effect (no "apply") | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Emits `change` |
| `:focus-visible` per segment, native Tab | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Native buttons |
| Equal-width segments, icon + label | NN/g | ✅ | `equal-width`, `icon` optional |
| `value` API + `change` event | [Primer](https://primer.style/product/components/segmented-control/accessibility/) | ✅ | Integration |

---

## Implementation

### Component (Lit, data-driven)
```html
<agtc-segmented label="Language" value="fr"></agtc-segmented>
<script>
  const s = document.querySelector('agtc-segmented');
  s.options = [{ value: 'fr', label: 'FR' }, { value: 'en', label: 'EN' }];
  s.addEventListener('change', (e) => setLanguage(e.detail.value));
</script>
```

### Class (static site HTML)
```html
<div class="agtc-segmented" role="group" aria-label="Language">
  <button type="button" aria-current="true">FR</button>
  <button type="button" aria-current="false">EN</button>
</div>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a multi-select mode | Principal Designer + Tech Lead + new ADR |
| Modifying a token | Principal Designer |
| Changing the ARIA pattern | Principal Designer + accessibility review |
| Accessibility bug fix | Design system team review |
