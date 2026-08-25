import { describe, expect, it } from 'vitest';
import {
  formatAdminAbsoluteTime,
  formatAdminBlockerCount,
  formatAdminCancelledThisWeek,
  formatAdminOnSiteCount,
  formatAdminOverflow,
  formatAdminQueueDate,
  formatAdminReadiness,
  formatAdminRelativeTime,
  formatScheduleAgendaDayLabel,
  formatScheduleDepartureCount,
  formatScheduleMonthTitle,
  formatScheduleOverflowDepartures,
  formatScheduleSeatsTotal,
  formatScheduleWeekdayDate,
} from './formatAdminCopy';
import { ADMIN_UI } from './constants/ui';

describe('formatAdminCopy', () => {
  it('собирает readiness и русские формы блокеров', () => {
    expect(formatAdminReadiness(4, 5)).toBe(`4/5 ${ADMIN_UI.readinessReady}`);
    expect(formatAdminBlockerCount(1)).toBe(ADMIN_UI.blockersOne);
    expect(formatAdminBlockerCount(2)).toBe(`2 ${ADMIN_UI.blockersFew}`);
    expect(formatAdminBlockerCount(5)).toBe(`5 ${ADMIN_UI.blockersMany}`);
    expect(formatAdminBlockerCount(22)).toBe(`22 ${ADMIN_UI.blockersFew}`);
    expect(formatAdminOverflow(3)).toBe(`+3 ${ADMIN_UI.scheduleOverflow}`);
    expect(formatAdminCancelledThisWeek(1)).toBe(ADMIN_UI.cancelledThisWeekOne);
    expect(formatAdminCancelledThisWeek(3)).toBe(`3 ${ADMIN_UI.cancelledThisWeekMany}`);
    expect(formatAdminOnSiteCount(2, 4)).toBe(`2 ${ADMIN_UI.onSiteCountOutOf} 4 ${ADMIN_UI.onSiteCountSuffix}`);
    expect(formatAdminQueueDate('2026-08-20')).toBe('20 августа 2026 г.');
    expect(formatAdminRelativeTime('2026-08-19T10:00:00.000Z', new Date('2026-08-19T10:00:20.000Z'))).toBe(
      ADMIN_UI.relativeJustNow,
    );
    expect(formatAdminRelativeTime('2026-08-19T10:00:00.000Z', new Date('2026-08-19T10:12:00.000Z'))).toBe(
      `12 ${ADMIN_UI.relativeMinutesAgo}`,
    );
    expect(formatAdminAbsoluteTime('2026-08-19T05:42:00.000Z')).toMatch(/2026/);
    expect(formatScheduleOverflowDepartures(2)).toBe('+2 выезда');
    expect(formatScheduleOverflowDepartures(9)).toBe('+9 выездов');
    expect(formatScheduleDepartureCount(3)).toBe('3 выезда');
    expect(formatScheduleMonthTitle('2026-08-01')).toMatch(/август 2026/i);
    expect(formatScheduleAgendaDayLabel('2026-08-18')).toMatch(/18/);
    expect(formatScheduleAgendaDayLabel('2026-08-18')).toContain(ADMIN_UI.scheduleWeekdays[1]);
    expect(formatScheduleWeekdayDate('2026-08-18')).toMatch(/18/);
    expect(formatScheduleSeatsTotal(16)).toBe(`16 ${ADMIN_UI.scheduleSeatsTotal}`);
  });
});
