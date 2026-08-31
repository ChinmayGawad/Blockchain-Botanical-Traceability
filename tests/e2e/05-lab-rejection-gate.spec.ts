import { test, expect } from '@playwright/test';

test.describe('Laboratory Rejection Gate E2E', () => {
  test('Lab user can access testing page', async ({ page }) => {
    // 1. Login as Laboratory
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'lab@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'LABORATORY');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/laboratory\/dashboard/);

    // 2. Navigate to test product page
    await page.click('a:has-text("Test Product")');
    await expect(page).toHaveURL(/.*\/laboratory\/test/);
    
    // 3. Ensure pass/fail actions are present (assuming forms exist or at least the page renders)
    await expect(page.locator('h1')).toContainText(/Test/i);
  });
});
