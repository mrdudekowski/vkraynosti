import { ADMIN_UI } from '../constants/ui';

const DOT_CLASS = 'inline-block h-1.5 w-1.5 shrink-0 rounded-full';

type AdminOnSiteStatusProps = {
  visible: boolean;
  className?: string;
};

export const AdminOnSiteStatus = ({ visible, className = '' }: AdminOnSiteStatusProps) => (
  <span
    className={`inline-flex min-w-0 items-center gap-1.5 text-sm ${
      visible ? 'text-difficulty-easy-fg' : 'text-text-muted'
    } ${className}`.trim()}
  >
    <span
      className={`${DOT_CLASS} ${visible ? 'bg-difficulty-easy-fg' : 'bg-text-muted'}`}
      aria-hidden="true"
    />
    <span>{visible ? ADMIN_UI.onSiteCountSuffix : ADMIN_UI.tourVisibility.hidden}</span>
  </span>
);

type AdminOnSiteToggleProps = AdminOnSiteStatusProps & {
  label: string;
  onChange: (visible: boolean) => void;
};

export const AdminOnSiteToggle = ({
  visible,
  label,
  onChange,
  className = '',
}: AdminOnSiteToggleProps) => (
  <button
    type="button"
    aria-pressed={visible}
    aria-label={label}
    className={`inline-flex min-h-11 items-center rounded-admin-control px-2 hover:bg-surface-dark/5 ${className}`.trim()}
    onClick={() => onChange(!visible)}
  >
    <AdminOnSiteStatus visible={visible} />
  </button>
);
