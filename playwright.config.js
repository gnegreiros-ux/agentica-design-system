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
    // Disables animations for deterministic screenshots
    reducedMotion: 'reduce',
  },

  projects: [
    // Chromium: visual + functional tests (reference snapshots = Chromium only)
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Firefox and WebKit: functional and accessibility tests only (no visual snapshots).
    // language.spec.js is also chromium-only — it's a content/CSS-mechanics check
    // (display:none per data-lang), not browser-specific, so running it 3x adds cost
    // with no extra signal across ~125 pages.
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: ['**/visual/**', '**/language.spec.js'] },
    { name: 'webkit',  use: { ...devices['Desktop Safari'] },  testIgnore: ['**/visual/**', '**/language.spec.js'] },
    // Responsive breakpoints — mobile visual on Chromium only
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/visual/home.spec.js',
    },
  ],

  // Local server — built by the CI workflow before the test
  webServer: {
    command: 'npx serve site/dist -p 8080 --no-clipboard',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
