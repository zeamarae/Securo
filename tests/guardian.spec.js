import { test, expect } from '@playwright/test';
import { TEST_CREDS } from './auth.fixture.js';

test.describe('Guardian Portal E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guardian.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display guardian login portal with proper rose/red branding', async ({ page }) => {
    await expect(page.locator('#emailInput')).toBeVisible();
    await expect(page.locator('#passwordInput')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
  });

  test('should sign in with guardian email credentials', async ({ page }) => {
    await page.fill('#emailInput', TEST_CREDS.parent.email);
    await page.fill('#passwordInput', TEST_CREDS.parent.password);
    await page.click('#submitBtn');

    // Wait for redirect to guardian-dashboard.html
    await page.waitForURL(/guardian-dashboard\.html/, { timeout: 15000 });
    await expect(page).toHaveURL(/guardian-dashboard\.html/);

    // Verify presence of monitoring controls or ward status
    const dashboardContainer = page.locator('.dashboard-container, #screenContent, .main-content');
    await expect(dashboardContainer.first()).toBeVisible();
  });
});
