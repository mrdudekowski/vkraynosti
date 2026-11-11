import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsToursProvider } from './CmsToursProvider';
import { clearCmsTourOverlay, getCmsOverlayTourById } from './cmsTourOverlay';
import { loadCmsToursFile } from './loadCmsToursFile';
import { resetStorageCircuitForTests } from './storageCircuit';

vi.mock('./loadCmsToursFile', () => ({ loadCmsToursFile: vi.fn() }));

const bakedTour = {
  id: 'fall-1',
  slug: 'test',
  season: 'fall' as const,
  status: 'active' as const,
  title: 'Baked title',
  subtitle: 'Subtitle',
  heroPhrase: 'Hero',
  description: 'Description',
  duration: '1 день',
  durationDays: 1,
  difficulty: 'Easy' as const,
  price: 'по запросу',
  program: [{ timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
  coverAssetId: 'cover',
  prefaceAssetId: null,
  assets: [{ id: 'cover', stillUrl: '/data/cms/media/tours/fall-1/cover.webp', videoUrl: null, alt: '' }],
  bento: { blocks: [] },
  legacyGalleryVariant: null,
};

const bakeFile = { schemaVersion: 1 as const, tours: [bakedTour] };

describe('CmsToursProvider', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    vi.mocked(loadCmsToursFile).mockResolvedValue({ file: bakeFile, source: 'bake' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    clearCmsTourOverlay();
    resetStorageCircuitForTests();
    vi.clearAllMocks();
  });

  it('uses the deployed bake as the stable tour source', async () => {
    render(<CmsToursProvider><span /></CmsToursProvider>);
    await act(async () => { await Promise.resolve(); });

    expect(getCmsOverlayTourById('fall-1')?.title).toBe('Baked title');
    expect(loadCmsToursFile).toHaveBeenCalledTimes(1);
  });
});
