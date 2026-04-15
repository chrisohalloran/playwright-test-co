import { test, expect } from '@playwright/test';
// Tests for: src/components/login-form.js

test.describe('Login Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#login');
  });

  test('shows login form with email and password fields', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-btn')).toHaveText('Sign In');
  });

  test('requires email field to be filled', async ({ page }) => {
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    // HTML5 required validation prevents submission — email field should still be empty
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveValue('');
  });

  test('shows error for short password', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '123');
    await page.click('#login-btn');
    await expect(page.locator('#login-error')).toBeVisible();
    await expect(page.locator('#login-error')).toHaveText('Password must be at least 6 characters');
  });

  test('navigates to dashboard on successful login', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    await expect(page.locator('#login-btn')).toHaveText('Signing in...');
    await page.waitForURL(/#dashboard/);
  });
});
