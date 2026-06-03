import { describe, expect, it } from 'vitest';
import type { TourPublicationStatus } from '../../types/tourSchedule';
import { getVisibleToursBySeason } from './getVisibleToursBySeason';

describe('getVisibleToursBySeason', () => {
  it('filters hidden tours using publicationStatuses map', () => {
    const statuses = new Map<string, TourPublicationStatus>([
      ['summer-13', 'in_development'],
      ['summer-14', 'hidden'],
    ]);

    const visibleIds = getVisibleToursBySeason('summer', statuses)
      .filter((item) => item.id === 'summer-13' || item.id === 'summer-14')
      .map((item) => item.id);

    expect(visibleIds).toEqual(['summer-13']);
  });
});
