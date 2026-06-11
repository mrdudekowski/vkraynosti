import { describe, expect, it } from 'vitest';
import {
  computeTourProgramRevealedItemCount,
  getTourProgramActiveStepRefIndex,
  isTourProgramFooterExitPhase,
  isTourProgramStepExitPhase,
  shouldAttachTourProgramFooterRef,
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

describe('tour program reveal ref helpers', () => {
  it('detects step exit phase when mounted count exceeds revealed count', () => {
    expect(isTourProgramStepExitPhase(4, 3)).toBe(true);
    expect(isTourProgramStepExitPhase(3, 3)).toBe(false);
  });

  it('detects footer exit phase while footer stays mounted', () => {
    expect(isTourProgramFooterExitPhase(true, false)).toBe(true);
    expect(isTourProgramFooterExitPhase(true, true)).toBe(false);
    expect(isTourProgramFooterExitPhase(false, false)).toBe(false);
  });

  it('anchors track on last visible step during normal reveal', () => {
    expect(
      getTourProgramActiveStepRefIndex({
        revealedCount: 3,
        mountedStepCount: 3,
        showProgramFooter: false,
        mountedFooter: false,
        programRevealEnabled: true,
      })
    ).toBe(2);
  });

  it('anchors track on first exiting step during fade-out', () => {
    expect(
      getTourProgramActiveStepRefIndex({
        revealedCount: 2,
        mountedStepCount: 4,
        showProgramFooter: false,
        mountedFooter: false,
        programRevealEnabled: true,
      })
    ).toBe(2);
  });

  it('prefers footer ref while footer is shown or exiting', () => {
    expect(
      getTourProgramActiveStepRefIndex({
        revealedCount: 3,
        mountedStepCount: 3,
        showProgramFooter: true,
        mountedFooter: true,
        programRevealEnabled: true,
      })
    ).toBeNull();

    expect(
      shouldAttachTourProgramFooterRef({
        mountedFooter: true,
        showProgramFooter: false,
        programRevealEnabled: true,
      })
    ).toBe(true);
  });
});
