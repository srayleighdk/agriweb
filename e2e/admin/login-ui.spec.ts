import { test, expect } from '@playwright/test';

test.describe('Admin login UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Sign In with valid admin credentials', async ({ page, baseURL }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill(process.env.E2E_ADMIN_EMAIL ?? 'admin@agrinvest.vn');
    await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD ?? 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/admin(?!\/login)/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible({ timeout: 45_000 });
  });

  test('non-admin rejected on admin login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill(process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com');
    await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD ?? 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/Access denied|Admin credentials/i)).toBeVisible({ timeout: 15_000 });
  });
});