import { test, expect } from '@playwright/test';
import { gotoAdminAndWait, waitForListLoaded } from './helpers';
import { deleteNewsCategoryById } from '../fixtures/admin-api';

test.describe('Phase 3 — News category CRUD @admin @crud', () => {
  const createdIds: number[] = [];

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await deleteNewsCategoryById(request, id).catch(() => {});
    }
  });

  test('create category via modal and see it in list', async ({ page, request }) => {
    const uniqueName = `e2e-${Date.now()}`;
    await gotoAdminAndWait(page, '/admin/news-categories');
    await waitForListLoaded(page);

    await page.getByTestId('news-category-add').click();
    await expect(page.getByRole('heading', { name: 'Thêm danh mục mới' })).toBeVisible();

    await page.getByTestId('news-category-name').fill(uniqueName);
    await page.getByTestId('news-category-save').click();

    await expect(page.getByRole('heading', { name: 'Thêm danh mục mới' })).toHaveCount(0, {
      timeout: 20_000,
    });
    await waitForListLoaded(page);
    await expect(page.locator('main')).toContainText(uniqueName);

    const { adminGet } = await import('../fixtures/admin-api');
    const { status, body } = await adminGet(request, '/news-categories');
    expect(status).toBe(200);
    const categories = body as { id: number; name: string }[];
    const created = categories.find((c) => c.name === uniqueName);
    expect(created?.id).toBeTruthy();
    createdIds.push(created!.id);
  });

  test('empty name blocks submit (HTML validation)', async ({ page }) => {
    await gotoAdminAndWait(page, '/admin/news-categories');
    await waitForListLoaded(page);
    await page.getByTestId('news-category-add').click();
    await page.getByTestId('news-category-name').fill('');
    const valid = await page.getByTestId('news-category-name').evaluate(
      (el) => (el as HTMLInputElement).checkValidity(),
    );
    expect(valid).toBe(false);
    await page.getByTestId('news-category-save').click();
    await expect(page.getByRole('heading', { name: 'Thêm danh mục mới' })).toBeVisible();
  });

  test('cancel closes modal without saving', async ({ page }) => {
    const ghost = `e2e-cancel-${Date.now()}`;
    await gotoAdminAndWait(page, '/admin/news-categories');
    await waitForListLoaded(page);
    await page.getByTestId('news-category-add').click();
    await page.getByTestId('news-category-name').fill(ghost);
    await page.getByTestId('news-category-cancel').click();
    await expect(page.getByRole('heading', { name: 'Thêm danh mục mới' })).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText(ghost);
  });
});