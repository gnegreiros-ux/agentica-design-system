# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual/home.spec.js >> Home — régressions visuelles >> dark mode — pleine page
- Location: tests/visual/home.spec.js:15:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: home-dark.png

Call log:
  - Expect "toHaveScreenshot(home-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 7648px, received 1280px by 7823px. 230610 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Timeout 5000ms exceeded.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Aller au contenu" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - link "Agentica — Accueil" [ref=e4] [cursor=pointer]:
      - /url: index.html
      - img "Agentica" [ref=e5]
    - navigation "Navigation principale" [ref=e6]:
      - link "Accueil" [ref=e7] [cursor=pointer]:
        - /url: index.html
      - link "Pourquoi" [ref=e8] [cursor=pointer]:
        - /url: pourquoi.html
      - link "Architecture" [ref=e9] [cursor=pointer]:
        - /url: architecture.html
      - link "Qualité" [ref=e10] [cursor=pointer]:
        - /url: qualite.html
      - link "IA" [ref=e11] [cursor=pointer]:
        - /url: ia.html
      - generic [ref=e12]:
        - link "Documentation" [ref=e13] [cursor=pointer]:
          - /url: documentation.html
        - generic:
          - generic:
            - heading "Comprendre" [level=2]
            - link "Introduction":
              - /url: pourquoi.html
            - link "Fondations":
              - /url: foundations/index.html
            - link "Contrôle humain":
              - /url: ia.html
            - link "Source unique de vérité":
              - /url: architecture.html
          - generic:
            - heading "Référence" [level=2]
            - link "Fondations":
              - /url: foundations/index.html
            - link "Composants":
              - /url: components/index.html
            - link "Tokens":
              - /url: tokens/index.html
            - link "Décisions":
              - /url: decisions/index.html
            - link "Agents":
              - /url: agents/index.html
            - link "Pipelines":
              - /url: pipelines/index.html
            - link "Continuité":
              - /url: continuite.html
          - generic:
            - heading "Explorer" [level=2]
            - link "Storybook":
              - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
            - link "GitHub":
              - /url: https://github.com/gnegreiros-ux/agentic-design-system
            - link "Audit":
              - /url: audit.html
      - link "Démarrer" [ref=e14] [cursor=pointer]:
        - /url: get-started.html
    - generic "Liens rapides" [ref=e15]:
      - group "Language" [ref=e16]:
        - button "FR" [ref=e17] [cursor=pointer]
        - button "EN" [ref=e18] [cursor=pointer]
      - link "Storybook — Catalogue interactif des composants" [ref=e19] [cursor=pointer]:
        - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - img [ref=e20]
      - link "GitHub — Code source du projet" [ref=e22] [cursor=pointer]:
        - /url: https://github.com/gnegreiros-ux/agentic-design-system
  - main [ref=e24]:
    - generic [ref=e26]:
      - generic [ref=e27]:
        - paragraph [ref=e28]: Système de décisions
        - heading "Le système de décisions pour les humains et les agents IA" [level=1] [ref=e29]
        - paragraph [ref=e30]: Agentica transforme les décisions UX, UI, accessibilité, architecture et gouvernance en connaissances structurées, durables et compréhensibles par les humains comme par les agents IA.
        - generic [ref=e31]:
          - link "Découvrir la vision" [ref=e32] [cursor=pointer]:
            - /url: pourquoi.html
            - generic [ref=e33]: Découvrir la vision
          - link "Explorer la documentation" [ref=e34] [cursor=pointer]:
            - /url: documentation.html
            - generic [ref=e35]: Explorer la documentation
        - list "Statistiques du système" [ref=e36]:
          - listitem [ref=e37]:
            - generic [ref=e38]: 801+
            - generic [ref=e39]: tokens
          - listitem [ref=e40]:
            - generic [ref=e41]: "68"
            - generic [ref=e42]: ADRs
          - listitem [ref=e43]:
            - generic [ref=e44]: "163"
            - generic [ref=e45]: composants
          - listitem [ref=e46]:
            - generic [ref=e47]: "10"
            - generic [ref=e48]: gates qualité
      - figure [ref=e49]
    - generic [ref=e51]:
      - generic [ref=e52]:
        - paragraph [ref=e53]: Le problème
        - heading "Les équipes accumulent des décisions invisibles" [level=2] [ref=e54]
        - paragraph [ref=e55]: Les décisions se dispersent entre Figma, GitHub, Storybook, Slack et Confluence. La dette UX s'accumule en silence. La documentation devient obsolète. Les experts deviennent indispensables. L'IA reste inaccessible.
      - figure [ref=e56]
    - generic [ref=e58]:
      - generic [ref=e59]:
        - paragraph [ref=e60]: Humains et agents IA
        - heading "Conçu pour les humains. Prêt pour les agents IA." [level=2] [ref=e61]
        - paragraph [ref=e62]: Les humains comprennent, décident, approuvent et gouvernent. Les agents détectent, analysent, proposent et automatisent. Le dernier mot reste toujours humain.
      - figure [ref=e63]
    - generic [ref=e65]:
      - figure [ref=e66]
      - generic [ref=e67]:
        - paragraph [ref=e68]: Les connaissances
        - heading "Les connaissances sont un actif stratégique" [level=2] [ref=e69]
        - paragraph [ref=e70]: Les frameworks évoluent. Les outils changent. Les technologies disparaissent. Les connaissances doivent survivre. Agentica les structure pour qu'elles restent lisibles demain — par les humains et les agents IA.
    - generic [ref=e72]:
      - generic [ref=e73]:
        - paragraph [ref=e74]: Architecture
        - heading "Une seule source de vérité" [level=2] [ref=e75]
        - paragraph [ref=e76]: Une même source alimente les fondations, les contrats sémantiques, les composants et les applications. Quatre niveaux. Une seule chaîne de décisions.
      - figure [ref=e77]
    - generic [ref=e79]:
      - generic [ref=e80]:
        - paragraph [ref=e81]: Pour chaque rôle
        - heading "Une valeur différente pour chaque rôle" [level=2] [ref=e82]
      - generic [ref=e83]:
        - article [ref=e84]:
          - heading "Organisation" [level=3] [ref=e85]
          - paragraph [ref=e86]: Une mémoire commune des décisions, lisible et gouvernable.
        - article [ref=e87]:
          - heading "Gestionnaires" [level=3] [ref=e88]
          - paragraph [ref=e89]: Des arbitrages visibles, traçables et reliés à la valeur.
        - article [ref=e90]:
          - heading "Responsables produit" [level=3] [ref=e91]
          - paragraph [ref=e92]: Des choix produit connectés aux preuves et aux contraintes.
        - article [ref=e93]:
          - heading "Designers" [level=3] [ref=e94]
          - paragraph [ref=e95]: Des intentions de design préservées au-delà des écrans.
        - article [ref=e96]:
          - heading "Développeurs" [level=3] [ref=e97]
          - paragraph [ref=e98]: Des contrats explicites pour construire sans interpréter au hasard.
    - generic [ref=e100]:
      - generic [ref=e101]:
        - paragraph [ref=e102]: Qualité
        - heading "La qualité est une propriété du système" [level=2] [ref=e103]
        - paragraph [ref=e104]: L'accessibilité, les régressions visuelles, la documentation, les ADRs et la cohérence ne sont pas ajoutées après coup. Elles font partie du système. Rien n'entre sans contrôle.
      - generic [ref=e105]:
        - generic [ref=e107]: Accessibilité WCAG 2.1
        - generic [ref=e109]: Régressions visuelles
        - generic [ref=e111]: Documentation
        - generic [ref=e112]: ADRs
        - generic [ref=e114]: Cohérence tokens
    - generic [ref=e116]:
      - generic [ref=e117]:
        - paragraph [ref=e118]: Traçabilité
        - heading "Chaque décision possède une mémoire" [level=2] [ref=e119]
        - paragraph [ref=e120]: Derrière chaque bouton, chaque couleur, chaque règle d'accessibilité se cache une décision. Agentica en préserve le contexte, les alternatives et les compromis — afin que personne ne réinvente ce qui a déjà été résolu.
        - link "Voir les 68 ADRs →" [ref=e122] [cursor=pointer]:
          - /url: decisions/index.html
          - generic [ref=e123]: Voir les 68 ADRs →
      - figure [ref=e124]
    - generic [ref=e126]:
      - figure [ref=e127]
      - generic [ref=e128]:
        - paragraph [ref=e129]: Intelligence artificielle
        - heading "Automatiser sans abandonner le contrôle" [level=2] [ref=e130]
        - paragraph [ref=e131]: Les agents peuvent générer, détecter, documenter et proposer. Ils ne peuvent pas approuver, déployer ou contourner la gouvernance.
    - generic [ref=e133]:
      - generic [ref=e134]:
        - paragraph [ref=e135]: Durabilité
        - heading "Construire pour aujourd'hui. Préserver pour demain." [level=2] [ref=e136]
        - paragraph [ref=e137]: Agentica repose sur les standards ouverts du W3C. Ses composants sont des Web Components natifs, portables, indépendants des frameworks. Ses décisions survivent aux outils.
        - paragraph [ref=e138]: "Le système fonctionne aussi sans agent IA : chaque flux critique a un équivalent humain documenté et testé."
        - link "Voir le plan de continuité →" [ref=e140] [cursor=pointer]:
          - /url: continuite.html
          - generic [ref=e141]: Voir le plan de continuité →
      - figure [ref=e142]
    - generic [ref=e144]:
      - generic [ref=e145]:
        - paragraph [ref=e146]: Agentica
        - heading "Prêt à explorer Agentica ?" [level=2] [ref=e147]
        - paragraph [ref=e148]: Transformez les décisions en connaissances durables, lisibles par les humains et les agents IA.
        - generic [ref=e149]:
          - link "Démarrer" [ref=e150] [cursor=pointer]:
            - /url: get-started.html
            - generic [ref=e151]: Démarrer
          - link "Explorer les composants" [ref=e152] [cursor=pointer]:
            - /url: components/index.html
            - generic [ref=e153]: Explorer les composants
          - link "GitHub →" [ref=e154] [cursor=pointer]:
            - /url: https://github.com/gnegreiros-ux/agentic-design-system
      - figure [ref=e155]
  - contentinfo [ref=e156]:
    - generic [ref=e157]:
      - generic [ref=e158]:
        - link "Agentica — Accueil" [ref=e159] [cursor=pointer]:
          - /url: index.html
          - img "Agentica" [ref=e160]
        - link "Guilherme Negreiros" [ref=e161] [cursor=pointer]:
          - /url: https://www.linkedin.com/in/gnegreiros/
          - img [ref=e162]
          - text: Guilherme Negreiros
      - generic [ref=e166]:
        - generic [ref=e167]: Navigation
        - link "Accueil" [ref=e168] [cursor=pointer]:
          - /url: index.html
        - link "Pourquoi" [ref=e169] [cursor=pointer]:
          - /url: pourquoi.html
        - link "Architecture" [ref=e170] [cursor=pointer]:
          - /url: architecture.html
        - link "Qualité" [ref=e171] [cursor=pointer]:
          - /url: qualite.html
        - link "IA" [ref=e172] [cursor=pointer]:
          - /url: ia.html
      - generic [ref=e173]:
        - generic [ref=e174]: Documentation
        - link "Comprendre" [ref=e175] [cursor=pointer]:
          - /url: pourquoi.html
        - link "Démarrer" [ref=e176] [cursor=pointer]:
          - /url: get-started.html
        - link "Fondations" [ref=e177] [cursor=pointer]:
          - /url: foundations/index.html
        - link "Composants" [ref=e178] [cursor=pointer]:
          - /url: components/index.html
        - link "Tokens" [ref=e179] [cursor=pointer]:
          - /url: tokens/index.html
        - link "Décisions" [ref=e180] [cursor=pointer]:
          - /url: decisions/index.html
        - link "Continuité" [ref=e181] [cursor=pointer]:
          - /url: continuite.html
      - generic [ref=e182]:
        - generic [ref=e183]: Explorer
        - link "Storybook" [ref=e184] [cursor=pointer]:
          - /url: https://main--6a1c1e665ec5fe8fc0540983.chromatic.com/
        - link "GitHub" [ref=e185] [cursor=pointer]:
          - /url: https://github.com/gnegreiros-ux/agentic-design-system
        - link "Audit" [ref=e186] [cursor=pointer]:
          - /url: audit.html
        - link "Brief IA" [ref=e187] [cursor=pointer]:
          - /url: ai-brief.html
    - generic [ref=e188]:
      - generic [ref=e189]: © 2026 Guilherme Negreiros
      - generic [ref=e190]: Construit avec Claude Code.
  - button "Retour en haut" [ref=e191] [cursor=pointer]:
    - img [ref=e192]
    - generic [ref=e194]: Haut
  - status [ref=e195]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Home — régressions visuelles', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     // Attendre que les illustrations lazy soient potentiellement visibles
  7  |     await page.waitForLoadState('networkidle');
  8  |   });
  9  | 
  10 |   test('light mode — pleine page', async ({ page }) => {
  11 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  12 |     await expect(page).toHaveScreenshot('home-light.png', { fullPage: true });
  13 |   });
  14 | 
  15 |   test('dark mode — pleine page', async ({ page }) => {
  16 |     await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
> 17 |     await expect(page).toHaveScreenshot('home-dark.png', { fullPage: true });
     |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
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
  31 |     await expect(page).toHaveScreenshot('home-hero-dark.png', {
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