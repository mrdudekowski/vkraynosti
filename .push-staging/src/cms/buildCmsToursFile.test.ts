import { describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import {
  buildCmsTourPackages,
  buildCmsToursFile,
  compilePublishedToursFile,
} from './buildCmsToursFile';

const baseTour = {
  subtitle: 'Скалы',
  heroPhrase: 'Сопки',
  duration: '1 день',
  difficulty: 'Medium' as const,
  price: 'по запросу',
  description: 'Текст',
  program: [{ timeLabel: '05:30', description: 'Выезд' }],
  includedInPrice: [],
};

function tourWithId(id: string, season: Tour['season'], folder: string): Tour {
  const cover = `https://cdn.example/tours/${folder}/cover.webp`;
  const preface = `https://cdn.example/tours/${folder}/wide2.webp`;
  const grid = `https://cdn.example/tours/${folder}/1.webp`;
  const isPilot = id === 'summer-8';
  return {
    ...baseTour,
    id,
    slug: id,
    season,
    title: id,
    imageUrl: cover,
    prefaceBackgroundImageUrl: preface,
    galleryImages: isPilot ? [cover, preface, grid] : [cover, preface],
    galleryGridUrls: isPilot ? [cover, preface, grid] : [cover, preface],
    bentoLayout: isPilot
      ? {
          blocks: [
            {
              type: 'bento-single',
              slots: [{ src: grid, alt: 'Бухта' }],
            },
          ],
        }
      : undefined,
  };
}

describe('buildCmsToursFile', () => {
  it('переписывает на cms-dev только пилотный тур', () => {
    const file = buildCmsToursFile(
      [
        tourWithId('summer-8', 'summer', 'summer-8'),
        tourWithId('winter-2', 'winter', 'winter-2'),
      ],
      { publicBaseUrl: 'https://s3.twcstorage.ru/vkraynosti-cms-dev' }
    );

    expect(file.tours).toHaveLength(2);
    expect(file.tours[0]?.assets[0]?.stillUrl).toContain(
      'vkraynosti-cms-dev/media/tours/summer-8/'
    );
    expect(file.tours[1]?.assets[0]?.stillUrl).toBe(
      'https://cdn.example/tours/winter-2/cover.webp'
    );
    expect(file.tours[0]?.legacyGalleryVariant).toBeNull();
    expect(file.tours[1]?.legacyGalleryVariant).toBe('default');
  });

  it('переписывает медиа всех туров при полной миграции', () => {
    const file = buildCmsToursFile(
      [
        tourWithId('summer-8', 'summer', 'summer-8'),
        tourWithId('winter-2', 'winter', 'winter-2'),
      ],
      {
        publicBaseUrl: 'https://s3.twcstorage.ru/vkraynosti-cms-dev',
        rewriteAllTourMedia: true,
      }
    );

    expect(file.tours[0]?.assets[0]?.stillUrl).toContain('media/tours/summer-8/');
    expect(file.tours[1]?.assets[0]?.stillUrl).toContain('media/tours/winter-2/');
  });

  it('в витрину попадают только active-пакеты', () => {
    const packages = buildCmsTourPackages(
      [
        tourWithId('summer-8', 'summer', 'summer-8'),
        tourWithId('winter-2', 'winter', 'winter-2'),
      ],
      { publicBaseUrl: 'https://s3.twcstorage.ru/vkraynosti-cms-dev' }
    );
    packages[1] = {
      ...packages[1]!,
      document: { ...packages[1]!.document, status: 'draft' },
    };

    const compiled = compilePublishedToursFile(packages);
    expect(compiled.tours.map((tour) => tour.id)).toEqual(['summer-8']);
    expect(packages).toHaveLength(2);
  });
});
