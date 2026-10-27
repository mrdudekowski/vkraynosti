import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Tour } from '../types';
import {
  classifyStorageFetchError,
  getStorageCircuitState,
  resetStorageCircuitForTests,
  selectGuestCanaryUrl,
  shouldShowGuestHeavyGallery,
  startGuestStorageCircuit,
} from './storageCircuit';

function tourWith(urls: { cover: string; gallery: string }): Tour {
  return {
    id: 'fall-1',
    slug: 'x',
    season: 'fall',
    title: 't',
    subtitle: '',
    heroPhrase: '',
    duration: '1',
    difficulty: 'Easy',
    price: '',
    description: '',
    program: [],
    includedInPrice: [],
    imageUrl: urls.cover,
    galleryImages: [urls.cover, urls.gallery],
    galleryGridUrls: [urls.cover, urls.gallery],
  } as Tour;
}

describe('guest storage circuit', () => {
  afterEach(() => {
    resetStorageCircuitForTests();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('picks a CDN gallery URL, not a bake cover', () => {
    const canary = selectGuestCanaryUrl([
      tourWith({
        cover: '/data/cms/media/tours/fall-1/cover.webp',
        gallery: 'https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-1/g-0.webp',
      }),
    ]);
    expect(canary).toBe('https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-1/g-0.webp');
  });

  it('classifies canary 403 as storage_down and non-canary 404 as asset_missing', () => {
    expect(classifyStorageFetchError(403, true)).toBe('storage_down');
    expect(classifyStorageFetchError(404, false)).toBe('asset_missing');
  });

  it('opens on canary 403 and later closes on 200 without reload', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 403 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchSpy);

    startGuestStorageCircuit('https://cdn.example/g.webp');
    await Promise.resolve();
    await Promise.resolve();
    expect(getStorageCircuitState()).toBe('open');
    expect(shouldShowGuestHeavyGallery(getStorageCircuitState())).toBe(false);

    await vi.advanceTimersByTimeAsync(5000);
    await Promise.resolve();
    await Promise.resolve();
    expect(getStorageCircuitState()).toBe('closed');
    expect(shouldShowGuestHeavyGallery(getStorageCircuitState())).toBe(true);
  });
});
