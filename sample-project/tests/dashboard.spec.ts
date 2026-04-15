import { test, expect } from '@playwright/test';
// Tests for: src/components/dashboard.js

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#dashboard');
  });

  test('displays dashboard heading', async ({ page }) => {
    await expect(page.locator('#dashboard h1')).toHaveText('Dashboard');
  });

  test('loads and displays metrics', async ({ page }) => {
    await expect(page.locator('#total-tests .metric-value')).toHaveText('142', { timeout: 5000 });
    await expect(page.locator('#pass-rate .metric-value')).toHaveText('94%');
    await expect(page.locator('#avg-duration .metric-value')).toHaveText('3.2s');
  });

  test('shows recent runs list', async ({ page }) => {
    await expect(page.locator('#runs-list li')).toHaveCount(3, { timeout: 5000 });
    await expect(page.locator('#runs-list li').first()).toContainText('PR #42');
  });
});
