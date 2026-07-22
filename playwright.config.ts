import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const adminBaseURL = process.env.PLAYWRIGHT_ADMIN_BASE_URL ?? 'http://admin.localhost:3001';
const apiBaseURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000/api';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  globalSetup: './e2e/global-setup.ts',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      workers: 1,
      use: {
        baseURL: apiBaseURL.replace(/\/api$/, ''),
      },
    },
    {
      name: 'main',
      testIgnore: /(admin\/|smoke\/admin-host|api\/).*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin',
      testMatch: /(admin\/|smoke\/admin-host).*\.spec\.ts/,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: adminBaseURL,
        storageState: path.join(__dirname, 'e2e', '.auth', 'admin.json'),
      },
    },
  ],
});