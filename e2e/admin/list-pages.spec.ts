import { test, expect } from '@playwright/test';
import { gotoAdminAndWait, expectNoApiErrorBanner } from './helpers';

type ListCase = {
  path: string;
  heading: string;
  /** Table, grid cards, or list body should show seed content or empty-state (not error) */
  contentHint?: RegExp;
};

const listPages: ListCase[] = [
  { path: '/admin/users', heading: 'User Management' },
  { path: '/admin/farmers', heading: 'Quản lý Nông dân', contentHint: /Farmer|Agriculture|Không|No /i },
  { path: '/admin/investors', heading: 'Quản lý nhà đầu tư', contentHint: /Investor|Không|No /i },
  { path: '/admin/investments', heading: 'Quản lý Đầu tư' },
  { path: '/admin/farmlands', heading: 'Farmlands Management' },
  { path: '/admin/plants', heading: 'Plants Catalog' },
  { path: '/admin/animals', heading: 'Animal Species Catalog' },
  { path: '/admin/news', heading: 'Quản lý tin tức' },
  { path: '/admin/news-categories', heading: 'Danh mục tin tức' },
  { path: '/admin/notifications', heading: 'Notifications' },
  { path: '/admin/contacts', heading: 'Quản lý liên hệ' },
  { path: '/admin/contact-information', heading: 'Thông tin liên hệ công ty' },
];

test.describe('Admin list pages load with API data @admin', () => {
  test('/admin/users', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/users');
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible({ timeout: 30_000 });
    await expectNoApiErrorBanner(page);
    await expect(page.getByText('Loading users').or(page.locator('.animate-spin'))).toHaveCount(0, {
      timeout: 45_000,
    }).catch(() => {});
    await expect(page.locator('main')).toContainText(/Showing|results|No users found/i, { timeout: 30_000 });
    await expect(page.locator('main')).toContainText(/admin@agrinvest|ADMIN|FARMER|INVESTOR/i, {
      timeout: 30_000,
    });
  });

  for (const lp of listPages.filter((p) => p.path !== '/admin/users')) {
    test(lp.path, async ({ page }) => {
      await gotoAdminAndWait(page, lp.path);
      await expect(page.getByRole('heading', { name: lp.heading })).toBeVisible({ timeout: 30_000 });
      await expectNoApiErrorBanner(page);

      await expect(page.getByText('Đang tải').or(page.locator('.animate-spin'))).toHaveCount(0, {
        timeout: 45_000,
      }).catch(() => {});

      if (lp.contentHint) {
        await expect(page.locator('main')).toContainText(lp.contentHint, { timeout: 45_000 });
      }
    });
  }
});