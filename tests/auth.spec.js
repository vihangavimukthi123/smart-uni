import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('#sc_user_email_identity', 'wrong@example.com');
    await page.fill('#sc_user_sec_token', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Wait for toast or error message
    // Wait for toast or error message
    // Based on manual verification, the error is "Invalid email or password"
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Create an account');
    await page.click('text=Default User');
    
    await expect(page).toHaveURL(/\/register/);
  });
});
