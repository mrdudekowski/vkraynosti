import { Bell, Search } from 'lucide-react';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';

const ScheduleReferenceTopBar = () => (
  <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-divider pb-3 sm:pr-56">
    <label className="relative min-w-0 flex-1 sm:max-w-sm">
      <AdminIcon
        icon={Search}
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        aria-label={ADMIN_UI.scheduleSearchLabel}
        aria-describedby="schedule-search-placeholder"
        disabled
        placeholder={ADMIN_UI.scheduleSearchLabel}
        className="admin-input min-h-10 w-full pl-9"
      />
      <span id="schedule-search-placeholder" className="sr-only">
        {ADMIN_UI.schedulePlaceholderUnavailable}
      </span>
    </label>
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled
        aria-label={ADMIN_UI.scheduleNotifications}
        title={ADMIN_UI.schedulePlaceholderUnavailable}
        className="admin-btn-ghost min-h-10 min-w-10 px-0"
      >
        <AdminIcon icon={Bell} size={16} />
      </button>
    </div>
  </div>
);

export default ScheduleReferenceTopBar;
