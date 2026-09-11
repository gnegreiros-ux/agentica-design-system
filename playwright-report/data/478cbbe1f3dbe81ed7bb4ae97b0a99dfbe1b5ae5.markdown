# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual/components/all-components.spec.js >> toggle — visual regressions >> page toggle — light
- Location: tests/visual/components/all-components.spec.js:13:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 1280px by 3694px, received 1280px by 3688px. 70615 pixels (ratio 0.02 of all image pixels) are different.

  Snapshot: toggle-light.png

Call log:
  - Expect "toHaveScreenshot(toggle-light.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 3694px, received 1280px by 3688px. 70615 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 3694px, received 1280px by 3688px. 70615 pixels (ratio 0.02 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - link "Agentica — Accueil" [ref=e4] [cursor=pointer]:
      - /url: ../index.html
      - img [ref=e5]
    - navigation "Navigation principale" [ref=e6]:
      - link "Home" [ref=e7] [cursor=pointer]:
        - /url: ../index.html
      - link "Why" [ref=e8] [cursor=pointer]:
        - /url: ../pourquoi.html
      - link "Architecture" [ref=e9] [cursor=pointer]:
        - /url: ../architecture.html
      - link "Quality" [ref=e10] [cursor=pointer]:
        - /url: ../qualite.html
      - link "AI" [ref=e11] [cursor=pointer]:
        - /url: ../ia.html
      - generic [ref=e12]:
        - link "Documentation" [ref=e13] [cursor=pointer]:
          - /url: ../documentation.html
        - generic:
          - generic:
            - heading "Understand" [level=2]
            - link "Introduction":
              - /url: ../pourquoi.html
            - link "Foundations":
              - /url: ../foundations/index.html
            - link "Human control":
              - /url: ../ia.html
            - link "Single source of truth":
              - /url: ../architecture.html
          - generic:
            - heading "Reference" [level=2]
            - link "Foundations":
              - /url: ../foundations/index.html
            - link "Components":
              - /url: ../components/index.html
            - link "Tokens":
              - /url: ../tokens/index.html
            - link "Decisions":
              - /url: ../decisions/index.html
            - link "Agents":
              - /url: ../agents/index.html
            - link "Pipelines":
              - /url: ../pipelines/index.html
            - link "Continuity":
              - /url: ../continuite.html
          - generic:
            - heading "Explore" [level=2]
            - link "Figma library":
              - /url: ../resources.html
            - link "Storybook":
              - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
            - link "GitHub":
              - /url: https://github.com/gnegreiros-ux/agentica-design-system
            - link "Audit":
              - /url: ../audit.html
      - link "Get started" [ref=e14] [cursor=pointer]:
        - /url: ../get-started.html
    - generic "Liens rapides" [ref=e15]:
      - button "Basculer thème sombre / Switch to dark theme" [ref=e16] [cursor=pointer]:
        - img [ref=e17]
      - group "Language" [ref=e20]:
        - button "FR" [ref=e21] [cursor=pointer]
        - button "EN" [ref=e22] [cursor=pointer]
      - link "Storybook — Catalogue interactif des composants" [ref=e23] [cursor=pointer]:
        - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - img [ref=e24]
      - link "GitHub — Code source du projet" [ref=e26] [cursor=pointer]:
        - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - img [ref=e27]
      - link "Figma — Librairie Agentica sur Figma Community" [ref=e30] [cursor=pointer]:
        - /url: https://www.figma.com/community/file/1679894876003692613/agentica-agentic-design-system
        - img [ref=e31]
  - generic [ref=e37]:
    - navigation "Secondary navigation / Navigation secondaire" [ref=e38]:
      - generic [ref=e39]:
        - generic [ref=e40]: Components
        - link "Overview" [ref=e41] [cursor=pointer]:
          - /url: ../components/index.html
        - link "Button" [ref=e42] [cursor=pointer]:
          - /url: ../components/button.html
        - link "Icon" [ref=e43] [cursor=pointer]:
          - /url: ../components/icon.html
        - link "Input" [ref=e44] [cursor=pointer]:
          - /url: ../components/input.html
        - link "Badge" [ref=e45] [cursor=pointer]:
          - /url: ../components/badge.html
        - link "Image" [ref=e46] [cursor=pointer]:
          - /url: ../components/image.html
        - link "Card" [ref=e47] [cursor=pointer]:
          - /url: ../components/card.html
        - link "Checkbox" [ref=e48] [cursor=pointer]:
          - /url: ../components/checkbox.html
        - link "Radio" [ref=e49] [cursor=pointer]:
          - /url: ../components/radio.html
        - link "Toggle" [ref=e50] [cursor=pointer]:
          - /url: ../components/toggle.html
        - link "Table" [ref=e51] [cursor=pointer]:
          - /url: ../components/table.html
        - link "Code Block" [ref=e52] [cursor=pointer]:
          - /url: ../components/code-block.html
        - link "Banner" [ref=e53] [cursor=pointer]:
          - /url: ../components/banner.html
        - link "Link" [ref=e54] [cursor=pointer]:
          - /url: ../components/link.html
        - link "Segmented" [ref=e55] [cursor=pointer]:
          - /url: ../components/segmented.html
        - link "Tabs" [ref=e56] [cursor=pointer]:
          - /url: ../components/tabs.html
    - main [ref=e57]:
      - heading "Toggle" [level=1] [ref=e58]
      - paragraph [ref=e59]:
        - generic [ref=e60]:
          - text: Immediate-effect on/off switch — the change applies instantly, no "Save" button. State is signaled by the
          - strong [ref=e61]: knob position
          - text: (non-color indicator, WCAG 1.4.1).
      - heading "States" [level=2] [ref=e62]
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]: Off · On
          - generic [ref=e66]:
            - generic [ref=e70]: Dark mode
            - generic [ref=e74]: Email notifications
        - generic [ref=e75]:
          - generic [ref=e76]: Disabled
          - generic [ref=e77]:
            - generic [ref=e81]: Sync
            - generic [ref=e85]: Auto-save
      - heading "Checkbox or toggle?" [level=2] [ref=e86]
      - table [ref=e88]:
        - rowgroup [ref=e89]:
          - row "Checkbox Toggle" [ref=e90]:
            - columnheader [ref=e91]
            - columnheader "Checkbox" [ref=e92]
            - columnheader "Toggle" [ref=e93]
        - rowgroup [ref=e94]:
          - row "Effect On submit Immediate" [ref=e95]:
            - cell "Effect" [ref=e96]
            - cell "On submit" [ref=e97]
            - cell "Immediate" [ref=e98]:
              - strong [ref=e100]: Immediate
          - row "Use 0–N selection in a form Instant on/off setting" [ref=e101]:
            - cell "Use" [ref=e102]
            - cell "0–N selection in a form" [ref=e103]
            - cell "Instant on/off setting" [ref=e104]
          - row "Example « J'accepte les CGU » \"Dark mode\"" [ref=e105]:
            - cell "Example" [ref=e106]
            - cell "« J'accepte les CGU »" [ref=e107]
            - cell "\"Dark mode\"" [ref=e108]
      - heading "Absolute rules" [level=2] [ref=e109]
      - list [ref=e110]:
        - listitem [ref=e111]:
          - img [ref=e113]
          - text: Immediate effect — never in a submitted form
        - listitem [ref=e116]:
          - img [ref=e118]
          - text: State signaled by position (not color alone)
        - listitem [ref=e121]:
          - img [ref=e123]
          - generic [ref=e126]:
            - text: Native
            - code [ref=e127]: role="switch"
            - text: ", Space key"
        - listitem [ref=e128]:
          - img [ref=e130]
          - text: Interrogative label — prefer a concise one
      - heading "Component tokens" [level=2] [ref=e134]
      - table [ref=e136]:
        - rowgroup [ref=e141]:
          - row "Token CSS Reference Resolved value" [ref=e142]:
            - columnheader "Token CSS" [ref=e143]
            - columnheader "Reference" [ref=e144]
            - columnheader "Resolved value" [ref=e145]
        - rowgroup [ref=e146]:
          - 'row "--agtc-toggle-default-track-off primitive.color.gray.9 #8d8d8d" [ref=e147]':
            - cell "--agtc-toggle-default-track-off" [ref=e148]:
              - code [ref=e149]: "--agtc-toggle-default-track-off"
            - cell "primitive.color.gray.9" [ref=e150]:
              - code [ref=e151]: primitive.color.gray.9
            - cell "#8d8d8d" [ref=e152]
          - 'row "--agtc-toggle-default-track-off-hover primitive.color.gray.10 #838383" [ref=e153]':
            - cell "--agtc-toggle-default-track-off-hover" [ref=e154]:
              - code [ref=e155]: "--agtc-toggle-default-track-off-hover"
            - cell "primitive.color.gray.10" [ref=e156]:
              - code [ref=e157]: primitive.color.gray.10
            - cell "#838383" [ref=e158]
          - 'row "--agtc-toggle-default-track-on semantic.color.action.primary #007a68" [ref=e159]':
            - cell "--agtc-toggle-default-track-on" [ref=e160]:
              - code [ref=e161]: "--agtc-toggle-default-track-on"
            - cell "semantic.color.action.primary" [ref=e162]:
              - code [ref=e163]: semantic.color.action.primary
            - cell "#007a68" [ref=e164]
          - 'row "--agtc-toggle-default-track-on-hover semantic.color.action.primary-hover #0d3d38" [ref=e165]':
            - cell "--agtc-toggle-default-track-on-hover" [ref=e166]:
              - code [ref=e167]: "--agtc-toggle-default-track-on-hover"
            - cell "semantic.color.action.primary-hover" [ref=e168]:
              - code [ref=e169]: semantic.color.action.primary-hover
            - cell "#0d3d38" [ref=e170]
          - 'row "--agtc-toggle-default-knob semantic.color.background.surface #ffffff" [ref=e171]':
            - cell "--agtc-toggle-default-knob" [ref=e172]:
              - code [ref=e173]: "--agtc-toggle-default-knob"
            - cell "semantic.color.background.surface" [ref=e174]:
              - code [ref=e175]: semantic.color.background.surface
            - cell "#ffffff" [ref=e176]
          - 'row "--agtc-toggle-default-border-focus semantic.color.border.focus #007a68" [ref=e177]':
            - cell "--agtc-toggle-default-border-focus" [ref=e178]:
              - code [ref=e179]: "--agtc-toggle-default-border-focus"
            - cell "semantic.color.border.focus" [ref=e180]:
              - code [ref=e181]: semantic.color.border.focus
            - cell "#007a68" [ref=e182]
          - 'row "--agtc-toggle-default-label semantic.color.text.primary #202020" [ref=e183]':
            - cell "--agtc-toggle-default-label" [ref=e184]:
              - code [ref=e185]: "--agtc-toggle-default-label"
            - cell "semantic.color.text.primary" [ref=e186]:
              - code [ref=e187]: semantic.color.text.primary
            - cell "#202020" [ref=e188]
      - heading "Implementation" [level=2] [ref=e189]
      - generic [ref=e190]:
        - code [ref=e191]: <agtc-toggle label=" Email notifications" name="email-notif"></agtc-toggle> <agtc-toggle label=" Dark mode" checked></agtc-toggle>
        - generic [ref=e192]: html
        - button "Copy code (html)" [ref=e193] [cursor=pointer]: Copy
      - heading "UX Patterns Reference" [level=2] [ref=e194]
      - blockquote [ref=e195]:
        - paragraph [ref=e196]:
          - text: Patterns approved by the Design System Lead via the
          - code [ref=e197]: ux-pattern-review
          - text: workflow (see
          - code [ref=e198]: .claude/rules/ux-patterns-sources.md
          - text: "and ADR-036). Decision:"
          - strong [ref=e199]: all approved
          - text: .
      - table [ref=e201]:
        - rowgroup [ref=e202]:
          - row "Pattern Source Applied Justification" [ref=e203]:
            - columnheader "Pattern" [ref=e204]
            - columnheader "Source" [ref=e205]
            - columnheader "Applied" [ref=e206]
            - columnheader "Justification" [ref=e207]
        - rowgroup [ref=e208]:
          - row "role=\"switch\" + aria-checked NN/g — toggle switch ✅ Native <input type=\"checkbox\" role=\"switch\">" [ref=e209]:
            - cell "role=\"switch\" + aria-checked" [ref=e210]:
              - code [ref=e211]: role="switch"
              - text: +
              - code [ref=e212]: aria-checked
            - cell "NN/g — toggle switch" [ref=e213]:
              - link "NN/g — toggle switch" [ref=e214] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e215]
            - cell "Native <input type=\"checkbox\" role=\"switch\">" [ref=e216]:
              - text: Native
              - code [ref=e217]: <input type="checkbox" role="switch">
          - row "Immediate effect (no submit) NN/g ✅ agtc-change emitted on toggle" [ref=e218]:
            - cell "Immediate effect (no submit)" [ref=e219]:
              - strong [ref=e220]: Immediate effect
              - text: (no submit)
            - cell "NN/g" [ref=e221]:
              - link "NN/g" [ref=e222] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e223]
            - cell "agtc-change emitted on toggle" [ref=e224]:
              - code [ref=e225]: agtc-change
              - text: emitted on toggle
          - row "State by knob position (not color alone) NN/g ✅ Knob slides left/right (WCAG 1.4.1)" [ref=e226]:
            - cell "State by knob position (not color alone)" [ref=e227]:
              - strong [ref=e228]: State by knob position
              - text: (not color alone)
            - cell "NN/g" [ref=e229]:
              - link "NN/g" [ref=e230] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e231]
            - cell "Knob slides left/right (WCAG 1.4.1)" [ref=e232]
          - row "Delimited knob (contrast ≥ 3:1) NN/g ✅ White + shadow, gray.9 track (WCAG 1.4.11)" [ref=e233]:
            - cell "Delimited knob (contrast ≥ 3:1)" [ref=e234]
            - cell "NN/g" [ref=e235]:
              - link "NN/g" [ref=e236] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e237]
            - cell "White + shadow, gray.9 track (WCAG 1.4.11)" [ref=e238]
          - row "Concise label describing the \"on\" state, frontloaded NN/g ✅ label writing rule" [ref=e239]:
            - cell "Concise label describing the \"on\" state, frontloaded" [ref=e240]
            - cell "NN/g" [ref=e241]:
              - link "NN/g" [ref=e242] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e243]
            - cell "label writing rule" [ref=e244]:
              - code [ref=e245]: label
              - text: writing rule
          - 'row "Clickable label + target ≥ 24px NN/g · IxDF ✅ Enclosing <label>, min-height: 24px" [ref=e246]':
            - cell "Clickable label + target ≥ 24px" [ref=e247]
            - cell "NN/g · IxDF" [ref=e248]:
              - link "NN/g" [ref=e249] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
              - text: ·
              - link "IxDF" [ref=e250] [cursor=pointer]:
                - /url: https://ixdf.org/literature/topics/ui-design-patterns
            - cell "✅" [ref=e251]
            - 'cell "Enclosing <label>, min-height: 24px" [ref=e252]':
              - text: Enclosing
              - code [ref=e253]: <label>
              - text: ","
              - code [ref=e254]: "min-height: 24px"
          - row "Binary only NN/g ✅ Otherwise radio/checkbox" [ref=e255]:
            - cell "Binary only" [ref=e256]
            - cell "NN/g" [ref=e257]:
              - link "NN/g" [ref=e258] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e259]
            - cell "Otherwise radio/checkbox" [ref=e260]
      - generic [ref=e261]:
        - img [ref=e263]
        - generic [ref=e266]:
          - strong [ref=e267]: Contribute to this project
          - paragraph [ref=e268]: This system welcomes contributions — tokens, components, architectural decisions, accessibility fixes, or documentation. Every improvement counts.
        - link "View on GitHub" [ref=e269] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
          - generic [ref=e270]: View on GitHub
    - navigation "Table of contents / Table des matières" [ref=e271]:
      - generic [ref=e272]: On this page
      - link "States" [ref=e273] [cursor=pointer]:
        - /url: "#etats"
      - link "Checkbox or toggle?" [ref=e274] [cursor=pointer]:
        - /url: "#checkbox-ou-toggle"
      - link "Absolute rules" [ref=e275] [cursor=pointer]:
        - /url: "#regles-absolues"
      - link "Component tokens" [ref=e276] [cursor=pointer]:
        - /url: "#tokens-de-composant"
      - link "Implementation" [ref=e277] [cursor=pointer]:
        - /url: "#implementation"
      - link "UX Patterns Reference" [ref=e278] [cursor=pointer]:
        - /url: "#ux-patterns-reference"
  - contentinfo [ref=e279]:
    - generic [ref=e280]:
      - generic [ref=e281]:
        - link "Agentica — Accueil" [ref=e282] [cursor=pointer]:
          - /url: ../index.html
          - img [ref=e283]
        - link "Guilherme Negreiros" [ref=e284] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/gnegreiros/
          - img [ref=e285]
          - text: Guilherme Negreiros
      - generic [ref=e289]:
        - generic [ref=e290]: Navigation
        - link "Home" [ref=e291] [cursor=pointer]:
          - /url: ../index.html
        - link "Why" [ref=e292] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Architecture" [ref=e293] [cursor=pointer]:
          - /url: ../architecture.html
        - link "Quality" [ref=e294] [cursor=pointer]:
          - /url: ../qualite.html
        - link "AI" [ref=e295] [cursor=pointer]:
          - /url: ../ia.html
      - generic [ref=e296]:
        - generic [ref=e297]: Documentation
        - link "Understand" [ref=e298] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Get started" [ref=e299] [cursor=pointer]:
          - /url: ../get-started.html
        - link "Foundations" [ref=e300] [cursor=pointer]:
          - /url: ../foundations/index.html
        - link "Components" [ref=e301] [cursor=pointer]:
          - /url: ../components/index.html
        - link "Tokens" [ref=e302] [cursor=pointer]:
          - /url: ../tokens/index.html
        - link "Decisions" [ref=e303] [cursor=pointer]:
          - /url: ../decisions/index.html
        - link "Continuity" [ref=e304] [cursor=pointer]:
          - /url: ../continuite.html
        - link "Changelog" [ref=e305] [cursor=pointer]:
          - /url: ../changelog.html
      - generic [ref=e306]:
        - generic [ref=e307]: Explorer
        - link "Figma library" [ref=e308] [cursor=pointer]:
          - /url: ../resources.html
        - link "Storybook" [ref=e309] [cursor=pointer]:
          - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - link "GitHub" [ref=e310] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - link "Audit" [ref=e311] [cursor=pointer]:
          - /url: ../audit.html
        - link "AI Brief" [ref=e312] [cursor=pointer]:
          - /url: ../ai-brief.html
    - generic [ref=e313]:
      - generic [ref=e314]: © 2026 Guilherme Negreiros
      - generic [ref=e315]: Built with Claude Code.
  - button "Retour en haut" [ref=e316] [cursor=pointer]:
    - img [ref=e317]
    - generic [ref=e319]: Top
  - status [ref=e320]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Visual regressions for every component page (except button.html, already covered)
  4  | const PAGES = [
  5  |   'badge', 'banner', 'card', 'checkbox', 'code-block',
  6  |   'icon', 'input', 'link', 'radio', 'segmented',
  7  |   'table', 'tabs', 'toggle',
  8  | ];
  9  | 
  10 | for (const name of PAGES) {
  11 |   test.describe(`${name} — visual regressions`, () => {
  12 |     for (const theme of ['light', 'dark']) {
  13 |       test(`page ${name} — ${theme}`, async ({ page }) => {
  14 |         await page.goto(`/components/${name}.html`);
  15 |         await page.waitForLoadState('networkidle');
  16 |         await page.evaluate((t) =>
  17 |           document.documentElement.setAttribute('data-theme', t), theme
  18 |         );
> 19 |         await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { fullPage: true });
     |                            ^ Error: expect(page).toHaveScreenshot(expected) failed
  20 |       });
  21 |     }
  22 |   });
  23 | }
  24 | 
```