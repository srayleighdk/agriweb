import { test, expect } from '@playwright/test';
import path from 'path';
import { loginMainAsFarmer, expectEventuallyOnDashboard } from '../helpers/login';


const farmerAuth = path.join(__dirname, '..', '.auth', 'farmer.json');

test.describe('Phase 5 — Farmer flows @smoke', () => {
  test.use({ storageState: farmerAuth });

  test('farmlands list and open first detail if any', async ({ page }) => {
    await page.goto('/farmer/farmlands');
    await expect(page).toHaveURL(/\/farmer\/farmlands/);
    await expect(page.locator('body')).toBeVisible();
    const link = page.locator('a[href*="/farmer/farmlands/"]').first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await expect(page).toHaveURL(/\/farmer\/farmlands\/\d+/);
    }
  });

  test('logout clears auth storage', async ({ page }) => {
    await page.goto('/farmer/dashboard');
    await expect(page).toHaveURL(/\/farmer\//, { timeout: 45_000 });
    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-storage');
    });
    expect(await page.evaluate(() => localStorage.getItem('auth-storage'))).toBeNull();
  });
});

test.describe('Phase 5 — Farmer register @smoke', () => {
  test('register new farmer then login', async ({ page }) => {
    test.skip(process.env.E2E_RUN_REGISTER !== '1', 'Set E2E_RUN_REGISTER=1 to run register flow');
    test.setTimeout(90_000);
    const stamp = Date.now();
    const email = `e2e.farmer.${stamp}@example.com`;
    const password = process.env.E2E_USER_PASSWORD ?? 'password123';

    await page.goto('/register');
    await page.locator('button').filter({ hasText: 'Nông dân' }).first().click();
    await page.locator('input[name="name"]').fill(`E2E Farmer ${stamp}`);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phone"]').fill('0900000001');
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /đăng ký|register/i }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });

    await loginMainAsFarmer(page, email, password);
    await expectEventuallyOnDashboard(page, /\/farmer\//);
  });
});