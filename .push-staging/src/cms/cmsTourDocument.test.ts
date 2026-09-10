import { describe, expect, it } from 'vitest';
import { getBentoBlockSlotCount } from '../constants/tourBento';
import {
  cmsToursFileSchema,
  parseCmsToursFile,
} from './cmsTourDocument';

const validAsset = {
  id: 'g1',
  stillUrl: 'https://s3.example/media/tours/summer-8/1.webp',
  videoUrl: null,
  alt: 'Бухта',
};

const validTour = {
  id: 'summer-8',
  slug: 'poluostrov-krabbe',
  season: 'summer',
  status: 'active',
  title: 'Полуостров Краббе',
  subtitle: 'Скалы и бухты',
  heroPhrase: 'Сопки уходят в море',
  description: 'Маршрут.',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [{ timeLabel: '05:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'shuttle-van' }],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'cover',
      stillUrl: 'https://s3.example/media/tours/summer-8/cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://s3.example/media/tours/summer-8/wide2.webp',
      videoUrl: null,
      alt: 'Предисловие',
    },
    validAsset,
  ],
  bento: {
    blocks: [
      {
        type: 'bento-single',
        slots: [{ assetId: 'g1', objectPosition: '50% 40%' }],
      },
    ],
  },
};

describe('cmsToursFileSchema', () => {
  it('принимает published-файл с одним туром', () => {
    const parsed = cmsToursFileSchema.safeParse({
      schemaVersion: 1,
      tours: [validTour],
    });
    expect(parsed.success).toBe(true);
  });

  it('отклоняет блок с неверным числом слотов', () => {
    const parsed = cmsToursFileSchema.safeParse({
      schemaVersion: 1,
      tours: [
        {
          ...validTour,
          bento: {
            blocks: [
              {
                type: 'bento-left',
                slots: [{ assetId: 'g1' }],
              },
            ],
          },
        },
      ],
    });
    expect(parsed.success).toBe(false);
    expect(getBentoBlockSlotCount('bento-left')).toBe(3);
  });

  it('parseCmsToursFile выбрасывает на мусоре', () => {
    expect(() => parseCmsToursFile({ schemaVersion: 2, tours: [] })).toThrow();
  });

  it('принимает durationDays как целое >= 1 и отклоняет 0', () => {
    expect(
      cmsToursFileSchema.safeParse({
        schemaVersion: 1,
        tours: [{ ...validTour, durationDays: 2 }],
      }).success,
    ).toBe(true);
    expect(
      cmsToursFileSchema.safeParse({
        schemaVersion: 1,
        tours: [{ ...validTour, durationDays: 21 }],
      }).success,
    ).toBe(true);
    expect(
      cmsToursFileSchema.safeParse({
        schemaVersion: 1,
        tours: [{ ...validTour, durationDays: 0 }],
      }).success,
    ).toBe(false);
  });

  it('принимает legacy-галерею без bento-блоков', () => {
    const parsed = cmsToursFileSchema.safeParse({
      schemaVersion: 1,
      tours: [
        {
          ...validTour,
          bento: { blocks: [] },
          legacyGalleryVariant: 'askold',
        },
      ],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tours[0]?.legacyGalleryVariant).toBe('askold');
    }
  });
});
