import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DayPicker, type CustomComponents, type DayButtonProps } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { buildHomeSectionPath } from '../../constants/routes';
import { UI } from '../../constants/ui';
import { useTourSchedule } from '../../hooks/useTourSchedule';
import type { Season } from '../../types';
import { getTourDepartureDates } from '../../utils/tourSchedule/getTourDepartureDates';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourCalendarDayButton from './TourCalendarDayButton';
import TourCalendarMiniWeekStrip, { buildWeekDates } from './TourCalendarMiniWeekStrip';
import {
  tourCalendarMiniClassNames,
  tourCalendarModifierClassNames,
} from './tourCalendarClassNames';

interface TourCalendarMiniProps {
  tourId: string;
  season: Season;
}

const farPast = new Date(1900, 0, 1);
const farFuture = new Date(2100, 11, 31);

const TourCalendarMini = ({ tourId, season }: TourCalendarMiniProps) => {
  const { status, events, eventsByDate } = useTourSchedule();

  const tourEvents = useMemo(
    () => events.filter(event => event.tourId === tourId),
    [events, tourId]
  );

  const departureInfo = useMemo(
    () => getTourDepartureDates(tourId, tourEvents),
    [tourId, tourEvents]
  );

  const departureDates = useMemo(() => new Set(departureInfo.dates), [departureInfo.dates]);

  const miniEventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const iso of departureInfo.dates) {
      const dayEvents = eventsByDate.get(iso)?.filter(event => event.tourId === tourId) ?? [];
      if (dayEvents.length > 0) {
        map.set(iso, dayEvents);
      }
    }
    return map;
  }, [departureInfo.dates, eventsByDate, tourId]);

  const weekAnchorIso = departureInfo.nearestFuture ?? departureInfo.dates[0] ?? null;
  const weekDates = weekAnchorIso ? buildWeekDates(weekAnchorIso) : [];

  const nearestEvent = useMemo(() => {
    if (!departureInfo.nearestFuture) return null;
    return tourEvents.find(event => event.date === departureInfo.nearestFuture) ?? null;
  }, [departureInfo.nearestFuture, tourEvents]);

  const components = useMemo((): Partial<CustomComponents> => ({
    DayButton: (props: DayButtonProps) => (
      <TourCalendarDayButton {...props} eventsByDate={miniEventsByDate} readOnly />
    ),
    Nav: () => <></>,
    MonthCaption: () => <></>,
    Chevron: () => <></>,
  }), [miniEventsByDate]);

  const modifiers = useMemo(
    () => ({
      tourDeparture: (date: Date) => departureDates.has(toIsoDate(date)),
      nearest: (date: Date) =>
        departureInfo.nearestFuture != null && toIsoDate(date) === departureInfo.nearestFuture,
    }),
    [departureDates, departureInfo.nearestFuture]
  );

  const scheduleLink = buildHomeSectionPath(UI.sections.homeTourCalendarSectionElementId);

  if (status === 'loading' || status === 'idle') {
    return (
      <div
        className="rounded-card border border-divider bg-surface-light/90 p-4"
        aria-busy="true"
        aria-label={UI.tourCalendar.loadingAria}
      >
        <div className="h-24 animate-pulse rounded bg-surface-dark/10" />
      </div>
    );
  }

  if (departureInfo.dates.length === 0) {
    return (
      <div className="rounded-card border border-divider bg-surface-light/90 p-4">
        <h3 className="font-heading text-lg text-text-primary">{UI.tourCalendarMini.title}</h3>
        <p className="mt-2 text-sm text-text-muted">{UI.tourCalendarMini.empty}</p>
        <Link to={scheduleLink} className="btn-ghost mt-3 inline-flex" prefetch="intent">
          {UI.tourCalendarMini.allScheduleLink}
        </Link>
      </div>
    );
  }

  const monthLabel = format(departureInfo.focusMonth, 'LLLL yyyy', { locale: ru });
  const extraDatesCount = Math.max(0, departureInfo.dates.length - 1);

  return (
    <section
      className="rounded-card border border-divider bg-surface-light/90 p-4 shadow-sm"
      aria-readonly="true"
    >
      <h3 className="font-heading text-lg text-text-primary">{UI.tourCalendarMini.title}</h3>
      <p className="mt-1 capitalize text-sm text-text-muted">{monthLabel}</p>

      {weekDates.length > 0 && (
        <div className="mt-4">
          <TourCalendarMiniWeekStrip
            weekDates={weekDates}
            focusMonth={departureInfo.focusMonth}
            departureDates={departureDates}
            nearestIso={departureInfo.nearestFuture}
            season={season}
          />
        </div>
      )}

      <DayPicker
        mode="single"
        month={departureInfo.focusMonth}
        onMonthChange={undefined}
        selected={
          departureInfo.nearestFuture ? parseIsoDate(departureInfo.nearestFuture) : undefined
        }
        onSelect={() => undefined}
        locale={ru}
        weekStartsOn={1}
        showOutsideDays
        disabled={{ before: farPast, after: farFuture }}
        modifiers={modifiers}
        modifiersClassNames={{
          tourDeparture: tourCalendarModifierClassNames.tourDeparture,
          nearest: `${tourCalendarModifierClassNames.nearest} ring-brand-primary`,
        }}
        classNames={tourCalendarMiniClassNames}
        components={components}
      />

      <div className="mt-3 space-y-1 text-sm">
        {nearestEvent && departureInfo.nearestFuture && (
          <p className="text-text-primary">
            {UI.tourCalendarMini.nearestLabel(
              format(parseIsoDate(departureInfo.nearestFuture), 'EEEE, d MMMM', {
                locale: ru,
              }),
              nearestEvent.statusLabel
            )}
          </p>
        )}
        {departureInfo.isArchive && (
          <p className="text-text-muted">{UI.tourCalendarMini.archiveHint}</p>
        )}
        {extraDatesCount > 0 && (
          <p className="text-text-muted">{UI.tourCalendarMini.moreDates(extraDatesCount)}</p>
        )}
      </div>

      <Link to={scheduleLink} className="btn-ghost mt-4 inline-flex" prefetch="intent">
        {UI.tourCalendarMini.allScheduleLink}
      </Link>
    </section>
  );
};

export default TourCalendarMini;
