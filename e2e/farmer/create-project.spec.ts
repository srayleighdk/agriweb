import { test, expect } from '@playwright/test';
import path from 'path';

const farmerAuth = path.join(__dirname, '..', '.auth', 'farmer.json');
const collateralImage = path.join(__dirname, '..', 'fixtures', 'collateral.png');

/**
 * Farmer multi-step wizard: create investment project.
 * Uses EQUIPMENT_PURCHASE so farmland is not required.
 */
test.describe('Farmer create project @crud', () => {
  test.use({ storageState: farmerAuth });
  test.setTimeout(120_000);

  test('farmer can create a new investment project via wizard', async ({ page }) => {
    const stamp = Date.now();
    const title = `E2E Farmer Project ${stamp}`;

    await page.goto('/farmer/investments/new');
    await expect(page.getByRole('heading', { name: /Tạo dự án đầu tư mới/i })).toBeVisible({
      timeout: 30_000,
    });

    // Step 0 — basic info
    await page.locator('input[placeholder*="Dự án trồng"]').fill(title);
    await page.locator('select').first().selectOption('EQUIPMENT_PURCHASE');
    await page.locator('textarea').first().fill(`E2E farmer-created project at ${stamp}`);
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    // Step 1 — finance
    await expect(page.getByText(/Số tiền cần gọi vốn/i)).toBeVisible();
    await page.locator('input[type="number"]').first().fill('5000000');
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    // Step 2 — risk & collateral (image required)
    await expect(page.getByText(/Tài sản thế chấp/i).first()).toBeVisible();
    await page
      .locator('textarea')
      .first()
      .fill('Sổ đỏ đất nông nghiệp E2E collateral');
    await page.locator('input[type="file"]').setInputFiles(collateralImage);
    await expect(page.locator('img[alt*="Collateral"]').first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Tiếp tục/i }).click();

    // Step 3 — confirm & submit
    await expect(page.getByText(title)).toBeVisible();
    await page.getByRole('button', { name: /Tạo dự án/i }).click();

    await expect(page.getByText(/Tạo dự án thành công/i)).toBeVisible({ timeout: 45_000 });
    await expect(page).toHaveURL(/\/farmer\/investments/, { timeout: 30_000 });

    // Project should appear on list (pending approval)
    await page.goto('/farmer/investments');
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 30_000 });
  });
});
