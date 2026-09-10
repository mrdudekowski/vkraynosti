import { ADMIN_UI } from '../constants/ui';
import { DEPARTURE_STATUS_LEGEND } from '../departureStatusPresentation';
import DepartureStatus from './DepartureStatus';

const ScheduleCalendarLegend = () => (
  <div className="admin-schedule-legend" role="list" aria-label={ADMIN_UI.scheduleStatusLegend}>
    {DEPARTURE_STATUS_LEGEND.map((status) => (
      <span
        key={status}
        role="listitem"
        className="admin-schedule-legend-item"
        title={ADMIN_UI.departureStatus[status]}
      >
        <DepartureStatus status={status} compact />
      </span>
    ))}
  </div>
);

export default ScheduleCalendarLegend;
