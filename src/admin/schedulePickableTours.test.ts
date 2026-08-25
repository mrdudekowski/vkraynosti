import { describe, expect, it } from 'vitest';
import type { AdminTourListItem } from './api';
import { listSchedulePickableTours } from './schedulePickableTours';

function tour(overrides: Partial<AdminTourListItem>): AdminTourListItem {
  return {
    id: 'summer-1',
    title: 'Летний',
    season: 'summer',
    status: 'active',
    published: true,
    slug: 'letniy',
    imageUrl: null,
    ready: false,
    readyCount: 3,
    readyTotal: 5,
    ...overrides,
  };
}

describe('listSchedulePickableTours', () => {
  it('includes on-site tours even when readiness is incomplete', () => {
    expect(
      listSchedulePickableTours([
        tour({ id: 'summer-1', ready: false }),
        tour({ id: 'summer-2', status: 'draft', published: false }),
      ]),
    ).toEqual([
      {
        id: 'summer-1',
        title: 'Летний',
        season: 'summer',
        imageUrl: null,
      },
    ]);
  });
});
