import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { adminLogout, adminMe, type AdminSession } from './api';
import AdminChrome from './components/AdminChrome';
import { ADMIN_UI } from './constants/ui';
import IndividualToursPage from './IndividualToursPage';
import LeadsPage from './LeadsPage';
import LoginPage from './LoginPage';
import SeasonToursPage from './SeasonToursPage';
import TourEditorPage from './TourEditorPage';
import ToursPage from './ToursPage';
import UsersPage from './UsersPage';

type AdminShellProps = {
  session: AdminSession;
  onLogout: () => void;
};

const AdminShell = ({ session, onLogout }: AdminShellProps) => (
  <div className="flex min-h-screen flex-col bg-surface-dark">
    <AdminChrome session={session} onLogout={onLogout} />
    <main className="min-w-0 flex-1 bg-surface-light">
      <Outlet context={{ session }} />
    </main>
  </div>
);

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
      <Routes>
        <Route
          path="/login"
          element={
            session ? <Navigate to="/" replace /> : <LoginPage onLoggedIn={setSession} />
          }
        />
        <Route
          element={
            session ? (
              <AdminShell
                session={session}
                onLogout={() => {
                  setSession(null);
                  void adminLogout();
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<ToursPage />} />
          <Route path="/seasons/:season" element={<SeasonToursPage />} />
          <Route path="/individual" element={<IndividualToursPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:personId" element={<LeadsPage />} />
          <Route path="/tours/:tourId" element={<TourEditorPage />} />
          <Route
            path="/users"
            element={
              session != null && session.role === 'admin' ? (
                <UsersPage session={session} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AdminApp;
