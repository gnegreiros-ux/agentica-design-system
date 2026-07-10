# Pipeline: wcag

> WCAG 2.2 AA compliance checklist to validate after any interface change.
> **Status:** ✅ Active
> **Trigger:** any change in `site/build.js`, `components/`, `tokens/` (colors)

---

## Triggers

| Modified file | Required checks |
|----------------|--------------|
| `tokens/primitives.json` (colors) | Contrast — full check |
| `tokens/semantic.json` (colors) | Contrast — full check |
| `site/build.js` (CSS) | Visible focus, touch targets |
| `components/*.js` | ARIA, focus, roles |
| New interactive component | Full checklist |

---

## WCAG 2.2 checks

### 1.4.3 — Normal text contrast ≥ 4.5:1 (AA)

Check text/background token pairs:

| Context | Token pair | Minimum |
|----------|----------------|---------|
| Body text | `text-primary` / `background-page` | 4.5:1 |
| Secondary text | `text-secondary` / `background-page` | 4.5:1 |
| Text on action | `text-on-action` / `action-primary` | 4.5:1 |
| Disabled text | `text-disabled` / `background-page` | 3:1 (large) |
| Inline code | `text-primary` / `background-subtle` | 4.5:1 |

Reference tool: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 1.4.11 — Non-text component contrast ≥ 3:1

- Input field borders vs. background
- Meaningful icons vs. background
- State indicators (badges, chips)

### 1.4.12 — Text spacing (AA)

The system must support, without loss of information:
- Line-height ≥ 1.5× the font size
- Paragraph spacing ≥ 2× the font size
- Letter-spacing ≥ 0.12× the size
- Word-spacing ≥ 0.16× the size

Our `reading` token (1.6) meets this criterion.

### 2.4.7 — Visible focus (AA)

Every interactive element must have an explicit `:focus-visible`:
```css
/* required */
:focus-visible {
  outline: 2px solid var(--agtc-semantic-color-border-focus);
  outline-offset: 2px;
}
```
Verify that `outline: none` or `outline: 0` is never used without a visible alternative.

### 2.4.11 — Focus not obscured (AA, new in WCAG 2.2)

Focus must not be entirely hidden by other content (sticky headers, modals).
Our fixed 60px header must leave focus visible on the elements beneath it.

### 2.5.3 — Label in accessible name

Any button whose `aria-label` contains visible text must include that text.

```html
<!-- ✅ -->
<button aria-label="Delete the folder">Delete</button>

<!-- ❌ -->
<button aria-label="Clear">Delete</button>
```

### 2.5.8 — Touch target size ≥ 24×24px (AA, new in WCAG 2.2)

Every interactive element must have a clickable area of at least 24×24px.
The system's buttons (`ds-button`) must meet this rule via their padding.

### Motion and animation

```css
/* Required for any animation */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## Partial report (example)

```
### 2. WCAG 2.2
- [x] text-primary / background-page: 14.7:1 ✓
- [x] text-secondary / background-page: 5.2:1 ✓
- [x] text-on-action / action-primary (#12A594): verify → [result]
- [x] Visible focus on ds-button (all variants)
- [x] Button touch targets ≥ 24×24px
- [ ] ⚠️ Verify focus on new component [name]
```
