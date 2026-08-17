import { NavLink, useLocation } from 'react-router-dom';
import type { AdminSession } from '../api';
import { isAdminToursSection } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';

type AdminChromeProps = {
  session: AdminSession;
  onLogout: () => void;
};

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-admin-control px-3 py-2 text-sm no-underline ${
    isActive ? 'admin-nav-active' : 'admin-nav-item'
  }`;

const AdminChrome = ({ session, onLogout }: AdminChromeProps) => {
  const { pathname } = useLocation();
  const toursClass = () =>
    navClass({ isActive: isAdminToursSection(pathname) });

  return (
  <header className="sticky top-0 z-navbar flex h-navbar shrink-0 items-center justify-between gap-4 border-b border-divider bg-surface-light px-4">
    <div className="flex min-w-0 items-center gap-2">
      <p className="hidden font-semibold text-text-primary sm:block">{ADMIN_UI.documentTitle}</p>
      <nav aria-label={ADMIN_UI.documentTitle} className="flex items-center gap-1">
        <NavLink to="/" className={toursClass}>
          {ADMIN_UI.toursNav}
        </NavLink>
        <NavLink to="/leads" className={navClass}>
          {ADMIN_UI.crmNav}
        </NavLink>
        {session.role === 'admin' ? (
          <NavLink to="/users" className={navClass}>
            {ADMIN_UI.usersNav}
          </NavLink>
        ) : null}
      </nav>
    </div>
    <div className="flex shrink-0 items-center gap-3">
      <p className="text-tooltip text-text-muted">{session.login}</p>
      <AdminButton type="button" variant="ghost" onClick={onLogout}>
        {ADMIN_UI.logout}
      </AdminButton>
    </div>
  </header>
  );
};

export default AdminChrome;
