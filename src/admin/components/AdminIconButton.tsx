import type { LucideIcon } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import AdminIcon from './AdminIcon';

type AdminIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
};

const AdminIconButton = forwardRef<HTMLButtonElement, AdminIconButtonProps>(
  ({ icon, label, danger = false, className = '', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`${danger ? 'admin-icon-btn-danger' : 'admin-icon-btn'} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...props}
    >
      <AdminIcon icon={icon} size={16} />
    </button>
  ),
);

AdminIconButton.displayName = 'AdminIconButton';

export default AdminIconButton;
