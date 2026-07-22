import { test, expect } from '@playwright/test';
import path from 'path';

test.use({
  storageState: path.join(__dirname, '..', '.auth', 'farmer.json'),
});

test.describe('Farmer (authenticated)', () => {
  test('can open farmer dashboard or onboarding', async ({ page }) => {
    await page.goto('/farmer/dashboard');
    await expect(page).toHaveURL(/\/farmer\//, { timeout: 45_000 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('farmlands list loads', async ({ page }) => {
    await page.goto('/farmer/farmlands');
    await expect(page).toHaveURL(/\/farmer\/farmlands/);
    await expect(page.locator('body')).toBeVisible();
  });
});