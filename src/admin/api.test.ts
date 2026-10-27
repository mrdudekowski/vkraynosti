import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminCloneTour, adminCmsHealth, adminCreateTour, adminDeleteTour } from './api';

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

describe('adminDeleteTour', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deletes the encoded tour and accepts a no-content response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await adminDeleteTour('winter/1');

    expect(fetchMock).toHaveBeenCalledWith('/api/cms/tours/winter%2F1', {
      method: 'DELETE',
      credentials: 'include',
    });
  });

  it('exposes the backend dependency conflict', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'tour_has_dependencies' }), { status: 409 }),
      ),
    );

    await expect(adminDeleteTour('winter-1')).rejects.toThrow('tour_has_dependencies');
  });
});

describe('adminCmsHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads storage state from the health endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, postgres: 'up', jsonStore: 'up', storage: 'open' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(adminCmsHealth()).resolves.toEqual({
      ok: true,
      postgres: 'up',
      jsonStore: 'up',
      storage: 'open',
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/cms/health', { credentials: 'include' });
  });
});

describe('adminCreateTour', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps a storage 503 to storage_unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'storage_unavailable' }), { status: 503 }),
      ),
    );
    await expect(adminCreateTour({ title: 'Новый', season: 'winter' })).rejects.toThrow(
      'storage_unavailable',
    );
  });
});
