import { describe, expect, it } from 'vitest';
import { checkHideTourPublish, futureWorkDeparturesForHide } from './hideTourFutureDepartures';

describe('hideTourFutureDepartures', () => {
  const today = '2026-08-20';

  it('берёт только будущие незавершённые выезды', () => {
    const ids = futureWorkDeparturesForHide(
      [
        { id: 'past', startsOn: '2026-08-10', status: 'completed' },
        { id: 'today-open', startsOn: '2026-08-20', status: 'open' },
        { id: 'future', startsOn: '2026-08-21', status: 'planned' },
      ],
      today,
    ).map((item) => item.id);
    expect(ids).toEqual(['today-open', 'future']);
  });

  it('без будущих дат выпускает скрытие без подтверждения', () => {
    expect(
      checkHideTourPublish({
        confirmDeleteFutureDepartures: false,
        departures: [{ id: 'past', startsOn: '2026-08-10', status: 'completed' }],
        leads: [],
        tourId: 'winter-1',
        todayIso: today,
      }),
    ).toEqual({ ok: true, deleteIds: [] });
  });

  it('требует подтверждение, если есть будущие выезды', () => {
    expect(
      checkHideTourPublish({
        confirmDeleteFutureDepartures: false,
        departures: [{ id: 'd1', startsOn: '2026-08-21', status: 'open' }],
        leads: [],
        tourId: 'winter-1',
        todayIso: today,
      }),
    ).toEqual({
      ok: false,
      error: 'confirm_delete_future_departures',
      departureCount: 1,
    });
  });

  it('блокирует скрытие при живых заявках на будущие даты', () => {
    expect(
      checkHideTourPublish({
        confirmDeleteFutureDepartures: true,
        departures: [{ id: 'd1', startsOn: '2026-08-21', status: 'open' }],
        leads: [{ tourId: 'winter-1', date: '2026-08-21', status: 'booked' }],
        tourId: 'winter-1',
        todayIso: today,
      }),
    ).toEqual({ ok: false, error: 'future_departures_have_leads', leadCount: 1 });
  });

  it('не считает будущую отмену работой, которую надо сносить', () => {
    expect(
      futureWorkDeparturesForHide(
        [{ id: 'cancelled', startsOn: '2026-08-21', status: 'cancelled' }],
        today,
      ),
    ).toEqual([]);
    expect(
      checkHideTourPublish({
        confirmDeleteFutureDepartures: false,
        departures: [{ id: 'cancelled', startsOn: '2026-08-21', status: 'cancelled' }],
        leads: [],
        tourId: 'winter-1',
        todayIso: today,
      }),
    ).toEqual({ ok: true, deleteIds: [] });
  });

  it('после подтверждения без заявок возвращает id к удалению', () => {
    expect(
      checkHideTourPublish({
        confirmDeleteFutureDepartures: true,
        departures: [{ id: 'd1', startsOn: '2026-08-21', status: 'open' }],
        leads: [{ tourId: 'winter-1', date: '2026-08-21', status: 'declined' }],
        tourId: 'winter-1',
        todayIso: today,
      }),
    ).toEqual({ ok: true, deleteIds: ['d1'] });
  });
});
