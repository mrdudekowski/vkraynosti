import { ADMIN_UI } from '../constants/ui';
import { formatScheduleOverflowDepartures } from '../formatAdminCopy';

type ScheduleOverflowLinkProps = {
  overflowCount: number;
  onOpen: () => void;
};

const ScheduleOverflowLink = ({ overflowCount, onOpen }: ScheduleOverflowLinkProps) => {
  if (overflowCount <= 0) {
    return null;
  }
  const label = formatScheduleOverflowDepartures(overflowCount);

  return (
    <button
      type="button"
      className="admin-schedule-overflow-link"
      aria-label={`${ADMIN_UI.scheduleChipListTitle}. ${label}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      {label}
    </button>
  );
};

export default ScheduleOverflowLink;
