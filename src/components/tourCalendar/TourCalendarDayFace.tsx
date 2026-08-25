import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import {
  TOUR_CALENDAR_DAY_NUMBER_CLASS,
  TOUR_CALENDAR_DAY_TILE_CLASS,
} from '../../constants/tourCalendarShared';
import TourCalendarDayEventDots from './TourCalendarDayEventDots';

interface TourCalendarDayFaceProps {
  dayOfMonth: number;
  events: readonly EnrichedScheduleEvent[];
}

/** Цифра в фиксированном tile; точки событий — отдельный слой под ним. */
const TourCalendarDayFace = ({ dayOfMonth, events }: TourCalendarDayFaceProps) => (
  <>
    <span className={TOUR_CALENDAR_DAY_TILE_CLASS}>
      <span className={TOUR_CALENDAR_DAY_NUMBER_CLASS}>{dayOfMonth}</span>
    </span>
    {events.length > 0 && <TourCalendarDayEventDots events={events} />}
  </>
);

export default TourCalendarDayFace;
