import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user', async ({ page }) => {
    await page.click('text=Register');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=testuser')).toBeVisible();
  });

  test('should login with credentials', async ({ page }) => {
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=testuser')).toBeVisible();
  });

  test('should connect wallet', async ({ page }) => {
    await page.click('text=Connect Wallet');
    // Mock MetaMask connection
    await page.evaluate(() => {
      window.ethereum = {
        request: async ({ method }) => {
          if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          if (method === 'eth_chainId') {
            return '0x3E9'; // Chiliz Spicy Testnet
          }
        },
        on: () => {},
        removeListener: () => {}
      };
    });
    
    // Should show connected address
    await expect(page.locator('text=0x1234...7890')).toBeVisible();
  });

  test('should logout', async ({ page }) => {
    // First login
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Then logout
    await page.click('text=Logout');
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Login')).toBeVisible();
  });
});
