import { test, expect } from '@playwright/test';

test.describe('Admin Governance E2E', () => {
  test('Admin can view dashboard and navigate menus', async ({ page }) => {
    // 1. Login as Admin
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'admin@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'ADMIN');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);

    // 2. Check Admin menus
    await expect(page.locator('a:has-text("User Approvals")')).toBeVisible();
    await expect(page.locator('a:has-text("Blockchain Explorer")')).toBeVisible();

    // 3. Navigate to User Approvals
    await page.click('a:has-text("User Approvals")');
    await expect(page).toHaveURL(/.*\/admin\/approvals/);
  });
});
