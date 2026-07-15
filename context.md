# Agentica — AI Brief
> Agentic design system. Version 1.0.0. Site: https://designsystem.gnegreiros.com
> Last updated: 2026-06-30. Author: Guilherme Negreiros.

## How to use this brief

Copy this entire file and paste it as the first message to your AI (Claude, Copilot, ChatGPT, Gemini…). All following questions about Agentica will get accurate answers consistent with the versioned decisions.

---

## 1. Identity and mission

**Name:** Agentica (technical prefix: agtc)
**Organization:** GNegreiros.com
**Site:** https://designsystem.gnegreiros.com

**Mission:** Encode interface decisions in a format readable by both humans and AI agents — to guarantee consistency, accessibility, and digital sovereignty.

**Guiding principles:**
1. The human always has the final word. Agents propose, humans approve.
2. If it isn't a token, it isn't a decision — any local value is debt.
3. Documentation instructs machines, not just humans.
4. Digital sovereignty: tools, data, and decisions stay under organizational control.

---

## 2. Token architecture (3 levels — absolute rule)

```
Primitives → Semantic → Component
(raw values)  (UX intent)  (UI contracts)
```

| Level | Source file | Example |
|--------|---------------|---------|
| Primitive | tokens/primitives.json | color.teal.9 = #34d3bb |
| Semantic | tokens/semantic.json | color.action.primary → teal.9 |
| Component | tokens/component.json | button.critical.requiresConfirmation = true |

**Absolute rules (violations = immediate debt):**
- NEVER a hardcoded value (color, spacing, radius) in code
- Primitive tokens are NEVER used directly in a component
- Semantic tokens encode INTENT (e.g. `color.action.primary`), not the value (e.g. `teal`)
- Component tokens are contracts — any change requires human approval

**CSS naming convention:**
```
--agtc-[level]-[category]-[component]-[variant]-[property]

--agtc-primitive-color-teal-9: #34d3bb
--agtc-semantic-color-action-primary: var(--agtc-primitive-color-teal-9)
--agtc-component-button-primary-background: var(--agtc-semantic-color-action-primary)
```

**Standard:** W3C DTCG format (Design Tokens Community Group) — https://www.designtokens.org/

---

## 3. Available components (17 Lit Web Components)

| Component | Primary usage |
|-----------|----------------|
| agtc-button | Primary, secondary, critical, ghost action |
| agtc-input | Text, email, password entry field |
| agtc-badge | Status label (success/warning/danger/info/neutral/brand) |
| agtc-banner | Inline informational message (6 variants, dismissible) |
| agtc-card | Composable container for structured content |
| agtc-feature-card | Glassmorphism marketing card with icon and title |
| agtc-checkbox | Checkbox with indeterminate states |
| agtc-radio / agtc-radio-group | Exclusive selection within a group |
| agtc-toggle | Binary switch with immediate visual feedback |
| agtc-table | Readable, read-only data table |
| agtc-code-block | Code block with accessible copy (aria-live) |
| agtc-tabs | Tabbed navigation with aria-selected |
| agtc-segmented | Single-select segmented control (e.g. language, density) |
| agtc-link | Link with automatic external detection (noopener + icon) |
| agtc-icon | Tokenized Lucide icon |
| agtc-top-nav | Main navigation, full-height visual tabs |

### Critical rules — agtc-button

- Maximum 1 `primary` button per section or form
- The `critical` variant REQUIRES a confirmation pattern (requiresConfirmation: true token)
- An explicit label is mandatory — never "OK" or "Confirm" alone on a critical action
- Width preserved during async (loading) states
- Allowed variants: `primary` | `secondary` | `critical` | `ghost`
- FORBIDDEN: inventing a variant (`danger`, `destructive`) — escalate to a human

---

## 4. Accessibility — WCAG 2.1 AA (non-negotiable)

| Rule | Standard | Token |
|-------|----------|-------|
| Normal text contrast | 4.5:1 minimum | color.text.primary on color.background.page |
| Large text contrast | 3.0:1 minimum | — |
| Visible focus | Mandatory on every interactive element | color.border.focus |
| Keyboard navigation | 100% of interactions | — |
| ARIA | Mandatory on every component | aria-label, aria-describedby, aria-expanded |
| Touch targets | ≥ 24×24px (WCAG 2.5.8) | — |

Automated tests: axe-core (blocking in CI) + Playwright (E2E).

---

## 5. Token governance (Token Change Request)

| Change type | Who can make it | Approval required |
|---|---|---|
| Primitive token value | Dev or agent | Principal Designer |
| Adding a semantic token | Dev or agent (via PR) | Design System Lead |
| Modifying a component token | Human only | Principal Designer |
| Deleting a token | Human only | Principal Designer + impact audit |

TCR flow: identify → document → assess impact → approve → modify → compile → test → communicate.

---

## 6. Editorial contexts

**Product Mode** (default, no attribute):
- Normal spacing, typography capped at heading.1 (40px), regular grid
- Usage: component, token, and decision documentation

**Marketing Mode** (`data-context="marketing"`):
- 96px section spacing, 120px hero gap, display typography (60px)
- Usage: conviction and onboarding pages

Marketing pages: index.html, get-started.html, agents/index.html
Every other page is in Product mode.

---

## 7. Key architectural decisions — 65 ADRs (as of 2026-06-30)

| ADR | Decision | Impact |
|-----|----------|--------|
| ADR-001 | Three-level token architecture | Non-negotiable — the system's foundation |
| ADR-004 | Human governance — the human always has the final word | All agents |
| ADR-005 | The `critical` variant replaces `danger` for irreversible actions | agtc-button |
| ADR-021 | Atkinson Hyperlegible as the main font | Typography |
| ADR-047 | Never a :visited state on navigation elements | Global CSS |
| ADR-052 | W3C DTCG compliance — the de facto token standard | tokens/*.json |
| ADR-057 | Two editorial contexts: Product vs. Marketing | Site layout |
| ADR-059 | Closing the three-level hierarchy (18 semantic tokens added) | Tokens |
| ADR-065 | Dual-mode dark mode via semantic.dark.json + Style Dictionary | Storybook/Chromatic |

---

## 8. What an agent can and cannot do

| ✅ Allowed | ❌ Forbidden without approval |
|---|---|
| Read and apply component contracts | Modify tokens/component.json |
| Generate code from semantic tokens | Use hardcoded values |
| Detect drift and propose fixes | Merge to main or develop |
| Create fix/ docs/ feature/ branches | Push directly to main |
| Open a PR with a complete description | Deploy to production alone |
| Add or modify a semantic token (via PR) | Delete a token |

---

## 9. Tech stack

| Layer | Technology |
|--------|-------------|
| Web Components | Lit (Google) |
| Token compilation | Style Dictionary (W3C DTCG) |
| Visual tests | Chromatic (Storybook) |
| Accessibility tests | axe-core (blocking in CI) |
| E2E tests | Playwright |
| Documentation | Storybook |
| Figma sync | Tokens Studio |
| Site generator | Custom Node.js (site/build.js) |
| CI/CD | GitHub Actions |

---

*This brief is automatically generated from Agentica's versioned sources.*
*Any change goes through the repository: https://github.com/gnegreiros-ux/agentic-design-system*
