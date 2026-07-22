import { test, expect } from '@playwright/test';
import { expectAdminShell, expectNoApiErrorBanner, gotoAdminAndWait, navigateSidebar } from './helpers';

const sidebarItems: { label: string; heading: RegExp | string; optional404?: boolean }[] = [
  { label: 'Bảng điều khiển', heading: 'Bảng điều khiển' },
  { label: 'Người dùng', heading: 'User Management' },
  { label: 'Nông dân', heading: 'Quản lý Nông dân' },
  { label: 'Nhà đầu tư', heading: 'Quản lý nhà đầu tư' },
  { label: 'Đầu tư', heading: 'Quản lý Đầu tư' },
  { label: 'Vùng đất', heading: 'Farmlands Management' },
  { label: 'Cây trồng', heading: 'Plants Catalog' },
  { label: 'Vật nuôi', heading: 'Animal Species Catalog' },
  { label: 'Tin tức', heading: 'Quản lý tin tức' },
  { label: 'Danh mục tin tức', heading: 'Danh mục tin tức' },
  { label: 'Thông báo', heading: 'Notifications' },
  { label: 'Liên hệ', heading: 'Quản lý liên hệ' },
  { label: 'Thông tin liên hệ', heading: 'Thông tin liên hệ công ty' },
  { label: 'Cài đặt', heading: 'Cài đặt' },
];

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdminAndWait(page, '/admin');
  });

  for (const item of sidebarItems) {
    test(`nav: ${item.label}`, async ({ page }) => {
      await navigateSidebar(page, item.label);

      if (typeof item.heading === 'string') {
        await expect(page.getByRole('heading', { name: item.heading })).toBeVisible({ timeout: 30_000 });
      }
      await expectNoApiErrorBanner(page);
    });
  }

  test('CMS title visible on dashboard', async ({ page }) => {
    await expectAdminShell(page);
    await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
    await expect(page.getByText('Tổng người dùng')).toBeVisible();
    await expectNoApiErrorBanner(page);
  });
});