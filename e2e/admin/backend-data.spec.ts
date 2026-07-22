import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { adminGet, resolveSeedUserIds, extractListMeta } from '../fixtures/admin-api';

/**
 * Confirms Docker/seed DB has data and writes fixture for detail-page tests.
 */
test('backend seed data is present @admin', async ({ request }) => {
  test.setTimeout(90_000);

  const { status: statsStatus, body: statsBody } = await adminGet(request, '/admin/stats');
  expect(statsStatus, JSON.stringify(statsBody)).toBe(200);
  const stats = statsBody as { users: { total: number }; farmlands: { total: number } };
  expect(stats.users.total).toBeGreaterThanOrEqual(4);
  expect(stats.farmlands.total).toBeGreaterThanOrEqual(1);

  const { admin: adminId, farmer: farmerId } = await resolveSeedUserIds(request);
  expect(adminId).toBeGreaterThan(0);
  expect(farmerId).toBeGreaterThan(0);

  const farmers = await adminGet(request, '/admin/farmers', { page: 1, limit: 5 });
  expect(farmers.status).toBe(200);
  const farmersMeta = extractListMeta(farmers.body);
  expect(farmersMeta.total).toBeGreaterThanOrEqual(1);

  const farmlands = await adminGet(request, '/admin/farmlands', { page: 1, limit: 5 });
  expect(farmlands.status).toBe(200);
  const farmlandsMeta = extractListMeta(farmlands.body);

  const outDir = path.join(__dirname, '..');
  fs.writeFileSync(
    path.join(outDir, '.api-fixture.json'),
    JSON.stringify(
      {
        userIds: { admin: adminId, farmer: farmerId },
        farmerId: (farmersMeta.items[0] as { id?: number })?.id,
        farmlandId: (farmlandsMeta.items[0] as { id?: number })?.id,
        stats,
      },
      null,
      2,
    ),
  );
});