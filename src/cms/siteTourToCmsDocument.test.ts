import { describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import { cmsDocumentToSiteTour } from './cmsDocumentToSiteTour';
import {
  cmsObjectKeyFromPublicUrl,
  rewriteCmsDocumentAssetBase,
  siteTourToCmsDocument,
} from './siteTourToCmsDocument';

const tour: Tour = {
  id: 'summer-8',
  slug: 'poluostrov-krabbe',
  season: 'summer',
  title: 'Полуостров Краббе',
  subtitle: 'Скалы',
  heroPhrase: 'Сопки',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  description: 'Текст',
  program: [{ timeLabel: '05:30', description: 'Выезд' }],
  includedInPrice: [],
  imageUrl: 'https://cdn.example/tours/summer-8/cover.webp',
  prefaceBackgroundImageUrl: 'https://cdn.example/tours/summer-8/wide2.webp',
  galleryImages: [
    'https://cdn.example/tours/summer-8/cover.webp',
    'https://cdn.example/tours/summer-8/wide2.webp',
    'https://cdn.example/tours/summer-8/1.webp',
  ],
  galleryGridUrls: [
    'https://cdn.example/tours/summer-8/cover.webp',
    'https://cdn.example/tours/summer-8/wide2.webp',
    'https://cdn.example/tours/summer-8/1.webp',
  ],
  bentoLayout: {
    blocks: [
      {
        type: 'bento-single',
        slots: [{ src: 'https://cdn.example/tours/summer-8/1.webp', alt: 'Бухта' }],
      },
    ],
  },
};

describe('siteTourToCmsDocument', () => {
  it('сохраняет обложку, предисловие и слоты bento', () => {
    const document = siteTourToCmsDocument(tour);
    expect(document.coverAssetId).toBe('cover');
    expect(document.prefaceAssetId).toBe('preface');
    expect(document.bento.blocks[0]?.type).toBe('bento-single');
    const roundTrip = cmsDocumentToSiteTour(document);
    expect(roundTrip.title).toBe(tour.title);
    expect(roundTrip.bentoLayout?.blocks[0]?.slots[0]?.src).toBe(
      'https://cdn.example/tours/summer-8/1.webp'
    );
  });

  it('сохраняет день программы при обратном преобразовании в CMS', () => {
    const document = siteTourToCmsDocument({
      ...tour,
      program: [
        { day: 1, timeLabel: '08:00', description: 'Сбор' },
        { day: 2, timeLabel: '09:00', description: 'Маршрут' },
      ],
    });
    expect(document.program).toEqual([
      { day: 1, timeLabel: '08:00', description: 'Сбор' },
      { day: 2, timeLabel: '09:00', description: 'Маршрут' },
    ]);
  });

  it('ключ S3 берёт из path-style URL без имени бакета в Key', () => {
    const rewritten = rewriteCmsDocumentAssetBase(
      siteTourToCmsDocument(tour),
      'https://s3.twcstorage.ru/vkraynosti-cms-dev',
      'media/tours/summer-8'
    );
    expect(rewritten.assets[0]?.stillUrl).toBe(
      'https://s3.twcstorage.ru/vkraynosti-cms-dev/media/tours/summer-8/cover.webp'
    );
    expect(
      cmsObjectKeyFromPublicUrl(
        rewritten.assets[0]!.stillUrl,
        'https://s3.twcstorage.ru/vkraynosti-cms-dev'
      )
    ).toBe('media/tours/summer-8/cover.webp');
  });

  it('помечает legacy-галерею и сохраняет пул кадров без bentoLayout', () => {
    const legacyTour: Tour = {
      ...tour,
      id: 'legacy-no-grid',
      slug: 'legacy-no-grid',
      season: 'winter',
      bentoLayout: undefined,
      imageUrl: 'https://cdn.example/tours/legacy/cover.webp',
      prefaceBackgroundImageUrl: 'https://cdn.example/tours/legacy/wide2.webp',
      galleryImages: [
        'https://cdn.example/tours/legacy/cover.webp',
        'https://cdn.example/tours/legacy/wide2.webp',
      ],
      galleryGridUrls: [
        'https://cdn.example/tours/legacy/cover.webp',
        'https://cdn.example/tours/legacy/wide2.webp',
      ],
    };
    const document = siteTourToCmsDocument(legacyTour);
    expect(document.bento.blocks).toEqual([]);
    expect(document.legacyGalleryVariant).toBe('default');
    expect(document.assets.length).toBeGreaterThanOrEqual(2);

    const roundTrip = cmsDocumentToSiteTour(document);
    expect(roundTrip.bentoLayout).toBeUndefined();
    expect(roundTrip.galleryImages[1]).toBe('https://cdn.example/tours/legacy/wide2.webp');
  });

  it('раскладывает одноколоночное описание в две колонки CMS', () => {
    const document = siteTourToCmsDocument({
      ...tour,
      description:
        ' — живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового. «Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    });
    expect(document.description).toBe(
      'живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового.',
    );
    expect(document.descriptionAside).toBe(
      '«Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    );
  });
});
