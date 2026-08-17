import { Link } from 'react-router-dom';
import AdminEmptyState from './components/AdminEmptyState';
import AdminPageHeader from './components/AdminPageHeader';
import { ADMIN_PATHS } from './constants/routes';
import { ADMIN_UI } from './constants/ui';

const IndividualToursPage = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
    <Link
      to={ADMIN_PATHS.tours}
      className="inline-flex min-h-11 w-fit items-center rounded-admin-control px-2 text-sm no-underline admin-nav-item"
    >
      {ADMIN_UI.backToTours}
    </Link>
    <AdminPageHeader
      title={ADMIN_UI.individualTitle}
      description={ADMIN_UI.individualDescription}
    />
    <AdminEmptyState
      title={ADMIN_UI.individualEmpty}
      description={ADMIN_UI.individualEmptyHint}
    />
  </div>
);

export default IndividualToursPage;
