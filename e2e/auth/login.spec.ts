import { test, expect } from '@playwright/test';
import path from 'path';
import { loginMainAsFarmer } from '../helpers/login';

const farmerEmail = process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com';
const password = process.env.E2E_USER_PASSWORD ?? 'password123';

test.describe('Login', () => {
  test('invalid password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Nông dân' }).click();
    await page.getByLabel('Email').fill(farmerEmail);
    await page.getByLabel('Mật khẩu').fill('wrong-password-xyz');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page.locator('.bg-red-50, .text-red-700').filter({ hasText: /Login failed|Invalid|credentials|thất bại/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('farmer UI login redirects to farmer area', async ({ page }) => {
    await loginMainAsFarmer(page, farmerEmail, password);
    await expect(page).toHaveURL(/\/(farmer\/|farmer)/, { timeout: 45_000 });
  });

  test('investor session opens investor dashboard', async ({ browser, baseURL }) => {
    const storage = path.join(__dirname, '..', '.auth', 'investor.json');
    const context = await browser.newContext({
      baseURL,
      storageState: storage,
    });
    const page = await context.newPage();
    await page.goto('/investor/dashboard');
    await expect(page).toHaveURL(/\/investor\/dashboard/);
    await expect(page.locator('body')).toBeVisible();
    await context.close();
  });
});