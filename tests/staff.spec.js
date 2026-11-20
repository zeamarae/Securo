import { test, expect } from '@playwright/test';
import { TEST_CREDS } from './auth.fixture.js';

test.describe('Staff Portal E2E', () => {
  test('should select staff role and log in with staff ID', async ({ page }) => {
    // Navigate to role selection
    await page.goto('/role-selection.html');
    await page.waitForLoadState('domcontentloaded');

    // Select staff role
    const staffBtn = page.locator('.role-btn.staff');
    await expect(staffBtn).toBeVisible();
    await staffBtn.click();

    // Verify redirected to login with staff role styling
    await page.waitForURL(/login\.html/, { timeout: 10000 });
    await expect(page.locator('#identifier')).toBeVisible();

    // Enter staff credentials
    await page.fill('#identifier', TEST_CREDS.staff.id);
    await page.fill('#password', TEST_CREDS.staff.password);
    await page.click('#submitBtn');

    // Wait for redirect to index.html
    await page.waitForURL(/index\.html/, { timeout: 15000 });
    await expect(page).toHaveURL(/index\.html/);

    // Verify staff profile or interface loads
    await expect(page.locator('#screenContent')).toBeVisible({ timeout: 15000 });
  });
});
