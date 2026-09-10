import { afterEach, describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import { clearCmsTourOverlay, setCmsTourOverlay } from '../cms/cmsTourOverlay';
import { getTourById, TOURS } from './toursData';
import { getRuntimeTourById, getRuntimeTours, getRuntimeToursBySeason } from './runtimeCatalog';
import { findTourBySeasonAndSegment, getTourBySlug } from './tourLookup';

const CMS_ONLY_ID = 'cms-only-fixture';

const overlayTour = (id: string, season: Tour['season'] = 'summer'): Tour => ({
  id,
  slug: `${id}-cms`,
  season,
  title: `CMS ${id}`,
  subtitle: '',
  heroPhrase: id,
  duration: '1 день',
  difficulty: 'Easy',
  price: 'по запросу',
  description: '',
  program: [],
  includedInPrice: [],
  imageUrl: '/x.webp',
  galleryImages: ['/x.webp'],
});

describe('runtimeCatalog', () => {
  afterEach(() => {
    clearCmsTourOverlay();
  });

  it('без overlay отдаёт каталог из toursData.ts', () => {
    expect(getRuntimeTours()).toBe(TOURS);
    expect(getRuntimeTourById('summer-1')?.id).toBe('summer-1');
    expect(getRuntimeToursBySeason('summer').some((tour) => tour.id === 'summer-1')).toBe(true);
    expect(getTourBySlug('robinzonada-primorskoe-bali')?.id).toBe('summer-10');
  });

  it('при активном overlay — только CMS: CMS-only виден, код-only скрыт', () => {
    const cmsOnly = overlayTour(CMS_ONLY_ID);
    setCmsTourOverlay([cmsOnly]);

    expect(getRuntimeTours()).toEqual([cmsOnly]);
    expect(getRuntimeTourById(CMS_ONLY_ID)?.slug).toBe(`${CMS_ONLY_ID}-cms`);
    expect(getRuntimeTourById('summer-1')).toBeUndefined();
    expect(getRuntimeToursBySeason('summer').map((tour) => tour.id)).toEqual([CMS_ONLY_ID]);
    expect(findTourBySeasonAndSegment('summer', `${CMS_ONLY_ID}-cms`)?.id).toBe(CMS_ONLY_ID);
    expect(findTourBySeasonAndSegment('summer', 'summer-1')).toBeUndefined();
    expect(getTourBySlug(`${CMS_ONLY_ID}-cms`)?.id).toBe(CMS_ONLY_ID);

    expect(getTourById('summer-1')?.id).toBe('summer-1');
  });
});
