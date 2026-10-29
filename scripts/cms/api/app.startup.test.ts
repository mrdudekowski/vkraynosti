/** @vitest-environment node */
import { beforeEach, describe, expect, it } from 'vitest';
import { setPublishedSyncState } from './publishedSyncState.ts';
import type { AuthRepository } from './auth/authRepository.ts';
import { createCmsApiApp } from './app.ts';
import type { CmsApiEnv } from './env.ts';
import { createMemoryJsonStore } from './store.ts';

describe('CMS API startup', () => {
  beforeEach(() => {
    setPublishedSyncState('unknown');
  });

  it('serves health without querying the database during app construction', async () => {
    let listUsersCalled = false;
    const authRepository = {
      listUsers: async () => {
        listUsersCalled = true;
        throw new Error('database unavailable');
      },
    } as AuthRepository;

    const app = createCmsApiApp({
      env: {} as CmsApiEnv,
      store: createMemoryJsonStore(),
      authRepository,
      departureRepository: {} as never,
    });

    const response = await app.request('/api/cms/health');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      postgres: 'up',
      jsonStore: 'up',
      storage: 'closed',
      catalogMirror: 'down',
      publishedSync: 'unknown',
    });
    expect(listUsersCalled).toBe(false);
  });
});
