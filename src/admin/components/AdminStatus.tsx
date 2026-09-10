import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminBadge, { type AdminBadgeTone } from './AdminBadge';
import AdminIcon from './AdminIcon';

export type AdminStatusLevel = 'primary' | 'secondary' | 'attention';

type AdminStatusProps = {
  level?: AdminStatusLevel;
  tone?: AdminBadgeTone;
  icon?: LucideIcon;
  children: ReactNode;
};

const ATTENTION_TONE: Record<AdminBadgeTone, AdminBadgeTone> = {
  neutral: 'warning',
  success: 'warning',
  warning: 'warning',
  danger: 'danger',
  info: 'warning',
  draft: 'warning',
};

const AdminStatus = ({
  level = 'primary',
  tone = 'neutral',
  icon,
  children,
}: AdminStatusProps) => {
  if (level === 'secondary') {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-text-muted">
        {icon != null ? <AdminIcon icon={icon} size={16} /> : null}
        {children}
      </span>
    );
  }

  const chipTone = level === 'attention' ? ATTENTION_TONE[tone] : tone;
  return (
    <span className="inline-flex items-center gap-1">
      {icon != null ? <AdminIcon icon={icon} size={16} /> : null}
      <AdminBadge tone={chipTone}>{children}</AdminBadge>
    </span>
  );
};

export default AdminStatus;
