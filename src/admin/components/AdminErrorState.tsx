import { CircleAlert } from 'lucide-react';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminIcon from './AdminIcon';

type AdminErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

const AdminErrorState = ({
  title = ADMIN_UI.pageLoadError,
  description,
  onRetry,
}: AdminErrorStateProps) => (
  <div className="rounded-admin-control border border-difficulty-hard-fg/30 bg-difficulty-hard-bg px-3 py-4" role="alert">
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-difficulty-hard-fg">
        <AdminIcon icon={CircleAlert} size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-difficulty-hard-fg">{title}</p>
        {description != null ? (
          <p className="mt-1 text-sm text-difficulty-hard-fg/80">{description}</p>
        ) : null}
        {onRetry != null ? (
          <div className="mt-3">
            <AdminButton type="button" variant="secondary" onClick={onRetry}>
              {ADMIN_UI.retry}
            </AdminButton>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

export default AdminErrorState;
