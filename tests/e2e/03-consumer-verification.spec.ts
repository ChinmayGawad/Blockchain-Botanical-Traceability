import { test, expect } from '@playwright/test';

test.describe('Consumer Verification E2E', () => {
  test('Consumer can verify a product by ID', async ({ page }) => {
    await page.goto('/verify');
    
    // Fill the verification input
    await page.fill('input[placeholder="Enter Batch ID (e.g. ASH-2024-089)..."]', 'BOT-2024-8901');
    await page.click('button:has-text("Verify")');
    
    // Expect some loading or result block
    await expect(page.locator('h1').filter({ hasText: /Authenticity/i }).first()).toBeVisible({ timeout: 5000 });
  });
});
