import type { Season } from '../../types';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { SEASON_ACCENT_HEX } from '../../constants/seasonAccentHex';

interface TourCalendarDayEventDotsProps {
  events: EnrichedScheduleEvent[];
}

const TourCalendarDayEventDots = ({ events }: TourCalendarDayEventDotsProps) => {
  const visible = events.slice(0, 3);
  const overflow = events.length - visible.length;

  return (
    <span className="mt-0.5 flex items-center justify-center gap-0.5" aria-hidden>
      {visible.map(event => (
        <span
          key={`${event.tourId}-${event.date}`}
          className="size-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: SEASON_ACCENT_HEX[event.season as Season],
            opacity: event.status === 'completed' ? 0.45 : 1,
          }}
        />
      ))}
      {overflow > 0 && (
        <span className="text-[10px] leading-none text-text-muted">+{overflow}</span>
      )}
    </span>
  );
};

export default TourCalendarDayEventDots;
