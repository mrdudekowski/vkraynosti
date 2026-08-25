import { CalendarDays, CircleAlert, Send } from 'lucide-react';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';

type InboxSummaryCardsProps = {
  tours: number;
  departures: number;
  blockers: number;
  onShowTours: () => void;
  onShowDepartures: () => void;
  onShowBlockers: () => void;
};

const InboxSummaryCards = ({
  tours,
  departures,
  blockers,
  onShowTours,
  onShowDepartures,
  onShowBlockers,
}: InboxSummaryCardsProps) => (
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label={ADMIN_UI.inboxStats}>
    <button type="button" className="admin-editor-surface flex items-center gap-3 text-left" onClick={onShowTours}>
      <span className="admin-editor-icon-well">
        <AdminIcon icon={Send} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-text-primary">{tours}</span>
        <span className="text-sm text-text-muted">{ADMIN_UI.inboxStatTours}</span>
      </span>
    </button>
    <button
      type="button"
      className="admin-editor-surface flex items-center gap-3 text-left"
      onClick={onShowDepartures}
    >
      <span className="admin-editor-icon-well">
        <AdminIcon icon={CalendarDays} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-text-primary">{departures}</span>
        <span className="text-sm text-text-muted">{ADMIN_UI.inboxStatDepartures}</span>
      </span>
    </button>
    <button
      type="button"
      className="admin-editor-surface flex items-center gap-3 text-left"
      onClick={onShowBlockers}
    >
      <span className="admin-editor-icon-well text-difficulty-hard-fg">
        <AdminIcon icon={CircleAlert} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-text-primary">{blockers}</span>
        <span className="text-sm text-text-muted">{ADMIN_UI.inboxStatBlockers}</span>
      </span>
    </button>
  </section>
);

export default InboxSummaryCards;
