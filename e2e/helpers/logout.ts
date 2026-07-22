import { expect, type Page } from '@playwright/test';

/** Logout: open user menu if present, else clear client auth and navigate to login. */
export async function logoutViaUserMenu(page: Page) {
  const userMenu = page.locator('nav button').filter({ hasText: /@/ }).first();
  if (await userMenu.isVisible().catch(() => false)) {
    await userMenu.click();
    const item = page.getByRole('menuitem', { name: 'Đăng xuất' });
    if (await item.isVisible().catch(() => false)) {
      await item.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
      return;
    }
  }
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth-storage');
  });
  await page.goto('/login');
  await page.goto('/farmer/dashboard');
  await expect(page).not.toHaveURL(/\/farmer\/dashboard/, { timeout: 15_000 });
}