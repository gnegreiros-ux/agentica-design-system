# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual/home.spec.js >> Home — visual regressions >> hero above-the-fold — dark
- Location: tests/visual/home.spec.js:28:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  33 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: home-hero-dark.png

Call log:
  - Expect "toHaveScreenshot(home-hero-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 33 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 33 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - link "Agentica — Accueil" [ref=e4] [cursor=pointer]:
      - /url: index.html
      - img "Agentica" [ref=e5]
    - navigation "Navigation principale" [ref=e6]:
      - link "Home" [ref=e7] [cursor=pointer]:
        - /url: index.html
      - link "Why" [ref=e8] [cursor=pointer]:
        - /url: pourquoi.html
      - link "Architecture" [ref=e9] [cursor=pointer]:
        - /url: architecture.html
      - link "Quality" [ref=e10] [cursor=pointer]:
        - /url: qualite.html
      - link "AI" [ref=e11] [cursor=pointer]:
        - /url: ia.html
      - generic [ref=e12]:
        - link "Documentation" [ref=e13] [cursor=pointer]:
          - /url: documentation.html
        - generic:
          - generic:
            - heading "Understand" [level=2]
            - link "Introduction":
              - /url: pourquoi.html
            - link "Foundations":
              - /url: foundations/index.html
            - link "Human control":
              - /url: ia.html
            - link "Single source of truth":
              - /url: architecture.html
          - generic:
            - heading "Reference" [level=2]
            - link "Foundations":
              - /url: foundations/index.html
            - link "Components":
              - /url: components/index.html
            - link "Tokens":
              - /url: tokens/index.html
            - link "Decisions":
              - /url: decisions/index.html
            - link "Agents":
              - /url: agents/index.html
            - link "Pipelines":
              - /url: pipelines/index.html
            - link "Continuity":
              - /url: continuite.html
          - generic:
            - heading "Explore" [level=2]
            - link "Storybook":
              - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
            - link "GitHub":
              - /url: https://github.com/gnegreiros-ux/agentica-design-system
            - link "Audit":
              - /url: audit.html
      - link "Get started" [ref=e14] [cursor=pointer]:
        - /url: get-started.html
    - generic "Liens rapides" [ref=e15]:
      - group "Language" [ref=e16]:
        - button "FR" [ref=e17] [cursor=pointer]
        - button "EN" [ref=e18] [cursor=pointer]
      - link "Storybook — Catalogue interactif des composants" [ref=e19] [cursor=pointer]:
        - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - img [ref=e20]
      - link "GitHub — Code source du projet" [ref=e22] [cursor=pointer]:
        - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - img [ref=e23]
  - main [ref=e27]:
    - generic [ref=e29]:
      - generic [ref=e30]:
        - paragraph [ref=e31]: Decision system
        - heading "The decision system for humans and AI agents" [level=1] [ref=e32]
        - paragraph [ref=e33]: Agentica turns UX, UI, accessibility, architecture and governance decisions into structured, durable knowledge that humans and AI agents can understand.
        - generic [ref=e34]:
          - link "Discover the vision" [ref=e35] [cursor=pointer]:
            - /url: pourquoi.html
            - generic [ref=e36]: Discover the vision
          - link "Explore the documentation" [ref=e37] [cursor=pointer]:
            - /url: documentation.html
            - generic [ref=e38]: Explore the documentation
        - list "System statistics / Statistiques du système" [ref=e39]:
          - listitem [ref=e40]:
            - generic [ref=e41]: 800+
            - generic [ref=e42]: tokens
          - listitem [ref=e43]:
            - generic [ref=e44]: 70+
            - generic [ref=e45]: ADRs
          - listitem [ref=e46]:
            - generic [ref=e47]: "14"
            - generic [ref=e48]: components (WIP)
          - listitem [ref=e49]:
            - generic [ref=e50]: "10"
            - generic [ref=e51]: quality gates
      - figure [ref=e52]
    - generic [ref=e54]:
      - generic [ref=e55]:
        - paragraph [ref=e56]: The problem
        - heading "Teams accumulate invisible decisions" [level=2] [ref=e57]
        - paragraph [ref=e58]: Decisions scatter across Figma, GitHub, Storybook, Slack and Confluence. UX debt accumulates in silence. Documentation becomes outdated. Experts become indispensable. AI remains out of reach.
      - figure [ref=e59]
    - generic [ref=e61]:
      - generic [ref=e62]:
        - paragraph [ref=e63]: Humans and AI agents
        - heading "Designed for humans. Ready for AI agents." [level=2] [ref=e64]
        - paragraph [ref=e65]: Humans understand, decide, approve and govern. Agents detect, analyze, propose and automate. Humans always keep the final word.
      - figure [ref=e66]
    - generic [ref=e68]:
      - figure [ref=e69]
      - generic [ref=e70]:
        - paragraph [ref=e71]: Knowledge
        - heading "Knowledge is a strategic asset" [level=2] [ref=e72]
        - paragraph [ref=e73]: Frameworks evolve. Tools change. Technologies disappear. Knowledge must survive. Agentica structures it to remain readable tomorrow — by humans and AI agents alike.
    - generic [ref=e75]:
      - generic [ref=e76]:
        - paragraph [ref=e77]: Architecture
        - heading "One single source of truth" [level=2] [ref=e78]
        - paragraph [ref=e79]: One source feeds foundations, semantic contracts, components and applications. Four levels. One decision chain.
      - figure [ref=e80]
    - generic [ref=e82]:
      - generic [ref=e83]:
        - paragraph [ref=e84]: For every role
        - heading "Different value for every role" [level=2] [ref=e85]
      - generic [ref=e86]:
        - article [ref=e87]:
          - heading "Organization" [level=3] [ref=e88]
          - paragraph [ref=e89]: A shared decision memory, readable and governable.
        - article [ref=e90]:
          - heading "Managers" [level=3] [ref=e91]
          - paragraph [ref=e92]: Visible trade-offs, traceable and tied to value.
        - article [ref=e93]:
          - heading "Product leads" [level=3] [ref=e94]
          - paragraph [ref=e95]: Product choices connected to evidence and constraints.
        - article [ref=e96]:
          - heading "Designers" [level=3] [ref=e97]
          - paragraph [ref=e98]: Design intentions preserved beyond the screens.
        - article [ref=e99]:
          - heading "Developers" [level=3] [ref=e100]
          - paragraph [ref=e101]: Explicit contracts to build without guessing.
    - generic [ref=e103]:
      - generic [ref=e104]:
        - paragraph [ref=e105]: Quality
        - heading "Quality is built into the system" [level=2] [ref=e106]
        - paragraph [ref=e107]: Accessibility, visual regressions, documentation, ADRs and consistency are not added after the fact. They are part of the system. Nothing enters without control.
      - generic [ref=e108]:
        - generic [ref=e110]: WCAG 2.1 Accessibility
        - generic [ref=e112]: Visual regressions
        - generic [ref=e114]: Documentation
        - generic [ref=e115]: ADRs
        - generic [ref=e117]: Token consistency
    - generic [ref=e119]:
      - generic [ref=e120]:
        - paragraph [ref=e121]: Traceability
        - heading "Every decision has a memory" [level=2] [ref=e122]
        - paragraph [ref=e123]: Behind every button, every color, every accessibility rule lies a decision. Agentica preserves its context, alternatives and trade-offs — so nobody reinvents what has already been resolved.
        - link "View all 74 ADRs →" [ref=e125] [cursor=pointer]:
          - /url: decisions/index.html
          - generic [ref=e126]: View all 74 ADRs →
      - figure [ref=e127]
    - generic [ref=e129]:
      - figure [ref=e130]
      - generic [ref=e131]:
        - paragraph [ref=e132]: Artificial intelligence
        - heading "Automate without giving up control" [level=2] [ref=e133]
        - paragraph [ref=e134]: Agents can generate, detect, document and propose. They cannot approve, deploy or bypass governance.
    - generic [ref=e136]:
      - generic [ref=e137]:
        - paragraph [ref=e138]: Durability
        - heading "Build for today. Preserve for tomorrow." [level=2] [ref=e139]
        - paragraph [ref=e140]: Agentica is built on W3C open standards. Its components are native Web Components — portable, framework-independent. Its decisions outlive the tools.
        - paragraph [ref=e141]: "Zero hidden dependency. Zero lock-in. Agentica runs with AI agents — never because of them. The day they stop, your design system keeps running: documented, scripted and tested to prove it."
        - link "View the continuity plan →" [ref=e143] [cursor=pointer]:
          - /url: continuite.html
          - generic [ref=e144]: View the continuity plan →
      - figure [ref=e145]
    - generic [ref=e147]:
      - generic [ref=e148]:
        - paragraph [ref=e149]: Agentica
        - heading "Ready to explore Agentica?" [level=2] [ref=e150]
        - paragraph [ref=e151]: Turn decisions into durable knowledge that humans and AI agents can read.
        - generic [ref=e152]:
          - link "Get started" [ref=e153] [cursor=pointer]:
            - /url: get-started.html
            - generic [ref=e154]: Get started
          - link "Explore components" [ref=e155] [cursor=pointer]:
            - /url: components/index.html
            - generic [ref=e156]: Explore components
          - link "GitHub →" [ref=e157] [cursor=pointer]:
            - /url: https://github.com/gnegreiros-ux/agentica-design-system
      - figure [ref=e158]
  - contentinfo [ref=e159]:
    - generic [ref=e160]:
      - generic [ref=e161]:
        - link "Agentica — Accueil" [ref=e162] [cursor=pointer]:
          - /url: index.html
          - img "Agentica" [ref=e163]
        - link "Guilherme Negreiros" [ref=e164] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/gnegreiros/
          - img [ref=e165]
          - text: Guilherme Negreiros
      - generic [ref=e169]:
        - generic [ref=e170]: Navigation
        - link "Home" [ref=e171] [cursor=pointer]:
          - /url: index.html
        - link "Why" [ref=e172] [cursor=pointer]:
          - /url: pourquoi.html
        - link "Architecture" [ref=e173] [cursor=pointer]:
          - /url: architecture.html
        - link "Quality" [ref=e174] [cursor=pointer]:
          - /url: qualite.html
        - link "AI" [ref=e175] [cursor=pointer]:
          - /url: ia.html
      - generic [ref=e176]:
        - generic [ref=e177]: Documentation
        - link "Understand" [ref=e178] [cursor=pointer]:
          - /url: pourquoi.html
        - link "Get started" [ref=e179] [cursor=pointer]:
          - /url: get-started.html
        - link "Foundations" [ref=e180] [cursor=pointer]:
          - /url: foundations/index.html
        - link "Components" [ref=e181] [cursor=pointer]:
          - /url: components/index.html
        - link "Tokens" [ref=e182] [cursor=pointer]:
          - /url: tokens/index.html
        - link "Decisions" [ref=e183] [cursor=pointer]:
          - /url: decisions/index.html
        - link "Continuity" [ref=e184] [cursor=pointer]:
          - /url: continuite.html
        - link "Changelog" [ref=e185] [cursor=pointer]:
          - /url: changelog.html
      - generic [ref=e186]:
        - generic [ref=e187]: Explorer
        - link "Storybook" [ref=e188] [cursor=pointer]:
          - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - link "GitHub" [ref=e189] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - link "Audit" [ref=e190] [cursor=pointer]:
          - /url: audit.html
        - link "AI Brief" [ref=e191] [cursor=pointer]:
          - /url: ai-brief.html
    - generic [ref=e192]:
      - generic [ref=e193]: © 2026 Guilherme Negreiros
      - generic [ref=e194]: Built with Claude Code.
  - button "Retour en haut" [ref=e195] [cursor=pointer]:
    - img [ref=e196]
    - generic [ref=e198]: Top
  - status [ref=e199]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Home — visual regressions', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     // Wait for lazy illustrations to potentially become visible
  7  |     await page.waitForLoadState('networkidle');
  8  |   });
  9  | 
  10 |   test('light mode — full page', async ({ page }) => {
  11 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  12 |     await expect(page).toHaveScreenshot('home-light.png', { fullPage: true });
  13 |   });
  14 | 
  15 |   test('dark mode — full page', async ({ page }) => {
  16 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  17 |     await expect(page).toHaveScreenshot('home-dark.png', { fullPage: true });
  18 |   });
  19 | 
  20 |   test('hero above-the-fold — light', async ({ page }) => {
  21 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  22 |     await page.setViewportSize({ width: 1440, height: 900 });
  23 |     await expect(page).toHaveScreenshot('home-hero-light.png', {
  24 |       clip: { x: 0, y: 0, width: 1440, height: 900 },
  25 |     });
  26 |   });
  27 | 
  28 |   test('hero above-the-fold — dark', async ({ page }) => {
  29 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  30 |     await page.setViewportSize({ width: 1440, height: 900 });
> 31 |     await expect(page).toHaveScreenshot('home-hero-dark.png', {
     |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  32 |       clip: { x: 0, y: 0, width: 1440, height: 900 },
  33 |     });
  34 |   });
  35 | 
  36 |   test('mobile 375px — light', async ({ page }) => {
  37 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  38 |     await page.setViewportSize({ width: 375, height: 812 });
  39 |     await expect(page).toHaveScreenshot('home-mobile-light.png', { fullPage: true });
  40 |   });
  41 | });
  42 | 
```