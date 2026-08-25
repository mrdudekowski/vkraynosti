import { Link } from 'react-router-dom';
import { CircleAlert, CircleCheckBig, Clock3 } from 'lucide-react';
import AdminIcon from './AdminIcon';
import { ADMIN_UI } from '../constants/ui';
import TourCoverImage from './TourCoverImage';

export type DashboardAttentionItem = {
  id: string;
  title: string;
  issue: string;
  severity: 'critical' | 'prepublication' | 'later';
  to: string;
  imageUrl?: string | null;
};

type AdminDashboardAttentionListProps = {
  items: readonly DashboardAttentionItem[];
};

const AdminDashboardAttentionList = ({ items }: AdminDashboardAttentionListProps) => (
  <ul className="flex flex-col gap-1">
    {items.map((item) => {
      const icon =
        item.severity === 'critical'
          ? CircleAlert
          : item.severity === 'prepublication'
            ? CircleCheckBig
            : Clock3;

      return (
      <li key={item.id}>
        <Link
          to={item.to}
          className="admin-nav-item flex min-h-14 gap-3 rounded-admin-control px-3 py-3 no-underline"
          aria-label={`${item.title}. ${ADMIN_UI.dashboardSeverity[item.severity]}. ${item.issue}`}
        >
          <TourCoverImage
            src={item.imageUrl}
            alt={item.title}
            className="h-10 w-14 shrink-0 rounded-admin-control"
          />
          <AdminIcon icon={icon} size={16} className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2">
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <span className="text-xs text-text-muted">
                {ADMIN_UI.dashboardSeverity[item.severity]}
              </span>
            </div>
            <p className="text-sm text-text-muted">{item.issue}</p>
          </div>
        </Link>
      </li>
      );
    })}
  </ul>
);

export default AdminDashboardAttentionList;
