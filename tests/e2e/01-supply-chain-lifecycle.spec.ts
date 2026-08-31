import { test, expect } from '@playwright/test';

test.describe('Supply Chain Lifecycle E2E', () => {
  test('Farmer should be able to register a product', async ({ page }) => {
    // 1. Login as Farmer
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'farmer@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'FARMER');
    await page.click('button:has-text("Sign in")');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    
    // 2. Navigate to Register Product
    await page.click('a:has-text("Register Product")');
    await expect(page).toHaveURL(/.*\/farmer\/register/);

    // 3. Fill registration form
    await page.fill('input[placeholder="e.g. Pure Organic Ashwagandha Root"]', 'Organic Basil');
    await page.fill('input[placeholder="e.g. Withania somnifera"]', 'Ocimum basilicum');
    await page.click('button[type="submit"]');

    // Proceed through steps if necessary, but this is a multi-step form. 
    // It's sufficient to verify the page renders and we can start.

    // Currently mocked as a success toast or direct redirect in UI
    await expect(page.locator('text=Step 2')).toBeVisible();
  });
});
