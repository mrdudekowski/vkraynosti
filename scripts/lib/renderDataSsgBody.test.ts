import { describe, expect, it } from 'vitest';
import { getTourSeoEntry } from '../../src/constants/seo.ts';
import { findTourBySeasonAndSegment } from '../../src/data/tourLookup.ts';
import { injectDataSsgIntoHtml } from './injectDataSsgIntoHtml.ts';
import { resolveDataSsgForRoute } from './renderDataSsgBody.ts';
import type { TourScheduleSnapshot } from './loadTourScheduleSnapshot.ts';

const emptySnapshot = (): TourScheduleSnapshot => ({
  events: [],
  publicationStatuses: new Map(),
  catalogPrices: new Map(),
  durationTypes: new Map(),
});

describe('injectDataSsgIntoHtml', () => {
  it('injects body and JSON-LD into the SPA shell', () => {
    const html = injectDataSsgIntoHtml('<html><head></head><body><div id="root"></div></body></html>', {
      bodyHtml: '<main><h1>Test</h1></main>',
      structuredData: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test' }],
    });

    expect(html).toContain('<main><h1>Test</h1></main>');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"WebSite"');
  });
});

describe('resolveDataSsgForRoute', () => {
  it('renders home with nav links and Organization JSON-LD', () => {
    const page = resolveDataSsgForRoute('/', emptySnapshot());
    expect(page.bodyHtml).toContain('<main>');
    expect(page.bodyHtml).toContain('href="/tours/summer"');
    expect(page.structuredData).toHaveLength(2);
  });

  it('renders tour with program and TouristTrip JSON-LD', () => {
    const snapshot = emptySnapshot();
    snapshot.publicationStatuses.set('spring-1', 'active');
    snapshot.catalogPrices.set('spring-1', 7000);
    snapshot.durationTypes.set('spring-1', 'однодневный');

    const page = resolveDataSsgForRoute('/tours/spring/voskhozhdenie-na-lysovogo-deda', snapshot, 'active');
    const tour = findTourBySeasonAndSegment('spring', 'voskhozhdenie-na-lysovogo-deda');
    expect(tour).toBeDefined();
    const seoEntry = getTourSeoEntry(tour!, { publicationStatus: 'active' });

    expect(page.bodyHtml).toContain('data-testid="tour-detail-main"');
    expect(page.bodyHtml).toContain('<main>');
    expect(page.bodyHtml).toContain(seoEntry.description);
    expect(page.bodyHtml).toContain('Программа поездки');
    expect(page.structuredData).toHaveLength(2);
    expect(page.structuredData[0]).toMatchObject({ '@type': 'TouristTrip' });
  });
});
