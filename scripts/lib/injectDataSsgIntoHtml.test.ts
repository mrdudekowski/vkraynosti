import { describe, expect, it } from 'vitest';
import { injectDataSsgIntoHtml } from './injectDataSsgIntoHtml.ts';

describe('injectDataSsgIntoHtml', () => {
  it('injects tour schedule bootstrap JSON before JSON-LD', () => {
    const template = `<!doctype html><html><head></head><body><div id="root"></div></body></html>`;
    const html = injectDataSsgIntoHtml(template, {
      bodyHtml: '<main><h1>Tour</h1></main>',
      structuredData: [{ '@type': 'TouristTrip', name: 'Test' }],
      tourScheduleBootstrapJson: '{"events":[],"catalogPrices":{},"catalogDurationTypes":{},"catalogPublicationStatuses":{"spring-1":"active"}}',
    });

    expect(html).toContain('id="tour-schedule-bootstrap"');
    expect(html).toContain('"spring-1":"active"');
    expect(html).toContain('application/ld+json');
    expect(html.indexOf('tour-schedule-bootstrap')).toBeLessThan(html.indexOf('application/ld+json'));
  });
});
