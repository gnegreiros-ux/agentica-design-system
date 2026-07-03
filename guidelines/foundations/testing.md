# Testing — Guide pour les équipes consommatrices

> Ce guide s'adresse aux **équipes produit** qui consomment le design system Agentica
> et souhaitent tester leur produit final.
>
> Pour les tests du design system lui-même, voir `How-to-devs.md`.

---

## Les deux périmètres (ADR-066)

Le design system distingue deux responsabilités distinctes :

| Périmètre | Propriétaire | Dépôt | Outil |
|-----------|-------------|-------|-------|
| Tests DS | Équipe DS | `agentic-design-system` | Playwright (CI interne) |
| Tests produit | Votre équipe | Votre dépôt | Playwright (votre CI) |

Le DS ne peut pas tester votre produit à votre place — il ne connaît pas votre contexte,
vos pages, ni vos décisions visuelles. Il vous fournit un kit pour démarrer.

---

## Setup minimal en 3 étapes

### 1. Installer Playwright dans votre projet

```bash
npm init playwright@latest
# → Choisir JavaScript, dossier tests/, ajouter GitHub Actions
```

### 2. Configurer la base URL

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000', // votre port de dev
    reducedMotion: 'reduce',          // screenshots déterministes
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. Charger les tokens DS dans vos tests

Les composants `agtc-*` nécessitent les tokens CSS pour s'afficher correctement.
Si votre app charge déjà `agtc.js` et `tokens.css`, rien à faire de plus.

---

## Patterns de test recommandés

### Test visuel de base (light + dark)

```js
import { test, expect } from '@playwright/test';

test.describe('Ma page produit', () => {
  for (const theme of ['light', 'dark']) {
    test(`rendu ${theme}`, async ({ page }) => {
      await page.goto('/ma-page');
      await page.evaluate((t) =>
        document.documentElement.setAttribute('data-theme', t), theme
      );
      await expect(page).toHaveScreenshot(`ma-page-${theme}.png`, { fullPage: true });
    });
  }
});
```

### Vérifier qu'un composant DS s'affiche correctement

```js
import { test, expect } from '@playwright/test';

test('agtc-button — variantes visibles', async ({ page }) => {
  await page.goto('/ma-page-avec-bouton');
  const btn = page.locator('agtc-button[variant="primary"]');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveScreenshot('btn-primary.png');
});
```

### Tester le comportement d'un composant DS interactif

```js
test('agtc-top-nav — menu mobile s\'ouvre', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.locator('.menu-btn').click();
  await expect(page.locator('.site-nav')).toBeVisible();
});
```

### Intégration axe-core (accessibilité)

```bash
npm install -D @axe-core/playwright
```

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('ma page — 0 violation WCAG', async ({ page }) => {
  await page.goto('/ma-page');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

## Gérer les mises à jour DS

Quand vous montez la version du DS dans votre `package.json`, certains composants peuvent
avoir changé visuellement (refonte, correction de contraste, nouveau token).

**Processus recommandé après un upgrade DS :**

```bash
# 1. Mettre à jour le DS
npm install @agentica/design-system@latest

# 2. Lancer vos tests visuels
npx playwright test

# 3. Si des diffs apparaissent :
#    - Consulter le CHANGELOG du DS
#    - Comparer le diff visuel : intentionnel ou régression ?
#    - Si intentionnel → mettre à jour vos snapshots
npx playwright test --update-snapshots

# 4. Committer les nouveaux snapshots avec une note dans votre PR
```

---

## Où trouver la documentation des comportements testables

Chaque composant `agtc-*` documente ses comportements attendus dans `guidelines/components/` :

| Composant | Guideline |
|-----------|-----------|
| `agtc-button` | `guidelines/components/button.md` |
| `agtc-top-nav` | `guidelines/components/top-nav.md` |
| `agtc-card` | `guidelines/components/card.md` |
| … | `guidelines/components/` |

Ces guidelines décrivent les états, variantes et accessibilité — ce sont les comportements
que vos tests doivent couvrir si vous utilisez ces composants.

---

## Règles de gouvernance

```
✅ Vos snapshots vivent dans votre dépôt — pas dans le dépôt DS
✅ Vous êtes propriétaires de vos tests et de vos baselines
✅ Toute approbation de diff visuel est de votre responsabilité
❌ Ne pas demander au DS de maintenir vos tests produit
❌ Ne pas tester en utilisant des valeurs hex ou px issues des tokens (ils peuvent changer)
   → Tester le comportement observable, pas les valeurs internes
```
