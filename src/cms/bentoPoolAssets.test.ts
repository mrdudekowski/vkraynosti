import { describe, expect, it } from 'vitest';
import { bentoPoolAssets, reservedTourAssetIds, unusedBentoPoolAssets } from './bentoPoolAssets';
import type { CmsTourDocument } from './cmsTourDocument';

const document: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'active',
  title: 'Изюбриная',
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'Текст',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [],
  included: [],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'cover',
      stillUrl: 'https://cdn.example/cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://cdn.example/preface.webp',
      videoUrl: null,
      alt: 'Предисловие',
    },
    {
      id: 'g-0',
      stillUrl: 'https://cdn.example/g-0.webp',
      videoUrl: null,
      alt: 'Пул',
    },
  ],
  bento: { blocks: [] },
  legacyGalleryVariant: null,
};

describe('bentoPoolAssets', () => {
  it('убирает обложку и предисловие из пула', () => {
    expect([...reservedTourAssetIds(document)]).toEqual(['cover', 'preface']);
    expect(bentoPoolAssets(document).map((asset) => asset.id)).toEqual(['g-0']);
    expect(unusedBentoPoolAssets(document).map((asset) => asset.id)).toEqual(['g-0']);
    expect(
      unusedBentoPoolAssets({
        ...document,
        bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'g-0' }] }] },
      }).map((asset) => asset.id)
    ).toEqual([]);
  });

  it('учитывает живые id редактора', () => {
    expect(
      bentoPoolAssets({ ...document, coverAssetId: 'g-0' }).map((asset) => asset.id)
    ).toEqual(['cover']);
  });
});
