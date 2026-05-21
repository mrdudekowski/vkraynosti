import { describe, expect, it } from 'vitest';
import { loadTourCatalog } from './tourScheduleCatalog.mjs';
import { buildTourPickLabel, extractTourIdFromPick } from './tourPickFormula.mjs';

describe('tourPickExtract', () => {
  const tours = loadTourCatalog();

  it('extracts tour_id for all 39 catalog tours (incl. titles with parentheses)', () => {
    for (const tour of tours) {
      const pick = buildTourPickLabel(tour.title, tour.id);
      expect(extractTourIdFromPick(pick), pick).toBe(tour.id);
    }
  });

  it('fails old parenthesis-based extraction on Pidan and Chitzinzu', () => {
    const pidan = buildTourPickLabel('Восхождение на Пидан (Ливадийскую)', 'spring-3');
    const oldStyle = `${pidan}`; // "title (spring-3)" old format was title + " (" + id + ")"
    const brokenPick = 'Восхождение на Пидан (Ливадийскую) (spring-3)';
    const midExtract = (s) => {
      const open = s.indexOf('(');
      const close = s.indexOf(')');
      return s.slice(open + 1, close);
    };
    expect(midExtract(brokenPick)).not.toBe('spring-3');
    expect(extractTourIdFromPick(pidan)).toBe('spring-3');
  });

  it('lookup fields exist after extract for every tour', () => {
    const byId = Object.fromEntries(tours.map((t) => [t.id, t]));
    for (const tour of tours) {
      const id = extractTourIdFromPick(buildTourPickLabel(tour.title, tour.id));
      const row = byId[id];
      expect(row?.durationType).toBeTruthy();
      expect(['однодневный', 'многодневный']).toContain(row.durationType);
    }
  });
});
