// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for Securo
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5508',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /student\.spec\.js|guardian\.spec\.js|staff\.spec\.js|all-roles\.spec\.js/
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /admin\.spec\.js/
    }
  ],
  webServer: {
    command: 'npx serve -p 5508 .',
    url: 'http://127.0.0.1:5508',
    reuseExistingServer: true,
    timeout: 120000
  }
});
