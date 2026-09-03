import { afterEach, describe, expect, it } from 'vitest';
import type { CmsTourDocument } from './cmsTourDocument';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import {
  applyCmsTourOverlay,
  clearCmsTourOverlay,
  resolveTourWithCmsOverlay,
  setCmsTourOverlay,
} from './cmsTourOverlay';

const document: CmsTourDocument = {
  id: 'summer-8',
  slug: 'poluostrov-krabbe',
  season: 'summer',
  status: 'active',
  title: 'Полуостров Краббе',
  subtitle: 'Скалы',
  heroPhrase: 'Сопки',
  description: 'Текст',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [{ day: 1, timeLabel: '05:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'shuttle-van' }],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'cover',
      stillUrl: 'https://cms.test/cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://cms.test/wide2.webp',
      videoUrl: null,
      alt: 'Предисловие',
    },
    {
      id: 'g1',
      stillUrl: 'https://cms.test/1.webp',
      videoUrl: 'https://cms.test/1.grid.webm',
      alt: 'Бухта',
    },
  ],
  bento: {
    blocks: [
      {
        type: 'bento-single',
        slots: [{ assetId: 'g1', objectPosition: '50% 40%' }],
      },
    ],
  },
  legacyGalleryVariant: null,
};

describe('cmsDocumentToSiteTour', () => {
  it('ставит обложку, предисловие и bento с URL слотов', () => {
    const tour = cmsDocumentToSiteTour(document);

    expect(tour.id).toBe('summer-8');
    expect(tour.slug).toBe('poluostrov-krabbe');
    expect(tour.imageUrl).toBe('https://cms.test/cover.webp');
    expect(tour.prefaceBackgroundImageUrl).toBe('https://cms.test/wide2.webp');
    expect(tour.bentoLayout?.blocks).toHaveLength(1);
    expect(tour.bentoLayout?.blocks[0]?.slots[0]).toEqual({
      src: 'https://cms.test/1.grid.webm',
      alt: 'Бухта',
      objectPosition: '50% 40%',
    });
    expect(tour.galleryImages[0]).toBe('https://cms.test/cover.webp');
    expect(tour.galleryImages[1]).toBe('https://cms.test/wide2.webp');
    expect(tour.galleryGridUrls?.[2]).toBe('https://cms.test/1.grid.webm');
    expect(tour.includedInPrice[0]?.text).toBe('Трансфер');
  });

  it('прокидывает кадрирование обложки', () => {
    const tour = cmsDocumentToSiteTour({
      ...document,
      coverCrop: { card: { x: 20, y: 80 }, hero: { x: 50, y: 30 } },
    });
    expect(tour.coverCrop).toEqual({ card: { x: 20, y: 80 }, hero: { x: 50, y: 30 } });
  });

  it('сохраняет дни программы при преобразовании в публичный тур', () => {
    const tour = cmsDocumentToSiteTour({
      ...document,
      durationDays: 2,
      program: [
        { day: 1, timeLabel: '08:00', description: 'Сбор' },
        { day: 2, timeLabel: '09:00', description: 'Маршрут' },
      ],
    });
    expect(tour.program).toEqual([
      { day: 1, timeLabel: '08:00', description: 'Сбор' },
      { day: 2, timeLabel: '09:00', description: 'Маршрут' },
    ]);
  });

  it('не кладёт в витрину блоки с пустыми ячейками', () => {
    const tour = cmsDocumentToSiteTour({
      ...document,
      bento: {
        blocks: [
          { type: 'bento-single', slots: [{ assetId: null }] },
          { type: 'bento-single', slots: [{ assetId: 'g1' }] },
        ],
      },
    });
    expect(tour.bentoLayout?.blocks).toHaveLength(1);
    expect(tour.bentoLayout?.blocks[0]?.slots[0]?.src).toBe('https://cms.test/1.grid.webm');
  });
});

describe('cmsDocumentToSiteTour overlay', () => {
  afterEach(() => {
    clearCmsTourOverlay();
  });

  it('при активном overlay не откатывается на код', () => {
    const fromCode = cmsDocumentToSiteTour({
      ...document,
      title: 'Код',
    });
    const fromCms = cmsDocumentToSiteTour({
      ...document,
      title: 'CMS',
    });
    setCmsTourOverlay([fromCms]);

    expect(applyCmsTourOverlay(fromCode)?.title).toBe('CMS');
    expect(applyCmsTourOverlay({ ...fromCode, id: 'code-only' })).toBeUndefined();
  });
});

describe('resolveTourWithCmsOverlay', () => {
  it('подменяет тур с тем же id записью из CMS', () => {
    const fromCode = cmsDocumentToSiteTour({
      ...document,
      title: 'Код',
    });
    const fromCms = cmsDocumentToSiteTour(document);
    const overlay = new Map([[fromCms.id, { ...fromCms, title: 'CMS' }]]);

    expect(resolveTourWithCmsOverlay(fromCode, overlay)?.title).toBe('CMS');
  });

  it('оставляет код, если overlay нет', () => {
    const fromCode = cmsDocumentToSiteTour(document);
    expect(resolveTourWithCmsOverlay(fromCode, new Map())?.title).toBe(
      'Полуостров Краббе'
    );
  });
});
