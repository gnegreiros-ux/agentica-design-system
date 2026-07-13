---
paths:
  - "components/agtc-*.js"
  - "components/agtc-*.stories.js"
  - "guidelines/components/**"
---

# Rule: ux-patterns-sources

> Registry of UX reference sources and pattern-review checklist by component.
> To consult before creating any component and before any relevant UX change.
> **Type:** rule
> **Logical path:** .claude/rules/ux-patterns-sources.md
> **Read before:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/skills/ux-pattern-review.md, .claude/skills/pipelines/ux-patterns.md, decisions/ADR-036-ux-pattern-review-pre-composant.md, guidelines/components/

---

## Why this registry exists

> Before publishing a component, the human must be able to judge **which UX patterns**
> to apply. Agents do not decide the patterns — they **present** the options drawn from
> recognized sources, with links, and the human **approves**.

Concrete example (`input` component): *how should the error state be displayed? the help
text? at what point should validation run (while typing, on blur, on submit)?*
These questions have documented answers in the sources below — we present them
systematically rather than improvising.

---

## The 5 reference sources

| # | Source | Link | What it covers | Mostly relevant for |
|---|--------|------|-------------------|-------------------------|
| 1 | **IF — Data Patterns Catalogue** | https://catalogue.projectsbyif.com/ | Consent, authentication, data sharing and access, AI transparency, security controls | Sensitive fields, consent, login, "agentic"/AI components |
| 2 | **Nielsen Norman Group** | https://www.nngroup.com/articles/design-pattern-guidelines/ | Index of 72 guidelines: input controls, forms & wizards, tooltips/dialogs, icons & indicators, menus, navigation, search, error handling, privacy & ethics | Nearly all components — usability reference |
| 3 | **Dashboard Design Patterns** | https://dashboarddesignpatterns.github.io/patterns.html | Component patterns (data / meta / visual / interaction) + composition (screenspace / structure / page layout / color) | Dashboards, data viz, tables, cards, layout |
| 4 | **Interaction Design Foundation** | https://ixdf.org/literature/topics/ui-design-patterns | Navigation & wayfinding, forms & input (lazy registration, forgiving formats, required markers, progressive disclosure), interaction, feedback, dark patterns | Forms, inputs, navigation, feedback |
| 5 | **Smashing Magazine** | https://www.smashingmagazine.com/category/design-patterns/ | Modals vs pages, notifications, forms & error messages, data tables, nested filters, hidden vs disabled, accessibility | Forms, tables, modals, notifications, states |

> Source content is consulted in a **hybrid** way: this registry serves as a versioned
> baseline, and the `ux-pattern-review` skill performs a **targeted WebFetch** on the
> priority source(s) at review time (see matrix below).

---

## Matrix: component type → priority sources

| Component type | Sources to consult first |
|-------------------|--------------------------------|
| Input field (`input`, `textarea`, `select`) | NN/g (input controls, forms, error handling), IxDF (forms & input), Smashing (forms & error messages) |
| Action (`button`, action links) | NN/g (input controls), IxDF (clear primary action), Smashing (hidden vs disabled) |
| Feedback / status (`badge`, `toast`, `alert`) | NN/g (icons & indicators), Dashboard (visual representations), Smashing (notifications) |
| Container / layout (`card`, `panel`, grids) | Dashboard (page layout, composition), Smashing (modals vs pages) |
| Iconography (`icon`) | NN/g (icons & indicators), IF (transparency / meaning) |
| Navigation (`tabs`, `breadcrumb`, `menu`) | IxDF (navigation & wayfinding), NN/g (navigation, menus) |
| Data / tables (`table`, `data-grid`, dashboards) | Dashboard (data, interaction, composition), Smashing (data tables, nested filters) |
| Sensitive data / consent / AI | IF (consent, data access, AI transparency), NN/g (privacy & ethics) |

> Always include **NN/g** as the usability baseline, plus the type-specific source(s).

---

## Per-component review checklist

For every component (new or with a relevant UX change), review:

### States and interactions
- [ ] States covered: default, hover, focus(-visible), active, error/invalid, disabled, readonly, loading
- [ ] Clear primary action (only one `primary` per section — see button rule)
- [ ] Touch targets ≥ 24×24px (WCAG 2.5.8)

### Input and validation (if applicable)
- [ ] **Error state display**: placement, tokenized color, `role="alert"`, explicit message
- [ ] **Help text**: placement, `aria-describedby` link, visual distinction from errors
- [ ] **When validation runs**: on typing (`onChange`) / on blur (`onBlur`) / on submit (`onSubmit`) — an explicit, justified decision
- [ ] **Required markers**: visual `*` marker + `aria-required`
- [ ] **Forgiving formats**: input tolerance where relevant (spaces, multiple formats)
- [ ] **Progressive disclosure**: reveal complexity gradually where relevant

### Ethics and accessibility
- [ ] **Dark patterns to avoid**: no forced consent, no misleading hierarchy, no deceptive hidden opt-outs
- [ ] Accessibility: delegate to the `pipelines/wcag.md` pipeline (contrast, focus, ARIA, reduced-motion)

---

## Checklist for the 6 propagation surfaces

Once patterns are **approved by the human**, the decision is documented **everywhere**:

| # | Surface | Expected form |
|---|---------|----------------|
| 1 | **Guideline** `guidelines/components/<comp>.md` | `## UX Patterns Reference` section — table `Pattern \| Source (link) \| Applied ✅/❌ \| Justification` |
| 2 | **Code** `components/agtc-<comp>.js` | Header comment block "WHY" listing applied patterns + links |
| 3 | **Storybook** `components/agtc-<comp>.stories.js` | `parameters.docs.description.component` — summary of applied patterns + links |
| 4 | **Site** | `node site/build.js` regenerates the component page from the guideline |
| 5 | **ADR** | Component implementation ADR — lists applied patterns (governed by ADR-036) |
| 6 | **GitHub Projects** | Project item reflected (status, domain) — see ADR-069 |

> The `pipelines/ux-patterns.md` pipeline **verifies** that these 6 surfaces are up to date before any commit.

---

## Rule for agents

```
✅ Present patterns from the sources, with direct links
✅ Recommend a default, but let the human decide
✅ Document the decision across the 6 surfaces
❌ Invent a pattern not drawn from the sources
❌ Apply a pattern without explicit human approval
❌ Publish a component without the review having taken place
```

> **The human always has the final word** — the agent proposes patterns, the human decides.
