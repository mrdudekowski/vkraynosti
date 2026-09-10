import { beforeEach, describe, expect, it } from 'vitest';
import { GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS } from '../constants/galleryGridVideoLoop';
import {
  getActiveMediaSlotHolderCount,
  releaseActiveMediaSlot,
  requestActiveMediaSlot,
  resetActiveMediaSlotForTest,
} from './useActiveMediaSlot';

describe('active media slot coordinator', () => {
  beforeEach(() => {
    resetActiveMediaSlotForTest();
  });

  it(`grants up to ${GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS} slots, then denies`, () => {
    const slots = Array.from({ length: GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS + 1 }, (_, i) =>
      Symbol(`slot-${i}`)
    );

    for (let i = 0; i < GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS; i += 1) {
      expect(requestActiveMediaSlot(slots[i]!)).toBe(true);
    }
    expect(getActiveMediaSlotHolderCount()).toBe(GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS);

    expect(requestActiveMediaSlot(slots[GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS]!)).toBe(false);
    expect(getActiveMediaSlotHolderCount()).toBe(GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS);
  });

  it('releases one holder and lets a waiter acquire the slot', () => {
    const holders = Array.from({ length: GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS }, (_, i) =>
      Symbol(`holder-${i}`)
    );
    const waiter = Symbol('waiter');

    for (const id of holders) {
      expect(requestActiveMediaSlot(id)).toBe(true);
    }
    expect(requestActiveMediaSlot(waiter)).toBe(false);

    expect(releaseActiveMediaSlot(holders[0]!)).toBe(true);
    expect(requestActiveMediaSlot(waiter)).toBe(true);
    expect(getActiveMediaSlotHolderCount()).toBe(GALLERY_GRID_VIDEO_MAX_CONCURRENT_SLOTS);
  });

  it('ignores release attempts from non-active slots', () => {
    const activeSlot = Symbol('active-slot');
    const inactiveSlot = Symbol('inactive-slot');

    expect(requestActiveMediaSlot(activeSlot)).toBe(true);
    expect(releaseActiveMediaSlot(inactiveSlot)).toBe(false);
    expect(getActiveMediaSlotHolderCount()).toBe(1);
  });

  it('idempotent request for same slot', () => {
    const id = Symbol('same');
    expect(requestActiveMediaSlot(id)).toBe(true);
    expect(requestActiveMediaSlot(id)).toBe(true);
    expect(getActiveMediaSlotHolderCount()).toBe(1);
  });
});
