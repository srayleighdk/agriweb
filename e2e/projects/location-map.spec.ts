import { test, expect, type APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { authHeaders, getAdminToken, getApiBaseUrl } from '../fixtures/admin-api';

type ApproxLocation = {
  lat: number;
  lng: number;
  radiusMeters: number;
  precision: string;
};

type AvailableItem = {
  id: number;
  approxLocation: ApproxLocation | null;
};

type ContactRequestRow = {
  id: number;
  farmerInvestmentId: number;
  status: string;
  investor?: { user?: { email?: string } };
};

const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'test-results', 'map-screenshots');

function extractItems<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: T[] }).data;
  }
  return [];
}

async function resolveProjectIds(request: APIRequestContext): Promise<{
  mapProjectId: number | undefined;
  noCoordProjectId: number | undefined;
}> {
  const base = getApiBaseUrl();
  const res = await request.get(`${base}/farmer-investments/available?limit=50`);
  if (!res.ok()) {
    return { mapProjectId: undefined, noCoordProjectId: undefined };
  }
  const items = extractItems<AvailableItem>(await res.json());
  return {
    mapProjectId: items.find((i) => i.approxLocation != null)?.id,
    noCoordProjectId: items.find((i) => i.approxLocation === null)?.id,
  };
}

async function ensureApprovedContactRequest(
  request: APIRequestContext,
  mapProjectId: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const base = getApiBaseUrl();
  const email = process.env.E2E_INVESTOR_EMAIL ?? 'testcursor04@gmail.com';
  const password = process.env.E2E_USER_PASSWORD ?? 'password123';

  const loginRes = await request.post(`${base}/auth/login`, {
    data: { email, password },
    headers: { 'Content-Type': 'application/json' },
  });
  const loginText = await loginRes.text();
  if (!loginRes.ok()) {
    return { ok: false, reason: `Investor login failed: ${loginText}` };
  }
  const { access_token: investorToken } = JSON.parse(loginText) as { access_token: string };

  const createRes = await request.post(`${base}/contact-requests`, {
    data: { farmerInvestmentId: mapProjectId, message: 'e2e' },
    headers: {
      ...authHeaders(investorToken),
      'Content-Type': 'application/json',
    },
  });
  if (![200, 201, 400, 409].includes(createRes.status())) {
    return {
      ok: false,
      reason: `Unexpected contact-request create status ${createRes.status()}: ${await createRes.text()}`,
    };
  }

  const adminToken = await getAdminToken(request);
  const listRes = await request.get(`${base}/contact-requests/admin/all?limit=100`, {
    headers: authHeaders(adminToken),
  });
  const listText = await listRes.text();
  if (!listRes.ok()) {
    return { ok: false, reason: `Admin list contact-requests failed: ${listText}` };
  }
  const rows = extractItems<ContactRequestRow>(JSON.parse(listText));
  const requestRow =
    rows.find(
      (r) => r.farmerInvestmentId === mapProjectId && r.investor?.user?.email === email,
    ) ?? rows.find((r) => r.farmerInvestmentId === mapProjectId);

  if (!requestRow) {
    return {
      ok: false,
      reason: `No contact request found for project ${mapProjectId} / ${email}. Body: ${listText.slice(0, 500)}`,
    };
  }

  if (requestRow.status !== 'APPROVED') {
    const patchRes = await request.patch(`${base}/contact-requests/admin/${requestRow.id}`, {
      data: { status: 'APPROVED' },
      headers: {
        ...authHeaders(adminToken),
        'Content-Type': 'application/json',
      },
    });
    if (!patchRes.ok()) {
      return {
        ok: false,
        reason: `Approve contact-request ${requestRow.id} failed: ${await patchRes.text()}`,
      };
    }
  }

  const detailRes = await request.get(`${base}/farmer-investments/${mapProjectId}`, {
    headers: authHeaders(investorToken),
  });
  const detailText = await detailRes.text();
  if (!detailRes.ok()) {
    return { ok: false, reason: `Investor project fetch failed: ${detailText}` };
  }
  const detail = JSON.parse(detailText) as { preciseLocation?: unknown };
  if (detail.preciseLocation == null) {
    return {
      ok: false,
      reason: `preciseLocation still missing after approve. Body: ${detailText}`,
    };
  }

  return { ok: true };
}

async function saveMapScreenshot(name: string, body: Buffer): Promise<void> {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.writeFileSync(path.join(SCREENSHOT_DIR, name), body);
}

