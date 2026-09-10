import { defineConfig, devices } from '@playwright/test';
import { CMS_E2E_RELEASE_ONE } from './scripts/cms/e2e-release-one-config.ts';

const viteOrigin = `http://127.0.0.1:${CMS_E2E_RELEASE_ONE.vitePort}`;
const apiOrigin = `http://127.0.0.1:${CMS_E2E_RELEASE_ONE.apiPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'cms-release-one.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  use: {
    baseURL: `${viteOrigin}/vkraynosti/`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: [
    {
      command: 'npm run cms:e2e-api',
      url: `${apiOrigin}/api/cms/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        CMS_API_PORT: String(CMS_E2E_RELEASE_ONE.apiPort),
        DATABASE_URL: process.env.DATABASE_URL ?? CMS_E2E_RELEASE_ONE.databaseUrl,
        TEST_DATABASE_URL: process.env.TEST_DATABASE_URL ?? CMS_E2E_RELEASE_ONE.databaseUrl,
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${CMS_E2E_RELEASE_ONE.vitePort}`,
      url: viteOrigin,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        CMS_API_PORT: String(CMS_E2E_RELEASE_ONE.apiPort),
      },
    },
  ],
});
