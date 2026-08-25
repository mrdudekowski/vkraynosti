import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { adminLogout, adminMe, type AdminSession } from './api';
import { clearAdminDataCache } from './adminDataCache';
import AdminChrome from './components/AdminChrome';
import AdminPermissionState from './components/AdminPermissionState';
import { AdminToastProvider } from './components/AdminToast';
import { ADMIN_PATHS, isAdminSeasonParam } from './constants/routes';
import { ADMIN_UI } from './constants/ui';

const DashboardPage = lazy(() => import('./DashboardPage'));
const InboxPage = lazy(() => import('./InboxPage'));
const IndividualToursPage = lazy(() => import('./IndividualToursPage'));
const LeadsPage = lazy(() => import('./LeadsPage'));
const LoginPage = lazy(() => import('./LoginPage'));
const SchedulePage = lazy(() => import('./SchedulePage'));
const SeasonToursPage = lazy(() => import('./SeasonToursPage'));
const TourEditorPage = lazy(() => import('./TourEditorPage'));
const ToursPage = lazy(() => import('./ToursPage'));
const UsersPage = lazy(() => import('./UsersPage'));

type AdminShellProps = {
  session: AdminSession;
  onLogout: () => void;
};

const AdminShell = ({ session, onLogout }: AdminShellProps) => (
  <AdminChrome session={session} onLogout={onLogout}>
    <Suspense
      fallback={
        <p className="p-6 text-text-muted" role="status">
          {ADMIN_UI.loading}
        </p>
      }
    >
      <Outlet context={{ session }} />
    </Suspense>
  </AdminChrome>
);

const TourOrSeasonRoute = () => {
  const { tourId } = useParams<{ tourId: string }>();
  if (isAdminSeasonParam(tourId)) {
    return <SeasonToursPage />;
  }
  return <TourEditorPage />;
};

const LegacySeasonRedirect = () => {
  const { season } = useParams<{ season: string }>();
  if (!isAdminSeasonParam(season)) {
    return <Navigate to={ADMIN_PATHS.tours} replace />;
  }
  return <Navigate to={ADMIN_PATHS.season(season)} replace />;
};

const AdminApp = () => {
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);

  useEffect(() => {
    document.title = ADMIN_UI.documentTitle;
    void adminMe()
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  if (session === undefined) {
    return (
      <p className="p-6 text-text-muted" role="status">
        {ADMIN_UI.loading}
      </p>
    );
  }

  return (
    <HashRouter>
      <AdminToastProvider>
      <Routes>
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/" replace />
            ) : (
              <Suspense fallback={null}>
                <LoginPage onLoggedIn={setSession} />
              </Suspense>
            )
          }
        />
        <Route
          element={
            session ? (
              <AdminShell
                session={session}
                onLogout={() => {
                  clearAdminDataCache();
                  setSession(null);
                  void adminLogout();
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:tourId" element={<TourOrSeasonRoute />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/seasons/:season" element={<LegacySeasonRedirect />} />
          <Route path="/individual" element={<IndividualToursPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:personId" element={<LeadsPage />} />
          <Route
            path="/users"
            element={
              session != null && session.role === 'admin' ? (
                <UsersPage session={session} />
              ) : (
                <AdminPermissionState
                  title={ADMIN_UI.permissionDeniedTitle}
                  description={ADMIN_UI.usersPermissionDenied}
                  returnTo={ADMIN_PATHS.dashboard}
                  returnLabel={ADMIN_UI.returnToDashboard}
                />
              )
            }
          />
        </Route>
      </Routes>
      </AdminToastProvider>
    </HashRouter>
  );
};

export default AdminApp;
