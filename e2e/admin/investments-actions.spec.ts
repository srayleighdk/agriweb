import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { gotoAdminAndWait, expectNoApiErrorBanner, waitForListLoaded } from './helpers';
import {
  adminDelete,
  adminGet,
  adminPatch,
  adminPost,
  authHeaders,
  getApiBaseUrl,
} from '../fixtures/admin-api';

type FixtureFile = {
  farmerId?: number;
};

function loadFixture(): FixtureFile {
  const p = path.join(__dirname, '..', '.api-fixture.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8')) as FixtureFile;
}

type CreatedProject = { id: number; title: string };

async function createFixtureProject(
  request: APIRequestContext,
  suffix: string,
): Promise<CreatedProject> {
  const fx = loadFixture();
  if (!fx.farmerId) {
    test.skip(true, 'fx.farmerId missing from e2e/.api-fixture.json');
  }
  const title = `E2E Actions ${Date.now()} ${suffix}`;
  const { status, body, text } = await adminPost(request, '/farmer-investments/admin', {
    farmerId: fx.farmerId,
    title,
    description: `E2E investments-actions ${suffix}`,
    investmentType: 'EQUIPMENT_PURCHASE',
    requestedAmount: 10000000,
    expectedReturn: 18,
    duration: 12,
    riskLevel: 'MEDIUM',
  });
  expect([200, 201], text).toContain(status);
  const created = body as { id?: number };
  expect(created.id).toBeTruthy();
  return { id: created.id!, title };
}

async function loginAs(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const base = getApiBaseUrl();
  let lastText = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
    const res = await request.post(`${base}/auth/login`, {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });
    lastText = await res.text();
    if (res.ok()) {
      const body = JSON.parse(lastText) as { access_token: string };
      return body.access_token;
    }
    if (res.status() !== 500 && res.status() !== 429) break;
  }
  throw new Error(`Login failed for ${email}: ${lastText}`);
}

async function bestEffortCleanupProject(request: APIRequestContext, id: number) {
  try {
    await adminDelete(request, `/farmer-investments/admin/${id}`);
  } catch (err) {
    console.warn(`cleanup: failed to delete farmer-investment ${id}`, err);
  }
}

async function bestEffortRejectThenDelete(
  request: APIRequestContext,
  projectId: number,
  investorInvestmentId: number | undefined,
) {
  try {
    if (investorInvestmentId != null) {
      await adminPatch(request, `/admin/investor-investments/${investorInvestmentId}/reject`, {
        reason: 'e2e cleanup',
      });
    }
    // No admin endpoint can hard-delete an InvestorInvestment, and the delete guard
    // counts rows regardless of status, so this project can never be deleted once an
    // investor investment (even a rejected one) exists on it. Land it in a terminal
    // state instead of leaving it APPROVED forever.
    await adminPatch(request, `/farmer-investments/admin/${projectId}/status`, {
      status: 'CANCELLED',
    });
  } catch (err) {
    console.warn(
      `cleanup: failed reject/delete for project ${projectId} / ii ${investorInvestmentId}`,
      err,
    );
  }
}

async function gotoInvestmentsAndFindRow(page: Page, title: string) {
  await gotoAdminAndWait(page, '/admin/investments');
  await waitForListLoaded(page);
  await expectNoApiErrorBanner(page);

  const search = page.getByPlaceholder('Tìm kiếm theo tiêu đề hoặc nông dân...');
  await search.fill(title);
  await waitForListLoaded(page);

  const row = page.locator('tbody tr').filter({ hasText: title });
  await expect(row).toBeVisible({ timeout: 30_000 });
  return row;
}

async function confirmDialog(page: Page, heading: string) {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
}

