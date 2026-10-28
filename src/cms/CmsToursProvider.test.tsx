import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsToursProvider } from './CmsToursProvider';
import { clearCmsTourOverlay, getCmsOverlayTourById } from './cmsTourOverlay';
import { loadCmsToursFile, loadLiveCmsToursFile } from './loadCmsToursFile';
import { resetStorageCircuitForTests } from './storageCircuit';

vi.mock('./loadCmsToursFile', () => ({
  loadCmsToursFile: vi.fn(),
  loadLiveCmsToursFile: vi.fn(),
}));

const bakeFile = {
  schemaVersion: 1 as const,
  tours: [
    {
      id: 'fall-1',
      slug: 'test',
      season: 'fall' as const,
      status: 'active' as const,
      title: 'Test',
      subtitle: 's',
      heroPhrase: 'h',
      description: 'd',
      duration: '1 день',
      durationDays: 1,
      difficulty: 'Easy' as const,
      price: 'по запросу',
      program: [{ timeLabel: '04:30', description: 'Выезд' }],
      included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
      coverAssetId: 'cover',
      prefaceAssetId: null,
      assets: [
        {
          id: 'cover',
          stillUrl: '/data/cms/media/tours/fall-1/cover.webp',
          videoUrl: null,
          alt: '',
        },
      ],
      bento: { blocks: [] },
      legacyGalleryVariant: null,
    },
  ],
};

describe('CmsToursProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    clearCmsTourOverlay();
    resetStorageCircuitForTests();
    vi.clearAllMocks();
  });

  it('retries live catalog after bake fallback', async () => {
    const liveFile = {
      ...bakeFile,
      tours: [{ ...bakeFile.tours[0], title: 'Live' }],
    };

    vi.mocked(loadCmsToursFile).mockResolvedValue({
      file: bakeFile,
      source: 'bake',
    });
    vi.mocked(loadLiveCmsToursFile).mockResolvedValue(liveFile);

    render(
      <CmsToursProvider>
        <span />
      </CmsToursProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getCmsOverlayTourById('fall-1')?.title).toBe('Test');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
      await Promise.resolve();
    });

    expect(getCmsOverlayTourById('fall-1')?.title).toBe('Live');
    expect(loadLiveCmsToursFile).toHaveBeenCalled();
  });

  it('keeps live retrying across backoff until live catalog succeeds', async () => {
    const liveFile = {
      ...bakeFile,
      tours: [{ ...bakeFile.tours[0], title: 'Live' }],
    };

    vi.mocked(loadCmsToursFile).mockResolvedValue({
      file: bakeFile,
      source: 'bake',
    });
    let liveAttempts = 0;
    vi.mocked(loadLiveCmsToursFile).mockImplementation(async () => {
      liveAttempts += 1;
      return liveAttempts < 2 ? null : liveFile;
    });

    render(
      <CmsToursProvider>
        <span />
      </CmsToursProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(getCmsOverlayTourById('fall-1')?.title).toBe('Test');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
      await Promise.resolve();
    });
    expect(getCmsOverlayTourById('fall-1')?.title).toBe('Test');
    expect(liveAttempts).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
      await Promise.resolve();
    });
    expect(getCmsOverlayTourById('fall-1')?.title).toBe('Live');
    expect(liveAttempts).toBe(2);
  });
});
