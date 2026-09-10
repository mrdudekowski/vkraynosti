import type { ReactNode } from 'react';

export type AdminBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'draft';

type AdminBadgeProps = {
  tone?: AdminBadgeTone;
  children: ReactNode;
};

const TONE_CLASS: Record<AdminBadgeTone, string> = {
  neutral: 'admin-badge-neutral',
  success: 'admin-badge-success',
  warning: 'admin-badge-warning',
  danger: 'admin-badge-danger',
  info: 'admin-badge-info',
  draft: 'admin-badge-draft',
};

const AdminBadge = ({ tone = 'neutral', children }: AdminBadgeProps) => (
  <span className={TONE_CLASS[tone]}>{children}</span>
);

export default AdminBadge;
