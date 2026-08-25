import type { AdminDepartureStatus } from '../api';
import { ADMIN_UI } from '../constants/ui';
import { departureStatusPresentation } from '../departureStatusPresentation';
import AdminIcon from './AdminIcon';

type DepartureStatusProps = {
  status: AdminDepartureStatus;
  compact?: boolean;
  showLabel?: boolean;
};

const TONE_CLASS: Record<
  ReturnType<typeof departureStatusPresentation>['tone'],
  string
> = {
  success: 'text-difficulty-easy-fg',
  info: 'text-admin-info-fg',
  warning: 'text-difficulty-medium-fg',
  danger: 'text-difficulty-hard-fg',
  muted: 'text-text-muted',
};

const DOT_CLASS: Record<
  ReturnType<typeof departureStatusPresentation>['tone'],
  string
> = {
  success: 'bg-difficulty-easy-fg',
  info: 'bg-admin-info-fg',
  warning: 'bg-difficulty-medium-fg',
  danger: 'bg-difficulty-hard-fg',
  muted: 'bg-text-muted',
};

const DepartureStatus = ({ status, compact = false, showLabel = true }: DepartureStatusProps) => {
  const presentation = departureStatusPresentation(status);
  const label = ADMIN_UI.departureStatus[status];
  const textClass = compact ? 'text-tooltip' : 'text-sm';

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1.5 font-normal ${textClass} ${TONE_CLASS[presentation.tone]}`}
    >
      {presentation.useDot ? (
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[presentation.tone]}`}
          aria-hidden="true"
        />
      ) : presentation.icon != null ? (
        <AdminIcon icon={presentation.icon} size={16} className="shrink-0" aria-hidden="true" />
      ) : null}
      {showLabel ? <span className="truncate">{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
};

export default DepartureStatus;
