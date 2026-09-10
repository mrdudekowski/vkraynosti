/** Локальный шлюз Release 1: memory-store API + отдельный порт Vite, без S3. */
export const CMS_E2E_RELEASE_ONE = {
  databaseUrl: 'postgres://vkrainosti:local-vkrainosti-only@127.0.0.1:54327/vkrainosti',
  apiPort: 8791,
  vitePort: 5174,
  adminLogin: 'admin',
  adminPassword: 'admin',
  editorLogin: 'editor',
  editorPassword: 'editor',
  readyTourId: 'e2e-ready',
  incompleteTourId: 'e2e-incomplete',
  readyTourTitle: 'E2E готовый',
  incompleteTourTitle: 'E2E неполный',
  openDate: '2026-08-28',
  plannedDate: '2026-08-29',
  cancelledDate: '2026-08-30',
} as const;
