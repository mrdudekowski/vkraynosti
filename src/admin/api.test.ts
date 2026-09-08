import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminCloneTour } from './api';

describe('adminCloneTour', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the target season to the tour clone endpoint', async () => {
    const response = {
      document: { id: 'summer-1' },
      meta: { rev: 1 },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await adminCloneTour('winter/1', 'summer');

    expect(fetchMock).toHaveBeenCalledWith('/api/cms/tours/winter%2F1/clone', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ targetSeason: 'summer' }),
    });
  });
});
