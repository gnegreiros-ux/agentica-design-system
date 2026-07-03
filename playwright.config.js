import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/visual/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    // Désactive les animations pour des screenshots déterministes
    reducedMotion: 'reduce',
  },

  projects: [
    // Chromium : tests visuels + fonctionnels (snapshots de référence = Chromium uniquement)
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Firefox et WebKit : tests fonctionnels et accessibilité seulement (pas de snapshots visuels)
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: '**/visual/**' },
    { name: 'webkit',  use: { ...devices['Desktop Safari'] },  testIgnore: '**/visual/**' },
    // Breakpoints responsive — visuel mobile sur Chromium uniquement
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/visual/home.spec.js',
    },
  ],

  // Serveur local — construit par le workflow CI avant le test
  webServer: {
    command: 'npx serve site/dist -p 8080 --no-clipboard',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
