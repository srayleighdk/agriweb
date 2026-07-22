import type { APIRequestContext } from '@playwright/test';

export function getApiBaseUrl(): string {
  const url = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000/api';
  return url.replace(/\/$/, '');
}

export type AdminCredentials = {
  email: string;
  password: string;
};

export function getAdminCredentials(): AdminCredentials {
  return {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@agrinvest.vn',
    password: process.env.E2E_USER_PASSWORD ?? 'password123',
  };
}

export type LoginResult = {
  access_token: string;
  refresh_token?: string;
  user: { id: number; email: string; role: string };
};

let cachedToken: string | null = null;

export async function loginAdmin(request: APIRequestContext): Promise<LoginResult> {
  const base = getApiBaseUrl();
  const { email, password } = getAdminCredentials();
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
      const body = JSON.parse(lastText) as LoginResult;
      cachedToken = body.access_token;
      return body;
    }
    if (res.status() !== 500 && res.status() !== 429) {
      break;
    }
  }
  throw new Error(`Admin login failed after retries: ${lastText}`);
}

export async function getAdminToken(request: APIRequestContext): Promise<string> {
  if (cachedToken) return cachedToken;
  const { access_token } = await loginAdmin(request);
  return access_token;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function adminGet(
  request: APIRequestContext,
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<{ status: number; body: unknown; text: string }> {
  const token = await getAdminToken(request);
  const base = getApiBaseUrl();
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }
  let lastStatus = 0;
  let lastText = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
    const res = await request.get(url.toString(), { headers: authHeaders(token) });
    lastText = await res.text();
    lastStatus = res.status();
    if (lastStatus === 429 && attempt < 5) continue;
    let body: unknown;
    try {
      body = JSON.parse(lastText);
    } catch {
      body = lastText;
    }
    return { status: lastStatus, body, text: lastText };
  }
  return { status: lastStatus, body: lastText, text: lastText };
}

type UserRow = { id: number; role: string; email?: string };

async function findUserIdBySearch(
  request: APIRequestContext,
  search: string,
  role?: string,
): Promise<number | undefined> {
  const { status, body } = await adminGet(request, '/auth/admin/users', {
    search,
    limit: 10,
    page: 1,
  });
  if (status !== 200) return undefined;
  const { items } = extractListMeta(body);
  const rows = items as UserRow[];
  if (role) {
    const hit = rows.find((u) => u.role === role);
    if (hit) return hit.id;
  }
  return rows[0]?.id;
}

/** Resolve SQL seed admin/farmer user ids (MSVT puts COMPANY users on page 1). */
export async function resolveSeedUserIds(
  request: APIRequestContext,
): Promise<{ admin: number; farmer: number }> {
  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@agrinvest.vn';
  const farmerEmail = process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com';
  const admin =
    (await findUserIdBySearch(request, adminEmail.split('@')[0], 'ADMIN')) ??
    (await findUserIdBySearch(request, 'agrinvest', 'ADMIN')) ??
    1;
  const farmer =
    (await findUserIdBySearch(request, farmerEmail.split('@')[0], 'FARMER')) ??
    (await findUserIdBySearch(request, 'dquang', 'FARMER')) ??
    2;
  return { admin, farmer };
}

/** Normalize list responses from different backend shapes */
export function extractListMeta(body: unknown): {
  items: unknown[];
  total: number;
} {
  if (!body || typeof body !== 'object') {
    return { items: [], total: 0 };
  }
  const b = body as Record<string, unknown>;
  if (Array.isArray(b.data)) {
    const total = typeof b.total === 'number' ? b.total : b.data.length;
    return { items: b.data, total };
  }
  if (Array.isArray(body)) {
    return { items: body, total: body.length };
  }
  if (b.pagination && typeof b.pagination === 'object') {
    const p = b.pagination as Record<string, unknown>;
    const data = Array.isArray(b.data) ? b.data : [];
    return {
      items: data,
      total: typeof p.total === 'number' ? p.total : data.length,
    };
  }
  return { items: [], total: 0 };
}

export function isMinimalDb(): boolean {
  return process.env.E2E_MINIMAL_DB === '1' || process.env.E2E_MINIMAL_DB === 'true';
}

export async function adminDelete(
  request: APIRequestContext,
  path: string,
): Promise<number> {
  const token = await getAdminToken(request);
  const base = getApiBaseUrl();
  const res = await request.delete(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    headers: authHeaders(token),
  });
  return res.status();
}

export async function deleteNewsCategoryById(request: APIRequestContext, id: number): Promise<void> {
  const status = await adminDelete(request, `/news-categories/${id}`);
  if (status !== 200 && status !== 204 && status !== 404) {
    throw new Error(`delete news-categories/${id} failed: ${status}`);
  }
}