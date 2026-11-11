import { describe, expect, it } from 'vitest';
import { getTakenCmsTourSlugKeys } from './cmsTourSlugKeys';

const tours = [
  { id: 'spring-1', season: 'spring', slug: 'askold' },
  { id: 'fall-1', season: 'fall', slug: 'askold' },
  { id: 'fall-2', season: 'fall', slug: 'sisters' },
] as const;

describe('getTakenCmsTourSlugKeys', () => {
  it('allows the same slug in different seasons but reserves same-season slugs', () => {
    expect(getTakenCmsTourSlugKeys(tours, 'summer').has('askold')).toBe(false);
    expect(getTakenCmsTourSlugKeys(tours, 'fall').has('askold')).toBe(true);
  });

  it('keeps tour IDs globally reserved and can exclude the tour being edited', () => {
    expect(getTakenCmsTourSlugKeys(tours, 'summer').has('fall-1')).toBe(true);
    expect(getTakenCmsTourSlugKeys(tours, 'fall', 'fall-1').has('askold')).toBe(false);
    expect(getTakenCmsTourSlugKeys(tours, 'fall', 'fall-1').has('spring-1')).toBe(true);
  });
});
