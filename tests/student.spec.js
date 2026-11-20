import { test, expect } from '@playwright/test';
import { TEST_CREDS } from './auth.fixture.js';

test.describe('Student Portal E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/login.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should successfully sign in with student ID', async ({ page }) => {
    await page.fill('#identifier', TEST_CREDS.student.id);
    await page.fill('#password', TEST_CREDS.student.password);
    await page.click('#submitBtn');

    // Wait for redirect to index.html and preloader fade
    await page.waitForURL(/index\.html/, { timeout: 15000 });
    await expect(page).toHaveURL(/index\.html/);

    // Verify main screen elements after preloader dismiss
    await expect(page.locator('#screenContent')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#topbarHomeBrand')).toBeVisible({ timeout: 10000 });
  });

  test('should open Digital Vault and show persistent cached evidence count', async ({ page }) => {
    // Direct session load or sign in
    await page.fill('#identifier', TEST_CREDS.student.id);
    await page.fill('#password', TEST_CREDS.student.password);
    await page.click('#submitBtn');
    await page.waitForURL(/index\.html/, { timeout: 15000 });

    // Switch to Digital Vault tab
    const vaultTab = page.locator('button[data-nav="vault"]');
    await expect(vaultTab).toBeVisible();
    await vaultTab.click();

    // Verify Vault view is active
    const vaultPage = page.locator('#page-vault');
    await expect(vaultPage).toBeVisible();

    // Verify evidence stat counter displays files without flashing empty
    const totalEvidence = page.locator('#vaultTotalEvidence');
    await expect(totalEvidence).toBeVisible();
    const countText = await totalEvidence.textContent();
    expect(countText).toMatch(/\d+\s+Files?/i);
  });

  test('should open and close confidential GAD Support chat interface', async ({ page }) => {
    await page.fill('#identifier', TEST_CREDS.student.id);
    await page.fill('#password', TEST_CREDS.student.password);
    await page.click('#submitBtn');
    await page.waitForURL(/index\.html/, { timeout: 15000 });

    // Open GAD Support modal via Floating Action Button
    const gadBtn = page.locator('#globalGadFab');
    if (await gadBtn.isVisible()) {
      await gadBtn.click();
    } else {
      await page.locator('#openGadPmBtn').click();
    }

    const gadModal = page.locator('#gadPmModal');
    await expect(gadModal).toHaveClass(/active/);
    await expect(page.locator('.gad-chat-header')).toBeVisible();

    // Verify absence of confidential divider sub-bar
    await expect(page.locator('.gad-chat-anon')).toHaveCount(0);

    // Close GAD chat
    await page.locator('#closeGadPmModalBtn').click();
    await expect(gadModal).not.toHaveClass(/active/);
  });

  test('should navigate between Map and SOS tabs smoothly', async ({ page }) => {
    await page.fill('#identifier', TEST_CREDS.student.id);
    await page.fill('#password', TEST_CREDS.student.password);
    await page.click('#submitBtn');
    await page.waitForURL(/index\.html/, { timeout: 15000 });

    // Open SOS view
    await page.click('button[data-nav="sos"]');
    await expect(page.locator('#page-sos')).toBeVisible();

    // Return to Map view
    await page.click('button[data-nav="map"]');
    await expect(page.locator('#page-map')).toBeVisible();
  });
});
