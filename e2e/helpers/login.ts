import { Page, expect } from '@playwright/test';

export async function loginMainAsFarmer(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Nông dân' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

export async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto('/admin/login');
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
}

export async function expectEventuallyOnDashboard(page: Page, pathPart: RegExp) {
  await expect(page).toHaveURL(pathPart, { timeout: 45_000 });
}