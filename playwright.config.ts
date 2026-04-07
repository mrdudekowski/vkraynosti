import { defineConfig, devices } from '@playwright/test';

/** Соответствует `base` в `vite.config.ts` и `basename` роутера. */
/** Завершающий `/` нужен, чтобы относительные `goto('tours/...')` не «съедали» сегмент basename. */
const DEV_ORIGIN = 'http://127.0.0.1:5173/vkraynosti/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: DEV_ORIGIN,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    /** Vite отвечает на корне; `baseURL` для тестов — с `basename`. */
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