test.describe('Project location map @map', () => {
  let mapProjectId: number | undefined;
  let noCoordProjectId: number | undefined;

  test.beforeAll(async ({ request }) => {
    const ids = await resolveProjectIds(request);
    mapProjectId = ids.mapProjectId;
    noCoordProjectId = ids.noCoordProjectId;
  });

  test.describe('guest (no storage state)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('guest sees the approximate map', async ({ page }, testInfo) => {
      if (mapProjectId == null) {
        test.skip(true, 'No available project with approxLocation in seed data');
        return;
      }

      await test.step('open project detail', async () => {
        await page.goto(`/projects/${mapProjectId}`);
      });

      const heading = page.getByRole('heading', { name: 'Vị trí dự án' });
      await test.step('map card heading is visible', async () => {
        await expect(heading).toBeVisible({ timeout: 30_000 });
      });

      const mapCard = page
        .locator('div.bg-white.rounded-2xl')
        .filter({ has: heading });

      await test.step('leaflet circle renders without marker', async () => {
        await expect(mapCard.locator('.leaflet-container')).toBeVisible({ timeout: 30_000 });
        await expect(mapCard.locator('path.leaflet-interactive').first()).toBeVisible({
          timeout: 30_000,
        });
        await expect(mapCard.locator('.leaflet-marker-icon')).toHaveCount(0);
      });

      await test.step('approximate caption only', async () => {
        await expect(page.getByText(/Vị trí gần đúng trong bán kính/)).toBeVisible();
        await expect(page.getByText('Vị trí chính xác của trang trại.')).toHaveCount(0);
      });

      await test.step('screenshot approximate map card', async () => {
        await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({
          timeout: 30_000,
        });
        await page.waitForTimeout(1500);
        const shot = await mapCard.screenshot();
        await testInfo.attach('guest-approximate-map', { body: shot, contentType: 'image/png' });
        await saveMapScreenshot('guest-approximate-map.png', shot);
      });
    });

    test('no map card when the project has no coordinates', async ({ page }, testInfo) => {
      if (noCoordProjectId == null) {
        test.skip(true, 'No available project with approxLocation === null in seed data');
        return;
      }

      await test.step('open project without coordinates', async () => {
        await page.goto(`/projects/${noCoordProjectId}`);
      });

      await test.step('page loaded (funding progress visible)', async () => {
        await expect(page.getByRole('heading', { name: 'Tiến độ huy động' })).toBeVisible({
          timeout: 30_000,
        });
      });

      await test.step('map card absent', async () => {
        await expect(page.getByRole('heading', { name: 'Vị trí dự án' })).toHaveCount(0);
        await expect(page.locator('.leaflet-container')).toHaveCount(0);
      });

      await test.step('screenshot page without map', async () => {
        const shot = await page.screenshot({ fullPage: false });
        await testInfo.attach('no-coordinates-no-map', { body: shot, contentType: 'image/png' });
        await saveMapScreenshot('no-coordinates-no-map.png', shot);
      });
    });
  });

  test.describe('investor with approved contact request', () => {
    test.use({
      storageState: path.join(__dirname, '..', '.auth', 'investor.json'),
    });

    let unlockOk = false;
    let unlockReason = '';

    test.beforeAll(async ({ request }) => {
      if (mapProjectId == null) {
        const ids = await resolveProjectIds(request);
        mapProjectId = ids.mapProjectId;
      }
      if (mapProjectId == null) {
        unlockOk = false;
        unlockReason = 'No available project with approxLocation in seed data';
        return;
      }
      const result = await ensureApprovedContactRequest(request, mapProjectId);
      unlockOk = result.ok;
      unlockReason = result.ok ? '' : result.reason;
    });

    test('investor with approved contact sees the exact pin', async ({ page }, testInfo) => {
      if (mapProjectId == null) {
        test.skip(true, 'No available project with approxLocation in seed data');
        return;
      }
      if (!unlockOk) {
        test.skip(true, unlockReason || 'Could not unlock preciseLocation via contact request');
        return;
      }

      await test.step('open project as investor', async () => {
        await page.goto(`/projects/${mapProjectId}`);
      });

      const heading = page.getByRole('heading', { name: 'Vị trí dự án' });
      const mapCard = page.locator('div.bg-white.rounded-2xl').filter({ has: heading });

      await test.step('exact marker and caption', async () => {
        await expect(mapCard.locator('.leaflet-container')).toBeVisible({ timeout: 30_000 });
        await expect(mapCard.locator('.leaflet-marker-icon')).toBeVisible({ timeout: 30_000 });
        await expect(page.getByText('Vị trí chính xác của trang trại.')).toBeVisible();
        await expect(page.getByText(/Vị trí gần đúng trong bán kính/)).toHaveCount(0);
      });

      await test.step('screenshot exact map card', async () => {
        await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({
          timeout: 30_000,
        });
        await page.waitForTimeout(1500);
        const shot = await mapCard.screenshot();
        await testInfo.attach('investor-exact-map', { body: shot, contentType: 'image/png' });
        await saveMapScreenshot('investor-exact-map.png', shot);
      });
    });
  });
});
