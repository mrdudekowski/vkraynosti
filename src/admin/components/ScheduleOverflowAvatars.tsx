import type { AdminDeparture } from '../api';
import { ADMIN_UI } from '../constants/ui';
import { formatAdminOverflow } from '../formatAdminCopy';
import { SCHEDULE_OVERFLOW_AVATAR_LIMIT } from '../scheduleDayDepartures';
import TourCoverImage from './TourCoverImage';

type ScheduleOverflowAvatarsProps = {
  overflow: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  onOpen: () => void;
};

const ScheduleOverflowAvatars = ({
  overflow,
  tourTitles,
  tourImageUrls,
  onOpen,
}: ScheduleOverflowAvatarsProps) => {
  if (overflow.length === 0) {
    return null;
  }
  const shown = overflow.slice(0, SCHEDULE_OVERFLOW_AVATAR_LIMIT);
  const remainingLabel = formatAdminOverflow(overflow.length);

  return (
    <button
      type="button"
      className="flex min-h-7 items-center pl-1 text-left"
      aria-label={`${ADMIN_UI.scheduleChipListTitle}. ${remainingLabel}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <span className="flex items-center">
        {shown.map((departure, index) => {
          const title = tourTitles[departure.tourId] ?? departure.tourId;
          return (
            <span
              key={departure.id}
              className={`relative inline-flex h-7 w-7 overflow-hidden rounded-full ring-2 ring-surface-light ${
                index === 0 ? '' : '-ml-2'
              }`}
            >
              <TourCoverImage src={tourImageUrls[departure.tourId]} alt={title} className="h-7 w-7" />
            </span>
          );
        })}
      </span>
      <span className="ml-1 text-tooltip text-text-muted">{remainingLabel}</span>
    </button>
  );
};

export default ScheduleOverflowAvatars;
