import { test, expect } from '@playwright/test';

test.describe('Verify All 4 Roles Login', () => {

  test('1. Student login (8230537)', async ({ page }) => {
    await page.goto('/public/role-selection.html');
    await page.click('.role-btn.student');
    await page.waitForURL(/\/public\/login/, { timeout: 10000 });

    await page.fill('#identifier', '8230537');
    await page.fill('#password', '8230537');
    await page.click('#submitBtn');

    // Wait for redirect to student dashboard
    await page.waitForURL(/\/student\/student/, { timeout: 15000 });
    console.log('Student successfully reached:', page.url());
    expect(page.url()).toContain('student/student');
  });

  test('2. Staff login (1122334)', async ({ page }) => {
    await page.goto('/public/role-selection.html');
    await page.click('.role-btn.staff');
    await page.waitForURL(/\/public\/login/, { timeout: 10000 });

    await page.fill('#identifier', '1122334');
    await page.fill('#password', 'staff123');
    await page.click('#submitBtn');

    // Wait for redirect to staff dashboard
    await page.waitForURL(/\/staff\/staff/, { timeout: 15000 });
    console.log('Staff successfully reached:', page.url());
    expect(page.url()).toContain('staff/staff');
  });

  test('3. Parent login (ayenngyabut@gmail.com)', async ({ page }) => {
    await page.goto('/parent/parent.html?view=auth');
    await page.waitForSelector('#emailInput', { state: 'visible', timeout: 10000 });

    await page.fill('#emailInput', 'ayenngyabut@gmail.com');
    await page.fill('#passwordInput', 'alexasuzane');
    await page.click('#submitBtn');

    // Wait for dashboard view or state
    await page.waitForTimeout(4000);
    const url = page.url();
    console.log('Parent URL after submit:', url);
    const parentAuth = page.locator('#parentAuthSection');
    const authHidden = await parentAuth.evaluate(el => el.classList.contains('is-hidden') || el.style.display === 'none').catch(() => false);
    console.log('Parent auth hidden (dashboard active):', authHidden);
    expect(authHidden).toBeTruthy();
  });

  test('4. Admin login (admin@admin.com)', async ({ page }) => {
    await page.goto('/admin/admin.html?view=login');
    await page.waitForSelector('#adminEmail', { state: 'visible', timeout: 10000 });

    await page.fill('#adminEmail', 'admin@admin.com');
    await page.fill('#password', 'admin123');
    await page.click('#submitBtn');

    // Wait for admin dashboard view
    await page.waitForTimeout(4000);
    const loginHidden = await page.locator('#adminLoginSection').evaluate(el => el.classList.contains('is-hidden') || el.style.display === 'none').catch(() => false);
    console.log('Admin login hidden (command center active):', loginHidden);
    expect(loginHidden).toBeTruthy();
  });

  // (2026-07-13) Test duplicate student ID rejection; was untested
  test('5. Student signup rejects duplicate ID (8230537)', async ({ page }) => {
    await page.goto('/public/role-selection.html');
    await page.click('.role-btn.student');
    await page.waitForURL(/\/public\/login/, { timeout: 10000 });

    await page.click('#signupTab');
    await page.fill('#studentIdSignup', '8230537');
    await page.fill('#password', 'newpass1234');
    await page.fill('#confirmPasswordSignup', 'newpass1234');
    await page.click('#submitBtn');

    await page.waitForSelector('#errorMsg:not(:empty)', { timeout: 10000 });
    const errText = await page.textContent('#errorMsg');
    console.log('Duplicate ID error message:', errText);
    expect(errText).toContain('already registered');
  });

  // (2026-07-13) Test new student auto-registration & login; was untested
  test('6. Student signup auto-logs in with new ID', async ({ page }) => {
    const randomId = String(Math.floor(1000000 + Math.random() * 9000000));
    await page.goto('/public/role-selection.html');
    await page.click('.role-btn.student');
    await page.waitForURL(/\/public\/login/, { timeout: 10000 });

    await page.click('#signupTab');
    await page.fill('#studentIdSignup', randomId);
    await page.fill('#studentEmailSignup', `student_${randomId}@example.com`);
    await page.fill('#password', 'pass123456');
    await page.fill('#confirmPasswordSignup', 'pass123456');
    await page.click('#submitBtn');

    await page.waitForURL(/\/student\/student/, { timeout: 20000 });
    console.log('New registered student reached:', page.url());
    expect(page.url()).toContain('student/student');
  });

  // (2026-07-13) Test OTP dispatched to linked parent if no student email; was untested
  test('7. Forgot password dispatches OTP to linked parent email', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('/public/role-selection.html');
    await page.click('.role-btn.student');
    await page.waitForURL(/\/public\/login/, { timeout: 10000 });

    await page.click('#forgotPassword');
    await page.waitForSelector('#studentResetModal.active', { timeout: 5000 });

    await page.fill('#studentResetIdInput', '8230537');
    await page.click('#studentResetSendBtn');

    await page.waitForTimeout(6000);
    const errText = await page.textContent('#studentResetError');
    console.log('studentResetError after click:', errText);

    // Wait for step 2 (OTP input view)
    await page.waitForSelector('#studentResetOtpView', { state: 'visible', timeout: 15000 });
    const targetEmail = await page.textContent('#studentResetTargetEmail');
    const recipientHint = await page.textContent('#studentResetRecipientHint');
    console.log('OTP target email:', targetEmail, '| hint:', recipientHint);

    expect(recipientHint.toLowerCase()).toContain('parent');
    expect(targetEmail).toContain('@');
  });

});
