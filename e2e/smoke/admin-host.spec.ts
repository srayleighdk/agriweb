import { test, expect } from '@playwright/test';
import { expectNoApiErrorBanner } from '../admin/helpers';

test.describe('Admin host (authenticated)', () => {
  test('authenticated admin reaches dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByText('Tổng người dùng')).toBeVisible();
    await expectNoApiErrorBanner(page);
  });
});