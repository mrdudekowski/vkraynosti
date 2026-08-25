import { Link } from 'react-router-dom';
import AdminEmptyState from './AdminEmptyState';
import AdminPageFrame from './AdminPageFrame';

type AdminPermissionStateProps = {
  title: string;
  description: string;
  returnTo: string;
  returnLabel: string;
};

const AdminPermissionState = ({
  title,
  description,
  returnTo,
  returnLabel,
}: AdminPermissionStateProps) => (
  <AdminPageFrame>
    <AdminEmptyState
      title={title}
      description={description}
      action={
        <Link to={returnTo} className="admin-btn-secondary inline-flex no-underline">
          {returnLabel}
        </Link>
      }
    />
  </AdminPageFrame>
);

export default AdminPermissionState;
