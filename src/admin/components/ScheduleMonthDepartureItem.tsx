import type { AdminDeparture } from '../api';
import { ADMIN_UI } from '../constants/ui';
import DepartureStatus from './DepartureStatus';
import TourCoverImage from './TourCoverImage';

type ScheduleMonthDepartureItemProps = {
  departure: AdminDeparture;
  title: string;
  imageUrl: string | null | undefined;
  selected?: boolean;
  onOpen: () => void;
};

const ScheduleMonthDepartureItem = ({
  departure,
  title,
  imageUrl,
  selected = false,
  onOpen,
}: ScheduleMonthDepartureItemProps) => {
  const cancelled = departure.status === 'cancelled';

  return (
    <button
      type="button"
      className={`admin-schedule-departure-item ${selected ? 'admin-schedule-departure-item-selected' : ''} ${
        cancelled ? 'admin-schedule-departure-item-cancelled' : ''
      }`}
      aria-label={`${title}. ${ADMIN_UI.departureStatus[departure.status]}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <TourCoverImage
        src={imageUrl}
        alt=""
        className={`admin-schedule-departure-thumb ${cancelled ? 'opacity-60' : ''}`}
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-tooltip font-medium text-text-primary">{title}</span>
        <span className="mt-0.5 flex flex-col gap-0.5">
          <DepartureStatus status={departure.status} compact />
        </span>
      </span>
    </button>
  );
};

export default ScheduleMonthDepartureItem;
