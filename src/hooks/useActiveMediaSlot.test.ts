import { beforeEach, describe, expect, it } from 'vitest';
import {
  getActiveMediaSlotId,
  releaseActiveMediaSlot,
  requestActiveMediaSlot,
  resetActiveMediaSlotForTest,
} from './useActiveMediaSlot';

describe('active media slot coordinator', () => {
  beforeEach(() => {
    resetActiveMediaSlotForTest();
  });

  it('grants only one active slot at a time', () => {
    const firstSlot = Symbol('first-slot');
    const secondSlot = Symbol('second-slot');

    expect(requestActiveMediaSlot(firstSlot)).toBe(true);
    expect(requestActiveMediaSlot(secondSlot)).toBe(false);
    expect(getActiveMediaSlotId()).toBe(firstSlot);
  });

  it('releases the active slot and lets the next requester acquire it', () => {
    const firstSlot = Symbol('first-slot');
    const secondSlot = Symbol('second-slot');

    expect(requestActiveMediaSlot(firstSlot)).toBe(true);
    expect(releaseActiveMediaSlot(firstSlot)).toBe(true);
    expect(requestActiveMediaSlot(secondSlot)).toBe(true);
    expect(getActiveMediaSlotId()).toBe(secondSlot);
  });

  it('ignores release attempts from non-active slots', () => {
    const activeSlot = Symbol('active-slot');
    const inactiveSlot = Symbol('inactive-slot');

    expect(requestActiveMediaSlot(activeSlot)).toBe(true);
    expect(releaseActiveMediaSlot(inactiveSlot)).toBe(false);
    expect(getActiveMediaSlotId()).toBe(activeSlot);
  });
});
