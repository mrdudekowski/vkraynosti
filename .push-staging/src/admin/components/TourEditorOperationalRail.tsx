import { CircleAlert } from 'lucide-react';
import type { CmsPublishBlocker } from '../../cms/cmsPublishRules';
import { ADMIN_UI } from '../constants/ui';
import { formatAdminReadiness } from '../formatAdminCopy';
import type { AdminBadgeTone } from './AdminBadge';
import AdminIcon from './AdminIcon';
import AdminStatus from './AdminStatus';

type TourEditorOperationalRailProps = {
  readyCount: number;
  readyTotal: number;
  blockers: readonly CmsPublishBlocker[];
  publicationLabel: string;
  guestVisibilityLabel: string;
  guestVisibilityTone: AdminBadgeTone;
  onSelectBlocker: (blocker: CmsPublishBlocker) => void;
};

const TourEditorOperationalRail = ({
  readyCount,
  readyTotal,
  blockers,
  publicationLabel,
  guestVisibilityLabel,
  guestVisibilityTone,
  onSelectBlocker,
}: TourEditorOperationalRailProps) => {
  const percent = readyTotal === 0 ? 0 : Math.round((readyCount / readyTotal) * 100);
  const readinessLabel = formatAdminReadiness(readyCount, readyTotal);

  return (
    <aside className="flex min-w-0 flex-col gap-3">
      <section className="rounded-card border border-divider bg-surface-light p-3">
        <h2 className="text-sm font-semibold text-text-primary">{ADMIN_UI.editorRailReadiness}</h2>
        <p className="mt-2 text-sm text-text-primary">{readinessLabel}</p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-dark/10"
          role="progressbar"
          aria-label={ADMIN_UI.editorRailReadiness}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="h-full bg-brand-primary" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <section className="rounded-card border border-divider bg-surface-light p-3">
        <h2 className="text-sm font-semibold text-text-primary">{ADMIN_UI.showProblems}</h2>
        {blockers.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">{ADMIN_UI.editorNoBlockers}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {blockers.map((blocker) => (
              <li key={blocker}>
                <button
                  type="button"
                  className="admin-btn-ghost w-full justify-start text-left"
                  onClick={() => onSelectBlocker(blocker)}
                >
                  <AdminIcon icon={CircleAlert} size={16} />
                  {ADMIN_UI.publishBlockers[blocker]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-divider bg-surface-light p-3">
        <h2 className="text-sm font-semibold text-text-primary">{ADMIN_UI.editorRailPublication}</h2>
        <div className="mt-2 flex flex-col gap-2">
          <AdminStatus level="primary" tone={guestVisibilityTone}>
            {guestVisibilityLabel}
          </AdminStatus>
          <p className="text-sm text-text-muted">{publicationLabel}</p>
        </div>
      </section>
    </aside>
  );
};

export default TourEditorOperationalRail;
