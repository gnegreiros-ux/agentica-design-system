# Component: Code Block — Full Contract

> Version: 1.0.0
> Owner: design-system-team
> Last updated: 2026-06-03
> Any modification requires Principal Designer approval.
> **Type:** contract
> **Logical path:** guidelines/components/code-block.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-041-agtc-code-block-implementation.md, decisions/ADR-028-atkinson-hyperlegible-mono.md, DESIGN.md

---

## Intent

**Why this component exists:**
Display a **read-only**, copyable code snippet with a language indicator, on a
dark surface. Present on nearly every component and ADR page of the site (71 `code-block` usages).

**This component is not:**
- A code editor (read-only — no input)
- An interactive terminal
- A blockquote (`<blockquote>`) or a callout (`<agtc-banner>`)

---

## Architecture — the "mix" (ADR-041)

| Form | Usage | Rendering |
|-------|-------|-------|
| **Component** `<agtc-code-block>` | Apps, JS contexts, Storybook | Code via `<slot>`, language + copy button built in (shadow DOM) |
| **Class** `.code-block` on `<pre>` | Static site | `<pre class="code-block">` styled via tokens, copy button added by `site.js` |

> Both consume the same `component.code-block.*` tokens and the `semantic.typography.mono` font.

---

## Properties (`<agtc-code-block>` component)

| Attribute | Type | Default | Description |
|----------|------|--------|-------------|
| `language` | String | — | Displayed language indicator (`html`, `json`, `css`, `javascript`…) |
| `filename` | String | — | Optional header — file name / snippet title |
| `copy-label` | String | `Copy` | Copy button label |
| `copied-label` | String | `Copied!` | Label after a successful copy |

Code is provided via the default **slot** (HTML already escaped by the author).

---

## Tokens used

| Role | Token |
|------|-------|
| Block background (dark) | `component.code-block.default.background` |
| Code text | `component.code-block.default.text` |
| Metadata (language, file) | `component.code-block.default.meta-text` |
| Copy button background | `component.code-block.default.copy-background` |
| Button background on hover | `component.code-block.default.copy-background-hover` |
| Copy button text | `component.code-block.default.copy-text` |
| Focus ring | `component.code-block.default.border-focus` |
| Radius | `component.code-block.default.radius` |
| Font size | `component.code-block.default.font-size` |
| Horizontal / vertical padding | `component.code-block.default.padding-x` / `padding-y` |
| Monospace font | `semantic.typography.mono.family` (ADR-028) |
| Code body line height | `semantic.typography.detail.line-height` |
| Language indicator weight | `semantic.typography.label.weight` |
| Language indicator letter spacing | `semantic.typography.letter-spacing.wide` (ADR-067) |

---

## Accessibility — non-negotiable

| Rule | Value |
|-------|--------|
| Semantics | Real `<pre><code>` — never `<div>`s |
| Copy button | Real `<button>`, keyboard reachable, visible `:focus-visible` |
| Button label | Explicit `aria-label` (language included) |
| Copy feedback | Announced to AT via `role="status"` + `aria-live="polite"` |
| Long lines | Horizontal scroll (`overflow-x:auto`) — never a wrap that breaks the code |
| Contrast | gray.4 text on gray.12 (≥ 13:1); button and language ≥ 4.5:1 |

---

## Behaviors

- **Read-only** — the code cannot be edited.
- **Copy**: click → `navigator.clipboard.writeText()` → "Copied!" label for 1.6s → AT announcement.
- **Horizontal scroll** for long lines, the block never overflows the page.

---

## Anti-patterns

| Avoid | Reason |
|----------|--------|
| `<div>`s styled as code | Inaccessible, no `<pre><code>` semantics |
| Copy button without `aria-label` or focus | Unusable via keyboard / screen readers |
| Copy without announced feedback | The AT user doesn't know it worked |
| Forced wrapping of long lines | Breaks the code structure |
| Hardcoded color/font | Bypasses tokens |

---

## UX Patterns Reference

> Patterns approved via the `ux-pattern-review` workflow (ADR-036/041). Decision: **CD1–CD9 all approved**.

| Pattern | Source | Applied | Justification |
|---------|--------|----------|---------------|
| Semantic `<pre><code>` + language class | [DEV — copy code button](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8) | ✅ | Slot for the code |
| Copy button + text feedback | [roboleary](https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog) | ✅ | `Copy` → `Copied!` |
| Accessible copy button (aria-label, focus-visible) | [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) | ✅ | Fixes the site's previous unlabeled, French-only button |
| Success announced to AT (`role="status"` / `aria-live`) | [Sara Soueidan](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/) | ✅ | Polite live region |
| Language indicator | [DEV](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8) | ✅ | `language` attribute |
| Horizontal scroll for long lines | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ | `overflow-x:auto` |
| Syntax highlighting (WCAG contrast) | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ✅ (deferred) | **Out of v1 scope**: high-contrast plain text with no dependency; API ready for future highlighting |
| Header (file name / title) | [DEV](https://dev.to/whitep4nth3r/how-to-build-a-copy-code-snippet-button-and-why-it-matters-3en8) | ✅ | Optional `filename` attribute |
| Line numbers | [NN/g](https://www.nngroup.com/articles/design-pattern-guidelines/) | ❌ | Out of v1 scope — visual noise; may be added later if needed |

---

## Implementation

### Component (Lit, slotted)
```html
<agtc-code-block language="html" filename="example.html">
  <code>&lt;agtc-badge variant="success"&gt;Validated&lt;/agtc-badge&gt;</code>
</agtc-code-block>
```

### Class (static site HTML)
```html
<pre class="code-block"><code class="lang-html">&lt;agtc-badge variant="success"&gt;Validated&lt;/agtc-badge&gt;</code></pre>
```

---

## Governance

| Action | Approval required |
|--------|-------------------|
| Adding syntax highlighting / line numbers | Principal Designer + Tech Lead + new ADR |
| Modifying a token | Principal Designer |
| Theme change (dark → light) | Principal Designer |
| Accessibility bug fix | Design system team review |
