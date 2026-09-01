import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = 'C:/Users/Chimmay/.gemini/antigravity-cli/brain/55201341-cf1b-4f07-adef-032519eca17c';
const SEED_BATCH = 'ASH-2026-001';

test.describe.serial('Full Lifecycle Demo Walkthrough', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh session
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('1. Farmer Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'farmer@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'FARMER');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/farmer\/dashboard/);
    await page.waitForTimeout(1000); // Wait for animations/data
    await page.screenshot({ path: `${ARTIFACT_DIR}/01-farmer-dashboard.png`, fullPage: true });
  });

  test('2. Processor Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'processor@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'PROCESSOR');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/processor\/dashboard/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/02-processor-dashboard.png`, fullPage: true });
  });

  test('3. Laboratory Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'lab@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'LABORATORY');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/laboratory\/dashboard/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/03-laboratory-dashboard.png`, fullPage: true });
  });

  test('4. Distributor Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'distributor@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'DISTRIBUTOR');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/distributor\/dashboard/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/04-distributor-dashboard.png`, fullPage: true });
  });

  test('5. Retailer Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email address"]', 'retailer@test.com');
    await page.fill('input[placeholder="Enter password"]', 'password123');
    await page.selectOption('select', 'RETAILER');
    await page.click('button:has-text("Sign in")');
    
    await expect(page).toHaveURL(/.*\/retailer\/dashboard/);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/05-retailer-dashboard.png`, fullPage: true });
  });

  test('6. Consumer Verification Portal', async ({ page }) => {
    await page.goto('/verify');
    
    // Check if the input placeholder is correctly matched
    const verifyInput = page.locator('input[placeholder*="Enter Batch ID"]');
    if (await verifyInput.count() > 0) {
      await verifyInput.fill(SEED_BATCH);
    } else {
      // Fallback if placeholder is different
      await page.locator('input').first().fill(SEED_BATCH);
    }
    
    await page.click('button:has-text("Verify")');
    
    // Wait for result to appear
    await expect(page.locator('h1').filter({ hasText: /Authenticity/i }).first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for specific animations like TrustScore to fill
    
    await page.screenshot({ path: `${ARTIFACT_DIR}/06-consumer-verification.png`, fullPage: true });
  });

});
