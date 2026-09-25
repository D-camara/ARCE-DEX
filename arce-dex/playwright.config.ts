import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests against the production build (vite preview), with PokeAPI replaced by a
 * deterministic fake (e2e/fixtures/fakePokeApi.ts) — no network, stable data.
 * Files are *.e2e.ts so Vitest never picks them up.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    serviceWorkers: 'block',
    // Deterministic end states. Must go through contextOptions: a bare `reducedMotion` key in
    // `use` is not a Playwright option and was silently ignored (animations ran everywhere).
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  // One project per kind of screen the app must work on (see docs/design-system/MASTER.md).
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 740 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'mobile-landscape', use: { ...devices['Pixel 7 landscape'], viewport: { width: 740, height: 360 } } },
    { name: 'fold', use: { ...devices['Pixel 7'], viewport: { width: 280, height: 653 } } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
