import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_DAY_VISIBLE_DEPARTURES,
  groupDeparturesByStartsOn,
  SCHEDULE_CELL_VISIBLE_DEPARTURES,
  splitDayDepartures,
} from './scheduleDayDepartures';

describe('groupDeparturesByStartsOn', () => {
  it('keeps date order and stacks tours of the same day', () => {
    expect(
      groupDeparturesByStartsOn([
        { id: 'a', startsOn: '2026-08-22' },
        { id: 'b', startsOn: '2026-08-22' },
        { id: 'c', startsOn: '2026-08-23' },
      ]),
    ).toEqual([
      { startsOn: '2026-08-22', items: [{ id: 'a', startsOn: '2026-08-22' }, { id: 'b', startsOn: '2026-08-22' }] },
      { startsOn: '2026-08-23', items: [{ id: 'c', startsOn: '2026-08-23' }] },
    ]);
  });
});

describe('splitDayDepartures', () => {
  it('keeps one tour on a calendar cell and three on the dashboard', () => {
    const items = [1, 2, 3, 4];
    expect(splitDayDepartures(items, SCHEDULE_CELL_VISIBLE_DEPARTURES)).toEqual({
      visible: [1],
      overflow: [2, 3, 4],
    });
    expect(splitDayDepartures(items, DASHBOARD_DAY_VISIBLE_DEPARTURES)).toEqual({
      visible: [1, 2, 3],
      overflow: [4],
    });
  });
});
