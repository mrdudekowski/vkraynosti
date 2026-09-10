import { describe, expect, it } from 'vitest';
import { parseSiteContentDocument } from './siteContentDocument';

describe('modal site content document', () => {
  it('applies safe defaults to the CMS modal configuration', () => {
    expect(parseSiteContentDocument('modal', {
      kind: 'modal',
      schemaVersion: 1,
      contactTitle: 'Свяжитесь с нами',
      contactDescription: 'Выберите удобный канал связи.',
      tourContactTitle: 'Свяжитесь с нами и забронируйте тур',
    })).toEqual({
      kind: 'modal',
      schemaVersion: 1,
      requestFormEnabled: true,
      contactTitle: 'Свяжитесь с нами',
      contactDescription: 'Выберите удобный канал связи.',
      tourContactTitle: 'Свяжитесь с нами и забронируйте тур',
    });
  });
});
