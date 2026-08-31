import { test, expect } from '@playwright/test';

test.describe('Authentication & RBAC Guarding', () => {
  test('Unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/farmer/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Farmer cannot access Admin dashboard', async ({ page }) => {
    // 1. Login as Farmer
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'farmer@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'FARMER');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/farmer\/dashboard/);

    // 2. Try to navigate to Admin
    await page.goto('/admin/dashboard');
    
    // 3. Should be shown unauthorized screen
    await expect(page.locator('h2:has-text("Access Restricted")')).toBeVisible({ timeout: 5000 });
  });

  test('Consumer defaults to root auth but can access verify', async ({ page }) => {
    await page.goto('/verify');
    await expect(page).toHaveURL(/.*\/verify/);
    await expect(page.locator('h1')).toContainText('Authenticity Verification');
  });
});
