import type { ReactNode } from 'react';

export type AdminAlertTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type AdminAlertProps = {
  tone?: AdminAlertTone;
  children: ReactNode;
};

const TONE_CLASS: Record<AdminAlertTone, string> = {
  neutral: 'admin-alert-neutral',
  success: 'admin-alert-success',
  warning: 'admin-alert-warning',
  danger: 'admin-alert-danger',
  info: 'admin-alert-info',
};

const AdminAlert = ({ tone = 'neutral', children }: AdminAlertProps) => (
  <p role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'} className={TONE_CLASS[tone]}>
    {children}
  </p>
);

export default AdminAlert;
