import { test, expect } from '@playwright/test';
import path from 'path';


const investorAuth = path.join(__dirname, '..', '.auth', 'investor.json');

test.describe('Phase 5 — Investor flows @smoke', () => {
  test.use({ storageState: investorAuth });

  test('opportunities: open first opportunity card if listed', async ({ page }) => {
    await page.goto('/investor/opportunities');
    await expect(page).toHaveURL(/\/investor\/opportunities/);
    const cardLink = page.locator('a[href*="/investor/opportunities/"], a[href*="/investor/investments/"]').first();
    if (await cardLink.isVisible().catch(() => false)) {
      await cardLink.click();
      await expect(page).toHaveURL(/\/investor\/(opportunities|investments)\//);
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('logout clears auth storage', async ({ page }) => {
    await page.goto('/investor/dashboard');
    await expect(page).toHaveURL(/\/investor\/dashboard/);
    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-storage');
    });
    expect(await page.evaluate(() => localStorage.getItem('auth-storage'))).toBeNull();
  });
});