import { describe, expect, it } from 'vitest';
import { upsertTourInPublishedCatalog } from './applyTourTextPatch';
import type { CmsTourDocument } from './cmsTourDocument';
import {
  catalogOrderIsUnpublished,
  insertTourAtDraftSlot,
  orderByIds,
  replaceSeasonIds,
  seasonIdsMatch,
} from './tourCatalogOrder';

const tour = (id: string, season: CmsTourDocument['season']): CmsTourDocument =>
  ({
    id,
    slug: id,
    season,
    status: 'active',
    title: id,
    subtitle: '',
    heroPhrase: '',
    description: '',
    duration: '1 день',
    durationDays: 1,
    difficulty: 'Medium',
    price: '',
    program: [],
    included: [],
    coverAssetId: 'cover',
    prefaceAssetId: null,
    assets: [],
    bento: { blocks: [] },
    legacyGalleryVariant: null,
  }) as CmsTourDocument;

describe('tour catalog order', () => {
  it('ставит перечисленные туры в заданном порядке и дописывает остальные', () => {
    const tours = [tour('winter-1', 'winter'), tour('summer-1', 'summer'), tour('winter-2', 'winter')];

    expect(orderByIds(tours, ['winter-2', 'winter-1']).map((item) => item.id)).toEqual([
      'winter-2',
      'winter-1',
      'summer-1',
    ]);
  });

  it('меняет порядок одного сезона и оставляет остальные сезоны на своих местах', () => {
    const next = replaceSeasonIds(
      ['winter-1', 'summer-1', 'winter-2', 'summer-2'],
      new Set(['summer-1', 'summer-2']),
      ['summer-2', 'summer-1'],
    );

    expect(next).toEqual(['winter-1', 'summer-2', 'summer-1', 'winter-2']);
  });

  it('считает порядок неопубликованным, только если уже опубликованные туры стоят иначе', () => {
    expect(catalogOrderIsUnpublished(['summer-1', 'summer-2'], ['summer-2', 'summer-1'])).toBe(true);
    expect(
      catalogOrderIsUnpublished(['summer-1', 'summer-2'], ['summer-1', 'summer-draft', 'summer-2']),
    ).toBe(false);
  });

  it('принимает только тот же набор туров сезона', () => {
    expect(seasonIdsMatch(['summer-1', 'summer-2'], ['summer-2', 'summer-1'])).toBe(true);
    expect(seasonIdsMatch(['summer-1', 'summer-2'], ['summer-1'])).toBe(false);
    expect(seasonIdsMatch(['summer-1', 'summer-2'], ['summer-1', 'summer-1'])).toBe(false);
  });

  it('вставляет новый тур в черновую позицию, не переставляя уже опубликованные', () => {
    const catalog = [tour('summer-1', 'summer'), tour('summer-2', 'summer')];
    const inserted = insertTourAtDraftSlot(
      catalog,
      tour('summer-3', 'summer'),
      ['summer-1', 'summer-3', 'summer-2'],
    );

    expect(inserted.map((item) => item.id)).toEqual(['summer-1', 'summer-3', 'summer-2']);
  });

  it('при публикации нового тура кладёт его в сохранённый слот', () => {
    const catalog = {
      schemaVersion: 1 as const,
      tours: [tour('summer-1', 'summer'), tour('summer-2', 'summer')],
    };

    const next = upsertTourInPublishedCatalog(
      catalog,
      tour('summer-3', 'summer'),
      ['summer-1', 'summer-3', 'summer-2'],
    );

    expect(next.tours.map((item) => item.id)).toEqual(['summer-1', 'summer-3', 'summer-2']);
  });
});