test.describe('Admin investments row actions @admin', () => {
  test.setTimeout(90_000);

  test('PENDING row shows correct buttons and Approve works', async ({ page, request }) => {
    const project = await createFixtureProject(request, 'approve');
    try {
      const row = await gotoInvestmentsAndFindRow(page, project.title);

      await expect(row.getByTitle('Chỉnh sửa')).toBeVisible();
      await expect(row.getByTitle('Phê duyệt')).toBeVisible();
      await expect(row.getByTitle('Từ chối')).toBeVisible();
      await expect(row.getByTitle('Xóa')).toBeVisible();
      await expect(row.getByTitle('Kích hoạt')).toHaveCount(0);
      await expect(row.getByTitle('Đặt lại chờ xử lý')).toHaveCount(0);

      await row.getByTitle('Phê duyệt').click();
      await confirmDialog(page, 'Phê duyệt yêu cầu đầu tư');
      await expect(page.getByText('Phê duyệt thành công')).toBeVisible({ timeout: 20_000 });

      const { status, body, text } = await adminGet(
        request,
        `/farmer-investments/admin/${project.id}`,
      );
      expect(status, text).toBe(200);
      expect((body as { status?: string }).status).toBe('APPROVED');
    } finally {
      await bestEffortCleanupProject(request, project.id);
    }
  });

  test('APPROVED row: Activate then Reset-to-pending work', async ({ page, request }) => {
    const project = await createFixtureProject(request, 'activate-reset');
    try {
      const approve = await adminPatch(request, `/farmer-investments/admin/${project.id}/status`, {
        status: 'APPROVED',
      });
      expect(approve.status, approve.text).toBe(200);

      let row = await gotoInvestmentsAndFindRow(page, project.title);
      await expect(row.getByTitle('Chỉnh sửa')).toBeVisible();
      await expect(row.getByTitle('Kích hoạt')).toBeVisible();
      await expect(row.getByTitle('Đặt lại chờ xử lý')).toBeVisible();
      await expect(row.getByTitle('Xóa')).toBeVisible();
      await expect(row.getByTitle('Phê duyệt')).toHaveCount(0);
      await expect(row.getByTitle('Từ chối')).toHaveCount(0);

      await row.getByTitle('Kích hoạt').click();
      await confirmDialog(page, 'Kích hoạt đầu tư');
      await expect(page.getByText('Đã kích hoạt đầu tư')).toBeVisible({ timeout: 20_000 });

      let get = await adminGet(request, `/farmer-investments/admin/${project.id}`);
      expect(get.status, get.text).toBe(200);
      expect((get.body as { status?: string }).status).toBe('ACTIVE');

      row = page.locator('tbody tr').filter({ hasText: project.title });
      await expect(row).toBeVisible();
      await row.getByTitle('Đặt lại chờ xử lý').click();
      await confirmDialog(page, 'Đặt lại chờ xử lý');
      await expect(page.getByText('Đã đặt lại trạng thái chờ xử lý')).toBeVisible({
        timeout: 20_000,
      });

      get = await adminGet(request, `/farmer-investments/admin/${project.id}`);
      expect(get.status, get.text).toBe(200);
      expect((get.body as { status?: string }).status).toBe('PENDING');

      row = page.locator('tbody tr').filter({ hasText: project.title });
      await expect(row.getByTitle('Phê duyệt')).toBeVisible();
      await expect(row.getByTitle('Từ chối')).toBeVisible();
    } finally {
      await bestEffortCleanupProject(request, project.id);
    }
  });

  test('action buttons never navigate to the detail page', async ({ page, request }) => {
    const project = await createFixtureProject(request, 'no-nav');
    try {
      const row = await gotoInvestmentsAndFindRow(page, project.title);
      await row.getByTitle('Xóa').click();

      expect(page.url()).toMatch(/\/admin\/investments$/);
      await expect(page.getByRole('heading', { name: 'Xóa dự án đầu tư' })).toBeVisible();
      await page.getByRole('button', { name: 'Hủy', exact: true }).click();
    } finally {
      await bestEffortCleanupProject(request, project.id);
    }
  });

  test('Edit navigates to the edit page', async ({ page, request }) => {
    const project = await createFixtureProject(request, 'edit');
    try {
      const row = await gotoInvestmentsAndFindRow(page, project.title);
      await row.getByTitle('Chỉnh sửa').click();
      await expect(page).toHaveURL(new RegExp(`/admin/investments/${project.id}/edit$`), {
        timeout: 20_000,
      });
    } finally {
      await bestEffortCleanupProject(request, project.id);
    }
  });

  test('Delete removes a project with no investors', async ({ page, request }) => {
    const project = await createFixtureProject(request, 'delete-ok');
    try {
      const row = await gotoInvestmentsAndFindRow(page, project.title);
      await row.getByTitle('Xóa').click();
      await confirmDialog(page, 'Xóa dự án đầu tư');
      await expect(page.getByText('Đã xóa dự án đầu tư')).toBeVisible({ timeout: 20_000 });

      await expect(page.locator('tbody tr').filter({ hasText: project.title })).toHaveCount(0);

      const get = await adminGet(request, `/farmer-investments/admin/${project.id}`);
      expect(get.status).toBe(404);
    } catch (err) {
      await bestEffortCleanupProject(request, project.id);
      throw err;
    }
  });

  test('Delete is blocked when project has investors; row survives', async ({ page, request }) => {
    const project = await createFixtureProject(request, 'delete-blocked');
    let investorInvestmentId: number | undefined;

    try {
      const approve = await adminPatch(request, `/farmer-investments/admin/${project.id}/status`, {
        status: 'APPROVED',
      });
      expect(approve.status, approve.text).toBe(200);

      const investorEmail = process.env.E2E_INVESTOR_EMAIL ?? 'testcursor04@gmail.com';
      const password = process.env.E2E_USER_PASSWORD ?? 'password123';
      const investorToken = await loginAs(request, investorEmail, password);
      const base = getApiBaseUrl();

      const createIi = await request.post(`${base}/investor-investments`, {
        data: { farmerInvestmentId: project.id, amount: 1000000 },
        headers: { ...authHeaders(investorToken), 'Content-Type': 'application/json' },
      });
      const iiText = await createIi.text();
      expect([200, 201], iiText).toContain(createIi.status());
      investorInvestmentId = (JSON.parse(iiText) as { id?: number }).id;

      const row = await gotoInvestmentsAndFindRow(page, project.title);
      await row.getByTitle('Xóa').click();
      await confirmDialog(page, 'Xóa dự án đầu tư');
      await expect(
        page.getByText('Cannot delete investment that already has investors'),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('tbody tr').filter({ hasText: project.title })).toBeVisible();
    } finally {
      await bestEffortRejectThenDelete(request, project.id, investorInvestmentId);
    }
  });
});
