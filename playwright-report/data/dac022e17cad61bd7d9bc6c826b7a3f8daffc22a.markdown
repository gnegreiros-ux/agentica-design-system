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

  Expected an image 1280px by 3658px, received 1280px by 3689px. 116731 pixels (ratio 0.03 of all image pixels) are different.

  Snapshot: toggle-light.png

Call log:
  - Expect "toHaveScreenshot(toggle-light.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 3658px, received 1280px by 3689px. 116731 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 3658px, received 1280px by 3689px. 116731 pixels (ratio 0.03 of all image pixels) are different.

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
              - /url: https://agentica.design/storybook/
            - link "GitHub":
              - /url: https://github.com/gnegreiros-ux/agentica-design-system
            - link "Audit":
              - /url: ../audit.html
            - link "Changelog":
              - /url: ../changelog.html
      - link "Get started" [ref=e14] [cursor=pointer]:
        - /url: ../get-started.html
    - generic "Liens rapides" [ref=e15]:
      - button "Basculer thème sombre / Switch to dark theme" [ref=e16] [cursor=pointer]:
        - img [ref=e17]
      - group "Language" [ref=e20]:
        - button "FR" [ref=e21] [cursor=pointer]
        - button "EN" [ref=e22] [cursor=pointer]
      - link "Storybook — Catalogue interactif des composants" [ref=e23] [cursor=pointer]:
        - /url: https://agentica.design/storybook/
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
        - link "Feature Card" [ref=e57] [cursor=pointer]:
          - /url: ../components/feature-card.html
        - link "Top-nav" [ref=e58] [cursor=pointer]:
          - /url: ../components/top-nav.html
    - main [ref=e59]:
      - heading "Toggle" [level=1] [ref=e60]
      - paragraph [ref=e61]:
        - generic [ref=e62]:
          - text: Immediate-effect on/off switch — the change applies instantly, no "Save" button. State is signaled by the
          - strong [ref=e63]: knob position
          - text: (non-color indicator, WCAG 1.4.1).
      - heading "States" [level=2] [ref=e64]
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]: Off · On
          - generic [ref=e68]:
            - generic [ref=e70] [cursor=pointer]:
              - switch "Mode sombre"
              - generic [ref=e74]: Mode sombre
            - generic [ref=e76] [cursor=pointer]:
              - switch "Notifications par e-mail" [checked]
              - generic [ref=e80]: Notifications par e-mail
        - generic [ref=e81]:
          - generic [ref=e82]: Disabled
          - generic [ref=e83]:
            - generic:
              - generic:
                - switch "Synchronisation" [disabled]
                - generic:
                  - generic: Synchronisation
            - generic:
              - generic:
                - switch "Sauvegarde auto" [checked] [disabled]
                - generic:
                  - generic: Sauvegarde auto
      - heading "Checkbox or toggle?" [level=2] [ref=e84]
      - table [ref=e86]:
        - rowgroup [ref=e87]:
          - row "Checkbox Toggle" [ref=e88]:
            - columnheader [ref=e89]
            - columnheader "Checkbox" [ref=e90]
            - columnheader "Toggle" [ref=e91]
        - rowgroup [ref=e92]:
          - row "Effect On submit Immediate" [ref=e93]:
            - cell "Effect" [ref=e94]
            - cell "On submit" [ref=e95]
            - cell "Immediate" [ref=e96]:
              - strong [ref=e98]: Immediate
          - row "Use 0–N selection in a form Instant on/off setting" [ref=e99]:
            - cell "Use" [ref=e100]
            - cell "0–N selection in a form" [ref=e101]
            - cell "Instant on/off setting" [ref=e102]
          - row "Example « J'accepte les CGU » \"Dark mode\"" [ref=e103]:
            - cell "Example" [ref=e104]
            - cell "« J'accepte les CGU »" [ref=e105]
            - cell "\"Dark mode\"" [ref=e106]
      - heading "Absolute rules" [level=2] [ref=e107]
      - list [ref=e108]:
        - listitem [ref=e109]:
          - img [ref=e111]
          - text: Immediate effect — never in a submitted form
        - listitem [ref=e114]:
          - img [ref=e116]
          - text: State signaled by position (not color alone)
        - listitem [ref=e119]:
          - img [ref=e121]
          - generic [ref=e124]:
            - text: Native
            - code [ref=e125]: role="switch"
            - text: ", Space key"
        - listitem [ref=e126]:
          - img [ref=e128]
          - text: Interrogative label — prefer a concise one
      - heading "Component tokens" [level=2] [ref=e132]
      - table [ref=e134]:
        - rowgroup [ref=e139]:
          - row "Token CSS Reference Resolved value" [ref=e140]:
            - columnheader "Token CSS" [ref=e141]
            - columnheader "Reference" [ref=e142]
            - columnheader "Resolved value" [ref=e143]
        - rowgroup [ref=e144]:
          - 'row "--agtc-toggle-default-track-off primitive.color.gray.9 #8d8d8d" [ref=e145]':
            - cell "--agtc-toggle-default-track-off" [ref=e146]:
              - code [ref=e147]: "--agtc-toggle-default-track-off"
            - cell "primitive.color.gray.9" [ref=e148]:
              - code [ref=e149]: primitive.color.gray.9
            - cell "#8d8d8d" [ref=e150]
          - 'row "--agtc-toggle-default-track-off-hover primitive.color.gray.10 #838383" [ref=e151]':
            - cell "--agtc-toggle-default-track-off-hover" [ref=e152]:
              - code [ref=e153]: "--agtc-toggle-default-track-off-hover"
            - cell "primitive.color.gray.10" [ref=e154]:
              - code [ref=e155]: primitive.color.gray.10
            - cell "#838383" [ref=e156]
          - 'row "--agtc-toggle-default-track-on semantic.color.action.primary #007a68" [ref=e157]':
            - cell "--agtc-toggle-default-track-on" [ref=e158]:
              - code [ref=e159]: "--agtc-toggle-default-track-on"
            - cell "semantic.color.action.primary" [ref=e160]:
              - code [ref=e161]: semantic.color.action.primary
            - cell "#007a68" [ref=e162]
          - 'row "--agtc-toggle-default-track-on-hover semantic.color.action.primary-hover #0d3d38" [ref=e163]':
            - cell "--agtc-toggle-default-track-on-hover" [ref=e164]:
              - code [ref=e165]: "--agtc-toggle-default-track-on-hover"
            - cell "semantic.color.action.primary-hover" [ref=e166]:
              - code [ref=e167]: semantic.color.action.primary-hover
            - cell "#0d3d38" [ref=e168]
          - 'row "--agtc-toggle-default-knob semantic.color.background.surface #ffffff" [ref=e169]':
            - cell "--agtc-toggle-default-knob" [ref=e170]:
              - code [ref=e171]: "--agtc-toggle-default-knob"
            - cell "semantic.color.background.surface" [ref=e172]:
              - code [ref=e173]: semantic.color.background.surface
            - cell "#ffffff" [ref=e174]
          - 'row "--agtc-toggle-default-border-focus semantic.color.border.focus #007a68" [ref=e175]':
            - cell "--agtc-toggle-default-border-focus" [ref=e176]:
              - code [ref=e177]: "--agtc-toggle-default-border-focus"
            - cell "semantic.color.border.focus" [ref=e178]:
              - code [ref=e179]: semantic.color.border.focus
            - cell "#007a68" [ref=e180]
          - 'row "--agtc-toggle-default-label semantic.color.text.primary #202020" [ref=e181]':
            - cell "--agtc-toggle-default-label" [ref=e182]:
              - code [ref=e183]: "--agtc-toggle-default-label"
            - cell "semantic.color.text.primary" [ref=e184]:
              - code [ref=e185]: semantic.color.text.primary
            - cell "#202020" [ref=e186]
      - heading "Implementation" [level=2] [ref=e187]
      - generic [ref=e188]:
        - code [ref=e189]: <agtc-toggle label=" Email notifications" name="email-notif"></agtc-toggle> <agtc-toggle label=" Dark mode" checked></agtc-toggle>
        - generic [ref=e190]: html
        - button "Copy code (html)" [ref=e191] [cursor=pointer]: Copy
      - heading "UX Patterns Reference" [level=2] [ref=e192]
      - blockquote [ref=e193]:
        - paragraph [ref=e194]:
          - text: Patterns approved by the Design System Lead via the
          - code [ref=e195]: ux-pattern-review
          - text: workflow (see
          - code [ref=e196]: governance/rules/ux-patterns-sources.md
          - text: "and ADR-036). Decision:"
          - strong [ref=e197]: all approved
          - text: .
      - table [ref=e199]:
        - rowgroup [ref=e200]:
          - row "Pattern Source Applied Justification" [ref=e201]:
            - columnheader "Pattern" [ref=e202]
            - columnheader "Source" [ref=e203]
            - columnheader "Applied" [ref=e204]
            - columnheader "Justification" [ref=e205]
        - rowgroup [ref=e206]:
          - row "role=\"switch\" + aria-checked NN/g — toggle switch ✅ Native <input type=\"checkbox\" role=\"switch\">" [ref=e207]:
            - cell "role=\"switch\" + aria-checked" [ref=e208]:
              - code [ref=e209]: role="switch"
              - text: +
              - code [ref=e210]: aria-checked
            - cell "NN/g — toggle switch" [ref=e211]:
              - link "NN/g — toggle switch" [ref=e212] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e213]
            - cell "Native <input type=\"checkbox\" role=\"switch\">" [ref=e214]:
              - text: Native
              - code [ref=e215]: <input type="checkbox" role="switch">
          - row "Immediate effect (no submit) NN/g ✅ agtc-change emitted on toggle" [ref=e216]:
            - cell "Immediate effect (no submit)" [ref=e217]:
              - strong [ref=e218]: Immediate effect
              - text: (no submit)
            - cell "NN/g" [ref=e219]:
              - link "NN/g" [ref=e220] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e221]
            - cell "agtc-change emitted on toggle" [ref=e222]:
              - code [ref=e223]: agtc-change
              - text: emitted on toggle
          - row "State by knob position (not color alone) NN/g ✅ Knob slides left/right (WCAG 1.4.1)" [ref=e224]:
            - cell "State by knob position (not color alone)" [ref=e225]:
              - strong [ref=e226]: State by knob position
              - text: (not color alone)
            - cell "NN/g" [ref=e227]:
              - link "NN/g" [ref=e228] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e229]
            - cell "Knob slides left/right (WCAG 1.4.1)" [ref=e230]
          - row "Delimited knob (contrast ≥ 3:1) NN/g ✅ White + shadow, gray.9 track (WCAG 1.4.11)" [ref=e231]:
            - cell "Delimited knob (contrast ≥ 3:1)" [ref=e232]
            - cell "NN/g" [ref=e233]:
              - link "NN/g" [ref=e234] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e235]
            - cell "White + shadow, gray.9 track (WCAG 1.4.11)" [ref=e236]
          - row "Concise label describing the \"on\" state, frontloaded NN/g ✅ label writing rule" [ref=e237]:
            - cell "Concise label describing the \"on\" state, frontloaded" [ref=e238]
            - cell "NN/g" [ref=e239]:
              - link "NN/g" [ref=e240] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e241]
            - cell "label writing rule" [ref=e242]:
              - code [ref=e243]: label
              - text: writing rule
          - 'row "Clickable label + target ≥ 24px NN/g · IxDF ✅ Enclosing <label>, min-height: 24px" [ref=e244]':
            - cell "Clickable label + target ≥ 24px" [ref=e245]
            - cell "NN/g · IxDF" [ref=e246]:
              - link "NN/g" [ref=e247] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
              - text: ·
              - link "IxDF" [ref=e248] [cursor=pointer]:
                - /url: https://ixdf.org/literature/topics/ui-design-patterns
            - cell "✅" [ref=e249]
            - 'cell "Enclosing <label>, min-height: 24px" [ref=e250]':
              - text: Enclosing
              - code [ref=e251]: <label>
              - text: ","
              - code [ref=e252]: "min-height: 24px"
          - row "Binary only NN/g ✅ Otherwise radio/checkbox" [ref=e253]:
            - cell "Binary only" [ref=e254]
            - cell "NN/g" [ref=e255]:
              - link "NN/g" [ref=e256] [cursor=pointer]:
                - /url: https://www.nngroup.com/articles/toggle-switch-guidelines/
            - cell "✅" [ref=e257]
            - cell "Otherwise radio/checkbox" [ref=e258]
      - generic [ref=e259]:
        - img [ref=e261]
        - generic [ref=e264]:
          - strong [ref=e265]: Contribute to this project
          - paragraph [ref=e266]: This system welcomes contributions — tokens, components, architectural decisions, accessibility fixes, or documentation. Every improvement counts.
        - link "View on GitHub" [ref=e267] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
          - generic [ref=e268]: View on GitHub
    - navigation "Table of contents / Table des matières" [ref=e269]:
      - generic [ref=e270]: On this page
      - link "States" [ref=e271] [cursor=pointer]:
        - /url: "#etats"
      - link "Checkbox or toggle?" [ref=e272] [cursor=pointer]:
        - /url: "#checkbox-ou-toggle"
      - link "Absolute rules" [ref=e273] [cursor=pointer]:
        - /url: "#regles-absolues"
      - link "Component tokens" [ref=e274] [cursor=pointer]:
        - /url: "#tokens-de-composant"
      - link "Implementation" [ref=e275] [cursor=pointer]:
        - /url: "#implementation"
      - link "UX Patterns Reference" [ref=e276] [cursor=pointer]:
        - /url: "#ux-patterns-reference"
  - contentinfo [ref=e277]:
    - generic [ref=e278]:
      - generic [ref=e279]:
        - link "Agentica — Accueil" [ref=e280] [cursor=pointer]:
          - /url: ../index.html
          - img [ref=e281]
        - link "Guilherme Negreiros" [ref=e282] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/gnegreiros/
          - img [ref=e283]
          - text: Guilherme Negreiros
      - generic [ref=e287]:
        - generic [ref=e288]: Navigation
        - link "Home" [ref=e289] [cursor=pointer]:
          - /url: ../index.html
        - link "Why" [ref=e290] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Architecture" [ref=e291] [cursor=pointer]:
          - /url: ../architecture.html
        - link "Quality" [ref=e292] [cursor=pointer]:
          - /url: ../qualite.html
        - link "AI" [ref=e293] [cursor=pointer]:
          - /url: ../ia.html
      - generic [ref=e294]:
        - generic [ref=e295]: Documentation
        - link "Understand" [ref=e296] [cursor=pointer]:
          - /url: ../pourquoi.html
        - link "Get started" [ref=e297] [cursor=pointer]:
          - /url: ../get-started.html
        - link "Foundations" [ref=e298] [cursor=pointer]:
          - /url: ../foundations/index.html
        - link "Components" [ref=e299] [cursor=pointer]:
          - /url: ../components/index.html
        - link "Tokens" [ref=e300] [cursor=pointer]:
          - /url: ../tokens/index.html
        - link "Decisions" [ref=e301] [cursor=pointer]:
          - /url: ../decisions/index.html
        - link "Continuity" [ref=e302] [cursor=pointer]:
          - /url: ../continuite.html
      - generic [ref=e303]:
        - generic [ref=e304]: Explorer
        - link "Figma library" [ref=e305] [cursor=pointer]:
          - /url: ../resources.html
        - link "Storybook" [ref=e306] [cursor=pointer]:
          - /url: https://agentica.design/storybook/
        - link "GitHub" [ref=e307] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentica-design-system
        - link "Audit" [ref=e308] [cursor=pointer]:
          - /url: ../audit.html
        - link "Changelog" [ref=e309] [cursor=pointer]:
          - /url: ../changelog.html
        - link "AI Brief" [ref=e310] [cursor=pointer]:
          - /url: ../ai-brief.html
    - generic [ref=e311]:
      - generic [ref=e312]: © 2026 Guilherme Negreiros
      - generic [ref=e313]: Built with Claude Code.
  - button "Retour en haut" [ref=e314] [cursor=pointer]:
    - img [ref=e315]
    - generic [ref=e317]: Top
  - status [ref=e318]
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