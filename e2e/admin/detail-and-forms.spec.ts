import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { gotoAdminAndWait, expectNoApiErrorBanner } from './helpers';

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
    userIds: { admin: raw.userIds?.admin ?? 1, farmer: raw.userIds?.farmer ?? 2 },
    farmerId: raw.farmerId,
    farmlandId: raw.farmlandId,
  };
}

test.describe('Admin detail pages', () => {
  test('user detail — admin account', async ({ page }) => {
    const fx = loadFixture();
    await gotoAdminAndWait(page, `/admin/users/${fx.userIds.admin}`);
    await expect(page.getByRole('heading', { name: /Admin|Unnamed/i })).toBeVisible({ timeout: 30_000 });
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main').getByText('admin@agrinvest.vn').first()).toBeVisible();
  });

  test('user detail — farmer account', async ({ page }) => {
    const fx = loadFixture();
    await gotoAdminAndWait(page, `/admin/users/${fx.userIds.farmer}`);
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main')).toContainText(/dquang|Farmer|Agriculture/i);
  });

  test('farmer profile detail', async ({ page }) => {
    const fx = loadFixture();
    test.skip(!fx.farmerId, 'No farmer id in fixture');
    await gotoAdminAndWait(page, `/admin/farmers/${fx.farmerId}`);
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main')).toBeVisible();
  });

  test('farmland detail', async ({ page }) => {
    const fx = loadFixture();
    test.skip(!fx.farmlandId, 'No farmland id in fixture');
    await gotoAdminAndWait(page, `/admin/farmlands/${fx.farmlandId}`);
    await expectNoApiErrorBanner(page);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Admin create forms', () => {
  const forms: { path: string; heading: string }[] = [
    { path: '/admin/news/new', heading: 'Thêm tin tức mới' },
    { path: '/admin/plants/new', heading: 'Add New Plant' },
    { path: '/admin/animals/new', heading: 'Add New Animal Species' },
    { path: '/admin/notifications/new', heading: 'Send Notification' },
  ];

  for (const f of forms) {
    test(`form ${f.path}`, async ({ page }) => {
      await gotoAdminAndWait(page, f.path);
      await expect(page.getByRole('heading', { name: f.heading })).toBeVisible({ timeout: 30_000 });
      await expectNoApiErrorBanner(page);
    });
  }
});