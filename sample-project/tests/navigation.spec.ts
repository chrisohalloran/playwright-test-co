import { test, expect } from '@playwright/test';
// Tests for: public/index.html (navigation/routing)

test.describe('Navigation', () => {
  test('navigates between pages via nav links', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[data-page="dashboard"]');
    await expect(page.locator('#page-dashboard')).toHaveClass(/active/);
    await page.click('nav a[data-page="settings"]');
    await expect(page.locator('#page-settings')).toHaveClass(/active/);
  });

  test('highlights active nav link', async ({ page }) => {
    await page.goto('/#settings');
    await expect(page.locator('nav a[data-page="settings"]')).toHaveClass(/active/);
  });
});
