import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminIcon from './AdminIcon';

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

const AdminEmptyState = ({ title, description, icon, action }: AdminEmptyStateProps) => (
  <div className="rounded-admin-control border border-dashed border-divider px-3 py-4">
    <div className="flex items-start gap-2">
      {icon != null ? (
        <span className="mt-0.5 text-text-muted">
          <AdminIcon icon={icon} size={20} />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description != null ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
        {action != null ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  </div>
);

export default AdminEmptyState;
