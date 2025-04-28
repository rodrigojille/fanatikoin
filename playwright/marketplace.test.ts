import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
  });

  test('should create a new team token', async ({ page }) => {
    await page.goto('/marketplace/create');
    await page.fill('input[name="name"]', 'Test Team Token');
    await page.fill('input[name="symbol"]', 'TTT');
    await page.fill('input[name="initialSupply"]', '1000000');
    await page.fill('input[name="price"]', '0.1');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Token created successfully')).toBeVisible();
  });

  test('should list token for sale', async ({ page }) => {
    await page.goto('/marketplace');
    await page.click('text=List Token');
    await page.fill('input[name="amount"]', '1000');
    await page.fill('input[name="price"]', '0.2');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Token listed successfully')).toBeVisible();
  });

  test('should buy token from marketplace', async ({ page }) => {
    await page.goto('/marketplace');
    await page.click('text=Test Team Token');
    await page.fill('input[name="amount"]', '100');
    await page.click('text=Buy Now');
    
    // Should show success message
    await expect(page.locator('text=Purchase successful')).toBeVisible();
    
    // Should update balance
    await expect(page.locator('text=Balance: 100 TTT')).toBeVisible();
  });

  test('should create auction', async ({ page }) => {
    await page.goto('/marketplace/auctions');
    await page.click('text=Create Auction');
    await page.fill('input[name="tokenAmount"]', '500');
    await page.fill('input[name="startingPrice"]', '0.1');
    await page.fill('input[name="duration"]', '24');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Auction created successfully')).toBeVisible();
  });

  test('should place bid in auction', async ({ page }) => {
    await page.goto('/marketplace/auctions');
    await page.click('text=Test Team Token Auction');
    await page.fill('input[name="bidAmount"]', '0.15');
    await page.click('text=Place Bid');
    
    // Should show success message
    await expect(page.locator('text=Bid placed successfully')).toBeVisible();
  });
});
