import { test, expect } from '@playwright/test';
import path from 'path';

test.use({
  storageState: path.join(__dirname, '..', '.auth', 'investor.json'),
});

test.describe('Investor (authenticated)', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/investor/dashboard');
    await expect(page).toHaveURL(/\/investor\/dashboard/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('opportunities list loads', async ({ page }) => {
    await page.goto('/investor/opportunities');
    await expect(page).toHaveURL(/\/investor\/opportunities/);
    await expect(page.locator('body')).toBeVisible();
  });
});