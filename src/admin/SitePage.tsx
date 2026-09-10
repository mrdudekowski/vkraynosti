import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import { ADMIN_UI } from './constants/ui';

const SitePage = () => (
  <AdminPageFrame variant="wide">
    <AdminPageHeader title={ADMIN_UI.siteNav} description={ADMIN_UI.siteDescription} />
  </AdminPageFrame>
);

export default SitePage;
