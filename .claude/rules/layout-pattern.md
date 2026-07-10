# Rule: layout-pattern

> A single layout pattern for every page on the site. Non-negotiable.
> **Type:** rule
> **Logical path:** .claude/rules/layout-pattern.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/rules/code-style.md, .claude/rules/development.md, site/build.js (layout function)

---

## Absolute rule

> **Every page on the site uses the `layout()` function from `site/build.js`.**
> There is only one layout pattern with a sidebar. No other grid or flex container
> should be invented to position a sidebar.

---

## Architecture — single source of truth

```
layout()
  ├── <div class="layout">          ← flex, for every page with a sidebar
  │     ├── <aside class="sidebar"> ← navigation landmark, OUTSIDE <main>
  │     └── <main class="…">        ← main content
  │
  └── <div class="home-layout">     ← ONLY for index.html (no sidebar)
```

### `<main>` classes by page type

| Page type | `layout()` parameter | `<main>` `class` | CSS |
|---|---|---|---|
| Documentation (foundations, components, tokens…) | `fullWidth:false, sidebar:X` | `content` | `padding:52px 64px; max-width:960px` |
| Marketing with sidebar (why, ai, documentation…) | `fullWidth:true, sidebar:X` | `page-content` | full-width sections with `.shell` |
| Home (index.html, no sidebar) | `fullWidth:true, sidebar:null` | `''` | `home-layout` |

---

## Absolute rules

```
✅ Pass sidebar as a parameter to layout() — never in the HTML body
✅ sidebar* functions (sidebarFoundations, sidebarComponents, v2Sidebar…)
   return ONLY the inner content (div.sidebar-group + links)
   — never an <aside> or an outer wrapper
✅ layout() is the ONLY function that emits <aside class="sidebar">
✅ <aside class="sidebar"> is ALWAYS outside <main> (WCAG landmarks)

❌ Never create a .with-sidebar, .sidebar-layout, or equivalent container in the body
❌ Never nest <aside> inside <main>
❌ Never write CSS rules like .new-class .sidebar — use the generic rules
❌ Never create a new layout without modifying layout() itself
```

---

## Why `<aside>` outside `<main>` (WCAG 1.3.6 + 4.1.2)

ARIA landmark regions must be semantically distinct:
- `<main>` = the page's main content (`main` landmark)
- `<aside>` = complementary navigation (`navigation` or `complementary` landmark)

Putting `<aside class="sidebar">` INSIDE `<main>` breaks the landmark hierarchy
and hurts keyboard navigation and screen readers.

---

## Internal sidebar — function return format

```js
// ✅ CORRECT — returns only the inner content
function sidebarFoundations(base, current) {
  return `<div class="sidebar-group">
    <span class="sidebar-label">Foundations</span>
    <a href="..." class="active" aria-current="page">Overview</a>
    ...
  </div>`;
}

// ❌ FORBIDDEN — wraps in <aside> (layout() would then emit it twice)
function sidebarFoundations(base, current) {
  return `<aside class="sidebar">
    <div class="sidebar-group">...</div>
  </aside>`;
}
```

---

## Adding a new page with a sidebar

```js
// Step 1: create or reuse a sidebar* function that returns div.sidebar-group
// Step 2: pass sidebar to the layout() parameter
write(path.join(DIST, 'my-page.html'), layout({
  title: 'My page',
  depth: 0,
  fullWidth: false,          // true for a marketing page with shell sections
  context: '',               // 'marketing' if the page is data-context="marketing"
  sidebar: mySidebarFn(),    // inner content only
  body: `<h1>...</h1>...`,  // <main> content only
}));
```

---

## Rules for agents

```
✅ Use layout() for every new page
✅ Verify the sidebar function returns div.sidebar-group (not <aside>)
✅ Test with grep that the generated HTML contains only one <aside class="sidebar">
❌ Create an intermediate container to position the sidebar
❌ Duplicate the layout CSS in a .my-new-class .sidebar block
❌ Modify layout()'s structure without updating this rule and the Playwright tests
```
