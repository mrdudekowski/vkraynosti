import { describe, expect, it } from 'vitest';
import {
  computeTourProgramRevealedItemCount,
  TOUR_PROGRAM_REVEAL_END_SHARE,
  TOUR_PROGRAM_REVEAL_MIN_RANGE_PX,
} from './tourProgramReveal';

describe('computeTourProgramRevealedItemCount', () => {
  const vh = 900;
  const columnHeight = 4000;
  const columnTopDoc = 1200;

  function countAtScrollY(scrollY: number, itemCount = 9) {
    const columnTopViewportPx = columnTopDoc - scrollY;
    return computeTourProgramRevealedItemCount(
      {
        columnTopViewportPx,
        columnHeightPx: columnHeight,
        scrollY,
        viewportHeightPx: vh,
      },
      itemCount
    );
  }

  it('returns 0 before viewport bottom reaches column top', () => {
    const scrollY = columnTopDoc - vh - 40;
    expect(countAtScrollY(scrollY)).toBe(0);
  });

  it('returns all items when viewport bottom passes compressed end line', () => {
    const revealEndDoc = columnTopDoc + columnHeight * TOUR_PROGRAM_REVEAL_END_SHARE;
    const scrollY = revealEndDoc - vh + 20;
    expect(countAtScrollY(scrollY)).toBe(9);
  });

  it('reveals faster than full-column mapping at the same scroll position', () => {
    const midScrollY = columnTopDoc + columnHeight * 0.5 - vh;
    const legacyCount = Math.ceil(0.5 * 9);
    expect(countAtScrollY(midScrollY)).toBe(9);
    expect(countAtScrollY(midScrollY)).toBeGreaterThan(legacyCount);
  });

  it('interpolates monotonically with scroll', () => {
    const samples: number[] = [];
    for (let scrollY = columnTopDoc - vh; scrollY <= columnTopDoc + columnHeight; scrollY += 80) {
      samples.push(countAtScrollY(scrollY));
    }
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
    }
  });

  it('returns all items when column height is below min range', () => {
    const result = computeTourProgramRevealedItemCount(
      {
        columnTopViewportPx: 100,
        columnHeightPx: TOUR_PROGRAM_REVEAL_MIN_RANGE_PX - 1,
        scrollY: 0,
        viewportHeightPx: vh,
      },
      6
    );
    expect(result).toBe(6);
  });

  it.each([
    { steps: 3, items: 4 },
    { steps: 8, items: 9 },
    { steps: 12, items: 13 },
  ])('reaches full reveal for $steps program steps', ({ items }) => {
    const revealEndDoc = columnTopDoc + columnHeight * TOUR_PROGRAM_REVEAL_END_SHARE;
    expect(countAtScrollY(revealEndDoc - vh, items)).toBe(items);
  });
});
