# Component: Table — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-03
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/table.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-040-agtc-table-implementation.md, DESIGN.md

---

## Intent

**Why this component exists:**
Present tabular data in a readable, scannable, and accessible way, **read-only**.
It is the most used component on the site (token tables: token → reference → value → intent).

**This component is not:**
- An interactive editable table (inline editing → future, out of v1)
- A data grid with sort/filter/pagination (open door, not implemented — see ADR-040)
- A layout mechanism (do not use a table to arrange non-tabular elements)

---

## Architecture — the "mix" (ADR-040)

Two forms consuming **the same tokens** `component.table.*`:

| Form | Usage | Rendering |
|-------|-------|-------|
| **Component** `<agtc-table>` (data-driven) | Apps, JS contexts, Storybook | Semantic `<table>` in shadow DOM, from `.columns`/`.rows` |
| **Class** `.agtc-table` on a real `<table>` | Static site (HTML without JS) | Styling of a hand-written light DOM `<table>` |

> The site remains resilient static HTML (no JS dependency to display a table);
> apps benefit from a data-driven API. Single source of tokens.

---

## Properties (`<agtc-table>` component)

| Attribute / Property | Type | Default | Description |
|----------------------|------|--------|-------------|
| `.columns` | Array | `[]` | `[{ label, align?, width?, key? } \| "Label"]` — `align`: `start` (default) / `end` / `center` |
| `.rows` | Array | `[]` | `[["a","b"], …]` (positional) or `[{ key: value }, …]` |
| `caption` | String | — | **Recommended** — accessible caption (WCAG 1.3.1) |
| `caption-hidden` | Boolean | `false` | Visually hides the caption, keeps it for AT |
| `striped` | Boolean | `false` | Zebra striping (otherwise: row separators) |
| `sticky-header` | Boolean | `false` | Header pinned on vertical scroll |
| `density` | String | `compact` | `compact` or `comfortable` |

---

## Tokens used

| Role | Token |
|------|-------|
| Header background | `component.table.default.header-background` |
| Header text | `component.table.default.header-text` |
| Cell text | `component.table.default.cell-text` |
| Border / separators | `component.table.default.border` |
| Row hover | `component.table.default.row-hover` |
| Zebra striping | `component.table.default.stripe` |
| Caption text | `component.table.default.caption-text` |
| Radius (container) | `component.table.default.radius` |
| Font size | `component.table.default.font-size` |
| Horizontal padding | `component.table.padding-x` |
| Compact vertical padding | `component.table.padding-y-compact` |
| Comfortable vertical padding | `component.table.padding-y-comfortable` |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Semantic structure | Real `<table>` / `<thead>` / `<tbody>` — never a `<div>` simulating a table |
| Cell↔header association | `scope="col"` on every `<th>` |
| Table description | `<caption>` (visible or hidden via `caption-hidden`) — WCAG 1.3.1 |
| Numeric alignment | Value columns right-aligned (`align="end"`) — vertical scanning |
| Text/background contrast | 4.5:1 minimum (WCAG AA) — gray.12 text on white/gray.3 |
| Horizontal scroll | Keyboard-focusable container, visible overflow indicator |

---

## Behaviors

- **Read-only** — no cell interaction by default.
- **Row hover** (`row-hover`) to keep track of your row on wide tables.
- **Row separators** by default; **zebra striping** optional (`striped`).
- **Overflow**: `overflow-x:auto` container with edge shadows signaling hidden content.

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| `<div>` styled as a grid for tabular data | Inaccessible to screen readers |
| `<th>` without `scope` | Cell↔header association lost |
| Table without `caption` or `aria-label` | Missing context for AT (WCAG 1.3.1) |
| Numeric values left-aligned | Harder vertical comparison |
| Table used for layout | Misuses the semantics |
| Hardcoded color/spacing | Bypasses the tokens |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036/040). Decision: **T1–T10 all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Semantic HTML + `scope="col"` | [Smashing — Table Patterns](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Cell↔header association (missing from the site's original HTML) |
| `<caption>` describing the table | [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Hideable via `caption-hidden` (WCAG 1.3.1) |
| Text alignment left, numeric right | [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/) | ✅ | `align` per column, default `start` |
| Row separators (zebra striping optional) | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ | Separators by default, `striped` optional — user choice |
| Row hover | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ | `row-hover` |
| Sticky header | [NN/g](https://www.nngroup.com/articles/data-tables/) · [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | Optional via `sticky-header` |
| Horizontal scroll + overflow indicator | [Smashing](https://www.smashingmagazine.com/2019/01/table-design-patterns-web/) | ✅ | `overflow-x` container + edge shadows (long token names) |
| 1st column = readable identifier, order = importance | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ | Token table convention |
| `compact` density by default | [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | `density="comfortable"` available |
| Sort / filter / pagination | [NN/g](https://www.nngroup.com/articles/data-tables/) | ✅ (open door) | **Out of v1**: static docs tables; `columns`/`rows` API designed to accommodate them without breaking changes (future `column.sortable` + `@sort`) |

---

## Implementation

### Component (Lit, data-driven)
```html
<agtc-table caption="Badge component tokens" caption-hidden></agtc-table>
<script>
  const t = document.querySelector('agtc-table');
  t.columns = [
    { label: 'CSS token', align: 'start', width: '46%' },
    { label: 'Reference', align: 'start' },
    { label: 'Value',    align: 'end' },
  ];
  t.rows = [
    ['--agtc-badge-neutral-background', 'semantic.color.background.subtle', '#f0f0f0'],
    ['--agtc-badge-neutral-text',       'semantic.color.text.secondary',    '#646464'],
  ];
</script>
```

### Class (static HTML, light DOM)
```html
<table class="agtc-table">
  <caption class="visually-hidden">Badge component tokens</caption>
  <thead>
    <tr><th scope="col">CSS token</th><th scope="col">Reference</th><th scope="col" class="num">Value</th></tr>
  </thead>
  <tbody>
    <tr><td><code>--agtc-badge-neutral-background</code></td><td>semantic.color.background.subtle</td><td class="num">#f0f0f0</td></tr>
  </tbody>
</table>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding a feature (sort, filter, pagination) | Principal Designer + Tech Lead + new ADR |
| Modifying a token | Principal Designer |
| Changing the default density | Design system team |
| Accessibility bug fix | Design system team review |
