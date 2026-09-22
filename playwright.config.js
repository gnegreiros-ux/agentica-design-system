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
    // with no extra signal across ~125 pages. Same reasoning for governance/: plain
    // Node assertions (no `page` fixture), browser-independent by construction.
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: ['**/visual/**', '**/language.spec.js', '**/governance/**'] },
    { name: 'webkit',  use: { ...devices['Desktop Safari'] },  testIgnore: ['**/visual/**', '**/language.spec.js', '**/governance/**'] },
    // Responsive breakpoints — mobile visual on Chromium only
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/visual/home.spec.js',
    },
  ],

  // Local servers — built by the CI workflow before the test
  webServer: [
    {
      command: 'npx serve site/dist -p 8080 --no-clipboard',
      url: 'http://localhost:8080',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    // Dedicated server for governance-accessibility.spec.js's fixtures
    // (C2-01 to C2-03) — a separate port, never mixed into site/dist, so a
    // deliberate WCAG violation is never part of what site-freshness.yml
    // or the production build track.
    {
      command: 'npx serve tests/functional/fixtures/governance-accessibility -p 8081 --no-clipboard',
      url: 'http://localhost:8081',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    // Dedicated server for doc-generator-accessibility.spec.js (C5-06) — the
    // generator's own output, never mixed into site/dist. The command
    // regenerates the fixture site before serving it, so the served content
    // always matches the current doc-generator/ source, not a stale commit.
    {
      command:
        'node doc-generator/bin/cli.mjs tests/functional/fixtures/doc-generator/design-system.manifest.json tests/functional/fixtures/doc-generator-dist && npx serve tests/functional/fixtures/doc-generator-dist -p 8082 --no-clipboard',
      url: 'http://localhost:8082',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
