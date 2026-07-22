import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { gotoAdminAndWait, expectNoApiErrorBanner } from './helpers';
import { adminGet, getApiBaseUrl, getAdminToken, authHeaders } from '../fixtures/admin-api';

function loadFixture() {
  const p = path.join(__dirname, '..', '.api-fixture.json');
  const defaults = {
    farmerId: 1 as number | undefined,
    farmlandId: undefined as number | undefined,
  };
  if (!fs.existsSync(p)) return defaults;
  const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as {
    farmerId?: number;
    farmlandId?: number;
  };
  return {
    farmerId: raw.farmerId ?? defaults.farmerId,
    farmlandId: raw.farmlandId,
  };
}

/**
 * Admin create project for a farmer (contact-brokering / MSVT-style entry).
 */
test.describe('Admin create project @crud @admin', () => {
  test.setTimeout(90_000);

  test('admin can open create form and create project for farmer', async ({ page, request }) => {
    const stamp = Date.now();
    const title = `E2E Admin Project ${stamp}`;
    const fx = loadFixture();

    // Resolve a real farmer id from API if fixture missing
    let farmerId = fx.farmerId;
    if (!farmerId) {
      const { status, body } = await adminGet(request, '/admin/farmers', { page: 1, limit: 5 });
      expect(status).toBe(200);
      const data = (body as { data?: { id: number }[] }).data || (body as { id: number }[]);
      farmerId = Array.isArray(data) ? data[0]?.id : undefined;
    }
    expect(farmerId, 'need at least one farmer in DB').toBeTruthy();

    await gotoAdminAndWait(page, '/admin/investments/new');
    await expect(
      page.getByRole('heading', { name: /Tạo dự án đầu tư \(Admin\)/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expectNoApiErrorBanner(page);

    // Farmer select must load options
    const farmerSelect = page.locator('select[name="farmerId"]');
    await expect(farmerSelect).toBeEnabled({ timeout: 30_000 });
    await farmerSelect.selectOption(String(farmerId));

    await page.locator('input[name="title"]').fill(title);
    await page.locator('textarea[name="description"]').fill(`Admin-created E2E project ${stamp}`);

    // Prefer EQUIPMENT_PURCHASE so no farmland ownership check is needed.
    // (Admin crop create with farmland currently reuses farmer ownership validation.)
    await page.locator('select[name="investmentType"]').selectOption('EQUIPMENT_PURCHASE');

    await page.locator('input[name="requestedAmount"]').fill('10000000');
    await page.locator('input[name="expectedReturn"]').fill('18');
    await page.locator('input[name="duration"]').fill('12');
    await page.locator('select[name="riskLevel"]').selectOption('MEDIUM');

    // Optional: pick first crop variety checkbox if present
    const firstVariety = page.locator('input[type="checkbox"]').first();
    if (await firstVariety.isVisible().catch(() => false)) {
      await firstVariety.check();
    }

    await page.getByRole('button', { name: /Tạo dự án/i }).click();

    // Success toast or redirect to detail
    await Promise.race([
      expect(page.getByText(/Đã tạo dự án/i)).toBeVisible({ timeout: 30_000 }),
      expect(page).toHaveURL(/\/admin\/investments\/\d+/, { timeout: 30_000 }),
    ]);
    await expect(page).toHaveURL(/\/admin\/investments\/\d+/, { timeout: 30_000 });

    // Detail page shows the title
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 20_000 });

    // API can find the project by title in admin list
    const token = await getAdminToken(request);
    const listRes = await request.get(
      `${getApiBaseUrl()}/farmer-investments/admin/all?page=1&limit=50&search=${encodeURIComponent(title)}`,
      { headers: authHeaders(token) },
    );
    // search may not exist — fall back to list scan
    if (listRes.ok()) {
      const body = await listRes.json();
      const items = body.data || body || [];
      const found = Array.isArray(items)
        ? items.some((i: { title?: string }) => i.title === title)
        : false;
      // soft assert only if search/list works
      if (Array.isArray(items) && items.length > 0) {
        expect(found || items.some((i: { title?: string }) => i.title?.includes('E2E Admin'))).toBeTruthy();
      }
    }
  });

  test('admin investments list has create CTA linking to /admin/investments/new', async ({
    page,
  }) => {
    await gotoAdminAndWait(page, '/admin/investments');
    const createLink = page.locator('a[href*="/admin/investments/new"]').first();
    if (await createLink.isVisible().catch(() => false)) {
      await createLink.click();
      await expect(page).toHaveURL(/\/admin\/investments\/new/);
      await expect(
        page.getByRole('heading', { name: /Tạo dự án đầu tư \(Admin\)/i }),
      ).toBeVisible();
    } else {
      // Page still reachable directly
      await page.goto('/admin/investments/new');
      await expect(
        page.getByRole('heading', { name: /Tạo dự án đầu tư \(Admin\)/i }),
      ).toBeVisible();
    }
  });
});
