import { chromium, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function waitForHealth(url: string, label: string, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        console.log(`[e2e] ${label} ready: ${url}`);
        return;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`[e2e] ${label} not reachable at ${url}. Start Docker: docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`);
}

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: { id: number; email: string; role: string; name?: string };
};

async function loginViaApi(apiURL: string, email: string, password: string): Promise<LoginResponse> {
  let lastBody = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));
    const res = await fetch(`${apiURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    lastBody = await res.text();
    if (res.ok) return JSON.parse(lastBody) as LoginResponse;
    if (res.status !== 500 && res.status !== 429) break;
  }
  throw new Error(`API login failed for ${email}: ${lastBody}`);
}

async function saveStorageState(
  baseURL: string,
  auth: LoginResponse,
  outPath: string,
) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  await context.addInitScript(
    ({ storageKey, payload }) => {
      localStorage.setItem('access_token', payload.access_token);
      localStorage.setItem('refresh_token', payload.refresh_token);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          state: {
            user: payload.user,
            tokens: {
              access_token: payload.access_token,
              refresh_token: payload.refresh_token,
            },
            isAuthenticated: true,
            _hasHydrated: true,
          },
          version: 0,
        }),
      );
    },
    {
      storageKey: 'auth-storage',
      payload: {
        access_token: auth.access_token,
        refresh_token: auth.refresh_token,
        user: auth.user,
      },
    },
  );
  const page = await context.newPage();
  await page.goto('/');
  await page.close();
  await context.storageState({ path: outPath });
  await browser.close();
}

export default async function globalSetup(_config: FullConfig) {
  const root = path.join(__dirname, '..');
  loadEnvFile(path.join(__dirname, '.env.test'));
  loadEnvFile(path.join(root, '.env.test'));

  const webURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
  const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000/api';
  const password = process.env.E2E_USER_PASSWORD ?? 'password123';

  await waitForHealth(`${apiURL.replace(/\/api$/, '')}/api`, 'API');
  await waitForHealth(webURL, 'Web');

  const authDir = path.join(__dirname, '.auth');
  fs.mkdirSync(authDir, { recursive: true });

  const users = {
    admin: process.env.E2E_ADMIN_EMAIL ?? 'admin@agrinvest.vn',
    farmer: process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com',
    investor: process.env.E2E_INVESTOR_EMAIL ?? 'testcursor04@gmail.com',
  };

  const adminWebURL = process.env.PLAYWRIGHT_ADMIN_BASE_URL ?? 'http://admin.localhost:3001';

  for (const [role, email] of Object.entries(users)) {
    const auth = await loginViaApi(apiURL, email, password);
    const originURL = role === 'admin' ? adminWebURL : webURL;
    await saveStorageState(originURL, auth, path.join(authDir, `${role}.json`));
    console.log(`[e2e] storageState: ${role}.json (${email}) @ ${originURL}`);
  }

  const adminAuth = await loginViaApi(apiURL, users.admin, password);
  const headers = { Authorization: `Bearer ${adminAuth.access_token}` };
  try {
    const usersRes = await fetch(`${apiURL}/auth/admin/users?page=1&limit=20`, { headers });
    const farmersRes = await fetch(`${apiURL}/admin/farmers?page=1&limit=5`, { headers });
    const farmlandsRes = await fetch(`${apiURL}/admin/farmlands?page=1&limit=5`, { headers });
    if (usersRes.ok && farmersRes.ok && farmlandsRes.ok) {
      const usersBody = (await usersRes.json()) as { data?: { id: number; role: string }[] };
      const farmersBody = (await farmersRes.json()) as { data?: { id: number }[] };
      const farmlandsBody = (await farmlandsRes.json()) as { data?: { id: number }[] };
      async function searchUserId(search: string, role?: string): Promise<number | undefined> {
        const searchRes = await fetch(
          `${apiURL}/auth/admin/users?search=${encodeURIComponent(search)}&limit=10&page=1`,
          { headers },
        );
        if (!searchRes.ok) return undefined;
        const searchBody = (await searchRes.json()) as { data?: { id: number; role: string }[] };
        const list = searchBody.data ?? [];
        if (role) {
          const hit = list.find((u) => u.role === role);
          if (hit) return hit.id;
        }
        return list[0]?.id;
      }
      const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@agrinvest.vn';
      const farmerEmail = process.env.E2E_FARMER_EMAIL ?? 'dquang1305@gmail.com';
      const adminId =
        (await searchUserId(adminEmail.split('@')[0], 'ADMIN')) ??
        (await searchUserId('agrinvest', 'ADMIN')) ??
        1;
      const farmerId =
        (await searchUserId(farmerEmail.split('@')[0], 'FARMER')) ??
        (await searchUserId('dquang', 'FARMER')) ??
        2;
      fs.writeFileSync(
        path.join(__dirname, '.api-fixture.json'),
        JSON.stringify(
          {
            userIds: {
              admin: adminId,
              farmer: farmerId,
            },
            farmerId: farmersBody.data?.[0]?.id,
            farmlandId: farmlandsBody.data?.[0]?.id,
          },
          null,
          2,
        ),
      );
      console.log('[e2e] wrote .api-fixture.json for detail tests');
    }
  } catch (e) {
    console.warn('[e2e] could not write .api-fixture.json', e);
  }
}