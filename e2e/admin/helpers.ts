import { expect, type Page } from '@playwright/test';

/** Red API error banners used across admin pages */
export const apiErrorLocator = (page: Page) =>
  page.locator('.bg-red-50.border-red-200').filter({
    hasText: /Failed to load|Unauthorized|Thử lại|Please try again/i,
  });

export async function expectAdminShell(page: Page) {
  await expect(page.getByText('Nông nghiệp tái sinh CMS')).toBeVisible({ timeout: 20_000 });
}

export async function expectNoApiErrorBanner(page: Page) {
  await expect(apiErrorLocator(page)).toHaveCount(0, { timeout: 5_000 });
}

export async function gotoAdminAndWait(page: Page, path: string) {
  await page.goto(path);
  await expectAdminShell(page);
  await expect(page.locator('main')).toBeVisible();
}

export async function navigateSidebar(page: Page, label: string) {
  await page.getByRole('link', { name: label, exact: true }).click();
  await expectAdminShell(page);
}

/** Phase 2: list finished loading without API error banner */
export async function waitForListLoaded(page: Page, options?: { timeout?: number }) {
  const timeout = options?.timeout ?? 45_000;
  const loading = page
    .getByText(/Loading users|Loading plants|Loading farmlands|Đang tải/i)
    .or(page.locator('main .animate-spin'));
  await expect(loading).toHaveCount(0, { timeout }).catch(() => {});
  await expectNoApiErrorBanner(page);
}

export function isMinimalDb(): boolean {
  return process.env.E2E_MINIMAL_DB === '1' || process.env.E2E_MINIMAL_DB === 'true';
}

export function farmerSeedEmail(): string {
  return process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com';
}

export function investorSeedEmail(): string {
  return process.env.E2E_INVESTOR_EMAIL ?? 'testcursor04@gmail.com';
}

export function adminSeedEmail(): string {
  return process.env.E2E_ADMIN_EMAIL ?? 'admin@agrinvest.vn';
}