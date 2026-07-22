import { test, expect } from '@playwright/test';

test.describe('Public smoke @smoke', () => {
  test('home page shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Kết Nối Nông Dân với Cơ Hội')).toBeVisible();
  });

  test('login page — account type selection', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nông dân' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nhà đầu tư' })).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /đăng ký/i })).toBeVisible();
  });

  test('news page loads', async ({ page }) => {
    await page.goto('/news');
    await expect(page).toHaveURL(/\/news/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('main host blocks /admin routes', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/\//);
  });

  test('admin host shows login when not authenticated', async ({ page }) => {
    const adminUrl = process.env.PLAYWRIGHT_ADMIN_BASE_URL ?? 'http://admin.localhost:3001';
    await page.goto(adminUrl);
    await expect(page.getByText('Quản Trị Viên')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel('Email Address')).toBeVisible();
  });
});