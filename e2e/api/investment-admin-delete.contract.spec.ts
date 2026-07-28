import { test, expect, type APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  adminDelete,
  adminGet,
  adminPatch,
  adminPost,
  authHeaders,
  getAdminToken,
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
    description: `E2E admin-delete contract ${suffix}`,
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

test.describe('Admin investment delete API contracts @api', () => {
  test('happy path: admin delete removes a project with no investors', async ({ request }) => {
    const project = await createFixtureProject(request, 'happy');
    const token = await getAdminToken(request);
    const base = getApiBaseUrl();

    const del = await request.delete(`${base}/farmer-investments/admin/${project.id}`, {
      headers: authHeaders(token),
    });
    const delText = await del.text();
    expect(del.status(), delText).toBe(200);
    expect(JSON.parse(delText)).toEqual({ message: 'Investment deleted successfully' });

    const get = await adminGet(request, `/farmer-investments/admin/${project.id}`);
    if (get.status === 404) {
      expect(get.status).toBe(404);
    } else {
      const list = await adminGet(request, '/farmer-investments/admin/all', {
        page: 1,
        limit: 50,
        search: project.title,
      });
      expect(list.status).toBe(200);
      const items =
        (list.body as { data?: { id: number }[] }).data ??
        (Array.isArray(list.body) ? (list.body as { id: number }[]) : []);
      expect(items.some((i) => i.id === project.id)).toBe(false);
    }
  });

  test('blocked when project has an investor investment', async ({ request }) => {
    const project = await createFixtureProject(request, 'blocked');
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
      const iiBody = JSON.parse(iiText) as { id?: number };
      investorInvestmentId = iiBody.id;

      const token = await getAdminToken(request);
      const del = await request.delete(`${base}/farmer-investments/admin/${project.id}`, {
        headers: authHeaders(token),
      });
      const delText = await del.text();
      expect(del.status(), delText).toBe(400);
      const delBody = JSON.parse(delText) as { message?: string };
      expect(delBody.message).toBe('Cannot delete investment that already has investors');
    } finally {
      await bestEffortRejectThenDelete(request, project.id, investorInvestmentId);
    }
  });

  test('404 for a nonexistent id', async ({ request }) => {
    const token = await getAdminToken(request);
    const base = getApiBaseUrl();
    const del = await request.delete(`${base}/farmer-investments/admin/999999999`, {
      headers: authHeaders(token),
    });
    expect(del.status()).toBe(404);
  });

  test('403 for a non-admin (farmer) caller', async ({ request }) => {
    const project = await createFixtureProject(request, 'forbidden');
    try {
      const farmerEmail = process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com';
      const password = process.env.E2E_USER_PASSWORD ?? 'password123';
      const farmerToken = await loginAs(request, farmerEmail, password);
      const base = getApiBaseUrl();

      const del = await request.delete(`${base}/farmer-investments/admin/${project.id}`, {
        headers: authHeaders(farmerToken),
      });
      const delText = await del.text();
      expect(del.status(), delText).toBe(403);
    } finally {
      await bestEffortCleanupProject(request, project.id);
    }
  });

  test('route precedence: /admin/:id is RolesGuard-protected (Forbidden resource)', async ({
    request,
  }) => {
    const project = await createFixtureProject(request, 'precedence');
    try {
      const farmerEmail = process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com';
      const password = process.env.E2E_USER_PASSWORD ?? 'password123';
      const farmerToken = await loginAs(request, farmerEmail, password);
      const base = getApiBaseUrl();

      const del = await request.delete(`${base}/farmer-investments/admin/${project.id}`, {
        headers: authHeaders(farmerToken),
      });
      const delText = await del.text();
      expect(del.status(), delText).toBe(403);
      const delBody = JSON.parse(delText) as { message?: string };
      expect(delBody.message).toBe('Forbidden resource');

      // Admin still succeeds on the same /admin/:id path (proves the admin route matched).
      const adminDel = await request.delete(`${base}/farmer-investments/admin/${project.id}`, {
        headers: authHeaders(await getAdminToken(request)),
      });
      expect(adminDel.status(), await adminDel.text()).toBe(200);
    } catch (err) {
      await bestEffortCleanupProject(request, project.id);
      throw err;
    }
  });
});
