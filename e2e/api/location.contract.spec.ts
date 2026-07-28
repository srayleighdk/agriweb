import { test, expect } from '@playwright/test';
import { getApiBaseUrl } from '../fixtures/admin-api';

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

type PublicInvestment = {
  id: number;
  farmlandId: number | null;
  approxLocation: ApproxLocation | null;
  preciseLocation?: { lat: number; lng: number; precision: string } | null;
  farmland?: Record<string, unknown> | null;
};

function extractItems(body: unknown): AvailableItem[] {
  if (Array.isArray(body)) return body as AvailableItem[];
  if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: AvailableItem[] }).data;
  }
  return [];
}

test.describe('Location privacy API contracts @api', () => {
  let mapProjectId: number | undefined;
  let noCoordProjectId: number | undefined;

  test.beforeAll(async ({ request }) => {
    const base = getApiBaseUrl();
    const res = await request.get(`${base}/farmer-investments/available?limit=50`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const items = extractItems(await res.json());
    mapProjectId = items.find((i) => i.approxLocation != null)?.id;
    noCoordProjectId = items.find((i) => i.approxLocation === null)?.id;
  });

  test('approximate location is exposed to anonymous callers', async ({ request }) => {
    if (mapProjectId == null) {
      test.skip(true, 'No available project with approxLocation in seed data');
      return;
    }
    const base = getApiBaseUrl();
    const res = await request.get(`${base}/farmer-investments/public/${mapProjectId}`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as PublicInvestment;
    expect(body.approxLocation).toBeTruthy();
    expect(typeof body.approxLocation!.lat).toBe('number');
    expect(typeof body.approxLocation!.lng).toBe('number');
    expect(body.approxLocation!.radiusMeters).toBe(3000);
    expect(body.approxLocation!.precision).toBe('APPROXIMATE');
  });

  test('no exact location for anonymous callers', async ({ request }) => {
    if (mapProjectId == null) {
      test.skip(true, 'No available project with approxLocation in seed data');
      return;
    }
    const base = getApiBaseUrl();
    const res = await request.get(`${base}/farmer-investments/public/${mapProjectId}`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as PublicInvestment;
    expect(body.preciseLocation == null).toBeTruthy();
  });

  test('no raw coordinate leak in public response', async ({ request }) => {
    if (mapProjectId == null) {
      test.skip(true, 'No available project with approxLocation in seed data');
      return;
    }
    const base = getApiBaseUrl();
    const res = await request.get(`${base}/farmer-investments/public/${mapProjectId}`);
    const text = await res.text();
    expect(res.ok(), text).toBeTruthy();
    expect(text).not.toContain('"coordinates"');
    const body = JSON.parse(text) as PublicInvestment;
    if (body.farmland && typeof body.farmland === 'object') {
      expect('coordinates' in body.farmland).toBe(false);
    }
  });

  test('fuzzing is deterministic across repeated fetches', async ({ request }) => {
    if (mapProjectId == null) {
      test.skip(true, 'No available project with approxLocation in seed data');
      return;
    }
    const base = getApiBaseUrl();
    const url = `${base}/farmer-investments/public/${mapProjectId}`;
    const res1 = await request.get(url);
    const res2 = await request.get(url);
    expect(res1.ok(), await res1.text()).toBeTruthy();
    expect(res2.ok(), await res2.text()).toBeTruthy();
    const a = ((await res1.json()) as PublicInvestment).approxLocation;
    const b = ((await res2.json()) as PublicInvestment).approxLocation;
    expect(a).toEqual(b);
  });

  test('approxLocation is null when farmland has no coordinates', async ({ request }) => {
    if (noCoordProjectId == null) {
      test.skip(true, 'No available project with approxLocation === null in seed data');
      return;
    }
    const base = getApiBaseUrl();
    const res = await request.get(`${base}/farmer-investments/public/${noCoordProjectId}`);
    expect(res.ok(), await res.text()).toBeTruthy();
    const body = (await res.json()) as PublicInvestment;
    expect(body.approxLocation).toBeNull();
  });
});
