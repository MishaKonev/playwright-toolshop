import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  outputDir: './test-output/test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The app is a shared public demo, so CI retries once to absorb network hiccups
  retries: process.env.CI ? 1 : 0,
  // The app under test is a shared public demo: keep the load on it low
  workers: 2,
  reporter: process.env.CI
    ? [['list'], ['blob', { outputDir: './test-output/blobs' }]]
    : [['list'], ['html', { open: 'never', outputFolder: './test-output/playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    // The app marks its elements with data-test="..." instead of data-testid
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
  },
  projects: [
    // Logs in once via API and saves the session, so UI tests start already signed in
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'chromium',
      testIgnore: /api\//,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
