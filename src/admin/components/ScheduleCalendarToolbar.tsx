import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import type { ScheduleMode } from '../scheduleCalendar';
import type { ScheduleWeekLayout } from '../scheduleWeekLayout';
import { ADMIN_UI } from '../constants/ui';
import { formatScheduleMonthTitle } from '../formatAdminCopy';
import AdminButton from './AdminButton';
import AdminIcon from './AdminIcon';
import ScheduleCalendarLegend from './ScheduleCalendarLegend';
import ScheduleWeekLayoutSwitch from './ScheduleWeekLayoutSwitch';

const MODES: readonly ScheduleMode[] = ['month', 'week', 'day'];

type ScheduleCalendarToolbarProps = {
  mode: ScheduleMode;
  cursorIso: string;
  showMonthControls?: boolean;
  departureCount?: number;
  weekLayout?: ScheduleWeekLayout;
  onWeekLayoutChange?: (layout: ScheduleWeekLayout) => void;
  onModeChange: (mode: ScheduleMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

function modeLabel(mode: ScheduleMode): string {
  if (mode === 'day') {
    return ADMIN_UI.scheduleModeDay;
  }
  if (mode === 'week') {
    return ADMIN_UI.scheduleModeWeek;
  }
  return ADMIN_UI.scheduleModeMonth;
}

const ScheduleCalendarToolbar = ({
  mode,
  cursorIso,
  showMonthControls = false,
  departureCount = 0,
  weekLayout,
  onWeekLayoutChange,
  onModeChange,
  onPrevious,
  onNext,
  onToday,
}: ScheduleCalendarToolbarProps) => (
  <div className="admin-schedule-toolbar-wrap">
    <div className="admin-schedule-toolbar">
      <div className="flex min-w-0 flex-wrap items-center gap-1 sm:gap-2">
        <AdminButton
          type="button"
          variant="ghost"
          className="admin-schedule-nav-btn px-2"
          aria-label={ADMIN_UI.schedulePrev}
          onClick={onPrevious}
        >
          <AdminIcon icon={ChevronLeft} size={16} />
        </AdminButton>
        <p className="min-w-0 truncate px-1 text-base font-semibold text-text-primary sm:text-lg">
          {formatScheduleMonthTitle(cursorIso)}
        </p>
        <AdminButton
          type="button"
          variant="ghost"
          className="admin-schedule-nav-btn px-2"
          aria-label={ADMIN_UI.scheduleNext}
          onClick={onNext}
        >
          <AdminIcon icon={ChevronRight} size={16} />
        </AdminButton>
        <AdminButton type="button" variant="secondary" className="min-h-9 px-3" onClick={onToday}>
          {ADMIN_UI.scheduleToday}
        </AdminButton>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {mode === 'week' && weekLayout != null && onWeekLayoutChange != null ? (
          <ScheduleWeekLayoutSwitch layout={weekLayout} onChange={onWeekLayoutChange} />
        ) : null}
        <div className="admin-schedule-mode-switch" role="group" aria-label={ADMIN_UI.scheduleModes}>
        {MODES.map((item) => (
          <AdminButton
            key={item}
            type="button"
            variant={item === mode ? 'secondary' : 'ghost'}
            className="min-h-9 px-3"
            aria-pressed={item === mode}
            onClick={() => onModeChange(item)}
          >
            {modeLabel(item)}
          </AdminButton>
        ))}
        </div>
      </div>
    </div>
    {showMonthControls ? (
      <div className="admin-schedule-toolbar-meta">
        <ScheduleCalendarLegend />
        <div className="admin-schedule-toolbar-actions">
          <AdminButton type="button" variant="secondary" disabled aria-describedby="schedule-filter-hint">
            <AdminIcon icon={Filter} size={16} />
            {ADMIN_UI.scheduleFilter}
          </AdminButton>
          <AdminButton type="button" variant="ghost" disabled aria-describedby="schedule-goto-hint">
            {ADMIN_UI.scheduleGoToDay}
          </AdminButton>
          <p className="text-tooltip text-text-muted">
            {ADMIN_UI.scheduleShownDepartures}: {departureCount}
          </p>
          <span id="schedule-filter-hint" className="sr-only">
            {ADMIN_UI.schedulePlaceholderUnavailable}
          </span>
          <span id="schedule-goto-hint" className="sr-only">
            {ADMIN_UI.schedulePlaceholderUnavailable}
          </span>
        </div>
      </div>
    ) : null}
  </div>
);

export default ScheduleCalendarToolbar;
