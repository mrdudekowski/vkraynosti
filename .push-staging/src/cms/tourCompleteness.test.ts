import { describe, expect, it } from 'vitest';
import { UNSET_INCLUDED_ICON_KEY } from './includedIconCatalog';
import type { CmsTourDocument } from './cmsTourDocument';
import { durationDaysFromLabel, publicDurationFromDays } from './durationDays';
import { isTourReady, tourReadiness, tourSectionCompletion } from './tourCompleteness';

function readyTour(overrides: Partial<CmsTourDocument> = {}): CmsTourDocument {
  return {
    id: 'winter-1',
    slug: 'izubrinaya',
    season: 'winter',
    status: 'draft',
    title: 'Изюбриная',
    subtitle: 'Зима',
    heroPhrase: 'Ели',
    description: 'лево',
    descriptionAside: 'право',
    duration: '1 день',
    durationDays: 1,
    difficulty: 'Medium',
    price: 'по запросу',
    program: [{ timeLabel: '04:30', description: 'Выезд' }],
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

describe('tourSectionCompletion', () => {
  it('requires both about columns', () => {
    const doc = readyTour({ description: 'лево', descriptionAside: '' });
    expect(tourSectionCompletion(doc).about).toBe(false);
    expect(isTourReady(doc)).toBe(false);
  });

  it('about requires both columns and hero phrase', () => {
    expect(tourSectionCompletion(readyTour({ description: '  ', descriptionAside: 'право' })).about).toBe(
      false,
    );
    expect(tourSectionCompletion(readyTour({ description: 'лево', descriptionAside: '   ' })).about).toBe(
      false,
    );
    expect(tourSectionCompletion(readyTour({ heroPhrase: ' ' })).about).toBe(false);
    expect(tourSectionCompletion(readyTour({ heroPhrase: ' ' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour()).about).toBe(true);
  });

  it('catalog requires title, slug, season, subtitle, difficulty, durationDays and price', () => {
    expect(tourSectionCompletion(readyTour()).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ title: '  ' })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ slug: '' })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ subtitle: '' })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ durationDays: undefined })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ durationDays: 0 })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ durationDays: 21 })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: '' })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ price: 'нет цены' })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ price: '6 000 ₽' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ durationDays: 2 })).catalog).toBe(true);
  });

  it('accepts numeric price text or on-request and rejects mixed prose containing digits', () => {
    expect(tourSectionCompletion(readyTour({ price: '6 000 ₽' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: '10 000' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: 'от 4 500' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: 'от 7 200 ₽' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: '7200 ₽' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: 'по запросу' })).catalog).toBe(true);
    expect(tourSectionCompletion(readyTour({ price: 'нет цены 1' })).catalog).toBe(false);
    expect(tourSectionCompletion(readyTour({ price: 'цена 1 потом' })).catalog).toBe(false);
  });

  it('included requires at least one item with text and icon', () => {
    expect(tourSectionCompletion(readyTour({ included: [] })).included).toBe(false);
    expect(
      tourSectionCompletion(
        readyTour({ included: [{ text: 'Трансфер', iconKey: UNSET_INCLUDED_ICON_KEY }] }),
      ).included,
    ).toBe(false);
    expect(
      tourSectionCompletion(readyTour({ included: [{ text: '  ', iconKey: 'van-shuttle' }] })).included,
    ).toBe(false);
    expect(tourSectionCompletion(readyTour()).included).toBe(true);
  });

  it('program requires at least one step with description', () => {
    expect(tourSectionCompletion(readyTour({ program: [] })).program).toBe(false);
    expect(
      tourSectionCompletion(readyTour({ program: [{ timeLabel: '04:30', description: '  ' }] })).program,
    ).toBe(false);
    expect(tourSectionCompletion(readyTour()).program).toBe(true);
  });

  it('gallery is green when existing publish blockers are empty', () => {
    expect(tourSectionCompletion(readyTour()).gallery).toBe(true);
    expect(tourSectionCompletion(readyTour({ coverAssetId: null })).gallery).toBe(false);
    expect(tourSectionCompletion(readyTour({ bento: { blocks: [] } })).gallery).toBe(false);
    expect(
      tourSectionCompletion(
        readyTour({
          assets: [
            ...readyTour().assets,
            { id: 'extra', stillUrl: 'https://cdn.example/extra.webp', videoUrl: null, alt: 'Изюбриная' },
          ],
        }),
      ).gallery,
    ).toBe(true);
  });
});

describe('isTourReady', () => {
  it('is true only when all five sections are complete', () => {
    expect(isTourReady(readyTour())).toBe(true);
    expect(isTourReady(readyTour({ subtitle: '' }))).toBe(false);
    expect(isTourReady(readyTour({ program: [] }))).toBe(false);
  });
});

describe('tourReadiness', () => {
  it('returns a complete shared readiness result for a ready tour', () => {
    expect(tourReadiness(readyTour())).toEqual({
      ready: true,
      sections: { catalog: true, about: true, included: true, program: true, gallery: true },
      blockers: [],
    });
  });

  it('exposes concrete blockers with sections and deterministic order', () => {
    const result = tourReadiness(
      readyTour({
        coverAssetId: null,
        bento: { blocks: [] },
        description: '',
        program: [],
      }),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toEqual([
      { code: 'cover_required', section: 'gallery', focus: 'cover' },
      { code: 'bento_empty_slots', section: 'gallery', focus: 'bento-empty' },
      { code: 'about_required', section: 'about', focus: 'description' },
      { code: 'program_required', section: 'program', focus: 'program' },
    ]);
  });

  it('reports an invalid included icon separately from an empty included section', () => {
    const result = tourReadiness(
      readyTour({ included: [{ text: 'Трансфер', iconKey: UNSET_INCLUDED_ICON_KEY }] }),
    );

    expect(result.sections.included).toBe(false);
    expect(result.blockers).toContainEqual({
      code: 'included_icon_required',
      section: 'included',
      focus: 'included-icons',
    });
  });
});

describe('publicDurationFromDays', () => {
  it('derives the public duration string', () => {
    expect(publicDurationFromDays(1)).toBe('1 день');
    expect(publicDurationFromDays(2)).toBe('2 дня');
    expect(publicDurationFromDays(5)).toBe('5 дней');
    expect(publicDurationFromDays(21)).toBe('21 день');
  });
});

describe('durationDaysFromLabel', () => {
  it('reads day counts and ignores hour-only labels', () => {
    expect(durationDaysFromLabel('1 день')).toBe(1);
    expect(durationDaysFromLabel('2 дня')).toBe(2);
    expect(durationDaysFromLabel('5 дней')).toBe(5);
    expect(durationDaysFromLabel('2 дня / 1 ночь')).toBe(2);
    expect(durationDaysFromLabel('1 день / 13 часов')).toBe(1);
    expect(durationDaysFromLabel('16 часов')).toBeUndefined();
    expect(durationDaysFromLabel('14–16 часов')).toBeUndefined();
  });
});
