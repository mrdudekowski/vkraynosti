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

  it('renders Safety content for direct requests while remaining a noindex page', () => {
    const page = resolveDataSsgForRoute('/safety', emptySnapshot());

    expect(page.bodyHtml).toContain('<main>');
    expect(page.bodyHtml).toContain('Правила безопасности и участия в активных поездках и маршрутах');
    expect(page.bodyHtml).toContain('1. Общие положения');
    expect(page.structuredData).toEqual([]);
  });

  it('renders season catalog with CollectionPage JSON-LD', () => {
    const page = resolveDataSsgForRoute('/tours/summer', emptySnapshot());
    expect(page.structuredData).toHaveLength(1);
    expect(page.structuredData[0]).toMatchObject({ '@type': 'CollectionPage', name: 'Лето' });
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

  it('renders CMS SEO H1 and schema name for the tour route', () => {
    const base = findTourBySeasonAndSegment('summer', 'poluostrov-krabbe');
    expect(base).toBeDefined();
    const seo = {
      title: 'Краббе — маршрут из Владивостока | Вкрайности',
      description: 'Тестовое описание маршрута Краббе.',
      h1: 'Поездка на полуостров Краббе',
      keywords: ['полуостров Краббе'],
    };
    const tour = { ...base!, seo };
    const page = resolveDataSsgForRoute(
      '/tours/summer/poluostrov-krabbe',
      emptySnapshot(),
      'active',
      { toursById: new Map([[tour.id, tour]]) },
    );
    expect(page.bodyHtml).toContain('<h1>Поездка на полуостров Краббе</h1>');
    expect(page.bodyHtml).toContain('Тестовое описание маршрута Краббе.');
    expect(page.structuredData[0]).toMatchObject({ name: 'Поездка на полуостров Краббе' });
  });

  it('renders an active CMS tour route that has no legacy static lookup entry', () => {
    const base = findTourBySeasonAndSegment('summer', 'poluostrov-krabbe');
    expect(base).toBeDefined();
    const tour = {
      ...base!,
      id: 'fall-17',
      slug: 'odin-den-v-ta-chingouze-2',
      season: 'fall' as const,
      title: 'Один день в Та-Чингоузе',
      seo: {
        title: 'Один день в Та-Чингоузе — осенний тур | Вкрайности',
        description: 'CMS описание маршрута из Владивостока.',
        h1: 'Осенний день в Та-Чингоузе',
        keywords: ['Та-Чингоуза осенью'],
      },
    };

    const page = resolveDataSsgForRoute(
      '/tours/fall/odin-den-v-ta-chingouze-2',
      emptySnapshot(),
      'active',
      { toursById: new Map([[tour.id, tour]]) },
    );

    expect(page.bodyHtml).toContain('<h1>Осенний день в Та-Чингоузе</h1>');
    expect(page.bodyHtml).toContain('CMS описание маршрута из Владивостока.');
    expect(page.structuredData[0]).toMatchObject({ name: 'Осенний день в Та-Чингоузе' });
  });
});
