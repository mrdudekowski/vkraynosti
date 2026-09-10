import { describe, expect, it } from 'vitest';
import { allocateUploadAssetId, applyTourLayoutPatch } from './applyTourLayoutPatch';
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
      alt: 'Слот',
    },
  ],
  bento: {
    blocks: [{ type: 'bento-single', slots: [{ assetId: 'g-0' }] }],
  },
  legacyGalleryVariant: null,
};

describe('applyTourLayoutPatch', () => {
  it('меняет обложку и блоки, не трогает описание', () => {
    const next = applyTourLayoutPatch(document, {
      coverAssetId: 'g-0',
      bento: {
        blocks: [
          {
            type: 'bento-vert',
            slots: [{ assetId: 'g-0' }, { assetId: 'g-0' }],
          },
        ],
      },
    });

    expect(next.coverAssetId).toBe('g-0');
    expect(next.bento.blocks).toEqual([
      { type: 'bento-vert', slots: [{ assetId: 'g-0' }, { assetId: 'g-0' }] },
    ]);
    expect(next.description).toBe(document.description);
    expect(next.legacyGalleryVariant).toBeNull();
  });

  it('сохраняет кадрирование обложки', () => {
    const next = applyTourLayoutPatch(document, {
      coverAssetId: 'cover',
      coverCrop: { card: { x: 20, y: 80 }, hero: { x: 50, y: 30 }, heroLg: { x: 50, y: 20 } },
      bento: document.bento,
    });
    expect(next.coverCrop).toEqual({
      card: { x: 20, y: 80 },
      hero: { x: 50, y: 30 },
      heroLg: { x: 50, y: 20 },
    });
    expect(next.bento).toEqual(document.bento);
  });

  it('убирает пустой coverCrop из документа', () => {
    const withCrop = applyTourLayoutPatch(document, {
      coverAssetId: 'cover',
      coverCrop: { card: { x: 20, y: 80 } },
      bento: document.bento,
    });
    const next = applyTourLayoutPatch(withCrop, {
      coverAssetId: 'cover',
      coverCrop: {},
      bento: document.bento,
    });
    expect(next.coverCrop).toBeUndefined();
  });

  it('отклоняет чужой asset и неверное число слотов', () => {
    expect(() =>
      applyTourLayoutPatch(document, {
        coverAssetId: 'missing',
        bento: { blocks: [] },
      })
    ).toThrow(/Unknown cover asset/);

    expect(() =>
      applyTourLayoutPatch(document, {
        coverAssetId: 'cover',
        bento: {
          blocks: [{ type: 'bento-left', slots: [{ assetId: 'g-0' }] }],
        },
      })
    ).toThrow(/expects 3 slots/);
  });

  it('разрешает пустой слот и отклоняет неизвестный кадр', () => {
    const next = applyTourLayoutPatch(document, {
      coverAssetId: 'cover',
      bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: null }] }] },
    });
    expect(next.bento.blocks[0]?.slots[0]?.assetId).toBeNull();

    expect(() =>
      applyTourLayoutPatch(document, {
        coverAssetId: 'cover',
        bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'missing' }] }] },
      })
    ).toThrow(/Unknown bento asset/);
  });
});

describe('allocateUploadAssetId', () => {
  it('берёт следующий свободный u-N', () => {
    expect(allocateUploadAssetId(['cover', 'g-0'])).toBe('u-1');
    expect(allocateUploadAssetId(['u-1', 'u-2'])).toBe('u-3');
  });
});
