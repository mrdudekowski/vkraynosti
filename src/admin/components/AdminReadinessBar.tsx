import { ADMIN_UI } from '../constants/ui';
import { formatAdminReadiness } from '../formatAdminCopy';

type AdminReadinessBarProps = {
  ready: number;
  total: number;
  compact?: boolean;
};

const AdminReadinessBar = ({ ready, total, compact = false }: AdminReadinessBarProps) => {
  const percent = total === 0 ? 0 : Math.round((ready / total) * 100);
  const label = formatAdminReadiness(ready, total);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <p className={compact ? 'text-tooltip text-text-muted' : 'text-sm text-text-muted'}>{label}</p>
        <p className="text-tooltip text-text-muted">{`${percent}%`}</p>
      </div>
      <div
        className={compact ? 'admin-readiness-track h-1' : 'admin-readiness-track'}
        role="progressbar"
        aria-label={ADMIN_UI.editorReadinessCard}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="admin-readiness-fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
    </div>
  );
};

export default AdminReadinessBar;
