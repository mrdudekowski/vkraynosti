import { describe, expect, it } from 'vitest';
import type { CmsTourDocument } from './cmsTourDocument';
import { cloneCmsTourDocument } from './cloneCmsTour';

const source: CmsTourDocument = {
  id: 'spring-3',
  slug: 'krabbe',
  season: 'spring',
  status: 'active',
  title: 'Краббе',
  subtitle: 'Море и бухты',
  heroPhrase: 'Тихий берег',
  description: 'Описание тура',
  duration: '2 дня',
  durationDays: 2,
  difficulty: 'Hard',
  price: '25 000 ₽',
  program: [{ timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
  coverAssetId: 'cover-1',
  prefaceAssetId: null,
  assets: [
    {
      id: 'cover-1',
      stillUrl: 'https://cdn.example/media/tours/spring-3/cover-1.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
  ],
  bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'cover-1' }] }] },
  legacyGalleryVariant: null,
};

describe('cloneCmsTourDocument', () => {
  it('copies content while resetting identity, season, and publication state', () => {
    const cloned = cloneCmsTourDocument(source, {
      id: 'summer-14',
      slug: 'krabbe-2',
      season: 'summer',
      assetIdBySourceId: new Map([['cover-1', 'asset-1']]),
      assetUrlBySourceUrl: new Map([
        ['https://cdn.example/media/tours/spring-3/cover-1.webp', 'https://cdn.example/media/tours/summer-14/asset-1.webp'],
      ]),
    });

    expect(cloned).toMatchObject({
      id: 'summer-14',
      slug: 'krabbe-2',
      season: 'summer',
      status: 'draft',
      title: source.title,
      description: source.description,
      program: source.program,
      included: source.included,
    });
    expect(cloned.assets[0]).toMatchObject({
      id: 'asset-1',
      stillUrl: 'https://cdn.example/media/tours/summer-14/asset-1.webp',
    });
    expect(cloned.coverAssetId).toBe('asset-1');
    expect(cloned.bento.blocks[0]?.slots[0]?.assetId).toBe('asset-1');
    expect(cloned).not.toBe(source);
  });
});
