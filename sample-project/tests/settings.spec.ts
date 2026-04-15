import { test, expect } from '@playwright/test';
// Tests for: src/components/settings-panel.js

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#settings');
  });

  test('displays settings form with defaults', async ({ page }) => {
    await expect(page.locator('#project-name')).toHaveValue('My Project');
    await expect(page.locator('#timeout')).toHaveValue('30000');
    await expect(page.locator('#parallel')).toBeChecked();
    await expect(page.locator('#headless')).toBeChecked();
  });

  test('saves settings and shows confirmation', async ({ page }) => {
    await page.fill('#project-name', 'Updated Project');
    await page.click('#save-settings');
    await expect(page.locator('#save-status')).toBeVisible();
    await expect(page.locator('#save-status')).toHaveText('Settings saved!');
  });
});
