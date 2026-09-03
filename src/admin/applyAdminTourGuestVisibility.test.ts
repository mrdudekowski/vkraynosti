import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { createCmsTourMeta } from '../cms/cmsTourMeta';
import { layoutFromDocument, patchFromDocument } from './patchFromDocument';

vi.mock('./api', () => ({
  adminGetTour: vi.fn(),
  adminSaveTour: vi.fn(),
  adminPublishTour: vi.fn(),
  adminSubmitPublishQueue: vi.fn(),
}));

import {
  adminGetTour,
  adminPublishTour,
  adminSaveTour,
  adminSubmitPublishQueue,
} from './api';
import { applyAdminTourGuestVisibility } from './applyAdminTourGuestVisibility';

function readyTour(overrides: Partial<CmsTourDocument> = {}): CmsTourDocument {
  return {
    id: 'winter-1',
    slug: 'izubrinaya',
    season: 'winter',
    status: 'active',
    title: 'Изюбриная',
    subtitle: 'Зима',
    heroPhrase: 'Ели',
    description: 'лево',
    descriptionAside: 'право',
    duration: '1 день',
    durationDays: 1,
    difficulty: 'Medium',
    price: 'по запросу',
    program: [{ day: 1, timeLabel: '04:30', description: 'Выезд' }],
    included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
    coverAssetId: 'cover',
    prefaceAssetId: 'preface',
    assets: [
      { id: 'cover', stillUrl: 'https://cdn.example/cover.webp', videoUrl: null, alt: '' },
      { id: 'preface', stillUrl: 'https://cdn.example/preface.webp', videoUrl: null, alt: '' },
      { id: 'g-0', stillUrl: 'https://cdn.example/g-0.webp', videoUrl: null, alt: '' },
    ],
    bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'g-0' }] }] },
    legacyGalleryVariant: null,
    ...overrides,
  };
}

describe('applyAdminTourGuestVisibility', () => {
  const document = readyTour();
  const meta = createCmsTourMeta({ rev: 3 });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminGetTour).mockResolvedValue({
      document,
      meta,
      published: true,
      publishedStatus: 'active',
    });
    vi.mocked(adminSaveTour).mockResolvedValue({
      document: readyTour({ status: 'hidden' }),
      meta: createCmsTourMeta({ rev: 4 }),
    });
    vi.mocked(adminSubmitPublishQueue).mockResolvedValue(undefined);
  });

  it('для админа сохраняет hidden и ставит в очередь, не публикует сразу', async () => {
    await expect(applyAdminTourGuestVisibility('winter-1', 'hidden')).resolves.toBe('queued');

    expect(adminSaveTour).toHaveBeenCalledWith(
      'winter-1',
      3,
      patchFromDocument(document),
      layoutFromDocument(document),
      'hidden',
    );
    expect(adminPublishTour).not.toHaveBeenCalled();
    expect(adminSubmitPublishQueue).toHaveBeenCalledWith({ tourIds: ['winter-1'] });
  });

  it('для редактора тоже только очередь', async () => {
    await expect(applyAdminTourGuestVisibility('winter-1', 'hidden')).resolves.toBe('queued');
    expect(adminPublishTour).not.toHaveBeenCalled();
    expect(adminSubmitPublishQueue).toHaveBeenCalledWith({ tourIds: ['winter-1'] });
  });
});
