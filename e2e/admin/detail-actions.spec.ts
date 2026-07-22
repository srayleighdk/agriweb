import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { gotoAdminAndWait, expectNoApiErrorBanner, waitForListLoaded, adminSeedEmail } from './helpers';

function loadFixture() {
  const p = path.join(__dirname, '..', '.api-fixture.json');
  const defaults = { userIds: { admin: 1, farmer: 2 }, farmerId: 2 as number | undefined, farmlandId: undefined as number | undefined };
  if (!fs.existsSync(p)) return defaults;
  const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as {
    userIds?: { admin?: number; farmer?: number };
    farmerId?: number;
    farmlandId?: number;
  };
  return {
    userIds: {
      admin: raw.userIds?.admin ?? 1,
      farmer: raw.userIds?.farmer ?? 2,
    },
    farmerId: raw.farmerId,
    farmlandId: raw.farmlandId,
  };
}

test.describe('Phase 4 — Admin detail & actions @admin', () => {
  test('user detail: profile sections and admin email', async ({ page }) => {
    const fx = loadFixture();
    await gotoAdminAndWait(page, `/admin/users/${fx.userIds.admin}`);
    await expect(page.getByText('Internal server error')).toHaveCount(0, { timeout: 30_000 });
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main')).toContainText(adminSeedEmail(), { timeout: 30_000 });
    await expect(page.locator('main')).toContainText(/Admin|ADMIN/);
  });

  test('farmer detail: verification action button visible', async ({ page }) => {
    const fx = loadFixture();
    test.skip(!fx.farmerId, 'No farmer id in fixture');
    await gotoAdminAndWait(page, `/admin/farmers/${fx.farmerId}`);
    await expectNoApiErrorBanner(page);
    const verifyBtn = page
      .locator('main button')
      .filter({ hasText: /^Xác minh$|^Hủy xác minh$/ })
      .first();
    await expect(verifyBtn).toBeVisible({ timeout: 20_000 });
  });

  test('farmland detail: location / coordinates block', async ({ page }) => {
    const fx = loadFixture();
    test.skip(!fx.farmlandId, 'No farmland id in fixture');
    await gotoAdminAndWait(page, `/admin/farmlands/${fx.farmlandId}`);
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main')).toContainText(/coordinates|Coordinates|Tọa độ|Map|Province|ha/i);
  });

  test('investments list: status badges or empty state', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/investments');
    await waitForListLoaded(page);
    await expectNoApiErrorBanner(page);
    const hasTable = (await page.locator('main table tbody tr').count()) > 0;
    if (hasTable) {
      await expect(page.locator('main')).toContainText(/PENDING|APPROVED|ACTIVE|REJECTED|Đang|Trạng thái/i);
    } else {
      await expect(page.locator('main')).toContainText(/Không|No |empty|0/i);
    }
  });

  test('news: open edit from first row', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/news');
    await waitForListLoaded(page);
    const editLink = page.locator('main table tbody tr').first().locator('a[href*="/admin/news/"]');
    await expect(editLink).toBeVisible({ timeout: 20_000 });
    await editLink.click();
    await expect(page).toHaveURL(/\/admin\/news\/\d+/, { timeout: 15_000 });
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main')).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/settings');
    await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
    await expect(page.locator('main')).toContainText('Thông tin liên hệ công ty');
  });
});