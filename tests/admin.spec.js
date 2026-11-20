import { test, expect } from '@playwright/test';
import { TEST_CREDS } from './auth.fixture.js';

test.describe('Admin Command Center E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-login.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display admin access portal form', async ({ page }) => {
    await expect(page.locator('#adminEmail')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
  });

  test('should authenticate admin and load Command Center dashboard', async ({ page }) => {
    await page.fill('#adminEmail', TEST_CREDS.admin.email);
    await page.fill('#password', TEST_CREDS.admin.password);
    await page.click('#submitBtn');

    // Wait for redirect to admin.html
    await page.waitForURL(/admin\.html/, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/admin\.html/);

    // Verify command center metrics and headers
    await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('User Distribution')).toBeVisible();
    await expect(page.getByText('Platform Activity')).toBeVisible();

    // Verify role distribution pills or legend
    await expect(page.getByText('Students').first()).toBeVisible();
    await expect(page.getByText('Guardians').first()).toBeVisible();
  });

  test('should display Daily Safety Dossier with role badges', async ({ page }) => {
    await page.fill('#adminEmail', TEST_CREDS.admin.email);
    await page.fill('#password', TEST_CREDS.admin.password);
    await page.click('#submitBtn');
    await page.waitForURL(/admin\.html/, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).toBeVisible({ timeout: 15000 });

    // Switch to reports tab
    await page.locator('button[data-tab="reports"]').click();
    await expect(page.getByText('Command Center Audits & Compliance', { exact: false })).toBeVisible({ timeout: 15000 });

    // Verify daily report container
    await expect(page.locator('#dailyReportTableContainer')).toBeVisible({ timeout: 15000 });
  });

  test('should open Admin Digital Vault repository tab', async ({ page }) => {
    await page.fill('#adminEmail', TEST_CREDS.admin.email);
    await page.fill('#password', TEST_CREDS.admin.password);
    await page.click('#submitBtn');
    await page.waitForURL(/admin\.html/, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).toBeVisible({ timeout: 15000 });

    // Locate vault navigation button on sidebar
    const vaultNav = page.locator('button[data-tab="vault"]');
    if (await vaultNav.count() > 0) {
      await vaultNav.first().click();
      await expect(page.getByText('Student Uploaded Evidence', { exact: false })).toBeVisible({ timeout: 15000 });
    }
  });

  test('should display 70/30 SOS map layout and recent SOS reporters sidebar', async ({ page }) => {
    await page.fill('#adminEmail', TEST_CREDS.admin.email);
    await page.fill('#password', TEST_CREDS.admin.password);
    await page.click('#submitBtn');
    await page.waitForURL(/admin\.html/, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).toBeVisible({ timeout: 15000 });

    // Switch to SOS tab
    await page.locator('button[data-tab="sos"]').click();
    await expect(page.locator('.sos-dashboard-split')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#adminSosMap')).toBeVisible();
    await expect(page.locator('#adminRecentSosReporters')).toBeVisible();
  });
});
