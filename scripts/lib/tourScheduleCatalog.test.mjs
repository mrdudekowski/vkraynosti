import { describe, expect, it } from 'vitest';
import { loadTourCatalog, parseDurationType, parsePriceRub } from './tourScheduleCatalog.mjs';

describe('tourScheduleCatalog', () => {
  it('loads 43 tours with unique ids matching site seasons', () => {
    const tours = loadTourCatalog();
    expect(tours).toHaveLength(43);
    const ids = tours.map((t) => t.id);
    expect(new Set(ids).size).toBe(43);
    for (const tour of tours) {
      expect(tour.id.startsWith(`${tour.season}-`)).toBe(true);
    }
  });

  it('parsePriceRub extracts first amount', () => {
    expect(parsePriceRub('от 6 000 ₽')).toBe(6000);
    expect(parsePriceRub('по запросу')).toBeNull();
  });

  it('parseDurationType detects multi-day', () => {
    expect(parseDurationType('2 дня / 1 ночь')).toBe('многодневный');
    expect(parseDurationType('16 часов')).toBe('однодневный');
  });
});
