import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadCmsToursFile } from './loadCmsToursFile';

describe('loadCmsToursFile', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('не ходит в сеть, если CMS env пустой', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await expect(loadCmsToursFile()).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
