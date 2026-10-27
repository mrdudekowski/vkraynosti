import { ADMIN_UI } from '../constants/ui';

const AdminStorageBanner = () => (
  <p className="border-b border-divider bg-surface-muted px-4 py-2 text-sm text-text-primary" role="status">
    {ADMIN_UI.storageBanner}
  </p>
);

export default AdminStorageBanner;
