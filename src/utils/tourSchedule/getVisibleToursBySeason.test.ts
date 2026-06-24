import { describe, expect, it } from 'vitest';
import type { TourPublicationStatus } from '../../types/tourSchedule';
import { getVisibleToursBySeason } from './getVisibleToursBySeason';

describe('getVisibleToursBySeason', () => {
  it('lists only active tours (in_development and hidden are excluded from grids)', () => {
    const statuses = new Map<string, TourPublicationStatus>([
      ['summer-13', 'in_development'],
      ['summer-14', 'hidden'],
      ['summer-1', 'active'],
    ]);

    const visibleIds = getVisibleToursBySeason('summer', statuses, { scheduleLoaded: true })
      .filter((item) => ['summer-13', 'summer-14', 'summer-1'].includes(item.id))
      .map((item) => item.id);

    expect(visibleIds).toEqual(['summer-1']);
  });

  it('returns empty list while schedule is not loaded', () => {
    const statuses = new Map([['summer-14', 'hidden' as const]]);
    expect(
      getVisibleToursBySeason('summer', statuses, { scheduleLoaded: false }).some(
        (item) => item.id === 'summer-14',
      ),
    ).toBe(false);
    expect(getVisibleToursBySeason('summer', statuses, { scheduleLoaded: false })).toHaveLength(
      0,
    );
  });

  it('hides tours missing from publicationStatuses when catalog is non-empty', () => {
    const statuses = new Map([['summer-1', 'active' as const]]);
    const visibleIds = getVisibleToursBySeason('summer', statuses, { scheduleLoaded: true })
      .filter((item) => item.id === 'summer-1' || item.id === 'summer-14')
      .map((item) => item.id);

    expect(visibleIds).toEqual(['summer-1']);
  });

  it('returns empty list when schedule loaded but publicationStatuses map is empty', () => {
    expect(getVisibleToursBySeason('summer', new Map(), { scheduleLoaded: true })).toHaveLength(
      0,
    );
  });
});
