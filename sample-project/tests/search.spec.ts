import { test, expect } from '@playwright/test';
// Tests for: src/pages/search.js

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#search');
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.locator('.empty-state')).toHaveText('Enter a query to search test results');
  });

  test('searches and displays results', async ({ page }) => {
    await page.fill('#search-input', 'login');
    await page.click('#search-btn');
    await expect(page.locator('.result-item')).toHaveCount(1);
    await expect(page.locator('.result-item').first()).toContainText('login.spec.ts');
  });

  test('shows no results message for bad query', async ({ page }) => {
    await page.fill('#search-input', 'nonexistent');
    await page.click('#search-btn');
    await expect(page.locator('.empty-state')).toHaveText('No results found');
  });
});
