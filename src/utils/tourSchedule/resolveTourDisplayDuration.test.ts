import { describe, expect, it } from 'vitest';
import { resolveTourDisplayDuration } from './resolveTourDisplayDuration';

describe('resolveTourDisplayDuration', () => {
  it('uses the tour duration while retaining catalog classification', () => {
    expect(resolveTourDisplayDuration('многодневный', '21 день')).toEqual({
      displayDuration: '21 день',
      durationType: 'многодневный',
      fromCatalog: true,
    });
  });

  it('uses the schedule catalog label when tour duration is empty', () => {
    expect(resolveTourDisplayDuration('многодневный', '  ')).toEqual({
      displayDuration: '2 дня',
      durationType: 'многодневный',
      fromCatalog: true,
    });
  });

  it('falls back to tour.duration when catalog durationType is missing', () => {
    expect(resolveTourDisplayDuration(null, '21 день')).toEqual({
      displayDuration: '21 день',
      durationType: null,
      fromCatalog: false,
    });
  });

  it('returns empty when catalog durationType and tour.duration are both missing', () => {
    expect(resolveTourDisplayDuration(null, '  ')).toEqual({
      displayDuration: '',
      durationType: null,
      fromCatalog: false,
    });
    expect(resolveTourDisplayDuration(null, undefined)).toEqual({
      displayDuration: '',
      durationType: null,
      fromCatalog: false,
    });
  });
});
