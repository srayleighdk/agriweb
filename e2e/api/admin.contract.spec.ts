import { test, expect } from '@playwright/test';
import {
  adminGet,
  extractListMeta,
  getAdminCredentials,
  getApiBaseUrl,
  isMinimalDb,
  loginAdmin,
} from '../fixtures/admin-api';

test.describe.configure({ mode: 'serial' });

test.describe('Phase 1 — Admin API contracts @api', () => {
  test('health: API root responds', async ({ request }) => {
    const res = await request.get(`${getApiBaseUrl().replace(/\/api$/, '')}/api`);
    expect(res.ok()).toBeTruthy();
  });

  test('auth: admin login returns token and ADMIN role', async ({ request }) => {
    const login = await loginAdmin(request);
    expect(login.access_token).toBeTruthy();
    expect(login.user.role).toBe('ADMIN');
    expect(login.user.email).toBe(getAdminCredentials().email);
  });

  test('auth: unauthenticated admin stats returns 401', async ({ request }) => {
    const res = await request.get(`${getApiBaseUrl()}/admin/stats`);
    expect(res.status()).toBe(401);
  });

  test('GET /admin/stats — dashboard shape', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/stats');
    expect(status, JSON.stringify(body)).toBe(200);
    const stats = body as { users?: { total?: number }; farmlands?: { total?: number } };
    expect(stats.users?.total).toBeGreaterThanOrEqual(4);
    expect(stats.farmlands?.total).toBeGreaterThanOrEqual(1);
  });

  test('GET /auth/admin/users — paginated users', async ({ request }) => {
    const { status, body } = await adminGet(request, '/auth/admin/users', { page: 1, limit: 5 });
    expect(status).toBe(200);
    const { items, total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(4);
    expect(items.length).toBeGreaterThan(0);
    const first = items[0] as { email?: string; role?: string };
    expect(first.email).toBeTruthy();
  });

  test('GET /admin/farmers', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/farmers', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test('GET /admin/investors', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/investors', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test('GET /admin/farmlands', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/farmlands', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    if (isMinimalDb()) {
      expect(total).toBeGreaterThanOrEqual(1);
    } else {
      expect(total).toBeGreaterThanOrEqual(3);
    }
  });

  test('GET /farmer-investments/admin/all', async ({ request }) => {
    const { status, body } = await adminGet(request, '/farmer-investments/admin/all', {
      page: 1,
      limit: 10,
    });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('GET /admin/investor-investments', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/investor-investments', {
      page: 1,
      limit: 10,
    });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('GET /plants — catalog (auth required)', async ({ request }) => {
    const { status, body } = await adminGet(request, '/plants', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    if (isMinimalDb()) {
      expect(total).toBeGreaterThanOrEqual(0);
    } else {
      expect(total).toBeGreaterThanOrEqual(1);
    }
  });

  test('GET /animal-species', async ({ request }) => {
    const { status, body } = await adminGet(request, '/animal-species');
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    if (isMinimalDb()) {
      expect(total).toBeGreaterThanOrEqual(0);
    } else {
      expect(total).toBeGreaterThanOrEqual(1);
    }
  });

  test('GET /news', async ({ request }) => {
    const { status, body } = await adminGet(request, '/news', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test('GET /news-categories', async ({ request }) => {
    const { status, body } = await adminGet(request, '/news-categories');
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test('GET /contact — admin inquiries', async ({ request }) => {
    const { status, body } = await adminGet(request, '/contact', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('GET /contact-information', async ({ request }) => {
    const { status, body } = await adminGet(request, '/contact-information');
    expect(status).toBe(200);
    expect(body).toBeTruthy();
  });

  test('GET /admin/notifications', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/notifications', { page: 1, limit: 10 });
    expect(status).toBe(200);
    const { total } = extractListMeta(body);
    expect(total).toBeGreaterThanOrEqual(0);
  });

  test('GET /admin/notifications/unread-count', async ({ request }) => {
    const { status, body } = await adminGet(request, '/admin/notifications/unread-count');
    expect(status).toBe(200);
    const b = body as { count?: number };
    expect(typeof b.count === 'number' || typeof (body as Record<string, unknown>).count === 'number').toBeTruthy();
  });
});