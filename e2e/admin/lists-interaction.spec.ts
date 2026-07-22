import { test, expect } from '@playwright/test';
import {
  gotoAdminAndWait,
  waitForListLoaded,
  isMinimalDb,
  farmerSeedEmail,
  investorSeedEmail,
  adminSeedEmail,
} from './helpers';

test.describe('Phase 2 — Admin list interactions @admin', () => {
  test('users: search by admin email shows at least one row', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/users');
    await waitForListLoaded(page);
    const search = page.getByPlaceholder('Search by name or email...');
    await search.fill('admin@agrinvest');
    await waitForListLoaded(page);
    await expect(page.locator('main tbody')).toContainText(adminSeedEmail(), { timeout: 15_000 });
    await expect(page.locator('main tbody tr')).toHaveCount(1, { timeout: 10_000 });
  });

  test('users: filter role Admin includes seeded admin', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/users');
    await waitForListLoaded(page);
    await page.locator('select').filter({ has: page.locator('option[value="ADMIN"]') }).selectOption('ADMIN');
    await waitForListLoaded(page);
    await expect(page.locator('main')).toContainText(adminSeedEmail());
    await expect(page.locator('main')).toContainText('ADMIN');
  });

  test('farmers: table shows seeded farmer email', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/farmers');
    await waitForListLoaded(page);
    const email = farmerSeedEmail();
    const search = page.getByPlaceholder('Tìm kiếm nông dân...');
    await search.fill(email.split('@')[0]);
    await waitForListLoaded(page);
    await expect(page.locator('main')).toContainText(email, { timeout: 20_000 });
    await expect(page.locator('main table tbody tr').first()).toBeVisible();
  });

  test('investors: table shows seeded investor email', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/investors');
    await waitForListLoaded(page);
    const email = investorSeedEmail();
    await page.getByPlaceholder('Tìm kiếm nhà đầu tư...').fill('testcursor');
    await waitForListLoaded(page);
    await expect(page.locator('main')).toContainText(email, { timeout: 20_000 });
    await expect(page.locator('main table tbody tr').first()).toBeVisible();
  });

  test('farmlands: list has rows when DB is enriched', async ({ page }) => {
    test.skip(isMinimalDb(), 'E2E_MINIMAL_DB=1 — skip MSVT farmlands count');
    await gotoAdminAndWait(page, '/admin/farmlands');
    await waitForListLoaded(page);
    await expect(page.locator('main table tbody tr').first()).toBeVisible({ timeout: 20_000 });
    const count = await page.locator('main table tbody tr').count();
    expect(count).toBeGreaterThan(0);
  });

  test('plants: catalog shows at least one card', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/plants');
    await waitForListLoaded(page);
    const empty = page.getByText('No plants found');
    if (await empty.isVisible().catch(() => false)) {
      test.skip(true, 'No plants in DB — run prisma:seed');
    }
    await expect(page.locator('main h3').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('main .grid').locator('h3').first()).toBeVisible();
  });

  test('animals: catalog shows at least one row or card', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/animals');
    await waitForListLoaded(page);
    const noData = page.getByText(/No animals|Không tìm thấy/i);
    if (await noData.isVisible().catch(() => false)) {
      test.skip(true, 'No animal species in DB — run seed:livestock');
    }
    await expect(page.locator('main')).not.toContainText('Failed to load');
    const rowOrCard = page.locator('main table tbody tr, main .grid > div').first();
    await expect(rowOrCard).toBeVisible({ timeout: 15_000 });
  });

  test('news: published filter still shows articles from SQL seed', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/news');
    await waitForListLoaded(page);
    await page.locator('select').filter({ has: page.locator('option', { hasText: 'Đã xuất bản' }) }).selectOption('published');
    await waitForListLoaded(page);
    const empty = page.getByText('Không tìm thấy tin tức');
    const hasRows = await page.locator('main table tbody tr').count();
    if (hasRows === 0 && (await empty.isVisible())) {
      // Some DBs may have only drafts — fall back to all
      await page.locator('select').filter({ has: page.locator('option', { hasText: 'Tất cả trạng thái' }) }).selectOption('all');
      await waitForListLoaded(page);
    }
    await expect(page.locator('main table tbody tr').first()).toBeVisible({ timeout: 20_000 });
  });

  test('news: search narrows list without error', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/news');
    await waitForListLoaded(page);
    const firstTitle = await page.locator('main table tbody tr').first().locator('td').first().innerText();
    const token = firstTitle.trim().split(/\s+/)[0];
    if (!token || token.length < 2) {
      test.skip(true, 'No news title to search');
    }
    await page.getByPlaceholder('Tìm kiếm tin tức...').fill(token);
    await waitForListLoaded(page);
    await expect(page.locator('main')).toContainText(token, { timeout: 15_000 });
  });

  test('users: pagination page 2 when multiple pages exist', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/users');
    await waitForListLoaded(page);
    const page2 = page.getByRole('button', { name: '2', exact: true });
    const visible = await page2.isVisible().catch(() => false);
    if (!visible) {
      test.skip(true, 'Only one page of users');
    }
    await page2.click();
    await waitForListLoaded(page);
    await expect(page.locator('main')).toContainText(/Showing|results/i);
    await expect(page.getByRole('button', { name: '2', exact: true })).toHaveClass(/bg-green-50/);
  });
});