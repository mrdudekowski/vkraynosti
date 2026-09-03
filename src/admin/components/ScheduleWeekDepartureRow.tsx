import type { DragEvent } from 'react';
import type { AdminDeparture, AdminTourListItem } from '../api';
import { guestWillSeeDeparture } from '../adminDepartureGuestVisibility';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import { ADMIN_UI } from '../constants/ui';
import DepartureStatus from './DepartureStatus';
import DepartureStatusMenu from './DepartureStatusMenu';
import TourCoverImage from './TourCoverImage';

type ScheduleWeekDepartureRowProps = {
  departure: AdminDeparture;
  title: string;
  imageUrl: string | null | undefined;
  tour?: AdminTourListItem;
  selected?: boolean;
  variant: 'row' | 'compact' | 'detail';
  seatsLabel?: string;
  onOpen: () => void;
  onStatusChange?: (status: DepartureQuickStatus) => void;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  dragEnabled?: boolean;
};

const THUMB: Record<ScheduleWeekDepartureRowProps['variant'], string> = {
  row: 'h-10 w-14 shrink-0 rounded-admin-control',
  compact: 'h-8 w-10 shrink-0 rounded-admin-control',
  detail: 'h-20 w-28 shrink-0 rounded-admin-control',
};

const ScheduleWeekDepartureRow = ({
  departure,
  title,
  imageUrl,
  tour,
  selected = false,
  variant,
  seatsLabel,
  onOpen,
  onStatusChange,
  onDragStart,
  dragEnabled = true,
}: ScheduleWeekDepartureRowProps) => {
  const cancelled = departure.status === 'cancelled';
  const showGuestException =
    tour != null &&
    !guestWillSeeDeparture({
      tour,
      status: departure.status,
    });
  const selectedClass = selected ? 'admin-schedule-week-row-selected' : '';
  const cancelledClass = cancelled ? 'opacity-70' : '';

  return (
    <div
      className={`admin-schedule-week-row admin-schedule-week-row-${variant} ${selectedClass} ${cancelledClass}`}
      draggable={dragEnabled && onDragStart != null && departure.status !== 'completed' ? true : undefined}
      onDragStart={dragEnabled ? onDragStart : undefined}
    >
      <button
        type="button"
        className="admin-schedule-week-row-open"
        aria-label={
          showGuestException ? `${title}. ${ADMIN_UI.scheduleHiddenFromGuest}` : title
        }
        onClick={onOpen}
      >
        <TourCoverImage src={imageUrl} alt="" className={THUMB[variant]} />
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium text-text-primary" title={title}>
            {title}
          </span>
          {showGuestException ? (
            <span className="mt-0.5 block text-tooltip text-admin-info-fg" aria-hidden="true">
              {ADMIN_UI.scheduleHiddenFromGuest}
            </span>
          ) : null}
          {variant === 'detail' && seatsLabel != null ? (
            <span className="mt-0.5 block text-tooltip text-text-muted">{seatsLabel}</span>
          ) : null}
        </span>
      </button>
      <div className="shrink-0">
        {variant === 'compact' ? (
          <DepartureStatus status={departure.status} compact showLabel={false} />
        ) : (
          <DepartureStatusMenu departure={departure} onChange={onStatusChange} />
        )}
      </div>
    </div>
  );
};

export default ScheduleWeekDepartureRow;
