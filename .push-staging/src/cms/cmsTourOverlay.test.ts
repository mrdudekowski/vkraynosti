import { afterEach, describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import { getTourById } from '../data/toursData';
import {
  applyCmsTourOverlay,
  clearCmsTourOverlay,
  getCmsOverlayTourById,
  isCmsTourOverlayActive,
  setCmsTourOverlay,
} from './cmsTourOverlay';

const CMS_ONLY_ID = 'cms-only-fixture';

const overlayTour = (id: string): Tour => ({
  id,
  slug: `${id}-cms`,
  season: 'summer',
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

describe('cmsTourOverlay', () => {
  afterEach(() => {
    clearCmsTourOverlay();
  });

  it('по умолчанию неактивен и не подменяет код', () => {
    const codeTour = getTourById('summer-1');
    expect(isCmsTourOverlayActive()).toBe(false);
    expect(applyCmsTourOverlay(codeTour)?.id).toBe('summer-1');
    expect(getCmsOverlayTourById(CMS_ONLY_ID)).toBeUndefined();
  });

  it('в активном overlay показывает CMS-only и скрывает туры только из кода', () => {
    const codeTour = getTourById('summer-1');
    expect(codeTour).toBeDefined();
    const cmsOnly = overlayTour(CMS_ONLY_ID);
    setCmsTourOverlay([cmsOnly]);

    expect(isCmsTourOverlayActive()).toBe(true);
    expect(getCmsOverlayTourById(CMS_ONLY_ID)?.title).toBe(`CMS ${CMS_ONLY_ID}`);
    expect(applyCmsTourOverlay(codeTour)).toBeUndefined();
    expect(applyCmsTourOverlay(cmsOnly)?.title).toBe(`CMS ${CMS_ONLY_ID}`);
  });

  it('подменяет код-тур записью CMS с тем же id', () => {
    const codeTour = getTourById('summer-1');
    expect(codeTour).toBeDefined();
    setCmsTourOverlay([overlayTour('summer-1')]);

    expect(applyCmsTourOverlay(codeTour)?.title).toBe('CMS summer-1');
  });
});
